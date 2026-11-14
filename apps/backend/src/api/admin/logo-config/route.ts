import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

const configFilePath = path.join(process.cwd(), "uploads", "logo-config.json")

const DEFAULT_LOGO_URL =
  "https://api.bodykitmerkezi.com/uploads/logo-1794624171059-BODYKITMERKEZILOGO.png"
const DEFAULT_FAVICON_URL =
  "https://api.bodykitmerkezi.com/uploads/logo-1785013199077-BODYKITMERKEZILOGO.png"

export const DEFAULT_LOGO_CONFIG = {
  logo: DEFAULT_LOGO_URL,
  logoUrl: DEFAULT_LOGO_URL,
  favicon: DEFAULT_FAVICON_URL,
  faviconUrl: DEFAULT_FAVICON_URL,
  mobileLogo: DEFAULT_LOGO_URL,
  footerLogo: DEFAULT_LOGO_URL,
  emailLogo: DEFAULT_LOGO_URL,
  defaultImage: DEFAULT_LOGO_URL,
  checkoutLogo: DEFAULT_LOGO_URL,
  sideMenuLogo: DEFAULT_LOGO_URL,
  siteTitle: "BodyKit Merkezi | Oto Modifiye & Aksesuar",
  storeTitle: "BodyKit Merkezi | Oto Modifiye & Aksesuar",
  footerDescription:
    "Türkiye'nin en kapsamlı oto body kit, tampon, spoiler, difüzör ve modifiye aksesuarları mağazası.",
  footerCopyrightText: "© 2026 BodyKit Merkezi. Tüm hakları saklıdır.",
  copyrightText: "© 2026 BodyKit Merkezi. Tüm hakları saklıdır.",
  contactCompany: "BODYKİT MERKEZİ",
  contactAddress: "İkitelli OSB Oto Sanayi Sitesi Başakşehir / İstanbul",
  address: "İkitelli OSB Oto Sanayi Sitesi Başakşehir / İstanbul",
  contactPhone: "0532 337 00 81",
  phone: "0532 337 00 81",
  whatsapp: "905323370081",
  contactEmail: "info@bodykitmerkezi.com",
  email: "info@bodykitmerkezi.com",
  contactHours: "Pzt - Cmt: 09:00 - 19:00",
  workingHours: "Pzt - Cmt: 09:00 - 19:00",
  socialLinks: {
    instagram: "https://instagram.com/bodykitmerkezi",
    facebook: "https://facebook.com/bodykitmerkezi",
    youtube: "https://youtube.com/@bodykitmerkezi",
    tiktok: "https://tiktok.com/@bodykitmerkezi",
  },
}

export function normalizeLogoConfig(input: any) {
  const raw =
    input?.config && typeof input.config === "object"
      ? { ...input, ...input.config }
      : input || {}
  delete raw.config

  const validLogo = (val: any) =>
    typeof val === "string" &&
    val.trim() !== "" &&
    val !== "/images/logo-main.png"
      ? val.trim()
      : null

  const mainLogo =
    validLogo(raw.logoUrl) ||
    validLogo(raw.logo) ||
    DEFAULT_LOGO_CONFIG.logo

  const mainFavicon =
    validLogo(raw.favicon) && raw.favicon !== "/favicon.ico"
      ? raw.favicon
      : validLogo(raw.faviconUrl) && raw.faviconUrl !== "/favicon.ico"
      ? raw.faviconUrl
      : DEFAULT_LOGO_CONFIG.favicon

  const title =
    raw.storeTitle || raw.siteTitle || DEFAULT_LOGO_CONFIG.siteTitle

  const copyright =
    raw.copyrightText ||
    raw.footerCopyrightText ||
    DEFAULT_LOGO_CONFIG.footerCopyrightText

  const address =
    raw.address || raw.contactAddress || DEFAULT_LOGO_CONFIG.contactAddress

  const phone =
    raw.phone || raw.contactPhone || DEFAULT_LOGO_CONFIG.contactPhone

  const email =
    raw.email || raw.contactEmail || DEFAULT_LOGO_CONFIG.contactEmail

  const hours =
    raw.workingHours || raw.contactHours || DEFAULT_LOGO_CONFIG.contactHours

  return {
    ...DEFAULT_LOGO_CONFIG,
    ...raw,
    logo: mainLogo,
    logoUrl: mainLogo,
    mobileLogo: validLogo(raw.mobileLogo) || mainLogo,
    footerLogo: validLogo(raw.footerLogo) || mainLogo,
    emailLogo: validLogo(raw.emailLogo) || mainLogo,
    defaultImage: validLogo(raw.defaultImage) || mainLogo,
    checkoutLogo: validLogo(raw.checkoutLogo) || mainLogo,
    sideMenuLogo: validLogo(raw.sideMenuLogo) || mainLogo,
    favicon: mainFavicon,
    faviconUrl: mainFavicon,
    siteTitle: title,
    storeTitle: title,
    footerCopyrightText: copyright.replace(/Bodytkitmerkezi\.com/gi, "BodyKit Merkezi"),
    copyrightText: copyright.replace(/Bodytkitmerkezi\.com/gi, "BodyKit Merkezi"),
    contactCompany: raw.contactCompany || DEFAULT_LOGO_CONFIG.contactCompany,
    contactAddress: address,
    address,
    contactPhone: phone,
    phone,
    whatsapp: raw.whatsapp || DEFAULT_LOGO_CONFIG.whatsapp,
    contactEmail: email,
    email,
    contactHours: hours,
    workingHours: hours,
    footerDescription:
      raw.footerDescription || DEFAULT_LOGO_CONFIG.footerDescription,
    socialLinks: {
      ...DEFAULT_LOGO_CONFIG.socialLinks,
      ...(raw.socialLinks || {}),
    },
  }
}

