import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"
import { defaultPages } from "../../store/pages/route"

const configFilePath = path.join(process.cwd(), "uploads", "pages-config.json")

function readConfig() {
  try {
    if (fs.existsSync(configFilePath)) {
      const content = fs.readFileSync(configFilePath, "utf-8")
      return JSON.parse(content)
    }
  } catch (err) {
    console.error("Error reading pages config:", err)
  }
  return defaultPages
}

function writeConfig(data: any) {
  try {
    const dir = path.dirname(configFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(configFilePath, JSON.stringify(data, null, 2), "utf-8")
    return true
  } catch (err) {
    console.error("Error writing pages config:", err)
    return false
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pages = readConfig()
  res.json({ pages })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as any
  
  if (!body.pages) {
    return res.status(400).json({ success: false, message: "Missing pages data" })
  }

  const success = writeConfig(body.pages)
  if (success) {
    res.json({ success: true, pages: body.pages })
  } else {
    res.status(500).json({ success: false, message: "Could not write configuration" })
  }
}
