import { fetchStorePixelConfig } from "@modules/layout/components/pixel-scripts"

export const dynamic = "force-dynamic"

export async function GET() {
  const config = await fetchStorePixelConfig()
  const content =
    config?.llms_txt?.active !== false && config?.llms_txt?.content
      ? config.llms_txt.content
      : `# BodyKit Merkezi (bodykitmerkezi.com)\n> Aracınıza özel premium bodykit setleri, ön lip, tampon eki, arka difüzör, spoiler, marşpiyel, ön panjur, bagaj havuzu ve oto modifiye aksesuarları.\n\n- Mağaza: https://bodykitmerkezi.com/tr\n- Tüm Ürünler: https://bodykitmerkezi.com/tr/store`

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  })
}
