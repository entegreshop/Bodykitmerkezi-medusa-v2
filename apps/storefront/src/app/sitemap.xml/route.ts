import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

export const dynamic = "force-dynamic"

function escapeXml(unsafe: string): string {
  return (unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function normalizeCleanImageUrl(url?: string | null): string {
  if (!url) return ""
  if (
    url.includes("media.kitgaraj.com") &&
    (url.includes("/plus/") || url.includes("/temiz/") || url.includes("-showroom."))
  ) {
    return `https://bodykitmerkezi.com/api/clean-image?url=${encodeURIComponent(url)}`
  }
  return url
}

export async function GET() {
  const baseUrl = "https://bodykitmerkezi.com"
  const nowIso = new Date().toISOString().split("T")[0]

  const staticPages = [
    { loc: `${baseUrl}/tr`, priority: "1.0", changefreq: "daily", lastmod: nowIso },
    { loc: `${baseUrl}/tr/store`, priority: "0.9", changefreq: "daily", lastmod: nowIso },
  ]

  let products: Array<{
    id: string
    handle: string
    title?: string
    thumbnail?: string
    updated_at?: string
  }> = []

  try {
    let offset = 0
    const limit = 200
    let hasMore = true

    while (hasMore) {
      const res = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
        "/store/products",
        {
          method: "GET",
          query: {
            limit,
            offset,
            fields: "id,handle,title,thumbnail,updated_at",
          },
        }
      )

      if (res?.products && res.products.length > 0) {
        products = products.concat(res.products as any)
        offset += res.products.length
        if (offset >= (res.count || 0) || res.products.length < limit) {
          hasMore = false
        }
      } else {
        hasMore = false
      }

      // Safety check to prevent infinite loops if count is misreported
      if (offset > 5000) {
        break
      }
    }
  } catch (err) {
    console.error("Failed to fetch products for sitemap:", err)
  }

  const xmlUrls: string[] = []

  // Add static routes
  for (const page of staticPages) {
    xmlUrls.push(`  <url>
    <loc>${escapeXml(page.loc)}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`)
  }

  // Add all product routes
  for (const prod of products) {
    if (!prod.handle) continue
    const prodUrl = `${baseUrl}/tr/products/${prod.handle}`
    const lastmod = prod.updated_at
      ? new Date(prod.updated_at).toISOString().split("T")[0]
      : nowIso

    const cleanImg = normalizeCleanImageUrl(prod.thumbnail)
    let imageXml = ""
    if (cleanImg) {
      imageXml = `
    <image:image>
      <image:loc>${escapeXml(cleanImg)}</image:loc>
      <image:title>${escapeXml(prod.title || "BodyKit Parçası")}</image:title>
    </image:image>`
    }

    xmlUrls.push(`  <url>
    <loc>${escapeXml(prodUrl)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageXml}
  </url>`)
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlUrls.join("\n")}
</urlset>`

  return new Response(sitemapXml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
