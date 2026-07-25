import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

const configFilePath = path.join(process.cwd(), "uploads", "logo-config.json")

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    if (!fs.existsSync(configFilePath)) {
      return res.json({
        config: {
          logo: null,
          favicon: null,
          mobileLogo: null,
          footerLogo: null,
          emailLogo: null,
          defaultImage: null,
          checkoutLogo: null,
        }
      })
    }

    const fileContent = fs.readFileSync(configFilePath, "utf-8")
    const config = JSON.parse(fileContent)

    res.json({ config })
  } catch (error) {
    res.status(500).json({ message: "Failed to read logo config", error: error.message })
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const data = req.body

    // Ensure uploads directory exists
    const uploadsDir = path.dirname(configFilePath)
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    fs.writeFileSync(configFilePath, JSON.stringify(data, null, 2))

    res.json({ success: true, config: data })
  } catch (error) {
    res.status(500).json({ message: "Failed to save logo config", error: error.message })
  }
}
