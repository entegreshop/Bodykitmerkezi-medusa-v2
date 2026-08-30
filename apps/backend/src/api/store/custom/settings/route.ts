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
  const configFilePath = path.join(process.cwd(), "uploads", "payment-settings.json")
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
          // Default to payment settings threshold if shipping settings not found
          settings.shipping_settings = {
              standard_rate: 60,
              free_shipping_limit: parsed.free_shipping_threshold,
              free_shipping_enabled: true
          }
      } catch (err) {}
  }

  // Read shipping settings from JSON
  const shippingConfigPath = path.join(process.cwd(), "uploads", "shipping-settings.json")
  if (fs.existsSync(shippingConfigPath)) {
      try {
          const content = fs.readFileSync(shippingConfigPath, "utf-8")
          const parsed = JSON.parse(content)
          
          // Override shipping settings with values from the custom Kargo Ayarları panel
          settings.shipping_settings = {
              ...settings.shipping_settings, // keep fallback values if any
              standard_rate: parsed.standardShippingFee !== undefined ? parsed.standardShippingFee : 60,
              free_shipping_limit: parsed.freeShippingThreshold !== undefined ? parsed.freeShippingThreshold : settings.shipping_settings?.free_shipping_limit,
              free_shipping_enabled: parsed.freeShippingEnabled !== undefined ? parsed.freeShippingEnabled : true
          }
      } catch (err) {}
  }
  
  // Read logo settings from JSON
  const logoConfigFilePath = path.join(process.cwd(), "uploads", "logo-config.json")
  if (fs.existsSync(logoConfigFilePath)) {
      try {
          const content = fs.readFileSync(logoConfigFilePath, "utf-8")
          const parsed = JSON.parse(content)
          settings.admin_logos = {
              main: parsed.checkoutLogo || parsed.logo
          }
      } catch (err) {}
  }
  
  // Enforce the requested copyright string text from user payload
  settings["footer-telif"] = "Tüm bilgileriniz 256bit SSL Sertifikası ile korunmaktadır.\n© 2026 XOOX.com Tüm Hakları Saklıdır"

  res.json({ settings })
}
