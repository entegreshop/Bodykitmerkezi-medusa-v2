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
        let orderId = null;
        try {
            const { sdk } = await import("@lib/config");
            const { getAuthHeaders, removeCartId } = await import("@lib/data/cookies");
            
            const headers = await getAuthHeaders();
            
            // Poll up to 10 seconds for the order to be created by the webhook
            for (let i = 0; i < 10; i++) {
                try {
                    const { orders } = await sdk.client.fetch<{ orders: any[] }>(`/store/orders`, {
                        query: { cart_id: cartId },
                        headers,
                        cache: "no-store"
                    });
                    
                    if (orders && orders.length > 0) {
                        orderId = orders[0].id;
                        await removeCartId();
                        break;
                    }
                } catch(err) {
                    console.log("Polling for order...", err);
                }
                await new Promise(r => setTimeout(r, 1000));
            }
        } catch (e: any) {
            console.error("Storefront PayTR callback failed to poll order:", e);
        }

        if (orderId) {
            return NextResponse.redirect(`${origin}/tr/order/${orderId}/confirmed`, 302)
        }
        
        // Fallback if we couldn't get the order ID
        return NextResponse.redirect(`${origin}/tr/checkout?error=${encodeURIComponent("SipariYiniz alnd, ancak ynlendirme tamamlanamad. LǬtfen sipariYlerim sayfasn kontrol edin.")}`, 302)
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
