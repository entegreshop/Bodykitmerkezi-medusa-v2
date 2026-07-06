import { defineRouteConfig } from "@medusajs/admin-sdk"
import { SparklesSolid, TagSolid, ReceiptPercent, TruckFast, ShoppingCartSolid, Bolt, GiftSolid } from "@medusajs/icons"
import { Container, Heading, Text, Button, Input, Switch, Toaster, toast, Select, Badge, Table, Label } from "@medusajs/ui"
import { useState, useEffect } from "react"
import { sdk } from "../../lib/config"
import { ErpTopNav } from "./erp-top-nav";

export const config = defineRouteConfig({
  label: "Kampanya Kurguları",
  icon: SparklesSolid,
})

const ProductAjaxSearch = ({ onSelect, selectedId }: { onSelect: (id: string) => void, selectedId: string }) => {
    const [query, setQuery] = useState("")
    const [products, setProducts] = useState<any[]>([])
    const [searching, setSearching] = useState(false)
    const [selectedName, setSelectedName] = useState("")

    useEffect(() => {
        if (!query || query.trim().length === 0) {
             setProducts([])
             return
        }
        const timer = setTimeout(async () => {
             setSearching(true)
             try {
                 const res = await sdk.admin.product.list({ q: query, limit: 5 })
                 setProducts(res.products || [])
             } catch(e) { }
             setSearching(false)
        }, 400)
        return () => clearTimeout(timer)
    }, [query])

    return (
        <div className="relative">
            {selectedId ? (
                <div className="flex items-center justify-between p-2 border border-ui-border-base rounded-md bg-ui-bg-subtle">
                   <Text size="small" className="font-medium text-ui-fg-base truncate pr-2">{selectedName || selectedId}</Text>
                   <Button variant="secondary" size="small" onClick={() => { onSelect(""); setSelectedName("") }}>Değiştir</Button>
                </div>
            ) : (
                <div className="relative">
                    <Input 
                       type="search"
                       placeholder="Aramak için ürün adı yazın..." 
                       value={query} 
                       onChange={e => setQuery(e.target.value)} 
                       autoComplete="off"
                    />
                    {searching && (
                        <div className="absolute right-3 top-2.5">
                            <div className="w-4 h-4 rounded-full border-2 border-ui-border-base border-t-ui-fg-interactive animate-spin" />
                        </div>
                    )}
                </div>
            )}
            
            {!selectedId && query.length > 0 && products.length === 0 && !searching && (
                <div className="absolute z-50 w-full mt-1 p-3 bg-ui-bg-base border border-ui-border-base rounded-md shadow-elevation-flyout text-center">
                    <Text size="small" className="text-ui-fg-subtle">Ürün bulunamadı.</Text>
                </div>
            )}
            {!selectedId && products.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-ui-bg-base border border-ui-border-base rounded-md shadow-elevation-flyout max-h-60 overflow-y-auto">
                   {products.map((p: any) => (
                       <div 
                          key={p.id} 
                          className="p-3 border-b border-ui-border-base last:border-b-0 cursor-pointer hover:bg-ui-bg-subtle flex items-center justify-between transition-colors"
                          onClick={() => {
                              onSelect(p.id)
                              setSelectedName(p.title)
                              setQuery("")
                              setProducts([])
                          }}
                       >
                           <div className="flex items-center gap-x-3">
                              {p.thumbnail ? (
                                  <img src={p.thumbnail} alt="" className="w-10 h-10 border border-ui-border-base rounded-md object-cover" />
                              ) : (
                                  <div className="w-10 h-10 rounded-md bg-ui-bg-component border border-ui-border-base" />
                              )}
                              <div className="flex flex-col">
                                 <Text size="small" weight="plus" className="text-ui-fg-base leading-tight">{p.title}</Text>
                                 <Text size="xsmall" className="text-ui-fg-subtle mt-0.5">ID: {p.id.slice(0,12)}...</Text>
                              </div>
                           </div>
                           <Button variant="secondary" size="small">Seç</Button>
                       </div>
                   ))}
                </div>
            )}
        </div>
    )
}

