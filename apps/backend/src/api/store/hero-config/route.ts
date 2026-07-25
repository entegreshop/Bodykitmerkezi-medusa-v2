import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

const configFilePath = path.join(process.cwd(), "uploads", "hero-config.json")

const defaultCategories = [
  {
    name: "YENİ GELENLER",
    handle: "yeni-gelenler",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`
  },
  {
    name: "Çok Satanlar",
    handle: "cok-satanlar",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>`
  },
  {
    name: "Bodykit",
    handle: "bodykit",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`
  },
  {
    name: "Difüzör",
    handle: "difuzor",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>`
  },
  {
    name: "Spoiler",
    handle: "spoiler",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`
  },
  {
    name: "Tampon & Ek",
    handle: "tampon-ek",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`
  },
  {
    name: "Marşpiyel",
    handle: "marspiyel",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`
  },
  {
    name: "Aydınlatma",
    handle: "aydinlatma",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
  },
  {
    name: "Aksesuar",
    handle: "aksesuar",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
  }
]

const defaultBanners = [
  {
    tag: "Trend Koleksiyon",
    title: "PREMIUM JEAN KOLEKSİYONU",
    description: "En boy likralı kot taytlar ve yüksek bel toparlayıcı jean pantolonlar şimdi en popüler kesimleriyle vitrinde.",
    btn_text: "Koleksiyonu Keşfet",
    btn_link: "/categories/jean-pantolon",
    image_url: "",
  },
  {
    tag: "Özel Seçki",
    title: "YAZ SEZONU KOMBİNLERİ",
    description: "Oysho modal kumaş şalvar takımlar ve çift şerit paraşüt kargo pantolonlar ile konforlu ve şık kombinler.",
    btn_text: "Şimdi İncele",
    btn_link: "/categories/kombin",
    image_url: "",
  }
]

const defaultData = {
  tag: "MEDUSA V2 × NEXT.JS",
  title: "XOOX Mağazasına Hoş Geldiniz",
  subtitle: "Medusa V2 altyapısıyla güçlendirilen yeni 2026 koleksiyonumuzu keşfedin",
  btn_text: "Şimdi Alışverişe Başla",
  btn_link: "/store",
  media_type: "image", // "image" or "video"
  media_url: "",
  categories: defaultCategories,
  banners: defaultBanners,
  top_announcement: "2026 YAZ SEZONU MODELLERİ",
  top_announcement_enabled: true,
  top_announcement_bg: "#000000",
  top_announcement_text_color: "#ffffff",
  scrolling_text_home: "3000 ₺ Üzeri Alışverişlerinizde Kargo Ücretsiz",
  scrolling_text_home_enabled: true,
  scrolling_text_home_bg: "#000000",
  scrolling_text_home_text_color: "#ffffff",
  scrolling_text_product: "Sepette %10 İndirim Kodu : MDS10 • 3000 ₺ Üzeri Ücretsiz Kargo",
  scrolling_text_product_enabled: true,
  scrolling_text_product_bg: "#FFD700",
  scrolling_text_product_text_color: "#000000",
  // Button Settings
  buy_now_enabled: true,
  buy_now_bg: "#E50000",
  buy_now_text_color: "#ffffff",
  add_to_cart_enabled: true,
  add_to_cart_bg: "#000000",
  add_to_cart_text_color: "#ffffff",
  whatsapp_enabled: true,
  whatsapp_number: "905323370081",
  whatsapp_bg: "#ffffff",
  whatsapp_text_color: "#25D366",
}

function readConfig() {
  try {
    if (fs.existsSync(configFilePath)) {
      const content = fs.readFileSync(configFilePath, "utf-8")
      const parsed = JSON.parse(content)
      return {
        ...defaultData,
        ...parsed,
        categories: parsed.categories || defaultCategories,
        banners: parsed.banners || defaultBanners,
      }
    }
  } catch (err) {
    console.error("Error reading hero config in store api:", err)
  }
  return defaultData
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const config = readConfig()
  res.json({ config })
}


