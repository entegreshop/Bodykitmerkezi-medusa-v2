import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { updateProductsWorkflow } from "@medusajs/core-flows"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const productModuleService = req.scope.resolve("product") as any
    const products = await productModuleService.listProducts({}, { take: 5000, relations: ["options", "variants"] })
    
    const productsToUpdate: any[] = [];
    let fixedVariantsCount = 0;
    
    for (const p of products) {
      let updateData: any = { id: p.id };
      let changed = false;

      // 1. Fix Description
      if (p.description && (p.description.includes("Trendyol'dan Otomatik") || p.description.includes("<p>") || p.description.trim() === "")) {
        updateData.description = `${p.title}, aracınıza özel bir görünüm katan şık ve estetik bir aksesuardır. Yüksek kaliteli plastik malzemeden üretilmiş olup dayanıklılığı ve uzun ömürlü kullanımıyla dikkat çeker. Aracınızın arka bölümünde zarif bir görünüm sağlar ve aracınızın tasarımını güncelleyerek modern bir hava katmaya yardımcı olur.\n\nÖzel olarak tasarlanmış detayları ve uyumlu yapısıyla aracınıza mükemmel bir uyum sağlar. Kolay montaj özelliği sayesinde kullanıcıların işini kolaylaştırırken, dayanıklı yapısı uzun süreli kullanım sunar. Görselde belirtilen ürün modeli size gönderilecektir.\n\nÜrün Malzemesi: Yüksek kalite standartlarına sahiptir ve dayanıklı bir yapıya sahiptir. Ayrıca, koku yapmaz, leke tutmaz ve uzun süre dayanıklılığını korur.\n\nÜrün Rengi: Ürün, astarsız/renksiz ve mat siyahtır.\n\nPaket İçeriği: ${p.title}\n\nTüm Donanım Paketlerine Uyumludur.\n\nÜrün, aracınızla birebir uyumludur.\n\nPlastik ürünlerin boyanarak kullanılması tavsiye edilir. Kaplamaya uygundur.\n\nÜrün, darbeye dayanıklı esnek sağlam malzemeden yapılmıştır.\n\nÜrünler boyasızdır. Boyalı sipariş vermek istiyorsanız seçeneklerden uygun olanı seçip siparişinizi gerçekleştirebilirsiniz.\n\nBoya ve Montaj için lütfen fiyat alınız.\n\nÜrünlerimiz üretim hatası ve/veya malzemeden kaynaklanacak sorunlara karşı 2 Yıl Garantilidir.\n\nTürkiye'nin her yerine gönderim yapmaktayız.`;
        changed = true;
      }

      // 2. Ensure all variants allow ordering without stock errors
      for (const v of p.variants || []) {
        if (v.manage_inventory || !v.allow_backorder) {
          try {
            await productModuleService.updateProductVariants(v.id, {
              manage_inventory: false,
              allow_backorder: true,
            })
            fixedVariantsCount++
          } catch {
            try {
              await productModuleService.updateProductVariants([
                {
                  id: v.id,
                  manage_inventory: false,
                  allow_backorder: true,
                },
              ])
              fixedVariantsCount++
            } catch {}
          }
        }
      }
      
      if (changed) {
        productsToUpdate.push(updateData);
      }
    }

    if (productsToUpdate.length > 0) {
      await updateProductsWorkflow(req.scope).run({
        input: {
          products: productsToUpdate
        }
      });
    }

    res.json({
      success: true,
      fixedVariantsCount,
      message: `${productsToUpdate.length} ürünün açıklaması ve ${fixedVariantsCount} varyantın stok ayarı güncellendi.`
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}
