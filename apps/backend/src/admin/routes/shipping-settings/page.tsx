import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Buildings } from "@medusajs/icons"
import { toast } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CARGO_ITEMS_META, CARGO_LOGO_SVGS } from "../payment-settings/pos-cargo-logos"

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeliveryRegion {
  id: string
  name: string
  continent: string
  country_code: string
  flag_emoji: string
  active_cities_count: number
  cities: string[]
  active: boolean
}

interface CarrierCompany {
  id: string
  code: string
  name: string
  logo_text: string
  logo_bg: string
  logo_color: string
  active: boolean
  sort_order: number
  tracking_url_template: string
  api_provider: "yurtici" | "aras" | "kargoist" | "ptt" | "mng" | "surat" | "ups" | "dhl" | "custom"
  api_username?: string
  api_password?: string
  api_customer_code?: string
  free_shipping_override?: boolean
  fixed_price_override?: number | null
  short_description?: string
  tax_number?: string
  customer_type?: "all" | "individual" | "corporate"
  company_code?: string
  use_custom_logo?: boolean
  dealer_custom_delivery_time?: boolean
  limit_cart_totals?: boolean
  delivery_hours?: string
}

interface GeneralShippingRule {
  id: string
  name: string
  region_id: string
  carrier_id: string
  calculation_type: "fixed" | "desi" | "price_tier"
  min_order_total: number
  max_order_total: number
  min_desi: number
  max_desi: number
  price: number
  currency: "TL" | "USD" | "EUR"
  active: boolean
}

interface ProductShippingFeeRule {
  id: string
  title: string
  sku_or_category: string
  match_type: "sku" | "category" | "oversize_bodykit"
  extra_fee: number
  currency: "TL" | "USD" | "EUR"
  free_shipping_exempt: boolean
  carrier_id: string
  active: boolean
}

interface ShippingSettingsPayload {
  system_mode: "advanced" | "simple"
  standard_fee_enabled: boolean
  standard_fee_amount: number
  standard_fee_currency: "TL" | "USD" | "EUR"
  standard_fee_cart_type: "all_carts" | "only_without_shipping"
  free_shipping_enabled: boolean
  free_shipping_threshold: number
  free_shipping_currency: "TL" | "USD" | "EUR"
  default_preparation_days: number
  same_day_shipping_cutoff: string
  weekend_shipping_active: boolean
  regions: DeliveryRegion[]
  carriers: CarrierCompany[]
  general_rules: GeneralShippingRule[]
  product_rules: ProductShippingFeeRule[]
}

const DEFAULT_CARGO_ROWS: Array<{
  key: string
  id: string
  name: string
  active: boolean
  code: string
  sort_order: number
}> = [
  { key: "yurtici", id: "9", name: "Yurtiçi Kargo", active: true, code: "1191", sort_order: 0 },
  { key: "aras", id: "10", name: "ARAS KARGO", active: false, code: "1192", sort_order: 0 },
  { key: "kargoist", id: "11", name: "KARGOİST", active: false, code: "1193", sort_order: 0 },
  { key: "ptt", id: "12", name: "PTT Kargo", active: false, code: "1194", sort_order: 0 },
  { key: "mng", id: "13", name: "MNG Kargo", active: false, code: "1195", sort_order: 0 },
  { key: "surat", id: "14", name: "Sürat Kargo", active: false, code: "1196", sort_order: 0 },
]

// ─── Component ────────────────────────────────────────────────────────────────

