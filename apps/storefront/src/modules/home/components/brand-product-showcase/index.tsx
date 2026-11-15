"use client"

import React, { useRef, useState, useEffect, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { N11ProductCard } from "@modules/home/components/category-tabs"

export interface CarBrandItem {
  id: string
  name: string
  subtitle: string
  logoUrl: string
  svgLogo: string
  keywords: string[]
}

export const CAR_BRANDS: CarBrandItem[] = [
  {
    id: "bmw",
    name: "BMW",
    subtitle: "F30, F10, E90, E60, G20, M3, M4, M5 Bodykit, Spoiler & Difüzör Setleri",
    logoUrl: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/bmw.png",
    svgLogo: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="46" fill="#111" stroke="#c0c5ce" stroke-width="3"/><circle cx="50" cy="50" r="29" fill="#fff" stroke="#c0c5ce" stroke-width="1.5"/><path d="M50 21 A29 29 0 0 0 21 50 L50 50 Z" fill="#0066B1"/><path d="M50 50 L79 50 A29 29 0 0 1 50 79 Z" fill="#0066B1"/><text x="50" y="15.5" fill="#fff" font-size="10.5" font-weight="900" font-family="Arial, sans-serif" text-anchor="middle" letter-spacing="3">BMW</text></svg>`,
    keywords: [
      "bmw",
      "f30",
      "f10",
      "f20",
      "f22",
      "f32",
      "f36",
      "f80",
      "f82",
      "e90",
      "e92",
      "e60",
      "e46",
      "e36",
      "e39",
      "g20",
      "g30",
      "m performance",
      "bobrek",
      "böbrek",
    ],
  },
  {
    id: "volkswagen",
    name: "Volkswagen",
    subtitle: "Golf 5, Golf 6, Golf 7, Golf 7.5, Golf 8, Passat B6/B7/B8, Polo, Jetta & Scirocco Bodykit",
    logoUrl: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/volkswagen.png",
    svgLogo: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#001E50" stroke="#cbd5e1" stroke-width="3"/><circle cx="50" cy="50" r="39" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M32 23 L45 55 L50 43 L55 55 L68 23 M24 36 L39 76 L50 52 L61 76 L76 36" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    keywords: [
      "volkswagen",
      "vw",
      "golf",
      "passat",
      "polo",
      "jetta",
      "scirocco",
      "tiguan",
      "arteon",
      "caddy",
      "transporter",
      "amarok",
      "r-line",
      "r line",
      "gti",
    ],
  },
  {
    id: "seat",
    name: "Seat",
    subtitle: "Leon MK2, Leon MK3, Leon MK4, FR, Cupra, Ibiza & Ateca Bodykit ve Spoiler Modelleri",
    logoUrl: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/seat.png",
    svgLogo: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="14" width="72" height="72" rx="16" fill="#d9232a" stroke="#e2e8f0" stroke-width="2"/><path d="M28 36 H72 L64 46 H38 L68 54 L72 66 H28 L36 56 H62 L32 48 Z" fill="#fff"/></svg>`,
    keywords: ["seat", "leon", "ibiza", "ateca", "toledo", "arona", "cupra"],
  },
  {
    id: "honda",
    name: "Honda",
    subtitle: "Civic FC5, FB7, FD6, FE1, FK8 Type-R, Accord & IES Bodykit, Tampon ve Spoiler Setleri",
    logoUrl: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/honda.png",
    svgLogo: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="18" width="68" height="64" rx="14" fill="none" stroke="#CC0000" stroke-width="5.5"/><path d="M31 28 L36 72 M69 28 L64 72 M34 50 H66" fill="none" stroke="#CC0000" stroke-width="8" stroke-linecap="round"/></svg>`,
    keywords: [
      "honda",
      "civic",
      "fc5",
      "fb7",
      "fd6",
      "fe1",
      "fk8",
      "fk2",
      "typer",
      "type-r",
      "type r",
      "ies",
      "vtec",
      "accord",
    ],
  },
  {
    id: "ford",
    name: "Ford",
    subtitle: "Focus 2, Focus 2.5, Focus 3, Focus 3.5, Focus 4, RS, ST, Fiesta, Mondeo & Ranger Bodykit",
    logoUrl: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/ford.png",
    svgLogo: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="50" rx="46" ry="26" fill="#003478" stroke="#cbd5e1" stroke-width="3"/><ellipse cx="50" cy="50" rx="41" ry="21" fill="none" stroke="#fff" stroke-width="1.8"/><text x="50" y="57" fill="#fff" font-size="23" font-weight="900" font-style="italic" font-family="Georgia, serif" text-anchor="middle">Ford</text></svg>`,
    keywords: ["ford", "focus", "fiesta", "mondeo", "kuga", "ranger", "mustang", "puma", "courier", "connect"],
  },
  {
    id: "fiat",
    name: "Fiat",
    subtitle: "Egea Sedan, Egea HB, Linea, Punto, Bravo, Doblo & Fiorino Bodykit Setleri",
    logoUrl: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/fiat.png",
    svgLogo: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M22 16 H78 L84 52 C84 74 50 86 50 86 C50 86 16 74 16 52 Z" fill="#9e0b22" stroke="#cbd5e1" stroke-width="4"/><text x="50" y="58" fill="#fff" font-size="22" font-weight="900" font-family="Arial, sans-serif" text-anchor="middle" letter-spacing="1.5">FIAT</text></svg>`,
    keywords: ["fiat", "egea", "linea", "punto", "doblo", "fiorino", "bravo", "tipo", "albea"],
  },
  {
    id: "peugeot",
    name: "Peugeot",
    subtitle: "301, 206, 207, 208, 308, 407, 508, 2008, 3008 & Rifter Bodykit ve Aksesuar Ürünleri",
    logoUrl: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/peugeot.png",
    svgLogo: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M20 14 H80 L84 54 C84 76 50 88 50 88 C50 88 16 76 16 54 Z" fill="#0f172a" stroke="#cbd5e1" stroke-width="3.5"/><text x="50" y="31" fill="#fff" font-size="9.5" font-weight="800" font-family="Arial, sans-serif" text-anchor="middle" letter-spacing="1.5">PEUGEOT</text><path d="M38 68 L44 42 L56 38 L62 48 L54 56 L60 68" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    keywords: ["peugeot", "peugoet", "206", "207", "208", "301", "308", "407", "508", "2008", "3008", "5008", "rifter"],
  },
  {
    id: "opel",
    name: "Opel",
    subtitle: "Astra H, Astra J, Astra K, Insignia, Corsa D/E/F & Vectra Bodykit, Lip ve Difüzör",
    logoUrl: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/opel.png",
    svgLogo: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="36" fill="none" stroke="#1e293b" stroke-width="6"/><path d="M10 47 L58 47 L46 57 L90 53 L42 53 L54 43 Z" fill="#eab308" stroke="#1e293b" stroke-width="2"/></svg>`,
    keywords: ["opel", "astra", "insignia", "corsa", "vectra", "mokka", "opc"],
  },
  {
    id: "audi",
    name: "Audi",
    subtitle: "A3, A4, A5, A6, S-Line, RS3, RS4, RS5, RS6 & Q Serisi Bodykit, Panjur ve Spoiler",
    logoUrl: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/audi.png",
    svgLogo: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="23" cy="50" r="13" fill="none" stroke="#111" stroke-width="4.5"/><circle cx="41" cy="50" r="13" fill="none" stroke="#111" stroke-width="4.5"/><circle cx="59" cy="50" r="13" fill="none" stroke="#111" stroke-width="4.5"/><circle cx="77" cy="50" r="13" fill="none" stroke="#111" stroke-width="4.5"/></svg>`,
    keywords: ["audi", "a3", "a4", "a5", "a6", "a7", "q3", "q5", "q7", "rs3", "rs4", "rs5", "rs6", "s-line", "s line"],
  },
  {
    id: "mercedes",
    name: "Mercedes-Benz",
    subtitle: "W204, W205, W206, W212, W213, W176, W177, CLA, E-Serisi & C63 AMG Bodykit Setleri",
    logoUrl: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/mercedes-benz.png",
    svgLogo: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="43" fill="none" stroke="#1e293b" stroke-width="5"/><path d="M50 10 L55 47 L86 70 L50 55 L14 70 L45 47 Z" fill="#1e293b"/></svg>`,
    keywords: [
      "mercedes",
      "amg",
      "w204",
      "w205",
      "w206",
      "w212",
      "w213",
      "w176",
      "w177",
      "c180",
      "c200",
      "c63",
      "e180",
      "e200",
      "e250",
      "e63",
      "cla",
      "gla",
    ],
  },
  {
    id: "renault",
    name: "Renault",
    subtitle: "Megane 2, Megane 3, Megane 4, Clio 4, Clio 5, Fluence, Talisman, Symbol & Captur Bodykit",
    logoUrl: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/renault.png",
    svgLogo: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,10 80,50 50,90 20,50" fill="none" stroke="#111" stroke-width="7"/><polygon points="50,25 67,50 50,75 33,50" fill="none" stroke="#eab308" stroke-width="4"/></svg>`,
    keywords: ["renault", "megane", "clio", "fluence", "talisman", "symbol", "captur", "kadjar", "kangoo"],
  },
  {
    id: "hyundai",
    name: "Hyundai",
    subtitle: "i20, i30, Accent Blue, Accent Era, Elantra & Tucson Bodykit, Spoiler ve Difüzör",
    logoUrl: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/hyundai.png",
    svgLogo: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="50" rx="44" ry="27" fill="none" stroke="#002c5f" stroke-width="5.5"/><path d="M34 28 L28 72 M66 28 L72 72 M30 54 Q50 44 70 46" fill="none" stroke="#002c5f" stroke-width="6.5" stroke-linecap="round"/></svg>`,
    keywords: ["hyundai", "i20", "i30", "accent", "elantra", "tucson", "era", "blue"],
  },
  {
    id: "toyota",
    name: "Toyota",
    subtitle: "Corolla E160, E170, E210, Auris, Yaris, C-HR & Hilux Bodykit ve Tampon Ekleri",
    logoUrl: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/toyota.png",
    svgLogo: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="50" rx="44" ry="29" fill="none" stroke="#eb0a1e" stroke-width="5"/><ellipse cx="50" cy="50" rx="14" ry="28" fill="none" stroke="#eb0a1e" stroke-width="4.5"/><ellipse cx="50" cy="39" rx="31" ry="12" fill="none" stroke="#eb0a1e" stroke-width="4.5"/></svg>`,
    keywords: ["toyota", "corolla", "auris", "yaris", "c-hr", "chr", "hilux", "avensis"],
  },
  {
    id: "skoda",
    name: "Skoda",
    subtitle: "Octavia A5/A7/A8, Superb, Fabia, Scala & Kamiq Bodykit, Spoiler ve Difüzör",
    logoUrl: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/skoda.png",
    svgLogo: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="43" fill="none" stroke="#15803d" stroke-width="5.5"/><path d="M28 56 C38 35 60 32 74 38 L52 54 L68 64 L32 64 Z" fill="#15803d"/></svg>`,
    keywords: ["skoda", "octavia", "superb", "fabia", "scala", "kamiq", "karoq", "kodiaq"],
  },
]

function BrandLogoImage({ brand, className = "w-full h-full object-contain" }: { brand: CarBrandItem; className?: string }) {
  const [imgError, setImgError] = useState(false)

  if (imgError) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: brand.svgLogo }}
      />
    )
  }

  return (
    <img
      src={brand.logoUrl}
      alt={brand.name}
      className={className}
      loading="lazy"
      onError={() => setImgError(true)}
    />
  )
}

function normalizeTr(text: string): string {
  return (text || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
}

function doesProductMatchBrand(product: HttpTypes.StoreProduct, brand: CarBrandItem): boolean {
  const haystack = normalizeTr(
    `${product.title || ""} ${product.handle || ""} ${product.subtitle || ""} ${
      (product.categories || []).map((c: any) => `${c.name || ""} ${c.handle || ""}`).join(" ")
    }`
  )

  return brand.keywords.some((kw) => {
    const normKw = normalizeTr(kw)
    if (normKw.length <= 3) {
      const regex = new RegExp(`(^|[^a-z0-9])${normKw}([^a-z0-9]|$)`, "i")
      return regex.test(haystack)
    }
    return haystack.includes(normKw)
  })
}

export default function BrandProductShowcase({
  products,
  region,
  initialBrand = "tumu",
}: {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  initialBrand?: string
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand || "tumu")
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const checkScrollLimits = () => {
    const el = scrollContainerRef.current
    if (!el) return
    setShowLeftArrow(el.scrollLeft > 5)
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 5)
  }

  useEffect(() => {
    const el = scrollContainerRef.current
    if (el) {
      el.addEventListener("scroll", checkScrollLimits)
      checkScrollLimits()
      window.addEventListener("resize", checkScrollLimits)
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScrollLimits)
      window.removeEventListener("resize", checkScrollLimits)
    }
  }, [])

  const scrollTabs = (direction: "left" | "right") => {
    const el = scrollContainerRef.current
    if (!el) return
    const scrollAmount = el.clientWidth * 0.65
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  // Group products by car brand
  const { brandMap, unmatchedProducts } = useMemo(() => {
    const map: Record<string, HttpTypes.StoreProduct[]> = {}
    CAR_BRANDS.forEach((b) => {
      map[b.id] = []
    })

    const matchedIds = new Set<string>()

    for (const product of products || []) {
      for (const brand of CAR_BRANDS) {
        if (doesProductMatchBrand(product, brand)) {
          map[brand.id].push(product)
          matchedIds.add(product.id)
        }
      }
    }

    const unmatched = (products || []).filter((p) => !matchedIds.has(p.id))
    return { brandMap: map, unmatchedProducts: unmatched }
  }, [products])

  // Visible brand groups when "Tüm Markalar" is active vs a single brand is active
  const visibleBrandSections = useMemo(() => {
    if (selectedBrand !== "tumu") {
      const targetBrand = CAR_BRANDS.find((b) => b.id === selectedBrand)
      if (!targetBrand) return []
      const brandProds = brandMap[targetBrand.id] || []
      return [
        {
          brand: targetBrand,
          products: brandProds.length > 0 ? brandProds : products.slice(0, 10),
          isFallback: brandProds.length === 0,
        },
      ]
    }

    // When "tumu" is selected, list each brand that has matching products one below another (alt alta)
    const sections = CAR_BRANDS.map((brand) => ({
      brand,
      products: brandMap[brand.id] || [],
      isFallback: false,
    })).filter((sec) => sec.products.length > 0)

    return sections
  }, [selectedBrand, brandMap, products])

  return (
    <section className="w-full bg-white py-10 border-b border-zinc-200 select-none">
      <div className="content-container px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
          <div>
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-[0.2em] text-violet-600 mb-1">
              ARACINIZA ÖZEL SEÇİM
            </span>
            <h2 className="text-2xl md:text-[28px] font-black text-zinc-950 tracking-tight">
              Araç Markasına Göre Bodykit &amp; Aksesuar Vitrini
            </h2>
            <p className="text-xs md:text-sm text-zinc-500 mt-1">
              Aracınızın markasını seçin veya tüm markaların ürünlerini alt alta inceleyin.
            </p>
          </div>
          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[#c91d82] hover:underline shrink-0"
          >
            <span>Tüm Mağaza Ürünlerini Gör</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </LocalizedClientLink>
        </div>

        {/* 1. Circular Car Brand Logo Tabs Carousel (Our Previous Double-Ring Circle Tab Design) */}
        <div className="relative w-full bg-white py-4 mb-8 group/carousel border-y border-zinc-100">
          {/* Left Arrow Navigation Overlay */}
          {showLeftArrow && (
            <button
              type="button"
              onClick={() => scrollTabs("left")}
              className="absolute -left-2 md:left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-zinc-200 shadow-lg flex items-center justify-center text-zinc-700 hover:text-zinc-950 hover:scale-105 transition-all duration-200 cursor-pointer"
              aria-label="Markaları Sola Kaydır"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Right Arrow Navigation Overlay */}
          {showRightArrow && (
            <button
              type="button"
              onClick={() => scrollTabs("right")}
              className="absolute -right-2 md:right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-zinc-200 shadow-lg flex items-center justify-center text-zinc-700 hover:text-zinc-950 hover:scale-105 transition-all duration-200 cursor-pointer"
              aria-label="Markaları Sağa Kaydır"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Horizontal Scrollable Circular Brand Tabs */}
          <div
            ref={scrollContainerRef}
            className="flex items-center justify-start gap-5 md:gap-7 overflow-x-auto py-2 px-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
          >
            {/* "Tüm Markalar" Tab */}
            <button
              type="button"
              onClick={() => setSelectedBrand("tumu")}
              className="flex flex-col items-center gap-2 group/tab min-w-[86px] snap-center cursor-pointer transition-all duration-300 shrink-0"
            >
              <div
                className={`w-20 h-20 md:w-24 md:h-24 rounded-full border flex items-center justify-center transition-all duration-300 relative bg-white transform group-hover/tab:scale-105 ${
                  selectedBrand === "tumu"
                    ? "border-violet-600 border-2 shadow-[0_4px_16px_rgba(124,58,237,0.16)]"
                    : "border-zinc-200 group-hover/tab:border-violet-400 group-hover/tab:shadow-sm"
                }`}
              >
                <div
                  className={`absolute inset-1.5 rounded-full border transition-all duration-300 ${
                    selectedBrand === "tumu"
                      ? "border-violet-600/30 bg-violet-50/10"
                      : "border-zinc-100 group-hover/tab:border-zinc-200/60"
                  }`}
                />
                <div
                  className={`relative z-10 flex flex-col items-center justify-center ${
                    selectedBrand === "tumu" ? "text-violet-600" : "text-zinc-700 group-hover/tab:text-violet-600"
                  }`}
                >
                  <svg className="w-8 h-8 md:w-9 md:h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <span
                  className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white transition-all duration-300 ${
                    selectedBrand === "tumu" ? "bg-violet-600 scale-110" : "bg-zinc-200 group-hover/tab:bg-violet-400"
                  }`}
                />
              </div>
              <span
                className={`text-[10.5px] md:text-xs font-bold uppercase tracking-wider text-center transition-colors duration-300 whitespace-nowrap mt-0.5 ${
                  selectedBrand === "tumu"
                    ? "text-violet-600 font-extrabold"
                    : "text-zinc-600 group-hover/tab:text-zinc-900"
                }`}
              >
                TÜM MARKALAR
              </span>
            </button>

            {/* Car Brand Tabs with Original Logos inside Double-Ring Circles */}
            {CAR_BRANDS.map((brand) => {
              const isActive = selectedBrand === brand.id
              const count = brandMap[brand.id]?.length || 0

              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => setSelectedBrand(brand.id)}
                  className="flex flex-col items-center gap-2 group/tab min-w-[86px] snap-center cursor-pointer transition-all duration-300 shrink-0"
                >
                  {/* Double Ring Circle Container */}
                  <div
                    className={`w-20 h-20 md:w-24 md:h-24 rounded-full border flex items-center justify-center transition-all duration-300 relative bg-white transform group-hover/tab:scale-105 ${
                      isActive
                        ? "border-violet-600 border-2 shadow-[0_4px_16px_rgba(124,58,237,0.16)]"
                        : "border-zinc-200 group-hover/tab:border-violet-400 group-hover/tab:shadow-sm"
                    }`}
                  >
                    {/* Outer circle sub-ring */}
                    <div
                      className={`absolute inset-1.5 rounded-full border transition-all duration-300 ${
                        isActive
                          ? "border-violet-600/30 bg-violet-50/10"
                          : "border-zinc-100 group-hover/tab:border-zinc-200/60"
                      }`}
                    />

                    {/* Original Car Brand Logo */}
                    <div className="relative z-10 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center p-1">
                      <BrandLogoImage
                        brand={brand}
                        className="w-full h-full object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                      />
                    </div>

                    {/* Product Count Badge on Top-Right of Circle if > 0 */}
                    {count > 0 && (
                      <span
                        className={`absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full text-[10px] font-extrabold flex items-center justify-center border border-white shadow-xs ${
                          isActive ? "bg-violet-600 text-white" : "bg-zinc-900 text-white"
                        }`}
                      >
                        {count}
                      </span>
                    )}

                    {/* Pulsing indicator dot */}
                    <span
                      className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white transition-all duration-300 ${
                        isActive ? "bg-violet-600 scale-110" : "bg-zinc-200 group-hover/tab:bg-violet-400"
                      }`}
                    />
                  </div>

                  {/* Brand Label */}
                  <span
                    className={`text-[10.5px] md:text-xs font-bold uppercase tracking-wider text-center transition-colors duration-300 whitespace-nowrap mt-0.5 ${
                      isActive
                        ? "text-violet-600 font-extrabold"
                        : "text-zinc-600 group-hover/tab:text-zinc-900"
                    }`}
                  >
                    {brand.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. Brand-Focused Vertical Product Blocks (Alt Alta Listeleme - Carousel Değil, 1. Görseldeki Kart Tasarımı) */}
        <div className="space-y-12">
          {visibleBrandSections.map((section) => (
            <div key={section.brand.id} className="space-y-5">
              {/* Brand Section Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-zinc-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full border border-zinc-200 bg-white shadow-xs flex items-center justify-center p-2 shrink-0">
                    <BrandLogoImage
                      brand={section.brand}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg md:text-xl font-black text-zinc-950 uppercase tracking-tight">
                        {section.brand.name} Bodykit &amp; Spoiler Ürünleri
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-[11px] font-extrabold">
                        {section.products.length} Ürün
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{section.brand.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {selectedBrand !== "tumu" && (
                    <button
                      type="button"
                      onClick={() => setSelectedBrand("tumu")}
                      className="text-xs font-bold text-zinc-600 hover:text-zinc-950 px-3 py-1.5 rounded-full border border-zinc-200 hover:border-zinc-400 transition cursor-pointer"
                    >
                      ← Tüm Markaları Göster
                    </button>
                  )}
                  <LocalizedClientLink
                    href="/store"
                    className="inline-flex items-center gap-1 text-[13px] font-bold text-[#c91d82] hover:underline shrink-0"
                  >
                    <span>Tümünü Gör</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </LocalizedClientLink>
                </div>
              </div>

              {/* 5-Column Vertical Product Grid (Alt Alta, Carousel Değil, 1. Görseldeki Kart Tasarımı) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 md:gap-4">
                {section.products.map((product, idx) => (
                  <div key={`${section.brand.id}-${product.id}`} className="h-full">
                    <N11ProductCard
                      product={product}
                      region={region}
                      index={idx}
                      accentColor="#c91d82"
                      freeShippingText="HIZLI KARGO"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Unmatched / Universal Products Section when "Tüm Markalar" is active */}
          {selectedBrand === "tumu" && unmatchedProducts.length > 0 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3 pb-3 border-b-2 border-zinc-100">
                <div>
                  <h3 className="text-lg md:text-xl font-black text-zinc-950 uppercase tracking-tight">
                    Diğer Marka &amp; Üniversal Bodykit Ürünleri
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Tüm araç modelleriyle uyumlu üniversal lip, spoiler, difüzör ve aksesuar çeşitleri
                  </p>
                </div>
                <LocalizedClientLink
                  href="/store"
                  className="inline-flex items-center gap-1 text-[13px] font-bold text-[#c91d82] hover:underline shrink-0"
                >
                  <span>Tümünü Gör</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </LocalizedClientLink>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 md:gap-4">
                {unmatchedProducts.map((product, idx) => (
                  <div key={`unmatched-${product.id}`} className="h-full">
                    <N11ProductCard
                      product={product}
                      region={region}
                      index={idx}
                      accentColor="#c91d82"
                      freeShippingText="HIZLI KARGO"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