const MultiProductAjaxSearch = ({ onAdd, selectedProducts, onRemove, onUpdate }: { onAdd: (p: any) => void, selectedProducts: any[], onRemove: (id: string) => void, onUpdate?: (id: string, updates: any) => void }) => {
    const [query, setQuery] = useState("")
    const [products, setProducts] = useState<any[]>([])
    const [searching, setSearching] = useState(false)

    useEffect(() => {
        if (!query || query.trim().length === 0) {
             setProducts([])
             return
        }
        const timer = setTimeout(async () => {
             setSearching(true)
             try {
                 const res = await sdk.admin.product.list({ q: query, limit: 10, fields: "+title,thumbnail,id" })
                 setProducts(res.products || [])
             } catch(e) { }
             setSearching(false)
        }, 400)
        return () => clearTimeout(timer)
    }, [query])

    return (
        <div className="flex flex-col gap-y-3">
            <div className="relative">
                <Input 
                   type="search"
                   placeholder="Eklemek için ürün adı arayın..." 
                   value={query} 
                   onChange={e => setQuery(e.target.value)} 
                   autoComplete="off"
                />
                {searching && (
                    <div className="absolute right-3 top-2.5">
                        <div className="w-4 h-4 rounded-full border-2 border-ui-border-base border-t-ui-fg-interactive animate-spin" />
                    </div>
                )}
                
                {query.length > 0 && products.length === 0 && !searching && (
                    <div className="absolute z-50 w-full mt-1 p-3 bg-ui-bg-base border border-ui-border-base rounded-md shadow-elevation-flyout text-center">
                        <Text size="small" className="text-ui-fg-subtle">Ürün bulunamadı.</Text>
                    </div>
                )}
                
                {products.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-ui-bg-base border border-ui-border-base rounded-md shadow-elevation-flyout max-h-60 overflow-y-auto">
                       {products.map((p: any) => (
                           <div 
                              key={p.id} 
                              className="p-3 border-b border-ui-border-base last:border-b-0 cursor-pointer hover:bg-ui-bg-subtle flex items-center justify-between transition-colors"
                              onClick={() => {
                                  if (!selectedProducts.find(sp => sp.id === p.id)) {
                                      onAdd({ id: p.id, title: p.title, thumbnail: p.thumbnail })
                                  }
                                  setQuery("")
                                  setProducts([])
                              }}
                           >
                               <div className="flex items-center gap-x-3">
                                  {p.thumbnail ? (
                                      <img src={p.thumbnail} alt="" className="w-10 h-10 border border-ui-border-base rounded-md object-cover" />
                                  ) : (
                                      <div className="w-10 h-10 rounded-md bg-ui-bg-component border border-ui-border-base" />
                                  )}
                                  <div className="flex flex-col">
                                     <Text size="small" weight="plus" className="text-ui-fg-base leading-tight">{p.title}</Text>
                                  </div>
                               </div>
                               <Button variant="secondary" size="small">Ekle</Button>
                           </div>
                       ))}
                    </div>
                )}
            </div>

            {selectedProducts.length > 0 && (
                <div className="flex flex-col gap-y-2">
                    {selectedProducts.map(sp => (
                        <div key={sp.id} className="flex flex-col md:flex-row md:items-center justify-between p-2 border border-ui-border-base rounded-md bg-ui-bg-subtle gap-2">
                           <div className="flex items-center gap-x-3 flex-1 min-w-0">
                              {sp.thumbnail && <img src={sp.thumbnail} alt="" className="w-8 h-8 rounded border object-cover" />}
                              <Text size="small" className="font-medium text-ui-fg-base truncate">{sp.title}</Text>
                           </div>
                           <div className="flex items-center gap-x-2 shrink-0">
                             {onUpdate && (
                               <>
                                 <Select value={sp.type || "fixed"} onValueChange={v => onUpdate(sp.id, { type: v })}>
                                     <Select.Trigger className="w-28 h-8 text-xs"><Select.Value /></Select.Trigger>
                                     <Select.Content className="z-50 bg-ui-bg-base">
                                         <Select.Item value="percent">Yüzde (%)</Select.Item>
                                         <Select.Item value="fixed">Sabit (TL)</Select.Item>
                                     </Select.Content>
                                 </Select>
                                 <Input 
                                   className="w-16 h-8 text-xs" 
                                   placeholder="Tutar" 
                                   value={sp.amount || "50"} 
                                   onChange={e => onUpdate(sp.id, { amount: e.target.value })} 
                                   title="İndirim Oranı/Tutarı"
                                 />
                                 <Input 
                                   type="datetime-local" 
                                   value={sp.end_date || ""} 
                                   onChange={e => onUpdate(sp.id, { end_date: e.target.value })} 
                                   title="Bitiş Tarihi"
                                   className="h-8 text-xs"
                                 />
                               </>
                             )}
                             <Button variant="danger" size="small" onClick={() => onRemove(sp.id)}>Kaldır</Button>
                           </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

const CampaignFlowsPage = () => {
    const [activeTab, setActiveTab] = useState("yuzde")
    const [loading, setLoading] = useState(false)
    const [promotions, setPromotions] = useState<any[]>([])

    // Simulated forms
    const [yuzdeForm, setYuzdeForm] = useState({ code: "", amount: "", minCart: "", active: true, type: "percent", end_date: "" })
    const [bogoForm, setBogoForm] = useState({ code: "", buyQty: 1, getQty: 1, active: true })
    const [hediyeForm, setHediyeForm] = useState<{ minPrice: string, categoryIds: string[], selectedProducts: any[], active: boolean }>({ minPrice: "1000", categoryIds: [], selectedProducts: [], active: true })
    const [categories, setCategories] = useState<any[]>([])
    const [sepetteForm, setSepetteForm] = useState({ name: "Sepette İndirim", type: "percent", amount: "", category: "all", minCart: "", active: true })
    const [urunKuponForm, setUrunKuponForm] = useState({ code: "FIRSAT10", type: "percent", amount: "10", end_date: "", selectedProducts: [] as any[], active: true })

    // Cart Upsells
    const [cartUpsells, setCartUpsells] = useState<any[]>([])

    // Otomasyon State
    const [savingOtomasyon, setSavingOtomasyon] = useState(false);
    const [otomasyonSettings, setOtomasyonSettings] = useState({
      enabled: true,
      free_shipping_limit: 3000,
      winner_mode_percent: 30,
      tiers: [
        { index: 0, percent: 0 },
        { index: 1, percent: 10 },
        { index: 2, percent: 15 },
        { index: 3, percent: 20 },
        { index: 4, percent: 25 },
      ],
      timer_enabled: false,
      timer_minutes: 15,
      cooldown_hours: 24,
    });

    const [existingYuzdePromos, setExistingYuzdePromos] = useState<any[]>([])

    const fetchPromotions = async () => {
        try {
            const res = await sdk.admin.promotion.list({ limit: 100 });
            // Filter only standard ones that are manual
            const standardPromos = res.promotions.filter(p => p.type === "standard" && p.is_automatic === false);
            setExistingYuzdePromos(standardPromos);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        // Fetch existing metadata to prefill
        fetch("http://localhost:9000/admin/custom/store-meta")
           .then(res => res.json())
           .then(data => {
               if (data?.metadata?.cart_upsells && Array.isArray(data.metadata.cart_upsells)) {
                   setCartUpsells(data.metadata.cart_upsells)
               }
               if (data?.metadata?.discount_automation_settings) {
                   setOtomasyonSettings(data.metadata.discount_automation_settings);
               }
               if (data?.metadata?.hediye_urunler_settings) {
                   setHediyeForm(data.metadata.hediye_urunler_settings);
               }
           }).catch(console.error)
           
        fetchPromotions();
        sdk.admin.productCategory.list({ limit: 100, fields: "id,name" }).then(res => setCategories(res.product_categories)).catch(console.error);
    }, [])

    const handleSaveOtomasyon = async () => {
      setSavingOtomasyon(true);
      try {
        await sdk.client.fetch(`/admin/custom/store-meta`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: {
            discount_automation_settings: otomasyonSettings
          }
        });
        toast.success("Kampanya ayarları başarıyla kaydedildi.");
      } catch (err) {
        console.error(err);
        toast.error("Ayarlar kaydedilirken bir hata oluştu.");
      } finally {
        setSavingOtomasyon(false);
      }
    };

    const handleTierChange = (index: number, value: string) => {
      const newTiers = [...otomasyonSettings.tiers];
      newTiers[index].percent = Number(value);
      setOtomasyonSettings({ ...otomasyonSettings, tiers: newTiers });
    };

    const handleSave = async (type: string) => {
        setLoading(true)
        try {
            if (type === "hediye") {
                if (hediyeForm.selectedProducts.length === 0) throw new Error("En az 1 hediye ürün seçmelisiniz");
                await sdk.client.fetch(`/admin/custom/store-meta`, {
                    method: "POST",
                    body: { hediye_urunler_settings: hediyeForm }
                });
                alert("Hediye Ürünler kuralı başarıyla güncellendi");
                setLoading(false);
                return;
            }

            if (type === "urun_kupon") {
                if (urunKuponForm.selectedProducts.length === 0) throw new Error("En az 1 ürün seçilmelidir")
                
                // Fetch all currently active special offer products using the store API (which already correctly filters them)
                let currentlyActive: any[] = [];
                try {
                    const res = await fetch("http://localhost:9000/store/special-offers", {
                        headers: { "x-publishable-api-key": "pk_2c282ff4870aa9a458b774fc276908462c41f9626349330ff535a7bce4852274" }
                    });
                    const data = await res.json();
                    currentlyActive = data.specialOffers || data.products || (Array.isArray(data) ? data : []);
                } catch (e) {
                    console.error(e);
                }
                
                
                // Disable ones that are not in the new list
                const selectedIds = urunKuponForm.selectedProducts.map((sp: any) => sp.id);
                const toDisable = currentlyActive.filter(p => !selectedIds.includes(p.id));
                
                for (const p of toDisable) {
                    await sdk.admin.product.update(p.id, {
                        metadata: {
                            ...p.metadata,
                            coupon_badge: {
                                active: false
                            }
                        }
                    });
                }

                await Promise.all(urunKuponForm.selectedProducts.map(async (sp: any) => {
                    const uniqueCode = `FIRSAT-${sp.id.slice(-6).toUpperCase()}`;
                    
                    // 1. Gerçek Medusa Promosyonunu Oluştur
                    try {
                        await sdk.admin.promotion.create({
                            code: uniqueCode,
                            type: "standard",
                            is_automatic: true,
                            application_method: {
                                type: (sp.type || "fixed") === "percent" ? "percentage" : "fixed",
                                target_type: "items",
                                allocation: "each",
                                value: (sp.type || "fixed") === "percent" ? Number(sp.amount || "50") : Number(sp.amount || "50") * 100,
                                ...((sp.type || "fixed") !== "percent" ? { currency_code: "try" } : {}),
                                target_rules: [
                                    {
                                        attribute: "product_id",
                                        operator: "in",
                                        values: [sp.id]
                                    }
                                ]
                            }
                        })
                    } catch (promoErr: any) {
                        if (promoErr?.message && promoErr.message.includes("already exists")) {
                             // Kod zaten var ise yola devam et
                        } else {
                             console.error(`Promosyon oluşturma hatası: ${promoErr?.message || "Bilinmeyen hata"}`)
                        }
                    }

                    // 2. Medusa Admin SDK ile seçili ürünlerin metadata alanını güncelliyoruz
                    await sdk.admin.product.update(sp.id, {
                        metadata: {
                            coupon_badge: {
                                active: urunKuponForm.active,
                                code: uniqueCode,
                                type: sp.type || "fixed",
                                amount: sp.amount || "50",
                                end_date: sp.end_date || ""
                            }
                        }
                    })
                }));
                toast.success("Sepete Özel Fırsat Ürünü Tanımlandı!", {
                    description: "Seçili ürünler sepet sayfasında müşterilere otomatik indirimle önerilecektir."
                })
                setPromotions(prev => [{ id: Math.random(), type, status: 'active', code: "Sepete Özel Fırsat" }, ...prev])
                setLoading(false)
                return
            }

            if (type === "cart_upsells") {
                const res = await sdk.client.fetch("/admin/custom/store-meta", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: { cart_upsells: cartUpsells }
                })
                toast.success("Sepette Fırsat Ürünleri Kaydedildi!", {
                    description: "Seçtiğiniz indirimli fırsat ürünleri sepet sayfasında üst sırada yer alacaktır."
                })
                setLoading(false)
                return
            }

            if (type === "yuzde") {
                if (!yuzdeForm.code) throw new Error("Kupon kodu zorunludur.");
                try {
                    const created = await sdk.admin.promotion.create({
                        code: yuzdeForm.code,
                        type: "standard",
                        is_automatic: false,
                        status: yuzdeForm.active ? "active" : "draft",
                        application_method: {
                            type: yuzdeForm.type === "percent" ? "percentage" : "fixed",
                            target_type: "order",
                            value: yuzdeForm.type === "percent" ? Number(yuzdeForm.amount || "10") : Number(yuzdeForm.amount || "10") * 100,
                            ...(yuzdeForm.type !== "percent" ? { currency_code: "try" } : {})
                        },
                        rules: yuzdeForm.minCart ? [
                            {
                                attribute: "item_total",
                                operator: "gte",
                                values: [String(Number(yuzdeForm.minCart) * 100)]
                            }
                        ] : undefined
                    });
                    
                    if (yuzdeForm.end_date) {
                        try {
                           // If metadata wasn't fully supported in SDK create, fallback to direct fetch
                           const promoId = created.promotion?.id;
                           if (promoId) {
                               await sdk.client.fetch(`/admin/promotions/${promoId}`, {
                                   method: "POST",
                                   headers: { "Content-Type": "application/json" },
                                   body: { metadata: { end_date: yuzdeForm.end_date } }
                               });
                           }
                        } catch(e) {
                           console.error("Failed to set end_date metadata", e);
                        }
                    }
                } catch (promoErr: any) {
                    if (promoErr?.message && promoErr.message.includes("already exists")) {
                        // pass
                    } else {
                        throw promoErr;
                    }
                }
            } else {
                // Medusa Promotions API (simulated/custom endpoint wrapper)
                // Orjinalde POST /admin/promotions
                const res = await sdk.client.fetch("/admin/marketing", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: { 
                        type: "campaign_creation",
                        campaign_type: type,
                        data: type === 'bogo' ? bogoForm : type === 'sepette' ? sepetteForm : hediyeForm
                    }
                })
            }
            
            toast.success("Kampanya Başarıyla Tanımlandı!", {
                description: "Satış kanallarınızda (Storefront) aktif edildi."
            })
            
            if (type === "yuzde") {
                await fetchPromotions();
                // Formu temizle
                setYuzdeForm({ code: "", amount: "", minCart: "", active: true, type: "percent", end_date: "" });
            } else {
                // Re-fetch simulated list
                setPromotions(prev => [{ id: Math.random(), type, status: 'active', code: type === 'bogo' ? bogoForm.code : type === 'sepette' ? sepetteForm.name : "HEDIYE_URUN" }, ...prev])
            }
            
        } catch(e: any) {
            toast.error("Hata Oluştu", {
                description: e?.message || "Kampanya kaydedilirken bir hata oluştu."
            })
        } finally {
            setLoading(false)
        }
    }

    const TabButton = ({ value, label, icon: Icon }: { value: string, label: string, icon: any }) => {
        const isActive = activeTab === value
        return (
           <button
             onClick={() => setActiveTab(value)}
             className={`flex items-center gap-x-2 px-6 py-4 transition-all focus:outline-none border-b-2 ${
               isActive 
                 ? 'text-ui-fg-base border-ui-fg-base font-semibold bg-ui-bg-subtle' 
                 : 'text-ui-fg-subtle border-transparent hover:text-ui-fg-base hover:bg-ui-bg-subtle-hover'
             }`}
           >
             <Icon className={isActive ? "text-ui-fg-base" : "text-ui-fg-muted"} />
             <Text size="small" weight={isActive ? "plus" : "regular"} className={isActive ? "text-ui-fg-base" : ""}>{label}</Text>
           </button>
        )
    }

    return (
       <div className="flex flex-col w-full pb-10 bg-[#f4f6f8] min-h-screen -m-6 relative">
          <Toaster />
          <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 mt-8 flex flex-col gap-y-4">
          
          <div className="flex items-center justify-between mb-2">
             <div>
                <Heading level="h1" className="text-ui-fg-base text-2xl">Kampanya Kurguları</Heading>
                <Text size="small" className="text-ui-fg-subtle mt-1">Siteniz için dinamik sepet kuralları ve kolay indirim kurguları oluşturun.</Text>
             </div>
             <div className="flex gap-x-3">
                 <Button variant="secondary" size="small" onClick={() => setActiveTab("liste")}>
                     Mevcut Kurguları Gör
                 </Button>
             </div>
          </div>

          <Container className="p-0 overflow-hidden bg-ui-bg-base shadow-elevation-card-rest border-ui-border-base mt-2">
             {/* Üst Sekmeler */}
             <div className="flex border-b border-ui-border-base bg-ui-bg-base overflow-x-auto">
                <TabButton value="urun_kupon" label="Sepete Özel İndirim" icon={TagSolid} />
                <TabButton value="yuzde" label="Kupon & Klasik İndirim" icon={ReceiptPercent} />
                <TabButton value="sepette" label="Sepette İndirim" icon={ShoppingCartSolid} />
                <TabButton value="bogo" label="X Al Y Öde (BOGO)" icon={TagSolid} />
                <TabButton value="hediye" label="Hediye Ürünler" icon={GiftSolid} />
                <TabButton value="cart_upsells" label="Sepette Fırsat" icon={SparklesSolid} />
                <TabButton value="otomasyon" label="Dinamik İndirim Otomasyonu" icon={Bolt} />
              </div>

             {/* İçerik */}
             <div className="p-8">

                 {/* OTOMASYON SEKMESI */}
                 {activeTab === "otomasyon" && (
                    <div className="flex flex-col gap-y-8 animate-in fade-in duration-300">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <Heading level="h2" className="text-xl font-semibold text-ui-fg-base">Dinamik İndirim Otomasyonu</Heading>
                          <Text className="text-ui-fg-subtle mt-1">Sıralı ürün indirimlerini ve kargo kurgularını buradan yönetin.</Text>
                        </div>
                        <Button variant="primary" onClick={handleSaveOtomasyon} isLoading={savingOtomasyon} className="bg-black hover:bg-gray-800 text-white">
                          Değişiklikleri Kaydet
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Sol Kolon - Genel Ayarlar */}
                        <div className="lg:col-span-1 flex flex-col gap-6">
                          <Container className="p-6 shadow-sm border border-ui-border-base rounded-xl">
                            <div className="flex items-center justify-between mb-6">
                              <div>
                                <Heading level="h2" className="text-lg font-medium text-ui-fg-base">Otomasyon Durumu</Heading>
                                <Text className="text-sm text-ui-fg-subtle">Otomasyonu geçici olarak durdurabilirsiniz.</Text>
                              </div>
                              <Switch 
                                checked={otomasyonSettings.enabled} 
                                onCheckedChange={(checked) => setOtomasyonSettings({ ...otomasyonSettings, enabled: checked })} 
                              />
                            </div>

                            <div className="h-px w-full bg-ui-border-base mb-6" />

                            <div className="flex flex-col gap-y-4">
                              <Heading level="h2" className="text-lg font-medium text-ui-fg-base">Kargo Otomasyonu</Heading>
                              
                              <div className="flex flex-col gap-y-2">
                                <Label>Bedava Kargo Alt Limiti (TL)</Label>
                                <Input 
                                  type="number" 
                                  value={otomasyonSettings.free_shipping_limit} 
                                  onChange={(e) => setOtomasyonSettings({ ...otomasyonSettings, free_shipping_limit: Number(e.target.value) })}
                                  placeholder="Örn: 3000"
                                />
                                <Text className="text-xs text-ui-fg-muted">İndirimler sonrası toplam tutar bu değeri geçerse kargo sıfırlanır.</Text>
                              </div>
                            </div>
                          </Container>

                          <Container className="p-6 shadow-sm border border-ui-border-base rounded-xl bg-ui-bg-subtle">
                            <Heading level="h2" className="text-lg font-medium mb-2 flex items-center gap-x-2 text-ui-fg-base">
                              <TagSolid className="text-ui-fg-base" />
                              Winner Modu (Sabit İndirim)
                            </Heading>
                            <Text className="text-sm text-ui-fg-subtle mb-4">
                              Tabloda belirtilen kademeler bittikten sonra (örneğin 6. ürün ve sonrası) uygulanacak sabit indirim oranıdır.
                            </Text>
                            
                            <div className="flex items-center gap-x-2">
                              <Input 
                                type="number" 
                                value={otomasyonSettings.winner_mode_percent} 
                                onChange={(e) => setOtomasyonSettings({ ...otomasyonSettings, winner_mode_percent: Number(e.target.value) })}
                                className="w-24"
                              />
                              <Text className="font-medium text-ui-fg-base">%</Text>
                            </div>
                          </Container>

                          <Container className="p-6 shadow-sm border border-ui-border-base rounded-xl">
                            <div className="flex items-center justify-between mb-6">
                              <div>
                                <Heading level="h2" className="text-lg font-medium text-ui-fg-base">Sepet Sayacı (Aciliyet)</Heading>
                                <Text className="text-sm text-ui-fg-subtle">Kullanıcılara sepet için süre tanıyın.</Text>
                              </div>
                              <Switch 
                                checked={otomasyonSettings.timer_enabled || false} 
                                onCheckedChange={(checked) => setOtomasyonSettings({ ...otomasyonSettings, timer_enabled: checked })} 
                              />
                            </div>

                            {otomasyonSettings.timer_enabled && (
                              <div className="flex flex-col gap-y-4">
                                <div className="h-px w-full bg-ui-border-base" />
                                <div className="flex flex-col gap-y-2">
                                  <Label>İndirim Süresi (Dakika)</Label>
                                  <Input 
                                    type="number" 
                                    value={otomasyonSettings.timer_minutes || 15} 
                                    onChange={(e) => setOtomasyonSettings({ ...otomasyonSettings, timer_minutes: Number(e.target.value) })}
                                    placeholder="Örn: 15"
                                  />
                                  <Text className="text-xs text-ui-fg-muted">Kullanıcının sepetteki indirimleri kullanabilmesi için sahip olduğu süre.</Text>
                                </div>
                                <div className="flex flex-col gap-y-2">
                                  <Label>Ceza/Bekleme Süresi (Saat)</Label>
                                  <Input 
                                    type="number" 
                                    value={otomasyonSettings.cooldown_hours || 24} 
                                    onChange={(e) => setOtomasyonSettings({ ...otomasyonSettings, cooldown_hours: Number(e.target.value) })}
                                    placeholder="Örn: 24"
                                  />
                                  <Text className="text-xs text-ui-fg-muted">Süre dolduktan sonra aynı sepete indirimlerin tekrar tanımlanması için geçmesi gereken süre.</Text>
                                </div>
                              </div>
                            )}
                          </Container>
                        </div>

                        {/* Sağ Kolon - Kademe Tablosu */}
                        <div className="lg:col-span-2">
                          <Container className="p-0 shadow-sm border border-ui-border-base rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-ui-border-base">
                              <Heading level="h2" className="text-lg font-medium text-ui-fg-base">İndirim Kademeleri</Heading>
                              <Text className="text-sm text-ui-fg-subtle mt-1">Kullanıcı sepete ürün ekledikçe sırasıyla aşağıdaki indirimler uygulanır.</Text>
                            </div>

                            <Table>
                              <Table.Header>
                                <Table.Row>
                                  <Table.HeaderCell>Sıra (Index)</Table.HeaderCell>
                                  <Table.HeaderCell>Tanım</Table.HeaderCell>
                                  <Table.HeaderCell>İndirim Oranı (%)</Table.HeaderCell>
                                </Table.Row>
                              </Table.Header>
                              <Table.Body>
                                {otomasyonSettings.tiers.map((tier, index) => (
                                  <Table.Row key={index}>
                                    <Table.Cell className="font-medium text-ui-fg-base">{tier.index + 1}. Sıra</Table.Cell>
                                    <Table.Cell className="text-ui-fg-subtle">{tier.index + 1}. Eklenen Ürün</Table.Cell>
                                    <Table.Cell>
                                      <div className="flex items-center gap-x-2 w-32">
                                        <Input 
                                          type="number" 
                                          value={tier.percent} 
                                          onChange={(e) => handleTierChange(index, e.target.value)}
                                        />
                                        <Text className="text-ui-fg-base">%</Text>
                                      </div>
                                    </Table.Cell>
                                  </Table.Row>
                                ))}
                              </Table.Body>
                            </Table>
                            
                            <div className="p-4 bg-ui-bg-subtle border-t border-ui-border-base flex justify-center">
                              <Text className="text-sm text-ui-fg-muted font-medium italic">
                                {otomasyonSettings.tiers.length + 1}. Sıra ve sonrası için "Winner Modu" ({otomasyonSettings.winner_mode_percent}%) devreye girer.
                              </Text>
                            </div>
                          </Container>
                        </div>
                      </div>
                    </div>
                 )}

                 {/* URUN KUPONU SEKMESI */}
                 {activeTab === "urun_kupon" && (
                    <div className="flex flex-col gap-y-8 animate-in fade-in duration-300">
                       <div className="bg-ui-bg-subtle p-4 border border-ui-border-base rounded-lg mb-2">
                          <Text size="small" weight="plus" className="text-ui-fg-base mb-1">Trendyol Stili Sepete Özel Fırsat Ürünleri</Text>
                          <Text size="xsmall" className="text-ui-fg-subtle">Sepet sayfasında müşterilere indirimli olarak önereceğiniz çapraz satış (cross-sell) fırsat ürünlerini belirleyin. Sepete Ekle butonuna basıldığında indirim otomatik uygulanır.</Text>
                       </div>

                       <div className="flex flex-col gap-8">
                          <div className="flex flex-col gap-y-2">
                              <Text size="small" weight="plus" className="text-ui-fg-base">Hedef Ürün Adını Arayın <span className="text-ui-fg-error">*</span></Text>
                              <MultiProductAjaxSearch 
                                   selectedProducts={urunKuponForm.selectedProducts} 
                                   onAdd={(p) => setUrunKuponForm(prev => ({...prev, selectedProducts: [...prev.selectedProducts, { ...p, type: 'fixed', amount: '50' }]}))}
                                   onRemove={(id) => setUrunKuponForm(prev => ({...prev, selectedProducts: prev.selectedProducts.filter((sp: any) => sp.id !== id)}))}
                                   onUpdate={(id, updates) => setUrunKuponForm(prev => ({...prev, selectedProducts: prev.selectedProducts.map((sp: any) => sp.id === id ? { ...sp, ...updates } : sp)}))}
                              />
                              <Text size="xsmall" className="text-ui-fg-muted mt-1">Seçilen bu ürünler sepette fırsat kutusunda önerilecektir.</Text>
                          </div>
                           <div className="flex items-center justify-between p-4 border border-ui-border-base rounded-lg bg-ui-bg-subtle mt-6">
                              <Text size="small" weight="plus" className="text-ui-fg-base">Rozeti Göster & Aktif Et</Text>
                              <Switch checked={urunKuponForm.active} onCheckedChange={v => setUrunKuponForm(p => ({...p, active: v}))} />
                           </div>
                       </div>

                       <div className="flex justify-end pt-4">
                          <Button variant="primary" isLoading={loading} onClick={() => handleSave("urun_kupon")}>Sepete Özel Fırsat Olarak Kaydet</Button>
                       </div>
                    </div>
                 )}
                
                {/* YÜZDE SEKMESİ */}
                {activeTab === "yuzde" && (
                   <div className="flex flex-col gap-y-8 animate-in fade-in duration-300">
                      <div className="bg-ui-bg-subtle p-4 border border-ui-border-base rounded-lg mb-2">
                         <Text size="small" weight="plus" className="text-ui-fg-base mb-1">Klasik Kupon Kurgusu</Text>
                         <Text size="xsmall" className="text-ui-fg-subtle">Müşterilerinizin sepette kullanabileceği basit VIP ya da oran tabanlı (Örn: %20 veya 100 TL) indirimler yaratın.</Text>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="flex flex-col gap-y-2">
                             <Text size="small" weight="plus" className="text-ui-fg-base">Kupon Kodu <span className="text-ui-fg-error">*</span></Text>
                             <Input placeholder="Örn: YAZ20 veya VIP10" value={yuzdeForm.code} onChange={e => setYuzdeForm(p => ({...p, code: e.target.value}))} />
                         </div>
                         <div className="flex flex-col gap-y-2">
                             <Text size="small" weight="plus" className="text-ui-fg-base">İndirim Oranı / Tutarı</Text>
                             <div className="flex items-center gap-x-2">
                                <Select value={yuzdeForm.type} onValueChange={v => setYuzdeForm(p => ({...p, type: v}))}>
                                    <Select.Trigger className="w-32"><Select.Value /></Select.Trigger>
                                    <Select.Content className="z-50 bg-ui-bg-base">
                                        <Select.Item value="percent">Yüzde (%)</Select.Item>
                                        <Select.Item value="fixed">Sabit (TL)</Select.Item>
                                    </Select.Content>
                                </Select>
                                <Input placeholder="Örn: 20" value={yuzdeForm.amount} onChange={e => setYuzdeForm(p => ({...p, amount: e.target.value}))} />
                             </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-ui-border-base pt-6">
                         <div className="flex flex-col gap-y-2">
                             <Text size="small" weight="plus" className="text-ui-fg-base">Minimum Sepet Tutarı (Opsiyonel)</Text>
                             <Input placeholder="Örn: 500 (Bu tutarın altındakiler kullanamaz)" value={yuzdeForm.minCart} onChange={e => setYuzdeForm(p => ({...p, minCart: e.target.value}))} />
                         </div>
                         <div className="flex flex-col gap-y-2">
                             <Text size="small" weight="plus" className="text-ui-fg-base">Bitiş Tarihi (Sayaç İçin, Opsiyonel)</Text>
                             <Input type="datetime-local" value={yuzdeForm.end_date} onChange={e => setYuzdeForm(p => ({...p, end_date: e.target.value}))} />
                         </div>
                         <div className="flex items-center justify-between p-4 border border-ui-border-base rounded-lg bg-ui-bg-subtle col-span-1 md:col-span-2">
                             <Text size="small" weight="plus" className="text-ui-fg-base">Aktif Et</Text>
                             <Switch checked={yuzdeForm.active} onCheckedChange={v => setYuzdeForm(p => ({...p, active: v}))} />
                         </div>
                      </div>

                      <div className="flex justify-end pt-4">
                         <Button variant="primary" isLoading={loading} onClick={() => handleSave("yuzde")}>Kurguyu Kaydet & Başlat</Button>
                      </div>

                      <div className="mt-8 border-t border-ui-border-base pt-8 animate-in fade-in duration-300">
                          <Text size="large" weight="plus" className="text-ui-fg-base mb-4">Aktif Klasik Kuponlar</Text>
                          <div className="flex flex-col gap-y-2">
                              {existingYuzdePromos.length === 0 ? (
                                  <div className="text-center p-8 border border-dashed border-ui-border-base rounded-lg text-ui-fg-subtle">
                                      Henüz hiç klasik kupon tanımlamadınız. Yukarıdan yeni bir kupon oluşturabilirsiniz.
                                  </div>
                              ) : (
                                  existingYuzdePromos.map(promo => {
                                      const isPercent = promo.application_method?.type === 'percentage';
                                      const amount = promo.application_method?.value;
                                      const minCartRule = promo.rules?.find((r: any) => r.attribute === 'item_total');
                                      const rawMinCart = minCartRule ? minCartRule.values[0] : null;
                                      const minCart = rawMinCart !== null ? (typeof rawMinCart === 'object' ? rawMinCart.value || rawMinCart.id : rawMinCart) : null;
                                      
                                      const displayAmount = isPercent ? amount : (amount ? amount / 100 : 0);
                                      const displayMinCart = minCart ? (Number(minCart) / 100) : null;

                                      return (
                                          <div key={promo.id} className="flex items-center justify-between px-6 py-4 border border-ui-border-base rounded-lg bg-white mb-3 shadow-sm h-20">
                                              {/* Sol Alan: Kupon Kodu ve Sayaç */}
                                              <div className="w-[200px] flex flex-col justify-center">
                                                  <span className="font-bold text-gray-900 text-[15px] tracking-wide">{promo.code}</span>
                                                  {promo.metadata?.end_date && (
                                                      <div className="flex items-center mt-1 text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-sm w-fit">
                                                          Son: {new Date(promo.metadata.end_date as string).toLocaleDateString("tr-TR")}
                                                      </div>
                                                  )}
                                              </div>
                                              
                                              {/* Ayırıcı Çizgi */}
                                              <div className="h-8 w-px bg-gray-200 mx-8"></div>

                                              {/* Orta Alan: Min Sepet & İndirim (Tam Ortalanmış) */}
                                              <div className="flex-1 flex items-center justify-center gap-x-16">
                                                  <div className="flex flex-col items-center min-w-[80px]">
                                                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">MİN SEPET</span>
                                                      <span className="text-gray-900 text-[14px] font-medium">{displayMinCart ? `${displayMinCart} TL` : '-'}</span>
                                                  </div>
                                                  
                                                  <div className="flex flex-col items-center min-w-[80px]">
                                                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">İNDİRİM</span>
                                                      <span className="text-gray-900 text-[15px] font-extrabold">{isPercent ? `%${displayAmount}` : `${displayAmount} TL`}</span>
                                                  </div>
                                              </div>

                                              {/* Ayırıcı Çizgi */}
                                              <div className="h-8 w-px bg-gray-200 mx-8"></div>
                                              
                                              {/* Sağ Alan: Durum & Sil */}
                                              <div className="w-[200px] flex items-center justify-end">
                                                  <div className="flex items-center gap-x-3 mr-8">
                                                      <span className="text-[13px] text-gray-500 font-medium">Durum:</span>
                                                      <Switch 
                                                          checked={promo.status === 'active'} 
                                                          onCheckedChange={async (v) => {
                                                              try {
                                                                  await sdk.admin.promotion.update(promo.id, {
                                                                      status: v ? 'active' : 'draft'
                                                                  });
                                                                  fetchPromotions();
                                                                  toast.success(`Kupon durumu ${v ? 'Aktif' : 'Pasif'} olarak güncellendi`);
                                                              } catch (e: any) {
                                                                  toast.error("Durum güncellenirken hata oluştu");
                                                              }
                                                          }} 
                                                      />
                                                  </div>
                                                  
                                                  <button 
                                                      className="bg-[#E91E63] hover:bg-[#D81B60] text-white text-sm font-medium rounded-md px-4 py-2 transition-colors focus:outline-none"
                                                      onClick={async () => {
                                                          if(confirm('Bu kuponu silmek istediğinize emin misiniz?')) {
                                                              try {
                                                                  await sdk.admin.promotion.delete(promo.id);
                                                                  toast.success("Kupon başarıyla silindi");
                                                                  fetchPromotions();
                                                              } catch(e: any) {
                                                                  toast.error("Silinirken bir hata oluştu");
                                                              }
                                                          }
                                                      }}
                                                  >
                                                      Sil
                                                  </button>
                                              </div>
                                          </div>
                                      )
                                  })
                              )}
                          </div>
                      </div>
                   </div>
                )}

                 {/* SEPETTE INDIRIM SEKMESI */}
                 {activeTab === "sepette" && (
                    <div className="flex flex-col gap-y-8 animate-in fade-in duration-300">
                       <div className="bg-ui-bg-subtle p-4 border border-ui-border-base rounded-lg mb-2">
                          <Text size="small" weight="plus" className="text-ui-fg-base mb-1">Pazaryeri Usulü "Sepette İndirim"</Text>
                          <Text size="xsmall" className="text-ui-fg-subtle">Müşteri ürünü sepete attığı anda, herhangi bir kupon koduna gerek duymaksızın otomatik yansıyan ciro artırıcı indirim kurgusudur (Trendyol mantığı).</Text>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="flex flex-col gap-y-2">
                              <Text size="small" weight="plus" className="text-ui-fg-base">Kampanya Etiketi (Vitrin Görünümü) <span className="text-ui-fg-error">*</span></Text>
                              <Input placeholder="Örn: Sepette %10 İndirim" value={sepetteForm.name} onChange={e => setSepetteForm(p => ({...p, name: e.target.value}))} />
                          </div>
                          <div className="flex flex-col gap-y-2">
                              <Text size="small" weight="plus" className="text-ui-fg-base">İndirim Oranı / Tutarı</Text>
                              <div className="flex items-center gap-x-2">
                                 <Select value={sepetteForm.type} onValueChange={v => setSepetteForm(p => ({...p, type: v}))}>
                                     <Select.Trigger className="w-32"><Select.Value /></Select.Trigger>
                                     <Select.Content className="z-50 bg-ui-bg-base">
                                         <Select.Item value="percent">Yüzde (%)</Select.Item>
                                         <Select.Item value="fixed">Sabit (TL)</Select.Item>
                                     </Select.Content>
                                 </Select>
                                 <Input placeholder="Örn: 10" value={sepetteForm.amount} onChange={e => setSepetteForm(p => ({...p, amount: e.target.value}))} />
                              </div>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-ui-border-base pt-6">
                          <div className="flex flex-col gap-y-2">
                              <Text size="small" weight="plus" className="text-ui-fg-base">Geçerli Kategoriler</Text>
                              <Select value={sepetteForm.category} onValueChange={v => setSepetteForm(p => ({...p, category: v}))}>
                                 <Select.Trigger><Select.Value /></Select.Trigger>
                                 <Select.Content className="z-50 bg-ui-bg-base">
                                     <Select.Item value="all">Tüm Ürünlerde Geçerli</Select.Item>
                                     <Select.Item value="specific">Sadece Seçili Kategorilerde</Select.Item>
                                 </Select.Content>
                              </Select>
                          </div>
                          <div className="flex flex-col gap-y-2">
                              <Text size="small" weight="plus" className="text-ui-fg-base">Alt Limit (Opsiyonel Tutarı)</Text>
                              <Input placeholder="Örn: 1000" value={sepetteForm.minCart} onChange={e => setSepetteForm(p => ({...p, minCart: e.target.value}))} />
                          </div>
                          <div className="flex items-center justify-between p-4 border border-ui-border-base rounded-lg bg-ui-bg-subtle col-span-2">
                              <div>
                                 <Text size="small" weight="plus" className="text-ui-fg-base">Otomatik Sepet Kuralını Etkinleştir</Text>
                                 <Text size="xsmall" className="text-ui-fg-subtle">Bu kural etkinleştirildiğinde şartları sağlayan tüm aktif sepetlerde indirim hemen yansır.</Text>
                              </div>
                              <Switch checked={sepetteForm.active} onCheckedChange={v => setSepetteForm(p => ({...p, active: v}))} />
                          </div>
                       </div>

                       <div className="flex justify-end pt-4">
                          <Button variant="primary" isLoading={loading} onClick={() => handleSave("sepette")}>Pazaryeri Kampanyasını Başlat</Button>
                       </div>
                    </div>
                 )}

                {/* BOGO SEKMESI */}
                {activeTab === "bogo" && (
                   <div className="flex flex-col gap-y-8 animate-in fade-in duration-300">
                      <div className="bg-ui-bg-subtle p-4 border border-ui-border-base rounded-lg mb-2">
                         <Text size="small" weight="plus" className="text-ui-fg-base mb-1">X Al Y Öde (BOGO)</Text>
                         <Text size="xsmall" className="text-ui-fg-subtle">Müşteri 3 ürün aldığında 2 ürün parası öder veya 2 alana 1 bedava gibi kurgular.</Text>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="flex flex-col gap-y-2">
                             <Text size="small" weight="plus" className="text-ui-fg-base">Promosyon Adı / Kodu <span className="text-ui-fg-error">*</span></Text>
                             <Input placeholder="Örn: 3AL2ODE (Otomatik tanımlanabilir)" value={bogoForm.code} onChange={e => setBogoForm(p => ({...p, code: e.target.value}))} />
                         </div>
                         <div className="flex flex-col gap-y-2">
                             <Text size="small" weight="plus" className="text-ui-fg-base">Müşterinin Sepete Eklemesi Gereken</Text>
                             <Input type="number" placeholder="Örn: 3 (Ürün sayısı)" value={bogoForm.buyQty} onChange={e => setBogoForm(p => ({...p, buyQty: parseInt(e.target.value)}))} />
                         </div>
                         <div className="flex flex-col gap-y-2">
                             <Text size="small" weight="plus" className="text-ui-fg-base">Bedava (veya indirimli) verilecek miktar</Text>
                             <Input type="number" placeholder="Örn: 1" value={bogoForm.getQty} onChange={e => setBogoForm(p => ({...p, getQty: parseInt(e.target.value)}))} />
                         </div>
                         <div className="flex items-center justify-between p-4 border border-ui-border-base rounded-lg bg-ui-bg-subtle mt-6">
                             <Text size="small" weight="plus" className="text-ui-fg-base">Aktif Et</Text>
                             <Switch checked={bogoForm.active} onCheckedChange={v => setBogoForm(p => ({...p, active: v}))} />
                         </div>
                      </div>

                      <div className="flex justify-end pt-4">
                         <Button variant="primary" isLoading={loading} onClick={() => handleSave("bogo")}>Kurguyu Kaydet & Başlat</Button>
                      </div>
                   </div>
                )}
                
                 {/* HEDIYE URUNLER SEKMESI */}
                 {activeTab === "hediye" && (
                    <div className="flex flex-col gap-y-8 animate-in fade-in duration-300">
                       <div className="bg-ui-bg-subtle p-4 border border-ui-border-base rounded-lg mb-2">
                          <Text size="small" weight="plus" className="text-ui-fg-base mb-1">Hediye Ürünler Kurgusu</Text>
                          <Text size="xsmall" className="text-ui-fg-subtle">Belirlediğiniz fiyatın (Örn: 1000 TL) üzerindeki ürünlerde, müşteriye aşağıdaki listeden seçeceği bir hediye verilir.</Text>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="flex flex-col gap-y-2">
                              <Text size="small" weight="plus" className="text-ui-fg-base">Minimum Ürün Fiyatı (TL) <span className="text-ui-fg-error">*</span></Text>
                              <Input type="number" placeholder="Örn: 1000" value={hediyeForm.minPrice} onChange={e => setHediyeForm(p => ({...p, minPrice: e.target.value}))} />
                          </div>
                          
                          <div className="flex flex-col gap-y-2">
                              <Text size="small" weight="plus" className="text-ui-fg-base">Geçerli Kategoriler</Text>
                              <select 
                                multiple 
                                value={hediyeForm.categoryIds} 
                                onChange={e => {
                                  const opts = Array.from(e.target.selectedOptions, option => option.value);
                                  setHediyeForm(p => ({...p, categoryIds: opts}))
                                }}
                                className="w-full h-32 rounded-lg border border-ui-border-base bg-ui-bg-field text-ui-fg-base p-2 text-sm focus:outline-none"
                              >
                                <option value="all">Tüm Kategoriler (Geçerli)</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                              <Text size="xsmall" className="text-ui-fg-muted">Birden fazla seçmek için CTRL/CMD tuşuna basılı tutun. Hiçbiri seçilmezse tümünde geçerli olur.</Text>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-1 gap-8">
                           <div className="flex flex-col gap-y-2">
                               <Text size="small" weight="plus" className="text-ui-fg-base">Hediye Olarak Verilecek Ürünleri Seçin <span className="text-ui-fg-error">*</span></Text>
                               <MultiProductAjaxSearch 
                                   selectedProducts={hediyeForm.selectedProducts} 
                                   onAdd={(p) => setHediyeForm(prev => ({...prev, selectedProducts: [...prev.selectedProducts, p]}))}
                                   onRemove={(id) => setHediyeForm(prev => ({...prev, selectedProducts: prev.selectedProducts.filter(sp => sp.id !== id)}))}
                               />
                           </div>
                       </div>

                       <div className="flex items-center justify-between p-4 border border-ui-border-base rounded-lg bg-ui-bg-subtle">
                           <Text size="small" weight="plus" className="text-ui-fg-base">Hemen Aktifleştir</Text>
                           <Switch checked={hediyeForm.active} onCheckedChange={v => setHediyeForm(p => ({...p, active: v}))} />
                       </div>

                       <div className="flex justify-end pt-4">
                          <Button variant="primary" isLoading={loading} onClick={() => handleSave("hediye")}>Kaydet & Başlat</Button>
                       </div>
                    </div>
                 )}

                 {/* SEPETTE FIRSAT ÜRÜNLERİ SEKMESİ */}
                 {activeTab === "cart_upsells" && (
                     <div className="flex flex-col gap-y-8 animate-in fade-in duration-300">
                        <div className="bg-ui-bg-subtle p-4 border border-ui-border-base rounded-lg mb-2 border-l-4 border-l-orange-500">
                           <Text size="small" weight="plus" className="text-orange-700 mb-1">Avantajlı Ürünler (Sepet İçi Çapraz Satış)</Text>
                           <Text size="xsmall" className="text-ui-fg-subtle">Müşteri sepet sayfasına gittiğinde, seçili olan bu ürünler sayfanın üstünde "Avantajlı Ürün" etiketiyle Carousel şeklinde yan yana gösterilir. Sepete ekleme kurgularını destekler.</Text>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                           <div className="flex flex-col gap-y-2">
                               <Text size="small" weight="plus" className="text-ui-fg-base">Önerilecek Ürünleri Arayın ve Ekleyin <span className="text-ui-fg-error">*</span></Text>
                               <MultiProductAjaxSearch 
                                   selectedProducts={cartUpsells} 
                                   onAdd={(p) => setCartUpsells(prev => [...prev, p])}
                                   onRemove={(id) => setCartUpsells(prev => prev.filter(sp => sp.id !== id))}
                               />
                               <Text size="xsmall" className="text-ui-fg-muted mt-1 max-w-lg">Burada seçtiğiniz ürünler sepette yan yana çıkacaktır. Maksimum 5-6 ürün seçmeniz önerilir. İndirimli fiyatlı varyantları olan ürünler şık görünür.</Text>
                           </div>
                        </div>

                        <div className="flex justify-end pt-4">
                           <Button variant="primary" isLoading={loading} onClick={() => handleSave("cart_upsells")}>Fırsat Ürünlerini Yayınla</Button>
                        </div>
                     </div>
                 )}

                {/* OZEL KURGULAR SEKMESI */}
                {activeTab === "ozel" && (
                   <div className="flex flex-col items-center justify-center gap-y-4 py-16 animate-in fade-in duration-300">
                      <SparklesSolid className="w-12 h-12 text-ui-fg-muted" />
                      <Heading level="h2" className="text-ui-fg-base">Markanıza Özel Kurgular Yakında!</Heading>
                      <Text className="text-ui-fg-subtle text-center max-w-md">"Sadece 2. Ürüne %50 İndirim", "A Kategorisinden Alana B Kategorisi Bedava" gibi gelişmiş promosyon alt yapıları yakında eklenecek.</Text>
                   </div>
                )}
                
              </div>
           </Container>
          </div>
       </div>
    )
}

export default CampaignFlowsPage
