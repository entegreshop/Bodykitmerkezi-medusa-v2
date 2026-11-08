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

function decodeJwtPayload(token: string): Record<string, any> {
  try {
    const parts = token.split(".")
    if (parts.length < 2) return {}
    const payloadJson = Buffer.from(parts[1], "base64url").toString("utf8")
    return JSON.parse(payloadJson)
  } catch {
    return {}
  }
}

export interface TrendyolAuthSession {
  token: string
  userId: string
  companyId: string
  taxId: string
  corporateName?: string
  jwtPayload?: Record<string, any>
}

export interface TrendyolCreditInfo {
  remainingCredit: number
  totalCredit: number
  usedCredit: number
  packageName: string
  status: string
}

async function signInTrendyolEfatura(config: EfaturaConfig): Promise<TrendyolAuthSession> {
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
  const rawText = await response.text().catch(() => "")
  try {
    bodyData = rawText ? JSON.parse(rawText) : null
  } catch {
    bodyData = rawText
  }

  if (!response.ok) {
    const errMsg =
      bodyData?.detail ||
      bodyData?.title ||
      bodyData?.message ||
      bodyData?.error ||
      `Trendyol E-Faturam giriş hatası (HTTP ${response.status})`
    throw new Error(errMsg)
  }

  const token =
    headerToken ||
    bodyData?.accessToken ||
    bodyData?.token ||
    bodyData?.jwt ||
    bodyData?.data?.accessToken ||
    ""

  if (!token) {
    throw new Error("Trendyol E-Faturam API yanıtında x-access-token bulunamadı.")
  }

  const jwtPayload = decodeJwtPayload(token)

  // In Trendyol E-Faturam signIn, response body is often the integer userId directly!
  let userId = ""
  if (typeof bodyData === "number" || (typeof bodyData === "string" && /^\d+$/.test(bodyData.trim()))) {
    userId = String(bodyData).trim()
  } else if (bodyData && typeof bodyData === "object") {
    userId = String(bodyData.userId || bodyData.id || bodyData.user?.id || "")
  }
  if (!userId) {
    userId = String(
      jwtPayload.userId ||
        jwtPayload.sub ||
        jwtPayload.id ||
        jwtPayload.user_id ||
        jwtPayload.uid ||
        ""
    )
  }

  let companyId = String(
    config.companyId ||
      jwtPayload.companyId ||
      jwtPayload.company_id ||
      jwtPayload.corporateId ||
      jwtPayload.companies?.[0]?.id ||
      (typeof bodyData === "object" ? bodyData?.companyId || bodyData?.user?.companyId : "") ||
      ""
  )

  let taxId = String(
    config.supplierVkn ||
      jwtPayload.taxId ||
      jwtPayload.vkn ||
      jwtPayload.tax_id ||
      ""
  ).trim()

  let corporateName = config.supplierName

  // Fetch corporate record from /api/invoice/corporates/by-current-user-id/{userId} if needed
  const authHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-access-token": token,
    Authorization: `Bearer ${token}`,
  }

  if (userId) {
    for (const corpPath of [
      `/api/invoice/corporates/by-current-user-id/${encodeURIComponent(userId)}`,
      `/api/invoice/corporates/by-user-id/${encodeURIComponent(userId)}`,
      `/api/invoice/corporates`,
    ]) {
      try {
        const corpRes = await fetch(`${baseUrl}${corpPath}`, {
          method: "GET",
          headers: authHeaders,
        })
        if (corpRes.ok) {
          const corpData = await corpRes.json()
          const corp = Array.isArray(corpData)
            ? corpData[0]
            : corpData?.content?.[0] || corpData?.data || corpData
          if (corp && typeof corp === "object") {
            if (corp.id || corp.companyId || corp.corporateId) {
              companyId = String(corp.id || corp.companyId || corp.corporateId)
            }
            if (corp.taxId || corp.vkn || corp.vknTckn) {
              taxId = String(corp.taxId || corp.vkn || corp.vknTckn)
            }
            if (corp.name || corp.title || corp.companyName) {
              corporateName = String(corp.name || corp.title || corp.companyName)
            }
            break
          }
        }
      } catch {}
    }
  }

  return {
    token,
    userId,
    companyId,
    taxId: taxId || config.supplierVkn || "7050600355",
    corporateName,
    jwtPayload,
  }
}

