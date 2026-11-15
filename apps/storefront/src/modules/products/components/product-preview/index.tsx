"use client"

import { HttpTypes } from "@medusajs/types"
import { N11ProductCard } from "@modules/home/components/category-tabs"

export default function ProductPreview({
  product,
  region,
  index = 0,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  index?: number
}) {
  return (
    <N11ProductCard
      product={product}
      region={region}
      index={index}
      accentColor="#c91d82"
      freeShippingText="HIZLI KARGO"
    />
  )
}
