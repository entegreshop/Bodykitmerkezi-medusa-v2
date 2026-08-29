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
        // Redirect to checkout review step. 
        // Medusa's frontend will see the cart is paid/completed and redirect to the order confirmation page automatically.
        return NextResponse.redirect(`${origin}/tr/checkout?step=review&payment_status=success`, 302)
    }

    // Redirect to cart with an error message
    return NextResponse.redirect(`${origin}/tr/cart?error=payment_failed`, 302)
}