async function fetchTrendyolCredits(
  config: EfaturaConfig,
  session: TrendyolAuthSession
): Promise<TrendyolCreditInfo | null> {
  const baseUrl = getGatewayBaseUrl(config.environment)
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-access-token": session.token,
    Authorization: `Bearer ${session.token}`,
  }

  let remainingCredit: number | null = null
  let totalCredit: number | null = null
  let usedCredit: number | null = null
  let packageName = "Aktif Kontör Paketi"
  let status = "SUFFICIENT"

  const taxId = session.taxId || config.supplierVkn || "7050600355"
  const userId = session.userId

  // 1. Call /api/invoice/credits/remaining/users/{userId}/tax-ids/{taxId}
  if (userId && taxId) {
    try {
      const remRes = await fetch(
        `${baseUrl}/api/invoice/credits/remaining/users/${encodeURIComponent(
          userId
        )}/tax-ids/${encodeURIComponent(taxId)}`,
        { method: "GET", headers }
      )
      if (remRes.ok) {
        const remData = await remRes.json()
        if (typeof remData === "number") {
          remainingCredit = remData
        } else if (remData && typeof remData === "object") {
          if (remData.remainingCredit != null) remainingCredit = Number(remData.remainingCredit)
          else if (remData.amount != null) remainingCredit = Number(remData.amount)
          if (remData.remainingCreditStatus) status = String(remData.remainingCreditStatus)
        }
      }
    } catch (e) {
      console.warn("[efatura] remaining credit fetch error:", e)
    }

    // 2. Call /api/invoice/credits/packages/usage/users/{userId}/tax-ids/{taxId}
    try {
      const pkgRes = await fetch(
        `${baseUrl}/api/invoice/credits/packages/usage/users/${encodeURIComponent(
          userId
        )}/tax-ids/${encodeURIComponent(taxId)}`,
        { method: "GET", headers }
      )
      if (pkgRes.ok) {
        const pkgData = await pkgRes.json()
        const item = Array.isArray(pkgData)
          ? pkgData[0]
          : pkgData?.content?.[0] || pkgData?.data || pkgData
        if (item && typeof item === "object") {
          const total =
            item.totalCredit ??
            item.packageCredit ??
            item.creditAmount ??
            item.totalAmount ??
            item.limit ??
            item.quota
          const used =
            item.usedCredit ??
            item.usedAmount ??
            item.spentCredit ??
            item.consumedCredit
          const rem =
            item.remainingCredit ??
            item.remainingAmount ??
            item.availableCredit

          if (rem != null && remainingCredit == null) remainingCredit = Number(rem)
          if (total != null) totalCredit = Number(total)
          if (used != null) usedCredit = Number(used)
          if (item.packageName || item.name || item.title) {
            packageName = String(item.packageName || item.name || item.title)
          }
        }
      }
    } catch (e) {
      console.warn("[efatura] package usage fetch error:", e)
    }
  }

  // 3. Fallback partner remaining credit endpoint
  if (remainingCredit == null) {
    try {
      const partRes = await fetch(`${baseUrl}/api/invoice/partners/remaining-credit`, {
        method: "GET",
        headers,
      })
      if (partRes.ok) {
        const partData = await partRes.json()
        if (partData?.remainingCredit != null) {
          remainingCredit = Number(partData.remainingCredit)
        }
      }
    } catch {}
  }

  if (remainingCredit == null && totalCredit == null) {
    return null
  }

  const finalRemaining = remainingCredit ?? 0
  const finalTotal =
    totalCredit ?? (usedCredit != null ? finalRemaining + usedCredit : Math.max(finalRemaining, 500))
  const finalUsed = usedCredit ?? Math.max(0, finalTotal - finalRemaining)

  return {
    remainingCredit: finalRemaining,
    totalCredit: finalTotal,
    usedCredit: finalUsed,
    packageName: packageName || `${finalTotal} Kontör`,
    status,
  }
}

