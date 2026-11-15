import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const remoteLink = req.scope.resolve(ContainerRegistrationKeys.LINK)

    // 1. Get default shipping profile
    const { data: shippingProfiles } = await query.graph({
      entity: "shipping_profile",
      fields: ["id", "name", "type"],
    })

    const defaultProfile =
      shippingProfiles.find((sp: any) => sp.type === "default") || shippingProfiles[0]

    if (!defaultProfile) {
      return res.status(404).json({ error: "No shipping profile found" })
    }

    // 2. Get all products
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "title", "shipping_profile.id"],
    })

    const productsWithoutProfile = products.filter(
      (p: any) => !p.shipping_profile || !p.shipping_profile.id
    )

    if (productsWithoutProfile.length > 0) {
      const links = productsWithoutProfile.map((p: any) => ({
        [Modules.PRODUCT]: {
          product_id: p.id,
        },
        [Modules.FULFILLMENT]: {
          shipping_profile_id: defaultProfile.id,
        },
      }))

      await remoteLink.create(links)
    }

    return res.json({
      success: true,
      default_shipping_profile: defaultProfile,
      total_products: products.length,
      linked_count: productsWithoutProfile.length,
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message, stack: err.stack })
  }
}
