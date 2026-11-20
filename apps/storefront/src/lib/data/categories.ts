import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const normalizeCategorySlug = (str: string) =>
  (str || "")
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/i̇/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "")

export const CATEGORY_HANDLE_ALIASES: Record<string, string[]> = {
  bodykit: ["arac-body-kit", "bodykit", "body-kit", "body-kit-seti", "set"],
  aracbodykit: ["arac-body-kit", "bodykit", "body-kit", "body-kit-seti"],
  set: ["set", "arac-body-kit", "bodykit", "body-kit-seti"],
  difuzor: ["difuzor", "difizor", "arka-difuzor", "arka-tampon-difuzoru"],
  spoiler: ["spoiler", "spoyler", "spoiler-citasi"],
  tampon: ["tampon", "on-tampon", "arka-tampon", "tampon-ek"],
  tamponek: ["on-tampon", "arka-tampon", "tampon-ek", "tampon", "on-tampon-eki", "on-ek", "on-lip", "arka-ek"],
  onek: ["on-ek", "on-tampon-eki", "on-tampon"],
  ontamponeki: ["on-tampon-eki", "on-ek", "on-tampon"],
  onlip: ["on-lip", "on-tampon-eki"],
  arkaek: ["arka-ek", "arka-tampon"],
  ontampon: ["on-tampon", "tampon"],
  arkatampon: ["arka-tampon", "tampon"],
  marspiyel: ["marspiyel", "yan-marspiyel"],
  egzozuclari: ["egzoz-uclari", "egzoz-ucu"],
  flap: ["flap"],
  bagajhavuzu: ["bagaj-havuzu"],
  camvizor: ["cam-vizor", "cam-vizoru"],
  siscercevesi: ["sis-cercevesi"],
  dodik: ["dodik"],
  moonvisor: ["moonvisor"],
  aksesuar: ["oto-aksesuar", "oto-aksesuarlari", "bagaj-havuzu", "egzoz-uclari", "cam-vizor", "sis-cercevesi", "dodik", "moonvisor", "aksesuar"],
  otoaksesuar: ["oto-aksesuar", "oto-aksesuarlari"],
  aydinlatma: ["aydinlatma", "sis-cercevesi", "moonvisor", "oto-aksesuar"],
}

let cachedAllCategories: {
  data: HttpTypes.StoreProductCategory[]
  expiresAt: number
} | null = null

export const listCategories = async (query?: Record<string, any>) => {
  const isDefaultQuery = !query || Object.keys(query).length === 0
  if (isDefaultQuery && cachedAllCategories && Date.now() < cachedAllCategories.expiresAt) {
    return cachedAllCategories.data
  }

  const next = {
    ...(await getCacheOptions("categories")),
    revalidate: 60,
  }

  const limit = query?.limit || 100

  const product_categories = await sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "id,name,handle,description,*category_children,*parent_category",
          limit,
          ...query,
        },
        next,
      }
    )
    .then(({ product_categories }) => product_categories || [])

  if (isDefaultQuery && product_categories.length > 0) {
    cachedAllCategories = {
      data: product_categories,
      expiresAt: Date.now() + 60 * 1000,
    }
  }

  return product_categories
}

export const resolveCategoriesByHandle = async (
  rawHandle: string
): Promise<HttpTypes.StoreProductCategory[]> => {
  const cleanHandle = decodeURIComponent(rawHandle || "").replace(/^\/+|\/+$/g, "")
  const normQuery = normalizeCategorySlug(cleanHandle)
  if (!normQuery) return []

  const allCategories = await listCategories().catch(() => [])
  if (!allCategories || allCategories.length === 0) return []

  const aliasTargets = (CATEGORY_HANDLE_ALIASES[normQuery] || [cleanHandle]).map(
    normalizeCategorySlug
  )

  const matched = allCategories.filter((cat) => {
    const catHandleNorm = normalizeCategorySlug(cat.handle || "")
    const catNameNorm = normalizeCategorySlug(cat.name || "")
    return (
      catHandleNorm === normQuery ||
      catNameNorm === normQuery ||
      aliasTargets.includes(catHandleNorm) ||
      aliasTargets.includes(catNameNorm)
    )
  })

  if (matched.length > 0) {
    const resultMap = new Map<string, HttpTypes.StoreProductCategory>()
    for (const c of matched) {
      resultMap.set(c.id, c)
      if (Array.isArray(c.category_children)) {
        for (const child of c.category_children) {
          if (child?.id) {
            resultMap.set(child.id, child as HttpTypes.StoreProductCategory)
          }
        }
      }
    }
    return Array.from(resultMap.values())
  }

  const partialMatched = allCategories.filter((cat) => {
    const catHandleNorm = normalizeCategorySlug(cat.handle || "")
    const catNameNorm = normalizeCategorySlug(cat.name || "")
    return (
      (catHandleNorm && (catHandleNorm.includes(normQuery) || normQuery.includes(catHandleNorm))) ||
      (catNameNorm && (catNameNorm.includes(normQuery) || normQuery.includes(catNameNorm)))
    )
  })

  return partialMatched
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = decodeURIComponent(categoryHandle.join("/"))
  const resolved = await resolveCategoriesByHandle(handle)
  if (resolved.length > 0) {
    return resolved[0]
  }

  const next = {
    ...(await getCacheOptions("categories")),
    revalidate: 60,
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "id,name,handle,description,*category_children",
          handle: [handle, `/${handle}`],
        },
        next,
      }
    )
    .then(({ product_categories }) => product_categories?.[0])
    .catch(() => undefined)
}
