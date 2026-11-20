import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { addToCartWorkflow } from "@medusajs/core-flows"
import { ICartModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const {
    cart_id,
    variant_id,
    quantity = 1,
    unit_price,
    metadata = {},
  } = (req.body || {}) as {
    cart_id: string
    variant_id: string
    quantity?: number
    unit_price?: number
    metadata?: Record<string, unknown>
  }

  if (!cart_id || !variant_id) {
    return res.status(400).json({ message: "cart_id and variant_id are required" })
  }

  const safeQuantity = Math.max(1, Number(quantity) || 1)
  const hasCustomUnitPrice = typeof unit_price === "number" && unit_price > 0

  try {
    // Ensure variant inventory does not block adding to cart
    try {
      const productModuleService = req.scope.resolve(Modules.PRODUCT) as any
      await productModuleService.updateProductVariants(variant_id, {
        manage_inventory: false,
        allow_backorder: true,
      })
    } catch {}

    const itemPayload: any = {
      variant_id,
      quantity: safeQuantity,
      metadata,
    }
    if (hasCustomUnitPrice) {
      itemPayload.unit_price = unit_price
    }

    const { result } = await addToCartWorkflow(req.scope).run({
      input: {
        cart_id,
        items: [itemPayload],
      },
    })

    // Also explicitly ensure unit_price and metadata are updated on the line item
    // in case the variant already existed in the cart prior to this call
    if (hasCustomUnitPrice || Object.keys(metadata).length > 0) {
      try {
        const cartModuleService: ICartModuleService = req.scope.resolve(Modules.CART)
        const cart = await cartModuleService.retrieveCart(cart_id, {
          relations: ["items"],
        })
        const matchingItems = (cart?.items || []).filter(
          (it: any) => it.variant_id === variant_id && !it.metadata?.is_gift
        )
        for (const lineItem of matchingItems) {
          const updateData: any = {
            metadata: {
              ...(lineItem.metadata || {}),
              ...metadata,
            },
          }
          if (hasCustomUnitPrice) {
            updateData.unit_price = unit_price
          }
          await cartModuleService.updateLineItems(lineItem.id, updateData)
        }
      } catch (updateErr) {
        console.warn("Could not post-update line item price/metadata:", updateErr)
      }
    }

    return res.json({ success: true, cart: result })
  } catch (error: any) {
    console.error("Error in /store/custom/add-with-services:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}
