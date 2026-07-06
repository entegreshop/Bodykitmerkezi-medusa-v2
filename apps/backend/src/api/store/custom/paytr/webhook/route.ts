import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import crypto from "crypto"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = req.body as any
    const { merchant_oid, status, total_amount, hash, failed_reason_code, failed_reason_msg } = body

    if (!merchant_oid || !status || !hash) {
      return res.status(400).send("OK") // PayTR expects "OK" string to avoid retries even on bad requests
    }

    // 1. Get PayTR Config
    // @ts-ignore
    const { readConfig } = await import("../../../../admin/payment-settings/route")
    const config = readConfig()
    const paytrConfig = config.paytr || {}
    const merchant_key = paytrConfig.merchant_key
    const merchant_salt = paytrConfig.merchant_salt

    if (!merchant_key || !merchant_salt) {
      console.error("PayTR Webhook: Missing API keys in config.")
      return res.status(500).send("OK")
    }

    // 2. Verify Hash
    // PayTR Hash Format: base64(HMAC-SHA256(merchant_oid + merchant_salt + status + total_amount, merchant_key))
    const hashStr = merchant_oid + merchant_salt + status + total_amount
    const calculatedHash = crypto.createHmac("sha256", merchant_key).update(hashStr).digest("base64")

    if (calculatedHash !== hash) {
      console.error("PayTR Webhook: Hash mismatch!", { received: hash, calculated: calculatedHash })
      return res.status(400).send("OK")
    }

    // 3. Process Payment based on status
    if (status === "success") {
      console.log(`PayTR Webhook: Payment SUCCESS for cart/order: ${merchant_oid}`)
      
      try {
        // Complete the cart using Medusa's placeOrderWorkflow or Cart completion logic
        // Since we are in a custom webhook and need to complete the cart safely:
        // @ts-ignore
        const { placeOrderWorkflow } = await import("@medusajs/medusa/core-flows")
        
        // Execute placeOrderWorkflow
        await placeOrderWorkflow(req.scope).run({
          input: { id: merchant_oid }
        })
        
        console.log(`PayTR Webhook: Order placed successfully for ${merchant_oid}`)

      } catch (err: any) {
        console.error("PayTR Webhook: Error completing cart/order:", err)
        // If order already exists or cart is completed, Medusa will throw an error, which is fine to ignore.
      }

    } else {
      console.error(`PayTR Webhook: Payment FAILED for ${merchant_oid}. Reason: ${failed_reason_msg} (${failed_reason_code})`)
      // Handle failed payment (e.g., mark payment session as failed) if necessary.
    }

    // 4. Respond to PayTR
    // IMPORTANT: PayTR requires exact "OK" string response to mark the callback as successfully received.
    return res.status(200).send("OK")

  } catch (error: any) {
    console.error("PayTR Webhook Error:", error)
    return res.status(200).send("OK") // Always send OK to stop retries on critical errors
  }
}
