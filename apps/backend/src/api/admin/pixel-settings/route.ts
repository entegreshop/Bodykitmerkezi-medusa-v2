import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"
import os from "os"
import crypto from "crypto"

const configFilePath = path.join(process.cwd(), "uploads", "pixel-settings.json")
const legacyHomeFilePath = path.join(os.homedir(), ".xoox-pixel-settings.json")
const legacyCwdFilePath = path.join(process.cwd(), ".xoox-pixel-settings.json")

export interface PixelConfig {
  search_engines: {
    active: boolean
    google_verification: string
    facebook_verification: string
    yandex_verification: string
    bing_verification: string
    pinterest_verification: string
  }
  meta_pixel: {
    active: boolean
    pixel_id: string
    access_token: string
    test_event_code?: string
    advanced_matching?: boolean
  }
  google_ads: {
    active: boolean
    conversion_id: string
    conversion_label: string
    add_to_cart_label?: string
    remarketing?: boolean
  }
  google_analytics: {
    active: boolean
    measurement_id: string
    property_id?: string
    service_account_json?: string
    enhanced_ecommerce?: boolean
  }
  google_tag_manager: {
    active: boolean
    gtm_id: string
  }
  openai_ads: {
    active: boolean
    pixel_id: string
    allow_shopping_bot?: boolean
  }
  tiktok_pixel: {
    active: boolean
    pixel_id: string
    access_token: string
  }
  yandex_metrica: {
    active: boolean
    counter_id: string
    webvisor?: boolean
  }
  robots_txt: {
    active: boolean
    content: string
  }
  llms_txt: {
    active: boolean
    content: string
  }
  custom_scripts: {
    active: boolean
    head_scripts: string
    body_start_scripts: string
    body_end_scripts: string
  }
  verification_files: Array<{
    filename: string
    content: string
    uploaded_at: string
  }>
}

export const defaultData: PixelConfig = {
  search_engines: {
    active: true,
    google_verification: "",
    facebook_verification: "",
    yandex_verification: "",
    bing_verification: "",
    pinterest_verification: "",
  },
  meta_pixel: {
    active: false,
    pixel_id: "",
    access_token: "",
    test_event_code: "",
    advanced_matching: true,
  },
  google_ads: {
    active: false,
    conversion_id: "",
    conversion_label: "",
    add_to_cart_label: "",
    remarketing: true,
  },
  google_analytics: {
    active: false,
    measurement_id: "",
    property_id: "",
    service_account_json: "",
    enhanced_ecommerce: true,
  },
  google_tag_manager: {
    active: false,
    gtm_id: "",
  },
  openai_ads: {
    active: false,
    pixel_id: "",
    allow_shopping_bot: true,
  },
  tiktok_pixel: {
    active: false,
    pixel_id: "",
    access_token: "",
  },
  yandex_metrica: {
    active: false,
    counter_id: "",
    webvisor: true,
  },
  robots_txt: {
    active: true,
    content: `User-agent: *\nAllow: /\nDisallow: /checkout\nDisallow: /account\nSitemap: https://bodykitmerkezi.com/sitemap.xml`,
  },
  llms_txt: {
    active: true,
    content: `# BodyKit Merkezi (bodykitmerkezi.com)\n> Aracınıza özel premium bodykit setleri, ön lip, tampon eki, arka difüzör, spoiler, marşpiyel, ön panjur, bagaj havuzu ve oto modifiye aksesuarları.\n\n- Mağaza: https://bodykitmerkezi.com/tr\n- Tüm Ürünler: https://bodykitmerkezi.com/tr/store`,
  },
  custom_scripts: {
    active: true,
    head_scripts: "",
    body_start_scripts: "",
    body_end_scripts: "",
  },
  verification_files: [],
}

// Helper: extract content="..." if user pasted a full <meta ... content="XYZ" /> tag
export function cleanVerificationCode(raw?: string): string {
  if (!raw) return ""
  const trimmed = raw.trim()
  const contentMatch = trimmed.match(/content=["']([^"']+)["']/i)
  if (contentMatch && contentMatch[1]) {
    return contentMatch[1].trim()
  }
  const eqMatch = trimmed.match(/^[a-z0-9_-]+-verification=(.+)$/i)
  if (eqMatch && eqMatch[1]) {
    return eqMatch[1].trim()
  }
  return trimmed
}

