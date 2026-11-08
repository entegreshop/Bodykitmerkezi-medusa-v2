import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import * as crypto from "crypto"
import {
  EfaturaConfig,
  EfaturaInvoiceRecord,
  readEfaturaConfig,
  readEfaturaInvoices,
  saveEfaturaInvoice,
  writeEfaturaConfig,
} from "../efatura-settings/route"

function getGatewayBaseUrl(env: "stage" | "production"): string {
  return env === "stage"
    ? "https://stage-apigateway.trendyolefaturam.com"
    : "https://apigateway.trendyolecozum.com"
}

async function signInTrendyolEfatura(config: EfaturaConfig): Promise<{
  token: string
  companyId?: string
  userId?: string
  raw?: any
}> {
  const baseUrl = getGatewayBaseUrl(config.environment)
  const response = await fetch(`${baseUrl}/api/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: config.email.trim(),
      password: config.password,
    }),
  })

  const headerToken =
    response.headers.get("x-access-token") ||
    response.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    ""

  let bodyData: any = null
  try {
    bodyData = await response.json()
  } catch {
    bodyData = null
  }

  if (!response.ok) {
    const errMsg =
      bodyData?.message ||
      bodyData?.error ||
      bodyData?.detail ||
      `Trendyol E-Faturam giriş hatası (HTTP ${response.status})`
    throw new Error(errMsg)
  }

  const token =
    headerToken ||
    bodyData?.accessToken ||
    bodyData?.token ||
    bodyData?.jwt ||
    bodyData?.data?.accessToken ||
    bodyData?.data?.token ||
    ""

  if (!token) {
    throw new Error("Trendyol E-Faturam API yanıtında x-access-token bulunamadı.")
  }

  const companyId =
    config.companyId ||
    String(
      bodyData?.companyId ||
        bodyData?.user?.companyId ||
        bodyData?.data?.companyId ||
        bodyData?.companies?.[0]?.id ||
        ""
    )

  const userId = String(bodyData?.userId || bodyData?.id || bodyData?.user?.id || "")

  return { token, companyId, userId, raw: bodyData }
}

function generateSequentialInvoiceNumber(
  prefix: string,
  existingInvoices: EfaturaInvoiceRecord[]
): string {
  const cleanPrefix = (prefix || "BKM")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 3)
    .padEnd(3, "A")
  const year = new Date().getFullYear().toString()
  const prefixWithYear = `${cleanPrefix}${year}`

  let maxSeq = 0
  for (const inv of existingInvoices) {
    if (inv.invoiceNumber && inv.invoiceNumber.startsWith(prefixWithYear)) {
      const seqPart = parseInt(inv.invoiceNumber.slice(prefixWithYear.length), 10)
      if (!isNaN(seqPart) && seqPart > maxSeq) {
        maxSeq = seqPart
      }
    }
  }

  const nextSeq = (maxSeq + 1).toString().padStart(9, "0")
  return `${prefixWithYear}${nextSeq}`
}

function buildTrendyolInvoicePayload(
  record: EfaturaInvoiceRecord,
  config: EfaturaConfig
) {
  const toKurus = (tl: number) => Math.round((Number(tl) || 0) * 100)

  const invoiceLines = record.items.map((item, idx) => {
    const lineNetTotal = item.netUnitPrice * item.quantity
    const lineVatTotal = item.vatAmount
    const lineGrossTotal = item.totalAmount

    return {
      lineId: String(idx + 1),
      itemName: item.title,
      sellerItemCode: item.sku || `SKU-${idx + 1}`,
      quantity: item.quantity,
      unitCode: "C62", // Adet (NIU / C62 UBL standardı)
      unitPriceAmount: toKurus(item.netUnitPrice),
      lineExtensionAmount: toKurus(lineNetTotal),
      allowanceChargeAmount: 0,
      taxTotal: {
        taxAmount: toKurus(lineVatTotal),
        taxSubtotals: [
          {
            taxableAmount: toKurus(lineNetTotal),
            taxAmount: toKurus(lineVatTotal),
            percent: item.vatRate,
            taxTypeCode: "0015", // KDV
            taxName: "KDV",
          },
        ],
      },
      grossAmount: toKurus(lineGrossTotal),
    }
  })

  const netSubtotal = record.subtotalAmount - record.vatAmount

  return {
    companyId: config.companyId ? Number(config.companyId) || config.companyId : undefined,
    uuid: record.uuid,
    invoiceId: record.invoiceNumber,
    prefix: record.documentType === "EFATURA" ? config.einvoicePrefix : config.earchivePrefix,
    autoGenerateInvoiceId: true,
    profileId: record.invoiceScenario, // EARSIVFATURA | TEMELFATURA | TICARIFATURA
    invoiceTypeCode: record.invoiceType, // SATIS
    issueDate: record.issueDate,
    documentCurrencyCode: record.currencyCode || "TRY",
    supplierAssignedAccountId: config.supplierVkn,
    accountingSupplierParty: {
      vknTckn: config.supplierVkn,
      partyName: config.supplierName,
      taxSchemeName: config.supplierTaxOffice,
      streetName: config.supplierAddress,
      citySubdivisionName: config.supplierDistrict,
      cityName: config.supplierCity,
      countryName: "Türkiye",
      telephone: config.supplierPhone,
      electronicMail: config.supplierEmail,
      mersisNo: config.supplierMersis,
      ticaretSicilNo: config.supplierTicaretSicil,
    },
    accountingCustomerParty: {
      vknTckn: record.buyerIdentifier,
      partyName: record.buyerName,
      firstName: record.buyerIdentifier.length === 11 ? record.buyerName.split(" ").slice(0, -1).join(" ") || record.buyerName : undefined,
      familyName: record.buyerIdentifier.length === 11 ? record.buyerName.split(" ").slice(-1)[0] || "" : undefined,
      taxSchemeName: record.buyerTaxOffice || "",
      streetName: record.buyerAddress,
      citySubdivisionName: record.buyerDistrict,
      cityName: record.buyerCity,
      countryName: "Türkiye",
      telephone: record.buyerPhone,
      electronicMail: record.buyerEmail,
    },
    invoiceLines,
    taxTotal: {
      taxAmount: toKurus(record.vatAmount),
      taxSubtotals: [
        {
          taxableAmount: toKurus(netSubtotal),
          taxAmount: toKurus(record.vatAmount),
          percent: record.vatRate,
          taxTypeCode: "0015",
          taxName: "KDV",
        },
      ],
    },
    legalMonetaryTotal: {
      lineExtensionAmount: toKurus(netSubtotal),
      taxExclusiveAmount: toKurus(netSubtotal),
      taxInclusiveAmount: toKurus(record.totalAmount),
      allowanceTotalAmount: toKurus(record.discountAmount),
      payableAmount: toKurus(record.totalAmount),
    },
    // E-Arşiv İnternet Satışı zorunlu alanları
    earchiveInfo: {
      sendType: "ELEKTRONIK",
      isInternetSale: true,
      paymentInfo: {
        webAddress: record.storeWebUrl || config.storeWebUrl || "https://bodykitmerkezi.com",
        paymentMethod:
          record.paymentMethod.toLowerCase().includes("kart")
            ? "KREDIKARTI/BANKAKARTI"
            : record.paymentMethod.toLowerCase().includes("kapı")
            ? "KAPIDAODEME"
            : "EFT/HAVALE",
        paymentPlatform: record.paymentMethod,
        paymentDate: record.issueDate.slice(0, 10),
      },
      deliveryInfo: {
        carrierName: record.carrierName || " Yurtiçi Kargo / Anlaşmalı Kargo",
        carrierVknTckn: "1111111111",
        shippingDate: record.issueDate.slice(0, 10),
      },
    },
    notes: [
      `Sipariş No: #${record.orderDisplayId}`,
      `Ödeme Yöntemi: ${record.paymentMethod}`,
      `İnternet Satış Web Adresi: ${record.storeWebUrl || "https://bodykitmerkezi.com"}`,
      `İşbu fatura Trendyol E-Faturam entegrasyonu üzerinden düzenlenmiştir.`,
    ],
  }
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const config = readEfaturaConfig()
  const invoices = readEfaturaInvoices()
  res.json({ config, invoices })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = (req.body as any) || {}
    const action = body.action || "create"
    const config = readEfaturaConfig()

    // 1. Bağlantı Testi
    if (action === "test") {
      const testConfig: EfaturaConfig = {
        ...config,
        ...(body.config || {}),
      }
      if (!testConfig.email || !testConfig.password) {
        return res.status(400).json({
          success: false,
          error: "Trendyol E-Faturam e-posta (kullanıcı adı) ve şifre alanları zorunludur.",
        })
      }

      try {
        const authResult = await signInTrendyolEfatura(testConfig)
        if (authResult.companyId && !testConfig.companyId) {
          writeEfaturaConfig({ ...testConfig, companyId: authResult.companyId })
        }
        return res.json({
          success: true,
          message: `Trendyol E-Faturam (${testConfig.environment === "stage" ? "Test Ortamı" : "Canlı Ortam"}) bağlantısı başarılı!`,
          gatewayUrl: getGatewayBaseUrl(testConfig.environment),
          companyId: authResult.companyId || testConfig.companyId || "-",
          tokenPreview: `${authResult.token.slice(0, 12)}...`,
        })
      } catch (err: any) {
        return res.status(400).json({
          success: false,
          error: err?.message || "Trendyol E-Faturam API bağlantısı kurulamadı.",
          gatewayUrl: getGatewayBaseUrl(testConfig.environment),
        })
      }
    }

    // 2. Fatura İptali
    if (action === "cancel") {
      const invoiceId = body.invoice_id
      const orderId = body.order_id
      const invoices = readEfaturaInvoices()
      const target = invoices.find((x) => x.id === invoiceId || x.orderId === orderId)
      if (!target) {
        return res.status(404).json({ error: "İptal edilecek fatura kaydı bulunamadı." })
      }
      target.status = "IPTAL"
      const updatedList = saveEfaturaInvoice(target)
      return res.json({ success: true, invoice: target, invoices: updatedList })
    }

    // 3. Sipariş(ler) İçin E-Fatura / E-Arşiv Kesme
    const rawIds: string[] = Array.isArray(body.order_ids)
      ? body.order_ids
      : body.order_id
      ? [body.order_id]
      : []

    if (rawIds.length === 0) {
      return res.status(400).json({ error: "Fatura kesilecek sipariş seçilmedi (order_id / order_ids gerekli)." })
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    let pgConnection: any = null
    try {
      pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    } catch {}

    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "created_at",
        "currency_code",
        "total",
        "item_subtotal",
        "shipping_total",
        "discount_total",
        "metadata",
        "items.*",
        "items.variant.*",
        "shipping_address.*",
        "billing_address.*",
        "customer.*",
        "shipping_methods.*",
      ],
      filters: { id: rawIds },
    })

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "Sipariş bulunamadı." })
    }

    // Check if we can authenticate with Trendyol E-Faturam API right now
    let authToken = ""
    let resolvedCompanyId = config.companyId
    let apiErrorNote = ""
    if (config.active && config.email && config.password) {
      try {
        const auth = await signInTrendyolEfatura(config)
        authToken = auth.token
        if (auth.companyId && !resolvedCompanyId) {
          resolvedCompanyId = auth.companyId
        }
      } catch (e: any) {
        apiErrorNote = e?.message || "Trendyol API giriş hatası"
        console.warn("[efatura] SignIn warning, falling back to local UBL generation:", apiErrorNote)
      }
    }

    const createdInvoices: EfaturaInvoiceRecord[] = []
    let existingInvoices = readEfaturaInvoices()

    for (const o of orders as any[]) {
      const existingForOrder = existingInvoices.find(
        (inv) => inv.orderId === o.id && inv.status !== "IPTAL"
      )
      if (existingForOrder && !body.force_recreate) {
        createdInvoices.push(existingForOrder)
        continue
      }

      const meta = o.metadata || {}
      const billing = meta.edited_billing
        ? { ...(o.billing_address || {}), ...meta.edited_billing }
        : o.billing_address || o.shipping_address || {}
      const shipping = meta.edited_shipping
        ? { ...(o.shipping_address || {}), ...meta.edited_shipping }
        : o.shipping_address || {}
      const customer = meta.edited_customer
        ? { ...(o.customer || {}), ...meta.edited_customer }
        : o.customer || {}

      // Determine Corporate (VKN) vs Individual (TCKN)
      const rawVkn = String(meta.vkn || meta.tax_no || billing.tax_no || "").replace(/[^0-9]/g, "")
      const rawTckn = String(meta.tckn || meta.tc_no || billing.tc_no || "").replace(/[^0-9]/g, "")
      const isCorporate =
        meta.invoice_type === "Kurumsal" ||
        rawVkn.length === 10 ||
        Boolean(meta.company_name || billing.company)

      const buyerIdentifier = isCorporate
        ? rawVkn.length === 10
          ? rawVkn
          : rawTckn.length === 11
          ? rawTckn
          : "1111111111"
        : rawTckn.length === 11
        ? rawTckn
        : "11111111111"

      const fullPersonName =
        `${billing.first_name || shipping.first_name || customer.first_name || ""} ${
          billing.last_name || shipping.last_name || customer.last_name || ""
        }`.trim() || "Müşteri"

      const buyerName = isCorporate
        ? String(meta.company_name || billing.company || fullPersonName).trim()
        : fullPersonName

      const buyerTaxOffice = String(meta.tax_office || billing.tax_office || "").trim()

      // Determine E-Fatura vs E-Arşiv
      const requestedDocType = body.document_type as "EARSIV" | "EFATURA" | undefined
      const documentType: "EARSIV" | "EFATURA" =
        requestedDocType || (isCorporate && buyerIdentifier.length === 10 ? "EFATURA" : "EARSIV")
      const invoiceScenario: "EARSIVFATURA" | "TEMELFATURA" | "TICARIFATURA" =
        documentType === "EFATURA" ? "TICARIFATURA" : "EARSIVFATURA"

      const vatRate = Number(config.defaultVatRate) || 20
      const rawItems = Array.isArray(meta.edited_items) ? meta.edited_items : o.items || []

      const mappedItems = rawItems.map((it: any) => {
        const qty = Number(it.quantity) || 1
        // Medusa V2 stores unit_price in kuruş (e.g. 150000 for 1500 TL)
        const rawUnitPrice = Number(it.unit_price) || 0
        const unitPriceTL = rawUnitPrice >= 100 ? rawUnitPrice / 100 : rawUnitPrice
        const grossTotalTL = Number((unitPriceTL * qty).toFixed(2))
        const netUnitPriceTL = Number((unitPriceTL / (1 + vatRate / 100)).toFixed(4))
        const netTotalTL = Number((grossTotalTL / (1 + vatRate / 100)).toFixed(2))
        const vatAmountTL = Number((grossTotalTL - netTotalTL).toFixed(2))

        return {
          title: it.title || "Oto Aksesuar / Bodykit Ürünü",
          sku: it.variant?.sku || it.sku || "BKM-URUN",
          quantity: qty,
          unitPrice: unitPriceTL,
          netUnitPrice: netUnitPriceTL,
          vatRate,
          vatAmount: vatAmountTL,
          totalAmount: grossTotalTL,
        }
      })

      const rawOrderTotal = Number(meta.edited_total ?? o.total ?? 0)
      const orderTotalTL =
        rawOrderTotal >= 100
          ? rawOrderTotal / 100
          : mappedItems.reduce((acc: number, x: any) => acc + x.totalAmount, 0)

      const itemsSumTL = mappedItems.reduce((acc: number, x: any) => acc + x.totalAmount, 0)
      const totalAmountTL = Number((orderTotalTL > 0 ? orderTotalTL : itemsSumTL).toFixed(2))
      const netTotalAllTL = Number((totalAmountTL / (1 + vatRate / 100)).toFixed(2))
      const vatTotalAllTL = Number((totalAmountTL - netTotalAllTL).toFixed(2))

      // Payment method label
      let payMethod = "Kredi Kartı (Online)"
      const metaOption = meta.payment_option
      if (metaOption === "cash_on_delivery") payMethod = "Kapıda Nakit Ödeme"
      else if (metaOption === "card_on_delivery") payMethod = "Kapıda Kredi Kartı ile Ödeme"
      else if (metaOption === "bank_transfer") payMethod = "Havale / EFT"
      else if (metaOption === "paytr") payMethod = "PayTR Online Kredi Kartı"

      const carrierName =
        meta.selected_carrier === "interline"
          ? "Interline Express Kargo"
          : meta.selected_carrier === "kargonova"
          ? "Nova Kargo"
          : o.shipping_methods?.[0]?.name || "Anlaşmalı Kargo"

      const prefix = documentType === "EFATURA" ? config.einvoicePrefix : config.earchivePrefix
      let invoiceNumber = generateSequentialInvoiceNumber(prefix, existingInvoices)
      let uuid = crypto.randomUUID()
      let source: "TRENDYOL_API" | "YEREL_UBL" = "YEREL_UBL"
      let trendyolResponse: any = null

      const record: EfaturaInvoiceRecord = {
        id: `efat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        uuid,
        invoiceNumber,
        orderId: o.id,
        orderDisplayId: String(o.display_id || o.id.slice(-8)),
        documentType,
        invoiceScenario,
        invoiceType: "SATIS",
        status: "RESMILESTI",
        source,
        environment: config.environment,
        issueDate: new Date().toISOString(),
        buyerName,
        buyerIdentifier,
        buyerTaxOffice,
        buyerAddress: `${billing.address_1 || shipping.address_1 || ""} ${billing.address_2 || ""}`.trim() || "Merkez",
        buyerCity: billing.province || billing.city || shipping.province || shipping.city || "İstanbul",
        buyerDistrict: billing.city || shipping.city || "Merkez",
        buyerEmail: o.email || customer.email || "",
        buyerPhone: billing.phone || shipping.phone || customer.phone || "",
        currencyCode: (o.currency_code || "TRY").toUpperCase(),
        subtotalAmount: totalAmountTL,
        vatRate,
        vatAmount: vatTotalAllTL,
        discountAmount: Number(((Number(o.discount_total) || 0) / 100).toFixed(2)),
        totalAmount: totalAmountTL,
        paymentMethod: payMethod,
        carrierName,
        storeWebUrl: config.storeWebUrl || "https://bodykitmerkezi.com",
        items: mappedItems,
        createdAt: new Date().toISOString(),
      }

      // Send to Trendyol E-Faturam Gateway if authenticated
      if (authToken) {
        try {
          const baseUrl = getGatewayBaseUrl(config.environment)
          const endpoint =
            documentType === "EFATURA"
              ? `${baseUrl}/api/invoice/documents/outgoing-einvoice`
              : `${baseUrl}/api/invoice/documents/earchive`

          const payload = buildTrendyolInvoicePayload(record, {
            ...config,
            companyId: resolvedCompanyId || config.companyId,
          })

          const apiRes = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "x-access-token": authToken,
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(payload),
          })

          const apiData = await apiRes.json().catch(() => null)
          trendyolResponse = apiData

          if (apiRes.ok) {
            record.source = "TRENDYOL_API"
            if (apiData?.uuid || apiData?.data?.uuid) {
              record.uuid = apiData.uuid || apiData.data.uuid
            }
            if (apiData?.invoiceId || apiData?.invoiceNumber || apiData?.data?.invoiceId) {
              record.invoiceNumber =
                apiData.invoiceId || apiData.invoiceNumber || apiData.data.invoiceId
            }
          } else {
            record.trendyolResponse = {
              warning: apiData?.message || apiData?.error || `HTTP ${apiRes.status}`,
              raw: apiData,
            }
          }
        } catch (apiErr: any) {
          record.trendyolResponse = { warning: apiErr?.message || "API çağrısı hatası" }
        }
      } else if (apiErrorNote) {
        record.trendyolResponse = { warning: apiErrorNote }
      }

      existingInvoices = saveEfaturaInvoice(record)
      createdInvoices.push(record)

      // Update order metadata with invoice details
      const issueDateFormatted = new Date(record.issueDate).toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })

      const updatedMetadata = {
        ...meta,
        invoice_series: record.invoiceNumber,
        invoice_date: issueDateFormatted,
        e_invoice_date: issueDateFormatted,
        efatura: {
          id: record.id,
          uuid: record.uuid,
          invoiceNumber: record.invoiceNumber,
          documentType: record.documentType,
          invoiceScenario: record.invoiceScenario,
          status: record.status,
          source: record.source,
          issueDate: record.issueDate,
          buyerName: record.buyerName,
          buyerIdentifier: record.buyerIdentifier,
          buyerTaxOffice: record.buyerTaxOffice,
          totalAmount: record.totalAmount,
          vatAmount: record.vatAmount,
        },
        integration_logs: [
          {
            id: `efat_log_${Date.now()}`,
            message: `Trendyol ${record.documentType === "EFATURA" ? "E-Fatura" : "E-Arşiv Fatura"} oluşturuldu: ${record.invoiceNumber} (ETTN: ${record.uuid.slice(0, 8)}...)`,
            created_at: issueDateFormatted,
          },
          ...(Array.isArray(meta.integration_logs) ? meta.integration_logs : []),
        ],
      }

      try {
        const orderModuleService = req.scope.resolve(Modules.ORDER)
        await orderModuleService.updateOrders(o.id, { metadata: updatedMetadata })
      } catch {
        if (pgConnection) {
          try {
            await pgConnection("order")
              .where({ id: o.id })
              .update({ metadata: JSON.stringify(updatedMetadata), updated_at: new Date() })
          } catch (pgErr) {
            console.error("[efatura] Order metadata PG update error:", pgErr)
          }
        }
      }
    }

    return res.json({
      success: true,
      created: createdInvoices,
      invoices: existingInvoices,
      config,
    })
  } catch (e: any) {
    console.error("[efatura POST] Error:", e)
    return res.status(500).json({ error: e?.message || "E-Fatura işlemi sırasında hata oluştu." })
  }
}