export function readLogoConfigFromDisk(): any {
  try {
    if (fs.existsSync(configFilePath)) {
      const fileContent = fs.readFileSync(configFilePath, "utf-8")
      const parsed = JSON.parse(fileContent)
      return normalizeLogoConfig(parsed)
    }
  } catch {}
  return normalizeLogoConfig(DEFAULT_LOGO_CONFIG)
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    let diskConfig = readLogoConfigFromDisk()
    try {
      const storeModule = req.scope.resolve(Modules.STORE)
      const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
      const storeMetaConfig = stores[0]?.metadata?.logo_config
      if (!fs.existsSync(configFilePath) && storeMetaConfig) {
        diskConfig = normalizeLogoConfig(storeMetaConfig)
      }
    } catch {}

    res.json({ config: diskConfig })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to read logo config",
      error: error?.message,
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const existing = readLogoConfigFromDisk()
    const incomingRaw = req.body as any
    const incomingUnwrapped =
      incomingRaw?.config && typeof incomingRaw.config === "object"
        ? { ...incomingRaw, ...incomingRaw.config }
        : incomingRaw || {}
    delete incomingUnwrapped.config

    // Sync any newly updated fields over existing config
    const mergedInput = {
      ...existing,
      ...incomingUnwrapped,
    }
    if (incomingUnwrapped.logoUrl && incomingUnwrapped.logoUrl !== existing.logoUrl) {
      mergedInput.logo = incomingUnwrapped.logoUrl
    } else if (incomingUnwrapped.logo && incomingUnwrapped.logo !== existing.logo) {
      mergedInput.logoUrl = incomingUnwrapped.logo
    }
    if (incomingUnwrapped.storeTitle !== undefined) {
      mergedInput.siteTitle = incomingUnwrapped.storeTitle
    } else if (incomingUnwrapped.siteTitle !== undefined) {
      mergedInput.storeTitle = incomingUnwrapped.siteTitle
    }
    if (incomingUnwrapped.copyrightText !== undefined) {
      mergedInput.footerCopyrightText = incomingUnwrapped.copyrightText
    } else if (incomingUnwrapped.footerCopyrightText !== undefined) {
      mergedInput.copyrightText = incomingUnwrapped.footerCopyrightText
    }
    if (incomingUnwrapped.address !== undefined) {
      mergedInput.contactAddress = incomingUnwrapped.address
    } else if (incomingUnwrapped.contactAddress !== undefined) {
      mergedInput.address = incomingUnwrapped.contactAddress
    }
    if (incomingUnwrapped.phone !== undefined) {
      mergedInput.contactPhone = incomingUnwrapped.phone
    } else if (incomingUnwrapped.contactPhone !== undefined) {
      mergedInput.phone = incomingUnwrapped.contactPhone
    }
    if (incomingUnwrapped.email !== undefined) {
      mergedInput.contactEmail = incomingUnwrapped.email
    } else if (incomingUnwrapped.contactEmail !== undefined) {
      mergedInput.email = incomingUnwrapped.contactEmail
    }
    if (incomingUnwrapped.workingHours !== undefined) {
      mergedInput.contactHours = incomingUnwrapped.workingHours
    } else if (incomingUnwrapped.contactHours !== undefined) {
      mergedInput.workingHours = incomingUnwrapped.contactHours
    }

    const normalized = normalizeLogoConfig(mergedInput)

    const uploadsDir = path.dirname(configFilePath)
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    fs.writeFileSync(configFilePath, JSON.stringify(normalized, null, 2))

    // Also persist to store.metadata so container rebuilds never lose settings
    try {
      const storeModule = req.scope.resolve(Modules.STORE)
      const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
      if (stores[0]) {
        await storeModule.updateStores(stores[0].id, {
          metadata: {
            ...(stores[0].metadata || {}),
            logo_config: normalized,
          },
        })
      }
    } catch {}

    res.json({ success: true, config: normalized })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to save logo config",
      error: error?.message,
    })
  }
}
