import HeroSlider, { SlideData } from "./hero-slider"

const NEXT_PUBLIC_MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "https://api.bodykitmerkezi.com"
const NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

async function getHeroConfig() {
  try {
    const headers: Record<string, string> = {}
    if (NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers["x-publishable-api-key"] = NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }

    const res = await fetch(`${NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/hero-config`, {
      next: { revalidate: 10 },
      headers,
    })
    const data = await res.json()
    return data?.config || null
  } catch (err) {
    console.error("Failed to fetch hero config in Storefront:", err)
    return null
  }
}

function resolveMediaUrl(url?: string) {
  if (!url) return ""
  if (url.startsWith("/uploads/")) {
    return `${NEXT_PUBLIC_MEDUSA_BACKEND_URL}${url}`
  }
  return url
}

const Hero = async ({ dict }: { dict: any }) => {
  const config = await getHeroConfig()

  const rawTitle = config?.title || dict?.hero?.title || "BodyKit Merkezi'ne Hoş Geldiniz"
  const cleanTitle = rawTitle === "XOOX Mağazasına Hoş Geldiniz" ? "BodyKit Merkezi'ne Hoş Geldiniz" : rawTitle

  const primarySlide: SlideData = {
    tag: config?.tag === "MEDUSA V2 × NEXT.JS" ? "BODYKİT MERKEZİ • ÖZEL SERİ" : (config?.tag || "BODYKİT MERKEZİ • ÖZEL SERİ"),
    title: cleanTitle,
    subtitle: config?.subtitle || dict?.hero?.subtitle || "Aracınıza özel en kaliteli bodykit, difüzör, spoiler, ön lip ve marşpiyel modellerini keşfedin",
    btn_text: config?.btn_text || dict?.hero?.cta || "Şimdi Alışverişe Başla",
    btn_link: config?.btn_link || "/store",
    media_type: config?.media_type || "image",
    media_url: resolveMediaUrl(config?.media_url),
    mobile_media_url: resolveMediaUrl(config?.mobile_media_url),
  }

  const extraSlides: SlideData[] = Array.isArray(config?.hero_slides)
    ? config.hero_slides
        .filter((s: any) => s && s.active !== false)
        .map((s: any) => ({
          ...s,
          media_url: resolveMediaUrl(s.media_url),
          mobile_media_url: resolveMediaUrl(s.mobile_media_url),
        }))
    : []

  const allSlides = [primarySlide, ...extraSlides]

  return (
    <HeroSlider
      slides={allSlides}
      height={config?.hero_height || "75vh"}
      overlayOpacity={config?.hero_overlay_opacity ?? 15}
      btnBg={config?.hero_btn_bg || "#7C3AED"}
      btnTextColor={config?.hero_btn_text_color || "#ffffff"}
      autoplay={config?.hero_autoplay ?? true}
      interval={config?.hero_interval || 5000}
    />
  )
}

export default Hero
