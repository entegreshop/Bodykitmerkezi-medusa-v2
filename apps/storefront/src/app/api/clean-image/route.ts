import { NextRequest, NextResponse } from "next/server"

function getJpegDimensions(buf: Buffer): { width: number; height: number } {
  try {
    if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) {
      return { width: 1600, height: 1600 }
    }
    let offset = 2
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) {
        offset++
        continue
      }
      const marker = buf[offset + 1]
      if (marker === 0xff) {
        offset++
        continue
      }
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
        offset += 2
        continue
      }
      const len = buf.readUInt16BE(offset + 2)
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
        const height = buf.readUInt16BE(offset + 5)
        const width = buf.readUInt16BE(offset + 7)
        if (width > 0 && height > 0) {
          return { width, height }
        }
      }
      offset += 2 + len
    }
  } catch {}
  return { width: 1600, height: 1600 }
}

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url") || ""
  if (!rawUrl) {
    return new NextResponse("Missing url", { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return new NextResponse("Invalid url", { status: 400 })
  }

  if (!parsed.hostname.endsWith("kitgaraj.com")) {
    return NextResponse.redirect(rawUrl)
  }

  try {
    const upstream = await fetch(rawUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      next: { revalidate: 86400 },
    })

    if (!upstream.ok) {
      return new NextResponse("Upstream not found", { status: upstream.status })
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg"
    const buf = Buffer.from(await upstream.arrayBuffer())
    const { width: W, height: H } = getJpegDimensions(buf)
    const b64 = buf.toString("base64")

    const isShowroom408 =
      rawUrl.includes("/GG-L129/") ||
      rawUrl.includes("/GG-M134/") ||
      rawUrl.includes("/GG-L128/") ||
      rawUrl.includes("/GG-L130/") ||
      rawUrl.includes("/GG-L131/") ||
      rawUrl.includes("-showroom.")

    const isFramed408 = rawUrl.includes("/GG-L130/") || rawUrl.includes("/GG-L131/")
    const isTemizStrip = rawUrl.includes("/temiz/")

    const showroomMasks = isShowroom408
      ? isFramed408
        ? `
          <rect x="${Math.round(W * 0.175)}" y="${Math.round(H * 0.265)}" width="${Math.round(W * 0.255)}" height="${Math.round(H * 0.095)}" rx="8" fill="#464543" />
          <rect x="${Math.round(W * 0.072)}" y="${Math.round(H * 0.44)}" width="${Math.round(W * 0.06)}" height="${Math.round(H * 0.035)}" rx="4" fill="#1e2022" />
          <rect x="${Math.round(W * 0.07)}" y="${Math.round(H * 0.64)}" width="${Math.round(W * 0.25)}" height="${Math.round(H * 0.15)}" rx="6" fill="#8b9096" opacity="0.88" />
          <rect x="${Math.round(W * 0.87)}" y="${Math.round(H * 0.33)}" width="${Math.round(W * 0.105)}" height="${Math.round(H * 0.065)}" rx="4" fill="#3a3832" opacity="0.92" />
        `
        : `
          <rect x="${Math.round(W * 0.14)}" y="${Math.round(H * 0.19)}" width="${Math.round(W * 0.275)}" height="${Math.round(H * 0.115)}" rx="10" fill="#3a3937" />
          <rect x="${Math.round(W * 0.038)}" y="${Math.round(H * 0.405)}" width="${Math.round(W * 0.068)}" height="${Math.round(H * 0.04)}" rx="4" fill="#17181a" />
          <rect x="${Math.round(W * 0.04)}" y="${Math.round(H * 0.65)}" width="${Math.round(W * 0.075)}" height="${Math.round(H * 0.055)}" rx="4" fill="#5a5d62" opacity="0.88" />
          <rect x="${Math.round(W * 0.15)}" y="${Math.round(H * 0.745)}" width="${Math.round(W * 0.25)}" height="${Math.round(H * 0.11)}" rx="8" fill="#63666a" opacity="0.9" />
        `
      : ""

    const bottomMask = isTemizStrip
      ? `<rect x="0" y="${Math.round(H * 0.875)}" width="${W}" height="${Math.round(H * 0.125)}" fill="#ffffff" />`
      : `<rect x="${Math.round(W * 0.775)}" y="${Math.round(H * 0.89)}" width="${Math.round(W * 0.225)}" height="${Math.round(H * 0.11)}" rx="14" fill="#ffffff" />`

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <image href="data:${contentType};base64,${b64}" width="${W}" height="${H}" />
  ${showroomMasks}
  ${bottomMask}
</svg>`

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (err) {
    return NextResponse.redirect(rawUrl)
  }
}