const ShippingSettingsPage = () => {
  const navigate = useNavigate()

  const [config, setConfig] = useState<ShippingSettingsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Cargo Company Modal (Matches #cargo-company-modal in preview)
  const [cargoModalOpen, setCargoModalOpen] = useState(false)
  const [cargoModalTab, setCargoModalTab] = useState<
    "genel" | "api" | "bolgeler" | "saatler"
  >("genel")
  const [editingCargoKey, setEditingCargoKey] = useState<string>("yurtici")
  const [cargoModalForm, setCargoModalForm] = useState<{
    id: string
    key: string
    name: string
    active: boolean
    short_description: string
    sort_order: number
    tax_number: string
    customer_type: "all" | "individual" | "corporate"
    company_code: string
    use_custom_logo: boolean
    dealer_custom_delivery_time: boolean
    limit_cart_totals: boolean
    api_username: string
    api_password: string
    api_customer_code: string
    tracking_url_template: string
    delivery_hours: string
  }>({
    id: "9",
    key: "yurtici",
    name: "Yurtiçi Kargo",
    active: true,
    short_description: "",
    sort_order: 0,
    tax_number: "",
    customer_type: "all",
    company_code: "1191",
    use_custom_logo: true,
    dealer_custom_delivery_time: false,
    limit_cart_totals: false,
    api_username: "",
    api_password: "",
    api_customer_code: "",
    tracking_url_template: "https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code={code}",
    delivery_hours: "09:00 - 18:00",
  })

  // Region & Cities Modals
  const [regionModalOpen, setRegionModalOpen] = useState(false)
  const [editingRegion, setEditingRegion] = useState<DeliveryRegion | null>(null)
  const [citiesModalRegion, setCitiesModalRegion] = useState<DeliveryRegion | null>(null)
  const [citySearch, setCitySearch] = useState("")

  // General Rule & Product Rule Modals
  const [generalRuleModalOpen, setGeneralRuleModalOpen] = useState(false)
  const [editingGeneralRule, setEditingGeneralRule] = useState<GeneralShippingRule | null>(null)
  const [productRuleModalOpen, setProductRuleModalOpen] = useState(false)
  const [editingProductRule, setEditingProductRule] = useState<ProductShippingFeeRule | null>(null)

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch("/admin/shipping-settings", { credentials: "include" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const loaded: ShippingSettingsPayload = data.config

      // Ensure all 6 preview carriers exist in loaded.carriers
      const existingByCode = new Map(
        (loaded.carriers || []).map((c) => [c.code.toLowerCase(), c])
      )
      const mergedCarriers: CarrierCompany[] = DEFAULT_CARGO_ROWS.map((row) => {
        const found = existingByCode.get(row.key)
        if (found) {
          return {
            ...found,
            code: row.key,
            company_code: found.company_code || row.code,
          }
        }
        return {
          id: `carrier_${row.key}`,
          code: row.key,
          name: row.name,
          logo_text: row.name,
          logo_bg: "#ffffff",
          logo_color: "#1e293b",
          active: row.active,
          sort_order: row.sort_order,
          tracking_url_template: "",
          api_provider: row.key as any,
          company_code: row.code,
          use_custom_logo: true,
        }
      })

      setConfig({
        ...loaded,
        carriers: mergedCarriers,
      })
    } catch (err: any) {
      toast.error("Kargo ayarları yüklenemedi: " + (err?.message || "Bilinmeyen hata"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const saveConfigToServer = async (
    nextConfig: ShippingSettingsPayload,
    successMsg = "Kargo ve teslimat ayarları kaydedildi"
  ) => {
    setSaving(true)
    try {
      const res = await fetch("/admin/shipping-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ config: nextConfig }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
      setConfig(data.config)
      toast.success(successMsg)
    } catch (err: any) {
      toast.error("Kaydetme hatası: " + (err?.message || "Bilinmeyen hata"))
    } finally {
      setSaving(false)
    }
  }

  const openCargoCompanyModal = (cargoKey: string) => {
    const meta = CARGO_ITEMS_META.find((m) => m.key === cargoKey) || {
      id: 9,
      key: cargoKey,
      name: "Yurtiçi Kargo",
      active: true,
      count: 0,
      code: "1191",
    }
    const carrier = config?.carriers.find(
      (c) => c.code.toLowerCase() === cargoKey.toLowerCase()
    )

    setEditingCargoKey(cargoKey)
    setCargoModalTab("genel")
    setCargoModalForm({
      id: String(meta.id),
      key: cargoKey,
      name: carrier?.name || meta.name,
      active: carrier ? carrier.active : meta.active,
      short_description: carrier?.short_description || "",
      sort_order: carrier?.sort_order ?? 0,
      tax_number: carrier?.tax_number || "",
      customer_type: carrier?.customer_type || "all",
      company_code: carrier?.company_code || meta.code,
      use_custom_logo: carrier?.use_custom_logo ?? true,
      dealer_custom_delivery_time: Boolean(carrier?.dealer_custom_delivery_time),
      limit_cart_totals: Boolean(carrier?.limit_cart_totals),
      api_username: carrier?.api_username || "",
      api_password: carrier?.api_password || "",
      api_customer_code: carrier?.api_customer_code || "",
      tracking_url_template: carrier?.tracking_url_template || "",
      delivery_hours: carrier?.delivery_hours || "09:00 - 18:00",
    })
    setCargoModalOpen(true)
  }

  const handleSaveCargoModal = async () => {
    if (!config) return
    const exists = config.carriers.some(
      (c) => c.code.toLowerCase() === editingCargoKey.toLowerCase()
    )
    const updatedCarriers: CarrierCompany[] = exists
      ? config.carriers.map((c) =>
          c.code.toLowerCase() !== editingCargoKey.toLowerCase()
            ? c
            : {
                ...c,
                name: cargoModalForm.name,
                active: cargoModalForm.active,
                short_description: cargoModalForm.short_description,
                sort_order: Number(cargoModalForm.sort_order) || 0,
                tax_number: cargoModalForm.tax_number,
                customer_type: cargoModalForm.customer_type,
                company_code: cargoModalForm.company_code,
                use_custom_logo: cargoModalForm.use_custom_logo,
                dealer_custom_delivery_time: cargoModalForm.dealer_custom_delivery_time,
                limit_cart_totals: cargoModalForm.limit_cart_totals,
                api_username: cargoModalForm.api_username,
                api_password: cargoModalForm.api_password,
                api_customer_code: cargoModalForm.api_customer_code,
                tracking_url_template: cargoModalForm.tracking_url_template,
                delivery_hours: cargoModalForm.delivery_hours,
              }
        )
      : [
          ...config.carriers,
          {
            id: `carrier_${Date.now()}`,
            code: editingCargoKey,
            name: cargoModalForm.name,
            logo_text: cargoModalForm.name,
            logo_bg: "#ffffff",
            logo_color: "#1e293b",
            active: cargoModalForm.active,
            sort_order: Number(cargoModalForm.sort_order) || 0,
            tracking_url_template: cargoModalForm.tracking_url_template,
            api_provider: "custom",
            short_description: cargoModalForm.short_description,
            tax_number: cargoModalForm.tax_number,
            customer_type: cargoModalForm.customer_type,
            company_code: cargoModalForm.company_code,
            use_custom_logo: cargoModalForm.use_custom_logo,
            dealer_custom_delivery_time: cargoModalForm.dealer_custom_delivery_time,
            limit_cart_totals: cargoModalForm.limit_cart_totals,
            api_username: cargoModalForm.api_username,
            api_password: cargoModalForm.api_password,
            api_customer_code: cargoModalForm.api_customer_code,
            delivery_hours: cargoModalForm.delivery_hours,
          },
        ]

    const nextConfig = {
      ...config,
      carriers: updatedCarriers,
    }
    setConfig(nextConfig)
    setCargoModalOpen(false)
    await saveConfigToServer(
      nextConfig,
      `${cargoModalForm.name} ayarları kaydedildi`
    )
  }

  const handleToggleCarrierQuick = async (cargoKey: string) => {
    if (!config) return
    const nextCarriers = config.carriers.map((c) =>
      c.code.toLowerCase() === cargoKey.toLowerCase()
        ? { ...c, active: !c.active }
        : c
    )
    const target = nextCarriers.find(
      (c) => c.code.toLowerCase() === cargoKey.toLowerCase()
    )
    const nextConfig = { ...config, carriers: nextCarriers }
    setConfig(nextConfig)
    await saveConfigToServer(
      nextConfig,
      `${target?.name || "Kargo firması"} durumu ${target?.active ? "Aktif" : "Pasif"} olarak güncellendi`
    )
  }

  const openAddRegionModal = () => {
    setEditingRegion({
      id: `reg_${Date.now()}`,
      name: "",
      continent: "Avrupa",
      country_code: "EU",
      flag_emoji: "🇪🇺",
      active_cities_count: 1,
      cities: ["Merkez"],
      active: true,
    })
    setRegionModalOpen(true)
  }

  const saveRegionModal = async () => {
    if (!config || !editingRegion) return
    if (!editingRegion.name.trim()) {
      toast.error("Bölge adı zorunludur")
      return
    }
    const exists = config.regions.some((r) => r.id === editingRegion.id)
    const nextConfig = {
      ...config,
      regions: exists
        ? config.regions.map((r) => (r.id === editingRegion.id ? editingRegion : r))
        : [...config.regions, editingRegion],
    }
    setConfig(nextConfig)
    setRegionModalOpen(false)
    setEditingRegion(null)
    await saveConfigToServer(nextConfig, "Teslimat bölgesi kaydedildi")
  }

  const openAddGeneralRule = () => {
    if (!config) return
    setEditingGeneralRule({
      id: `grule_${Date.now()}`,
      name: "Standart Kargo Ücreti",
      region_id: config.regions[0]?.id || "reg_tr",
      carrier_id: config.carriers[0]?.id || "carrier_yurtici",
      calculation_type: "fixed",
      min_order_total: 0,
      max_order_total: 1000,
      min_desi: 0,
      max_desi: 30,
      price: 100,
      currency: "TL",
      active: true,
    })
    setGeneralRuleModalOpen(true)
  }

  const saveGeneralRuleModal = async () => {
    if (!config || !editingGeneralRule) return
    const exists = config.general_rules.some((r) => r.id === editingGeneralRule.id)
    const nextConfig = {
      ...config,
      general_rules: exists
        ? config.general_rules.map((r) =>
            r.id === editingGeneralRule.id ? editingGeneralRule : r
          )
        : [...config.general_rules, editingGeneralRule],
    }
    setConfig(nextConfig)
    setGeneralRuleModalOpen(false)
    setEditingGeneralRule(null)
    await saveConfigToServer(nextConfig, "Genel kargo ücreti kaydedildi")
  }

  const openAddProductRule = () => {
    if (!config) return
    setEditingProductRule({
      id: `prule_${Date.now()}`,
      title: "Ağır / Hacimli Bodykit Ek Kargo Ücreti",
      sku_or_category: "Tampon / Bodykit Setleri",
      match_type: "oversize_bodykit",
      extra_fee: 250,
      currency: "TL",
      free_shipping_exempt: true,
      carrier_id: config.carriers[0]?.id || "carrier_yurtici",
      active: true,
    })
    setProductRuleModalOpen(true)
  }

  const saveProductRuleModal = async () => {
    if (!config || !editingProductRule) return
    const exists = config.product_rules.some((r) => r.id === editingProductRule.id)
    const nextConfig = {
      ...config,
      product_rules: exists
        ? config.product_rules.map((r) =>
            r.id === editingProductRule.id ? editingProductRule : r
          )
        : [...config.product_rules, editingProductRule],
    }
    setConfig(nextConfig)
    setProductRuleModalOpen(false)
    setEditingProductRule(null)
    await saveConfigToServer(nextConfig, "Ürünlere özel kargo ücreti kaydedildi")
  }

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center p-12 text-[13px] text-[#64748b]">
        Kargo ve teslimat ayarları yükleniyor...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] font-sans text-[#1e293b] pb-16">
      {/* Araçlar Sub-navigation Bar (Matches localhost:3095/?view=payments) */}
      <div className="bg-white border-b border-gray-200 px-6 h-[46px] flex items-center justify-between shadow-2xs sticky top-0 z-20">
        <div className="text-[14px] font-bold text-[#1e293b]">Araçlar</div>
        <div className="flex items-center gap-7 h-full overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => navigate("/payment-settings")}
            className="h-full flex items-center border-b-2 border-transparent text-[#475569] hover:text-[#1e293b] text-[12px] font-semibold transition-colors whitespace-nowrap"
          >
            Ödeme Yöntemleri
          </button>
          <button
            type="button"
            onClick={() => navigate("/shipping-settings")}
            className="h-full flex items-center border-b-2 border-[#1565c0] text-[#1565c0] text-[12px] font-semibold transition-colors whitespace-nowrap"
          >
            Kargo ve Teslimat
          </button>
          <button
            type="button"
            onClick={() => navigate("/sms-settings")}
            className="h-full flex items-center border-b-2 border-transparent text-[#475569] hover:text-[#1e293b] text-[12px] font-semibold transition-colors whitespace-nowrap"
          >
            E-Posta, SMS ve WhatsApp
          </button>
          <button
            type="button"
            onClick={() => navigate("/e-fatura")}
            className="h-full flex items-center border-b-2 border-transparent text-[#475569] hover:text-[#1e293b] text-[12px] font-semibold transition-colors whitespace-nowrap"
          >
            Muhasebe / ERP
          </button>
          <button
            type="button"
            onClick={() => navigate("/payment-settings?tab=eklentiler")}
            className="h-full flex items-center border-b-2 border-transparent text-[#475569] hover:text-[#1e293b] text-[12px] font-semibold transition-colors whitespace-nowrap"
          >
            Eklentiler
          </button>
        </div>
        <div className="w-[60px] hidden sm:block"></div>
      </div>

      {/* Main Content Container (max-w-[1040px] mx-auto px-4 py-7) */}
      <div className="max-w-[1040px] mx-auto px-4 py-7">
        {/* Top 2-Column Grid: Teslimat Bölgeleri & Kargo Firmaları */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Left Card: Teslimat Bölgeleri */}
          <div className="bg-white rounded-[6px] border border-gray-200/90 shadow-xs p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-[#1e293b]">
                Teslimat Bölgeleri
              </h3>
              <button
                type="button"
                onClick={openAddRegionModal}
                className="h-[28px] px-3 rounded-[4px] bg-[#10b981] hover:bg-[#059669] text-white text-[11.5px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
              >
                <span>+</span> Ekle
              </button>
            </div>
            <p className="text-[11.5px] text-[#64748b] leading-relaxed mb-5">
              Teslimat yapacağınız ülkeleri, şehirleri veya bölgeleri bu bölümden
              yönetebilirsiniz. Yeni bir bölge eklemek için &quot;Ekle&quot; butonuna
              tıklayınız.
            </p>

            <div className="divide-y divide-gray-100 border-t border-gray-100">
              {config.regions.map((region) => (
                <div
                  key={region.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <div className="flex items-center gap-3">
                    {/* Turkish Flag SVG for TR, or badge for others */}
                    {region.country_code === "TR" ? (
                      <div
                        style={{
                          width: "34px",
                          height: "23px",
                          borderRadius: "3px",
                          overflow: "hidden",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
                          flexShrink: 0,
                        }}
                      >
                        <svg
                          viewBox="0 0 36 24"
                          width="34"
                          height="23"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="36" height="24" fill="#E30A17" />
                          <circle cx="13.5" cy="12" r="6" fill="#ffffff" />
                          <circle cx="15" cy="12" r="4.8" fill="#E30A17" />
                          <polygon
                            points="21.5,12 17.9,13.2 19.3,9.8 19.3,14.2 17.9,10.8"
                            fill="#ffffff"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-[34px] h-[23px] rounded-[3px] bg-gray-100 border border-gray-200 flex items-center justify-center text-[13px]">
                        {region.flag_emoji || "🌍"}
                      </div>
                    )}
                    <div>
                      <div className="text-[12.5px] font-bold text-[#1e293b]">
                        {region.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#64748b]">
                        <span>{region.continent}</span>
                        <span className="px-1.5 py-0.2 bg-gray-100 rounded text-[10px] font-bold text-[#475569]">
                          {region.country_code === "TR"
                            ? 1
                            : region.active_cities_count}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setCitiesModalRegion(region)
                        setCitySearch("")
                      }}
                      className="h-[26px] px-2.5 rounded-[4px] border border-gray-200 bg-white hover:bg-gray-50 text-[#475569] text-[11px] font-medium transition-colors"
                    >
                      İller
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRegion({ ...region })
                        setRegionModalOpen(true)
                      }}
                      className="w-[26px] h-[26px] rounded-[4px] border border-gray-200 bg-white hover:bg-gray-50 text-[#475569] flex items-center justify-center text-[11px] transition-colors"
                    >
                      ✎
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card: Kargo Firmaları */}
          <div className="bg-white rounded-[6px] border border-gray-200/90 shadow-xs p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-[#1e293b]">
                Kargo Firmaları
              </h3>
              <button
                type="button"
                onClick={() => openCargoCompanyModal("custom")}
                className="h-[28px] px-3 rounded-[4px] bg-[#10b981] hover:bg-[#059669] text-white text-[11.5px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
              >
                <span>+</span> Ekle
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {config.carriers.map((carrier) => {
                const cargoKey = carrier.code.toLowerCase()
                const logoHtml =
                  CARGO_LOGO_SVGS[cargoKey] || CARGO_LOGO_SVGS.yurtici

                return (
                  <div
                    key={carrier.id}
                    className="py-2.5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="shrink-0"
                        dangerouslySetInnerHTML={{ __html: logoHtml }}
                      />
                      <div>
                        <div className="text-[12.5px] font-bold text-[#1e293b]">
                          {carrier.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <button
                            type="button"
                            onClick={() => handleToggleCarrierQuick(cargoKey)}
                            title="Durumu Değiştir"
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-opacity hover:opacity-85 ${
                              carrier.active
                                ? "bg-[#d1fae5] text-[#059669]"
                                : "bg-gray-100 text-[#64748b]"
                            }`}
                          >
                            {carrier.active ? "✓ Aktif" : "Pasif"}
                          </button>
                          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[#64748b] text-[10px] font-bold">
                            {carrier.sort_order ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openCargoCompanyModal(cargoKey)}
                      className="w-[26px] h-[26px] rounded-[4px] border border-gray-200 bg-white hover:bg-gray-50 text-[#475569] flex items-center justify-center text-[11px] transition-colors"
                      title="Kargo Firmasını Düzenle"
                    >
                      ✎
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Card: Kargo Sistemi */}
        <div className="bg-white rounded-[6px] border border-gray-200/90 shadow-xs p-6">
          <h3 className="text-[15px] font-bold text-[#1e293b] mb-3">
            Kargo Sistemi
          </h3>
          <div className="flex items-center gap-5 mb-4">
            <label className="flex items-center gap-2 cursor-pointer text-[12px] font-semibold text-[#1e293b]">
              <input
                type="radio"
                name="kargo_sistem"
                checked={config.system_mode === "advanced"}
                onChange={() => {
                  const next = { ...config, system_mode: "advanced" as const }
                  setConfig(next)
                  saveConfigToServer(next, "Kargo sistemi Gelişmiş olarak güncellendi")
                }}
                className="w-4 h-4 text-[#0284c7] accent-[#0284c7]"
              />
              <span>Gelişmiş</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[12px] font-medium text-[#475569]">
              <input
                type="radio"
                name="kargo_sistem"
                checked={config.system_mode === "simple"}
                onChange={() => {
                  const next = { ...config, system_mode: "simple" as const }
                  setConfig(next)
                  saveConfigToServer(next, "Kargo sistemi Basit olarak güncellendi")
                }}
                className="w-4 h-4 text-[#0284c7] accent-[#0284c7]"
              />
              <span>Basit</span>
            </label>
          </div>

          <div className="space-y-4">
            {/* Checkbox 1: Standart Kargo Ücreti */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer text-[12px] font-medium text-[#334155] mb-3">
                <input
                  type="checkbox"
                  checked={config.standard_fee_enabled}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      standard_fee_enabled: e.target.checked,
                    }
                    setConfig(next)
                    saveConfigToServer(next)
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-[#0284c7] accent-[#0284c7]"
                />
                <span>Tüm bölgeler için standart kargo ücreti belirle</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[680px]">
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Kargo Ücreti
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={config.standard_fee_amount}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          standard_fee_amount: Number(e.target.value) || 0,
                        })
                      }
                      onBlur={() => saveConfigToServer(config)}
                      className="flex-1 h-[32px] px-3 rounded-l-[4px] border border-gray-300 text-[12px] text-[#1e293b] focus:outline-none focus:border-[#0284c7]"
                    />
                    <select
                      value={config.standard_fee_currency}
                      onChange={(e) => {
                        const next = {
                          ...config,
                          standard_fee_currency: e.target.value as "TL" | "USD" | "EUR",
                        }
                        setConfig(next)
                        saveConfigToServer(next)
                      }}
                      className="h-[32px] px-2.5 rounded-r-[4px] border border-l-0 border-gray-300 bg-gray-50 text-[11.5px] font-semibold text-[#475569] focus:outline-none"
                    >
                      <option value="TL">TL</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Sepet Tipi
                  </label>
                  <select
                    value={config.standard_fee_cart_type}
                    onChange={(e) => {
                      const next = {
                        ...config,
                        standard_fee_cart_type: e.target.value as
                          | "all_carts"
                          | "only_without_shipping",
                      }
                      setConfig(next)
                      saveConfigToServer(next)
                    }}
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 bg-white text-[12px] text-[#1e293b] focus:outline-none focus:border-[#0284c7]"
                  >
                    <option value="all_carts">Tüm sepetlere ekle</option>
                    <option value="only_without_shipping">
                      Sadece kargo ücreti olmayanlara ekle
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Checkbox 2: Ücretsiz Kargo Limiti */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-[12px] font-medium text-[#334155] mb-3">
                <input
                  type="checkbox"
                  checked={config.free_shipping_enabled}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      free_shipping_enabled: e.target.checked,
                    }
                    setConfig(next)
                    saveConfigToServer(next)
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-[#0284c7] accent-[#0284c7]"
                />
                <span>Tüm bölgeler için ücretsiz kargo limiti belirle</span>
              </label>
              <div className="max-w-[330px]">
                <label className="block text-[11px] font-bold text-[#334155] mb-1">
                  Sipariş tutarı ve üzeri
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={config.free_shipping_threshold}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        free_shipping_threshold: Number(e.target.value) || 0,
                      })
                    }
                    onBlur={() => saveConfigToServer(config)}
                    className="flex-1 h-[32px] px-3 rounded-l-[4px] border border-gray-300 text-[12px] text-[#1e293b] focus:outline-none focus:border-[#0284c7]"
                  />
                  <select
                    value={config.free_shipping_currency}
                    onChange={(e) => {
                      const next = {
                        ...config,
                        free_shipping_currency: e.target.value as "TL" | "USD" | "EUR",
                      }
                      setConfig(next)
                      saveConfigToServer(next)
                    }}
                    className="h-[32px] px-2.5 rounded-r-[4px] border border-l-0 border-gray-300 bg-gray-50 text-[11.5px] font-semibold text-[#475569] focus:outline-none"
                  >
                    <option value="TL">TL</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Genel Kargo Ücretleri */}
            <div className="pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-[13.5px] font-bold text-[#1e293b]">
                  Genel Kargo Ücretleri
                </h4>
                <button
                  type="button"
                  onClick={openAddGeneralRule}
                  className="h-[26px] px-2.5 rounded-[4px] bg-[#10b981] hover:bg-[#059669] text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <span>+</span> Ekle
                </button>
              </div>
              <p className="text-[11.5px] text-[#64748b] mb-3">
                Sipariş tutarlarına veya desilere göre kargo ücreti
                belirleyebilirsiniz. Yeni bir kargo ücreti eklemek için &quot;Ekle&quot;
                butonuna tıklayınız.
              </p>

              {config.general_rules.length === 0 ? (
                <div className="bg-[#f8fafc] border border-gray-200/80 rounded-[4px] py-3 px-4 text-center text-[11.5px] text-[#64748b]">
                  Genel kargo ücreti bulunmamaktadır.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-[#f8fafc] border border-gray-200/80 rounded-[4px] divide-y divide-gray-200/60">
                    {config.general_rules.map((rule) => (
                      <div
                        key={rule.id}
                        className="py-2.5 px-4 flex items-center justify-between text-[12px]"
                      >
                        <div>
                          <span className="font-bold text-[#1e293b]">
                            {rule.name}
                          </span>
                          <span className="text-[#64748b] ml-2 text-[11px]">
                            ({rule.min_order_total} - {rule.max_order_total} TL •{" "}
                            {rule.price} {rule.currency})
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingGeneralRule({ ...rule })
                              setGeneralRuleModalOpen(true)
                            }}
                            className="w-[24px] h-[24px] rounded-[4px] border border-gray-200 bg-white hover:bg-gray-50 text-[#475569] flex items-center justify-center text-[11px]"
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = {
                                ...config,
                                general_rules: config.general_rules.filter(
                                  (r) => r.id !== rule.id
                                ),
                              }
                              setConfig(next)
                              saveConfigToServer(next, "Kargo ücreti silindi")
                            }}
                            className="w-[24px] h-[24px] rounded-[4px] border border-gray-200 bg-white hover:bg-red-50 text-[#ef4444] flex items-center justify-center text-[11px]"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ürünlere Özel Ücretler */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-[13.5px] font-bold text-[#1e293b]">
                  Ürünlere Özel Ücretler
                </h4>
                <button
                  type="button"
                  onClick={openAddProductRule}
                  className="h-[26px] px-2.5 rounded-[4px] bg-[#10b981] hover:bg-[#059669] text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <span>+</span> Ekle
                </button>
              </div>
              <p className="text-[11.5px] text-[#64748b] mb-3">
                Ürünlere özel kargo ücreti veya ücretsiz kargo tanımlaması
                yapabilirsiniz. Yeni bir kargo ücreti eklemek için &quot;Ekle&quot;
                butonuna tıklayınız.
              </p>

              {config.product_rules.length === 0 ? (
                <div className="bg-[#f8fafc] border border-gray-200/80 rounded-[4px] py-3 px-4 text-center text-[11.5px] text-[#64748b]">
                  Ürünlere özel kargo ücreti bulunmamaktadır.
                </div>
              ) : (
                <div className="bg-[#f8fafc] border border-gray-200/80 rounded-[4px] divide-y divide-gray-200/60">
                  {config.product_rules.map((prule) => (
                    <div
                      key={prule.id}
                      className="py-2.5 px-4 flex items-center justify-between text-[12px]"
                    >
                      <div>
                        <span className="font-bold text-[#1e293b]">
                          {prule.title}
                        </span>
                        <span className="text-[#64748b] ml-2 text-[11px]">
                          ({prule.sku_or_category} • +{prule.extra_fee}{" "}
                          {prule.currency})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProductRule({ ...prule })
                            setProductRuleModalOpen(true)
                          }}
                          className="w-[24px] h-[24px] rounded-[4px] border border-gray-200 bg-white hover:bg-gray-50 text-[#475569] flex items-center justify-center text-[11px]"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = {
                              ...config,
                              product_rules: config.product_rules.filter(
                                (r) => r.id !== prule.id
                              ),
                            }
                            setConfig(next)
                            saveConfigToServer(next, "Özel kargo kuralı silindi")
                          }}
                          className="w-[24px] h-[24px] rounded-[4px] border border-gray-200 bg-white hover:bg-red-50 text-[#ef4444] flex items-center justify-center text-[11px]"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Cargo Company Edit Modal (9 Nolu Kargo Firması) ───────────────────── */}
      {cargoModalOpen && (
        <div
          className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setCargoModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-[650px] rounded-[6px] shadow-2xl overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Blue Modal Header */}
            <div className="bg-[#0b5ed7] px-6 pt-4 pb-0 text-white">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[11px] text-white/80 font-medium">
                    Kargo Firmaları
                  </div>
                  <div className="text-[18px] font-bold tracking-tight">
                    {cargoModalForm.id} Nolu Kargo Firması
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCargoModalOpen(false)}
                  className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center text-white/90 text-[18px] font-bold transition-colors"
                >
                  ×
                </button>
              </div>
              {/* Tabs */}
              <div className="flex items-center gap-6 text-[11.5px] font-semibold">
                <button
                  type="button"
                  onClick={() => setCargoModalTab("genel")}
                  className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                    cargoModalTab === "genel"
                      ? "border-white text-white"
                      : "border-transparent text-white/75 hover:text-white"
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white text-[#0b5ed7] text-[9px] font-black flex items-center justify-center">
                    i
                  </span>
                  Genel Bilgiler
                </button>
                <button
                  type="button"
                  onClick={() => setCargoModalTab("api")}
                  className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                    cargoModalTab === "api"
                      ? "border-white text-white"
                      : "border-transparent text-white/75 hover:text-white"
                  }`}
                >
                  <span>&lt;/&gt;</span> API Ayarları
                </button>
                <button
                  type="button"
                  onClick={() => setCargoModalTab("bolgeler")}
                  className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                    cargoModalTab === "bolgeler"
                      ? "border-white text-white"
                      : "border-transparent text-white/75 hover:text-white"
                  }`}
                >
                  <span>🌍</span> Bölgeler
                </button>
                <button
                  type="button"
                  onClick={() => setCargoModalTab("saatler")}
                  className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                    cargoModalTab === "saatler"
                      ? "border-white text-white"
                      : "border-transparent text-white/75 hover:text-white"
                  }`}
                >
                  <span>🕒</span> Teslimat Saatleri
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {cargoModalTab === "genel" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-8">
                      <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                        Adı <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cargoModalForm.name}
                        onChange={(e) =>
                          setCargoModalForm({
                            ...cargoModalForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px] text-[#1e293b] focus:outline-none focus:border-[#0b5ed7]"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                        Durum
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setCargoModalForm({
                            ...cargoModalForm,
                            active: !cargoModalForm.active,
                          })
                        }
                        className={`w-[42px] h-[22px] rounded-full relative transition-colors p-0.5 flex items-center ${
                          cargoModalForm.active ? "bg-[#10b981]" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`w-[18px] h-[18px] rounded-full bg-white shadow transition-transform transform ${
                            cargoModalForm.active
                              ? "translate-x-[20px]"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-8">
                      <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                        Kısa Açıklaması
                      </label>
                      <input
                        type="text"
                        value={cargoModalForm.short_description}
                        onChange={(e) =>
                          setCargoModalForm({
                            ...cargoModalForm,
                            short_description: e.target.value,
                          })
                        }
                        className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px] text-[#1e293b] focus:outline-none focus:border-[#0b5ed7]"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                        Sıra
                      </label>
                      <input
                        type="number"
                        value={cargoModalForm.sort_order}
                        onChange={(e) =>
                          setCargoModalForm({
                            ...cargoModalForm,
                            sort_order: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px] text-[#1e293b] focus:outline-none focus:border-[#0b5ed7]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-8">
                      <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                        Taşıyıcı VKN
                      </label>
                      <input
                        type="text"
                        value={cargoModalForm.tax_number}
                        onChange={(e) =>
                          setCargoModalForm({
                            ...cargoModalForm,
                            tax_number: e.target.value,
                          })
                        }
                        className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px] text-[#1e293b] focus:outline-none focus:border-[#0b5ed7]"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                        Müşteri Tipi
                      </label>
                      <select
                        value={cargoModalForm.customer_type}
                        onChange={(e) =>
                          setCargoModalForm({
                            ...cargoModalForm,
                            customer_type: e.target.value as
                              | "all"
                              | "individual"
                              | "corporate",
                          })
                        }
                        className="w-full h-[32px] px-2.5 rounded-[4px] border border-gray-300 bg-white text-[12px] text-[#1e293b] focus:outline-none focus:border-[#0b5ed7]"
                      >
                        <option value="all">Hepsi</option>
                        <option value="individual">Bireysel</option>
                        <option value="corporate">Kurumsal</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-8">
                      <label className="flex items-center gap-1 text-[11.5px] font-bold text-[#334155] mb-1">
                        <span>Firma Kodu</span>
                        <span className="w-3.5 h-3.5 rounded-full bg-[#334155] text-white text-[9px] flex items-center justify-center">
                          ?
                        </span>
                      </label>
                      <input
                        type="text"
                        value={cargoModalForm.company_code}
                        onChange={(e) =>
                          setCargoModalForm({
                            ...cargoModalForm,
                            company_code: e.target.value,
                          })
                        }
                        className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 bg-gray-50 text-[12px] text-[#475569] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Logo Belirle */}
                  <div className="pt-1 space-y-2.5">
                    <label className="flex items-center gap-2 cursor-pointer text-[12px] text-[#334155]">
                      <input
                        type="checkbox"
                        checked={cargoModalForm.use_custom_logo}
                        onChange={(e) =>
                          setCargoModalForm({
                            ...cargoModalForm,
                            use_custom_logo: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-[#0284c7] accent-[#0284c7]"
                      />
                      <span>Kargo firması için logo belirle</span>
                    </label>
                    <div className="w-[96px]">
                      <div
                        className="w-[96px] h-[72px] rounded-[4px] border border-gray-200 bg-white flex items-center justify-center p-2 shadow-2xs"
                        dangerouslySetInnerHTML={{
                          __html:
                            CARGO_LOGO_SVGS[editingCargoKey] ||
                            CARGO_LOGO_SVGS.yurtici,
                        }}
                      />
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            toast.info("Varsayılan kargo logosu kullanılıyor")
                          }
                          className="w-[24px] h-[24px] rounded-[3px] border border-gray-200 bg-white hover:bg-gray-50 text-[#475569] text-[11px] flex items-center justify-center"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCargoModalForm({
                              ...cargoModalForm,
                              use_custom_logo: false,
                            })
                          }
                          className="w-[24px] h-[24px] rounded-[3px] border border-gray-200 bg-white hover:bg-red-50 text-[#ef4444] text-[11px] flex items-center justify-center"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-[12px] text-[#334155]">
                      <input
                        type="checkbox"
                        checked={cargoModalForm.dealer_custom_delivery_time}
                        onChange={(e) =>
                          setCargoModalForm({
                            ...cargoModalForm,
                            dealer_custom_delivery_time: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-[#0284c7] accent-[#0284c7]"
                      />
                      <span>Bayilere özel teslimat süresi belirle</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[12px] text-[#334155]">
                      <input
                        type="checkbox"
                        checked={cargoModalForm.limit_cart_totals}
                        onChange={(e) =>
                          setCargoModalForm({
                            ...cargoModalForm,
                            limit_cart_totals: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-[#0284c7] accent-[#0284c7]"
                      />
                      <span>Taşınabilecek sepet tutarlarını sınırla</span>
                    </label>
                  </div>
                </>
              )}

              {cargoModalTab === "api" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                      Web Servis Kullanıcı Adı
                    </label>
                    <input
                      type="text"
                      value={cargoModalForm.api_username}
                      onChange={(e) =>
                        setCargoModalForm({
                          ...cargoModalForm,
                          api_username: e.target.value,
                        })
                      }
                      placeholder="API Kullanıcı Adı"
                      className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                      Web Servis Şifresi
                    </label>
                    <input
                      type="password"
                      value={cargoModalForm.api_password}
                      onChange={(e) =>
                        setCargoModalForm({
                          ...cargoModalForm,
                          api_password: e.target.value,
                        })
                      }
                      placeholder="••••••••••••"
                      className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                      Müşteri / Sözleşme Kodu
                    </label>
                    <input
                      type="text"
                      value={cargoModalForm.api_customer_code}
                      onChange={(e) =>
                        setCargoModalForm({
                          ...cargoModalForm,
                          api_customer_code: e.target.value,
                        })
                      }
                      placeholder="Örn: 204981920"
                      className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                      Kargo Takip URL Şablonu
                    </label>
                    <input
                      type="text"
                      value={cargoModalForm.tracking_url_template}
                      onChange={(e) =>
                        setCargoModalForm({
                          ...cargoModalForm,
                          tracking_url_template: e.target.value,
                        })
                      }
                      placeholder="https://.../?code={code}"
                      className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                    />
                  </div>
                </div>
              )}

              {cargoModalTab === "bolgeler" && (
                <div className="space-y-3">
                  <p className="text-[12px] text-[#64748b]">
                    Bu kargo firmasının gönderim yapabileceği aktif teslimat
                    bölgeleri:
                  </p>
                  <div className="border border-gray-200 rounded-[4px] divide-y divide-gray-100">
                    {config.regions.map((r) => (
                      <label
                        key={r.id}
                        className="flex items-center justify-between px-4 py-2.5 text-[12px] cursor-pointer hover:bg-gray-50"
                      >
                        <span className="font-semibold text-[#1e293b]">
                          {r.name} ({r.continent})
                        </span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 rounded border-gray-300 text-[#10b981] accent-[#10b981]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {cargoModalTab === "saatler" && (
                <div className="space-y-3">
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Teslimat / Kargo Çıkış Saat Aralığı
                  </label>
                  <input
                    type="text"
                    value={cargoModalForm.delivery_hours}
                    onChange={(e) =>
                      setCargoModalForm({
                        ...cargoModalForm,
                        delivery_hours: e.target.value,
                      })
                    }
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                  />
                  <p className="text-[11px] text-[#64748b]">
                    Belirtilen saat aralığında verilen siparişler aynı gün kargo
                    planlamasına dahil edilir.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setCargoModalForm({
                    ...cargoModalForm,
                    active: !cargoModalForm.active,
                  })
                }
                className="h-[32px] px-3 rounded-[4px] border border-gray-300 bg-white hover:bg-gray-50 text-[#334155] text-[12px] font-semibold flex items-center gap-1.5"
              >
                <span>İşlemler</span>
                <span className="text-[10px]">^</span>
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveCargoModal}
                className="h-[32px] px-4 rounded-[4px] bg-[#10b981] hover:bg-[#059669] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>✓</span> {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Teslimat Bölgesi Ekle/Düzenle Modal ───────────────────────────────── */}
      {regionModalOpen && editingRegion && (
        <div
          className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setRegionModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-[460px] rounded-[6px] shadow-2xl overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0b5ed7] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <div className="text-[11px] text-white/80 font-medium">
                  Teslimat Bölgeleri
                </div>
                <div className="text-[17px] font-bold tracking-tight">
                  Bölge Tanımı
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRegionModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center text-white/90 text-[18px] font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                  Bölge / Ülke Adı *
                </label>
                <input
                  type="text"
                  value={editingRegion.name}
                  onChange={(e) =>
                    setEditingRegion({ ...editingRegion, name: e.target.value })
                  }
                  placeholder="Örn: Türkiye, KKTC, Almanya"
                  className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Kıta / Grup
                  </label>
                  <input
                    type="text"
                    value={editingRegion.continent}
                    onChange={(e) =>
                      setEditingRegion({
                        ...editingRegion,
                        continent: e.target.value,
                      })
                    }
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Ülke Kodu
                  </label>
                  <input
                    type="text"
                    value={editingRegion.country_code}
                    onChange={(e) =>
                      setEditingRegion({
                        ...editingRegion,
                        country_code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRegionModalOpen(false)}
                className="h-[32px] px-4 rounded-[4px] border border-gray-300 bg-white hover:bg-gray-50 text-[#475569] text-[12px] font-semibold"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={saveRegionModal}
                className="h-[32px] px-4 rounded-[4px] bg-[#10b981] hover:bg-[#059669] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span>✓</span> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── İller Modal ───────────────────────────────────────────────────────── */}
      {citiesModalRegion && (
        <div
          className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setCitiesModalRegion(null)}
        >
          <div
            className="bg-white w-full max-w-[640px] rounded-[6px] shadow-2xl overflow-hidden border border-gray-200 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0b5ed7] px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div>
                <div className="text-[11px] text-white/80 font-medium">
                  Teslimat Bölgeleri
                </div>
                <div className="text-[17px] font-bold tracking-tight">
                  {citiesModalRegion.name} — İller ({citiesModalRegion.cities.length})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCitiesModalRegion(null)}
                className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center text-white/90 text-[18px] font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <input
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                placeholder="İl ara..."
                className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 bg-white text-[12px]"
              />
            </div>
            <div className="p-5 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-2">
              {citiesModalRegion.cities
                .filter((c) =>
                  c.toLocaleLowerCase("tr-TR").includes(citySearch.toLocaleLowerCase("tr-TR"))
                )
                .map((city) => (
                  <div
                    key={city}
                    className="px-3 py-1.5 rounded-[4px] border border-gray-200 bg-[#f8fafc] text-[11.5px] font-medium text-[#334155] flex items-center justify-between"
                  >
                    <span>{city}</span>
                    <span className="text-[#10b981] font-bold">✓</span>
                  </div>
                ))}
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setCitiesModalRegion(null)}
                className="h-[32px] px-4 rounded-[4px] bg-[#0b5ed7] text-white text-[12px] font-bold"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Genel Kargo Ücreti Modal ──────────────────────────────────────────── */}
      {generalRuleModalOpen && editingGeneralRule && (
        <div
          className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setGeneralRuleModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-[520px] rounded-[6px] shadow-2xl overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0b5ed7] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <div className="text-[11px] text-white/80 font-medium">
                  Kargo Sistemi
                </div>
                <div className="text-[17px] font-bold tracking-tight">
                  Genel Kargo Ücreti
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGeneralRuleModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center text-white/90 text-[18px] font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                  Kural Adı
                </label>
                <input
                  type="text"
                  value={editingGeneralRule.name}
                  onChange={(e) =>
                    setEditingGeneralRule({
                      ...editingGeneralRule,
                      name: e.target.value,
                    })
                  }
                  className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Min. Sepet Tutarı (TL)
                  </label>
                  <input
                    type="number"
                    value={editingGeneralRule.min_order_total}
                    onChange={(e) =>
                      setEditingGeneralRule({
                        ...editingGeneralRule,
                        min_order_total: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Maks. Sepet Tutarı (TL)
                  </label>
                  <input
                    type="number"
                    value={editingGeneralRule.max_order_total}
                    onChange={(e) =>
                      setEditingGeneralRule({
                        ...editingGeneralRule,
                        max_order_total: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                  Kargo Ücreti (TL)
                </label>
                <input
                  type="number"
                  value={editingGeneralRule.price}
                  onChange={(e) =>
                    setEditingGeneralRule({
                      ...editingGeneralRule,
                      price: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                />
              </div>
            </div>
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setGeneralRuleModalOpen(false)}
                className="h-[32px] px-4 rounded-[4px] border border-gray-300 bg-white hover:bg-gray-50 text-[#475569] text-[12px] font-semibold"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={saveGeneralRuleModal}
                className="h-[32px] px-4 rounded-[4px] bg-[#10b981] hover:bg-[#059669] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span>✓</span> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Ürünlere Özel Kargo Ücreti Modal ──────────────────────────────────── */}
      {productRuleModalOpen && editingProductRule && (
        <div
          className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setProductRuleModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-[520px] rounded-[6px] shadow-2xl overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0b5ed7] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <div className="text-[11px] text-white/80 font-medium">
                  Kargo Sistemi
                </div>
                <div className="text-[17px] font-bold tracking-tight">
                  Ürünlere Özel Kargo Ücreti
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProductRuleModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center text-white/90 text-[18px] font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                  Başlık
                </label>
                <input
                  type="text"
                  value={editingProductRule.title}
                  onChange={(e) =>
                    setEditingProductRule({
                      ...editingProductRule,
                      title: e.target.value,
                    })
                  }
                  className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                />
              </div>
              <div>
                <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                  Ürün SKU veya Kategori Adı
                </label>
                <input
                  type="text"
                  value={editingProductRule.sku_or_category}
                  onChange={(e) =>
                    setEditingProductRule({
                      ...editingProductRule,
                      sku_or_category: e.target.value,
                    })
                  }
                  className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                />
              </div>
              <div>
                <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                  Ek Kargo Ücreti (TL)
                </label>
                <input
                  type="number"
                  value={editingProductRule.extra_fee}
                  onChange={(e) =>
                    setEditingProductRule({
                      ...editingProductRule,
                      extra_fee: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                />
              </div>
            </div>
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setProductRuleModalOpen(false)}
                className="h-[32px] px-4 rounded-[4px] border border-gray-300 bg-white hover:bg-gray-50 text-[#475569] text-[12px] font-semibold"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={saveProductRuleModal}
                className="h-[32px] px-4 rounded-[4px] bg-[#10b981] hover:bg-[#059669] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span>✓</span> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Kargo ve Teslimat",
  icon: Buildings,
})

export default ShippingSettingsPage
