import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText, CheckCircle, XMark, Plus, ArrowPath } from "@medusajs/icons"
import { useEffect, useMemo, useState } from "react"
import { ErpTopNav } from "../kampanyalar/erp-top-nav"

export interface EfaturaInvoiceItem {
  title: string
  sku: string
  quantity: number
  unitPrice: number
  netUnitPrice: number
  vatRate: number
  vatAmount: number
  totalAmount: number
}

export interface EfaturaInvoiceRecord {
  id: string
  uuid: string
  invoiceNumber: string
  orderId: string
  orderDisplayId: string
  documentType: "EARSIV" | "EFATURA"
  invoiceScenario: "EARSIVFATURA" | "TEMELFATURA" | "TICARIFATURA"
  invoiceType: "SATIS" | "IADE"
  status: "RESMILESTI" | "TASLAK" | "IPTAL"
  source: "TRENDYOL_API" | "YEREL_UBL"
  environment: "stage" | "production"
  issueDate: string
  buyerName: string
  buyerIdentifier: string
  buyerTaxOffice: string
  buyerAddress: string
  buyerCity: string
  buyerDistrict: string
  buyerEmail: string
  buyerPhone: string
  currencyCode: string
  subtotalAmount: number
  vatRate: number
  vatAmount: number
  discountAmount: number
  totalAmount: number
  paymentMethod: string
  carrierName: string
  storeWebUrl: string
  items: EfaturaInvoiceItem[]
  trendyolResponse?: any
  createdAt: string
}

export interface EfaturaConfig {
  active: boolean
  environment: "stage" | "production"
  email: string
  password: string
  companyId: string
  supplierVkn: string
  supplierName: string
  supplierTaxOffice: string
  supplierAddress: string
  supplierCity: string
  supplierDistrict: string
  supplierPhone: string
  supplierEmail: string
  supplierMersis: string
  supplierTicaretSicil: string
  earchivePrefix: string
  einvoicePrefix: string
  defaultVatRate: number
  autoSend: boolean
  storeWebUrl: string
}

export interface TrendyolCreditInfo {
  remainingCredit: number
  totalCredit: number
  usedCredit: number
  packageName: string
  status: string
}

function numberToTurkishWords(amount: number): string {
  const ones = ["", "BİR", "İKİ", "ÜÇ", "DÖRT", "BEŞ", "ALTI", "YEDİ", "SEKİZ", "DOKUZ"]
  const tens = ["", "ON", "YİRMİ", "OTUZ", "KIRK", "ELLİ", "ALTMIŞ", "YETMİŞ", "SEKSEN", "DOKSAN"]

  const readThreeDigits = (n: number): string => {
    if (n === 0) return ""
    const h = Math.floor(n / 100)
    const t = Math.floor((n % 100) / 10)
    const o = n % 10
    let str = ""
    if (h === 1) str += "YÜZ"
    else if (h > 1) str += ones[h] + "YÜZ"
    if (t > 0) str += tens[t]
    if (o > 0) str += ones[o]
    return str
  }

  const whole = Math.floor(Math.abs(amount))
  const kurus = Math.round((Math.abs(amount) - whole) * 100)

  if (whole === 0) return "SIFIR TÜRK LİRASI"

  const millions = Math.floor(whole / 1000000)
  const thousands = Math.floor((whole % 1000000) / 1000)
  const remainder = whole % 1000

  let result = ""
  if (millions > 0) result += readThreeDigits(millions) + "MİLYON"
  if (thousands === 1) result += "BİN"
  else if (thousands > 1) result += readThreeDigits(thousands) + "BİN"
  if (remainder > 0) result += readThreeDigits(remainder)

  result += " TÜRK LİRASI"
  if (kurus > 0) {
    result += " " + readThreeDigits(kurus) + " KURUŞ"
  }
  return `YALNIZ #${result}#`
}

