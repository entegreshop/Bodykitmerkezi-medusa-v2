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
  bodykit: ["bodykit", "body-kit", "body-kit-"],
  difuzor: ["difuzor", "difizor", "arka-difuzor"],
  spoiler: ["spoiler", "spoyler"],
  tamponek: ["on-tampon", "arka-tampon", "tampon-ek", "tampon"],
  ontampon: ["on-tampon"],
  arkatampon: ["arka-tampon"],
  marspiyel: ["marspiyel", "yan-marspiyel"],
  aksesuar: ["oto-aksesuar", "bagaj-havuzu", "aksesuar"],
  otoaksesuar: ["oto-aksesuar"],
  bagajhavuzu: ["bagaj-havuzu"],
  aydinlatma: ["aydinlatma", "oto-aksesuar"],
}

export const listCategories = async (query?: Record<string, any>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 500

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit,
          ...query,
        },
        next,
        cache: "no-store",
      }
    )
    .then(({ product_categories }) => product_categories)
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

  const next = {
    ...(await getCacheOptions("categories")),
  }

  const exactMatch = await sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *products",
          handle: [handle, `/${handle}`],
        },
        next,
        cache: "no-store",
      }
    )
    .then(({ product_categories }) => product_categories?.[0])
    .catch(() => undefined)

  if (exactMatch) {
    return exactMatch
  }

  const resolved = await resolveCategoriesByHandle(handle)
  return resolved[0]
}
