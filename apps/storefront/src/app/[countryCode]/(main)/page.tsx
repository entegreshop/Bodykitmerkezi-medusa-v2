import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import CouponBanner from "@modules/home/components/coupon-banner"
import PromoBanners from "@modules/home/components/promo-banners"
import TrustBadges from "@modules/home/components/trust-badges"
import CategoryTabs from "@modules/home/components/category-tabs"
import BrandProductShowcase from "@modules/home/components/brand-product-showcase"
import ProductCarouselBlock, { CarouselBlockConfig } from "@modules/home/components/product-carousel-block"
import BannerCategoryCarousel, { BannerCarouselConfig } from "@modules/home/components/banner-category-carousel"
import { Text } from "@medusajs/ui"
import InfiniteProducts from "@modules/store/components/infinite-products"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { getDictionary } from "@lib/util/get-dictionary"
import { getCategoryByHandle } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"

export const metadata: Metadata = {
  description: "BodyKit Merkezi - Aracınıza Özel Premium Bodykit, Difüzör, Spoiler, Ön Lip ve Marşpiyel Koleksiyonu",
}

const NEXT_PUBLIC_MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "https://api.bodykitmerkezi.com"
const NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

async function getHeroConfig() {
  try {
    const headers: Record<string, string> = {}
    if (NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers["x-publishable-api-key"] = NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }
    const res = await fetch(`${NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/hero-config`, {
      cache: "no-store",
      headers,
    })
    const data = await res.json()
    return data?.config || null
  } catch (err) {
    console.error("Failed to fetch hero config in Home page:", err)
    return null
  }
}

function toLightProductCard(p: any): any {
  if (!p) return p
  return {
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    handle: p.handle,
    thumbnail: p.thumbnail,
    images: Array.isArray(p.images)
      ? p.images.slice(0, 4).map((img: any) => ({ id: img.id, url: img.url }))
      : [],
    categories: Array.isArray(p.categories)
      ? p.categories.map((c: any) => ({ id: c.id, name: c.name, handle: c.handle }))
      : [],
    options: Array.isArray(p.options)
      ? p.options.map((o: any) => ({
          id: o.id,
          title: o.title,
          values: Array.isArray(o.values) ? o.values.map((v: any) => ({ id: v.id, value: v.value })) : [],
        }))
      : [],
    variants: Array.isArray(p.variants)
      ? p.variants.map((v: any) => ({
          id: v.id,
          title: v.title,
          sku: v.sku,
          manage_inventory: v.manage_inventory,
          allow_backorder: v.allow_backorder,
          inventory_quantity: v.inventory_quantity,
          options: Array.isArray(v.options)
            ? v.options.map((vo: any) => ({ id: vo.id, option_id: vo.option_id, value: vo.value }))
            : [],
          calculated_price: v.calculated_price
            ? {
                calculated_amount: v.calculated_price.calculated_amount,
                original_amount: v.calculated_price.original_amount,
                currency_code: v.calculated_price.currency_code,
                calculated_price: v.calculated_price.calculated_price
                  ? { price_list_type: v.calculated_price.calculated_price.price_list_type }
                  : undefined,
              }
            : undefined,
        }))
      : [],
  }
}