function mapRemoteTrendyolDocToRecord(
  doc: any,
  docType: "EARSIV" | "EFATURA",
  config: EfaturaConfig
): EfaturaInvoiceRecord {
  const uuid = String(doc.invoiceUuid || doc.uuid || doc.documentUuid || crypto.randomUUID())
  const invoiceNumber = String(
    doc.invoiceId || doc.invoiceNumber || doc.documentId || `TY${new Date().getFullYear()}000000001`
  )
  // Amounts in Trendyol E-Faturam search responses are in kuruş (integers)
  const rawTotal = Number(
    doc.payableAmount ?? doc.taxInclusiveAmount ?? doc.price ?? doc.totalAmount ?? 0
  )
  const rawTax = Number(doc.taxAmount ?? doc.totalTaxAmount ?? 0)
  const rawNet = Number(doc.taxExcludedPrice ?? doc.taxExclusiveAmount ?? rawTotal - rawTax)
  const rawDiscount = Number(doc.discountAmount ?? doc.allowanceTotalAmount ?? 0)

  // Convert kuruş to TL
  const totalAmount = Number((rawTotal / 100).toFixed(2))
  const vatAmount = Number((rawTax / 100).toFixed(2))
  const netAmount = Number((rawNet / 100).toFixed(2))
  const discountAmount = Number((rawDiscount / 100).toFixed(2))

  const vatRate =
    netAmount > 0 ? Math.round((vatAmount / netAmount) * 100) || config.defaultVatRate : config.defaultVatRate

  const buyerName =
    String(
      doc.receiverTitle ||
        doc.recipientTitle ||
        doc.targetTitle ||
        doc.source ||
        `${doc.receiverName || doc.recipientName || doc.name || ""} ${
          doc.receiverSurname || doc.recipientSurname || doc.surname || ""
        }`.trim() ||
        "Alıcı Müşteri"
    ).trim()

  const buyerIdentifier = String(
    doc.receiverTaxId || doc.recipientTaxId || doc.taxId || "11111111111"
  )

  const statusRaw = String(doc.status ?? "")
  const isCancelled =
    statusRaw === "305" ||
    statusRaw.toUpperCase().includes("CANCEL") ||
    Boolean(doc.isCancelled || doc.cancelled)

  const issueDate =
    doc.issuedAt || doc.issueDate || doc.createdAt || doc.createDate || new Date().toISOString()

  return {
    id: `ty_${doc.id || uuid}`,
    uuid,
    invoiceNumber,
    orderId: String(doc.localReferenceId || doc.orderId || doc.id || uuid),
    orderDisplayId: String(doc.localReferenceId || doc.orderId || invoiceNumber.slice(-6)),
    documentType: docType,
    invoiceScenario:
      doc.scenario || (docType === "EFATURA" ? "TICARIFATURA" : "EARSIVFATURA"),
    invoiceType: doc.invoiceTypeCode === "IADE" ? "IADE" : "SATIS",
    status: isCancelled ? "IPTAL" : "RESMILESTI",
    source: "TRENDYOL_API",
    environment: config.environment,
    issueDate,
    buyerName,
    buyerIdentifier,
    buyerTaxOffice: String(doc.receiverTaxOffice || doc.taxOffice || ""),
    buyerAddress: String(doc.receiverAddress || doc.address || "Türkiye"),
    buyerCity: String(doc.receiverCity || doc.city || "İstanbul"),
    buyerDistrict: String(doc.receiverDistrict || doc.district || "Merkez"),
    buyerEmail: String(doc.receiverEmail || doc.email || ""),
    buyerPhone: String(doc.receiverPhone || doc.phone || ""),
    currencyCode: String(doc.currency || "TRY"),
    subtotalAmount: totalAmount,
    vatRate,
    vatAmount,
    discountAmount,
    totalAmount,
    paymentMethod: "Kredi Kartı / Online",
    carrierName: "Anlaşmalı Kargo",
    storeWebUrl: config.storeWebUrl || "https://bodykitmerkezi.com",
    items: [
      {
        title: `Fatura Kalemi (${invoiceNumber})`,
        sku: invoiceNumber,
        quantity: 1,
        unitPrice: totalAmount,
        netUnitPrice: netAmount,
        vatRate,
        vatAmount,
        totalAmount,
      },
    ],
    createdAt: doc.createdAt || issueDate,
  }
}

