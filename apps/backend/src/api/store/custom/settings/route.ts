import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"
import os from "os"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const storeModule = req.scope.resolve(Modules.STORE)
  const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
  const store = stores[0]
  
  const settings = store?.metadata || {}
  
  // Read payment settings from JSON
  const configFilePath = path.join(os.homedir(), ".xoox-payment-settings.json")
  if (fs.existsSync(configFilePath)) {
      try {
          const content = fs.readFileSync(configFilePath, "utf-8")
          const parsed = JSON.parse(content)
          
          settings.payment_bank = { active: parsed.bank_transfer?.active }
          settings.payment_paytr = { active: parsed.paytr?.active }
          settings.payment_cod_cc = {
              is_active: parsed.card_on_delivery?.active,
              additional_fee: parsed.card_on_delivery?.adjustment_value,
              min_amount: parsed.card_on_delivery?.min_total
          }
          settings.shipping_settings = {
              standard_rate: 60,
              free_shipping_limit: parsed.free_shipping_threshold,
              free_shipping_enabled: true
          }
      } catch (err) {}
  }
  
  // Enforce the requested copyright string text from user payload
  settings["footer-telif"] = "Tüm bilgileriniz 256bit SSL Sertifikası ile korunmaktadır.\n© 2026 XOOX.com Tüm Hakları Saklıdır"

  res.json({ settings })
}
