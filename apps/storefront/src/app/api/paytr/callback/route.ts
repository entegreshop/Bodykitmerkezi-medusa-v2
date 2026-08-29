import { NextResponse } from "next/server"

export async function POST(request: Request) {
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const cartId = url.searchParams.get("cart_id")
    
    // Read the actual public host from headers (set by Coolify/Traefik)
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "bodykitmerkezi.com"
    const proto = request.headers.get("x-forwarded-proto") || "https"
    const origin = `${proto}://${host}`

    if (status === "success") {
        return NextResponse.redirect(`${origin}/tr/checkout/success?order_id=${cartId}`, 302)
    }

    return NextResponse.redirect(`${origin}/tr/checkout/failed`, 302)
}
