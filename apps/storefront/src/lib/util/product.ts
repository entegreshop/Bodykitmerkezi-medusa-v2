import { HttpTypes } from "@medusajs/types"

const DEFAULT_OPTION_VALUES = new Set([
  "standart",
  "default",
  "default title",
  "default variant",
  "varsayılan",
  "varsayilan",
  "tek ebat",
  "tek beden",
])

export const isDefaultOptionValue = (val?: string | null): boolean => {
  if (!val) return true
  const cleaned = val.trim().toLowerCase()
  if (DEFAULT_OPTION_VALUES.has(cleaned)) return true
  // e.g. "Standart / Standart"
  const parts = cleaned.split("/").map((p) => p.trim())
  return parts.length > 0 && parts.every((p) => DEFAULT_OPTION_VALUES.has(p))
}

export const isSimpleProduct = (product: HttpTypes.StoreProduct): boolean => {
  const variantsCount = product.variants?.length ?? 0
  if (variantsCount <= 1) {
    return true
  }

  const options = product.options || []
  if (options.length === 0) {
    return true
  }

  return options.every((opt) => {
    const vals = opt.values || []
    if (vals.length === 0) return true
    if (vals.length === 1 && isDefaultOptionValue(vals[0]?.value)) return true
    return vals.every((v) => isDefaultOptionValue(v?.value))
  })
}
