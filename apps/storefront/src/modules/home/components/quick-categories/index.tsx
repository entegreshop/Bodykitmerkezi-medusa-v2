import Link from "next/link"

const NEXT_PUBLIC_MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

const defaultCategoriesList = [
  {
    name: "Çok Satanlar",
    handle: "cok-satanlar",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>`
  },
  {
    name: "Bodykit",
    handle: "bodykit",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`
  },
  {
    name: "Difüzör",
    handle: "difuzor",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>`
  },
  {
    name: "Spoiler",
    handle: "spoiler",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`
  },
  {
    name: "Tampon & Ek",
    handle: "tampon-ek",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`
  },
  {
    name: "Marşpiyel",
    handle: "marspiyel",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`
  },
  {
    name: "Aydınlatma",
    handle: "aydinlatma",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
  },
  {
    name: "Aksesuar",
    handle: "aksesuar",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
  }
]

async function getCategoriesConfig() {
  try {
    const headers: Record<string, string> = {}
    if (NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers["x-publishable-api-key"] = NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }

    const res = await fetch(`${NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/hero-config`, {
      cache: "no-store", // Ensure real-time configuration loading
      headers,
    })
    const data = await res.json()
    return data?.config?.categories || defaultCategoriesList
  } catch (err) {
    console.error("Failed to fetch categories config in Storefront:", err)
    return defaultCategoriesList
  }
}

export default async function QuickCategories() {
  const categoriesList = await getCategoriesConfig()

  return (
    <div className="w-full bg-white py-10 border-b border-zinc-200">
      <div className="content-container">
        {/* Horizontal scroll container on mobile, flex row on desktop */}
        <div className="flex items-center justify-start md:justify-center gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth">
          {categoriesList.map((cat, idx) => (
            <Link
              key={idx}
              href={`/categories/${cat.handle}`}
              className="flex flex-col items-center gap-3 group min-w-[85px] snap-center cursor-pointer transition-all duration-300"
            >
              {/* Circular Icon container with premium light violet hover border */}
              <div className="w-16 h-16 rounded-full border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-600 relative transition-all duration-300 group-hover:text-violet-600 group-hover:border-violet-500/30 group-hover:bg-violet-500/5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] group-hover:shadow-[0_8px_20px_rgba(124,58,237,0.12)] transform group-hover:scale-105">
                {/* SVG or Image Icon rendered dynamically */}
                {cat.icon && cat.icon.trim().startsWith("<svg") ? (
                  <div 
                    className="w-8 h-8 flex items-center justify-center shrink-0"
                    dangerouslySetInnerHTML={{ __html: cat.icon }} 
                  />
                ) : (
                  <img 
                    src={cat.icon} 
                    className="w-8 h-8 object-contain shrink-0" 
                    alt={cat.name} 
                  />
                )}
                
                {/* Tiny absolute neon pulse dot */}
                <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-zinc-200 border border-white group-hover:bg-violet-500 group-hover:border-violet-200 transition-colors duration-300" />
              </div>
              
              {/* Category Name */}
              <span className="text-xs md:text-sm text-zinc-600 font-semibold tracking-wide group-hover:text-zinc-950 transition-colors duration-300 whitespace-nowrap">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

