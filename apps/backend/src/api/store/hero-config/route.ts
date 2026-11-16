import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { readHeroConfigWithFallback } from "../../admin/hero-config/route"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const config = await readHeroConfigWithFallback(req.scope)
    return res.status(200).json({ config })
  } catch (err) {
    const fallback = await readHeroConfigWithFallback()
    return res.status(200).json({ config: fallback })
  }
}
