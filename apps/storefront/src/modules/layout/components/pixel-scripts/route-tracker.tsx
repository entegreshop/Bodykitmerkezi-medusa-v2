"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

let globalLastTrackedUrl = ""

function getOrCreateGaClientId(): string {
  try {
    const match = document.cookie.match(/(?:^|;\s*)_ga=([^;]+)/)
    if (match && match[1]) {
      return decodeURIComponent(match[1])
    }
    let cid = localStorage.getItem("_bkm_ga_cid")
    if (!cid) {
      cid = "GA4." + Math.random().toString(36).substring(2, 11) + "." + Date.now()
      localStorage.setItem("_bkm_ga_cid", cid)
    }
    return cid
  } catch {
    return "GA4.anon"
  }
}

function detectDeviceCategory(): "mobile" | "desktop" {
  try {
    const ua = navigator.userAgent || ""
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua) || window.innerWidth < 768) {
      return "mobile"
    }
  } catch {}
  return "desktop"
}

function sendGaRealtimeHeartbeat(urlPath: string) {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.bodykitmerkezi.com"
    const publishableKey =
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

    fetch(`${backendUrl}/store/pixel-settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(publishableKey ? { "x-publishable-api-key": publishableKey } : {}),
      },
      body: JSON.stringify({
        client_id: getOrCreateGaClientId(),
        device: detectDeviceCategory(),
        path: urlPath,
      }),
      keepalive: true,
    }).catch(() => {})
  } catch {}
}

export default function PixelRouteTracker({ config }: { config: any }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const categoryQuery = searchParams?.get("category") || ""

  const normPath = (pathname || "/").replace(/\/+$/, "") || "/"
  const pageKey = categoryQuery ? `${normPath}?category=${categoryQuery}` : normPath

  useEffect(() => {
    sendGaRealtimeHeartbeat(pageKey)
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        sendGaRealtimeHeartbeat(pageKey)
      }
    }, 20000)

    return () => clearInterval(intervalId)
  }, [pageKey])

  useEffect(() => {
    if (!config) return

    const { meta_pixel, google_analytics, tiktok_pixel } = config
    const win = window as any

    if (win.fbq) {
      win.fbq.disablePushState = true
    }

    if (!normPath.includes("/products/")) {
      win.__bkmLastViewContentProductId = null
    }

    // 1. Meta Pixel PageView (deduplicated against inline #fb-pixel script & variant URL changes)
    const metaPixelId = String(meta_pixel?.pixel_id || "").trim()
    const isMetaActive = Boolean(metaPixelId) && meta_pixel?.active !== false

    if (
      isMetaActive &&
      win.fbq &&
      win.__bkmLastTrackedPageKey !== pageKey &&
      globalLastTrackedUrl !== pageKey
    ) {
      win.__bkmLastTrackedPageKey = pageKey
      win.fbq("track", "PageView", {}, { eventID: `pv_${pageKey}_${Date.now()}` })
    } else if (win.__bkmLastTrackedPageKey === pageKey) {
      globalLastTrackedUrl = pageKey
    }

    if (win.__bkmLastAnalyticsPageKey === pageKey) {
      return
    }
    win.__bkmLastAnalyticsPageKey = pageKey
    globalLastTrackedUrl = pageKey

    // 2. TikTok Pixel page view
    if (tiktok_pixel?.active && tiktok_pixel?.pixel_id && win.ttq) {
      win.ttq.page()
    }

    // 3. Google Analytics (GA4) page view
    if (
      google_analytics?.active &&
      google_analytics?.measurement_id &&
      win.gtag
    ) {
      win.gtag("event", "page_view", {
        page_path: pageKey,
        page_location: window.location.href,
        page_title: document.title,
      })
    }

    // 4. ViewCategory Event
    const isCategoryPath = normPath.includes("/categories/")

    if (categoryQuery || isCategoryPath) {
      const categoryName =
        categoryQuery || normPath.split("/").pop() || "Category"

      if (isMetaActive && win.fbq) {
        win.fbq("trackCustom", "ViewCategory", {
          content_category: categoryName,
        })
      }

      if (tiktok_pixel?.active && win.ttq) {
        win.ttq.track("ViewContent", {
          content_category: categoryName,
        })
      }
    }
  }, [pageKey, categoryQuery, normPath, config])

  return null
}
