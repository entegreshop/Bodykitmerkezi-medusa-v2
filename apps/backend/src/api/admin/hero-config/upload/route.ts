import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { filename, filetype, base64 } = req.body as {
      filename: string
      filetype: string
      base64: string
    }

    if (!filename || !base64) {
      return res.status(400).json({ success: false, message: "Dosya adı veya veri eksik" })
    }

    // Extract the raw base64 data
    const base64Data = base64.includes(",") ? base64.split(",")[1] : base64
    const buffer = Buffer.from(base64Data, "base64")

    // Define the upload directory in the storefront public folder
    const uploadDir = path.join(process.cwd(), "..", "storefront", "public", "uploads")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Make filename safe
    const ext = path.extname(filename)
    const base = path.basename(filename, ext).replace(/[^a-zA-Z0-9\-_]/g, "")
    const safeFilename = `${Date.now()}-${base}${ext}`
    const filePath = path.join(uploadDir, safeFilename)

    // Write file to storefront public uploads
    fs.writeFileSync(filePath, buffer)

    // Get storefront URL from STORE_CORS if available, otherwise default to localhost:8000
    let storefrontUrl = "http://localhost:8000"
    if (process.env.STORE_CORS) {
      const origins = process.env.STORE_CORS.split(",")
      const localOrigin = origins.find(o => o.includes("localhost:8000") || o.includes("xoox.com.tr"))
      if (localOrigin) {
        storefrontUrl = localOrigin.trim()
      } else if (origins.length > 0) {
        storefrontUrl = origins[0].trim()
      }
    }

    const publicUrl = `${storefrontUrl}/uploads/${safeFilename}`

    res.json({
      success: true,
      url: publicUrl,
      filename: safeFilename
    })
  } catch (err: any) {
    console.error("Error uploading hero media:", err)
    res.status(500).json({ success: false, message: err.message || "Yükleme başarısız oldu" })
  }
}
