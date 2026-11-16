import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
    admin: {
    disable: false,
    path: (process.env.MEDUSA_ADMIN_PATH || "/app") as `/${string}`,
    backendUrl: process.env.MEDUSA_BACKEND_URL || "https://api.bodykitmerkezi.com",
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    databaseDriverOptions: {
      pool: {
        min: 2,
        max: 40,
        idleTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
      },
    },
    http: {
      storeCors: process.env.STORE_CORS || "https://bodykitmerkezi.com,https://www.bodykitmerkezi.com,http://localhost:8000",
      adminCors: process.env.ADMIN_CORS || "https://api.bodykitmerkezi.com,http://localhost:9000",
      authCors: process.env.AUTH_CORS || "https://api.bodykitmerkezi.com,http://localhost:9000",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "./src/modules/xml_import",
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/payment-integrations/providers/paytr",
          },
          {
            resolve: "./src/modules/payment-integrations/providers/cod",
          },
          {
            resolve: "./src/modules/payment-integrations/providers/bank-transfer",
          },
        ],
      },
    },
  ],
})

setTimeout(async () => {
  try {
    const { Client } = require("pg")
    const c = new Client({ connectionString: process.env.DATABASE_URL })
    await c.connect()
    // Remove red-triangle Güneşli Garaj cover images (gg-*, 1web.jpg) from image gallery
    await c.query(`
      DELETE FROM image
      WHERE url ~* '/(gg[-_][a-z0-9_-]+|1web|1-web|web)\\.(jpg|jpeg|png|webp)'
    `).catch(() => {})
    // Restore soft-deleted product images for products whose thumbnail became empty during edit
    await c.query(`
      UPDATE image
      SET deleted_at = NULL
      WHERE deleted_at IS NOT NULL
        AND url !~* '/(gg[-_][a-z0-9_-]+|1web|1-web|web)\\.(jpg|jpeg|png|webp)'
        AND product_id IN (
          SELECT id FROM product WHERE deleted_at IS NULL AND (thumbnail IS NULL OR thumbnail = '' OR thumbnail ~* '/(gg[-_][a-z0-9_-]+|1web|1-web|web)\\.(jpg|jpeg|png|webp)')
        )
    `).catch(() => {})
    await c.query(`
      UPDATE product p
      SET thumbnail = sub.url
      FROM (
        SELECT DISTINCT ON (product_id) product_id, url
        FROM image
        WHERE deleted_at IS NULL
          AND url IS NOT NULL
          AND url <> ''
          AND url !~* '/(gg[-_][a-z0-9_-]+|1web|1-web|web)\\.(jpg|jpeg|png|webp)'
        ORDER BY product_id, rank ASC, created_at ASC
      ) sub
      WHERE p.id = sub.product_id
        AND (p.thumbnail IS NULL OR p.thumbnail = '' OR p.thumbnail ~* '/(gg[-_][a-z0-9_-]+|1web|1-web|web)\\.(jpg|jpeg|png|webp)')
    `).catch(() => {})
    await c.end()
  } catch (e) {
    console.error("Image restore check error:", e)
  }

  // Trigger automatic GunesliGaraj 842-product & category sync once HTTP server is ready
  setTimeout(async () => {
    try {
      const port = process.env.PORT || "9000"
      const res = await fetch(`http://127.0.0.1:${port}/custom/sync-gunesligaraj`)
      const data = await res.json().catch(() => null)
      console.log("[GunesliGaraj Auto-Sync]:", data)
    } catch (syncErr) {
      console.error("[GunesliGaraj Auto-Sync Error]:", syncErr)
    }
  }, 6000)
}, 8000)
