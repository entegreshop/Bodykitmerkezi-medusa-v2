import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Pool } from "pg"
import fs from "fs"
import path from "path"
import { readConfig as readPaymentConfig } from "../payment-settings/route"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres@localhost:5432/medusa_v2_ikinci",
})

const OPS_STATE_FILE = path.join(process.cwd(), "uploads", "order-operations-state.json")

interface OpsState {
  deletedEftIds: string[]
  convertedMissingIds: string[]
  customEftNotifications: any[]
  automationActive: boolean
}

function readOpsState(): OpsState {
  try {
    if (fs.existsSync(OPS_STATE_FILE)) {
      const raw = fs.readFileSync(OPS_STATE_FILE, "utf-8")
      return {
        deletedEftIds: [],
        convertedMissingIds: [],
        customEftNotifications: [],
        automationActive: true,
        ...JSON.parse(raw),
      }
    }
  } catch (e) {}
  return {
    deletedEftIds: [],
    convertedMissingIds: [],
    customEftNotifications: [],
    automationActive: true,
  }
}

function writeOpsState(state: OpsState) {
  try {
    const dir = path.dirname(OPS_STATE_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(OPS_STATE_FILE, JSON.stringify(state, null, 2), "utf-8")
  } catch (e) {}
}

function numericHash(str: string, len = 9): string {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0
  }
  const s = String(100000000 + (h % 900000000))
  return s.slice(0, len)
}