function mergePixelConfig(parsed: any): PixelConfig {
  if (!parsed || typeof parsed !== "object") return defaultData

  const rawMeta = parsed.meta_pixel || {}
  const pixelId = String(rawMeta.pixel_id ?? defaultData.meta_pixel.pixel_id).trim()
  const metaActive =
    rawMeta.active !== undefined
      ? Boolean(rawMeta.active)
      : Boolean(pixelId)

  const rawSearch = parsed.search_engines || {}

  return {
    search_engines: {
      ...defaultData.search_engines,
      ...rawSearch,
      google_verification: cleanVerificationCode(rawSearch.google_verification),
      facebook_verification: cleanVerificationCode(rawSearch.facebook_verification),
      yandex_verification: cleanVerificationCode(rawSearch.yandex_verification),
      bing_verification: cleanVerificationCode(rawSearch.bing_verification),
      pinterest_verification: cleanVerificationCode(rawSearch.pinterest_verification),
    },
    meta_pixel: {
      ...defaultData.meta_pixel,
      ...rawMeta,
      pixel_id: pixelId,
      active: metaActive,
    },
    google_ads: {
      ...defaultData.google_ads,
      ...(parsed.google_ads || {}),
    },
    google_analytics: {
      ...defaultData.google_analytics,
      ...(parsed.google_analytics || {}),
    },
    google_tag_manager: {
      ...defaultData.google_tag_manager,
      ...(parsed.google_tag_manager || {}),
    },
    openai_ads: {
      ...defaultData.openai_ads,
      ...(parsed.openai_ads || {}),
    },
    tiktok_pixel: {
      ...defaultData.tiktok_pixel,
      ...(parsed.tiktok_pixel || {}),
    },
    yandex_metrica: {
      ...defaultData.yandex_metrica,
      ...(parsed.yandex_metrica || {}),
    },
    robots_txt: {
      ...defaultData.robots_txt,
      ...(parsed.robots_txt || {}),
    },
    llms_txt: {
      ...defaultData.llms_txt,
      ...(parsed.llms_txt || {}),
    },
    custom_scripts: {
      ...defaultData.custom_scripts,
      ...(parsed.custom_scripts || {}),
    },
    verification_files: Array.isArray(parsed.verification_files)
      ? parsed.verification_files
      : defaultData.verification_files,
  }
}

// Live GA4 (_ga cookie + gtag) active session window (5 minutes)
interface GaRealtimeSession {
  clientId: string
  device: "desktop" | "mobile"
  path: string
  lastSeen: number
}

const gaLiveSessions = new Map<string, GaRealtimeSession>()

export function recordGaRealtimeHit(payload: {
  client_id?: string
  device?: string
  path?: string
}) {
  const now = Date.now()
  const cid = (payload.client_id || "").trim()
  if (!cid) return

  const deviceType: "desktop" | "mobile" =
    payload.device === "mobile" ? "mobile" : "desktop"

  gaLiveSessions.set(cid, {
    clientId: cid,
    device: deviceType,
    path: payload.path || "/",
    lastSeen: now,
  })

  // Prune sessions older than 5 minutes (GA4 active user window)
  const cutoff = now - 5 * 60 * 1000
  for (const [key, session] of gaLiveSessions.entries()) {
    if (session.lastSeen < cutoff) {
      gaLiveSessions.delete(key)
    }
  }
}

