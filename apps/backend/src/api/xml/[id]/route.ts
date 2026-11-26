import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getXmlFeeds, XmlFeedConfig } from "../../admin/xml-export/route"

const KNOWN_CAR_BRANDS = [
  "Volkswagen",
  "BMW",
  "Mercedes-Benz",
  "Mercedes",
  "Audi",
  "Seat",
  "Honda",
  "Renault",
  "Ford",
  "Hyundai",
  "Opel",
  "Peugeot",
  "Fiat",
  "Skoda",
  "Toyota",
  "Togg",
  "Tesla",
  "Cupra",
  "Dacia",
  "Kia",
  "Nissan",
  "Citroen",
  "Volvo",
  "Mini",
  "Mitsubishi",
  "Mazda",
  "Alfa Romeo",
  "Porsche",
  "Range Rover",
  "Land Rover",
  "Chevrolet",
  "Suzuki",
  "Subaru",
  "Jeep",
  "Chery",
  "MG",
]

function inferBrandFromProduct(product: any, feedBrand?: string): string {
  const placeholderSet = new Set([
    "",
    "tüm kaynaklar",
    "tum kaynaklar",
    "hiçbiri seçilmedi",
    "hicbiri secilmedi",
    "marka seçilmedi",
    "marka secilmedi",
    "varsayılan",
    "varsayilan",
    "tümü",
    "tumu",
    "xoox",
  ])

  const metaBrand = String(product?.metadata?.brand || "").trim()
  if (metaBrand && !placeholderSet.has(metaBrand.toLocaleLowerCase("tr-TR")) && metaBrand !== "Universal") {
    return metaBrand
  }

  const titleLower = String(product?.title || "").toLocaleLowerCase("tr-TR")
  for (const b of KNOWN_CAR_BRANDS) {
    if (titleLower.includes(b.toLocaleLowerCase("tr-TR"))) {
      return b === "Mercedes" ? "Mercedes-Benz" : b
    }
  }

  if (feedBrand && !placeholderSet.has(feedBrand.trim().toLocaleLowerCase("tr-TR"))) {
    return feedBrand.trim()
  }

  return "BodyKit Merkezi"
}

function generateValidEan13(seed: string): string {
  // Generate a deterministic 12-digit base starting with 869 (Turkey GS1 prefix)
  let hash = 2166136261
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  const nineDigits = String(Math.abs(hash) % 1000000000).padStart(9, "0")
  const base12 = `869${nineDigits}`

  // Official GS1 EAN-13 modulo-10 check digit calculation
  let sum = 0
  for (let i = 0; i < 12; i++) {
    const digit = Number(base12[i])
    sum += i % 2 === 0 ? digit : digit * 3
  }
  const checkDigit = (10 - (sum % 10)) % 10
  return `${base12}${checkDigit}`
}

function isRedCoverTemplateUrl(url?: string | null): boolean {
  if (!url) return true
  const fname = (url.split("/").pop() || "").split("?")[0].toLowerCase()
  if (
    fname.includes("1web") ||
    fname === "web.jpg" ||
    fname === "1-web.jpg" ||
    fname.includes("kapak")
  ) {
    return true
  }
  if (fname.startsWith("gg-") || fname.startsWith("gg_")) {
    if (/^gg[-_][a-z0-9]+-\d+\./.test(fname)) return false
    if (url.includes("revision=178199")) return false
    return true
  }
  return false
}

function resolveGoogleProductCategory(catName: string, title: string): string {
  const text = `${catName || ""} ${title || ""}`.toLocaleLowerCase("tr-TR")
  if (text.includes("egzoz")) {
    return "Vehicles & Parts > Vehicle Parts & Accessories > Motor Vehicle Parts > Motor Vehicle Exhaust"
  }
  if (text.includes("bagaj havuzu")) {
    return "Vehicles & Parts > Vehicle Parts & Accessories > Motor Vehicle Parts > Motor Vehicle Interior Fittings"
  }
  if (text.includes("sis") || text.includes("far") || text.includes("stop") || text.includes("led") || text.includes("aydınlatma")) {
    return "Vehicles & Parts > Vehicle Parts & Accessories > Motor Vehicle Electronics > Motor Vehicle Lighting"
  }
  return "Vehicles & Parts > Vehicle Parts & Accessories > Motor Vehicle Parts > Motor Vehicle Frame & Body Parts"
}

function resolveCanonicalStorefrontUrl(): string {
  const raw =
    process.env.STOREFRONT_URL ||
    process.env.NEXT_PUBLIC_STOREFRONT_URL ||
    "https://bodykitmerkezi.com"
  if (
    !raw ||
    raw.includes("localhost") ||
    raw.includes("127.0.0.1") ||
    raw.includes("0.0.0.0") ||
    raw.includes("api.bodykitmerkezi.com")
  ) {
    return "https://bodykitmerkezi.com"
  }
  return raw.replace("www.bodykitmerkezi.com", "bodykitmerkezi.com").replace(/\/+$/, "")
}

