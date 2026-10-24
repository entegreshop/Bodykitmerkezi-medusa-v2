"use client"

import { Button, Heading } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import { HttpTypes } from "@medusajs/types"
import QuickCheckoutModal from "@modules/checkout/components/quick-checkout-modal"
import { useState, useEffect, useMemo } from "react"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [shippingSettings, setShippingSettings] = useState<{
    standard_rate: number
    free_shipping_limit: number
    free_shipping_enabled: boolean
  } | null>(null)

  useEffect(() => {
    const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
    fetch(`${MEDUSA_URL}/store/custom/settings`, {
      headers: { "x-publishable-api-key": PUBLISHABLE_KEY }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings?.shipping_settings) {
          setShippingSettings({
            standard_rate: parseFloat(data.settings.shipping_settings.standard_rate) || 0,
            free_shipping_limit: parseFloat(data.settings.shipping_settings.free_shipping_limit) || 3000,
            free_shipping_enabled: data.settings.shipping_settings.free_shipping_enabled !== false
          })
        }
      })
      .catch(() => {})
  }, [])

  const displayTotals = useMemo(() => {
    if (!shippingSettings) return cart
    const itemSubCents = Number(cart.item_subtotal ?? cart.subtotal ?? 0)
    const discountCents = Number(cart.discount_subtotal ?? cart.discount_total ?? 0)
    const itemsNetCents = Math.max(0, itemSubCents - discountCents)
    const itemsNetTl = itemsNetCents / 100

    let shippingCents = 0
    if (shippingSettings.free_shipping_enabled && itemsNetTl >= shippingSettings.free_shipping_limit) {
      shippingCents = 0
    } else {
      shippingCents = Math.round(shippingSettings.standard_rate * 100)
    }

    return {
      ...cart,
      shipping_subtotal: shippingCents,
      total: itemsNetCents + shippingCents
    }
  }, [cart, shippingSettings])

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Sipariş Özeti
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={displayTotals} />
      
      <Button 
         className="w-full h-12 bg-[#25D366] text-white hover:bg-[#128C7E] hover:text-white uppercase tracking-widest text-[15px] transition-colors font-bold rounded-none"
         onClick={() => setIsModalOpen(true)}
      >
         Güvenli Ödemeye Geç
      </Button>

      {/* Cart Mode için Modal Çağrılır */}
      <QuickCheckoutModal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         mode="cart" 
         cart={cart} 
         region={cart.region as any} 
      />
    </div>
  )
}

export default Summary

