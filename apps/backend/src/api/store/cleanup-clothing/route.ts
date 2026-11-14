import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    res.status(410).json({
        success: false,
        error: "This cleanup endpoint is disabled. Product cleanup requires an authenticated dry-run and explicit approval."
    });
}