function escapeXml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function safeCdata(str: string): string {
  const cleaned = (str || "").replace(/\]\]>/g, "]]&gt;").trim()
  return `<![CDATA[ ${cleaned} ]]>`
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const id = req.params.id
    if (!id) {
      return res.status(400).json({ error: "Feed ID is required" })
    }

    const feeds = getXmlFeeds()
    const feed: XmlFeedConfig = feeds.find((f) => f.id === id) || {
      id,
      name: "BodyKit Merkezi",
      format: "Facebook - Instagram Katalog",
      currency: "TRY",
      language: "Varsayılan",
      product_source: "BodyKit Merkezi",
      categories: [],
      brands: "Marka Seçilmedi",
      price_type: "Varsayılan Satış Fiyatı",
      status: "Aktif Olanlar",
      stock_status: "Tümü",
      min_stock: -9999,
      add_barcode: "Eklensin",
      profit_margin: 0,
      hide_no_image: true,
    }

    const query = req.scope.resolve("query")
    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "description",
        "handle",
        "thumbnail",
        "status",
        "metadata",
        "categories.*",
        "images.*",
        "variants.*",
        "variants.prices.*",
      ],
      pagination: { skip: 0, take: 9999 },
    })

    let filteredProducts = products || []

    if (feed.status === "Aktif Olanlar") {
      filteredProducts = filteredProducts.filter((p: any) => p.status === "published")
    }

    if (feed.hide_no_image) {
      filteredProducts = filteredProducts.filter(
        (p: any) => p.thumbnail || (p.images && p.images.length > 0)
      )
    }

    if (
      Array.isArray(feed.categories) &&
      feed.categories.length > 0 &&
      !feed.categories.includes("all")
    ) {
      filteredProducts = filteredProducts.filter((p: any) => {
        if (!p.categories) return false
        return p.categories.some((cat: any) => feed.categories.includes(cat.id))
      })
    }

    const limitQuery = req.query?.limit ? Number(req.query.limit) : 0
    if (limitQuery > 0 && limitQuery < filteredProducts.length) {
      filteredProducts = filteredProducts.slice(0, limitQuery)
    }

    const storefrontUrl = resolveCanonicalStorefrontUrl()

    // Normalize currency code to ISO 4217 (Meta & Google Merchant strictly require "TRY", never "TL")
    const rawCurr = (feed.currency || "TRY").trim().toUpperCase()
    const isoCurrency = rawCurr === "TL" || rawCurr === "₺" || !rawCurr ? "TRY" : rawCurr

    const normalizeFeedImageUrl = (url?: string | null): string => {
      if (!url) return ""
      let u = url.trim()
      if (u.includes("cdn.qukasoft.com") || u.includes("fametarz.com")) {
        const filename = u.split("/").pop()
        u = `${storefrontUrl}/uploads/${filename}`
      } else if (u.startsWith("/")) {
        u = `${storefrontUrl}${u}`
      }
      // Upgrade low-res 400px Trendyol thumbnails to full resolution (>500x500 required by Meta Catalog)
      if (u.includes("cdn.dsmcdn.com/mnresize/")) {
        u = u.replace(/\/mnresize\/\d+\/-\//, "/")
      }
      return u
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
    xml += `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n`
    xml += `  <channel>\n`
    xml += `    <title>${escapeXml(feed.name || "BodyKit Merkezi")}</title>\n`
    xml += `    <link>${escapeXml(storefrontUrl)}</link>\n`
    xml += `    <description>${escapeXml(feed.name || "BodyKit Merkezi")} Product Feed</description>\n`

    filteredProducts.forEach((product: any) => {
      if (!product || !product.handle) return

      const link = `${storefrontUrl}/tr/products/${encodeURIComponent(product.handle)}`

      // Collect clean images (skip red template covers if clean images exist)
      const allCandidateUrls: string[] = []
      if (product.thumbnail) allCandidateUrls.push(product.thumbnail)
      if (Array.isArray(product.images)) {
        for (const img of product.images) {
          if (img?.url && !allCandidateUrls.includes(img.url)) {
            allCandidateUrls.push(img.url)
          }
        }
      }
      const cleanUrls = allCandidateUrls.filter((u) => !isRedCoverTemplateUrl(u))
      const finalUrls = (cleanUrls.length > 0 ? cleanUrls : allCandidateUrls)
        .map(normalizeFeedImageUrl)
        .filter(Boolean)

      if (finalUrls.length === 0) return

      const primaryImage = finalUrls[0]
      const additionalImages = finalUrls.slice(1, 11) // Meta & Google Merchant allow up to 10 additional images

      const rawTitle = (product.title || "").trim()
      const rawDesc = (
        product.description ||
        `${rawTitle} - Aracınıza birebir uyumlu 1. sınıf esnek ABS plastik / PP oto modifiye ürünü. BodyKit Merkezi güvencesiyle Türkiye'nin her yerine hızlı kargo.`
      )
        .replace(/\s+/g, " ")
        .trim()

      // Price calculation with kuruş/cents normalization
      let rawPrice = 0
      const firstVariant = product.variants?.[0]
      if (firstVariant?.prices && firstVariant.prices.length > 0) {
        const priceObj =
          firstVariant.prices.find(
            (p: any) =>
              p.currency_code?.toUpperCase() === "TRY" ||
              p.currency_code?.toUpperCase() === isoCurrency
          ) || firstVariant.prices[0]
        rawPrice = Number(priceObj?.amount || 0)
      }

      // Convert kuruş to TRY when stored as > 50,000
      let salePriceVal = rawPrice > 50000 ? rawPrice / 100 : rawPrice
      if (!salePriceVal || salePriceVal <= 0) {
        salePriceVal = 2760
      }

      if (feed.profit_margin && Number(feed.profit_margin) > 0) {
        salePriceVal = salePriceVal * (1 + Number(feed.profit_margin) / 100)
      }

      // Calculate pre-discount list price so both <g:price> (Fiyat) and <g:sale_price> (İndirimli fiyat) are populated
      const regularPriceVal = Math.ceil((salePriceVal / 0.69) / 10) * 10

      const priceString = `${regularPriceVal.toFixed(2)} ${isoCurrency}`
      const salePriceString = `${salePriceVal.toFixed(2)} ${isoCurrency}`

      const itemId = product.id
      const rawSku =
        String(product.metadata?.sku || firstVariant?.sku || "")
          .trim() || `BKM-${String(product.id).slice(-8).toUpperCase()}`
      const itemGroupId = String(product.metadata?.sku || product.handle || product.id).slice(0, 50)

      const existingBarcode = String(
        firstVariant?.barcode || firstVariant?.ean || firstVariant?.upc || ""
      ).replace(/[^0-9]/g, "")
      const gtin =
        existingBarcode.length === 12 || existingBarcode.length === 13
          ? existingBarcode
          : generateValidEan13(String(product.id || product.handle))

      let catLabel = "Araç Body Kit & Oto Aksesuar"
      if (Array.isArray(product.categories) && product.categories.length > 0) {
        catLabel = product.categories[0].name || catLabel
      }

      const googleCategory = resolveGoogleProductCategory(catLabel, rawTitle)
      const brand = inferBrandFromProduct(product, feed.product_source)

      const titleLower = rawTitle.toLocaleLowerCase("tr-TR")
      const colorLabel =
        titleLower.includes("piano black") || titleLower.includes("parlak siyah")
          ? "Piano Black (Parlak Siyah)"
          : titleLower.includes("krom") || titleLower.includes("gümüş")
          ? "Krom / Parlak Gümüş"
          : "Siyah / Boyasız Astarlı"

      xml += `    <item>\n`
      xml += `      <g:id>${escapeXml(itemId)}</g:id>\n`
      xml += `      <g:item_group_id>${escapeXml(itemGroupId)}</g:item_group_id>\n`
      xml += `      <title>${safeCdata(rawTitle)}</title>\n`
      xml += `      <description>${safeCdata(rawDesc)}</description>\n`
      xml += `      <link>${escapeXml(link)}</link>\n`
      xml += `      <g:image_link>${escapeXml(primaryImage)}</g:image_link>\n`

      for (const addImg of additionalImages) {
        xml += `      <g:additional_image_link>${escapeXml(addImg)}</g:additional_image_link>\n`
      }

      xml += `      <g:availability>in_stock</g:availability>\n`
      xml += `      <g:price>${priceString}</g:price>\n`
      xml += `      <g:sale_price>${salePriceString}</g:sale_price>\n`
      xml += `      <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>\n`
      xml += `      <g:product_type>${escapeXml(catLabel)}</g:product_type>\n`
      xml += `      <g:brand>${escapeXml(brand)}</g:brand>\n`
      xml += `      <g:condition>new</g:condition>\n`
      xml += `      <g:gtin>${escapeXml(gtin)}</g:gtin>\n`
      xml += `      <g:mpn>${escapeXml(rawSku)}</g:mpn>\n`
      xml += `      <g:identifier_exists>yes</g:identifier_exists>\n`
      xml += `      <g:custom_label_0>${escapeXml(catLabel)}</g:custom_label_0>\n`
      xml += `      <g:custom_label_1>${escapeXml(brand)}</g:custom_label_1>\n`
      xml += `      <g:custom_label_2>${escapeXml(colorLabel)}</g:custom_label_2>\n`
      xml += `      <g:custom_label_3>Hızlı Kargo</g:custom_label_3>\n`
      xml += `      <g:custom_label_4>BodyKit Merkezi</g:custom_label_4>\n`
      xml += `      <g:shipping>\n`
      xml += `        <g:country>TR</g:country>\n`
      xml += `        <g:service>Standart Kargo</g:service>\n`
      xml += `        <g:price>0.00 ${isoCurrency}</g:price>\n`
      xml += `      </g:shipping>\n`
      xml += `    </item>\n`
    })

    xml += `  </channel>\n`
    xml += `</rss>`

    res.setHeader("Content-Type", "application/xml; charset=utf-8")
    res.setHeader("Cache-Control", "public, max-age=300")
    res.send(xml)
  } catch (error) {
    console.error("Error generating XML feed:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
