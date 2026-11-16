import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
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

    const uploadDir = path.join(process.cwd(), "uploads")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Make filename safe
    const ext = path.extname(filename)
    const base = path.basename(filename, ext).replace(/[^a-zA-Z0-9\-_]/g, "")
    const safeFilename = `${Date.now()}-${base || "media"}${ext}`
    const filePath = path.join(uploadDir, safeFilename)

    // Write file to backend uploads
    fs.writeFileSync(filePath, buffer)

    // Persist uploaded hero media in store.metadata so container redeployments never lose the file
    try {
      const storeModule = req.scope.resolve(Modules.STORE)
      const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
      if (stores[0]) {
        const prevUploaded = (stores[0].metadata?.hero_uploaded_files || {}) as Record<string, any>
        const keys = Object.keys(prevUploaded)
        // Keep at most the latest 5 existing files + this new one so metadata stays bounded
        const trimmed: Record<string, any> = {}
        for (const k of keys.slice(-5)) {
          trimmed[k] = prevUploaded[k]
        }
        trimmed[safeFilename] = {
          base64: base64Data,
          filetype: filetype || "",
          uploaded_at: Date.now(),
        }
        await storeModule.updateStores(stores[0].id, {
          metadata: {
            ...(stores[0].metadata || {}),
            hero_uploaded_files: trimmed,
          },
        })
      }
    } catch (metaErr) {
      console.warn("Could not persist uploaded media to store metadata:", metaErr)
    }

    const rawHost = String(req.headers["x-forwarded-host"] || req.headers.host || "api.bodykitmerkezi.com")
      .split(",")[0]
      .trim()
    const isLocal = rawHost.includes("localhost") || rawHost.includes("127.0.0.1")
    const host = isLocal ? "api.bodykitmerkezi.com" : rawHost
    const protocol = host.includes("bodykitmerkezi.com")
      ? "https"
      : String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim()

    const publicUrl = `${protocol}://${host}/uploads/${safeFilename}`

    res.json({
      success: true,
      url: publicUrl,
      filename: safeFilename,
    })
  } catch (err: any) {
    console.error("Error uploading hero media:", err)
    res.status(500).json({ success: false, message: err.message || "Yükleme başarısız oldu" })
  }
}
