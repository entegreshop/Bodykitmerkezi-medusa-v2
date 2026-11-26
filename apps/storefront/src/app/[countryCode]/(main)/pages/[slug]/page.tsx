import { notFound } from "next/navigation"
import { Metadata } from "next"
import { DEFAULT_LEGAL_PAGES } from "@lib/data/legal-pages"

const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "https://api.bodykitmerkezi.com"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

async function getPagesData(): Promise<Record<string, { title: string; content: string }>> {
  try {
    const headers: Record<string, string> = {}
    if (PUBLISHABLE_KEY) {
      headers["x-publishable-api-key"] = PUBLISHABLE_KEY
    }

    const res = await fetch(`${BACKEND_URL}/store/pages`, {
      next: { revalidate: 60 },
      headers,
    })

    if (res.ok) {
      const data = await res.json()
      if (data?.pages && Object.keys(data.pages).length > 0) {
        return { ...DEFAULT_LEGAL_PAGES, ...data.pages }
      }
    }
  } catch (error) {
    // If backend is unreachable, fallback gracefully to DEFAULT_LEGAL_PAGES
  }
  return DEFAULT_LEGAL_PAGES
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; countryCode: string }
}): Promise<Metadata> {
  const { slug } = params
  const pagesContent = await getPagesData()
  const pageData = pagesContent[slug] || DEFAULT_LEGAL_PAGES[slug]

  if (!pageData) {
    return { title: "Sayfa Bulunamadı | BodyKit Merkezi" }
  }

  return {
    title: `${pageData.title} | BodyKit Merkezi`,
    description: pageData.content.slice(0, 155).replace(/\n/g, " "),
    alternates: {
      canonical: `https://bodykitmerkezi.com/${params.countryCode || "tr"}/pages/${slug}`,
    },
  }
}

export default async function StaticPage({
  params,
}: {
  params: { slug: string; countryCode: string }
}) {
  const { slug } = params

  const pagesContent = await getPagesData()
  const pageData = pagesContent[slug] || DEFAULT_LEGAL_PAGES[slug]

  if (!pageData) {
    notFound()
  }

  return (
    <div className="content-container py-12 flex flex-col gap-8 min-h-[50vh]">
      <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">
        {pageData.title}
      </h1>
      <div className="prose prose-zinc max-w-none text-gray-700 whitespace-pre-line leading-relaxed text-[15px]">
        {pageData.content}
      </div>
    </div>
  )
}
