import { NextResponse } from "next/server"

export async function GET(request: Request) {
    return handleCallback(request)
}

export async function POST(request: Request) {
    return handleCallback(request)
}

async function handleCallback(request: Request) {
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const cartId = url.searchParams.get("cart_id")
    
    // Read the actual public host from headers (set by Coolify/Traefik)
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "bodykitmerkezi.com"
    const proto = request.headers.get("x-forwarded-proto") || "https"
    const origin = `${proto}://${host}`

    if (status === "success" && cartId) {
        // Try to complete the cart redundantly to get the order ID.
        // Medusa's complete action is idempotent, so it will just return the existing order if the webhook already completed it!
        let orderId = null;
        try {
            const { sdk } = await import("@lib/config");
            const { getAuthHeaders, removeCartId } = await import("@lib/data/cookies");
            
            const headers = await getAuthHeaders();
            const res = await sdk.store.cart.complete(cartId, {}, headers);
            if (res.type === "order") {
                orderId = res.order.id;
                await removeCartId(); // Clear the cart cookie
            }
        } catch (e: any) {
            console.error("Storefront PayTR callback failed to complete cart:", e);
            // It might fail if cart was completed by webhook and now it returns 404. Wait, docs said it's idempotent.
            // If it DOES fail, we can't easily get the order ID without a backend route.
            return NextResponse.redirect(`${origin}/tr/checkout?error=${encodeURIComponent(e.message || "Cart completion failed")}`, 302)
        }

        if (orderId) {
            return NextResponse.redirect(`${origin}/tr/order/${orderId}/confirmed`, 302)
        }
        
        // Fallback if we couldn't get the order ID
        return NextResponse.redirect(`${origin}/tr/checkout?error=${encodeURIComponent("Sipariş alınırken bir hata oluştu. Lütfen yöneticinizle iletişime geçin.")}`, 302)
    }

    // Try to get fail_message from POST body
    let failMessage = "Ödeme işlemi banka tarafından reddedildi."
    if (request.method === "POST") {
        try {
            const bodyText = await request.text()
            const params = new URLSearchParams(bodyText)
            if (params.has("fail_message")) {
                failMessage = params.get("fail_message") || failMessage
            }
        } catch(e) {
            console.error("Failed to parse PayTR fail_message", e)
        }
    }

    // Redirect to checkout with an error message
    const errorUrl = new URL(`${origin}/tr/checkout`)
    errorUrl.searchParams.set("error", failMessage)
    
    return NextResponse.redirect(errorUrl.toString(), 302)
}
