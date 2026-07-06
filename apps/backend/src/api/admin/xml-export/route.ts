import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import { randomUUID } from "crypto"

export interface XmlFeedConfig {
  id: string
  name: string
  format: "google" | "facebook" | "custom"
  currency: string
  language: string
  product_source: string
  categories: string[]
  brands: string
  price_type: string
  status: string
  stock_status: string
  min_stock: number
  add_barcode: string
  profit_margin: number
  hide_no_image: boolean
}

const CONFIG_FILE_PATH = path.join(os.homedir(), ".xoox-xml-feeds.json")

export const getXmlFeeds = (): XmlFeedConfig[] => {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, "utf-8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.error("Error reading xml feeds file:", error)
  }
  return []
}

export const saveXmlFeeds = (feeds: XmlFeedConfig[]) => {
  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(feeds, null, 2), "utf-8")
  } catch (error) {
    console.error("Error writing xml feeds file:", error)
  }
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const feeds = getXmlFeeds()
    res.json({ feeds })
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const payload = req.body as Partial<XmlFeedConfig>
    const feeds = getXmlFeeds()

    if (payload.id) {
      // Update existing
      const index = feeds.findIndex(f => f.id === payload.id)
      if (index !== -1) {
        feeds[index] = { ...feeds[index], ...payload }
      } else {
        return res.status(404).json({ success: false, error: "Feed not found" })
      }
    } else {
      // Create new
      const newFeed: XmlFeedConfig = {
        id: randomUUID(),
        name: payload.name || "Yeni XML",
        format: payload.format || "facebook",
        currency: payload.currency || "TL",
        language: payload.language || "Varsayılan",
        product_source: payload.product_source || "Fametarz",
        categories: payload.categories || [],
        brands: payload.brands || "Tüm Markalar",
        price_type: payload.price_type || "Varsayılan Satış Fiyatı",
        status: payload.status || "Aktif Olanlar",
        stock_status: payload.stock_status || "Stokta Olanlar",
        min_stock: payload.min_stock !== undefined ? payload.min_stock : -9999,
        add_barcode: payload.add_barcode || "Eklensin",
        profit_margin: payload.profit_margin || 0,
        hide_no_image: payload.hide_no_image !== undefined ? payload.hide_no_image : true,
      }
      feeds.push(newFeed)
    }

    saveXmlFeeds(feeds)
    res.json({ success: true, feeds })
  } catch (error) {
    console.error("Error saving xml feed:", error)
    res.status(500).json({ success: false, error: "Internal server error" })
  }
}
