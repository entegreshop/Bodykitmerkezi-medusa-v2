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
    const fs = require("fs")
    const path = require("path")
    let paytrConfig: any = {}
    
    try {
        const SETTINGS_FILE_PATH = path.join(process.cwd(), "uploads", "payment-settings.json")
        if (fs.existsSync(SETTINGS_FILE_PATH)) {
            const fileContent = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8")
            const config = JSON.parse(fileContent)
            paytrConfig = config.paytr || {}
        }
    } catch(e) {
        console.error("Could not read payment settings in webhook", e)
    }

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
        const original_id = merchant_oid.substring(0, 26)
        const cart_id = "cart_" + original_id

        const query = req.scope.resolve("query")
        const { data: carts } = await query.graph({
          entity: "cart",
          fields: ["id", "total", "completed_at"],
          filters: { id: cart_id }
        })
        const cart = carts[0]

        if (!cart) {
          console.error(`PayTR Webhook: Cart ${cart_id} not found.`)
          return res.status(200).send("OK")
        }

        if (cart.completed_at) {
          console.log(`PayTR Webhook: Cart ${cart_id} already completed (Idempotent).`)
          return res.status(200).send("OK")
        }

        // Amount verification
        // PayTR sends total_amount as integer kurus. cart.total is also integer minor units.
        const expectedTotal = Number(cart.total)
        const receivedTotal = Number(total_amount)
        if (expectedTotal !== receivedTotal) {
          console.error(`PayTR Webhook: Amount mismatch! Cart total: ${expectedTotal}, PayTR: ${receivedTotal}`)
          return res.status(200).send("OK")
        }

        // Complete the cart using Medusa's completeCartWorkflow
        // @ts-ignore
        const { completeCartWorkflow } = await import("@medusajs/core-flows")
        
        await completeCartWorkflow(req.scope).run({
          input: { id: cart_id }
        })
        
        console.log(`PayTR Webhook: Order placed successfully for ${merchant_oid}`)

      } catch (err: any) {
        console.error("PayTR Webhook: Error completing cart/order:", err)
        
        // Write the error to a file so we can debug it
        try {
            const fs = require("fs")
            const path = require("path")
            const LOGS_FILE_PATH = path.join(process.cwd(), "uploads", "paytr-error.log")
            const errorMsg = `[${new Date().toISOString()}] Error for cart ${merchant_oid}: ${err.message}\nStack: ${err.stack}\n\n`
            fs.appendFileSync(LOGS_FILE_PATH, errorMsg)
        } catch(fileErr) {
            console.error("Could not write to error log file", fileErr)
        }
        
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
