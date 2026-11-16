import { MedusaContainer } from "@medusajs/framework/types"
import { createProductsWorkflow, createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows"
import * as fs from "fs"
import * as path from "path"

export interface GunesliGarajProductItem {
  handle: string
  title: string
  brand: string
  price_tl: number
  primary_category: string
  categories: string[]
  images: string[]
  thumbnail: string
}

export const REQUIRED_CATEGORIES: { handle: string; name: string; description: string }[] = [
  { handle: "bodykit", name: "Bodykit Setleri", description: "Aracınıza birebir uyumlu komple bodykit setleri" },
  { handle: "body-kit", name: "BODY KİT", description: "Aracınıza birebir uyumlu komple body kit setleri" },
  { handle: "body-kit-seti", name: "Body Kit Seti", description: "Komple plastik ve PP body kit setleri" },
  { handle: "on-tampon-eki", name: "Ön Tampon Eki", description: "Aracınıza özel ön tampon eki ve ön ek modelleri" },
  { handle: "tampon-ek", name: "Tampon Ekleri", description: "Ön lip, ön ek ve arka tampon ekleri" },
  { handle: "on-tampon", name: "ÖN TAMPON", description: "Ön tampon, ön ek ve ön lip modelleri" },
  { handle: "on-lip", name: "Ön Lip", description: "Sportif ön lip ve tampon altı splitter modelleri" },
  { handle: "arka-ek", name: "Arka Ek", description: "Arka tampon eki modelleri" },
  { handle: "arka-tampon", name: "ARKA TAMPON", description: "Arka tampon, arka ek ve difüzör modelleri" },
  { handle: "arka-tampon-difuzoru", name: "Arka Tampon Difüzörü", description: "Aracınıza özel arka tampon difüzör modelleri" },
  { handle: "difuzor", name: "Difüzör", description: "Çift çıkışlı ve sportif arka tampon difüzörleri" },
  { handle: "marspiyel", name: "Marşpiyel", description: "Sağ-sol takım yan marşpiyel ve marşpiyel altı lip modelleri" },
  { handle: "spoiler", name: "Spoiler", description: "Bagaj üstü ve tavan spoiler (spoyler) modelleri" },
  { handle: "spoiler-citasi", name: "Spoiler Çıtası", description: "Spoiler çıtası ve bagaj üstü çıta modelleri" },
  { handle: "panjur", name: "Ön Panjur", description: "Spor ön panjur ve böbrek ızgara modelleri" },
  { handle: "on-panjur", name: "Ön Panjur Modelleri", description: "Aracınıza özel spor ön panjur modelleri" },
  { handle: "bagaj-havuzu", name: "Bagaj Havuzu", description: "3D havuzlu, koku yapmayan aracınıza özel bagaj havuzu" },
  { handle: "aksesuar", name: "Aksesuar", description: "İç ve dış oto modifiye aksesuarları" },
  { handle: "oto-aksesuar", name: "OTO AKSESUAR", description: "Oto modifiye ve dış aksesuar ürünleri" },
  { handle: "oto-aksesuarlari", name: "Oto Aksesuarları", description: "Aracınıza özel modifiye ve dış aksesuar çeşitleri" },
  { handle: "tampon", name: "Tampon", description: "Ön ve arka spor tampon modelleri" },
  { handle: "aydinlatma", name: "Aydınlatma", description: "LED far, stop ve sis aydınlatma ürünleri" },
]

export function inferCategoriesFromText(primaryCat: string, title: string, slug: string): string[] {
  const cats = new Set<string>()
  const text = `${title || ""} ${slug || ""}`
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")

  if (
    primaryCat === "on-tampon-eki" ||
    text.includes("on-ek") ||
    text.includes("on ek") ||
    text.includes("on-flap") ||
    text.includes("on flap")
  ) {
    cats.add("on-tampon-eki")
    cats.add("tampon-ek")
    cats.add("on-tampon")
  }
  if (primaryCat === "on-lip" || text.includes("on-lip") || text.includes("on lip")) {
    cats.add("on-lip")
    cats.add("tampon-ek")
    cats.add("on-tampon")
  }
  if (
    primaryCat === "arka-ek" ||
    text.includes("arka-ek") ||
    text.includes("arka ek") ||
    text.includes("arka-tampon-eki")
  ) {
    cats.add("arka-ek")
    cats.add("tampon-ek")
    cats.add("arka-tampon")
  }
  if (primaryCat === "tampon" || text.includes("on-tampon") || text.includes("arka-tampon")) {
    cats.add("tampon")
    cats.add("tampon-ek")
    if (text.includes("arka")) cats.add("arka-tampon")
    else cats.add("on-tampon")
  }
  if (primaryCat === "arka-tampon-difuzoru" || text.includes("difuzor")) {
    cats.add("arka-tampon-difuzoru")
    cats.add("difuzor")
    cats.add("arka-tampon")
  }
  if (
    primaryCat === "body-kit-seti" ||
    text.includes("body-kit") ||
    text.includes("bodykit") ||
    text.includes("body kit")
  ) {
    cats.add("body-kit-seti")
    cats.add("bodykit")
    cats.add("body-kit")
  }
  if (
    primaryCat === "marspiyel" ||
    text.includes("marspiyel") ||
    text.includes("marsbiyel") ||
    text.includes("marsiyel")
  ) {
    if (text.includes("panjur")) {
      cats.add("on-panjur")
      cats.add("panjur")
    } else {
      cats.add("marspiyel")
    }
  }
  if (
    primaryCat === "spoiler" ||
    primaryCat === "spoiler-citasi" ||
    text.includes("spoiler") ||
    text.includes("spoyler")
  ) {
    cats.add("spoiler")
    if (primaryCat === "spoiler-citasi" || text.includes("citasi")) {
      cats.add("spoiler-citasi")
    }
  }
  if (primaryCat === "on-panjur" || text.includes("panjur")) {
    cats.add("on-panjur")
    cats.add("panjur")
  }
  if (primaryCat === "bagaj-havuzu" || text.includes("bagaj-havuzu") || text.includes("bagaj havuzu")) {
    cats.add("bagaj-havuzu")
    cats.add("aksesuar")
    cats.add("oto-aksesuar")
  }
  if (primaryCat === "oto-aksesuarlari" || cats.size === 0) {
    cats.add("oto-aksesuarlari")
    cats.add("aksesuar")
    cats.add("oto-aksesuar")
  }

  return Array.from(cats)
}

function buildDescription(title: string): string {
  return `${title}, aracınıza özel sportif ve estetik bir görünüm kazandıran birinci sınıf oto modifiye ürünüdür. Yüksek kaliteli esnek ABS/plastik malzemeden üretilmiş olup darbelere karşı dayanıklı ve uzun ömürlüdür.\n\n• Aracınızın orijinal şasi ve tampon ölçüleriyle birebir uyumludur.\n• Kolay montaj imkanı sunar, aracınızın aerodinamik yapısını güçlendirir.\n• Koku yapmaz, leke tutmaz ve dış hava koşullarına karşı yüksek direnç gösterir.\n• Paket İçeriği: ${title}\n• 2 Yıl Üretici Garantisi ve Türkiye'nin her yerine güvenli kargo imkanı.`
}

function loadCatalogJson(): GunesliGarajProductItem[] {
  const candidates = [
    path.join(process.cwd(), "src", "data", "gunesligaraj-catalog.json"),
    path.join(process.cwd(), "..", "..", "src", "data", "gunesligaraj-catalog.json"),
    path.join(process.cwd(), ".medusa", "server", "src", "data", "gunesligaraj-catalog.json"),
    path.join(__dirname, "..", "data", "gunesligaraj-catalog.json"),
    path.join(__dirname, "..", "..", "..", "src", "data", "gunesligaraj-catalog.json"),
  ]
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf-8"))
    }
  }
  return []
}

