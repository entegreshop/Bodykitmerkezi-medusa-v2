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

    // 2. Fetch PayTR Keys from Settings directly using fs
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
        console.error("Could not read payment settings", e)
    }

    const merchant_id = paytrConfig.merchant_id
    const merchant_key = paytrConfig.merchant_key
    const merchant_salt = paytrConfig.merchant_salt
    
    if (!merchant_id || !merchant_key || !merchant_salt) {
      return res.status(400).json({ success: false, error: "PayTR API ayarları eksik" })
    }

    // 3. Prepare PayTR Payload
    const user_ip = client_ip || req.headers["x-forwarded-for"] || "1.1.1.1"
    const email = cart.email || "guest@kombingo.com"
    
    // Convert kurus total to decimal string (e.g. 2809.00)
    let payment_amount = (Number(cart.total) / 100).toFixed(2)
    
    // PayTR Direct API requires merchant_oid to be STRICTLY alphanumeric (no underscores like 'cart_')
    const merchant_oid = cart.id.replace("cart_", "").substring(0, 64)
    
    const user_name = `${cart.shipping_address?.first_name || ""} ${cart.shipping_address?.last_name || ""}`.trim() || "Misafir"
    const user_address = `${cart.shipping_address?.address_1 || ""}, ${cart.shipping_address?.city || ""}`.trim() || "Girilmedi"
    const user_phone = cart.shipping_address?.phone || "0000000000"
    
    const currency = "TL" // PayTR expects 'TL' rather than 'TRY' in some cases
    // handle encoding issues with 'Açık' by checking english chars or first letter
    const test_mode = (paytrConfig.test_mode && paytrConfig.test_mode.startsWith("A")) ? "1" : "0"
    
    // Basket data needs to be a serialized JSON array of arrays
    const user_basket = cart.items.map((item: any) => [
       item.title.substring(0, 50),
       (Number(item.unit_price) / 100).toFixed(2),
       item.quantity
    ])
    const user_basket_str = Buffer.from(JSON.stringify(user_basket)).toString("base64")
    
    const storeUrl = process.env.STORE_URL || (process.env.STORE_CORS ? process.env.STORE_CORS.split(",")[0] : "https://bodykitmerkezi.com")
    
    // The user will be redirected via POST from PayTR. 
    // We point to a Next.js API route so it can accept the POST and redirect via GET.
    const merchant_ok_url = `${storeUrl}/api/paytr/callback?status=success&cart_id=cart_${merchant_oid}`
    const merchant_fail_url = `${storeUrl}/api/paytr/callback?status=fail`

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
    formData.append("card_number", cc_number)
    formData.append("expiry_month", cc_month)
    formData.append("expiry_year", cc_year)
    formData.append("cvv", cc_cvv)

    // 5. INSTEAD of posting from the backend (which breaks PayTR's 3D Secure relative HTML paths), 
    // we must return the form parameters to the frontend. PayTR documentation STRICTLY requires 
    // the POST request to be made directly from the user's browser to https://www.paytr.com/odeme.
    const formParams = {
        merchant_id,
        user_ip,
        merchant_oid,
        email,
        payment_amount: payment_amount.toString(),
        payment_type,
        installment_count,
        currency,
        test_mode,
        non_3d,
        merchant_ok_url,
        merchant_fail_url,
        user_name,
        user_address,
        user_phone,
        user_basket: user_basket_str,
        debug_on: "1",
        paytr_token,
        cc_owner,
        card_number: cc_number,
        expiry_month: cc_month,
        expiry_year: cc_year,
        cvv: cc_cvv
    };

    return res.json({ 
        success: true, 
        requiresDirectHtml: false,
        requiresClientPost: true,
        postUrl: "https://www.paytr.com/odeme",
        formParams 
    });

  } catch (error: any) {
    console.error("PayTR Direct API Endpoint Error:", error)
    return res.status(400).json({ success: false, error: error.message || "Bilinmeyen bir hata oluştu" })
  }
}