async function fetchGoogleAnalyticsRealtimeApi(
  propertyId: string,
  serviceAccountRaw: string
): Promise<{ count: number; desktopPercent: number; mobilePercent: number } | null> {
  try {
    const creds = JSON.parse(serviceAccountRaw)
    if (!creds.client_email || !creds.private_key) return null

    const nowSec = Math.floor(Date.now() / 1000)
    const header = Buffer.from(
      JSON.stringify({ alg: "RS256", typ: "JWT" })
    ).toString("base64url")
    const claim = Buffer.from(
      JSON.stringify({
        iss: creds.client_email,
        scope: "https://www.googleapis.com/auth/analytics.readonly",
        aud: "https://oauth2.googleapis.com/token",
        exp: nowSec + 3600,
        iat: nowSec,
      })
    ).toString("base64url")

    const signer = crypto.createSign("RSA-SHA256")
    signer.update(`${header}.${claim}`)
    const signature = signer.sign(creds.private_key, "base64url")
    const assertion = `${header}.${claim}.${signature}`

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    })
    if (!tokenRes.ok) return null
    const tokenJson = (await tokenRes.json()) as { access_token?: string }
    if (!tokenJson.access_token) return null

    const gaRes = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenJson.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dimensions: [{ name: "deviceCategory" }],
          metrics: [{ name: "activeUsers" }],
        }),
      }
    )
    if (!gaRes.ok) return null
    const gaData = (await gaRes.json()) as any

    let desktop = 0
    let mobile = 0
    for (const row of gaData.rows || []) {
      const cat = (row.dimensionValues?.[0]?.value || "").toLowerCase()
      const val = parseInt(row.metricValues?.[0]?.value || "0", 10)
      if (cat === "mobile" || cat === "tablet") {
        mobile += val
      } else {
        desktop += val
      }
    }
    const total = desktop + mobile
    const desktopPercent = total > 0 ? Math.round((desktop / total) * 100) : 0
    const mobilePercent = total > 0 ? 100 - desktopPercent : 0

    return { count: total, desktopPercent, mobilePercent }
  } catch {
    return null
  }
}

export async function getGaRealtimeStats(fallbackActiveCarts = 0): Promise<{
  count: number
  desktopPercent: number
  mobilePercent: number
  source: string
  sessions: Array<{
    id: string
    device: "desktop" | "mobile"
    path: string
    secondsAgo: number
  }>
  minuteHistory: number[]
}> {
  const now = Date.now()
  const cutoff = now - 10 * 60 * 1000
  let desktopCount = 0
  let mobileCount = 0
  const activeSessions: Array<{
    id: string
    device: "desktop" | "mobile"
    path: string
    secondsAgo: number
  }> = []

  const minuteBuckets = Array(10).fill(0)

  for (const [key, session] of gaLiveSessions.entries()) {
    if (session.lastSeen < cutoff) {
      gaLiveSessions.delete(key)
    } else {
      if (session.device === "mobile") {
        mobileCount++
      } else {
        desktopCount++
      }
      const secondsAgo = Math.max(0, Math.floor((now - session.lastSeen) / 1000))
      activeSessions.push({
        id: key.slice(-6).toUpperCase(),
        device: session.device,
        path: session.path || "/",
        secondsAgo,
      })
      const minIdx = Math.min(9, Math.max(0, 9 - Math.floor(secondsAgo / 60)))
      minuteBuckets[minIdx]++
    }
  }

  activeSessions.sort((a, b) => a.secondsAgo - b.secondsAgo)

  const cfg = readConfig()
  const propId =
    cfg.google_analytics?.property_id || process.env.GA4_PROPERTY_ID || ""
  const saJson =
    cfg.google_analytics?.service_account_json ||
    process.env.GA4_SERVICE_ACCOUNT_JSON ||
    ""

  if (propId && saJson) {
    const apiStats = await fetchGoogleAnalyticsRealtimeApi(propId, saJson)
    if (apiStats) {
      const hist = minuteBuckets.some((v) => v > 0)
        ? minuteBuckets
        : [
            Math.max(0, apiStats.count - 1),
            0,
            0,
            0,
            Math.max(1, apiStats.count),
            Math.max(0, apiStats.count - 1),
            0,
            0,
            Math.max(0, apiStats.count - 1),
            apiStats.count,
          ]
      return {
        ...apiStats,
        source: "ga4_data_api",
        sessions: activeSessions,
        minuteHistory: hist,
      }
    }
  }

  const streamTotal = desktopCount + mobileCount
  if (streamTotal > 0) {
    const desktopPercent = Math.round((desktopCount / streamTotal) * 100)
    return {
      count: streamTotal,
      desktopPercent,
      mobilePercent: 100 - desktopPercent,
      source: "ga4_live_stream",
      sessions: activeSessions,
      minuteHistory: minuteBuckets,
    }
  }

  return {
    count: fallbackActiveCarts,
    desktopPercent: fallbackActiveCarts > 0 ? 60 : 0,
    mobilePercent: fallbackActiveCarts > 0 ? 40 : 0,
    source: "active_carts",
    sessions: [],
    minuteHistory:
      fallbackActiveCarts > 0
        ? [1, 0, 0, 0, fallbackActiveCarts, 0, 0, 0, 0, fallbackActiveCarts]
        : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  }
}

