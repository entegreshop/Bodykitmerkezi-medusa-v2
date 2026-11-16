import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const filename = req.params.filename as string
    if (!filename) {
      return res.status(400).send("No filename provided")
    }

    const uploadDir = path.join(process.cwd(), "uploads")
    const filePath = path.join(uploadDir, filename)

    // If container was redeployed and local uploads/ was reset, restore from store.metadata.hero_uploaded_files
    if (!fs.existsSync(filePath)) {
      try {
        const storeModule = req.scope.resolve(Modules.STORE)
        const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
        const uploadedFiles = (stores[0]?.metadata?.hero_uploaded_files || {}) as Record<
          string,
          { base64?: string; filetype?: string }
        >
        const entry = uploadedFiles[filename]
        if (entry?.base64) {
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
          }
          const rawBase64 = entry.base64.includes(",") ? entry.base64.split(",")[1] : entry.base64
          fs.writeFileSync(filePath, Buffer.from(rawBase64, "base64"))
        }
      } catch (restoreErr) {
        console.warn("Could not restore uploaded file from store metadata:", restoreErr)
      }
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found")
    }

    const ext = path.extname(filename).toLowerCase()
    let contentType = "application/octet-stream"
    if (ext === ".mp4" || ext === ".m4v") contentType = "video/mp4"
    else if (ext === ".mov") contentType = "video/quicktime"
    else if (ext === ".webm") contentType = "video/webm"
    else if (ext === ".png") contentType = "image/png"
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg"
    else if (ext === ".webp") contentType = "image/webp"
    else if (ext === ".gif") contentType = "image/gif"
    else if (ext === ".svg") contentType = "image/svg+xml"

    const stat = fs.statSync(filePath)
    const fileSize = stat.size
    const range = req.headers.range

    res.setHeader("Accept-Ranges", "bytes")
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable")

    // HTTP 206 Partial Content support (Required by iOS Safari / iPhone for <video> playback)
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

      if (isNaN(start) || isNaN(end) || start >= fileSize || end >= fileSize || start > end) {
        res.status(416)
        res.setHeader("Content-Range", `bytes */${fileSize}`)
        return res.end()
      }

      const chunkSize = end - start + 1
      res.status(206)
      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`)
      res.setHeader("Content-Length", String(chunkSize))
      res.setHeader("Content-Type", contentType)

      const stream = fs.createReadStream(filePath, { start, end })
      stream.pipe(res)
      return
    }

    res.status(200)
    res.setHeader("Content-Length", String(fileSize))
    res.setHeader("Content-Type", contentType)

    const stream = fs.createReadStream(filePath)
    stream.pipe(res)
  } catch (error) {
    res.status(500).send("Internal Server Error")
  }
}
