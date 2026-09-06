import { Heading } from "@medusajs/ui"
import { cookies as nextCookies } from "next/headers"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import { OrderDetails } from "./order-details"
import ClearCartOnCompleted from "../components/clear-cart"
import PurchaseTracker from "../components/purchase-tracker"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const metadata: any = order.metadata || {};
  
  const finalShippingAmount = order.shipping_total ?? 0;
  const isFreeShipping = finalShippingAmount === 0;
  
  // Note: order.total already includes item_subtotal, shipping_total, taxes, etc.
  const finalGrandTotal = order.total ?? 0;

  const formatAddress = (addr: any) => {
    if (!addr) return null
    return (
      <div className="text-sm text-gray-700 flex flex-col gap-1 mt-2">
        <span className="uppercase">{addr.first_name} {addr.last_name}</span>
        <span>Adres: {addr.address_1}</span>
        {addr.address_2 && <span>{addr.address_2}</span>}
        <span>{addr.city} / {addr.province}</span>
        <span>Telefon Numarası: {addr.phone}</span>
        <span>E-Posta: {order.email}</span>
        {metadata.order_note && <span>Sipariş notu: {metadata.order_note}</span>}
      </div>
    )
  }

  return (
    <div className="py-10 min-h-[calc(100vh-64px)] bg-[#f8f9fa] flex justify-center">
      <div className="max-w-[1000px] w-full flex flex-col gap-6 px-4">
        
        {/* Top Section */}
        <div className="bg-white border border-gray-200 p-8 flex flex-col items-center text-center shadow-sm">
          <div className="mb-4">
            <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="32" fill="#28a745"/>
              <path d="M20 32.5L28.5 41L45 23" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-medium text-[#28a745] mb-4">
            Siparişiniz Başarıyla Oluşturuldu!
          </h1>
          <div className="bg-[#3b4148] text-white px-8 py-3 text-lg font-medium mb-8">
            Sipariş Numaranız: {order.display_id}
          </div>
          <p className="text-sm text-gray-900 font-semibold max-w-3xl mb-4">
            Lütfen sipariş kodunuzu not alınız. Müşteri danışma servisimize herhangi bir sorunla ilgili ulaşmanız durumunda sipariş kodunuz sizden istenecektir.
          </p>
          <p className="text-sm text-gray-600">
            Alışverişiniz için teşekkür ederiz...
          </p>
        </div>

        {/* Order Summary Section */}
        <div className="bg-white border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 p-4 px-6">
            <h2 className="text-lg font-semibold text-gray-800">Sipariş Özeti</h2>
          </div>
          
          {/* Items */}
          <div className="p-6 flex flex-col gap-6 border-b border-gray-200">
            {order.items?.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex gap-4 items-center flex-1">
                  <div className="w-[80px] h-[100px] relative bg-gray-100 flex-shrink-0">
                    {item.thumbnail && (
                      <img src={item.thumbnail} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">{item.title}</span>
                    <span className="text-xs text-gray-500 mt-1 uppercase">BEDEN: {item.variant_title || item.variant?.title}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-12 sm:w-1/2">
                  <span className="text-sm text-gray-600 whitespace-nowrap">{item.quantity} Ad. x</span>
                  <span className="text-base font-semibold text-[#28a745] whitespace-nowrap">
                    {convertToLocale({ amount: item.total ?? 0, currency_code: order.currency_code })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer 3 cols */}
          <div className="p-6 flex flex-col md:flex-row gap-8 md:gap-4">
            <div className="flex-1">
              <h3 className="text-[#dc3545] font-semibold text-sm mb-3">Teslimat Adresi</h3>
              {formatAddress(order.shipping_address)}
            </div>
            <div className="flex-1">
              <h3 className="text-[#dc3545] font-semibold text-sm mb-3">Fatura Adresi</h3>
              {formatAddress(order.billing_address)}
            </div>
            <div className="flex-1 flex flex-col gap-4 text-sm mt-4 md:mt-0">
              <div className="flex justify-between font-bold text-gray-800">
                <span>Ara Toplam</span>
                <span>{convertToLocale({ amount: order.item_subtotal ?? 0, currency_code: order.currency_code })}</span>
              </div>
              
              {(order.discount_total || 0) > 0 && (
                <div className="flex justify-between font-bold text-[#dc3545]">
                  <span>İndirim</span>
                  <span>- {convertToLocale({ amount: order.discount_total ?? 0, currency_code: order.currency_code })}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-gray-800">
                <span>Kargo</span>
                <span>{isFreeShipping ? "Ücretsiz" : convertToLocale({ amount: finalShippingAmount, currency_code: order.currency_code })}</span>
              </div>

              <div className="flex justify-between font-bold text-gray-900 mt-2 text-base border-t pt-2">
                <span>Genel Toplam</span>
                <span className="text-[#28a745]">
                  {convertToLocale({ amount: finalGrandTotal, currency_code: order.currency_code })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ClearCartOnCompleted />
      <PurchaseTracker order={order} />
    </div>
  )
}

