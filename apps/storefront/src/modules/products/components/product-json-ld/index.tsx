import React from "react"
import { HttpTypes } from "@medusajs/types"
import { extractVehicleCompatibility } from "@modules/products/components/product-actions/vehicle-compatibility"
import {
  generateUniqueProductReviews,
  getProductReviewSummary,
} from "@modules/products/components/product-reviews/generate-product-reviews"
import { getProductPrice } from "@lib/util/get-product-price"

type ProductJsonLdProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode?: string
}

function normalizeCleanImageUrl(url?: string | null): string {
  if (!url) return ""
  if (
    url.includes("media.kitgaraj.com") &&
    (url.includes("/plus/") || url.includes("/temiz/") || url.includes("-showroom."))
  ) {
    return `https://bodykitmerkezi.com/api/clean-image?url=${encodeURIComponent(url)}`
  }
  return url
}

export default function ProductJsonLd({
  product,
  region,
  countryCode = "tr",
}: ProductJsonLdProps) {
  if (!product || !product.id) return null

  const compat = extractVehicleCompatibility(
    product.title || "",
    product.description,
    product.metadata as Record<string, any>
  )

  const reviewSummary = getProductReviewSummary(product)
  const reviewsList = generateUniqueProductReviews(product)

  const priceObj = getProductPrice({ product })
  const basePriceNum =
    priceObj.cheapestPrice?.calculated_price_number ||
    priceObj.variantPrice?.calculated_price_number ||
    0
  const priceInTl = basePriceNum > 0 ? (basePriceNum / 100).toFixed(2) : "0.00"

  const canonicalUrl = `https://bodykitmerkezi.com/${countryCode}/products/${product.handle}`

  // Images
  const rawImages = [
    ...(product.images?.map((img) => img?.url) || []),
    product.thumbnail,
  ].filter(Boolean) as string[]

  const distinctImages: string[] = []
  for (const imgUrl of rawImages) {
    const clean = normalizeCleanImageUrl(imgUrl)
    if (clean && !distinctImages.includes(clean)) {
      distinctImages.push(clean)
    }
  }

  const sku =
    product.variants?.[0]?.sku ||
    (product.metadata as any)?.sku ||
    `BKM-${product.id.slice(0, 8).toUpperCase()}`

  const surfaceCondition = compat.isPrePaintedPianoBlack
    ? "Parlak Siyah (Piano Black) boyalı yüzey"
    : compat.isTrunkMat
    ? "Kalıba özel kullanıma hazır"
    : "Boyasız (ham yüzey)"

  const richDescription =
    product.description?.trim() ||
    `${compat.brandAndModel} (${compat.startYear}-${compat.endYear}) ${compat.chassisLabel} ile birebir uyumlu ${product.title}. 1. sınıf esnek ABS plastik malzeme, ${surfaceCondition}, opsiyonel profesyonel fırın boya ve montaj imkanı. BodyKit Merkezi güvencesiyle 1–3 iş gününde kargo ve 14 gün iade garantisi.`

  // 1. PRODUCT SCHEMA
  const productSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${canonicalUrl}#product`,
    name: product.title,
    url: canonicalUrl,
    description: richDescription,
    image: distinctImages.length > 0 ? distinctImages : undefined,
    sku: sku,
    mpn: sku,
    brand: {
      "@type": "Brand",
      name: compat.brandAndModel || "BodyKit Merkezi",
    },
    manufacturer: {
      "@type": "Organization",
      name: "BodyKit Merkezi",
      url: "https://bodykitmerkezi.com",
    },
    category: "Motor Vehicle Parts & Accessories > Exterior Styling",
    itemCondition: "https://schema.org/NewCondition",
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: region.currency_code ? region.currency_code.toUpperCase() : "TRY",
      price: priceInTl,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "BodyKit Merkezi",
        url: "https://bodykitmerkezi.com",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: region.currency_code ? region.currency_code.toUpperCase() : "TRY",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "TR",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "d",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "d",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "TR",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: reviewSummary.averageRating,
      reviewCount: reviewSummary.count,
      bestRating: "5",
      worstRating: "1",
    },
    review: reviewsList.map((rev) => {
      // Parse DD.MM.YYYY to ISO date YYYY-MM-DD
      let datePublished = new Date().toISOString().split("T")[0]
      if (rev.created_at && rev.created_at.includes(".")) {
        const parts = rev.created_at.split(".")
        if (parts.length === 3) {
          datePublished = `${parts[2]}-${parts[1]}-${parts[0]}`
        }
      }
      return {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: rev.customer_name,
        },
        datePublished,
        reviewRating: {
          "@type": "Rating",
          ratingValue: rev.rating,
          bestRating: "5",
          worstRating: "1",
        },
        reviewBody: rev.comment,
      }
    }),
  }

  // 2. BREADCRUMBLIST SCHEMA
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Anasayfa",
        item: `https://bodykitmerkezi.com/${countryCode}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Mağaza",
        item: `https://bodykitmerkezi.com/${countryCode}/store`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: compat.brandAndModel || "Body Kit",
        item: `https://bodykitmerkezi.com/${countryCode}/store?q=${encodeURIComponent(
          compat.brandAndModel || ""
        )}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.title,
        item: canonicalUrl,
      },
    ],
  }

  // 3. FAQPAGES SCHEMA (Rich expandable Google search snippets)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${product.title} aracıma birebir uyumlu mu?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Ruhsatınızdaki model yılı ${compat.startYear} ile ${compat.endYear} arasındaysa ${compat.brandAndModel} (${compat.chassisLabel}) aracınızla birebir uyumludur. Aracınızın orijinal bağlantı ve tampon kavislerine sıfıra sıfır oturacak kalıpta üretilmiştir.`,
        },
      },
      {
        "@type": "Question",
        name: "Ürün boyalı mı, boyasız mı gönderilir?",
        acceptedAnswer: {
          "@type": "Answer",
          text: compat.isPrePaintedPianoBlack
            ? "Bu ürün fabrikasyon parlak siyah (Piano Black) boyalı yüzey olarak gönderilir, ek boya gerektirmez."
            : compat.isTrunkMat
            ? "Bu ürün araca özel birebir kalıpta kullanıma hazır olarak gönderilmektedir."
            : "Standart olarak boyasız (ham yüzey) gönderilir. Dilerseniz sipariş verirken profesyonel fırın boya hizmetimizi ekleyerek aracınızın orijinal renk kodunda boyalı olarak teslim alabilirsiniz.",
        },
      },
      {
        "@type": "Question",
        name: "Kargoda hasar görürse değişim yapılıyor mu?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Evet. BodyKit Merkezi güvencesiyle kargoda oluşabilecek her türlü hasarda kargo görevlisiyle birlikte tutanak tutulduğu takdirde birebir ücretsiz değişim yapılmaktadır. Kargo ücreti tarafımıza aittir.",
        },
      },
      {
        "@type": "Question",
        name: "Sipariş ne zaman kargolanır ve iade hakkı var mı?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Stoktaki ürünlerimiz 1–3 iş günü içerisinde özenle paketlenerek kargoya verilir. Mesafeli satış mevzuatı kapsamında kullanılmamış ve montajı yapılmamış ürünlerde 14 gün cayma ve iade hakkınız mevcuttur.",
        },
      },
    ],
  }

  const allSchemas = [productSchema, breadcrumbSchema, faqSchema]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(allSchemas) }}
    />
  )
}
