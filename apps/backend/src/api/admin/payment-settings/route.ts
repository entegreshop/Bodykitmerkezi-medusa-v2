import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"
import os from "os"

const configFilePath = path.join(os.homedir(), ".xoox-payment-settings.json")

const defaultInstallments = [
  { taksit: "Tek Çekim", oran: 0, active: true },
  { taksit: "2 Taksit", oran: 7.31, active: true },
  { taksit: "3 Taksit", oran: 9.35, active: true },
  { taksit: "4 Taksit", oran: 11.38, active: true },
  { taksit: "5 Taksit", oran: 13.43, active: true },
  { taksit: "6 Taksit", oran: 15.46, active: true },
  { taksit: "7 Taksit", oran: 17.49, active: true },
  { taksit: "8 Taksit", oran: 18.53, active: true },
  { taksit: "9 Taksit", oran: 21.58, active: true },
  { taksit: "10 Taksit", oran: 23.8, active: true },
  { taksit: "11 Taksit", oran: 25.84, active: true },
  { taksit: "12 Taksit", oran: 27.68, active: true }
]

const defaultData = {
  free_shipping_threshold: 3000,
  paytr: {
    active: true,
    min_total: 0,
    max_total: 100000,
    merchant_id: "647433",
    merchant_key: "Xon89DCuBQGLIM7",
    merchant_salt: "tXX2UJMk5CZrBke4",
    test_mode: "Kapalı",
    disable_3d_secure_intl: false,
    installments: defaultInstallments
  },
  bank_transfer: {
    active: true,
    name: "Havale / EFT",
    adjustment_type: "discount_percentage", // "none", "discount_percentage", "surcharge_amount"
    adjustment_value: 5,
    instructions: "Havale - EFT ile şimdi ödemeyi gönder. Sonra siparişi tamamla...\n\nÖdeme Bilgileri\nTR77 0011 1000 0000 0146 7748 72\n\nHesap Sahibi: NUH ŞAHİN\nHesap Bilgisi: Finans Bank",
    min_total: 0,
    max_total: 100000
  },
  cash_on_delivery: {
    active: true,
    name: "Kapıda Ödeme (Nakit)",
    adjustment_type: "surcharge_amount",
    adjustment_value: 40,
    instructions: "Kapıda nakit ödeme ile teslimat sırasında ödemenizi yapabilirsiniz.",
    min_total: 0,
    max_total: 10000
  },
  card_on_delivery: {
    active: true,
    name: "Kapıda Ödeme (Kredi Kartı)",
    adjustment_type: "surcharge_amount",
    adjustment_value: 40,
    instructions: "Kapıda kredi kartı ödemesi ile teslimat sırasında kartınızla ödemenizi yapabilirsiniz.",
    min_total: 0,
    max_total: 10000
  }
}

export function readConfig() {
  try {
    if (fs.existsSync(configFilePath)) {
      const content = fs.readFileSync(configFilePath, "utf-8")
      const parsed = JSON.parse(content)
      return {
        ...defaultData,
        ...parsed,
        paytr: { ...defaultData.paytr, ...(parsed.paytr || {}) },
        bank_transfer: { ...defaultData.bank_transfer, ...(parsed.bank_transfer || {}) },
        cash_on_delivery: { ...defaultData.cash_on_delivery, ...(parsed.cash_on_delivery || {}) },
        card_on_delivery: { ...defaultData.card_on_delivery, ...(parsed.card_on_delivery || {}) }
      }
    }
  } catch (err) {
    console.error("Error reading payment config in admin api:", err)
  }
  return defaultData
}

function writeConfig(data: any) {
  try {
    fs.writeFileSync(configFilePath, JSON.stringify(data, null, 2), "utf-8")
    return true
  } catch (err) {
    console.error("Error writing payment config in admin api:", err)
    return false
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const config = readConfig()
  res.json({ config })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as any
  const success = writeConfig(body)
  if (success) {
    res.json({ success: true, config: body })
  } else {
    res.status(500).json({ success: false, message: "Could not write configuration" })
  }
}
