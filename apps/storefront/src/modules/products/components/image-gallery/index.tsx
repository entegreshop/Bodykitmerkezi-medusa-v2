"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useState, useRef } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

function isRedCoverTemplateUrl(url?: string | null): boolean {
  if (!url) return true
  const fname = (url.split("/").pop() || "").split("?")[0].toLowerCase()
  return (
    fname.startsWith("gg-") ||
    fname.startsWith("gg_") ||
    fname.includes("1web") ||
    fname === "web.jpg" ||
    fname === "1-web.jpg" ||
    fname.includes("kapak")
  )
}

function normalizeCleanImageUrl(url?: string | null): string {
  if (!url) return ""
  if (
    url.includes("media.kitgaraj.com") &&
    (url.includes("/plus/") || url.includes("-showroom."))
  ) {
    return `/api/clean-image?url=${encodeURIComponent(url)}`
  }
  return url
}

const ImageGallery = ({ images: rawImages }: ImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const cleanFiltered = (rawImages || []).filter((img) => img?.url && !isRedCoverTemplateUrl(img.url))
  const images = (cleanFiltered.length > 0 ? cleanFiltered : (rawImages || [])).map((img) => ({
    ...img,
    url: normalizeCleanImageUrl(img.url),
  }))

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
        Görsel Bulunmuyor
      </div>
    )
  }

  const scrollTo = (index: number) => {
    setActiveIndex(index)
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.clientWidth * index
      carouselRef.current.scrollTo({ left: scrollLeft, behavior: "smooth" })
    }
  }

  const handlePrev = () => {
    const nextIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1
    scrollTo(nextIndex)
  }

  const handleNext = () => {
    const nextIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1
    scrollTo(nextIndex)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const index = Math.round(container.scrollLeft / container.clientWidth)
    if (index !== activeIndex) {
      setActiveIndex(index)
    }
  }

  return (
    <div className="flex flex-col-reverse medium:flex-row items-start gap-4 h-full">
      {/* Thumbnail List */}
      {images.length > 1 && (
        <div className="flex flex-row medium:flex-col gap-3 overflow-x-auto medium:overflow-y-auto medium:max-h-[850px] no-scrollbar w-full medium:w-[90px] flex-shrink-0">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => scrollTo(index)}
              className={`relative aspect-[3/4] w-20 medium:w-full overflow-hidden flex-shrink-0 border transition-all ${
                activeIndex === index
                  ? "border-black shadow-sm"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              {image.url && (
                image.url.match(/\.(mp4|webm|mov)$/i) ? (
                  <video
                    src={image.url}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <Image
                    alt={`Thumbnail ${index + 1}`}
                    src={image.url}
                    fill
                    unoptimized
                    className="object-contain bg-white p-1"
                    sizes="80px"
                  />
                )
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="relative aspect-square w-full flex-grow overflow-hidden bg-white border border-gray-200 rounded-lg group">
        {/* Scrollable Carousel Container */}
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth no-scrollbar"
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative w-full h-full flex-shrink-0 snap-center bg-white"
            >
              {image.url && (
                image.url.match(/\.(mp4|webm|mov)$/i) ? (
                  <video
                    src={image.url}
                    autoPlay={activeIndex === index}
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    alt="Product Image"
                    src={image.url}
                    fill
                    unoptimized
                    priority={index === 0}
                    className="object-contain p-2"
                    sizes="(max-width: 1024px) 100vw, 800px"
                  />
                )
              )}
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/70 hover:bg-white text-black transition-colors rounded-full shadow-sm z-20 opacity-0 group-hover:opacity-100 medium:opacity-100"
              aria-label="Önceki Görsel"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/70 hover:bg-white text-black transition-colors rounded-full shadow-sm z-20 opacity-0 group-hover:opacity-100 medium:opacity-100"
              aria-label="Sonraki Görsel"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ImageGallery
