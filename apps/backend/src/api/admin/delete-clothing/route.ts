import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const productModule = req.scope.resolve(Modules.PRODUCT);
        const inventoryModule = req.scope.resolve(Modules.INVENTORY);
        const query = req.scope.resolve("query");
        
        let msg: string[] = [];
        
        // Find clothing products in draft status
        const products = await productModule.listProducts({ status: "draft" }, { take: 10000 });
        const clothingKeywords = [
          "tayt", "pantolon", "kaban", "kürk", "ceket", "elbise", "likra", "oysho", 
          "bomber", "eşofman", "tulum", "şalvar", "jean", "yüksel bel", "yüksek bel",
          "toparlayıcı", "sıkılaştırıcı", "etek", "triko", "kazak", "hırka", "gömlek",
          "mercedes içi astarlı", "porsche içi astarlı"
        ];
        
        let deletedCount = 0;
        let deletedReservationsCount = 0;
        
        if (products && products.length > 0) {
          for (const p of products) {
             const titleLower = p.title.toLowerCase();
             const isClothing = clothingKeywords.some(kw => titleLower.includes(kw));
             
             if (isClothing) {
                 // Fetch this product's graph to get inventory_item_ids
                 const { data: productGraph } = await query.graph({
                     entity: "product",
                     fields: ["variants.inventory_items.inventory_item_id"],
                     filters: { id: p.id }
                 });
                 
                 const inventoryItemIds: string[] = [];
                 if (productGraph && productGraph.length > 0) {
                     const pg = productGraph[0] as any;
                     if (pg.variants) {
                         for (const v of pg.variants) {
                             if (v.inventory_items) {
                                 for (const ii of v.inventory_items) {
                                     inventoryItemIds.push(ii.inventory_item_id);
                                 }
                             }
                         }
                     }
                 }
                 
                 // Delete reservations for these inventory items
                 if (inventoryItemIds.length > 0) {
                     const reservations = await inventoryModule.listReservationItems({
                         inventory_item_id: inventoryItemIds
                     });
                     if (reservations && reservations.length > 0) {
                         await inventoryModule.deleteReservationItems(reservations.map((r: any) => r.id));
                         deletedReservationsCount += reservations.length;
                     }
                 }
                 
                 // Now delete the variants and product
                 const variants = await productModule.listProductVariants({ product_id: p.id });
                 if (variants && variants.length > 0) {
                    await productModule.deleteProductVariants(variants.map((v: any) => v.id));
                 }
                 await productModule.deleteProducts([p.id]);
                 deletedCount++;
             }
          }
        }
        
        msg.push(`Deleted ${deletedReservationsCount} reservations for clothing items.`);
        msg.push(`Deleted ${deletedCount} clothing products.`);
        
        res.json({ success: true, message: msg.join(" | ") });
    } catch(e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
}
