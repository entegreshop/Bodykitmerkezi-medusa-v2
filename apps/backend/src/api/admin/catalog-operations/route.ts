import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

const CATALOG_STATE_FILE = path.join(process.cwd(), "uploads", "catalog-operations-state.json")

export interface BrandItem {
  id: string
  no: number
  name: string
  active: boolean
  sort_order: number
  slug: string
  image?: string
  seo_title?: string
  seo_desc?: string
  seo_keywords?: string
  product_ids?: string[]
}

export interface ProductTagItem {
  id: string
  no: number
  name: string
  image?: string
  top_left: boolean
  top_right: boolean
  bottom_left: boolean
  bottom_right: boolean
  seo_title?: string
  seo_desc?: string
  seo_keywords?: string
  slug?: string
  product_ids?: string[]
  active: boolean
  sort_order: number
}

export interface StockUnitItem {
  id: string
  no: number
  name: string
  listing_name: string
  abbreviation: string
  decimal_places: string // "Tam Sayı" | "1 Basamak" | "2 Basamak"
  cart_increment: number
  default_cart_qty: number
}

export interface SearchResultItem {
  id: string
  no: number
  keyword: string
  search_count: number
  result_count: number
  first_searched_at: string
  last_searched_at: string
  mapped_keyword: string
}

export interface CatalogState {
  brands: BrandItem[]
  tags: ProductTagItem[]
  units: StockUnitItem[]
  searchResults: SearchResultItem[]
}

const DEFAULT_BRANDS: BrandItem[] = [
  { id: "brand_3", no: 3, name: "Bym Fashion", active: true, sort_order: 0, slug: "bym-fashion" },
  { id: "brand_2", no: 2, name: "Sıla Butik", active: true, sort_order: 0, slug: "sila-butik" },
  { id: "brand_1", no: 1, name: "XOOX", active: true, sort_order: 0, slug: "xoox" },
]

