import { useState, useEffect } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Plus, Trash, ArrowPath, Sparkles, Map, XMark, Check, Adjustments } from "@medusajs/icons"

const Truck = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)

interface ShippingRegion {
  id: string
  countryCode: string
  countryName: string
  name: string
  cities: string[]
}

interface CarrierGeneralInfo {
  name: string
  active: boolean
  description: string
  sortOrder: number
  taxNumber: string
  customerType: string // "Hepsi" | "Bireysel" | "Kurumsal"
  companyCode: string
  logoUrl?: string
  customDeliveryTime: boolean
  limitCartTotal: boolean
  limitVolumetricWeight: boolean
  limitProductQuantity: boolean
}

interface CarrierApiSettings {
  apiActive: boolean
  autoGenerateBarcode: boolean
  generateBarcodeForNonCarrier: boolean
  markAsShippedOnBranchReceive: boolean
  barcodeGenerationStage: string
  sendFixedVolumetricWeight: boolean
  apiAuthorization: string
  apiFrom: string
  branchName: string
}

interface CarrierRegions {
  deliveryType: "all" | "selected"
  countries: Array<{
    countryCode: string
    countryName: string
    regions: string[]
  }>
}

interface Carrier {
  id: string
  key: string
  general: CarrierGeneralInfo
  api: CarrierApiSettings
  regions: CarrierRegions
}

interface ShippingConfig {
  systemType: "advanced" | "simple"
  standardShippingEnabled: boolean
  standardShippingFee: number
  standardShippingCurrency: string
  standardShippingCartType: string
  freeShippingEnabled: boolean
  freeShippingThreshold: number
  freeShippingCurrency: string
  regions: ShippingRegion[]
  carriers: Carrier[]
  generalShippingFees: any[]
  productSpecificFees: any[]
}

const PREDEFINED_CARRIERS = [
  { key: "aras", name: "Aras Kargo", logo: "https://aras-resim-logo" },
  { key: "basit", name: "Basit Kargo", logo: "" },
  { key: "dhl", name: "DHL", logo: "" },
  { key: "dhl_ecommerce", name: "DHL eCommerce", logo: "" },
  { key: "focus", name: "Focus Kargo", logo: "" },
  { key: "gelal", name: "Gelal Kargo", logo: "" },
  { key: "geliver", name: "Geliver", logo: "" },
  { key: "hepsijet", name: "hepsiJET", logo: "" },
  { key: "hts", name: "HTS Kargo", logo: "" },
  { key: "interline", name: "Interline Express Kargo", logo: "" },
  { key: "kargoist", name: "Kargoist", logo: "" },
  { key: "kargola", name: "Kargola", logo: "" },
  { key: "kargonova", name: "KargoNOVA", logo: "" },
  { key: "karpost", name: "Karpost Kargo", logo: "" },
  { key: "navilungo", name: "Navilungo", logo: "" },
  { key: "paykargo", name: "Pay Kargo", logo: "" },
  { key: "pozitif", name: "Pozitif Kargo", logo: "" },
  { key: "pts", name: "PTS Worldwide Express", logo: "" },
  { key: "ptt", name: "PTT Kargo", logo: "" },
  { key: "ptt_global", name: "PTT Kargo Global", logo: "" },
  { key: "sendeo", name: "Sendeo", logo: "" },
  { key: "surat", name: "Sürat Kargo", logo: "" },
  { key: "ucl", name: "UCL Express", logo: "" },
  { key: "diger", name: "Diğer", logo: "" }
]

const TURKEY_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
  "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
].sort((a, b) => a.localeCompare(b, "tr"))

const CARRIER_LOGOS: Record<string, string> = {
  aras: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 50'><rect width='160' height='50' fill='%23bf1e2e'/><text x='80' y='32' fill='white' font-size='20' font-family='Arial' font-weight='bold' text-anchor='middle'>aras</text></svg>",
  interline: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 50'><rect width='160' height='50' fill='%230b4da2'/><text x='80' y='32' fill='white' font-size='16' font-family='Arial' font-weight='bold' text-anchor='middle'>INTERLINE</text></svg>",
  kargoist: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 50'><rect width='160' height='50' fill='%23ef4136'/><text x='80' y='32' fill='white' font-size='20' font-family='Arial' font-weight='bold' text-anchor='middle'>kargoist</text></svg>",
  ptt: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 50'><rect width='160' height='50' fill='%23ffcc00'/><text x='80' y='32' fill='black' font-size='24' font-family='Arial' font-weight='bold' text-anchor='middle'>Ptt</text></svg>"
}

