import { NextResponse } from "next/server"

export async function POST(request: Request) {
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const cartId = url.searchParams.get("cart_id")
    const origin = url.origin

    if (status === "success") {
        return NextResponse.redirect(`${origin}/tr/checkout/success?order_id=${cartId}`, 302)
    }

    return NextResponse.redirect(`${origin}/tr/checkout/failed`, 302)
}
