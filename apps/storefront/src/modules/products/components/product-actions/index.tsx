"use client"

import { addToCart, applyPromotions } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { getProductPrice } from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"
import MobileActions from "./mobile-actions"
import { trackViewContent, trackAddToCart } from "@lib/util/tracking"
import { extractVehicleCompatibility } from "./vehicle-compatibility"

const BOYA_SERVICE_PRICE_TL = 1800
const MONTAJ_SERVICE_PRICE_TL = 1200

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  children?: React.ReactNode
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  region,
  disabled,
  children
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const [selectedGiftVariantId, setSelectedGiftVariantId] = useState<string | null>(null)

  useEffect(() => {
    const handleGiftSelected = (e: any) => {
      setSelectedGiftVariantId(e.detail.variantId)
    }
    
    if (typeof window !== "undefined") {
      window.addEventListener("giftSelected", handleGiftSelected)
      return () => window.removeEventListener("giftSelected", handleGiftSelected)
    }
  }, [])

  const [isBuyingNow, setIsBuyingNow] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [viewerCount, setViewerCount] = useState(14)
  const [activeAccordion, setActiveAccordion] = useState<string | null>("description")
  const [scrollingText, setScrollingText] = useState("")
  const [scrollingTextEnabled, setScrollingTextEnabled] = useState(true)
  const [scrollingTextBg, setScrollingTextBg] = useState("#FFD700")
  const [scrollingTextTextColor, setScrollingTextTextColor] = useState("#000000")
  
  // Button settings state
  const [btnConfig, setBtnConfig] = useState({
    buy_now_enabled: true,
    buy_now_text: "HEMEN AL",
    buy_now_bg: "#E50000",
    buy_now_text_color: "#ffffff",
    add_to_cart_enabled: true,
    add_to_cart_text: "SEPETE EKLE",
    add_to_cart_bg: "#000000",
    add_to_cart_text_color: "#ffffff",
    whatsapp_enabled: true,
    whatsapp_text: "WHATSAPP İLE SİPARİŞ",
    whatsapp_number: "905323370081",
    whatsapp_bg: "#ffffff",
    whatsapp_text_color: "#25D366",
    button_border_radius: "0px",
  })

  const [detailConfig, setDetailConfig] = useState({
    show_live_viewers: true,
    live_viewers_min: 12,
    live_viewers_max: 34,
    show_favorite_button: true,
    show_reviews_link: true,
    show_trust_row: true,
    trust_badge_1_text: "Güvenli Ödeme",
    trust_badge_2_text: "Aynı Gün Kargo",
    shipping_info_text:
      "Saat 15:00'a kadar verilen tüm siparişleriniz aynı gün kargoya teslim edilmektedir. Teslimat süresi ortalama 1-3 iş günüdür.",
    return_policy_text:
      "Siparişinizdeki ürünleri teslim aldığınız tarihten itibaren 14 gün içerisinde, kullanılmamış ve etiketleri sökülmemiş olması şartıyla iade edebilirsiniz.",
    show_sticky_mobile_bar: true,
  })

  const [showCouponModal, setShowCouponModal] = useState(false)
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponTimeLeft, setCouponTimeLeft] = useState("")
  const [couponUrgentText, setCouponUrgentText] = useState("")

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Tarih ayarlanmışsa kullan, yoksa gün sonu (gece yarısı)
      const endDateStr = (product.metadata?.coupon_badge as any)?.end_date;
      let targetDate = new Date(now);
      
      if (endDateStr) {
         targetDate = new Date(endDateStr);
      } else {
         targetDate.setHours(23, 59, 59, 999);
      }

      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCouponTimeLeft("0 saat 0 dk 0 sn kaldı!");
        setCouponUrgentText("Süresi Doldu");
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      
      let timeLeftStr = "";
      if (days > 0) timeLeftStr += `${days} gün `;
      timeLeftStr += `${hours} saat ${minutes} dk ${seconds} sn kaldı!`;
      setCouponTimeLeft(timeLeftStr);

      let urgentStr = "";
      const totalHours = Math.floor(diff / (1000 * 60 * 60));
      if (days >= 1) {
        urgentStr = `Son ${days} gün`;
      } else if (totalHours > 0) {
        urgentStr = `Son ${totalHours} saat`;
      } else {
        urgentStr = `Son ${minutes} dakika`;
      }
      setCouponUrgentText(urgentStr);
    };
    
    calculateTimeLeft();
    const timer = setInterval(() => {
      calculateTimeLeft();
    }, 1000);
    
    return () => clearInterval(timer);
  }, [product.metadata?.coupon_badge]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.bodykitmerkezi.com"
        const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        const headers: Record<string, string> = {}
        if (publishableKey) {
          headers["x-publishable-api-key"] = publishableKey
        }
        const res = await fetch(`${backendUrl}/store/hero-config`, { headers })
        const data = await res.json()
        if (data?.config) {
          setScrollingText(data.config.scrolling_text_product || "")
          setScrollingTextEnabled(data.config.scrolling_text_product_enabled ?? true)
          setScrollingTextBg(data.config.scrolling_text_product_bg || "#FFD700")
          setScrollingTextTextColor(data.config.scrolling_text_product_text_color || "#000000")
          
          setBtnConfig({
            buy_now_enabled: data.config.buy_now_enabled ?? true,
            buy_now_text: data.config.buy_now_text || "HEMEN AL",
            buy_now_bg: data.config.buy_now_bg || "#E50000",
            buy_now_text_color: data.config.buy_now_text_color || "#ffffff",
            add_to_cart_enabled: data.config.add_to_cart_enabled ?? true,
            add_to_cart_text: data.config.add_to_cart_text || "SEPETE EKLE",
            add_to_cart_bg: data.config.add_to_cart_bg || "#000000",
            add_to_cart_text_color: data.config.add_to_cart_text_color || "#ffffff",
            whatsapp_enabled: data.config.whatsapp_enabled ?? true,
            whatsapp_text: data.config.whatsapp_text || "WHATSAPP İLE SİPARİŞ",
            whatsapp_number: data.config.whatsapp_number || "905323370081",
            whatsapp_bg: data.config.whatsapp_bg || "#ffffff",
            whatsapp_text_color: data.config.whatsapp_text_color || "#25D366",
            button_border_radius: data.config.button_border_radius || "0px",
          })

          if (data.config.product_detail_settings) {
            setDetailConfig((prev) => ({
              ...prev,
              ...data.config.product_detail_settings,
            }))
          }
        }
      } catch (err) {
        console.error("Failed to fetch scrolling text in product-actions:", err)
      }
    }
    fetchConfig()
  }, [])

  const toggleAccordion = (tab: string) => {
    setActiveAccordion((prev) => (prev === tab ? null : tab))
  }

  const countryCode = useParams().countryCode as string

  // Wishlist state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`favorite-${product.id}`)
      setIsFavorite(saved === "true")
    }
  }, [product.id])

  const toggleFavorite = () => {
    const nextValue = !isFavorite
    setIsFavorite(nextValue)
    if (typeof window !== "undefined") {
      localStorage.setItem(`favorite-${product.id}`, String(nextValue))
    }
  }

  // Live viewer count
  useEffect(() => {
    const initialCount = ((product.id?.charCodeAt(0) || 0) % 15) + 10
    setViewerCount(initialCount)
  }, [product.id])

  // Initialize options on mount or searchParams change
  useEffect(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    const getOptionByTitle = (titlePattern: "RENK" | "BEDEN") => {
      return product.options?.find((o) => {
        const t = (o.title || "").toLowerCase()
        if (titlePattern === "RENK") {
          return t === "renk" || t === "color" || t === "colour"
        }
        if (titlePattern === "BEDEN") {
          return t === "beden" || t === "size"
        }
        return false
      })
    }

    const renkOption = getOptionByTitle("RENK")
    const bedenOption = getOptionByTitle("BEDEN")

    const urlRenk = searchParams.get("RENK") || searchParams.get("renk")
    const urlBeden = searchParams.get("BEDEN") || searchParams.get("beden")

    let matchedVariant: any = null

    // If there is a v_id in URL, try to match it first
    const urlVId = searchParams.get("v_id")
    if (urlVId) {
      matchedVariant = product.variants.find((v) => v.id === urlVId)
    }

    if (!matchedVariant && (urlRenk || urlBeden)) {
      matchedVariant = product.variants.find((v) => {
        return v.options?.every((opt: any) => {
          if (renkOption && opt.option_id === renkOption.id) {
            if (!urlRenk) return true
            return opt.value?.trim().toLowerCase() === urlRenk.trim().toLowerCase()
          }
          if (bedenOption && opt.option_id === bedenOption.id) {
            if (!urlBeden) return true
            return opt.value?.trim().toLowerCase() === urlBeden.trim().toLowerCase()
          }
          return true
        })
      })
      
      // Fallback 1: Try to match JUST the Color (Renk)
      if (!matchedVariant && urlRenk && renkOption) {
        matchedVariant = product.variants.find((v) => {
          return v.options?.some((opt: any) => {
            return opt.option_id === renkOption.id && opt.value?.trim().toLowerCase() === urlRenk.trim().toLowerCase()
          })
        })
      }
      
      // Fallback 2: Try to match JUST the Size (Beden)
      if (!matchedVariant && urlBeden && bedenOption) {
        matchedVariant = product.variants.find((v) => {
          return v.options?.some((opt: any) => {
            return opt.option_id === bedenOption.id && opt.value?.trim().toLowerCase() === urlBeden.trim().toLowerCase()
          })
        })
      }
    }

    // If no variant matches the URL params, or URL params not specified
    if (!matchedVariant) {
      // Try to find first variant in stock
      matchedVariant = product.variants.find((v) => {
        const inStock = !v.manage_inventory || v.allow_backorder || (v.inventory_quantity || 0) > 0
        return inStock
      })
      // Fallback to first variant
      if (!matchedVariant) {
        matchedVariant = product.variants[0]
      }
    }

    if (matchedVariant) {
      const variantOptions = optionsAsKeymap(matchedVariant.options)
      setOptions((prev) => {
        if (isEqual(prev, variantOptions)) {
          return prev
        }
        return variantOptions ?? {}
      })
    }
  }, [product.variants, product.options, searchParams])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    params.delete("v_id")

    const renkOption = product.options?.find((o) => {
      const t = (o.title || "").toLowerCase()
      return t === "renk" || t === "color" || t === "colour"
    })
    const bedenOption = product.options?.find((o) => {
      const t = (o.title || "").toLowerCase()
      return t === "beden" || t === "size"
    })

    if (renkOption && options[renkOption.id]) {
      params.set("RENK", options[renkOption.id]!)
      params.delete("renk")
    } else {
      params.delete("RENK")
      params.delete("renk")
    }

    if (bedenOption && options[bedenOption.id]) {
      params.set("BEDEN", options[bedenOption.id]!)
      params.delete("beden")
    } else {
      params.delete("BEDEN")
      params.delete("beden")
    }

    const newSearch = params.toString()
    if (searchParams.toString() !== newSearch) {
      router.replace(pathname + "?" + newSearch, { scroll: false })
    }
  }, [selectedVariant, isValidVariant, options, product.options, searchParams, pathname, router])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // In Medusa V2, inventory_quantity on storefront might not always reflect properly
    // depending on sales channel stock location links.
    // Rely on the backend API to reject if genuinely out of stock.
    return true
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")

  // Boya, Montaj & Quantity states (synced with ProductBelowGallery under the product image)
  const [boyaSelected, setBoyaSelected] = useState(false)
  const [montajSelected, setMontajSelected] = useState(false)
  const quantity = 1

  useEffect(() => {
    setBoyaSelected(false)
    setMontajSelected(false)
  }, [product.id])

  useEffect(() => {
    const handleAddonsChanged = (e: any) => {
      if (e?.detail) {
        setBoyaSelected(Boolean(e.detail.boyaSelected))
        setMontajSelected(Boolean(e.detail.montajSelected))
      }
    }
    if (typeof window !== "undefined") {
      const existing = (window as any).__bkmServiceAddons
      if (existing) {
        setBoyaSelected(Boolean(existing.boyaSelected))
        setMontajSelected(Boolean(existing.montajSelected))
      }
      window.addEventListener("bkmServiceAddonsChanged", handleAddonsChanged)
      return () => window.removeEventListener("bkmServiceAddonsChanged", handleAddonsChanged)
    }
  }, [])

  const vehicleCompat = useMemo(() => {
    return extractVehicleCompatibility(
      product.title || "",
      product.description,
      product.metadata as Record<string, any>
    )
  }, [product.title, product.description, product.metadata])

  // Calculate pricing
  const price = getProductPrice({
    product,
    variantId: selectedVariant?.id,
  })

  const selectedPrice = selectedVariant ? price.variantPrice : price.cheapestPrice

  // Hesaplanan yeni fiyat için değişkenler (kuruş ölçeğinde: 1 TL = 100)
  let baseUnitPriceNumber = selectedPrice?.calculated_price_number || 0
  let hasActiveCoupon = false
  
  if (couponApplied && product.metadata?.coupon_badge && (product.metadata.coupon_badge as any).active) {
    const couponInfo = product.metadata.coupon_badge as any
    hasActiveCoupon = true
    if (couponInfo.type === "percent") {
      baseUnitPriceNumber = baseUnitPriceNumber * (1 - Number(couponInfo.amount) / 100)
    } else {
      // Amount (e.g. 50 TL) needs to be multiplied by 100 to match cents
      baseUnitPriceNumber = Math.max(0, baseUnitPriceNumber - Number(couponInfo.amount) * 100)
    }
  }

  const addonUnitTl =
    (boyaSelected && !vehicleCompat.isPrePaintedPianoBlack && !vehicleCompat.isTrunkMat
      ? BOYA_SERVICE_PRICE_TL
      : 0) +
    (montajSelected && !vehicleCompat.isTrunkMat ? MONTAJ_SERVICE_PRICE_TL : 0)

  const addonUnitPriceNumber = addonUnitTl * 100
  const effectiveUnitPriceNumber = baseUnitPriceNumber + addonUnitPriceNumber
  const finalPriceNumber = effectiveUnitPriceNumber * quantity

  const finalPriceFormatted = convertToLocale({
    amount: finalPriceNumber,
    currency_code: region?.currency_code || "TRY",
  })

  const activeTotalTl = Math.max(0, Math.round(finalPriceNumber / 100))

  const formatTlAmount = (val: number, decimals = 0) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(val)
  }

  const buildServiceMetadata = () => {
    const activeBoya = boyaSelected && !vehicleCompat.isPrePaintedPianoBlack && !vehicleCompat.isTrunkMat
    const activeMontaj = montajSelected && !vehicleCompat.isTrunkMat
    if (!activeBoya && !activeMontaj) {
      return undefined
    }
    const parts: string[] = []
    if (activeBoya) parts.push(`Boya (+₺${BOYA_SERVICE_PRICE_TL.toLocaleString("tr-TR")})`)
    if (activeMontaj) parts.push(`Montaj (+₺${MONTAJ_SERVICE_PRICE_TL.toLocaleString("tr-TR")})`)
    return {
      boya_selected: activeBoya,
      montaj_selected: activeMontaj,
      boya_price_tl: activeBoya ? BOYA_SERVICE_PRICE_TL : 0,
      montaj_price_tl: activeMontaj ? MONTAJ_SERVICE_PRICE_TL : 0,
      service_summary: parts.join(" • "),
    }
  }

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    try {
      const serviceMeta = buildServiceMetadata()
      const rawBaseUnit = selectedPrice?.calculated_price_number || 0
      const customUnitPrice = addonUnitPriceNumber > 0 ? rawBaseUnit + addonUnitPriceNumber : undefined

      const error = await addToCart({
        variantId: selectedVariant.id,
        quantity,
        countryCode,
        metadata: serviceMeta,
        unitPrice: customUnitPrice,
      })

      if (error) {
        alert("Ürün sepete eklenirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.")
        setIsAdding(false)
        return
      }

      if (selectedGiftVariantId) {
        const { addGiftToCart } = await import("@lib/data/cart")
        await addGiftToCart({
          variantId: selectedGiftVariantId,
          countryCode
        }).catch(err => {
          console.error("Failed to add gift:", err)
        })
      }

      if (selectedPrice) {
        trackAddToCart({
          id: product.id,
          title: product.title || "",
          price: effectiveUnitPriceNumber || 0,
          currency: (region?.currency_code || "TRY").toUpperCase(),
          quantity,
        })
      }

      // Automatic kupon olduğu için sepete eklendiğinde Medusa kendisi uygulayacak.
      setIsAdded(true)
      
      // Fire confetti if gift is added
      if (selectedGiftVariantId) {
        const confetti = (await import("canvas-confetti")).default
        confetti({
           particleCount: 100,
           spread: 70,
           origin: { y: 0.6 },
           colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
        })
      }

      setTimeout(() => {
        setIsAdded(false)
      }, 1500)
    } catch (e: any) {
      alert("Ürün sepete eklenirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.")
    } finally {
      setIsAdding(false)
    }
  }

  // Buy Now
  const handleBuyNow = async () => {
    if (!selectedVariant?.id) return null

    setIsBuyingNow(true)

    try {
      const serviceMeta = buildServiceMetadata()
      const rawBaseUnit = selectedPrice?.calculated_price_number || 0
      const customUnitPrice = addonUnitPriceNumber > 0 ? rawBaseUnit + addonUnitPriceNumber : undefined

      const error = await addToCart({
        variantId: selectedVariant.id,
        quantity,
        countryCode,
        metadata: serviceMeta,
        unitPrice: customUnitPrice,
      })

      if (error) {
        alert("Hemen al işlemi başlatılamadı. Lütfen sayfayı yenileyip tekrar deneyin.")
        setIsBuyingNow(false)
        return
      }

      if (selectedPrice) {
        trackAddToCart({
          id: product.id,
          title: product.title || "",
          price: effectiveUnitPriceNumber || 0,
          currency: (region?.currency_code || "TRY").toUpperCase(),
          quantity,
        })
      }

      // Automatic kupon olduğu için sepete eklendiğinde Medusa kendisi uygulayacak.

      router.push(`/${countryCode}/cart`)
    } catch (e: any) {
      alert("Hemen al işlemi başlatılamadı. Lütfen sayfayı yenileyip tekrar deneyin.")
    } finally {
      setIsBuyingNow(false)
    }
  }

  const lastTrackedProductRef = useRef<string | null>(null)

  // Track ViewContent event once per product page visit (deduplicated across variant/color/size changes)
  useEffect(() => {
    if (product?.id && selectedPrice) {
      const win = typeof window !== "undefined" ? (window as any) : null
      if (
        lastTrackedProductRef.current === product.id ||
        win?.__bkmLastViewContentProductId === product.id
      ) {
        return
      }
      lastTrackedProductRef.current = product.id
      if (win) {
        win.__bkmLastViewContentProductId = product.id
      }

      const priceNum = selectedPrice.calculated_price_number || 0
      trackViewContent({
        id: product.id,
        title: product.title || "",
        price: priceNum,
        currency: (region?.currency_code || "TRY").toUpperCase(),
        event_id: `vc_${product.id}_${Date.now()}`,
      })
    }
  }, [product?.id, selectedPrice?.calculated_price_number, product?.title, region?.currency_code])

  const whatsappServiceNotes: string[] = []
  if (quantity > 1) whatsappServiceNotes.push(`${quantity} adet`)
  if (boyaSelected && !vehicleCompat.isPrePaintedPianoBlack && !vehicleCompat.isTrunkMat) {
    whatsappServiceNotes.push(`+Boya Hizmeti (₺${BOYA_SERVICE_PRICE_TL})`)
  }
  if (montajSelected && !vehicleCompat.isTrunkMat) {
    whatsappServiceNotes.push(`+Montaj Hizmeti (₺${MONTAJ_SERVICE_PRICE_TL})`)
  }
  const whatsappUrl = `https://wa.me/${btnConfig.whatsapp_number}?text=${encodeURIComponent(
    `Merhaba, ${product.title}${whatsappServiceNotes.length ? ` (${whatsappServiceNotes.join(", ")})` : ""} ürününü satın almak istiyorum.`
  )}`

  return (
    <>
      <div className="flex flex-col gap-y-6" ref={actionsRef}>
        {/* Title & Favorites */}
        <div className="flex flex-col gap-y-2">
          <div className="flex items-start justify-between">
            <h1 className="font-sans text-3xl sm:text-4xl leading-tight text-black font-medium tracking-wide pr-4" data-testid="product-title">
              {product.title}
            </h1>
            <button
              onClick={toggleFavorite}
              aria-label="Favorilere Ekle"
              className="p-2 mt-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 text-black"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isFavorite ? "text-[#E50000]" : "text-black"}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {/* Star review trigger */}
          <a
            href="#product-reviews"
            className="flex items-center gap-2 mt-1 text-sm text-gray-500 hover:text-black cursor-pointer w-max"
          >
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5 fill-gray-200 text-gray-200"
                  aria-hidden="true"
                >
                  <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                </svg>
              ))}
            </div>
            <span>İlk değerlendiren siz olun</span>
          </a>
        </div>

        {/* Pricing Block */}
        <div className="flex flex-col gap-y-3">
          {selectedPrice && (
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center gap-x-4">
                {(selectedPrice.price_type === "sale" || hasActiveCoupon) && (
                  <div className="bg-[#E50000] text-white text-sm font-bold px-3 py-1.5 flex items-center justify-center tracking-widest shadow-sm">
                    %{hasActiveCoupon && (product.metadata?.coupon_badge as any)?.type === 'percent' 
                       ? (product.metadata?.coupon_badge as any)?.amount 
                       : selectedPrice.percentage_diff || ' İndirim'}
                  </div>
                )}
                <div className="flex flex-col items-start leading-[1.2]">
                  {(selectedPrice.price_type === "sale" || hasActiveCoupon) && (
                    <span
                      className="line-through text-[#666666] text-[15px] font-medium"
                      data-testid="original-product-price"
                      data-value={selectedPrice.original_price_number}
                    >
                      {selectedPrice.price_type === "sale" ? selectedPrice.original_price : selectedPrice.calculated_price}
                    </span>
                  )}
                  <span
                    className={`font-bold text-3xl transition-colors duration-300 ${hasActiveCoupon ? 'text-[#E50000]' : 'text-black'}`}
                    data-testid="product-price"
                    data-value={finalPriceNumber}
                  >
                    {finalPriceFormatted}
                  </span>
                </div>
              </div>

              {(addonUnitTl > 0 || quantity > 1) && (
                <div className="inline-flex flex-wrap items-center gap-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-md w-max max-w-full">
                  <span>
                    Parça: ₺{formatTlAmount(Math.round(baseUnitPriceNumber / 100))}
                  </span>
                  {boyaSelected && !vehicleCompat.isPrePaintedPianoBlack && !vehicleCompat.isTrunkMat && (
                    <span className="text-[#E50000] font-semibold">
                      + Boya (₺{formatTlAmount(BOYA_SERVICE_PRICE_TL)})
                    </span>
                  )}
                  {montajSelected && !vehicleCompat.isTrunkMat && (
                    <span className="text-zinc-900 font-semibold">
                      + Montaj (₺{formatTlAmount(MONTAJ_SERVICE_PRICE_TL)})
                    </span>
                  )}
                  {quantity > 1 && (
                    <span className="font-bold text-black">× {quantity} Adet</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Live view count */}
          {detailConfig.show_live_viewers !== false && (
            <div className="flex items-center gap-x-3 bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-black mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0"></span>
              <span className="tracking-wide">
                Şu an <strong>{viewerCount} kişi</strong> bu ürünü inceliyor.
              </span>
            </div>
          )}
        </div>

        {/* Trendyol Style Coupon Badge */}
        {product.metadata?.coupon_badge && (product.metadata.coupon_badge as any).active && (
          <div className="flex flex-col gap-y-2 mt-2">
            <div className="relative mt-4">
              {/* Countdown badge */}
              <div className="absolute -top-3 left-3 bg-[#b90000] text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 z-10 shadow-sm border border-white">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {couponTimeLeft}
              </div>
              <div className="flex items-center gap-4 bg-[#fdf5f2] border border-[#f5dcd2] rounded-lg p-3 pt-4 w-max max-w-full relative">
                {/* Left side */}
                <div className="flex flex-col gap-1 pr-6 border-r border-[#f5dcd2] border-dashed">
                  <span className="text-[#000] text-center font-semibold text-xl tracking-tight">
                    {(product.metadata.coupon_badge as any).type === "percent" ? "%" : ""}{(product.metadata.coupon_badge as any).amount}
                    {(product.metadata.coupon_badge as any).type === "fixed" ? " TL" : ""}
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText((product.metadata?.coupon_badge as any).code);
                      setShowCouponModal(true);
                      setCouponApplied(true);
                    }}
                    className="bg-[#f27a1a] text-white text-xs font-bold py-1.5 px-6 rounded hover:bg-[#e06912] transition-colors mt-1"
                  >
                    Kazan
                  </button>
                </div>
                {/* Right side */}
                <div className="flex flex-col text-[13px] text-gray-700 justify-center">
                  <span className="flex items-center gap-1.5 font-medium text-[#b90000]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    {couponUrgentText}
                  </span>
                  <span className="flex items-center gap-1 mt-3 font-semibold text-[#005288] hover:underline cursor-pointer">
                    Kuponun Ürünleri 
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Options Selection */}
        {(product.variants?.length ?? 0) > 1 && (
          <div>
            <div className="flex flex-col gap-y-6">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding || isBuyingNow}
                      product={product}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Scrolling Announcement Marquee for Product Details */}
        {scrollingTextEnabled && scrollingText && (
          <div
            className="overflow-hidden relative w-full select-none rounded-md my-1 shadow-sm border border-black/5"
            style={{ backgroundColor: scrollingTextBg }}
          >
            <style>{`
              @keyframes marquee-product {
                0% { transform: translate3d(0, 0, 0); }
                100% { transform: translate3d(-50%, 0, 0); }
              }
              .animate-marquee-product {
                display: inline-flex;
                white-space: nowrap;
                animation: marquee-product 35s linear infinite;
              }
            `}</style>
            <div className="flex w-max py-2.5">
              <div
                className="animate-marquee-product flex items-center text-[11px] font-bold uppercase tracking-wider"
                style={{ color: scrollingTextTextColor }}
              >
                <span>{scrollingText ? Array(6).fill(scrollingText).join("\u00A0\u00A0\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0\u00A0\u00A0") + "\u00A0\u00A0\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0\u00A0\u00A0" : ""}</span>
                <span>{scrollingText ? Array(6).fill(scrollingText).join("\u00A0\u00A0\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0\u00A0\u00A0") + "\u00A0\u00A0\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0\u00A0\u00A0" : ""}</span>
              </div>
            </div>
          </div>
        )}

        {/* Full-Width Sepete Ekle Butonu (Adet alanı ve Hemen Al kaldırıldı) */}
        <div className="flex flex-col gap-y-3 mt-1">
          <button
            onClick={handleAddToCart}
            disabled={
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              isBuyingNow ||
              !isValidVariant
            }
            className={`w-full h-14 uppercase tracking-widest text-[15px] rounded-lg transition-all duration-300 border-none font-bold flex items-center justify-center hover:opacity-90 ${
              !inStock || !isValidVariant || !selectedVariant || disabled
                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed opacity-50"
                : isAdded
                ? "bg-emerald-600 text-white"
                : "cursor-pointer"
            }`}
            style={
              !(!inStock || !isValidVariant || !selectedVariant || disabled) && !isAdded
                ? {
                    backgroundColor: btnConfig.add_to_cart_bg || "#000000",
                    color: btnConfig.add_to_cart_text_color || "#ffffff",
                  }
                : undefined
            }
            data-testid="add-product-button"
          >
            {!selectedVariant && !options
              ? "VARYANT SEÇİN"
              : !inStock || !isValidVariant
              ? "TÜKENDİ"
              : isAdding
              ? "EKLENİYOR..."
              : isAdded
              ? "EKLENDİ ✔"
              : btnConfig.add_to_cart_text || "SEPETE EKLE"}
          </button>
        </div>

        {/* ÖDEME & TAKSİT SEÇENEKLERİ TABLOSU (Sayfa Yapımıza Özel Tasarım) */}
        {activeTotalTl > 0 && (
          <div
            className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-sm"
            data-testid="payment-options-card"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-zinc-900 text-white flex items-center justify-center">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-900">
                  Ödeme Seçenekleri
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                256-Bit SSL Güvenli Ödeme
              </span>
            </div>

            <div className="divide-y divide-zinc-100 mt-1">
              {/* Havale / EFT · Tek Çekim */}
              <div className="py-3 flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-900">
                    Havale / EFT · Tek Çekim
                  </span>
                  <span className="text-xs text-zinc-500">
                    Tüm banka ve kredi kartları ile tek çekim veya havale
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-base font-extrabold text-zinc-900">
                    ₺{formatTlAmount(activeTotalTl)}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600">
                    Komisyonsuz
                  </span>
                </div>
              </div>

              {/* 2 Taksit */}
              {(() => {
                const total2 = activeTotalTl * 1.037
                const monthly2 = total2 / 2
                return (
                  <div className="py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-bold">
                        2 Taksit
                      </span>
                      <span className="text-xs text-zinc-500">Kredi Kartı</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-extrabold text-zinc-900">
                        ₺{formatTlAmount(monthly2, 2)}{" "}
                        <span className="text-xs font-semibold text-zinc-500">× 2</span>
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Toplam ₺{formatTlAmount(total2, 2)}
                      </span>
                    </div>
                  </div>
                )
              })()}

              {/* 3 Taksit */}
              {(() => {
                const total3 = activeTotalTl * 1.0575
                const monthly3 = total3 / 3
                return (
                  <div className="py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-bold">
                        3 Taksit
                      </span>
                      <span className="text-xs text-zinc-500">Kredi Kartı</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-extrabold text-zinc-900">
                        ₺{formatTlAmount(monthly3, 2)}{" "}
                        <span className="text-xs font-semibold text-zinc-500">× 3</span>
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Toplam ₺{formatTlAmount(total3, 2)}
                      </span>
                    </div>
                  </div>
                )
              })()}

              {/* 6 Taksit */}
              {(() => {
                const total6 = activeTotalTl * 1.115
                const monthly6 = total6 / 6
                return (
                  <div className="py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-bold">
                        6 Taksit
                      </span>
                      <span className="text-xs text-zinc-500">Kredi Kartı</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-extrabold text-zinc-900">
                        ₺{formatTlAmount(monthly6, 2)}{" "}
                        <span className="text-xs font-semibold text-zinc-500">× 6</span>
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Toplam ₺{formatTlAmount(total6, 2)}
                      </span>
                    </div>
                  </div>
                )
              })()}
            </div>

            <div className="mt-3 pt-3 border-t border-zinc-100 text-[11px] text-zinc-500 leading-relaxed">
              Taksit seçenekleri Ziraat, Halk, İş Bankası, Vakıfbank, Denizbank, QNB, Garanti,
              Yapı Kredi ve Akbank kredi kartlarında geçerlidir. Havale/EFT siparişlerinde IBAN
              ve sipariş açıklama kodu sipariş adımında ekranda ve e-postanızda paylaşılır.
            </div>
          </div>
        )}

        {children}

        {/* Collapsible Accordion Tabs */}
        <div className="w-full flex flex-col mt-2">
          {/* Description */}
          <div className="border-t border-gray-200 py-4">
            <button
              onClick={() => toggleAccordion("description")}
              className="w-full flex items-center justify-between text-left focus:outline-none"
            >
              <span className="text-sm font-bold uppercase tracking-widest text-[#111]">
                Ürün Açıklaması
              </span>
              <span className="text-2xl font-light text-[#111] leading-none mb-1">
                {activeAccordion === "description" ? "-" : "+"}
              </span>
            </button>
            {activeAccordion === "description" && (
              <div className="mt-4 transition-all duration-300">
                <div className="text-sm text-gray-600 leading-relaxed font-light">
                  <p className="font-normal font-sans txt-medium whitespace-pre-line text-[#444] text-[15px]">
                    {product.description || "Açıklama bulunmuyor."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Specs */}
          <div className="border-t border-gray-200 py-4">
            <button
              onClick={() => toggleAccordion("specs")}
              className="w-full flex items-center justify-between text-left focus:outline-none"
            >
              <span className="text-sm font-bold uppercase tracking-widest text-[#111]">
                Özellikler
              </span>
              <span className="text-2xl font-light text-[#111] leading-none mb-1">
                {activeAccordion === "specs" ? "-" : "+"}
              </span>
            </button>
            {activeAccordion === "specs" && (
              <div className="mt-4 transition-all duration-300">
                <div className="text-sm text-gray-600 leading-relaxed font-light">
                  <ul className="list-inside list-disc space-y-2 text-[#444] text-[15px]">
                    {product.material && (
                      <li>
                        <strong>Materyal:</strong> {product.material}
                      </li>
                    )}
                    {product.origin_country && (
                      <li>
                        <strong>Üretim Yeri:</strong> {product.origin_country}
                      </li>
                    )}
                    {product.type && (
                      <li>
                        <strong>Tür:</strong> {product.type.value}
                      </li>
                    )}
                    {product.weight && (
                      <li>
                        <strong>Ağırlık:</strong> {product.weight} g
                      </li>
                    )}
                    {!product.material &&
                      !product.origin_country &&
                      !product.type &&
                      !product.weight && <li>Ek özellik belirtilmemiş.</li>}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Shipping & Returns */}
          <div className="border-t border-gray-200 py-4">
            <button
              onClick={() => toggleAccordion("shipping")}
              className="w-full flex items-center justify-between text-left focus:outline-none"
            >
              <span className="text-sm font-bold uppercase tracking-widest text-[#111]">
                Kargo & İade
              </span>
              <span className="text-2xl font-light text-[#111] leading-none mb-1">
                {activeAccordion === "shipping" ? "-" : "+"}
              </span>
            </button>
            {activeAccordion === "shipping" && (
              <div className="mt-4 transition-all duration-300">
                <div className="text-sm text-gray-600 leading-relaxed font-light">
                  <div className="space-y-4 text-[#444] text-[15px]">
                    <p>
                      <strong className="text-black font-medium">Aynı Gün Kargo:</strong>{" "}
                      {detailConfig.shipping_info_text ||
                        "Saat 15:00'a kadar verilen tüm siparişleriniz aynı gün kargoya teslim edilmektedir. Teslimat süresi ortalama 1-3 iş günüdür."}
                    </p>
                    <p>
                      <strong className="text-black font-medium">Kolay İade:</strong>{" "}
                      {detailConfig.return_policy_text ||
                        "Siparişinizdeki ürünleri teslim aldığınız tarihten itibaren 14 gün içerisinde, kullanılmamış ve etiketleri sökülmemiş olması şartıyla iade edebilirsiniz."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-gray-200"></div>
        </div>

        {detailConfig.show_sticky_mobile_bar !== false && (
          <MobileActions
            product={product}
            variant={selectedVariant}
            options={options}
            updateOptions={setOptionValue}
            inStock={inStock}
            handleAddToCart={handleAddToCart}
            isAdding={isAdding}
            show={!inView}
            optionsDisabled={!!disabled || isAdding || isBuyingNow}
          />
        )}
      </div>

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCouponModal(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowCouponModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 border-2 border-green-500 text-green-500 rounded-full flex items-center justify-center mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">Kupon Tanımlandı</h3>
              <p className="text-[13px] text-gray-700 mb-6 px-4">
                Topladığın kupon hesabına tanımlandı. Daha fazla topla daha fazla kazan!
              </p>
              
              <p className="text-[12px] text-gray-500 mb-4">
                Gün içinde kalan kupon kazanma limitiniz: 49
              </p>
              
              <p className="text-[12px] text-gray-500">
                Toplanan tüm kuponlara hesap altından ulaşabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