async function fetchTrendyolIssuedInvoices(
  config: EfaturaConfig,
  session: TrendyolAuthSession
): Promise<EfaturaInvoiceRecord[]> {
  const baseUrl = getGatewayBaseUrl(config.environment)
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-access-token": session.token,
    Authorization: `Bearer ${session.token}`,
  }

  const companyIdNum = Number(session.companyId) || undefined
  const results: EfaturaInvoiceRecord[] = []

  const searchPayload: Record<string, any> = {
    pagination: {
      page: 0,
      size: 100,
      sort: ["createdAt,desc"],
    },
  }
  if (companyIdNum) {
    searchPayload.companyId = companyIdNum
  }

  // 1. Search E-Archive Invoices (/api/invoice/documents/earchive/search)
  try {
    const eaRes = await fetch(`${baseUrl}/api/invoice/documents/earchive/search`, {
      method: "POST",
      headers,
      body: JSON.stringify(searchPayload),
    })
    if (eaRes.ok) {
      const eaData = await eaRes.json()
      const list = Array.isArray(eaData)
        ? eaData
        : Array.isArray(eaData?.content)
        ? eaData.content
        : Array.isArray(eaData?.data)
        ? eaData.data
        : []
      for (const doc of list) {
        results.push(mapRemoteTrendyolDocToRecord(doc, "EARSIV", config))
      }
    }
  } catch (e) {
    console.warn("[efatura] earchive/search warning:", e)
  }

  // 2. Search Outgoing E-Invoices (/api/invoice/documents/outgoing-einvoice/search)
  try {
    const eiRes = await fetch(`${baseUrl}/api/invoice/documents/outgoing-einvoice/search`, {
      method: "POST",
      headers,
      body: JSON.stringify(searchPayload),
    })
    if (eiRes.ok) {
      const eiData = await eiRes.json()
      const list = Array.isArray(eiData)
        ? eiData
        : Array.isArray(eiData?.content)
        ? eiData.content
        : Array.isArray(eiData?.data)
        ? eiData.data
        : []
      for (const doc of list) {
        results.push(mapRemoteTrendyolDocToRecord(doc, "EFATURA", config))
      }
    }
  } catch (e) {
    console.warn("[efatura] outgoing-einvoice/search warning:", e)
  }

  return results
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
  config: EfaturaConfig,
  session: TrendyolAuthSession
) {
  const toKurus = (tl: number) => Math.round((Number(tl) || 0) * 100)

  const invoiceLines = record.items.map((item) => {
    const lineNetTotal = item.netUnitPrice * item.quantity
    const lineVatTotal = item.vatAmount
    return {
      unitCode: "C62",
      quantity: item.quantity,
      itemName: item.title,
      unitPriceAmount: toKurus(item.netUnitPrice),
      totalAmount: toKurus(lineNetTotal),
      taxableAmount: toKurus(lineNetTotal),
      taxAmount: toKurus(lineVatTotal),
      taxPercent: item.vatRate,
      totalDiscountAmount: 0,
    }
  })

  const netSubtotal = Math.max(0, record.totalAmount - record.vatAmount)
  const nameParts = (record.buyerName || "Müşteri").trim().split(/\s+/)
  const firstName =
    nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : record.buyerName || "Müşteri"
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "Müşteri"
  const cleanPhone = (record.buyerPhone || "").replace(/[^0-9]/g, "").slice(-10)

  const paymentMeans = record.paymentMethod.toLowerCase().includes("kart")
    ? "CREDIT_CARD"
    : record.paymentMethod.toLowerCase().includes("kapı")
    ? "ON_DELIVERY"
    : "EFT"

  return {
    autoInvoiceId: true,
    companyId: Number(session.companyId || config.companyId) || undefined,
    userId: Number(session.userId) || undefined,
    taxId: session.taxId || config.supplierVkn,
    source: "PORTAL",
    localReferenceId: String(record.orderDisplayId),
    notes: [
      `Sipariş No: #${record.orderDisplayId}`,
      `Ödeme Yöntemi: ${record.paymentMethod}`,
      `İnternet Satış Web Adresi: ${record.storeWebUrl || "https://bodykitmerkezi.com"}`,
    ],
    recipientInfo: {
      taxId: record.buyerIdentifier,
      countryCode: "TR",
      city: record.buyerCity || "İstanbul",
      district: record.buyerDistrict || "Merkez",
      address: record.buyerAddress || "Merkez",
      name: firstName.length >= 2 ? firstName : `${firstName} Bey`,
      surname: lastName.length >= 2 ? lastName : "Müşteri",
      taxOffice: record.buyerTaxOffice || undefined,
      phone: cleanPhone.length >= 7 ? cleanPhone : undefined,
      email:
        record.buyerEmail && record.buyerEmail.includes("@")
          ? record.buyerEmail.toLowerCase()
          : undefined,
    },
    currencyInfo: {
      currency: "TRY",
      hasExchange: false,
    },
    invoiceInfo: {
      invoiceType: record.invoiceScenario, // EARSIVFATURA | TICARIFATURA | TEMELFATURA
      invoiceTypeCode: "SATIS",
      invoiceUuid: record.uuid,
    },
    invoiceLines,
    totalTax: {
      totalTaxAmount: toKurus(record.vatAmount),
      subTotalTaxes: [
        {
          taxableAmount: toKurus(netSubtotal),
          taxAmount: toKurus(record.vatAmount),
          taxType: "KDV",
          percent: record.vatRate,
        },
      ],
    },
    taxes: {
      taxAmount: toKurus(record.vatAmount),
      taxableAmount: toKurus(netSubtotal),
    },
    invoiceTotal: {
      lineExtensionAmount: toKurus(netSubtotal),
      taxExclusiveAmount: toKurus(netSubtotal),
      taxInclusiveAmount: toKurus(record.totalAmount),
      allowanceTotalAmount: toKurus(record.discountAmount),
      payableAmount: toKurus(record.totalAmount),
    },
    orderInfo: {
      orderId: String(record.orderDisplayId),
      orderDate: record.issueDate.slice(0, 10),
    },
    paymentInfo: {
      purchaseUrl: record.storeWebUrl || config.storeWebUrl || "https://bodykitmerkezi.com",
      paymentMeans,
      paymentDate: record.issueDate,
      paymentAgentName: record.paymentMethod,
    },
    deliveryInfo: {
      carrierTaxId: "1111111111",
      carrierName: record.carrierName || "Yurtiçi Kargo",
      sentAt: record.issueDate.slice(0, 10),
    },
  }
}

