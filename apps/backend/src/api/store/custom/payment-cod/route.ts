import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { readConfig as readPaymentConfig } from "../../../admin/payment-settings/route"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const parsed = readPaymentConfig()
    const codSettings = {
      is_active: Boolean(parsed.cash_on_delivery?.active),
      additional_fee: (parsed.cash_on_delivery?.adjustment_value ?? 0).toString(),
      min_amount: (parsed.cash_on_delivery?.max_total ?? 10000).toString()
    }

    res.json({ success: true, settings: codSettings })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

