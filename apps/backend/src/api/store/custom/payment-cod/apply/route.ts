import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { ICartModuleService, IStoreModuleService } from "@medusajs/framework/types"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const cartModule = req.scope.resolve<ICartModuleService>(Modules.CART)
    const storeModule = req.scope.resolve<IStoreModuleService>(Modules.STORE)
    
    const body = req.body as { cart_id: string; method_id: string }
    
    if (!body.cart_id) {
       return res.status(400).json({ error: "cart_id is required" })
    }

    // 1. Get Store settings
    const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
    const store = stores[0]
    const codSettings = store?.metadata?.payment_cod as any || { is_active: false, additional_fee: "0", min_amount: "0" }
    const codCcSettings = store?.metadata?.payment_cod_cc as any || { is_active: false, additional_fee: "0", min_amount: "0" }

    // 2. Fetch the cart
    const cart = await cartModule.retrieveCart(body.cart_id, {
        relations: ["items"]
    })

    const COD_ITEM_TITLE = "Kapıda Ödeme Ek Hizmet Bedeli"
    const existingCodItem = cart.items?.find((i: any) => i.title === COD_ITEM_TITLE)

    // 3. Evaluate logic
    const isCodMethod = body.method_id === "cod" || body.method_id === "cash_on_delivery" || body.method_id === "cod_cash" || body.method_id === "manual";
    const isCodCcMethod = body.method_id === "cod_cc" || body.method_id === "cash_on_delivery_cc";

    if ((isCodMethod && codSettings.is_active) || (isCodCcMethod && codCcSettings.is_active)) {
       // Get relevant settings
       const activeSettings = isCodCcMethod ? codCcSettings : codSettings;
       const maxAmount = parseFloat(activeSettings.min_amount) || Infinity
       
       // Calculate subtotal from items without the COD item
       const subtotal = cart.items?.filter((i:any) => !i.title?.includes("Kapıda")).reduce((acc: number, item: any) => acc + (item.unit_price * item.quantity), 0) || 0

       if (subtotal <= maxAmount) {
         if (!existingCodItem) {
             const fee = parseFloat(activeSettings.additional_fee) || 0
             if (fee > 0) {
                 await cartModule.addLineItems(cart.id, [
                   {
                     title: isCodCcMethod ? "Kapıda Kredi Kartı Ek Hizmet Bedeli" : COD_ITEM_TITLE,
                     quantity: 1,
                     unit_price: fee, // Depending on currency this might need to be fee * 100
                     metadata: { is_cod_fee: true }
                   } as any
                 ])
             }
         }
        } else {
           // Not reached minimum
           const allCodItems = cart.items?.filter((i: any) => i.title?.includes("Kapıda"));
           if (allCodItems?.length) {
              for (const item of allCodItems) {
                 await cartModule.deleteLineItems(item.id)
              }
           }
       }
    } else {
       // Not COD or COD inactive, remove if exists
       const allCodItems = cart.items?.filter((i: any) => i.title?.includes("Kapıda"));
       if (allCodItems?.length) {
          for (const item of allCodItems) {
             await cartModule.deleteLineItems(item.id)
          }
       }
    }

    res.json({ success: true })

  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}
