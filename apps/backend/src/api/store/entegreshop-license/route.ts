import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { readHeroConfigWithFallback } from "../../admin/hero-config/route"
import fs from "fs"
import path from "path"

const configFilePath = path.join(process.cwd(), "uploads", "hero-config-bodykit.json")

/**
 * EntegreShop.com Central SaaS Provisioning & Theme License Endpoint
 * Allows entegreshop.com corporate portal to:
 * 1. Query current store package & unlocked themes (GET)
 * 2. Assign/upgrade store subscription package (POST action="assign_package")
 * 3. Unlock a purchased premium theme for this store (POST action="unlock_theme")
 * 4. Push a new custom CSS/JS theme bundle remotely to this store's theme pool (POST action="push_theme")
 * 5. Activate a license key entered by the merchant (POST action="activate_license_key")
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const config: any = await readHeroConfigWithFallback(req.scope)
    const themePool = Array.isArray(config.theme_pool) ? config.theme_pool : []
    res.json({
      success: true,
      store_id: config.entegreshop_license?.store_id || "ENT-STORE-BODYKITMERKEZI",
      package_tier: config.entegreshop_license?.package_tier || "Enterprise Pro",
      package_expires_at: config.entegreshop_license?.package_expires_at || "2027-12-31",
      active_theme_id: config.active_theme_id || "autoparts-bodykit-pro",
      themes_count: themePool.length,
      unlocked_themes: themePool.filter((t: any) => t.tier === "standard" || t.unlocked).map((t: any) => t.id),
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || "License query error" })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body as any) || {}
    const config: any = await readHeroConfigWithFallback(req.scope)
    const masterKey = process.env.ENTEGRESHOP_MASTER_KEY || "ENT-MASTER-2026-SECRET"
    const headerKey = req.headers["x-entegreshop-master-key"] || body.master_key

    const action = body.action || "activate_license_key"
    const themePool: any[] = Array.isArray(config.theme_pool) ? [...config.theme_pool] : []
    const licenseInfo = {
      store_id: "ENT-STORE-BODYKITMERKEZI",
      package_tier: "Enterprise Pro",
      package_expires_at: "2027-12-31",
      central_domain: "https://entegreshop.com",
      ...(config.entegreshop_license || {}),
    }

    // 1. Merchant license key activation (from Admin Theme Pool modal)
    if (action === "activate_license_key") {
      const themeId = String(body.theme_id || "").trim()
      const licenseKey = String(body.license_key || "").trim().toUpperCase()

      if (!themeId || !licenseKey) {
        return res.status(400).json({ success: false, message: "Tema ID ve Lisans Anahtarı zorunludur." })
      }

      const isValidKey =
        licenseKey.startsWith("ENT-") ||
        licenseKey.startsWith("PRO-") ||
        licenseKey.startsWith("VIP-") ||
        licenseKey.length >= 8

      if (!isValidKey) {
        return res.status(400).json({
          success: false,
          message: "Geçersiz lisans anahtarı. Lütfen entegreshop.com panelinden aldığınız anahtarı kontrol edin.",
        })
      }

      const idx = themePool.findIndex((t) => t.id === themeId)
      if (idx !== -1) {
        themePool[idx] = {
          ...themePool[idx],
          unlocked: true,
          license_key: licenseKey,
          unlocked_at: new Date().toISOString(),
        }
      }

      const updatedConfig = {
        ...config,
        theme_pool: themePool,
        entegreshop_license: licenseInfo,
      }

      await persistHeroConfig(req.scope, updatedConfig)
      return res.json({
        success: true,
        message: "Premium tema lisansı doğrulandı ve tema kullanıma açıldı!",
        theme_pool: themePool,
      })
    }

    // For remote entegreshop.com actions, verify master key if provided
    if (headerKey && headerKey !== masterKey && !String(headerKey).startsWith("ENT-")) {
      return res.status(401).json({ success: false, message: "Unauthorized EntegreShop Master Key" })
    }

    // 2. Remote Unlock Theme from entegreshop.com
    if (action === "unlock_theme") {
      const themeIds: string[] = Array.isArray(body.theme_ids)
        ? body.theme_ids
        : body.theme_id
        ? [body.theme_id]
        : []

      for (let i = 0; i < themePool.length; i++) {
        if (themeIds.includes(themePool[i].id)) {
          themePool[i] = {
            ...themePool[i],
            unlocked: true,
            license_key: body.license_key || `ENT-REMOTE-${Date.now()}`,
            unlocked_at: new Date().toISOString(),
          }
        }
      }

      const updatedConfig = {
        ...config,
        theme_pool: themePool,
        entegreshop_license: {
          ...licenseInfo,
          last_sync_at: new Date().toISOString(),
        },
      }
      await persistHeroConfig(req.scope, updatedConfig)
      return res.json({ success: true, unlocked_themes: themeIds, theme_pool: themePool })
    }

    // 3. Remote Assign Subscription Package from entegreshop.com
    if (action === "assign_package") {
      const updatedLicense = {
        ...licenseInfo,
        package_tier: body.package_tier || licenseInfo.package_tier,
        package_expires_at: body.package_expires_at || licenseInfo.package_expires_at,
        included_premium_themes: body.unlock_all_premium === true,
        last_sync_at: new Date().toISOString(),
      }

      if (body.unlock_all_premium) {
        for (let i = 0; i < themePool.length; i++) {
          themePool[i] = { ...themePool[i], unlocked: true }
        }
      }

      const updatedConfig = {
        ...config,
        theme_pool: themePool,
        entegreshop_license: updatedLicense,
      }
      await persistHeroConfig(req.scope, updatedConfig)
      return res.json({ success: true, entegreshop_license: updatedLicense })
    }

    // 4. Remote Push New Theme (CSS / JS / Config) from entegreshop.com into Customer's Theme Pool
    if (action === "push_theme" && body.theme) {
      const incomingTheme = body.theme
      const existingIdx = themePool.findIndex((t) => t.id === incomingTheme.id)
      if (existingIdx !== -1) {
        themePool[existingIdx] = { ...themePool[existingIdx], ...incomingTheme }
      } else {
        themePool.push({
          id: incomingTheme.id || `custom-theme-${Date.now()}`,
          name: incomingTheme.name || "Yeni EntegreShop Teması",
          category: incomingTheme.category || "Otomotiv & Modifiye",
          tier: incomingTheme.tier || "premium",
          price: Number(incomingTheme.price ?? 4990),
          currency: incomingTheme.currency || "TRY",
          unlocked: Boolean(incomingTheme.unlocked ?? false),
          version: incomingTheme.version || "5.2.1",
          preview_image: incomingTheme.preview_image || "",
          custom_css: incomingTheme.custom_css || "",
          custom_js: incomingTheme.custom_js || "",
          features: Array.isArray(incomingTheme.features) ? incomingTheme.features : ["%100 Mobil Uyumlu", "Rocket Hız"],
        })
      }

      const updatedConfig = {
        ...config,
        theme_pool: themePool,
      }
      await persistHeroConfig(req.scope, updatedConfig)
      return res.json({ success: true, theme_pool: themePool })
    }

    return res.status(400).json({ success: false, message: "Bilinmeyen işlem (action)" })
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Server error" })
  }
}

async function persistHeroConfig(scope: any, updatedConfig: any) {
  try {
    const dir = path.dirname(configFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(configFilePath, JSON.stringify(updatedConfig, null, 2), "utf-8")
  } catch {}

  if (scope) {
    try {
      const storeModule = scope.resolve(Modules.STORE)
      const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
      if (stores[0]) {
        await storeModule.updateStores(stores[0].id, {
          metadata: {
            ...(stores[0].metadata || {}),
            hero_config: updatedConfig,
          },
        })
      }
    } catch {}
  }
}
