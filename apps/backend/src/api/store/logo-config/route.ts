import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"
import {
  normalizeLogoConfig,
  readLogoConfigFromDisk,
} from "../../admin/logo-config/route"

const configFilePath = path.join(process.cwd(), "uploads", "logo-config.json")

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    let config = readLogoConfigFromDisk()
    try {
      const storeModule = req.scope.resolve(Modules.STORE)
      const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
      const storeMetaConfig = stores[0]?.metadata?.logo_config
      if (!fs.existsSync(configFilePath) && storeMetaConfig) {
        config = normalizeLogoConfig(storeMetaConfig)
      }
    } catch {}

    res.json({ config })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to read logo config",
      error: error?.message,
    })
  }
}
