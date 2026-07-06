import { defineMiddlewares } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      method: ["POST"],
      matcher: "/admin/hero-config/upload",
      bodyParser: {
        sizeLimit: "25mb", // Set a generous 25MB limit to support high-quality images and short MP4 videos
      },
    },
    {
      method: ["POST"],
      matcher: "/admin/hero-config",
      bodyParser: {
        sizeLimit: "25mb",
      },
    },
  ],
})
