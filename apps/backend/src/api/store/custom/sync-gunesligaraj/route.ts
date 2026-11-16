import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { syncGunesliGarajCatalog } from "../../../../utils/sync-gunesligaraj-catalog"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const result = await syncGunesliGarajCatalog(req.scope as any)
    return res.status(200).json(result)
  } catch (err: any) {
    return res.status(500).json({ status: "error", message: err?.message || String(err) })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const result = await syncGunesliGarajCatalog(req.scope as any)
    return res.status(200).json(result)
  } catch (err: any) {
    return res.status(500).json({ status: "error", message: err?.message || String(err) })
  }
}