export const getLiveGoogleAnalyticsSummary = getGaRealtimeStats

export function readConfig(): PixelConfig {
  try {
    const targetPath = fs.existsSync(configFilePath)
      ? configFilePath
      : fs.existsSync(legacyHomeFilePath)
        ? legacyHomeFilePath
        : fs.existsSync(legacyCwdFilePath)
          ? legacyCwdFilePath
          : null

    if (targetPath) {
      const content = fs.readFileSync(targetPath, "utf-8")
      const parsed = JSON.parse(content)
      return mergePixelConfig(parsed)
    }
  } catch (err) {
    console.error("Error reading pixel config in admin api:", err)
  }
  return defaultData
}

export async function readPixelConfigWithFallback(scope?: any): Promise<PixelConfig> {
  const targetPath = fs.existsSync(configFilePath)
    ? configFilePath
    : fs.existsSync(legacyHomeFilePath)
      ? legacyHomeFilePath
      : fs.existsSync(legacyCwdFilePath)
        ? legacyCwdFilePath
        : null

  if (targetPath) {
    try {
      const content = fs.readFileSync(targetPath, "utf-8")
      const parsed = JSON.parse(content)
      return mergePixelConfig(parsed)
    } catch {}
  }

  // Restore from store.metadata.pixel_settings if container was redeployed
  if (scope) {
    try {
      const storeModule = scope.resolve(Modules.STORE)
      const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
      const savedPixelConfig = stores[0]?.metadata?.pixel_settings
      if (savedPixelConfig && typeof savedPixelConfig === "object") {
        const merged = mergePixelConfig(savedPixelConfig)
        try {
          const dir = path.dirname(configFilePath)
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
          }
          fs.writeFileSync(configFilePath, JSON.stringify(merged, null, 2), "utf-8")
        } catch {}
        return merged
      }
    } catch {}
  }

  return defaultData
}

function writeConfig(data: any) {
  try {
    const dir = path.dirname(configFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(configFilePath, JSON.stringify(data, null, 2), "utf-8")
    return true
  } catch (err) {
    console.error("Error writing pixel config in admin api:", err)
    return false
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const config = await readPixelConfigWithFallback(req.scope)
  res.json({ config })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const incoming = (req.body as any)?.config || (req.body as any) || {}
  const current = await readPixelConfigWithFallback(req.scope)
  const merged = mergePixelConfig({
    ...current,
    ...incoming,
    search_engines: { ...current.search_engines, ...(incoming.search_engines || {}) },
    meta_pixel: { ...current.meta_pixel, ...(incoming.meta_pixel || {}) },
    google_ads: { ...current.google_ads, ...(incoming.google_ads || {}) },
    google_analytics: { ...current.google_analytics, ...(incoming.google_analytics || {}) },
    google_tag_manager: { ...current.google_tag_manager, ...(incoming.google_tag_manager || {}) },
    openai_ads: { ...current.openai_ads, ...(incoming.openai_ads || {}) },
    tiktok_pixel: { ...current.tiktok_pixel, ...(incoming.tiktok_pixel || {}) },
    yandex_metrica: { ...current.yandex_metrica, ...(incoming.yandex_metrica || {}) },
    robots_txt: { ...current.robots_txt, ...(incoming.robots_txt || {}) },
    llms_txt: { ...current.llms_txt, ...(incoming.llms_txt || {}) },
    custom_scripts: { ...current.custom_scripts, ...(incoming.custom_scripts || {}) },
    verification_files: Array.isArray(incoming.verification_files)
      ? incoming.verification_files
      : current.verification_files,
  })

  const success = writeConfig(merged)

  // Also persist to store.metadata.pixel_settings in PostgreSQL so redeploys never wipe pixel settings
  try {
    const storeModule = req.scope.resolve(Modules.STORE)
    const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
    if (stores[0]) {
      await storeModule.updateStores(stores[0].id, {
        metadata: {
          ...(stores[0].metadata || {}),
          pixel_settings: merged,
        },
      })
    }
  } catch (metaErr) {
    console.warn("Could not persist pixel_settings to store metadata:", metaErr)
  }

  if (success) {
    res.json({ success: true, config: merged })
  } else {
    res.status(500).json({ success: false, message: "Could not write configuration" })
  }
}
