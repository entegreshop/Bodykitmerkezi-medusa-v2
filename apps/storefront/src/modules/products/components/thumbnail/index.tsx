import { Container, clx } from "@medusajs/ui"
import Image from "next/image"
import React from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ThumbnailProps = {
  thumbnail?: string | null
  // TODO: Fix image typings
  images?: any[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  "data-testid"?: string
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

function normalizeCleanImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  if (
    url.includes("media.kitgaraj.com") &&
    (url.includes("/plus/") || url.includes("-showroom."))
  ) {
    return `/api/clean-image?url=${encodeURIComponent(url)}`
  }
  return url
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  className,
  "data-testid": dataTestid,
}) => {
  const cleanFromGallery = (images || []).map((i: any) => i?.url).find((u: string) => u && !isRedCoverTemplateUrl(u))
  const rawInitialImage =
    thumbnail && !isRedCoverTemplateUrl(thumbnail)
      ? thumbnail
      : cleanFromGallery || thumbnail || images?.[0]?.url
  const initialImage = normalizeCleanImageUrl(rawInitialImage)

  return (
    <Container
      className={clx(
        "relative w-full overflow-hidden p-4 bg-ui-bg-subtle shadow-elevation-card-rest rounded-large group-hover:shadow-elevation-card-hover transition-shadow ease-in-out duration-150",
        className,
        {
          "aspect-[11/14]": isFeatured,
          "aspect-[9/16]": !isFeatured && size !== "square",
          "aspect-[1/1]": size === "square",
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full",
        }
      )}
      data-testid={dataTestid}
    >
      <ImageOrPlaceholder image={initialImage} size={size} />
    </Container>
  )
}

const ImageOrPlaceholder = ({
  image,
  size,
}: Pick<ThumbnailProps, "size"> & { image?: string }) => {
  return image ? (
    <Image
      src={image}
      alt="Thumbnail"
      unoptimized
      className="absolute inset-0 object-contain object-center bg-white p-1"
      draggable={false}
      quality={75}
      sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
      fill
    />
  ) : (
    <div className="w-full h-full absolute inset-0 flex items-center justify-center">
      <PlaceholderImage size={size === "small" ? 16 : 24} />
    </div>
  )
}

export default Thumbnail
