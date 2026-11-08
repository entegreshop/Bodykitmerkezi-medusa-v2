import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import * as fs from "fs"
import * as os from "os"
import * as path from "path"

const SETTINGS_FILE = path.join(process.cwd(), "uploads", "efatura-settings.json")
const BACKUP_SETTINGS_FILE = path.join(os.tmpdir(), "bkm-medusa-efatura-settings.json")

const INVOICES_FILE = path.join(process.cwd(), "uploads", "efatura-invoices.json")
const BACKUP_INVOICES_FILE = path.join(os.tmpdir(), "bkm-medusa-efatura-invoices.json")

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
  buyerIdentifier: string // TCKN (11) or VKN (10)
  buyerTaxOffice: string
  buyerAddress: string
  buyerCity: string
  buyerDistrict: string
  buyerEmail: string
  buyerPhone: string
  currencyCode: string
  subtotalAmount: number // TL
  vatRate: number
  vatAmount: number // TL
  discountAmount: number // TL
  totalAmount: number // TL
  paymentMethod: string
  carrierName: string
  storeWebUrl: string
  items: Array<{
    title: string
    sku: string
    quantity: number
    unitPrice: number // TL (KDV Dahil)
    netUnitPrice: number // TL (KDV Hariç)
    vatRate: number
    vatAmount: number // TL
    totalAmount: number // TL
  }>
  trendyolResponse?: any
  createdAt: string
}

export const DEFAULT_EFATURA_CONFIG: EfaturaConfig = {
  active: true,
  environment: "production",
  email: process.env.TRENDYOL_EFATURA_EMAIL || "hakkisahin9@gmail.com",
  password: process.env.TRENDYOL_EFATURA_PASSWORD || "",
  companyId: process.env.TRENDYOL_EFATURA_COMPANY_ID || "",
  supplierVkn: process.env.TRENDYOL_EFATURA_VKN || "7050600355",
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
}

export function readEfaturaConfig(): EfaturaConfig {
  for (const filePath of [SETTINGS_FILE, BACKUP_SETTINGS_FILE]) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8")
        const parsed = JSON.parse(raw)
        return { ...DEFAULT_EFATURA_CONFIG, ...parsed }
      }
    } catch (e) {
      console.error("[efatura-settings] Read error:", e)
    }
  }
  return { ...DEFAULT_EFATURA_CONFIG }
}

export function writeEfaturaConfig(config: EfaturaConfig): EfaturaConfig {
  const merged: EfaturaConfig = {
    ...DEFAULT_EFATURA_CONFIG,
    ...config,
    earchivePrefix: (config.earchivePrefix || "BKM").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3).padEnd(3, "A"),
    einvoicePrefix: (config.einvoicePrefix || "EFT").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3).padEnd(3, "A"),
    defaultVatRate: Number(config.defaultVatRate) || 20,
  }

  for (const filePath of [SETTINGS_FILE, BACKUP_SETTINGS_FILE]) {
    try {
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), "utf-8")
    } catch (e) {
      console.error("[efatura-settings] Write error:", e)
    }
  }

  return merged
}

export function readEfaturaInvoices(): EfaturaInvoiceRecord[] {
  for (const filePath of [INVOICES_FILE, BACKUP_INVOICES_FILE]) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8")
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (e) {
      console.error("[efatura-invoices] Read error:", e)
    }
  }
  return []
}

export function saveEfaturaInvoice(record: EfaturaInvoiceRecord): EfaturaInvoiceRecord[] {
  const existing = readEfaturaInvoices()
  const idx = existing.findIndex((x) => x.orderId === record.orderId || x.id === record.id)
  if (idx >= 0) {
    existing[idx] = record
  } else {
    existing.unshift(record)
  }

  for (const filePath of [INVOICES_FILE, BACKUP_INVOICES_FILE]) {
    try {
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), "utf-8")
    } catch (e) {
      console.error("[efatura-invoices] Write error:", e)
    }
  }

  return existing
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const config = readEfaturaConfig()
  res.json({ config })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const current = readEfaturaConfig()
    const body = (req.body as Partial<EfaturaConfig>) || {}
    const updated = writeEfaturaConfig({ ...current, ...body })
    res.json({ config: updated, success: true })
  } catch (e: any) {
    res.status(400).json({ error: e?.message || "Ayarlar kaydedilemedi" })
  }
}
