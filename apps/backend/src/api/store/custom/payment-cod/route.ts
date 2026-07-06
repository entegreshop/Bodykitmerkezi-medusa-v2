import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"
import os from "os"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const configFilePath = path.join(os.homedir(), ".xoox-payment-settings.json")
    let codSettings = { is_active: false, additional_fee: "0", min_amount: "0" }
    
    if (fs.existsSync(configFilePath)) {
      const content = fs.readFileSync(configFilePath, "utf-8")
      const parsed = JSON.parse(content)
      
      if (parsed.cash_on_delivery) {
          codSettings = {
              is_active: parsed.cash_on_delivery.active,
              additional_fee: parsed.cash_on_delivery.adjustment_value?.toString() || "0",
              min_amount: parsed.cash_on_delivery.min_total?.toString() || "0"
          }
      }
    }

    res.json({ success: true, settings: codSettings })

  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}
