import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Tüm Body Kit & Modifiye Ürünleri | BodyKit Merkezi",
  description:
    "Türkiye'nin en geniş araç uyumlu body kit, ön ek (lip), arka difüzör, marşpiyel, spoiler ve panjur modelleri. Birebir kalıp, esnek ABS plastik malzeme, uygun fiyat ve hızlı kargo BodyKit Merkezi'nde.",
  alternates: {
    canonical: "https://bodykitmerkezi.com/tr/store",
  },
  openGraph: {
    title: "Tüm Body Kit & Modifiye Ürünleri | BodyKit Merkezi",
    description:
      "Türkiye'nin en geniş araç uyumlu body kit, ön ek (lip), arka difüzör, marşpiyel, spoiler ve panjur modelleri. Birebir kalıp, esnek ABS plastik malzeme, uygun fiyat ve hızlı kargo BodyKit Merkezi'nde.",
    url: "https://bodykitmerkezi.com/tr/store",
    siteName: "BodyKit Merkezi",
    locale: "tr_TR",
    type: "website",
  },
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  )
}