let isSyncRunning = false

export async function syncGunesliGarajCatalog(container: MedusaContainer) {
  if (isSyncRunning) {
    return { status: "already_running", message: "Senkronizasyon şu anda devam ediyor." }
  }
  isSyncRunning = true

  try {
    const catalog = loadCatalogJson()
    if (!catalog || catalog.length === 0) {
      isSyncRunning = false
      return { status: "error", message: "gunesligaraj-catalog.json bulunamadı veya boş." }
    }

    const productModuleService = container.resolve("product") as any
    const salesChannelService = container.resolve("sales_channel") as any
    const fulfillmentService = container.resolve("fulfillment") as any

    const channels = await salesChannelService.listSalesChannels()
    const channelId = channels[0]?.id

    const shippingProfiles = await fulfillmentService.listShippingProfiles()
    const defaultProfileId = shippingProfiles[0]?.id

    // 1. Ensure all required categories exist
    const existingCategories = await productModuleService.listProductCategories({}, { take: 1000 })
    const catByHandle = new Map<string, string>()

    for (const c of existingCategories) {
      if (c.handle) catByHandle.set(c.handle.toLowerCase(), c.id)
      const normName = (c.name || "")
        .toLocaleLowerCase("tr-TR")
        .replace(/ı/g, "i")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
      if (normName && !catByHandle.has(normName)) {
        catByHandle.set(normName, c.id)
      }
    }

    const missingCategories = REQUIRED_CATEGORIES.filter((rc) => !catByHandle.has(rc.handle.toLowerCase()))
    if (missingCategories.length > 0) {
      try {
        const { result: createdCats } = await createProductCategoriesWorkflow(container).run({
          input: {
            product_categories: missingCategories.map((mc) => ({
              name: mc.name,
              handle: mc.handle,
              description: mc.description,
              is_active: true,
              is_internal: false,
            })),
          },
        })
        for (const cc of createdCats || []) {
          if (cc.handle) catByHandle.set(cc.handle.toLowerCase(), cc.id)
        }
      } catch (e) {
        // Fallback: create one by one in case a handle collided
        for (const mc of missingCategories) {
          try {
            const { result: singleCat } = await createProductCategoriesWorkflow(container).run({
              input: {
                product_categories: [
                  {
                    name: mc.name,
                    handle: mc.handle,
                    description: mc.description,
                    is_active: true,
                    is_internal: false,
                  },
                ],
              },
            })
            if (singleCat?.[0]?.id) {
              catByHandle.set(mc.handle.toLowerCase(), singleCat[0].id)
            }
          } catch {}
        }
      }
    }

    // Re-fetch categories to make sure map is 100% complete
    const allCategories = await productModuleService.listProductCategories({}, { take: 1000 })
    for (const c of allCategories) {
      if (c.handle) catByHandle.set(c.handle.toLowerCase(), c.id)
    }

    // 2. Fetch existing products in DB
    const existingProducts = await productModuleService.listProducts(
      {},
      { take: 5000, relations: ["categories"] }
    )
    const existingByHandle = new Map<string, any>()
    const existingByTitle = new Map<string, any>()

    for (const ep of existingProducts) {
      if (ep.handle) existingByHandle.set(ep.handle.toLowerCase(), ep)
      if (ep.title) existingByTitle.set(ep.title.trim().toLowerCase(), ep)
    }

    // Separate catalog into new products vs existing products
    const toCreate: any[] = []
    const categoryLinksToInsert: { productId: string; categoryId: string }[] = []
    const thumbnailUpdates: { productId: string; thumbnail: string; images: string[] }[] = []

    for (const item of catalog) {
      const targetCatIds = Array.from(
        new Set(
          (item.categories || [])
            .map((ch) => catByHandle.get(ch.toLowerCase()))
            .filter(Boolean) as string[]
        )
      )

      const existing =
        existingByHandle.get(item.handle.toLowerCase()) ||
        existingByTitle.get(item.title.trim().toLowerCase())

      if (existing) {
        const currentCatIds = new Set((existing.categories || []).map((c: any) => c.id))
        for (const cid of targetCatIds) {
          if (!currentCatIds.has(cid)) {
            categoryLinksToInsert.push({ productId: existing.id, categoryId: cid })
          }
        }
        if ((!existing.thumbnail || existing.thumbnail === "") && item.thumbnail) {
          thumbnailUpdates.push({
            productId: existing.id,
            thumbnail: item.thumbnail,
            images: item.images || [item.thumbnail],
          })
        }
      } else {
        const skuClean = item.handle
          .replace(/[^a-zA-Z0-9]/g, "")
          .slice(0, 24)
          .toUpperCase()

        toCreate.push({
          title: item.title,
          handle: item.handle,
          description: buildDescription(item.title),
          status: "published" as any,
          shipping_profile_id: defaultProfileId,
          thumbnail: item.thumbnail || item.images?.[0] || "",
          images: (item.images || []).map((url) => ({ url })),
          categories: targetCatIds.map((id) => ({ id })),
          sales_channels: channelId ? [{ id: channelId }] : [],
          metadata: {
            brand: item.brand || "",
            source: "gunesligaraj",
            primary_category: item.primary_category || "",
          },
          options: [{ title: "Title", values: ["Default Title"] }],
          variants: [
            {
              title: "Standart",
              sku: `GG-${skuClean}-${Math.floor(100 + Math.random() * 899)}`,
              manage_inventory: false,
              allow_backorder: true,
              options: { Title: "Default Title" },
              prices: [
                {
                  amount: (item.price_tl || 2760) * 100,
                  currency_code: "try",
                },
              ],
              metadata: {
                brand: item.brand || "",
                stock: 100,
              },
            },
          ],
        })
      }
    }

    // Also categorize any pre-existing DB products that weren't in catalog
    for (const ep of existingProducts) {
      const inferredHandles = inferCategoriesFromText("", ep.title || "", ep.handle || "")
      const currentCatIds = new Set((ep.categories || []).map((c: any) => c.id))
      for (const h of inferredHandles) {
        const cid = catByHandle.get(h.toLowerCase())
        if (cid && !currentCatIds.has(cid)) {
          categoryLinksToInsert.push({ productId: ep.id, categoryId: cid })
        }
      }
    }

    // 3. Create new products in batches of 25
    let createdCount = 0
    const BATCH_SIZE = 25
    for (let i = 0; i < toCreate.length; i += BATCH_SIZE) {
      const batch = toCreate.slice(i, i + BATCH_SIZE)
      try {
        await createProductsWorkflow(container).run({
          input: {
            products: batch,
          },
        })
        createdCount += batch.length
      } catch (batchErr: any) {
        // Fallback: try creating one by one in this batch if one item had a duplicate handle
        for (const singleItem of batch) {
          try {
            await createProductsWorkflow(container).run({
              input: {
                products: [singleItem],
              },
            })
            createdCount++
          } catch {}
        }
      }
    }

    // 4. Apply direct SQL category links & thumbnail restorations for existing products
    let linkedCategoriesCount = 0
    if (categoryLinksToInsert.length > 0 || thumbnailUpdates.length > 0) {
      try {
        const { Client } = require("pg")
        const client = new Client({ connectionString: process.env.DATABASE_URL })
        await client.connect()

        for (const link of categoryLinksToInsert) {
          await client
            .query(
              `INSERT INTO product_category_product (product_id, product_category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
              [link.productId, link.categoryId]
            )
            .then(() => {
              linkedCategoriesCount++
            })
            .catch(() => {})
        }

        for (const tu of thumbnailUpdates) {
          await client
            .query(`UPDATE product SET thumbnail = $1 WHERE id = $2 AND (thumbnail IS NULL OR thumbnail = '')`, [
              tu.thumbnail,
              tu.productId,
            ])
            .catch(() => {})
        }

        await client.end()
      } catch (pgErr) {
        console.error("PG category link update error:", pgErr)
      }
    }

    isSyncRunning = false
    return {
      status: "success",
      totalCatalogProducts: catalog.length,
      createdProductsCount: createdCount,
      existingProductsUpdatedLinks: linkedCategoriesCount,
      categoriesTotal: allCategories.length,
    }
  } catch (err: any) {
    isSyncRunning = false
    return {
      status: "error",
      message: err?.message || String(err),
    }
  }
}
