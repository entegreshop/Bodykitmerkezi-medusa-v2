import React, { Suspense } from "react"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductBelowGallery from "@modules/products/components/product-below-gallery"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import ProductActionsWrapper from "./product-actions-wrapper"
import ProductReviews from "@modules/products/components/product-reviews"
import HediyeUrunler from "@modules/products/components/hediye-urunler"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div
        className="content-container flex flex-col gap-6 small:grid small:grid-cols-12 small:grid-rows-[auto_1fr] small:items-start small:gap-x-8 small:gap-y-0 lg:gap-x-12 py-8 relative"
        data-testid="product-container"
      >
        {/* 1. Ürün Görseli (Masaüstünde Sol Üst 60%, Mobilde 1. Sırada) */}
        <div className="order-1 w-full small:col-span-7 small:col-start-1 small:row-start-1">
          <ImageGallery images={images} productTitle={product.title} />
        </div>

        {/* 2. Başlık, Fiyat, Sepete Ekle, Ödeme Seçenekleri ve Açıklama/Özellikler (Masaüstünde Sağ 40% Sticky, Mobilde Görselin Hemen Altında 2. Sırada) */}
        <div className="order-2 flex flex-col w-full small:col-span-5 small:col-start-8 small:row-start-1 small:row-span-2 small:sticky small:top-24 gap-y-8">
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper id={product.id} region={region}>
              <Suspense fallback={null}>
                <HediyeUrunler product={product} region={region} />
              </Suspense>
            </ProductActionsWrapper>
          </Suspense>
        </div>

        {/* 3. Araç Uyumluluk Tablosu, Boya/Montaj Seçenekleri ve Güvence/WhatsApp (Masaüstünde Ürün Görselinin Hemen Altında Sol Sütunda, Mobilde Açıklamaların Altında 3. Sırada) */}
        <div className="order-3 w-full small:col-span-7 small:col-start-1 small:row-start-2 small:self-start">
          <ProductBelowGallery product={product} />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="content-container">
        <ProductReviews product={product} />
      </div>

      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
