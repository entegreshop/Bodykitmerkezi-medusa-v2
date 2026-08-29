import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import SinglePageCheckout from "@modules/checkout/templates/single-page-checkout"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Checkout(props: Props) {
  const searchParams = await props.searchParams
  const errorParam = searchParams?.error as string | undefined

  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()
  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")

  return (
    <PaymentWrapper cart={cart}>
      <SinglePageCheckout
        cart={cart}
        customer={customer}
        shippingMethods={shippingMethods}
        paymentMethods={paymentMethods}
        initialError={errorParam}
      />
    </PaymentWrapper>
  )
}
