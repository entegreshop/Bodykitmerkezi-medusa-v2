import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import crypto from "crypto"
import axios from "axios"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { 
        cart_id, 
        cc_owner, 
        cc_number, 
        cc_month, 
        cc_year, 
        cc_cvv,
        client_ip 
    } = req.body as any

    if (!cart_id || !cc_number) {
      return res.status(400).json({ success: false, error: "Eksik parametre" })
    }

    // 1. Fetch Cart
    const query = req.scope.resolve("query")
    const { data: carts } = await query.graph({
      entity: "cart",
      fields: ["id", "email", "total", "shipping_address.*", "billing_address.*", "items.*", "region.*"],
      filters: { id: cart_id }
    })

    const cart = carts[0] as any
    if (!cart) {
      return res.status(404).json({ success: false, error: "Sepet bulunamadı" })
    }

    // 2. Fetch PayTR Keys from Settings
    // @ts-ignore
    const { readConfig } = await import("../../../../admin/payment-settings/route")
    const config = readConfig()
    const paytrConfig = config.paytr || {}

    const merchant_id = paytrConfig.merchant_id
    const merchant_key = paytrConfig.merchant_key
    const merchant_salt = paytrConfig.merchant_salt
    
    if (!merchant_id || !merchant_key || !merchant_salt) {
      return res.status(400).json({ success: false, error: "PayTR API ayarları eksik" })
    }

    // 3. Prepare PayTR Payload
    const user_ip = client_ip || req.headers["x-forwarded-for"] || "1.1.1.1"
    const email = cart.email || "guest@kombingo.com"
    
    // Convert float total to integer string in Kurus
    let payment_amount = Math.round(Number(cart.total))
    const merchant_oid = cart.id.substring(0, 64) // cart_id limit 64 in PayTR
    
    const user_name = `${cart.shipping_address?.first_name || ""} ${cart.shipping_address?.last_name || ""}`.trim() || "Misafir"
    const user_address = `${cart.shipping_address?.address_1 || ""}, ${cart.shipping_address?.city || ""}`.trim() || "Girilmedi"
    const user_phone = cart.shipping_address?.phone || "0000000000"
    
    const currency = (cart.region?.currency_code || "TL").toUpperCase()
    const test_mode = paytrConfig.test_mode === "Açık" ? "1" : "0"
    
    // Basket data needs to be a serialized JSON array of arrays
    const user_basket = cart.items.map((item: any) => [
       item.title.substring(0, 50),
       (Number(item.unit_price) / 100).toFixed(2),
       item.quantity
    ])
    const user_basket_str = Buffer.from(JSON.stringify(user_basket)).toString("base64")
    
    const merchant_ok_url = `${process.env.STORE_CORS || "http://localhost:8000"}/checkout/success?order_id=${merchant_oid}`
    const merchant_fail_url = `${process.env.STORE_CORS || "http://localhost:8000"}/checkout/failed`

    // Direct API specifics
    const payment_type = "card"
    const installment_count = "0"
    const non_3d = "0" // 0 means 3D Secure is REQUIRED (which is highly recommended and standard)

    // 4. Calculate HMAC Hash
    // Hash format for Direct API: merchant_id + user_ip + merchant_oid + email + payment_amount + payment_type + installment_count + currency + test_mode + non_3d + merchant_salt
    const hash_str = merchant_id + user_ip + merchant_oid + email + payment_amount + payment_type + installment_count + currency + test_mode + non_3d + merchant_salt
    const paytr_token = crypto.createHmac("sha256", merchant_key).update(hash_str).digest("base64")

    // 5. Send Request to PayTR Direct API
    const formData = new URLSearchParams()
    formData.append("merchant_id", merchant_id)
    formData.append("user_ip", user_ip)
    formData.append("merchant_oid", merchant_oid)
    formData.append("email", email)
    formData.append("payment_amount", payment_amount.toString())
    formData.append("payment_type", payment_type)
    formData.append("installment_count", installment_count)
    formData.append("currency", currency)
    formData.append("test_mode", test_mode)
    formData.append("non_3d", non_3d)
    formData.append("merchant_ok_url", merchant_ok_url)
    formData.append("merchant_fail_url", merchant_fail_url)
    formData.append("user_name", user_name)
    formData.append("user_address", user_address)
    formData.append("user_phone", user_phone)
    formData.append("user_basket", user_basket_str)
    formData.append("debug_on", "1")
    formData.append("paytr_token", paytr_token)
    
    // Credit Card Details
    formData.append("cc_owner", cc_owner)
    formData.append("cc_number", cc_number)
    formData.append("cc_month", cc_month)
    formData.append("cc_year", cc_year)
    formData.append("cc_cvv", cc_cvv)

    // API URL is /odeme for Direct API
    const response = await axios.post("https://www.paytr.com/odeme", formData.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })

    // If non_3d = 0, PayTR returns a 3D Secure HTML string. If there is an error, it usually returns JSON or a string containing "status":"error"
    let responseData = response.data;
    
    if (typeof responseData === 'object') {
        if (responseData.status === "error") {
            console.error("PayTR Direct API Error:", responseData);
            return res.status(400).json({ success: false, error: responseData.reason || "Kredi kartı işlemi reddedildi." });
        }
    } else if (typeof responseData === 'string') {
        if (responseData.includes('status":"error"')) {
            try {
                const parsed = JSON.parse(responseData);
                return res.status(400).json({ success: false, error: parsed.reason || "İşlem reddedildi." });
            } catch (e) {
                return res.status(400).json({ success: false, error: "Banka iletişiminde hata." });
            }
        }
        
        // It's likely the 3D Secure HTML
        return res.json({ success: true, html: responseData });
    }

    return res.status(400).json({ success: false, error: "Bilinmeyen bir yanıt alındı." })

  } catch (error: any) {
    console.error("PayTR Direct API Endpoint Error:", error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