const DEFAULT_UNITS: StockUnitItem[] = [
  { id: "unit_16", no: 16, name: "Kilogram", listing_name: "Kilogram", abbreviation: "Kg.", decimal_places: "1 Basamak", cart_increment: 0.1, default_cart_qty: 1 },
  { id: "unit_15", no: 15, name: "Palet", listing_name: "Palet", abbreviation: "palet", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
  { id: "unit_14", no: 14, name: "Bidon", listing_name: "Bidon", abbreviation: "bidon", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
  { id: "unit_13", no: 13, name: "Kasa", listing_name: "Kasa", abbreviation: "kasa", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
  { id: "unit_12", no: 12, name: "Metreküp", listing_name: "Metreküp", abbreviation: "m3", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
  { id: "unit_11", no: 11, name: "Santimetre", listing_name: "Santimetre", abbreviation: "cm", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
  { id: "unit_10", no: 10, name: "Kutu", listing_name: "Kutu", abbreviation: "kutu", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
  { id: "unit_9", no: 9, name: "Litre", listing_name: "Litre", abbreviation: "Lt.", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
  { id: "unit_8", no: 8, name: "Metrekare", listing_name: "Metrekare", abbreviation: "m2", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
  { id: "unit_7", no: 7, name: "Rulo", listing_name: "Rulo", abbreviation: "rulo", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
  { id: "unit_6", no: 6, name: "Çift", listing_name: "Çift", abbreviation: "çift", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
  { id: "unit_5", no: 5, name: "Set", listing_name: "Set", abbreviation: "set", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
  { id: "unit_4", no: 4, name: "Paket", listing_name: "Paket", abbreviation: "Pk.", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
  { id: "unit_3", no: 3, name: "Gram", listing_name: "Gram", abbreviation: "Gr.", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
  { id: "unit_2", no: 2, name: "Metre", listing_name: "Metre", abbreviation: "Mt.", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
  { id: "unit_1", no: 1, name: "Adet", listing_name: "Adet", abbreviation: "Adet", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
]

const DEFAULT_SEARCH_RESULTS: SearchResultItem[] = [
  { id: "sr_1314", no: 1314, keyword: "1247", search_count: 1, result_count: 17, first_searched_at: "10.11.2026 13:51", last_searched_at: "10.11.2026 13:51", mapped_keyword: "-" },
  { id: "sr_530", no: 530, keyword: "70130", search_count: 5691, result_count: 10, first_searched_at: "08.09.2026 00:29", last_searched_at: "10.11.2026 13:47", mapped_keyword: "-" },
  { id: "sr_1311", no: 1311, keyword: "kaşe uzun kaban 1221", search_count: 29, result_count: 4, first_searched_at: "10.11.2026 00:46", last_searched_at: "10.11.2026 13:47", mapped_keyword: "-" },
  { id: "sr_137", no: 137, keyword: "9001", search_count: 86, result_count: 8, first_searched_at: "31.07.2026 22:21", last_searched_at: "10.11.2026 13:43", mapped_keyword: "-" },
  { id: "sr_1120", no: 1120, keyword: "6050", search_count: 16, result_count: 7, first_searched_at: "24.10.2026 01:32", last_searched_at: "10.11.2026 13:38", mapped_keyword: "-" },
  { id: "sr_330", no: 330, keyword: "7091", search_count: 389, result_count: 7, first_searched_at: "19.08.2026 21:41", last_searched_at: "10.11.2026 13:38", mapped_keyword: "-" },
  { id: "sr_835", no: 835, keyword: "1205", search_count: 28, result_count: 18, first_searched_at: "01.10.2026 18:28", last_searched_at: "10.11.2026 13:33", mapped_keyword: "-" },
  { id: "sr_986", no: 986, keyword: "1220", search_count: 125, result_count: 22, first_searched_at: "15.10.2026 23:40", last_searched_at: "10.11.2026 13:30", mapped_keyword: "-" },
  { id: "sr_958", no: 958, keyword: "1209", search_count: 554, result_count: 16, first_searched_at: "14.10.2026 04:16", last_searched_at: "10.11.2026 13:29", mapped_keyword: "-" },
  { id: "sr_616", no: 616, keyword: "70060", search_count: 29, result_count: 0, first_searched_at: "11.09.2026 22:19", last_searched_at: "10.11.2026 13:13", mapped_keyword: "-" },
  { id: "sr_1223", no: 1223, keyword: "ceket pantolon", search_count: 2, result_count: 5, first_searched_at: "31.10.2026 11:56", last_searched_at: "10.11.2026 13:08", mapped_keyword: "-" },
  { id: "sr_575", no: 575, keyword: "9205", search_count: 1003, result_count: 6, first_searched_at: "09.09.2026 21:36", last_searched_at: "10.11.2026 13:06", mapped_keyword: "-" },
  { id: "sr_1203", no: 1203, keyword: "1235", search_count: 95, result_count: 18, first_searched_at: "28.10.2026 23:43", last_searched_at: "10.11.2026 12:55", mapped_keyword: "-" },
  { id: "sr_981", no: 981, keyword: "1225", search_count: 24, result_count: 14, first_searched_at: "15.10.2026 19:00", last_searched_at: "10.11.2026 12:53", mapped_keyword: "-" },
  { id: "sr_80", no: 80, keyword: "uzun hırkalı üçlü takım 8713", search_count: 6106, result_count: 7, first_searched_at: "28.07.2026 17:58", last_searched_at: "10.11.2026 12:51", mapped_keyword: "-" },
]

export function readCatalogState(): CatalogState {
  try {
    if (fs.existsSync(CATALOG_STATE_FILE)) {
      const raw = fs.readFileSync(CATALOG_STATE_FILE, "utf-8")
      const parsed = JSON.parse(raw)
      return {
        brands: Array.isArray(parsed.brands) && parsed.brands.length > 0 ? parsed.brands : DEFAULT_BRANDS,
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        units: Array.isArray(parsed.units) && parsed.units.length > 0 ? parsed.units : DEFAULT_UNITS,
        searchResults: Array.isArray(parsed.searchResults) && parsed.searchResults.length > 0 ? parsed.searchResults : DEFAULT_SEARCH_RESULTS,
      }
    }
  } catch (e) {}
  return {
    brands: DEFAULT_BRANDS,
    tags: [],
    units: DEFAULT_UNITS,
    searchResults: DEFAULT_SEARCH_RESULTS,
  }
}

export function writeCatalogState(state: CatalogState) {
  try {
    const dir = path.dirname(CATALOG_STATE_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(CATALOG_STATE_FILE, JSON.stringify(state, null, 2), "utf-8")
  } catch (e) {}
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const state = readCatalogState()
    return res.json({
      success: true,
      ...state,
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body || {}) as any
    const { action, id } = body
    const state = readCatalogState()

    // 1. BRANDS (MARKALAR - Görsel 2)
    if (action === "save_brand") {
      const { brand } = body
      if (!brand || !String(brand.name || "").trim()) {
        return res.status(400).json({ success: false, error: "Marka adı zorunludur." })
      }
      const list = [...(state.brands || DEFAULT_BRANDS)]
      const cleanName = String(brand.name).trim()
      const slug =
        String(brand.slug || cleanName)
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w\-]+/g, "") || `marka-${Date.now()}`

      if (brand.id) {
        const idx = list.findIndex((b) => b.id === brand.id)
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            name: cleanName,
            active: brand.active !== false,
            sort_order: Number(brand.sort_order || 0),
            slug,
            image: brand.image || list[idx].image || "",
            seo_title: brand.seo_title || "",
            seo_desc: brand.seo_desc || "",
            seo_keywords: brand.seo_keywords || "",
            product_ids: Array.isArray(brand.product_ids) ? brand.product_ids : list[idx].product_ids || [],
          }
        }
      } else {
        const maxNo = list.reduce((max, b) => (b.no > max ? b.no : max), 0)
        list.unshift({
          id: `brand_${Date.now()}`,
          no: maxNo + 1,
          name: cleanName,
          active: brand.active !== false,
          sort_order: Number(brand.sort_order || 0),
          slug,
          image: brand.image || "",
          seo_title: brand.seo_title || "",
          seo_desc: brand.seo_desc || "",
          seo_keywords: brand.seo_keywords || "",
          product_ids: Array.isArray(brand.product_ids) ? brand.product_ids : [],
        })
      }
      state.brands = list
      writeCatalogState(state)
      return res.json({ success: true, brands: state.brands, message: "Marka başarıyla kaydedildi." })
    }

    if (action === "delete_brand") {
      state.brands = (state.brands || []).filter((b) => b.id !== id)
      writeCatalogState(state)
      return res.json({ success: true, brands: state.brands, message: "Marka silindi." })
    }

    // 2. TAGS (ETİKETLER - Görsel 3)
    if (action === "save_tag") {
      const { tag } = body
      if (!tag || !String(tag.name || "").trim()) {
        return res.status(400).json({ success: false, error: "Etiket adı zorunludur." })
      }
      const list = [...(state.tags || [])]
      const cleanName = String(tag.name).trim()

      if (tag.id) {
        const idx = list.findIndex((t) => t.id === tag.id)
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            name: cleanName,
            image: tag.image || "",
            top_left: Boolean(tag.top_left),
            top_right: Boolean(tag.top_right),
            bottom_left: Boolean(tag.bottom_left),
            bottom_right: Boolean(tag.bottom_right),
            seo_title: tag.seo_title || "",
            seo_desc: tag.seo_desc || "",
            seo_keywords: tag.seo_keywords || "",
            slug: tag.slug || cleanName.toLowerCase().replace(/\s+/g, "-"),
            product_ids: Array.isArray(tag.product_ids) ? tag.product_ids : list[idx].product_ids || [],
            active: tag.active !== false,
            sort_order: Number(tag.sort_order || 0),
          }
        }
      } else {
        const maxNo = list.reduce((max, t) => (t.no > max ? t.no : max), 0)
        list.unshift({
          id: `ptag_${Date.now()}`,
          no: maxNo + 1,
          name: cleanName,
          image: tag.image || "",
          top_left: Boolean(tag.top_left),
          top_right: Boolean(tag.top_right),
          bottom_left: Boolean(tag.bottom_left),
          bottom_right: Boolean(tag.bottom_right),
          seo_title: tag.seo_title || "",
          seo_desc: tag.seo_desc || "",
          seo_keywords: tag.seo_keywords || "",
          slug: tag.slug || cleanName.toLowerCase().replace(/\s+/g, "-"),
          product_ids: Array.isArray(tag.product_ids) ? tag.product_ids : [],
          active: tag.active !== false,
          sort_order: Number(tag.sort_order || 0),
        })
      }
      state.tags = list
      writeCatalogState(state)
      return res.json({ success: true, tags: state.tags, message: "Etiket başarıyla kaydedildi." })
    }

    if (action === "delete_tag") {
      state.tags = (state.tags || []).filter((t) => t.id !== id)
      writeCatalogState(state)
      return res.json({ success: true, tags: state.tags, message: "Etiket silindi." })
    }

    // 3. STOCK UNITS (STOK BİRİMLERİ - Görsel 4)
    if (action === "save_unit") {
      const { unit } = body
      if (!unit || !String(unit.name || "").trim()) {
        return res.status(400).json({ success: false, error: "Birim adı zorunludur." })
      }
      const list = [...(state.units || DEFAULT_UNITS)]
      const cleanName = String(unit.name).trim()

      if (unit.id) {
        const idx = list.findIndex((u) => u.id === unit.id)
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            name: cleanName,
            listing_name: String(unit.listing_name || cleanName).trim(),
            abbreviation: String(unit.abbreviation || cleanName).trim(),
            decimal_places: unit.decimal_places || "Tam Sayı",
            cart_increment: Number(unit.cart_increment || 1),
            default_cart_qty: Number(unit.default_cart_qty || 1),
          }
        }
      } else {
        const maxNo = list.reduce((max, u) => (u.no > max ? u.no : max), 0)
        list.unshift({
          id: `unit_${Date.now()}`,
          no: maxNo + 1,
          name: cleanName,
          listing_name: String(unit.listing_name || cleanName).trim(),
          abbreviation: String(unit.abbreviation || cleanName).trim(),
          decimal_places: unit.decimal_places || "Tam Sayı",
          cart_increment: Number(unit.cart_increment || 1),
          default_cart_qty: Number(unit.default_cart_qty || 1),
        })
      }
      state.units = list
      writeCatalogState(state)
      return res.json({ success: true, units: state.units, message: "Stok birimi başarıyla kaydedildi." })
    }

    if (action === "delete_unit") {
      state.units = (state.units || []).filter((u) => u.id !== id)
      writeCatalogState(state)
      return res.json({ success: true, units: state.units, message: "Stok birimi silindi." })
    }

    // 4. SEARCH RESULTS (ARAMA SONUÇLARI - Görsel 5)
    if (action === "save_search_result") {
      const { item } = body
      if (!item) return res.status(400).json({ success: false, error: "Veri eksik" })
      const list = [...(state.searchResults || DEFAULT_SEARCH_RESULTS)]
      const idx = list.findIndex((s) => s.id === item.id)
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          keyword: String(item.keyword || list[idx].keyword),
          mapped_keyword: String(item.mapped_keyword || "-"),
        }
      } else {
        const maxNo = list.reduce((max, s) => (s.no > max ? s.no : max), 0)
        const nowStr = new Date().toLocaleString("tr-TR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
        list.unshift({
          id: `sr_${Date.now()}`,
          no: maxNo + 1,
          keyword: String(item.keyword || ""),
          search_count: Number(item.search_count || 1),
          result_count: Number(item.result_count || 0),
          first_searched_at: nowStr,
          last_searched_at: nowStr,
          mapped_keyword: String(item.mapped_keyword || "-"),
        })
      }
      state.searchResults = list
      writeCatalogState(state)
      return res.json({ success: true, searchResults: state.searchResults, message: "Arama kaydı güncellendi." })
    }

    if (action === "delete_search_result") {
      state.searchResults = (state.searchResults || []).filter((s) => s.id !== id)
      writeCatalogState(state)
      return res.json({ success: true, searchResults: state.searchResults, message: "Arama kaydı silindi." })
    }

    return res.status(400).json({ success: false, error: "Geçersiz işlem" })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
}