function mergeRemoteAndLocalInvoices(
  remoteList: EfaturaInvoiceRecord[],
  localList: EfaturaInvoiceRecord[]
): EfaturaInvoiceRecord[] {
  const byKey = new Map<string, EfaturaInvoiceRecord>()
  for (const loc of localList) {
    byKey.set(loc.uuid || loc.invoiceNumber, loc)
  }
  for (const rem of remoteList) {
    const existing =
      byKey.get(rem.uuid) ||
      Array.from(byKey.values()).find((x) => x.invoiceNumber === rem.invoiceNumber)
    if (existing) {
      byKey.set(existing.uuid || existing.invoiceNumber, {
        ...existing,
        ...rem,
        items: existing.items?.length ? existing.items : rem.items,
      })
    } else {
      byKey.set(rem.uuid || rem.invoiceNumber, rem)
    }
  }
  return Array.from(byKey.values()).sort(
    (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
  )
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  let config = readEfaturaConfig()
  let invoices = readEfaturaInvoices()
  let creditInfo: TrendyolCreditInfo | null = null
  let sessionInfo: Partial<TrendyolAuthSession> | null = null

  if (config.active && config.email && config.password) {
    try {
      const session = await signInTrendyolEfatura(config)
      sessionInfo = {
        userId: session.userId,
        companyId: session.companyId,
        taxId: session.taxId,
        corporateName: session.corporateName,
      }
      if (session.companyId && !config.companyId) {
        config = writeEfaturaConfig({ ...config, companyId: session.companyId })
      }
      const [credits, remoteInvoices] = await Promise.all([
        fetchTrendyolCredits(config, session),
        fetchTrendyolIssuedInvoices(config, session),
      ])
      creditInfo = credits
      if (remoteInvoices.length > 0) {
        invoices = mergeRemoteAndLocalInvoices(remoteInvoices, invoices)
      }
    } catch (e: any) {
      console.warn("[efatura GET] Remote sync warning:", e?.message)
    }
  }

  res.json({ config, invoices, creditInfo, sessionInfo })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = (req.body as any) || {}
    const action = body.action || "create"
    let config = readEfaturaConfig()

    // 1. Bağlantı Testi + Kontör & Fatura Senkronizasyonu
    if (action === "test" || action === "sync") {
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
        const session = await signInTrendyolEfatura(testConfig)
        if (session.companyId) {
          config = writeEfaturaConfig({ ...testConfig, companyId: session.companyId })
        } else {
          config = writeEfaturaConfig(testConfig)
        }

        const [creditInfo, remoteInvoices] = await Promise.all([
          fetchTrendyolCredits(config, session),
          fetchTrendyolIssuedInvoices(config, session),
        ])

        const localInvoices = readEfaturaInvoices()
        const mergedInvoices = mergeRemoteAndLocalInvoices(remoteInvoices, localInvoices)

        return res.json({
          success: true,
          message: `Trendyol E-Faturam (${
            config.environment === "stage" ? "Test Ortamı" : "Canlı Ortam"
          }) bağlantısı başarılı!`,
          gatewayUrl: getGatewayBaseUrl(config.environment),
          companyId: session.companyId || config.companyId || "-",
          userId: session.userId || "-",
          taxId: session.taxId || config.supplierVkn,
          creditInfo,
          invoices: mergedInvoices,
          config,
        })
      } catch (err: any) {
        return res.status(400).json({
          success: false,
          error: err?.message || "Trendyol E-Faturam API bağlantısı kurulamadı.",
          gatewayUrl: getGatewayBaseUrl(testConfig.environment),
        })
      }
    }

    // 2. Resmi Trendyol E-Faturam PDF / HTML İndirme Linki
    if (action === "download") {
      const uuid = body.uuid || body.invoiceUuid
      const docType = body.documentType === "EFATURA" ? "EINVOICE" : "EARCHIVE"
      const ext = body.fileExtension || "pdf"
      if (!uuid || !config.email || !config.password) {
        return res.status(400).json({ error: "Fatura UUID veya API bilgileri eksik." })
      }
      const session = await signInTrendyolEfatura(config)
      const baseUrl = getGatewayBaseUrl(config.environment)
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-access-token": session.token,
        Authorization: `Bearer ${session.token}`,
      }
      for (const pathUrl of [
        "/api/invoice/documents/download/permanent-url",
        "/api/invoice/documents/download",
      ]) {
        const dlRes = await fetch(`${baseUrl}${pathUrl}`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            documentType: docType,
            fileExtension: ext,
            documentUuid: uuid,
            invoiceUuid: uuid,
            companyId: Number(session.companyId || config.companyId) || undefined,
          }),
        })
        if (dlRes.ok) {
          const dlData = await dlRes.json().catch(() => null)
          const downloadUrl =
            typeof dlData === "string"
              ? dlData
              : dlData?.url || dlData?.downloadUrl || dlData?.data
          if (downloadUrl) {
            return res.json({ success: true, downloadUrl })
          }
        }
      }
      return res.status(404).json({ error: "Resmi indirme bağlantısı alınamadı." })
    }

    // 3. Fatura İptali
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

    // 4. Sipariş(ler) İçin E-Fatura / E-Arşiv Kesme
    const rawIds: string[] = Array.isArray(body.order_ids)
      ? body.order_ids
      : body.order_id
      ? [body.order_id]
      : []

    if (rawIds.length === 0) {
      return res
        .status(400)
        .json({ error: "Fatura kesilecek sipariş seçilmedi (order_id / order_ids gerekli)." })
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

    let authSession: TrendyolAuthSession | null = null
    let apiErrorNote = ""
    if (config.active && config.email && config.password) {
      try {
        authSession = await signInTrendyolEfatura(config)
        if (authSession.companyId && !config.companyId) {
          config = writeEfaturaConfig({ ...config, companyId: authSession.companyId })
        }
      } catch (e: any) {
        apiErrorNote = e?.message || "Trendyol API giriş hatası"
        console.warn("[efatura] SignIn warning:", apiErrorNote)
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

      const rawVkn = String(meta.vkn || meta.tax_no || billing.tax_no || "").replace(/[^0-9]/g, "")
      const rawTckn = String(meta.tckn || meta.tc_no || billing.tc_no || "").replace(
        /[^0-9]/g,
        ""
      )
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

      const requestedDocType = body.document_type as "EARSIV" | "EFATURA" | undefined
      const documentType: "EARSIV" | "EFATURA" =
        requestedDocType || (isCorporate && buyerIdentifier.length === 10 ? "EFATURA" : "EARSIV")
      const invoiceScenario: "EARSIVFATURA" | "TEMELFATURA" | "TICARIFATURA" =
        documentType === "EFATURA" ? "TICARIFATURA" : "EARSIVFATURA"

      const vatRate = Number(config.defaultVatRate) || 20
      const rawItems = Array.isArray(meta.edited_items) ? meta.edited_items : o.items || []

      const mappedItems = rawItems.map((it: any) => {
        const qty = Number(it.quantity) || 1
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
      const invoiceNumber = generateSequentialInvoiceNumber(prefix, existingInvoices)
      const uuid = crypto.randomUUID()

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
        source: "YEREL_UBL",
        environment: config.environment,
        issueDate: new Date().toISOString(),
        buyerName,
        buyerIdentifier,
        buyerTaxOffice,
        buyerAddress:
          `${billing.address_1 || shipping.address_1 || ""} ${billing.address_2 || ""}`.trim() ||
          "Merkez",
        buyerCity:
          billing.province ||
          billing.city ||
          shipping.province ||
          shipping.city ||
          "İstanbul",
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

      if (authSession?.token) {
        try {
          const baseUrl = getGatewayBaseUrl(config.environment)
          const endpoint =
            documentType === "EFATURA"
              ? `${baseUrl}/api/invoice/documents/outgoing-einvoice`
              : `${baseUrl}/api/invoice/documents/earchive`

          const payload = buildTrendyolInvoicePayload(record, config, authSession)

          const apiRes = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "x-access-token": authSession.token,
              Authorization: `Bearer ${authSession.token}`,
            },
            body: JSON.stringify(payload),
          })

          const apiData = await apiRes.json().catch(() => null)

          if (apiRes.ok) {
            record.source = "TRENDYOL_API"
            if (apiData?.invoiceUuid || apiData?.uuid || apiData?.data?.invoiceUuid) {
              record.uuid = apiData.invoiceUuid || apiData.uuid || apiData.data.invoiceUuid
            }
            if (apiData?.invoiceId || apiData?.invoiceNumber || apiData?.data?.invoiceId) {
              record.invoiceNumber =
                apiData.invoiceId || apiData.invoiceNumber || apiData.data.invoiceId
            }
          } else {
            record.trendyolResponse = {
              warning:
                apiData?.detail ||
                apiData?.title ||
                apiData?.message ||
                apiData?.error ||
                `HTTP ${apiRes.status}`,
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
            message: `Trendyol ${
              record.documentType === "EFATURA" ? "E-Fatura" : "E-Arşiv Fatura"
            } oluşturuldu: ${record.invoiceNumber} (ETTN: ${record.uuid.slice(0, 8)}...)`,
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
    return res
      .status(500)
      .json({ error: e?.message || "E-Fatura işlemi sırasında hata oluştu." })
  }
}
