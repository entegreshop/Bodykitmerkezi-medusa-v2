import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const productModule = req.scope.resolve(Modules.PRODUCT);
        
        let msg: string[] = [];
        
        // Find and unpublish clothing products
        const products = await productModule.listProducts({}, { take: 10000 });
        const clothingKeywords = [
          "tayt", "pantolon", "kaban", "kürk", "ceket", "elbise", "likra", "oysho", 
          "bomber", "eşofman", "tulum", "şalvar", "jean", "yüksel bel", "yüksek bel",
          "toparlayıcı", "sıkılaştırıcı", "etek", "triko", "kazak", "hırka", "gömlek",
          "mercedes içi astarlı", "porsche içi astarlı"
        ];
        
        let draftCount = 0;
        if (products && products.length > 0) {
          for (const p of products) {
             const titleLower = p.title.toLowerCase();
             const isClothing = clothingKeywords.some(kw => titleLower.includes(kw));
             
             if (isClothing && p.status !== "draft") {
                 // Safely update the status to draft (unpublish)
                 await productModule.updateProducts(p.id, {
                     status: "draft"
                 });
                 draftCount++;
             }
          }
        }
        
        msg.push(`Successfully unpublished ${draftCount} clothing products.`);
        
        res.json({ success: true, message: msg.join(" | ") });
    } catch(e: any) {
        // Safe error handling without stack trace exposure
        res.status(500).json({ success: false, error: "An error occurred while unpublishing products." });
    }
}