export default function ShippingSettingsPage() {
  const [config, setConfig] = useState<ShippingConfig>({
    systemType: "advanced",
    standardShippingEnabled: true,
    standardShippingFee: 100,
    standardShippingCurrency: "TL",
    standardShippingCartType: "Tüm sepetlere ekle",
    freeShippingEnabled: true,
    freeShippingThreshold: 500,
    freeShippingCurrency: "TL",
    regions: [],
    carriers: [],
    generalShippingFees: [],
    productSpecificFees: []
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  // Modals & Popups States
  const [regionModalOpen, setRegionModalOpen] = useState(false)
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
  const [tempRegion, setTempRegion] = useState<Partial<ShippingRegion>>({
    name: "",
    countryCode: "tr",
    countryName: "Türkiye",
    cities: []
  })

  useEffect(() => {
    const linkId = "plus-jakarta-sans-font";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Cities selection modal state
  const [citiesModalOpen, setCitiesModalOpen] = useState(false)

  // Carrier Wizards States
  const [addCarrierModalOpen, setAddCarrierModalOpen] = useState(false)
  const [selectedCarrierKey, setSelectedCarrierKey] = useState("aras")
  
  const [carrierFormModalOpen, setCarrierFormModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"genel" | "api" | "bolgeler">("genel")
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null)

  // Sub-modals inside Carrier detail Form
  const [countryAddModalOpen, setCountryAddModalOpen] = useState(false)
  const [tempCountry, setTempCountry] = useState({ countryCode: "tr", countryName: "Türkiye", regions: [] as string[] })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const res = await fetch("/admin/shipping-settings")
      const data = await res.json()
      if (data && data.config) {
        setConfig(data.config)
      }
    } catch (err) {
      console.error("Failed to load shipping config:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async (updatedConfig = config) => {
    setSaving(true)
    setToastMessage("")
    try {
      const res = await fetch("/admin/shipping-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedConfig),
      })
      const data = await res.json()
      if (data && data.success) {
        setToastMessage("Kargo ayarları başarıyla kaydedildi! ✔")
        setConfig(data.config)
        setTimeout(() => setToastMessage(""), 4000)
      } else {
        alert("Kaydedilirken hata oluştu.")
      }
    } catch (err) {
      console.error("Save config error:", err)
      alert("Sunucu bağlantı hatası.")
    } finally {
      setSaving(false)
    }
  }

  // Region Handlers
  const handleOpenRegionModal = (region: ShippingRegion | null = null) => {
    if (region) {
      setSelectedRegionId(region.id)
      setTempRegion({ ...region })
    } else {
      setSelectedRegionId(null)
      setTempRegion({
        name: "",
        countryCode: "tr",
        countryName: "Türkiye",
        cities: []
      })
    }
    setRegionModalOpen(true)
  }

  const handleSaveRegion = () => {
    if (!tempRegion.name) {
      alert("Lütfen bölge adı giriniz.")
      return
    }

    let updatedRegions = [...config.regions]
    if (selectedRegionId) {
      updatedRegions = updatedRegions.map((r) =>
        r.id === selectedRegionId ? (tempRegion as ShippingRegion) : r
      )
    } else {
      const newRegion: ShippingRegion = {
        id: `reg_${Date.now()}`,
        name: tempRegion.name,
        countryCode: tempRegion.countryCode || "tr",
        countryName: tempRegion.countryName || "Türkiye",
        cities: tempRegion.cities || []
      }
      updatedRegions.push(newRegion)
    }

    const newConfig = { ...config, regions: updatedRegions }
    setConfig(newConfig)
    setRegionModalOpen(false)
    handleSaveConfig(newConfig)
  }

  const handleDeleteRegion = (id: string) => {
    if (!confirm("Bu bölgeyi silmek istediğinize emin misiniz?")) return
    const updatedRegions = config.regions.filter((r) => r.id !== id)
    const newConfig = { ...config, regions: updatedRegions }
    setConfig(newConfig)
    handleSaveConfig(newConfig)
  }

  // Carrier Handlers
  const handleOpenCarrierForm = (carrier: Carrier | null = null) => {
    if (carrier) {
      setEditingCarrier({ ...carrier })
    } else {
      const selected = PREDEFINED_CARRIERS.find(c => c.key === selectedCarrierKey)
      const key = selectedCarrierKey
      const name = selected ? selected.name : "Yeni Kargo Firması"

      const newCarrier: Carrier = {
        id: `carrier_${Date.now()}`,
        key,
        general: {
          name: name.toUpperCase(),
          active: true,
          description: "",
          sortOrder: config.carriers.length + 1,
          taxNumber: "",
          customerType: "Hepsi",
          companyCode: "",
          logoUrl: CARRIER_LOGOS[key] || "",
          customDeliveryTime: false,
          limitCartTotal: false,
          limitVolumetricWeight: false,
          limitProductQuantity: false
        },
        api: {
          apiActive: false,
          autoGenerateBarcode: true,
          generateBarcodeForNonCarrier: false,
          markAsShippedOnBranchReceive: true,
          barcodeGenerationStage: "Yeni Sipariş",
          sendFixedVolumetricWeight: false,
          apiAuthorization: "",
          apiFrom: "",
          branchName: ""
        },
        regions: {
          deliveryType: "all",
          countries: []
        }
      }
      setEditingCarrier(newCarrier)
    }
    setActiveTab("genel")
    setAddCarrierModalOpen(false)
    setCarrierFormModalOpen(true)
  }

  const handleSaveCarrier = () => {
    if (!editingCarrier) return

    let updatedCarriers = [...config.carriers]
    const exists = config.carriers.find(c => c.id === editingCarrier.id)

    if (exists) {
      updatedCarriers = updatedCarriers.map(c => c.id === editingCarrier.id ? editingCarrier : c)
    } else {
      updatedCarriers.push(editingCarrier)
    }

    const newConfig = { ...config, carriers: updatedCarriers }
    setConfig(newConfig)
    setCarrierFormModalOpen(false)
    setEditingCarrier(null)
    handleSaveConfig(newConfig)
  }

  const handleDeleteCarrier = (id: string) => {
    if (!confirm("Bu kargo firmasını silmek istediğinize emin misiniz?")) return
    const updatedCarriers = config.carriers.filter(c => c.id !== id)
    const newConfig = { ...config, carriers: updatedCarriers }
    setConfig(newConfig)
    handleSaveConfig(newConfig)
  }

  const handleCarrierStatusToggle = (id: string) => {
    const updatedCarriers = config.carriers.map(c => {
      if (c.id === id) {
        return {
          ...c,
          general: { ...c.general, active: !c.general.active }
        }
      }
      return c
    })
    const newConfig = { ...config, carriers: updatedCarriers }
    setConfig(newConfig)
    handleSaveConfig(newConfig)
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-zinc-500">Yükleniyor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-50 min-h-screen text-zinc-900 p-6 md:p-8 custom-admin-wrapper">
      <style>{`
        .custom-admin-wrapper {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
          text-rendering: optimizeLegibility !important;
        }
        
        .custom-admin-wrapper * {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        }
      `}</style>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100] flex items-center gap-2 bg-emerald-600 text-white font-semibold text-xs px-4 py-3 rounded-xl shadow-lg border border-emerald-500 animate-slide-in transition-all">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-8">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-zinc-600" />
            Kargo Ayarları
          </h1>
          <p className="text-xs text-zinc-500 mt-1 font-medium">
            Teslimat bölgeleri, kargo firmaları, API entegrasyonu ve kargo ücret sistemini yönetin.
          </p>
        </div>
        <button
          onClick={() => handleSaveConfig()}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          {saving ? "Kaydediliyor..." : "Tüm Değişiklikleri Kaydet"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* CARD 1: Teslimat Bölgeleri */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Teslimat Bölgeleri</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">
                Teslimat yaptığınız bölgeleri tanımlayabilirsiniz. Ülke, il, ilçe veya mahallelere göre sınırlandırmalar yapabilirsiniz.
              </p>
            </div>
            <button
              onClick={() => handleOpenRegionModal()}
              className="h-8 px-3 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Ekle
            </button>
          </div>

          <div className="p-6 flex-1 flex flex-col gap-4">
            {config.regions.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-400 font-semibold border-2 border-dashed border-zinc-200 rounded-xl">
                Kayıtlı teslimat bölgesi bulunmamaktadır.
              </div>
            ) : (
              config.regions.map((reg) => (
                <div key={reg.id} className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    {reg.countryCode === "tr" ? (
                      <span className="text-xl">🇹🇷</span>
                    ) : (
                      <span className="text-xl">🌍</span>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">{reg.countryName}</h4>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                        {reg.name} <span className="bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded ml-1 font-bold">{reg.cities.length} İl</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedRegionId(reg.id)
                        setTempRegion({ ...reg })
                        setCitiesModalOpen(true)
                      }}
                      className="px-2.5 py-1.5 border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:bg-white text-[11px] font-bold rounded-lg transition-colors"
                    >
                      İller
                    </button>
                    <button
                      onClick={() => handleOpenRegionModal(reg)}
                      className="p-1.5 border border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <Adjustments className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRegion(reg.id)}
                      className="p-1.5 border border-zinc-200 hover:border-zinc-300 text-rose-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CARD 2: Kargo Firmaları */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Kargo Firmaları</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">
                Sipariş teslimatlarında çalıştığınız kargo firmalarını tanımlayabilirsiniz. API bilgileri ile kargo çıkışlarını otomatik hale getirebilirsiniz.
              </p>
            </div>
            <button
              onClick={() => setAddCarrierModalOpen(true)}
              className="h-8 px-3 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Ekle
            </button>
          </div>

          <div className="p-6 flex-1 flex flex-col gap-4 max-h-[300px] overflow-y-auto">
            {config.carriers.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-400 font-semibold border-2 border-dashed border-zinc-200 rounded-xl">
                Kayıtlı kargo firması bulunmamaktadır.
              </div>
            ) : (
              config.carriers.sort((a, b) => (b.general.sortOrder || 0) - (a.general.sortOrder || 0)).map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    {c.general.logoUrl ? (
                      <img src={c.general.logoUrl} alt={c.general.name} className="w-12 h-6 object-contain border border-zinc-200 rounded bg-white" />
                    ) : (
                      <div className="w-12 h-6 flex items-center justify-center bg-zinc-200 border border-zinc-300 rounded text-[9px] font-bold text-zinc-600">
                        LOGO
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">{c.general.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <button
                          onClick={() => handleCarrierStatusToggle(c.id)}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                            c.general.active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-zinc-200 text-zinc-600 border border-zinc-300"
                          }`}
                        >
                          {c.general.active ? "✔ Aktif" : "✕ Pasif"}
                        </button>
                        <span className="text-[9px] font-semibold text-zinc-400">Sıra: {c.general.sortOrder || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenCarrierForm(c)}
                      className="p-1.5 border border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <Adjustments className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCarrier(c.id)}
                      className="p-1.5 border border-zinc-200 hover:border-zinc-300 text-rose-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* CARD 3: Kargo Sistemi */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-zinc-100">
          <h2 className="text-sm font-bold text-zinc-900">Kargo Sistemi</h2>
          <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">
            Kargo ücretlendirme modelini seçin ve genel kargo limitlerini ayarlayın.
          </p>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Radio Group: System Type */}
          <div className="flex flex-col gap-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="systemType"
                checked={config.systemType === "advanced"}
                onChange={() => setConfig({ ...config, systemType: "advanced" })}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 mt-0.5"
              />
              <div>
                <span className="text-xs font-bold text-zinc-900">Gelişmiş</span>
                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                  Bölgelere ve kargo firmalarına özel kargo ücretleri belirleyebilirsiniz. Kargo ücretleri ödeme adımında hesaplanacaktır.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="systemType"
                checked={config.systemType === "simple"}
                onChange={() => setConfig({ ...config, systemType: "simple" })}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 mt-0.5"
              />
              <div>
                <span className="text-xs font-bold text-zinc-900">Basit</span>
                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                  Kargo ücretleri ürünler sepete eklendiğinde hesaplanmaktadır. Bölgesel ücretlendirme yapılamaz.
                </p>
              </div>
            </label>
          </div>

          <div className="h-px bg-zinc-100" />

          {/* Standard Shipping Fee Config */}
          <div className="flex flex-col gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.standardShippingEnabled}
                onChange={(e) => setConfig({ ...config, standardShippingEnabled: e.target.checked })}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 rounded"
              />
              <span className="text-xs font-bold text-zinc-800">Tüm bölgeler için standart kargo ücreti belirle</span>
            </label>
            <p className="text-[10px] text-zinc-400 font-medium -mt-2 ml-7">
              Sepete uygun kargo ücreti bulunmadığında bu ücret geçerli olacaktır.
            </p>

            {config.standardShippingEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Kargo Ücreti</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={config.standardShippingFee}
                      onChange={(e) => setConfig({ ...config, standardShippingFee: Number(e.target.value) })}
                      className="h-10 px-3 border border-zinc-200 focus:border-zinc-900 focus:outline-none rounded-lg text-xs font-bold text-zinc-900 flex-1 bg-white"
                    />
                    <select
                      value={config.standardShippingCurrency}
                      onChange={(e) => setConfig({ ...config, standardShippingCurrency: e.target.value })}
                      className="h-10 px-3 border border-zinc-200 focus:border-zinc-900 focus:outline-none rounded-lg text-xs font-bold text-zinc-900 bg-white"
                    >
                      <option value="TL">TL</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Sepet Tipi</label>
                  <select
                    value={config.standardShippingCartType}
                    onChange={(e) => setConfig({ ...config, standardShippingCartType: e.target.value })}
                    className="h-10 px-3 border border-zinc-200 focus:border-zinc-900 focus:outline-none rounded-lg text-xs font-bold text-zinc-900 bg-white"
                  >
                    <option value="Tüm sepetlere ekle">Tüm sepetlere ekle</option>
                    <option value="Sadece perakende">Sadece perakende</option>
                    <option value="Sadece toptan">Sadece toptan</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Free Shipping Config */}
          <div className="flex flex-col gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.freeShippingEnabled}
                onChange={(e) => setConfig({ ...config, freeShippingEnabled: e.target.checked })}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 rounded"
              />
              <span className="text-xs font-bold text-zinc-800">Tüm bölgeler için ücretsiz kargo limiti belirle</span>
            </label>

            {config.freeShippingEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Sipariş tutarı ve üzeri</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={config.freeShippingThreshold}
                      onChange={(e) => setConfig({ ...config, freeShippingThreshold: Number(e.target.value) })}
                      className="h-10 px-3 border border-zinc-200 focus:border-zinc-900 focus:outline-none rounded-lg text-xs font-bold text-zinc-900 flex-1 bg-white"
                    />
                    <select
                      value={config.freeShippingCurrency}
                      onChange={(e) => setConfig({ ...config, freeShippingCurrency: e.target.value })}
                      className="h-10 px-3 border border-zinc-200 focus:border-zinc-900 focus:outline-none rounded-lg text-xs font-bold text-zinc-900 bg-white"
                    >
                      <option value="TL">TL</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Genel Kargo Ücretleri Table Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <div>
                <h3 className="text-xs font-bold text-zinc-900">Genel Kargo Ücretleri</h3>
                <p className="text-[10px] text-zinc-400 font-medium">Desi, miktar, ağırlık veya sepet tutarı aralıklarına göre bölgesel kargo ücretleri ekleyebilirsiniz.</p>
              </div>
              <button
                type="button"
                className="h-7 px-2.5 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Ekle
              </button>
            </div>
            <div className="text-center py-6 text-[11px] text-zinc-400 font-semibold border border-zinc-200 rounded-xl bg-zinc-50/50">
              Genel kargo ücreti bulunmamaktadır.
            </div>
          </div>

          {/* Ürünlere Özel Ücretler Table Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <div>
                <h3 className="text-xs font-bold text-zinc-900">Ürünlere Özel Ücretler</h3>
                <p className="text-[10px] text-zinc-400 font-medium">Belirli kategori, marka veya ürünler için özel kargo ücretleri ekleyebilirsiniz.</p>
              </div>
              <button
                type="button"
                className="h-7 px-2.5 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Ekle
              </button>
            </div>
            <div className="text-center py-6 text-[11px] text-zinc-400 font-semibold border border-zinc-200 rounded-xl bg-zinc-50/50">
              Ürünler özel kargo ücreti bulunmamaktadır.
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* MODAL: Region Add/Edit */}
      {regionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="text-sm font-bold">
                {selectedRegionId ? "Bölgeyi Düzenle" : "Yeni Teslimat Bölgesi"}
              </h3>
              <button onClick={() => setRegionModalOpen(false)} className="text-white hover:opacity-85">
                <XMark className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Bölge Adı *</label>
                <input
                  type="text"
                  placeholder="örn. Asya 1, Avrupa, Marmara"
                  value={tempRegion.name}
                  onChange={(e) => setTempRegion({ ...tempRegion, name: e.target.value })}
                  className="h-10 px-3 border border-zinc-200 focus:border-zinc-900 focus:outline-none rounded-lg text-xs font-bold text-zinc-900 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Ülke</label>
                <select
                  value={tempRegion.countryCode}
                  onChange={(e) => {
                    const code = e.target.value
                    const name = code === "tr" ? "Türkiye" : "Diğer Ülke"
                    setTempRegion({ ...tempRegion, countryCode: code, countryName: name })
                  }}
                  className="h-10 px-3 border border-zinc-200 focus:border-zinc-900 focus:outline-none rounded-lg text-xs font-bold text-zinc-900 bg-white"
                >
                  <option value="tr">Türkiye</option>
                  <option value="us">United States</option>
                  <option value="de">Germany</option>
                </select>
              </div>
            </div>
            <div className="bg-zinc-50 px-6 py-4 border-t border-zinc-200 flex justify-end gap-3">
              <button
                onClick={() => setRegionModalOpen(false)}
                className="h-9 px-4 border border-zinc-200 hover:bg-white text-zinc-700 font-bold text-xs rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSaveRegion}
                className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: City Selection */}
      {citiesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl w-full max-w-xl overflow-hidden animate-scale-up flex flex-col max-h-[85vh]">
            <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between text-white flex-shrink-0">
              <div>
                <h3 className="text-sm font-bold">Şehirleri Seçin</h3>
                <p className="text-[10px] text-emerald-100 font-semibold mt-0.5">{tempRegion.name}</p>
              </div>
              <button onClick={() => setCitiesModalOpen(false)} className="text-white hover:opacity-85">
                <XMark className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex justify-between items-center mb-4 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                <span className="text-xs font-bold text-zinc-700">Seçilen İl Sayısı: {tempRegion.cities?.length || 0}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTempRegion({ ...tempRegion, cities: [...TURKEY_CITIES] })}
                    className="px-2 py-1 bg-white border border-zinc-200 text-[10px] font-bold text-zinc-600 rounded hover:bg-zinc-50"
                  >
                    Tümünü Seç
                  </button>
                  <button
                    onClick={() => setTempRegion({ ...tempRegion, cities: [] })}
                    className="px-2 py-1 bg-white border border-zinc-200 text-[10px] font-bold text-rose-600 rounded hover:bg-zinc-50"
                  >
                    Temizle
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {TURKEY_CITIES.map((city) => {
                  const isChecked = tempRegion.cities?.includes(city) || false
                  return (
                    <label key={city} className="flex items-center gap-2.5 p-2 border border-zinc-100 hover:border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50/50 select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const current = tempRegion.cities || []
                          const updated = isChecked
                            ? current.filter(c => c !== city)
                            : [...current, city]
                          setTempRegion({ ...tempRegion, cities: updated })
                        }}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 rounded"
                      />
                      <span className="text-[11px] font-bold text-zinc-800">{city}</span>
                    </label>
                  )
                })}
              </div>
            </div>
            <div className="bg-zinc-50 px-6 py-4 border-t border-zinc-200 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setCitiesModalOpen(false)}
                className="h-9 px-4 border border-zinc-200 hover:bg-white text-zinc-700 font-bold text-xs rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  let updatedRegions = config.regions.map((r) =>
                    r.id === selectedRegionId ? (tempRegion as ShippingRegion) : r
                  )
                  const newConfig = { ...config, regions: updatedRegions }
                  setConfig(newConfig)
                  setCitiesModalOpen(false)
                  handleSaveConfig(newConfig)
                }}
                className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CARRIER WIZARD MODAL 1: Kargo Ekle (List of Predefined Carriers) */}
      {addCarrierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl w-full max-w-lg overflow-hidden animate-scale-up flex flex-col max-h-[85vh]">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
              <div>
                <h3 className="text-sm font-bold">Kargo Firmaları</h3>
                <p className="text-[10px] text-blue-100 font-semibold mt-0.5">Yeni Kargo Firması</p>
              </div>
              <button onClick={() => setAddCarrierModalOpen(false)} className="text-white hover:opacity-85">
                <XMark className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-zinc-800 text-xs font-semibold leading-normal mb-5">
                Lütfen eklemek istediğiniz kargo firmasını seçin. Eğer listede bulunmayan bir kargo firmasıysa "Diğer" seçeneğini seçebilirsiniz.
              </div>

              <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-2">
                {PREDEFINED_CARRIERS.map((item) => (
                  <label
                    key={item.key}
                    className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer select-none transition-all ${
                      selectedCarrierKey === item.key
                        ? "border-blue-600 bg-blue-50/35"
                        : "border-zinc-200 hover:border-zinc-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="carrierSelect"
                        checked={selectedCarrierKey === item.key}
                        onChange={() => setSelectedCarrierKey(item.key)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 accent-blue-600"
                      />
                      <span className="text-xs font-bold text-zinc-800">{item.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-zinc-50 px-6 py-4 border-t border-zinc-200 flex justify-end gap-3">
              <button
                onClick={() => setAddCarrierModalOpen(false)}
                className="h-9 px-4 border border-zinc-200 hover:bg-white text-zinc-700 font-bold text-xs rounded-lg transition-colors"
              >
                Kapat
              </button>
              <button
                onClick={() => handleOpenCarrierForm()}
                className="h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1 shadow-sm"
              >
                İleri »
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CARRIER WIZARD MODAL 2: Kargo Bilgileri Formu */}
      {carrierFormModalOpen && editingCarrier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl w-full max-w-xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
              <div>
                <h3 className="text-sm font-bold">Kargo Firmaları</h3>
                <p className="text-[10px] text-blue-100 font-semibold mt-0.5">{editingCarrier.general.name || "Yeni Kargo Firması"}</p>
              </div>
              <button onClick={() => setCarrierFormModalOpen(false)} className="text-white hover:opacity-85">
                <XMark className="w-5 h-5" />
              </button>
            </div>

            {/* TAB SELECTOR */}
            <div className="bg-blue-600 flex px-4 border-t border-blue-500 flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("genel")}
                className={`px-4 py-3 text-xs font-bold text-white transition-all flex items-center gap-1.5 border-b-2 ${
                  activeTab === "genel" ? "bg-white text-blue-600 border-white rounded-t-lg" : "border-transparent opacity-80 hover:opacity-100"
                }`}
              >
                🛈 Genel Bilgiler
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("api")}
                className={`px-4 py-3 text-xs font-bold text-white transition-all flex items-center gap-1.5 border-b-2 ${
                  activeTab === "api" ? "bg-white text-blue-600 border-white rounded-t-lg" : "border-transparent opacity-80 hover:opacity-100"
                }`}
              >
                &lt;/&gt; API Ayarları
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("bolgeler")}
                className={`px-4 py-3 text-xs font-bold text-white transition-all flex items-center gap-1.5 border-b-2 ${
                  activeTab === "bolgeler" ? "bg-white text-blue-600 border-white rounded-t-lg" : "border-transparent opacity-80 hover:opacity-100"
                }`}
              >
                🌍 Bölgeler
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              
              {/* TAB 1: Genel Bilgiler */}
              {activeTab === "genel" && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Adı *</label>
                      <input
                        type="text"
                        value={editingCarrier.general.name}
                        onChange={(e) => setEditingCarrier({
                          ...editingCarrier,
                          general: { ...editingCarrier.general, name: e.target.value }
                        })}
                        className="h-10 px-3 border border-zinc-200 focus:border-zinc-900 focus:outline-none rounded-lg text-xs font-bold text-zinc-900 bg-white"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Durum</label>
                      <div className="flex items-center h-10">
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={editingCarrier.general.active}
                            onChange={(e) => setEditingCarrier({
                              ...editingCarrier,
                              general: { ...editingCarrier.general, active: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                          <span className="ml-3 text-xs font-bold text-zinc-800">
                            {editingCarrier.general.active ? "Aktif" : "Pasif"}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Kısa Açıklaması</label>
                      <input
                        type="text"
                        value={editingCarrier.general.description}
                        onChange={(e) => setEditingCarrier({
                          ...editingCarrier,
                          general: { ...editingCarrier.general, description: e.target.value }
                        })}
                        className="h-10 px-3 border border-zinc-200 focus:border-zinc-900 focus:outline-none rounded-lg text-xs font-bold text-zinc-900 bg-white"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Sıra</label>
                      <input
                        type="number"
                        value={editingCarrier.general.sortOrder}
                        onChange={(e) => setEditingCarrier({
                          ...editingCarrier,
                          general: { ...editingCarrier.general, sortOrder: Number(e.target.value) }
                        })}
                        className="h-10 px-3 border border-zinc-200 focus:border-zinc-900 focus:outline-none rounded-lg text-xs font-bold text-zinc-900 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Taşıyıcı VKN</label>
                      <input
                        type="text"
                        value={editingCarrier.general.taxNumber}
                        onChange={(e) => setEditingCarrier({
                          ...editingCarrier,
                          general: { ...editingCarrier.general, taxNumber: e.target.value }
                        })}
                        className="h-10 px-3 border border-zinc-200 focus:border-zinc-900 focus:outline-none rounded-lg text-xs font-bold text-zinc-900 bg-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Müşteri Tipi</label>
                      <select
                        value={editingCarrier.general.customerType}
                        onChange={(e) => setEditingCarrier({
                          ...editingCarrier,
                          general: { ...editingCarrier.general, customerType: e.target.value }
                        })}
                        className="h-10 px-3 border border-zinc-200 focus:border-zinc-900 focus:outline-none rounded-lg text-xs font-bold text-zinc-900 bg-white"
                      >
                        <option value="Hepsi">Hepsi</option>
                        <option value="Bireysel">Bireysel</option>
                        <option value="Kurumsal">Kurumsal</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Firma Kodu</label>
                    <input
                      type="text"
                      value={editingCarrier.general.companyCode}
                      onChange={(e) => setEditingCarrier({
                        ...editingCarrier,
                        general: { ...editingCarrier.general, companyCode: e.target.value }
                      })}
                      className="h-10 px-3 border border-zinc-200 focus:border-zinc-900 focus:outline-none rounded-lg text-xs font-bold text-zinc-900 bg-white"
                    />
                  </div>

                  {/* Logo Config */}
                  <div className="flex flex-col gap-2 p-4 bg-zinc-50 border border-zinc-200 rounded-xl mt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!editingCarrier.general.logoUrl}
                        onChange={(e) => {
                          const val = e.target.checked ? (CARRIER_LOGOS[editingCarrier.key] || "placeholder-url") : ""
                          setEditingCarrier({
                            ...editingCarrier,
                            general: { ...editingCarrier.general, logoUrl: val }
                          })
                        }}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 rounded"
                      />
                      <span className="text-xs font-bold text-zinc-800">Kargo firması için logo belirle</span>
                    </label>

                    {editingCarrier.general.logoUrl && (
                      <div className="flex items-center gap-4 mt-2 bg-white p-3 border border-zinc-200 rounded-lg">
                        {editingCarrier.general.logoUrl.startsWith("data:image") ? (
                          <img src={editingCarrier.general.logoUrl} alt="Logo" className="w-24 h-12 object-contain border border-zinc-200 rounded" />
                        ) : (
                          <div className="w-24 h-12 flex items-center justify-center bg-zinc-100 border border-zinc-200 text-[10px] font-bold text-zinc-400 rounded">
                            LOGO
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const input = prompt("Lütfen logo resim URL'ini veya Base64 verisini giriniz:")
                              if (input) {
                                setEditingCarrier({
                                  ...editingCarrier,
                                  general: { ...editingCarrier.general, logoUrl: input }
                                })
                              }
                            }}
                            className="px-2 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-[10px] font-bold text-zinc-600 rounded"
                          >
                            Değiştir
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCarrier({
                              ...editingCarrier,
                              general: { ...editingCarrier.general, logoUrl: "" }
                            })}
                            className="px-2 py-1.5 border border-rose-200 hover:bg-rose-50 text-[10px] font-bold text-rose-600 rounded"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Advanced settings checkboxes */}
                  <div className="flex flex-col gap-3 mt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingCarrier.general.customDeliveryTime}
                        onChange={(e) => setEditingCarrier({
                          ...editingCarrier,
                          general: { ...editingCarrier.general, customDeliveryTime: e.target.checked }
                        })}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 rounded"
                      />
                      <span className="text-xs font-semibold text-zinc-700">Bayilere özel teslimat süresi belirle</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingCarrier.general.limitCartTotal}
                        onChange={(e) => setEditingCarrier({
                          ...editingCarrier,
                          general: { ...editingCarrier.general, limitCartTotal: e.target.checked }
                        })}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 rounded"
                      />
                      <span className="text-xs font-semibold text-zinc-700">Taşınabilecek sepet tutarlarını sınırla</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingCarrier.general.limitVolumetricWeight}
                        onChange={(e) => setEditingCarrier({
                          ...editingCarrier,
                          general: { ...editingCarrier.general, limitVolumetricWeight: e.target.checked }
                        })}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 rounded"
                      />
                      <span className="text-xs font-semibold text-zinc-700">Taşınabilecek desi aralıklarını belirle</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingCarrier.general.limitProductQuantity}
                        onChange={(e) => setEditingCarrier({
                          ...editingCarrier,
                          general: { ...editingCarrier.general, limitProductQuantity: e.target.checked }
                        })}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 rounded"
                      />
                      <span className="text-xs font-semibold text-zinc-700">Taşınabilecek ürün miktarını belirle</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: API Ayarları */}
              {activeTab === "api" && (
                <div className="flex flex-col gap-4">
                  
                  {/* API Info banner */}
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-zinc-800 text-xs font-semibold leading-normal">
                    <p className="font-bold text-zinc-900 mb-1">{editingCarrier.general.name} API Entegrasyon Ayarları</p>
                    Kargo entegrasyon ayarlarını tamamlayarak kargo barkodlarınızın otomatik oluşmasını sağlayabilirsiniz. API bilgilerinizi kargo şubenizden talep edebilirsiniz.
                    <span className="text-rose-600 mt-2 block">Kargo firmanıza API kullanımı için 95.173.161.78 IP adresini iletebilirsiniz.</span>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-[10px] font-extrabold text-zinc-500 uppercase">API Durumu</label>
                    <div className="flex items-center h-10">
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editingCarrier.api.apiActive}
                          onChange={(e) => setEditingCarrier({
                            ...editingCarrier,
                            api: { ...editingCarrier.api, apiActive: e.target.checked }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        <span className="ml-3 text-xs font-bold text-zinc-800">
                          {editingCarrier.api.apiActive ? "Aktif" : "Pasif"}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="h-px bg-zinc-100 my-2" />

                  {/* API Checkboxes */}
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingCarrier.api.autoGenerateBarcode}
                        onChange={(e) => setEditingCarrier({
                          ...editingCarrier,
                          api: { ...editingCarrier.api, autoGenerateBarcode: e.target.checked }
                        })}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 rounded"
                      />
                      <span className="text-xs font-semibold text-zinc-700">Kargo barkodlarını otomatik oluştur</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingCarrier.api.generateBarcodeForNonCarrier}
                        onChange={(e) => setEditingCarrier({
                          ...editingCarrier,
                          api: { ...editingCarrier.api, generateBarcodeForNonCarrier: e.target.checked }
                        })}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 rounded"
                      />
                      <span className="text-xs font-semibold text-zinc-700">Kargo firması olmayan siparişler için kargo barkodu oluştur</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingCarrier.api.markAsShippedOnBranchReceive}
                        onChange={(e) => setEditingCarrier({
                          ...editingCarrier,
                          api: { ...editingCarrier.api, markAsShippedOnBranchReceive: e.target.checked }
                        })}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 rounded"
                      />
                      <span className="text-xs font-semibold text-zinc-700">Kargo, şube tarafından teslim alındığında kargolandı olarak işaretle</span>
                    </label>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Sipariş Kargo Barkod Oluşturulma Aşaması</label>
                    <select
                      value={editingCarrier.api.barcodeGenerationStage}
                      onChange={(e) => setEditingCarrier({
                        ...editingCarrier,
                        api: { ...editingCarrier.api, barcodeGenerationStage: e.target.value }
                      })}
                      className="h-10 px-3 border border-zinc-200 focus:border-zinc-900 focus:outline-none rounded-lg text-xs font-bold text-zinc-900 bg-white"
                    >
                      <option value="Yeni Sipariş">Yeni Sipariş</option>
                      <option value="Ödeme Onaylandığında">Ödeme Onaylandığında</option>
                      <option value="Kargoya Verildiğinde">Kargoya Verildiğinde</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={editingCarrier.api.sendFixedVolumetricWeight}
                      onChange={(e) => setEditingCarrier({
                        ...editingCarrier,
                        api: { ...editingCarrier.api, sendFixedVolumetricWeight: e.target.checked }
                      })}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 rounded"
                    />
                    <span className="text-xs font-semibold text-zinc-700">Sabit desi miktarı gönder</span>
                  </label>

                  <div className="h-px bg-zinc-100 my-2" />

                  {/* API Auth Credentials */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-500 uppercase font-sans">API Authorization</label>
                    <input
                      type="text"
                      value={editingCarrier.api.apiAuthorization}
                      onChange={(e) => setEditingCarrier({
                        ...editingCarrier,
                        api: { ...editingCarrier.api, apiAuthorization: e.target.value }
                      })}
                      className="h-10 px-3 border border-zinc-200 focus:border-zinc-900 focus:outline-none rounded-lg text-xs font-semibold text-zinc-900 bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-500 uppercase">API From</label>
                    <input
                      type="text"
                      value={editingCarrier.api.apiFrom}
                      onChange={(e) => setEditingCarrier({
                        ...editingCarrier,
                        api: { ...editingCarrier.api, apiFrom: e.target.value }
                      })}
                      className="h-10 px-3 border border-zinc-200 focus:border-zinc-900 focus:outline-none rounded-lg text-xs font-semibold text-zinc-900 bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Şube (KargoNOVA, Kargoist, MNG vb.)</label>
                    <input
                      type="text"
                      value={editingCarrier.api.branchName}
                      onChange={(e) => setEditingCarrier({
                        ...editingCarrier,
                        api: { ...editingCarrier.api, branchName: e.target.value }
                      })}
                      className="h-10 px-3 border border-zinc-200 focus:border-zinc-900 focus:outline-none rounded-lg text-xs font-semibold text-zinc-900 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Bölgeler */}
              {activeTab === "bolgeler" && (
                <div className="flex flex-col gap-4">
                  <span className="text-xs font-semibold text-zinc-700">Kargo firmasının teslimat yaptığı bölgeleri belirleyebilirsiniz.</span>
                  
                  <div className="flex flex-col gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="carrierRegionType"
                        checked={editingCarrier.regions.deliveryType === "all"}
                        onChange={() => setEditingCarrier({
                          ...editingCarrier,
                          regions: { ...editingCarrier.regions, deliveryType: "all" }
                        })}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 accent-blue-600 mt-0.5"
                      />
                      <div>
                        <span className="text-xs font-bold text-zinc-900">Tüm bölgelere teslimat</span>
                        <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Kargo firması tüm teslimat bölgelerinde geçerli olacaktır.</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer mt-2">
                      <input
                        type="radio"
                        name="carrierRegionType"
                        checked={editingCarrier.regions.deliveryType === "selected"}
                        onChange={() => setEditingCarrier({
                          ...editingCarrier,
                          regions: { ...editingCarrier.regions, deliveryType: "selected" }
                        })}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 accent-blue-600 mt-0.5"
                      />
                      <div>
                        <span className="text-xs font-bold text-zinc-900">Belirli bölgelere teslimat</span>
                        <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Ülke, il, ilçe ve mahalleleri belirleyebilirsiniz.</p>
                      </div>
                    </label>
                  </div>

                  {editingCarrier.regions.deliveryType === "selected" && (
                    <div className="flex flex-col gap-3 mt-2">
                      <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                        <span className="text-xs font-bold text-zinc-800">Kapsanan Bölgeler</span>
                        <button
                          type="button"
                          onClick={() => {
                            setTempCountry({ countryCode: "tr", countryName: "Türkiye", regions: [] })
                            setCountryAddModalOpen(true)
                          }}
                          className="h-7 px-3 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Ülke Ekle
                        </button>
                      </div>

                      {/* Region Countries Table */}
                      <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
                        <div className="grid grid-cols-[100px_1fr_60px] bg-zinc-50 border-b border-zinc-200 px-4 py-2 text-[10px] font-extrabold text-zinc-500 uppercase">
                          <span>Ülkeler</span>
                          <span>Bölgeler</span>
                          <span className="text-right">İşlem</span>
                        </div>
                        {editingCarrier.regions.countries.length === 0 ? (
                          <div className="text-center py-6 text-xs font-semibold text-zinc-400">
                            Lütfen ülke ekleyin.
                          </div>
                        ) : (
                          editingCarrier.regions.countries.map((c, i) => (
                            <div key={i} className="grid grid-cols-[100px_1fr_60px] border-b border-zinc-100 last:border-0 px-4 py-3 text-xs items-center">
                              <span className="font-bold text-zinc-900">{c.countryName}</span>
                              <span className="text-zinc-500 font-semibold">{c.regions.join(", ") || "Tümü"}</span>
                              <div className="text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = editingCarrier.regions.countries.filter((_, idx) => idx !== i)
                                    setEditingCarrier({
                                      ...editingCarrier,
                                      regions: { ...editingCarrier.regions, countries: updated }
                                    })
                                  }}
                                  className="text-rose-600 hover:text-rose-800 font-bold text-[10px]"
                                >
                                  Sil
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            <div className="bg-zinc-50 px-6 py-4 border-t border-zinc-200 flex justify-between gap-3 flex-shrink-0">
              <div className="relative group">
                <button
                  type="button"
                  className="h-9 px-4 border border-zinc-200 hover:bg-white text-zinc-700 font-bold text-xs rounded-lg transition-colors"
                >
                  İşlemler ▾
                </button>
                <div className="absolute left-0 bottom-full mb-1 w-36 bg-white border border-zinc-200 rounded-lg shadow-lg hidden group-hover:block z-10 py-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Değişiklikleri kaydetmeden kapatmak istiyor musunuz?")) {
                        setCarrierFormModalOpen(false)
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                  >
                    Vazgeç
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCarrierFormModalOpen(false)}
                  className="h-9 px-4 border border-zinc-200 hover:bg-white text-zinc-700 font-bold text-xs rounded-lg transition-colors"
                >
                  Kapat
                </button>
                <button
                  onClick={handleSaveCarrier}
                  className="h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1 shadow-sm"
                >
                  ✔ Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CARRIER SUBMODAL: Ülke / Bölge Ekle */}
      {countryAddModalOpen && editingCarrier && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl w-full max-w-sm overflow-hidden animate-scale-up">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="text-sm font-bold">Kapsanacak Ülke Ekle</h3>
              <button onClick={() => setCountryAddModalOpen(false)} className="text-white hover:opacity-85">
                <XMark className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Ülke Seçin</label>
                <select
                  value={tempCountry.countryCode}
                  onChange={(e) => {
                    const code = e.target.value
                    const name = code === "tr" ? "Türkiye" : (code === "us" ? "United States" : "Germany")
                    setTempCountry({ ...tempCountry, countryCode: code, countryName: name })
                  }}
                  className="h-10 px-3 border border-zinc-200 focus:border-zinc-900 focus:outline-none rounded-lg text-xs font-bold text-zinc-900 bg-white"
                >
                  <option value="tr">Türkiye</option>
                  <option value="us">United States</option>
                  <option value="de">Germany</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Bölgeler (İsteğe bağlı, virgülle ayırın)</label>
                <input
                  type="text"
                  placeholder="örn. Asya 1, Avrupa, Marmara"
                  onChange={(e) => {
                    const list = e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                    setTempCountry({ ...tempCountry, regions: list })
                  }}
                  className="h-10 px-3 border border-zinc-200 focus:border-zinc-900 focus:outline-none rounded-lg text-xs font-semibold text-zinc-900 bg-white"
                />
              </div>
            </div>
            <div className="bg-zinc-50 px-6 py-4 border-t border-zinc-200 flex justify-end gap-3">
              <button
                onClick={() => setCountryAddModalOpen(false)}
                className="h-9 px-4 border border-zinc-200 hover:bg-white text-zinc-700 font-bold text-xs rounded-lg transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={() => {
                  const updatedCountries = [...editingCarrier.regions.countries, tempCountry]
                  setEditingCarrier({
                    ...editingCarrier,
                    regions: { ...editingCarrier.regions, countries: updatedCountries }
                  })
                  setCountryAddModalOpen(false)
                }}
                className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export const config = defineRouteConfig({
  label: "Kargo Ayarları",
  icon: Truck,
})