function matchProductsFromPool(
  pool: any[],
  sourceType?: string,
  handle?: string,
  limitCount: number = 8,
  offsetIdx: number = 0
): any[] {
  if (!pool || pool.length === 0) return []
  const rotateFallback = () => {
    const offset = (offsetIdx * 3) % pool.length
    const rotated = [...pool.slice(offset), ...pool.slice(0, offset)]
    return rotated.slice(0, limitCount)
  }

  if (sourceType === "category" && handle) {
    const hLower = handle.toLowerCase()
    const matched = pool.filter((p) => {
      const catHandles = (p.categories || []).map((c: any) => (c.handle || "").toLowerCase())
      if (catHandles.includes(hLower)) return true
      const t = (p.title || "").toLocaleLowerCase("tr-TR")
      const ph = (p.handle || "").toLocaleLowerCase("tr-TR")
      if (hLower === "bodykit" || hLower === "body-kit-seti") {
        return t.includes("body kit") || t.includes("bodykit") || ph.includes("body-kit") || ph.includes("bodykit")
      }
      if (hLower === "difuzor" || hLower === "arka-tampon-difuzoru") {
        return t.includes("difüzör") || t.includes("difuzor") || ph.includes("difuzor")
      }
      if (hLower === "spoiler") {
        return t.includes("spoiler") || t.includes("spoyler") || ph.includes("spoiler")
      }
      if (hLower === "tampon-ek" || hLower === "on-tampon-eki" || hLower === "on-lip") {
        return t.includes("ön ek") || t.includes("ön lip") || t.includes("tampon") || ph.includes("on-ek") || ph.includes("on-lip")
      }
      if (hLower === "arka-ek") {
        return t.includes("arka ek") || ph.includes("arka-ek")
      }
      if (hLower === "marspiyel") {
        return t.includes("marşpiyel") || t.includes("marspiyel") || ph.includes("marspiyel") || ph.includes("marsbiyel")
      }
      if (hLower === "panjur" || hLower === "on-panjur") {
        return t.includes("panjur") || ph.includes("panjur")
      }
      if (hLower === "bagaj-havuzu") {
        return t.includes("bagaj havuzu") || ph.includes("bagaj-havuzu")
      }
      if (hLower === "aydinlatma") {
        return t.includes("far") || t.includes("stop") || t.includes("led") || t.includes("aydınlatma")
      }
      return catHandles.some((ch: string) => ch.includes(hLower) || hLower.includes(ch))
    })
    return matched.length > 0 ? matched.slice(0, limitCount) : rotateFallback()
  }

  return rotateFallback()
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { countryCode } = params

  const region = (await getRegion(countryCode)) || (await getRegion("tr"))

  const { collections: rawCollections } = await listCollections({
    fields: "id, handle, title",
  }).catch(() => ({ collections: [] }))
  const collections = rawCollections || []

  if (!region) {
    return null
  }

  const dict = await getDictionary(countryCode)
  const config = await getHeroConfig()

  const marqueeText = config?.scrolling_text_home
  const repeatedText = marqueeText
    ? Array(8).fill(marqueeText).join("\u00A0\u00A0\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0\u00A0\u00A0") + "\u00A0\u00A0\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0\u00A0\u00A0"
    : ""

  const categoryQuery = searchParams.category || "yeni-gelenler"

  // Always fetch latest products pool for the n11-style Category Tab Carousel & Brand Showcase
  const latestRes = await listProducts({
    regionId: region.id,
    queryParams: {
      fields: "*variants.calculated_price,*categories,*images",
      limit: 500,
      order: "-created_at",
    },
  })
  const allProducts = (latestRes.response.products || []).map(toLightProductCard)

  let products: any[] = allProducts
  let count = latestRes.response.count || allProducts.length

  if (
    categoryQuery !== "tumu" &&
    categoryQuery !== "yeni-gelenler" &&
    categoryQuery !== "kuponlu-urun" &&
    categoryQuery !== "indirimli-urun" &&
    categoryQuery !== "cok-al-az-ode" &&
    categoryQuery !== "cok-satanlar"
  ) {
    products = matchProductsFromPool(allProducts, "category", categoryQuery, 20, 0)
    count = products.length
  }

  // Load products for configured Carousel Blocks in-memory without redundant HTTP roundtrips
  const rawCarousels: CarouselBlockConfig[] = Array.isArray(config?.carousel_blocks)
    ? config.carousel_blocks.filter((b: CarouselBlockConfig) => b && b.active !== false)
    : []

  const resolvedCarousels = rawCarousels.map((block, idx) => ({
    block,
    products: matchProductsFromPool(allProducts, block.source_type, block.handle, block.limit || 8, idx),
  }))

  const carouselsAboveBanners = resolvedCarousels.filter((c) => c.block.position === "above_banners")
  const carouselsBelowBanners = resolvedCarousels.filter(
    (c) => !c.block.position || c.block.position === "below_banners" || c.block.position === "below_categories"
  )
  const carouselsBelowProducts = resolvedCarousels.filter((c) => c.block.position === "below_products")

  // Load products for Banner-Overlaid Category Carousels (n11 Style)
  const defaultBannerCarousels: BannerCarouselConfig[] = [
    {
      id: "banner-carousel-bodykit",
      title: "Komple Bodykit Setleri",
      title_color: "#111827",
      cta_text: "Fırsatları Kaçırma",
      cta_link: "/categories/bodykit",
      cta_color: "#e11d48",
      footer_note: "Aracınıza birebir uyumlu 1. sınıf ABS plastik ve PP komple bodykit setlerinde sepette ekstra indirim avantajı.",
      badge_text: "BODYKIT FIRSATI",
      bg_image_url: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1600&auto=format&fit=crop&q=80",
      bg_color: "#dce6f2",
      source_type: "category",
      handle: "bodykit",
      limit: 8,
      position: "below_collection",
      free_shipping_text: "HIZLI KARGO",
      active: true,
    },
    {
      id: "banner-carousel-difuzor",
      title: "Arka Difüzör & Egzoz Uçları",
      title_color: "#111827",
      cta_text: "Difüzör Modellerini Keşfet",
      cta_link: "/categories/difuzor",
      cta_color: "#1d4ed8",
      footer_note: "Çift çıkışlı, F1 çakar lambalı ve parlak siyah (Piano Black) arka difüzör modellerinde özel fiyatlar.",
      badge_text: "DİFÜZÖR SEÇKİSİ",
      bg_image_url: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1600&auto=format&fit=crop&q=80",
      bg_color: "#dbeafe",
      source_type: "category",
      handle: "difuzor",
      limit: 8,
      position: "below_collection",
      free_shipping_text: "HIZLI KARGO",
      active: true,
    },
    {
      id: "banner-carousel-spoiler",
      title: "Bagaj & Tavan Spoiler Modelleri",
      title_color: "#111827",
      cta_text: "Spoiler Fırsatlarını İncele",
      cta_link: "/categories/spoiler",
      cta_color: "#c91d82",
      footer_note: "M4, PSM, Clubsport ve R-Line tasarım bagaj üstü ve tavan spoiler modellerinde hızlı kargo avantajı.",
      badge_text: "SPOILER SERİSİ",
      bg_image_url: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=1600&auto=format&fit=crop&q=80",
      bg_color: "#fce7f3",
      source_type: "category",
      handle: "spoiler",
      limit: 8,
      position: "below_collection",
      free_shipping_text: "HIZLI KARGO",
      active: true,
    },
    {
      id: "banner-carousel-tampon",
      title: "Ön Lip & Tampon Ekleri",
      title_color: "#111827",
      cta_text: "Sportif Stili Yakala",
      cta_link: "/categories/tampon-ek",
      cta_color: "#7c3aed",
      footer_note: "Esnek kırılmaz yapılı, boyalı ve boyasız ön tampon eki (lip) ve splitter modellerinde özel indirimler.",
      badge_text: "SPORTİF GÖRÜNÜM",
      bg_image_url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1600&auto=format&fit=crop&q=80",
      bg_color: "#ede9fe",
      source_type: "category",
      handle: "tampon-ek",
      limit: 8,
      position: "below_collection",
      free_shipping_text: "HIZLI KARGO",
      active: true,
    },
    {
      id: "banner-carousel-marspiyel",
      title: "Yan Marşpiyel Takımları",
      title_color: "#111827",
      cta_text: "Marşpiyel Setlerini Gör",
      cta_link: "/categories/marspiyel",
      cta_color: "#b45309",
      footer_note: "Sağ-sol takım yan marşpiyel ve marşpiyel altı bıçak setlerinde sezonun en iyi fiyatları.",
      badge_text: "AERODİNAMİK SET",
      bg_image_url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1600&auto=format&fit=crop&q=80",
      bg_color: "#fef3c7",
      source_type: "category",
      handle: "marspiyel",
      limit: 8,
      position: "below_collection",
      free_shipping_text: "HIZLI KARGO",
      active: true,
    },
    {
      id: "banner-carousel-panjur",
      title: "Spor Panjur & Böbrek Izgara",
      title_color: "#111827",
      cta_text: "Tüm Modelleri Gör",
      cta_link: "/categories/panjur",
      cta_color: "#059669",
      footer_note: "Diamond, GT-R Panamericana, M Çift Çizgi ve RS petek ön panjur modellerinde sepette ekstra indirim.",
      badge_text: "RS & M PERFORMANCE",
      bg_image_url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1600&auto=format&fit=crop&q=80",
      bg_color: "#d1fae5",
      source_type: "category",
      handle: "panjur",
      limit: 8,
      position: "below_collection",
      free_shipping_text: "HIZLI KARGO",
      active: true,
    },
    {
      id: "banner-carousel-aydinlatma",
      title: "LED Far & Stop Aydınlatma",
      title_color: "#111827",
      cta_text: "Aydınlatma Ürünlerini Keşfet",
      cta_link: "/categories/aydinlatma",
      cta_color: "#e11d48",
      footer_note: "Kayar sinyalli LED stop, lazer far ve sis farı takımlarında kaçırılmayacak fiyatlar.",
      badge_text: "LED TEKNOLOJİSİ",
      bg_image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&auto=format&fit=crop&q=80",
      bg_color: "#ffe4e6",
      source_type: "category",
      handle: "aydinlatma",
      limit: 8,
      position: "below_collection",
      free_shipping_text: "HIZLI KARGO",
      active: true,
    },
    {
      id: "banner-carousel-aksesuar",
      title: "İç & Dış Oto Aksesuar",
      title_color: "#111827",
      cta_text: "Aksesuar Koleksiyonunu Gör",
      cta_link: "/categories/aksesuar",
      cta_color: "#9333ea",
      footer_note: "Yarasa ayna kapağı, kelebek cam panjuru (louver), rüzgarlık ve karbon detaylarla aracınızı tamamlayın.",
      badge_text: "TREND AKSESUAR",
      bg_image_url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600&auto=format&fit=crop&q=80",
      bg_color: "#f3e8ff",
      source_type: "category",
      handle: "aksesuar",
      limit: 8,
      position: "below_collection",
      free_shipping_text: "HIZLI KARGO",
      active: true,
    },
    {
      id: "banner-carousel-yeni",
      title: "Yeni Gelen Bodykit Ürünleri",
      title_color: "#111827",
      cta_text: "Yeni Ürünleri Keşfet",
      cta_link: "/store",
      cta_color: "#f02d9c",
      footer_note: "Haftanın en yeni BodyKit Merkezi tasarımları stoklarla sınırlı özel lansman fiyatlarıyla.",
      badge_text: "YENİ SEZON",
      bg_image_url: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1600&auto=format&fit=crop&q=80",
      bg_color: "#fce7f3",
      source_type: "latest",
      handle: "",
      limit: 8,
      position: "below_collection",
      free_shipping_text: "HIZLI KARGO",
      active: true,
    },
    {
      id: "banner-carousel-coksatan",
      title: "Çok Satan Favori Modeller",
      title_color: "#111827",
      cta_text: "Popüler Ürünleri İncele",
      cta_link: "/store",
      cta_color: "#ea580c",
      footer_note: "Müşterilerimizin en çok tercih ettiği bodykit, spoiler ve difüzör setleri hızlı kargo fırsatıyla.",
      badge_text: "BEST SELLER 🔥",
      bg_image_url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1600&auto=format&fit=crop&q=80",
      bg_color: "#ffedd5",
      source_type: "collection",
      handle: "cok-satanlar",
      limit: 8,
      position: "below_collection",
      free_shipping_text: "HIZLI KARGO",
      active: true,
    },
  ]

  const hasSingleLegacyBannerCarousel =
    Array.isArray(config?.banner_carousels) &&
    config.banner_carousels.length === 1 &&
    config.banner_carousels[0]?.id === "banner-carousel-1"

  const rawBannerCarousels: BannerCarouselConfig[] =
    Array.isArray(config?.banner_carousels) && config.banner_carousels.length > 0 && !hasSingleLegacyBannerCarousel
      ? config.banner_carousels.filter((b: BannerCarouselConfig) => b && b.active !== false)
      : defaultBannerCarousels

  const resolvedBannerCarousels = rawBannerCarousels.map((bBlock, bIdx) => ({
    block: bBlock,
    products: matchProductsFromPool(allProducts, bBlock.source_type, bBlock.handle, bBlock.limit || 8, bIdx),
  }))

  const isHeroReplacedByCarousel = config?.hero_display_mode === "banner_carousel"
  const showHeroBanner =
    config?.show_hero_banner !== false &&
    config?.hero_display_mode !== "banner_carousel" &&
    config?.hero_display_mode !== "hidden"

  const bannerCarouselsReplaceHero = resolvedBannerCarousels.filter(
    (c) => c.block.position === "replace_hero" || (isHeroReplacedByCarousel && c === resolvedBannerCarousels[0])
  )
  const bannerCarouselsAboveBanners = resolvedBannerCarousels.filter(
    (c) => !bannerCarouselsReplaceHero.includes(c) && c.block.position === "above_banners"
  )
  const bannerCarouselsBelowBanners = resolvedBannerCarousels.filter(
    (c) => !bannerCarouselsReplaceHero.includes(c) && c.block.position === "below_banners"
  )
  const bannerCarouselsBelowCollection = resolvedBannerCarousels.filter(
    (c) =>
      !bannerCarouselsReplaceHero.includes(c) &&
      (!c.block.position || c.block.position === "below_collection")
  )
  const bannerCarouselsBelowProducts = resolvedBannerCarousels.filter(
    (c) => !bannerCarouselsReplaceHero.includes(c) && c.block.position === "below_products"
  )

  const configuredCategories = (config?.categories || []).filter((c: any) => c.active !== false)

  return (
    <>
      {/* 0. BellButik Style Luxury Coupon Banner Above Hero */}
      <CouponBanner config={config?.coupon_banner} />

      {/* 1. Campaign Hero Slider (or Banner-Overlaid Category Carousel if configured to replace Hero) */}
      {showHeroBanner && <Hero dict={dict} initialConfig={config} />}

      {bannerCarouselsReplaceHero.map((item) => (
        <BannerCategoryCarousel key={item.block.id} bannerBlock={item.block} products={item.products} region={region} />
      ))}

      {/* Home page scrolling announcement marquee (placed below Hero) */}
      {config?.scrolling_text_home_enabled !== false && marqueeText && (
        <div
          className="overflow-hidden relative w-full select-none border-b border-black/10"
          style={{ backgroundColor: config.scrolling_text_home_bg || "#000000" }}
        >
          <style>{`
            @keyframes marquee-home {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-50%, 0, 0); }
            }
            .animate-marquee-home {
              display: inline-flex;
              white-space: nowrap;
              animation: marquee-home 40s linear infinite;
            }
          `}</style>
          <div className="flex w-max py-2.5">
            <div
              className="animate-marquee-home flex items-center text-xs font-semibold uppercase tracking-wider"
              style={{ color: config.scrolling_text_home_text_color || "#ffffff" }}
            >
              <span>{repeatedText}</span>
              <span>{repeatedText}</span>
            </div>
          </div>
        </div>
      )}

      {/* Banner-Overlaid Category Carousels placed Above Banners */}
      {bannerCarouselsAboveBanners.map((item) => (
        <BannerCategoryCarousel key={item.block.id} bannerBlock={item.block} products={item.products} region={region} />
      ))}

      {/* Carousel Blocks placed Above Banners */}
      {carouselsAboveBanners.map((item) => (
        <ProductCarouselBlock key={item.block.id} block={item.block} products={item.products} region={region} />
      ))}

      {/* 2. Campaign Double Bento Banners */}
      {config?.show_promo_banners !== false && <PromoBanners initialBanners={config?.banners} />}

      {/* Banner-Overlaid Category Carousels placed Below Banners */}
      {bannerCarouselsBelowBanners.map((item) => (
        <BannerCategoryCarousel key={item.block.id} bannerBlock={item.block} products={item.products} region={region} />
      ))}

      {/* Carousel Blocks placed Below Banners */}
      {carouselsBelowBanners.map((item) => (
        <ProductCarouselBlock key={item.block.id} block={item.block} products={item.products} region={region} />
      ))}

      {/* 3. n11-Style Category Pill Tab Bar & 5-Column Product Carousel */}
      {config?.show_category_circles !== false && (
        <CategoryTabs
          categories={configuredCategories}
          activeCategory={categoryQuery}
          products={products === allProducts ? undefined : products}
          allProducts={allProducts}
          region={region}
          sectionConfig={config?.category_tab_carousel}
        />
      )}

      {/* Banner-Overlaid Category Carousels placed Below Collection */}
      {bannerCarouselsBelowCollection.map((item) => (
        <BannerCategoryCarousel key={item.block.id} bannerBlock={item.block} products={item.products} region={region} />
      ))}

      {/* 4. Car Brand-Focused Product Showcase (Circular Original Car Logo Tabs Carousel + Vertical Grid in Image 1 Card Design) */}
      {config?.brand_showcase?.enabled !== false && (
        <BrandProductShowcase
          products={allProducts}
          region={region}
          showcaseConfig={config?.brand_showcase}
          configuredBrands={config?.car_brands}
        />
      )}

      {/* Carousel Blocks placed Below Products */}
      {bannerCarouselsBelowProducts.map((item) => (
        <BannerCategoryCarousel key={item.block.id} bannerBlock={item.block} products={item.products} region={region} />
      ))}
      {carouselsBelowProducts.map((item) => (
        <ProductCarouselBlock key={item.block.id} block={item.block} products={item.products} region={region} />
      ))}

      {/* 5. Trust and Security Badges */}
      {config?.show_trust_badges !== false && <TrustBadges badges={config?.trust_badges} />}
    </>
  )
}
