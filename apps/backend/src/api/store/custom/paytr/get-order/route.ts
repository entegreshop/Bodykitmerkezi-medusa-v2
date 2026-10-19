import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const cartId = req.query.cart_id as string
    if (!cartId) {
      return res.status(400).json({ success: false, error: "cart_id parametresi gerekli" })
    }

    const query = req.scope.resolve("query")
    
    // In Medusa v2, we can query the cart and ask for its order.id
    try {
      const { data: carts } = await query.graph({
        entity: "cart",
        fields: ["id", "order.*"],
        filters: { id: cartId }
      })

      const cart = carts[0] as any
      if (cart && cart.order?.id) {
        return res.json({ success: true, order_id: cart.order.id })
      }
    } catch (e) {
      console.log("Graph query failed for cart.order", e)
    }

    // Fallback: search orders by cart_id directly if possible
    try {
      const { data: ordersByCart } = await query.graph({
        entity: "order",
        fields: ["id", "cart_id"],
        filters: { cart_id: cartId } as any
      })
      if (ordersByCart && ordersByCart.length > 0) {
        return res.json({ success: true, order_id: ordersByCart[0].id })
      }
    } catch (e) {}

    return res.json({ success: false, error: "Sipariş henüz bulunamadı" })

  } catch (error: any) {
    console.error("Get Order by Cart ID Error:", error)
    return res.status(400).json({ success: false, error: error.message })
  }
}
