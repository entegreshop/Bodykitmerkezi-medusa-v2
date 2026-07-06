import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"
import os from "os"

const configFilePath = path.join(os.homedir(), ".xoox-pixel-settings.json")

interface PixelConfig {
  meta_pixel: {
    active: boolean
    pixel_id: string
    access_token: string
  }
  google_ads: {
    active: boolean
    conversion_id: string
    conversion_label: string
  }
  google_analytics: {
    active: boolean
    measurement_id: string
  }
  google_tag_manager: {
    active: boolean
    gtm_id: string
  }
  tiktok_pixel: {
    active: boolean
    pixel_id: string
    access_token: string
  }
}

const defaultData: PixelConfig = {
  meta_pixel: {
    active: false,
    pixel_id: "",
    access_token: ""
  },
  google_ads: {
    active: false,
    conversion_id: "",
    conversion_label: ""
  },
  google_analytics: {
    active: false,
    measurement_id: ""
  },
  google_tag_manager: {
    active: false,
    gtm_id: ""
  },
  tiktok_pixel: {
    active: false,
    pixel_id: "",
    access_token: ""
  }
}

export function readConfig(): PixelConfig {
  try {
    if (fs.existsSync(configFilePath)) {
      const content = fs.readFileSync(configFilePath, "utf-8")
      const parsed = JSON.parse(content)
      return {
        meta_pixel: { ...defaultData.meta_pixel, ...(parsed.meta_pixel || {}) },
        google_ads: { ...defaultData.google_ads, ...(parsed.google_ads || {}) },
        google_analytics: { ...defaultData.google_analytics, ...(parsed.google_analytics || {}) },
        google_tag_manager: { ...defaultData.google_tag_manager, ...(parsed.google_tag_manager || {}) },
        tiktok_pixel: { ...defaultData.tiktok_pixel, ...(parsed.tiktok_pixel || {}) }
      }
    }
  } catch (err) {
    console.error("Error reading pixel config in admin api:", err)
  }
  return defaultData
}

function writeConfig(data: any) {
  try {
    fs.writeFileSync(configFilePath, JSON.stringify(data, null, 2), "utf-8")
    return true
  } catch (err) {
    console.error("Error writing pixel config in admin api:", err)
    return false
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const config = readConfig()
  res.json({ config })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as any
  const success = writeConfig(body)
  if (success) {
    res.json({ success: true, config: body })
  } else {
    res.status(500).json({ success: false, message: "Could not write configuration" })
  }
}