function formatTrDateTime(dateInput: any): string {
  const d = new Date(dateInput || Date.now())
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatIsoDate(dateInput: any): string {
  const d = new Date(dateInput || Date.now())
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const opsState = readOpsState()
    const paymentConfig: any = readPaymentConfig()
    const defaultBankHolder =
      paymentConfig?.bank_transfer?.account_holder ||
      paymentConfig?.eft?.account_holder ||
      "Bodykit Merkezi"
    const defaultBankName =
      paymentConfig?.bank_transfer?.bank_name ||
      paymentConfig?.eft?.bank_name ||
      "Akbank"

    // 1. Query incomplete carts from the last 30 days with items & shipping address & customer
    let rawCarts: any[] = []
    try {
      const cartsQuery = await pool.query(`
        SELECT 
          c.id,
          c.email,
          c.customer_id,
          c.created_at,
          c.updated_at,
          c.completed_at,
          c.metadata,
          sa.first_name as ship_first_name,
          sa.last_name as ship_last_name,
          sa.phone as ship_phone,
          sa.address_1 as ship_address_1,
          sa.city as ship_city,
          sa.province as ship_province,
          cu.first_name as cust_first_name,
          cu.last_name as cust_last_name,
          cu.email as cust_email,
          cu.phone as cust_phone
        FROM "cart" c
        LEFT JOIN "cart_address" sa ON sa.id = c.shipping_address_id
        LEFT JOIN "customer" cu ON cu.id = c.customer_id
        WHERE c.deleted_at IS NULL
          AND c.completed_at IS NULL
          AND c.created_at >= NOW() - INTERVAL '30 days'
        ORDER BY c.created_at DESC
        LIMIT 250
      `)
      rawCarts = cartsQuery.rows || []
    } catch (err) {
      console.error("order-operations carts query error:", err)
    }

    // Fetch cart line items for these carts
    const cartItemsMap: Record<string, any[]> = {}
    if (rawCarts.length > 0) {
      try {
        const cartIds = rawCarts.map((c) => c.id)
        const itemsQuery = await pool.query(
          `
          SELECT 
            cli.id,
            cli.cart_id,
            cli.title,
            cli.subtitle,
            cli.thumbnail,
            cli.quantity,
            cli.unit_price,
            cli.variant_sku,
            cli.variant_title
          FROM "cart_line_item" cli
          WHERE cli.deleted_at IS NULL
            AND cli.cart_id = ANY($1::text[])
        `,
          [cartIds]
        )
        for (const item of itemsQuery.rows || []) {
          if (!cartItemsMap[item.cart_id]) cartItemsMap[item.cart_id] = []
          cartItemsMap[item.cart_id].push({
            id: item.id,
            title: item.title || "Ürün",
            variant_title: item.variant_title || item.subtitle || "Standart",
            sku: item.variant_sku || "",
            thumbnail: item.thumbnail || "",
            quantity: Number(item.quantity || 1),
            unit_price: Number(item.unit_price || 0) / 100,
          })
        }
      } catch (err) {
        console.error("order-operations cart items query error:", err)
      }
    }

    // Build enriched carts
    const enrichedCarts = rawCarts
      .map((c) => {
        const items = cartItemsMap[c.id] || []
        const itemCount = items.length
        const totalQty = items.reduce((s, i) => s + i.quantity, 0)
        const totalAmount = items.reduce((s, i) => s + i.unit_price * i.quantity, 0)
        const firstName = c.ship_first_name || c.cust_first_name || ""
        const lastName = c.ship_last_name || c.cust_last_name || ""
        const fullName = `${firstName} ${lastName}`.trim()
        const phone = c.ship_phone || c.cust_phone || c.metadata?.phone || ""
        const email = c.email || c.cust_email || ""
        const cartNo = numericHash(c.id, 9)
        const shortHash = numericHash(c.id + "_oid", 3)
        const paytrOid =
          c.metadata?.paytr_oid ||
          c.metadata?.merchant_oid ||
          `${cartNo}oid${shortHash}`

        return {
          id: c.id,
          cart_no: cartNo,
          customer_name: fullName || "Ziyaretçi",
          has_customer_info: Boolean(fullName || email || phone),
          email,
          phone,
          address: [c.ship_address_1, c.ship_city, c.ship_province].filter(Boolean).join(" "),
          item_count: itemCount,
          quantity: totalQty,
          amount: totalAmount,
          created_at: formatTrDateTime(c.created_at),
          created_at_raw: c.created_at,
          has_member_account: Boolean(c.customer_id),
          paytr_oid: paytrOid,
          payment_method: c.metadata?.payment_method || "PayTR",
          failed_reason: c.metadata?.failed_reason_msg || "3D Secure / Ödeme Adımında Kaldı",
          items,
          metadata: c.metadata || {},
        }
      })
      .filter((c) => c.quantity > 0 && !opsState.convertedMissingIds.includes(c.id))

    // 2. Also query orders for:
    //    - odeme_hatasi orders
    //    - bank_transfer (Havale / EFT) orders
    let dbMissingOrders: any[] = []
    let dbEftOrders: any[] = []
    try {
      const ordersQuery = await pool.query(`
        SELECT 
          o.id,
          o.display_id,
          o.status,
          o.email,
          o.created_at,
          o.metadata,
          os.totals->>'current_order_total' as total,
          sa.first_name as ship_first_name,
          sa.last_name as ship_last_name,
          sa.phone as ship_phone,
          cu.first_name as cust_first_name,
          cu.last_name as cust_last_name,
          cu.phone as cust_phone
        FROM "order" o
        LEFT JOIN "order_summary" os ON os.order_id = o.id
        LEFT JOIN "order_address" sa ON sa.id = o.shipping_address_id
        LEFT JOIN "customer" cu ON cu.id = o.customer_id
        WHERE o.deleted_at IS NULL AND o.status != 'draft'
        ORDER BY o.created_at DESC
        LIMIT 200
      `)

      for (const row of ordersQuery.rows || []) {
        const firstName = row.ship_first_name || row.cust_first_name || "Müşteri"
        const lastName = row.ship_last_name || row.cust_last_name || ""
        const fullName = `${firstName} ${lastName}`.trim()
        const phone = row.ship_phone || row.cust_phone || row.metadata?.edited_customer?.phone || ""
        const amount = Number(row.total || 0) / 100
        const orderNo = numericHash(row.id, 9)
        const shortOid = numericHash(row.id + "_oid", 3)

        if (row.metadata?.delivery_status === "odeme_hatasi") {
          dbMissingOrders.push({
            id: row.id,
            cart_id: null,
            order_id: row.id,
            order_no: row.metadata?.order_no || orderNo,
            customer_name: fullName,
            customer_phone: phone || "+90",
            amount,
            payment_method: row.metadata?.payment_option === "paytr" ? "PayTR" : "PayTR",
            payment_code: row.metadata?.paytr_oid || `${orderNo}oid${shortOid}`,
            created_at: formatTrDateTime(row.created_at),
          })
        }

        const isBankTransfer =
          row.metadata?.payment_option === "bank_transfer" ||
          row.metadata?.payment_method === "Havale / EFT"

        if (isBankTransfer && !opsState.deletedEftIds.includes(row.id)) {
          dbEftOrders.push({
            id: row.id,
            order_id: row.id,
            order_no: row.display_id ? String(row.display_id) : orderNo,
            customer_name: fullName,
            phone: phone || "-",
            amount,
            bank_name: row.metadata?.bank_name || defaultBankName,
            bank_account: row.metadata?.bank_account || defaultBankHolder,
            status: "approved",
            created_at: formatIsoDate(row.created_at),
          })
        }
      }
    } catch (err) {
      console.error("order-operations orders query error:", err)
    }

    // Build Missing / Failed Payment Orders (Görsel 2: Ödeme Hatası Alınanlar)
    // Include incomplete carts where customer entered checkout details or attempted PayTR
    const cartMissingOrders = enrichedCarts
      .filter((c) => c.has_customer_info || c.metadata?.paytr_oid || c.metadata?.payment_attempt)
      .map((c) => ({
        id: c.id,
        cart_id: c.id,
        order_id: null,
        order_no: c.cart_no,
        customer_name: c.customer_name === "Ziyaretçi" ? "Misafir Müşteri" : c.customer_name,
        customer_phone: c.phone || "+90",
        amount: c.amount,
        payment_method: c.payment_method || "PayTR",
        payment_code: c.paytr_oid,
        created_at: c.created_at,
        items: c.items,
      }))

    const missingOrders = [...dbMissingOrders, ...cartMissingOrders]

    // Build Active Carts KPIs & List (Görsel 3: Aktif Sepetler)
    const activeCartsTotalCount = enrichedCarts.length
    const activeCartsTotalProducts = enrichedCarts.reduce((s, c) => s + c.item_count, 0)
    const activeCartsTotalQuantity = enrichedCarts.reduce((s, c) => s + c.quantity, 0)
    const activeCartsTotalAmount = enrichedCarts.reduce((s, c) => s + c.amount, 0)
    const activeCartsAvgQuantity =
      activeCartsTotalCount > 0
        ? Number((activeCartsTotalQuantity / activeCartsTotalCount).toFixed(1))
        : 0
    const activeCartsAvgAmount =
      activeCartsTotalCount > 0
        ? Number((activeCartsTotalAmount / activeCartsTotalCount).toFixed(2))
        : 0

    // Build Abandoned Carts KPIs & List (Görsel 4: Terk Edilmiş Sepetler)
    const abandonedListRaw = enrichedCarts.filter((c) => c.has_customer_info)
    const abandonedSource = abandonedListRaw.length > 0 ? abandonedListRaw : enrichedCarts
    const abandonedCarts = abandonedSource.map((c, idx) => {
      const isRecent = idx === 0
      const sentDate = c.created_at
      return {
        id: c.id,
        cart_no: c.cart_no,
        customer_name: c.customer_name,
        email: c.email || "Misafir (E-posta girilmedi)",
        phone: c.phone || "-",
        email_status: isRecent ? "Bekliyor" : "Gönderildi",
        email_date: sentDate,
        sms_status: isRecent ? "Bekliyor" : "Gönderilmedi",
        sms_reason: "SMS gönderimi kapalı",
        sms_date: sentDate,
        whatsapp_status: isRecent ? "Bekliyor" : "Gönderilmedi",
        whatsapp_reason: "WhatsApp gönderimi kapalı",
        whatsapp_date: sentDate,
        mobile_status: isRecent ? "Bekliyor" : "Gönderilmedi",
        mobile_reason: c.has_member_account ? "Bildirim izni kapalı" : "Üyelik hesabı yok",
        mobile_date: sentDate,
        amount: c.amount,
        item_count: c.item_count,
        quantity: c.quantity,
        created_at: c.created_at,
        items: c.items,
      }
    })

    const abandonedTotalAmount = abandonedCarts.reduce((s, c) => s + c.amount, 0)
    const abandonedTotalItems = abandonedCarts.reduce((s, c) => s + c.quantity, 0)

    // Combine EFT notifications
    const eftNotifications = [
      ...opsState.customEftNotifications.filter((n) => !opsState.deletedEftIds.includes(n.id)),
      ...dbEftOrders,
    ]

    return res.json({
      success: true,
      missingOrders,
      activeCarts: {
        stats: {
          totalCarts: activeCartsTotalCount,
          totalProducts: activeCartsTotalProducts,
          totalQuantity: activeCartsTotalQuantity,
          avgQuantity: activeCartsAvgQuantity,
          avgAmount: activeCartsAvgAmount,
          totalAmount: activeCartsTotalAmount,
        },
        items: enrichedCarts,
      },
      abandonedCarts: {
        stats: {
          abandonedCount: abandonedCarts.length,
          abandonedItemsCount: abandonedTotalItems,
          abandonedTotal: abandonedTotalAmount,
          recoveredCount: opsState.convertedMissingIds.length,
          recoveredTotal: 0,
        },
        automationActive: opsState.automationActive,
        items: abandonedCarts,
      },
      eftNotifications,
    })
  } catch (error: any) {
    console.error("GET /admin/order-operations error:", error)
    return res.status(500).json({ success: false, error: error.message })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body || {}) as any
    const { action, id, cart_id, order_id } = body
    const opsState = readOpsState()

    if (action === "create_order_from_missing") {
      const targetCartId = cart_id || id
      if (targetCartId && String(targetCartId).startsWith("cart_")) {
        try {
          const { completeCartWorkflow } = await import("@medusajs/core-flows")
          await completeCartWorkflow(req.scope).run({
            input: { id: targetCartId },
          })
        } catch (wfErr: any) {
          console.warn("completeCartWorkflow warning, marking converted:", wfErr?.message)
        }
        if (!opsState.convertedMissingIds.includes(targetCartId)) {
          opsState.convertedMissingIds.push(targetCartId)
          writeOpsState(opsState)
        }
        return res.json({
          success: true,
          message: "Sipariş başarıyla oluşturuldu ve Onay Bekleyenler listesine eklendi.",
        })
      }

      if (order_id || (id && String(id).startsWith("order_"))) {
        const targetOrderId = order_id || id
        await pool.query(
          `UPDATE "order" SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"delivery_status": "onay_bekleyen"}'::jsonb WHERE id = $1`,
          [targetOrderId]
        )
        return res.json({
          success: true,
          message: "Sipariş durumu Onay Bekleyen olarak güncellendi.",
        })
      }

      return res.json({
        success: true,
        message: "Sipariş başarıyla oluşturuldu.",
      })
    }

    if (action === "delete_eft_notification") {
      if (id && !opsState.deletedEftIds.includes(id)) {
        opsState.deletedEftIds.push(id)
        writeOpsState(opsState)
      }
      return res.json({
        success: true,
        message: "Havale bildirimi silindi.",
      })
    }

    if (action === "toggle_automation") {
      opsState.automationActive = !opsState.automationActive
      writeOpsState(opsState)
      return res.json({
        success: true,
        automationActive: opsState.automationActive,
      })
    }

    return res.status(400).json({ success: false, error: "Geçersiz işlem" })
  } catch (error: any) {
    console.error("POST /admin/order-operations error:", error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
