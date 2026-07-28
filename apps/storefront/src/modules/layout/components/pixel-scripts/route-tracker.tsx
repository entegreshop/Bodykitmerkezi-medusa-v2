"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

let globalLastTrackedUrl = ""

export default function PixelRouteTracker({ config }: { config: any }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!config) return

    const {
      meta_pixel,
      google_analytics,
      tiktok_pixel
    } = config

    // Construct full path relative to origin
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")

    // Prevent duplicate tracks for the exact same URL across component remounts
    if (globalLastTrackedUrl === url) {
      return
    }
    globalLastTrackedUrl = url

    // 1. Meta Pixel PageView
    if (meta_pixel?.active && meta_pixel?.pixel_id && (window as any).fbq) {
      (window as any).fbq("track", "PageView")
    }

    // 2. TikTok Pixel page view
    if (tiktok_pixel?.active && tiktok_pixel?.pixel_id && (window as any).ttq) {
      (window as any).ttq.page()
    }

    // 3. Google Analytics (GA4) page view
    if (google_analytics?.active && google_analytics?.measurement_id && (window as any).gtag) {
      (window as any).gtag("event", "page_view", {
        page_path: url,
        page_location: window.location.href,
        page_title: document.title,
      })
    }

    // 4. ViewCategory Event
    const categoryQuery = searchParams?.get("category")
    const isCategoryPath = pathname.includes("/categories/")
    
    if (categoryQuery || isCategoryPath) {
      const categoryName = categoryQuery || pathname.split("/").pop() || "Category"
      
      if (meta_pixel?.active && (window as any).fbq) {
        (window as any).fbq("trackCustom", "ViewCategory", { content_category: categoryName })
      }
      
      if (tiktok_pixel?.active && (window as any).ttq) {
        (window as any).ttq.track("ViewContent", { content_category: categoryName })
      }
    }
  }, [pathname, searchParams, config])

  return null
}