export function openGibInvoicePrintWindow(
  invoices: EfaturaInvoiceRecord[],
  config: Partial<EfaturaConfig>
) {
  if (!invoices || invoices.length === 0) return

  const width = 940
  const height = 820
  const left = Math.max(0, (window.innerWidth - width) / 2)
  const top = Math.max(0, (window.innerHeight - height) / 2)
  const printWindow = window.open(
    "",
    "_blank",
    `width=${width},height=${height},top=${top},left=${left}`
  )
  if (!printWindow) {
    alert("Lütfen tarayıcınızda açılır pencere (pop-up) izni verin.")
    return
  }

  const supplierName =
    config.supplierName || "ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SANAYİ TİCARET LİMİTED ŞİRKETİ"
  const supplierAddress =
    config.supplierAddress || "MERKEZ MAH. MUALLİM NACİ SK. MERVE NO: 9 GÜNGÖREN/ İSTANBUL"
  const supplierDistrict = config.supplierDistrict || "Güngören"
  const supplierCity = config.supplierCity || "İstanbul"
  const supplierTaxOffice = config.supplierTaxOffice || "Güngören Vergi Dairesi Müdürlüğü"
  const supplierVkn = config.supplierVkn || "7050600355"
  const supplierPhone = config.supplierPhone || "0532 337 00 81"
  const supplierEmail = config.supplierEmail || "hakkisahin9@gmail.com"
  const supplierMersis = config.supplierMersis || "0705060035500001"
  const supplierTicaretSicil = config.supplierTicaretSicil || "-"
  const storeWebUrl = config.storeWebUrl || "https://bodykitmerkezi.com"

  const pagesHtml = invoices
    .map((inv) => {
      const dateObj = new Date(inv.issueDate || Date.now())
      const issueDateStr = dateObj.toLocaleDateString("tr-TR")
      const issueTimeStr = dateObj.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      const netTotal = Math.max(0, inv.totalAmount - inv.vatAmount)
      const isEArchive = inv.documentType === "EARSIV"
      const docTitle = isEArchive ? "e-Arşiv Fatura" : "e-Fatura"
      const idLabel = inv.buyerIdentifier?.length === 10 ? "VKN" : "TCKN"

      return `
      <div class="gib-page">
        <div class="no-print top-toolbar">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="background:#f27a1a;color:#fff;font-weight:800;font-size:11px;padding:4px 10px;border-radius:4px;">TRENDYOL E-FATURAM</span>
            <span style="font-size:12px;font-weight:700;color:#27272a;">Belge No: ${inv.invoiceNumber} | Sipariş: #${inv.orderDisplayId}</span>
          </div>
          <button onclick="window.print()" class="print-btn">🖨️ Faturayı Yazdır / PDF Kaydet</button>
        </div>

        <!-- HEADER: SELLER, GIB LOGO, META -->
        <table class="header-table">
          <tr>
            <td style="width:36%;vertical-align:top;border-right:1px solid #3f3f46;padding-right:10px;">
              <div class="party-title">${supplierName.toUpperCase()}</div>
              <div class="party-line">${supplierAddress}</div>
              <div class="party-line">${supplierDistrict} / ${supplierCity} / TÜRKİYE</div>
              <div class="party-line">Tel: ${supplierPhone} | E-Posta: ${supplierEmail}</div>
              <div class="party-line">Web Sitesi: ${storeWebUrl}</div>
              <div class="party-line" style="margin-top:4px;"><b>Vergi Dairesi:</b> ${supplierTaxOffice}</div>
              <div class="party-line"><b>VKN / TCKN:</b> ${supplierVkn}</div>
              <div class="party-line"><b>Mersis No:</b> ${supplierMersis} | <b>Tic. Sicil:</b> ${supplierTicaretSicil}</div>
            </td>

            <td style="width:28%;text-align:center;vertical-align:middle;padding:0 8px;">
              <div class="gib-seal">
                <div class="gib-seal-inner">
                  <div style="font-size:8px;font-weight:700;letter-spacing:0.5px;">T.C. HAZİNE VE MALİYE BAKANLIĞI</div>
                  <div style="font-size:11px;font-weight:900;color:#b91c1c;margin:2px 0;">GELİR İDARESİ BAŞKANLIĞI</div>
                  <div style="font-size:7px;font-weight:700;color:#52525b;">TRENDYOL E-FATURAM ENTEGRASYONU</div>
                </div>
              </div>
              <div class="doc-type-title">${docTitle}</div>
              <div style="font-size:9px;color:#52525b;margin-top:4px;word-break:break-all;">
                <b>ETTN:</b> ${inv.uuid}
              </div>
            </td>

            <td style="width:36%;vertical-align:top;padding-left:10px;">
              <div style="display:flex;justify-content:flex-end;margin-bottom:6px;">
                <div class="qr-box">
                  <svg viewBox="0 0 100 100" width="68" height="68">
                    <rect x="4" y="4" width="28" height="28" fill="none" stroke="#000" stroke-width="6"/>
                    <rect x="12" y="12" width="12" height="12" fill="#000"/>
                    <rect x="68" y="4" width="28" height="28" fill="none" stroke="#000" stroke-width="6"/>
                    <rect x="76" y="12" width="12" height="12" fill="#000"/>
                    <rect x="4" y="68" width="28" height="28" fill="none" stroke="#000" stroke-width="6"/>
                    <rect x="12" y="76" width="12" height="12" fill="#000"/>
                    <rect x="40" y="10" width="8" height="8" fill="#000"/>
                    <rect x="52" y="18" width="8" height="16" fill="#000"/>
                    <rect x="40" y="40" width="20" height="20" fill="#000"/>
                    <rect x="12" y="44" width="18" height="8" fill="#000"/>
                    <rect x="68" y="44" width="24" height="8" fill="#000"/>
                    <rect x="44" y="68" width="12" height="24" fill="#000"/>
                    <rect x="68" y="68" width="12" height="12" fill="#000"/>
                    <rect x="84" y="80" width="12" height="16" fill="#000"/>
                  </svg>
                </div>
              </div>
              <table class="meta-mini-table">
                <tr><th>Özelleştirme No:</th><td>TR1.2</td></tr>
                <tr><th>Senaryo:</th><td>${inv.invoiceScenario}</td></tr>
                <tr><th>Fatura Tipi:</th><td>${inv.invoiceType}</td></tr>
                <tr><th>Fatura No:</th><td><b>${inv.invoiceNumber}</b></td></tr>
                <tr><th>Fatura Tarihi:</th><td>${issueDateStr}</td></tr>
                <tr><th>Düzenleme Saati:</th><td>${issueTimeStr}</td></tr>
                <tr><th>Sipariş No:</th><td>#${inv.orderDisplayId}</td></tr>
              </table>
            </td>
          </tr>
        </table>

        <hr style="border:none;border-top:2px solid #18181b;margin:8px 0;" />

        <!-- BUYER BLOCK -->
        <table class="buyer-table">
          <tr>
            <td style="width:60%;vertical-align:top;">
              <div style="font-size:11px;font-weight:900;color:#18181b;margin-bottom:3px;">SAYIN</div>
              <div style="font-size:12px;font-weight:800;color:#000;">${inv.buyerName}</div>
              <div class="party-line">${inv.buyerAddress}</div>
              <div class="party-line">${inv.buyerDistrict} / ${inv.buyerCity} / TÜRKİYE</div>
              ${inv.buyerPhone ? `<div class="party-line">Tel: ${inv.buyerPhone} ${inv.buyerEmail ? `| E-Posta: ${inv.buyerEmail}` : ""}</div>` : ""}
              ${inv.buyerTaxOffice ? `<div class="party-line"><b>Vergi Dairesi:</b> ${inv.buyerTaxOffice}</div>` : ""}
              <div class="party-line"><b>${idLabel}:</b> ${inv.buyerIdentifier}</div>
            </td>
            <td style="width:40%;vertical-align:top;">
              <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:6px 8px;font-size:9.5px;line-height:1.45;">
                <div style="font-weight:800;color:#0f172a;border-bottom:1px solid #cbd5e1;padding-bottom:2px;margin-bottom:4px;">İNTERNET SATIŞ / SEVK BİLGİLERİ</div>
                <div><b>Web Adresi:</b> ${inv.storeWebUrl || storeWebUrl}</div>
                <div><b>Ödeme Şekli:</b> ${inv.paymentMethod}</div>
                <div><b>Ödeme Tarihi:</b> ${issueDateStr}</div>
                <div><b>Kargo / Taşıyıcı:</b> ${inv.carrierName || "Anlaşmalı Kargo"}</div>
                <div><b>Gönderim Tarihi:</b> ${issueDateStr}</div>
              </div>
            </td>
          </tr>
        </table>

        <!-- LINE ITEMS TABLE -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width:5%;">Sıra No</th>
              <th style="width:14%;">Stok / Ürün Kodu</th>
              <th style="width:33%;">Mal / Hizmet Açıklaması</th>
              <th style="width:9%;">Miktar</th>
              <th style="width:13%;">Birim Fiyat (KDV Hariç)</th>
              <th style="width:7%;">KDV Oranı</th>
              <th style="width:9%;">KDV Tutarı</th>
              <th style="width:10%;">Mal / Hizmet Tutarı</th>
            </tr>
          </thead>
          <tbody>
            ${inv.items
              .map(
                (item, idx) => `
              <tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td>${item.sku || "-"}</td>
                <td><b>${item.title}</b></td>
                <td style="text-align:center;">${item.quantity} Adet</td>
                <td style="text-align:right;">${item.netUnitPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</td>
                <td style="text-align:center;">%${item.vatRate}</td>
                <td style="text-align:right;">${item.vatAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</td>
                <td style="text-align:right;font-weight:700;">${item.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <!-- TOTALS ROW -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-top:10px;">
          <div style="flex:1;border:1px solid #27272a;padding:8px 10px;font-size:9.5px;line-height:1.5;">
            <div style="font-weight:800;margin-bottom:4px;">${numberToTurkishWords(inv.totalAmount)}</div>
            <div style="color:#3f3f46;">
              • İrsaliye yerine geçer.<br/>
              • e-Arşiv izni kapsamında elektronik ortamda iletilmiştir.<br/>
              • Sipariş No: <b>#${inv.orderDisplayId}</b> | Ödeme Yöntemi: <b>${inv.paymentMethod}</b><br/>
              • Entegratör: <b>Trendyol E-Faturam (Trendyol E-Çözüm)</b>
            </div>
          </div>

          <table class="totals-table">
            <tr>
              <th>Mal / Hizmet Toplam Tutarı (KDV Hariç)</th>
              <td>${netTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</td>
            </tr>
            <tr>
              <th>Toplam İskonto</th>
              <td>${(inv.discountAmount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</td>
            </tr>
            <tr>
              <th>Hesaplanan KDV (%${inv.vatRate})</th>
              <td>${inv.vatAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</td>
            </tr>
            <tr>
              <th>Vergiler Dahil Toplam Tutar</th>
              <td><b>${inv.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</b></td>
            </tr>
            <tr class="payable-row">
              <th>Ödenecek Tutar</th>
              <td><b>${inv.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</b></td>
            </tr>
          </table>
        </div>
      </div>
      `
    })
    .join("")

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="tr">
      <head>
        <meta charset="UTF-8" />
        <title>Trendyol E-Faturam - ${invoices.map((i) => i.invoiceNumber).join(", ")}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 0;
            padding: 16px;
            background: #f4f4f5;
            color: #18181b;
          }
          .gib-page {
            background: #fff;
            max-width: 860px;
            margin: 0 auto 24px auto;
            padding: 22px;
            border: 1px solid #d4d4d8;
            box-shadow: 0 4px 16px rgba(0,0,0,0.06);
            page-break-after: always;
          }
          .gib-page:last-child {
            page-break-after: auto;
          }
          .top-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #fff7ed;
            border: 1px solid #fed7aa;
            padding: 8px 12px;
            border-radius: 6px;
            margin-bottom: 14px;
          }
          .print-btn {
            background: #f27a1a;
            color: #fff;
            border: none;
            padding: 7px 14px;
            border-radius: 5px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
          }
          .print-btn:hover { background: #ea580c; }
          .header-table, .buyer-table, .items-table {
            width: 100%;
            border-collapse: collapse;
          }
          .party-title {
            font-size: 12px;
            font-weight: 800;
            color: #000;
            margin-bottom: 3px;
          }
          .party-line {
            font-size: 9.5px;
            color: #27272a;
            line-height: 1.4;
          }
          .gib-seal {
            width: 155px;
            margin: 0 auto 6px auto;
            border: 2px double #b91c1c;
            border-radius: 50px;
            padding: 6px 8px;
            background: #fffafa;
          }
          .doc-type-title {
            font-size: 14px;
            font-weight: 900;
            color: #18181b;
            margin-top: 2px;
          }
          .qr-box {
            border: 1px solid #27272a;
            padding: 3px;
            display: inline-block;
          }
          .meta-mini-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5px;
          }
          .meta-mini-table th {
            text-align: left;
            padding: 2px 5px;
            border: 1px solid #3f3f46;
            background: #f4f4f5;
            font-weight: 700;
            width: 48%;
          }
          .meta-mini-table td {
            padding: 2px 5px;
            border: 1px solid #3f3f46;
          }
          .buyer-table {
            margin: 8px 0 12px 0;
          }
          .items-table th {
            border: 1px solid #27272a;
            background: #f4f4f5;
            font-size: 9.5px;
            font-weight: 800;
            padding: 6px 5px;
            text-align: center;
          }
          .items-table td {
            border: 1px solid #27272a;
            font-size: 9.5px;
            padding: 6px 5px;
          }
          .totals-table {
            width: 310px;
            border-collapse: collapse;
            font-size: 10px;
          }
          .totals-table th {
            text-align: right;
            padding: 4px 7px;
            border: 1px solid #27272a;
            background: #f4f4f5;
            font-weight: 700;
          }
          .totals-table td {
            text-align: right;
            padding: 4px 7px;
            border: 1px solid #27272a;
            min-width: 95px;
          }
          .payable-row th, .payable-row td {
            background: #fef3c7;
            font-size: 11px;
          }
          @media print {
            body { background: #fff; padding: 0; }
            .gib-page { box-shadow: none; border: none; margin: 0; max-width: 100%; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
    </html>
  `)
  printWindow.document.close()
}

const EfaturaPage = () => {
  const [activeTab, setActiveTab] = useState<"invoices" | "settings">("invoices")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [creatingInvoice, setCreatingInvoice] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  )

  const [invoices, setInvoices] = useState<EfaturaInvoiceRecord[]>([])
  const [creditInfo, setCreditInfo] = useState<TrendyolCreditInfo | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [docTypeFilter, setDocTypeFilter] = useState<"ALL" | "EARSIV" | "EFATURA">("ALL")

  const [showOrderModal, setShowOrderModal] = useState(false)
  const [ordersList, setOrdersList] = useState<any[]>([])
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<string>("")
  const [overrideDocType, setOverrideDocType] = useState<"" | "EARSIV" | "EFATURA">("")

  const [config, setConfig] = useState<EfaturaConfig>({
    active: true,
    environment: "production",
    email: "hakkisahin9@gmail.com",
    password: "",
    companyId: "",
    supplierVkn: "7050600355",
    supplierName: "ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SANAYİ TİCARET LİMİTED ŞİRKETİ",
    supplierTaxOffice: "Güngören Vergi Dairesi Müdürlüğü",
    supplierAddress: "MERKEZ MAH. MUALLİM NACİ SK. MERVE NO: 9 GÜNGÖREN/ İSTANBUL",
    supplierCity: "İstanbul",
    supplierDistrict: "Güngören",
    supplierPhone: "0532 337 00 81",
    supplierEmail: "hakkisahin9@gmail.com",
    supplierMersis: "0705060035500001",
    supplierTicaretSicil: "",
    earchivePrefix: "BKM",
    einvoicePrefix: "EFT",
    defaultVatRate: 20,
    autoSend: false,
    storeWebUrl: "https://bodykitmerkezi.com",
  })

  const fetchEfaturaData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/admin/efatura")
      if (res.ok) {
        const data = await res.json()
        if (data.config) setConfig(data.config)
        if (Array.isArray(data.invoices)) setInvoices(data.invoices)
        if (data.creditInfo) setCreditInfo(data.creditInfo)
      }
    } catch (e) {
      console.error("Failed to fetch e-fatura data:", e)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentOrders = async () => {
    try {
      const res = await fetch(
        "/admin/orders?limit=50&order=-created_at&fields=id,display_id,created_at,total,email,*customer,*shipping_address,*billing_address,metadata"
      )
      if (res.ok) {
        const data = await res.json()
        if (data?.orders) {
          setOrdersList(data.orders)
          if (data.orders.length > 0 && !selectedOrderForInvoice) {
            setSelectedOrderForInvoice(data.orders[0].id)
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchEfaturaData()
    fetchRecentOrders()
  }, [])

  const handleSaveSettings = async () => {
    setSaving(true)
    setFeedback(null)
    try {
      const res = await fetch("/admin/efatura-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      const data = await res.json()
      if (res.ok && data.config) {
        setConfig(data.config)
        setFeedback({
          type: "success",
          message: "Trendyol E-Faturam API ve firma ayarları başarıyla kaydedildi.",
        })
      } else {
        setFeedback({
          type: "error",
          message: data?.error || "Ayarlar kaydedilirken hata oluştu.",
        })
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e?.message || "Bağlantı hatası." })
    } finally {
      setSaving(false)
    }
  }

  const handleTestAndSync = async () => {
    setTesting(true)
    setFeedback(null)
    try {
      const res = await fetch("/admin/efatura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", config }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        if (data.config) {
          setConfig(data.config)
        } else if (data.companyId && data.companyId !== "-") {
          setConfig((prev) => ({ ...prev, companyId: String(data.companyId) }))
        }
        if (data.creditInfo) {
          setCreditInfo(data.creditInfo)
        }
        if (Array.isArray(data.invoices)) {
          setInvoices(data.invoices)
        }
        const creditSummary = data.creditInfo
          ? ` • Kalan Kontör: ${data.creditInfo.remainingCredit} / ${data.creditInfo.totalCredit}`
          : ""
        const invSummary = Array.isArray(data.invoices)
          ? ` • Toplam Belge: ${data.invoices.length} Adet`
          : ""
        setFeedback({
          type: "success",
          message: `${data.message} (Şirket ID: ${data.companyId || "-"} | Kullanıcı ID: ${
            data.userId || "-"
          }${creditSummary}${invSummary})`,
        })
      } else {
        setFeedback({
          type: "error",
          message: data?.error || "Trendyol E-Faturam API bağlantısı doğrulanamadı.",
        })
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e?.message || "Bağlantı testi başarısız." })
    } finally {
      setTesting(false)
    }
  }

  const handlePrintOrDownloadInvoice = async (inv: EfaturaInvoiceRecord) => {
    if (inv.source === "TRENDYOL_API" && inv.uuid) {
      try {
        const res = await fetch("/admin/efatura", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "download",
            uuid: inv.uuid,
            documentType: inv.documentType,
            fileExtension: "pdf",
          }),
        })
        const data = await res.json().catch(() => null)
        if (res.ok && data?.downloadUrl) {
          window.open(data.downloadUrl, "_blank")
          return
        }
      } catch {}
    }
    openGibInvoicePrintWindow([inv], config)
  }

  const handleCreateInvoiceFromOrder = async () => {
    if (!selectedOrderForInvoice) return
    setCreatingInvoice(true)
    setFeedback(null)
    try {
      const res = await fetch("/admin/efatura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          order_id: selectedOrderForInvoice,
          force_recreate: true,
          document_type: overrideDocType || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setInvoices(data.invoices || [])
        setShowOrderModal(false)
        const created = data.created?.[0]
        setFeedback({
          type: "success",
          message: `Fatura başarıyla oluşturuldu: ${created?.invoiceNumber || ""}`,
        })
        if (created) {
          openGibInvoicePrintWindow([created], config)
        }
      } else {
        setFeedback({
          type: "error",
          message: data?.error || "Fatura kesilirken hata oluştu.",
        })
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e?.message || "Bağlantı hatası." })
    } finally {
      setCreatingInvoice(false)
    }
  }

  const handleCancelInvoice = async (invoiceId: string) => {
    if (!confirm("Bu faturayı iptal olarak işaretlemek istediğinize emin misiniz?")) return
    try {
      const res = await fetch("/admin/efatura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", invoice_id: invoiceId }),
      })
      const data = await res.json()
      if (res.ok && data.invoices) {
        setInvoices(data.invoices)
        setFeedback({ type: "success", message: "Fatura iptal edildi." })
      }
    } catch (e) {
      console.error(e)
    }
  }

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (docTypeFilter !== "ALL" && inv.documentType !== docTypeFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchNo = inv.invoiceNumber.toLowerCase().includes(q)
        const matchOrder = inv.orderDisplayId.toLowerCase().includes(q)
        const matchBuyer = inv.buyerName.toLowerCase().includes(q)
        const matchId = inv.buyerIdentifier.toLowerCase().includes(q)
        const matchUuid = inv.uuid.toLowerCase().includes(q)
        if (!matchNo && !matchOrder && !matchBuyer && !matchId && !matchUuid) return false
      }
      return true
    })
  }, [invoices, docTypeFilter, searchQuery])

  const stats = useMemo(() => {
    const activeInvs = invoices.filter((x) => x.status !== "IPTAL")
    const eArchiveCount = activeInvs.filter((x) => x.documentType === "EARSIV").length
    const eInvoiceCount = activeInvs.filter((x) => x.documentType === "EFATURA").length
    const totalRevenue = activeInvs.reduce((acc, x) => acc + (Number(x.totalAmount) || 0), 0)
    const totalVat = activeInvs.reduce((acc, x) => acc + (Number(x.vatAmount) || 0), 0)
    return {
      totalCount: activeInvs.length,
      eArchiveCount,
      eInvoiceCount,
      totalRevenue,
      totalVat,
    }
  }, [invoices])

  const creditPercentage = useMemo(() => {
    if (!creditInfo || !creditInfo.totalCredit) return 0
    return Math.min(100, Math.round((creditInfo.remainingCredit / creditInfo.totalCredit) * 100))
  }, [creditInfo])

  return (
    <div className="bg-zinc-50 min-h-screen text-zinc-800 font-sans pb-16">
      <div className="max-w-[1440px] mx-auto px-6 pt-6 flex flex-col gap-6">
        {/* TOP HEADER BANNER */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-xl shadow-sm shrink-0">
              eF
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg font-extrabold text-zinc-900 tracking-tight">
                  Trendyol E-Faturam & E-Arşiv Entegrasyonu
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-600 border border-orange-200">
                  {config.environment === "stage"
                    ? "Test Ortamı (Stage)"
                    : "Canlı Ortam (Production)"}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    config.email
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {config.email ? `API Aktif (${config.email})` : "GİB UBL Hazır"}
                </span>
                {config.companyId && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Şirket Kodu: {config.companyId}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                <b>{config.supplierName}</b> (VKN: <b>{config.supplierVkn}</b>) • Trendyol E-Faturam hesabınızdaki kalan kontörler ve kesilen faturalar otomatik senkronize edilir.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleTestAndSync}
              disabled={testing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowPath className="w-4 h-4" />
              <span>{testing ? "Senkronize Ediliyor..." : "Kontör & Faturaları Senkronize Et"}</span>
            </button>
            <button
              onClick={() => setShowOrderModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Siparişten Yeni Fatura Kes</span>
            </button>
            <button
              onClick={() => setActiveTab(activeTab === "invoices" ? "settings" : "invoices")}
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              {activeTab === "invoices" ? "⚙️ API & Firma Ayarları" : "📄 Kesilen Faturalar"}
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-zinc-500 hover:text-zinc-800">
              <XMark className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STATS CARDS (INCLUDING KALAN KONTÖR CARD) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* KALAN KONTÖR CARD */}
          <div className="bg-white border-2 border-emerald-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-emerald-700 uppercase">
                Kalan Kontör Adedi
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {creditInfo?.packageName || "Trendyol Kontör"}
              </span>
            </div>
            <div className="text-2xl font-black text-zinc-900 mt-1">
              {creditInfo ? (
                <>
                  <span className="text-emerald-600">{creditInfo.remainingCredit}</span>
                  <span className="text-sm font-bold text-zinc-400">
                    {" "}
                    / {creditInfo.totalCredit}
                  </span>
                </>
              ) : (
                <span className="text-sm font-bold text-zinc-400">
                  Şifre girip senkronize edin
                </span>
              )}
            </div>
            <div className="mt-2">
              <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${creditInfo ? creditPercentage : 0}%` }}
                />
              </div>
              <div className="text-[10px] text-zinc-500 font-semibold mt-1 flex justify-between">
                <span>
                  {creditInfo
                    ? `${creditInfo.usedCredit} / ${creditInfo.totalCredit} Kontör Kullanıldı`
                    : "Trendyol E-Faturam Paketi"}
                </span>
                {creditInfo && <span>%{creditPercentage}</span>}
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">
              Toplam Kesilen Belge
            </span>
            <div className="text-2xl font-black text-zinc-900 mt-1">{stats.totalCount} Adet</div>
            <span className="text-[11px] text-emerald-600 font-semibold">Resmileşen E-Belge</span>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">
              E-Arşiv / E-Fatura Dağılımı
            </span>
            <div className="text-2xl font-black text-zinc-900 mt-1">
              {stats.eArchiveCount} <span className="text-xs font-bold text-zinc-400">E-Arşiv</span>{" "}
              / {stats.eInvoiceCount}{" "}
              <span className="text-xs font-bold text-zinc-400">E-Fatura</span>
            </div>
            <span className="text-[11px] text-zinc-500 font-semibold">Bireysel & Kurumsal</span>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">
              Faturalanan Toplam Tutar
            </span>
            <div className="text-2xl font-black text-zinc-900 mt-1">
              {stats.totalRevenue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
            </div>
            <span className="text-[11px] text-zinc-500 font-semibold">KDV Dahil Genel Toplam</span>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">
              Hesaplanan Toplam KDV
            </span>
            <div className="text-2xl font-black text-orange-600 mt-1">
              {stats.totalVat.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
            </div>
            <span className="text-[11px] text-zinc-500 font-semibold">
              Varsayılan KDV: %{config.defaultVatRate}
            </span>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 border-b border-zinc-200">
          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-5 py-3 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
              activeTab === "invoices"
                ? "border-orange-500 text-orange-600 bg-white rounded-t-xl"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            📄 Kesilen E-Fatura & E-Arşiv Belgeleri ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-5 py-3 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
              activeTab === "settings"
                ? "border-orange-500 text-orange-600 bg-white rounded-t-xl"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            ⚙️ Trendyol E-Faturam API & Firma Ayarları
          </button>
        </div>

        {/* TAB 1: ISSUED INVOICES */}
        {activeTab === "invoices" && (
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-50/50">
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  placeholder="Fatura No, Sipariş No, Müşteri Adı, VKN/TCKN veya ETTN ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full max-w-md bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-orange-500"
                />
                <select
                  value={docTypeFilter}
                  onChange={(e) => setDocTypeFilter(e.target.value as any)}
                  className="bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700"
                >
                  <option value="ALL">Tüm Belgeler</option>
                  <option value="EARSIV">Sadece e-Arşiv Fatura</option>
                  <option value="EFATURA">Sadece e-Fatura (Ticari)</option>
                </select>
              </div>
              <button
                onClick={handleTestAndSync}
                disabled={testing}
                className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowPath className="w-3.5 h-3.5" />
                <span>{testing ? "Senkronize Ediliyor..." : "Trendyol'dan Yenile"}</span>
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs font-bold text-zinc-400">
                Fatura kayıtları ve kontör bilgileri yükleniyor...
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="p-14 text-center flex flex-col items-center gap-3">
                <DocumentText className="w-10 h-10 text-zinc-300" />
                <div className="text-sm font-bold text-zinc-700">
                  Henüz kesilmiş e-Fatura veya e-Arşiv kaydı bulunmuyor.
                </div>
                <p className="text-xs text-zinc-400 max-w-md">
                  Siparişler sayfasındaki <b>e-Fatura</b> butonuna tıklayarak veya yukarıdaki{" "}
                  <b>&ldquo;Siparişten Yeni Fatura Kes&rdquo;</b> butonunu kullanarak hemen fatura
                  oluşturabilirsiniz.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-extrabold text-zinc-600 uppercase">
                      <th className="py-3 px-4">Fatura No / ETTN</th>
                      <th className="py-3 px-4">Belge Türü</th>
                      <th className="py-3 px-4">Sipariş / Ref</th>
                      <th className="py-3 px-4">Alıcı Bilgileri (VKN / TCKN)</th>
                      <th className="py-3 px-4">KDV</th>
                      <th className="py-3 px-4">Genel Toplam</th>
                      <th className="py-3 px-4">Tarih</th>
                      <th className="py-3 px-4">Durum</th>
                      <th className="py-3 px-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-extrabold text-zinc-900">{inv.invoiceNumber}</div>
                          <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                            {inv.uuid}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${
                              inv.documentType === "EFATURA"
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                : "bg-orange-50 text-orange-700 border-orange-200"
                            }`}
                          >
                            {inv.documentType === "EFATURA" ? "e-FATURA" : "e-ARŞİV"}
                          </span>
                          <div className="text-[10px] text-zinc-400 mt-0.5">
                            {inv.invoiceScenario}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-blue-600">
                          #{inv.orderDisplayId}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-zinc-800">{inv.buyerName}</div>
                          <div className="text-[11px] text-zinc-500">
                            {inv.buyerIdentifier?.length === 10 ? "VKN" : "TCKN"}:{" "}
                            {inv.buyerIdentifier}
                            {inv.buyerTaxOffice ? ` • VD: ${inv.buyerTaxOffice}` : ""}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-zinc-700">
                          {inv.vatAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                          <span className="block text-[10px] text-zinc-400">
                            %{inv.vatRate} KDV
                          </span>
                        </td>
                        <td className="py-3 px-4 font-extrabold text-zinc-900">
                          {inv.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                        </td>
                        <td className="py-3 px-4 text-zinc-600">
                          {new Date(inv.issueDate).toLocaleString("tr-TR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                              inv.status === "IPTAL"
                                ? "bg-rose-50 text-rose-600 border-rose-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {inv.status === "IPTAL" ? "İPTAL EDİLDİ" : "RESMİLEŞTİ"}
                          </span>
                          <div className="text-[10px] text-zinc-400 mt-0.5">
                            {inv.source === "TRENDYOL_API" ? "Trendyol API" : "GİB UBL"}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handlePrintOrDownloadInvoice(inv)}
                              className="bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                            >
                              🖨️ PDF / Yazdır
                            </button>
                            {inv.status !== "IPTAL" && (
                              <button
                                onClick={() => handleCancelInvoice(inv.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[11px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
                              >
                                İptal
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRENDYOL E-FATURAM SETTINGS */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API CREDENTIALS CARD */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="border-b border-zinc-100 pb-3">
                <h2 className="text-sm font-extrabold text-zinc-900">
                  1. Trendyol E-Faturam (Trendyol E-Çözüm) API Bilgileri
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Trendyol E-Faturam panelinizdeki giriş / web servis kullanıcı bilgilerinizi girin.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Çalışma Ortamı
                  </label>
                  <select
                    value={config.environment}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        environment: e.target.value as "stage" | "production",
                      })
                    }
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 bg-white"
                  >
                    <option value="production">Canlı Ortam (apigateway.trendyolecozum.com)</option>
                    <option value="stage">
                      Test Ortamı (stage-apigateway.trendyolefaturam.com)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Şirket ID / Firma Kodu (Otomatik Algılanır)
                  </label>
                  <input
                    type="text"
                    value={config.companyId}
                    onChange={(e) => setConfig({ ...config, companyId: e.target.value })}
                    placeholder="Girişte otomatik algılanır"
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Trendyol E-Faturam E-Posta / Kullanıcı Adı
                  </label>
                  <input
                    type="text"
                    value={config.email}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    placeholder="hakkisahin9@gmail.com"
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Trendyol E-Faturam Şifre
                  </label>
                  <input
                    type="password"
                    value={config.password}
                    onChange={(e) => setConfig({ ...config, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    e-Arşiv Seri Ön Eki (3 Karakter)
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={config.earchivePrefix}
                    onChange={(e) =>
                      setConfig({ ...config, earchivePrefix: e.target.value.toUpperCase() })
                    }
                    placeholder="BKM"
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    e-Fatura Seri Ön Eki (3 Karakter)
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={config.einvoicePrefix}
                    onChange={(e) =>
                      setConfig({ ...config, einvoicePrefix: e.target.value.toUpperCase() })
                    }
                    placeholder="EFT"
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Varsayılan KDV Oranı (%)
                  </label>
                  <select
                    value={config.defaultVatRate}
                    onChange={(e) =>
                      setConfig({ ...config, defaultVatRate: Number(e.target.value) })
                    }
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold bg-white"
                  >
                    <option value={20}>%20 KDV (Genel / Oto Aksesuar)</option>
                    <option value={10}>%10 KDV</option>
                    <option value={1}>%1 KDV</option>
                    <option value={0}>%0 KDV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    İnternet Satışı Web Adresi
                  </label>
                  <input
                    type="text"
                    value={config.storeWebUrl}
                    onChange={(e) => setConfig({ ...config, storeWebUrl: e.target.value })}
                    placeholder="https://bodykitmerkezi.com"
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleTestAndSync}
                  disabled={testing}
                  className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  {testing
                    ? "Test Ediliyor ve Kontör/Faturalar Çekiliyor..."
                    : "🔌 Bağlantıyı Test Et ve Kontör / Faturaları Çek"}
                </button>
              </div>
            </div>

            {/* SUPPLIER / SELLER INFO CARD */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="border-b border-zinc-100 pb-3">
                <h2 className="text-sm font-extrabold text-zinc-900">
                  2. Satıcı Firma & Vergi Kimlik Bilgileri (Fatura Üst Bilgisi)
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Kesilen e-Fatura ve e-Arşiv belgelerinde sol üst köşede yer alacak resmi şirket
                  bilgileriniz.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Satıcı Resmi Firma Ünvanı / Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={config.supplierName}
                    onChange={(e) => setConfig({ ...config, supplierName: e.target.value })}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Satıcı VKN / TCKN (10 veya 11 Hane)
                  </label>
                  <input
                    type="text"
                    value={config.supplierVkn}
                    onChange={(e) => setConfig({ ...config, supplierVkn: e.target.value })}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Vergi Dairesi
                  </label>
                  <input
                    type="text"
                    value={config.supplierTaxOffice}
                    onChange={(e) => setConfig({ ...config, supplierTaxOffice: e.target.value })}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Mersis No
                  </label>
                  <input
                    type="text"
                    value={config.supplierMersis}
                    onChange={(e) => setConfig({ ...config, supplierMersis: e.target.value })}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Ticaret Sicil No
                  </label>
                  <input
                    type="text"
                    value={config.supplierTicaretSicil}
                    onChange={(e) =>
                      setConfig({ ...config, supplierTicaretSicil: e.target.value })
                    }
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">İl</label>
                  <input
                    type="text"
                    value={config.supplierCity}
                    onChange={(e) => setConfig({ ...config, supplierCity: e.target.value })}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">İlçe</label>
                  <input
                    type="text"
                    value={config.supplierDistrict}
                    onChange={(e) => setConfig({ ...config, supplierDistrict: e.target.value })}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Açık Adres
                  </label>
                  <input
                    type="text"
                    value={config.supplierAddress}
                    onChange={(e) => setConfig({ ...config, supplierAddress: e.target.value })}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">Telefon</label>
                  <input
                    type="text"
                    value={config.supplierPhone}
                    onChange={(e) => setConfig({ ...config, supplierPhone: e.target.value })}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">E-Posta</label>
                  <input
                    type="text"
                    value={config.supplierEmail}
                    onChange={(e) => setConfig({ ...config, supplierEmail: e.target.value })}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  {saving ? "Kaydediliyor..." : "✔ Tüm Ayarları Kaydet"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: CREATE INVOICE FROM ORDER */}
      {showOrderModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            onClick={() => setShowOrderModal(false)}
          />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
            <div className="bg-orange-500 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-orange-100">
                  Trendyol E-Faturam
                </div>
                <div className="text-sm font-extrabold">Siparişten E-Fatura / E-Arşiv Kes</div>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="text-white">
                <XMark className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">
                  Sipariş Seçin
                </label>
                <select
                  value={selectedOrderForInvoice}
                  onChange={(e) => setSelectedOrderForInvoice(e.target.value)}
                  className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-800 bg-white"
                >
                  {ordersList.map((o) => {
                    const name = `${
                      o.shipping_address?.first_name || o.customer?.first_name || "Müşteri"
                    } ${o.shipping_address?.last_name || o.customer?.last_name || ""}`.trim()
                    const totalTL = ((Number(o.total) || 0) / 100).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })
                    return (
                      <option key={o.id} value={o.id}>
                        #{o.display_id || o.id.slice(-6)} - {name} ({totalTL} TL)
                      </option>
                    )
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">
                  Belge Senaryosu
                </label>
                <select
                  value={overrideDocType}
                  onChange={(e) => setOverrideDocType(e.target.value as any)}
                  className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-800 bg-white"
                >
                  <option value="">
                    Otomatik Algıla (Bireysel → e-Arşiv / Kurumsal VKN → e-Fatura)
                  </option>
                  <option value="EARSIV">e-Arşiv Fatura (EARSIVFATURA)</option>
                  <option value="EFATURA">e-Fatura (TICARIFATURA)</option>
                </select>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-2">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-bold text-zinc-600"
              >
                İptal
              </button>
              <button
                onClick={handleCreateInvoiceFromOrder}
                disabled={creatingInvoice || !selectedOrderForInvoice}
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold cursor-pointer"
              >
                {creatingInvoice ? "Oluşturuluyor..." : "⚡ Faturayı Kes ve Görüntüle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "E-Fatura (Trendyol)",
  icon: DocumentText,
})

export default EfaturaPage
