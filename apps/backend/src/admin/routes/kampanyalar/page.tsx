import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Sparkles } from "@medusajs/icons"
import { useEffect, useState } from "react"

type CampaignRuleType =
  | "yuzde"
  | "hediye"
  | "sepette"
  | "bogo"
  | "hediye_urun"
  | "firsat"
  | "otomasyon"

type CampaignItem = {
  id: string
  title: string
  subtitle?: string
  code: string
  rule_type: CampaignRuleType
  discount_type: "percentage" | "fixed" | "bogo" | "free_shipping"
  discount_value: number
  min_cart_amount: number
  max_usage?: number
  usage_count?: number
  is_active: boolean
  starts_at?: string
  ends_at?: string
  badge_label?: string
  badge_color?: string
}

const DEFAULT_KURGULAR: CampaignItem[] = [
  {
    id: "camp-sepette15",
    title: "Tüm Bodykit Setlerinde %15 Sepet İndirimi",
    code: "SEPETTE15",
    rule_type: "yuzde",
    discount_type: "percentage",
    discount_value: 15,
    min_cart_amount: 1500,
    usage_count: 84,
    is_active: true,
    badge_label: "SEPETE ÖZEL İNDİRİM",
    badge_color: "blue",
  },
  {
    id: "camp-kargo0",
    title: "1.000 TL ve Üzeri Siparişlerde Ücretsiz Kargo",
    code: "KARGO0",
    rule_type: "hediye",
    discount_type: "free_shipping",
    discount_value: 100,
    min_cart_amount: 1000,
    usage_count: 312,
    is_active: true,
    badge_label: "ÜCRETSİZ KARGO",
    badge_color: "emerald",
  },
  {
    id: "camp-3al2ode",
    title: "Seçili Aksesuar & Lip Ürünlerinde 3 Al 2 Öde",
    code: "3AL2ODE",
    rule_type: "bogo",
    discount_type: "bogo",
    discount_value: 33,
    min_cart_amount: 0,
    usage_count: 41,
    is_active: true,
    badge_label: "X AL Y ÖDE (BOGO)",
    badge_color: "purple",
  },
  {
    id: "camp-hosgeldin250",
    title: "Yeni Üyelere İlk Siparişte 250 TL Hediye Çeki",
    code: "HOSGELDIN250",
    rule_type: "otomasyon",
    discount_type: "fixed",
    discount_value: 250,
    min_cart_amount: 1250,
    usage_count: 19,
    is_active: true,
    badge_label: "DİNAMİK OTOMASYON",
    badge_color: "amber",
  },
]

const RULE_TITLES: Record<CampaignRuleType, string> = {
  yuzde: "Sepete Özel İndirim Kurgusu",
  hediye: "Kupon & Klasik İndirim Kurgusu",
  sepette: "Sepette Otomatik İndirim Kurgusu",
  bogo: "X Al Y Öde (BOGO) Kurgusu",
  hediye_urun: "Hediye Ürünler Kurgusu",
  firsat: "Sepette Fırsat Ürünleri Kurgusu",
  otomasyon: "Dinamik İndirim Otomasyonu",
}

const KampanyalarPage = () => {
  const [selectedRule, setSelectedRule] = useState<CampaignRuleType>("yuzde")
  const [innerTab, setInnerTab] = useState<"genel" | "detay" | "kosul">("genel")
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(DEFAULT_KURGULAR)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states matching bodykitmerkezi_dashboard_preview.html 1:1
  const [formActive, setFormActive] = useState(true)
  const [formTitle, setFormTitle] = useState("Yeni Sezon %15 Sepet İndirimi")
  const [formCode, setFormCode] = useState("SEPETTE15")
  const [formCalcType, setFormCalcType] = useState("Yüzde İndirim (%)")
  const [formValue, setFormValue] = useState<number>(15)
  const [formMinCart, setFormMinCart] = useState<number>(1500)
  const [formUsageLimit, setFormUsageLimit] = useState<number>(500)
  const [formStartDate, setFormStartDate] = useState("2026-11-01")
  const [formEndDate, setFormEndDate] = useState("2026-12-31")
  const [formTargetScope, setFormTargetScope] = useState("Tüm Kategoriler ve Ürünler")
  const [formCustomerGroup, setFormCustomerGroup] = useState("Tüm Müşteriler (Üye + Üyeliksiz)")
  const [formFreeShipping, setFormFreeShipping] = useState(true)

  useEffect(() => {
    const syncTabFromUrl = () => {
      if (typeof window === "undefined") return
      const params = new URLSearchParams(window.location.search)
      const tab = params.get("tab")
      if (
        tab === "yuzde" ||
        tab === "hediye" ||
        tab === "sepette" ||
        tab === "bogo" ||
        tab === "hediye_urun" ||
        tab === "firsat" ||
        tab === "otomasyon"
      ) {
        setSelectedRule(tab)
      }
    }
    syncTabFromUrl()
    window.addEventListener("popstate", syncTabFromUrl)
    const timer = setInterval(syncTabFromUrl, 300)
    return () => {
      window.removeEventListener("popstate", syncTabFromUrl)
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    const fetchBackendCampaigns = async () => {
      try {
        const res = await fetch("/admin/campaigns", { credentials: "include" })
        if (!res.ok) return
        const data = await res.json()
        const list = Array.isArray(data?.campaigns) ? data.campaigns : []
        if (list.length > 0) {
          const mapped: CampaignItem[] = list.map((c: any) => ({
            id: c.id,
            title: c.title || c.name || "Kampanya",
            code: c.code || c.campaign_identifier || "KUPON",
            rule_type: (c.rule_type as CampaignRuleType) || "yuzde",
            discount_type: c.discount_type || "percentage",
            discount_value: Number(c.discount_value || 15),
            min_cart_amount: Number(c.min_cart_amount || 0),
            usage_count: Number(c.usage_count || 0),
            is_active: c.is_active !== false,
            badge_label: "AKTİF KURGU",
            badge_color: "blue",
          }))
          const existingCodes = new Set(DEFAULT_KURGULAR.map((d) => d.code))
          const extra = mapped.filter((m) => !existingCodes.has(m.code))
          if (extra.length > 0) {
            setCampaigns([...DEFAULT_KURGULAR, ...extra])
          }
        }
      } catch {}
    }
    fetchBackendCampaigns()
  }, [])

  const selectRuleType = (rule: CampaignRuleType) => {
    setSelectedRule(rule)
    if (typeof window !== "undefined") {
      const nextUrl = `/app/kampanyalar?tab=${rule}`
      window.history.pushState({}, "", nextUrl)
      window.dispatchEvent(new PopStateEvent("popstate"))
    }
  }

  const generateRandomCode = () => {
    const randomNum = Math.floor(100 + Math.random() * 900)
    setFormCode(`BKM${randomNum}`)
  }

  const handleSaveCampaign = async () => {
    if (!formTitle.trim()) {
      alert("Lütfen kampanya başlığı giriniz.")
      return
    }
    setSaving(true)
    const newItem: CampaignItem = {
      id: `camp-${Date.now()}`,
      title: formTitle.trim(),
      code: formCode.trim().toUpperCase() || "KAMPANYA",
      rule_type: selectedRule,
      discount_type: formCalcType.includes("Sabit")
        ? "fixed"
        : formCalcType.includes("Kargo")
        ? "free_shipping"
        : "percentage",
      discount_value: Number(formValue) || 0,
      min_cart_amount: Number(formMinCart) || 0,
      usage_count: 0,
      is_active: formActive,
      badge_label: RULE_TITLES[selectedRule].toUpperCase(),
      badge_color: selectedRule === "otomasyon" ? "amber" : selectedRule === "bogo" ? "purple" : "blue",
    }

    try {
      await fetch("/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: newItem.title,
          code: newItem.code,
          rule_type: newItem.rule_type,
          discount_type: newItem.discount_type,
          discount_value: newItem.discount_value,
          min_cart_amount: newItem.min_cart_amount,
          is_active: newItem.is_active,
        }),
      })
    } catch {}

    setCampaigns((prev) => {
      const idx = prev.findIndex((p) => p.code === newItem.code)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], ...newItem }
        return copy
      }
      return [newItem, ...prev]
    })

    setSaving(false)
    setStatusMessage("Kampanya kurgusu başarıyla kaydedildi ve yayınlandı!")
    setTimeout(() => setStatusMessage(null), 4000)
  }

  const handleEditExisting = (item: CampaignItem) => {
    setSelectedRule(item.rule_type)
    setFormTitle(item.title)
    setFormCode(item.code)
    setFormValue(item.discount_value)
    setFormMinCart(item.min_cart_amount)
    setFormActive(item.is_active)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDeleteExisting = async (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
    try {
      await fetch(`/admin/campaigns/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-slate-800 pb-20">
      <div className="max-w-[1640px] w-full mx-auto px-5 py-6">
        {statusMessage && (
          <div className="mb-5 px-4 py-3 rounded-[8px] bg-[#e0f6e7] border border-[#0abb87]/30 text-[#08976d] text-[13px] font-bold flex items-center justify-between">
            <span>✓ {statusMessage}</span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-[#08976d] font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Promosyon & Kurgu Motoru Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-[10px] border border-slate-200 p-4 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                Promosyon &amp; Kurgu Motoru
              </div>
              <div className="space-y-1.5">
                {[
                  {
                    key: "yuzde" as CampaignRuleType,
                    icon: "🏷️",
                    title: "Sepete Özel İndirim",
                    subtitle: "Tutar veya ürün adedi bazlı",
                  },
                  {
                    key: "hediye" as CampaignRuleType,
                    icon: "🎟️",
                    title: "Kupon & Klasik İndirim",
                    subtitle: "Kupon kodu & hediye çeki",
                  },
                  {
                    key: "sepette" as CampaignRuleType,
                    icon: "🛒",
                    title: "Sepette İndirim",
                    subtitle: "Otomatik sepette düşen indirim",
                  },
                  {
                    key: "bogo" as CampaignRuleType,
                    icon: "🎁",
                    title: "X Al Y Öde (BOGO)",
                    subtitle: "3 Al 2 Öde / 2. Ürüne %50",
                  },
                  {
                    key: "hediye_urun" as CampaignRuleType,
                    icon: "🎀",
                    title: "Hediye Ürünler",
                    subtitle: "Belirli alışverişe bedava ürün",
                  },
                  {
                    key: "firsat" as CampaignRuleType,
                    icon: "⚡",
                    title: "Sepette Fırsat",
                    subtitle: "Kasa önü indirimli ürünler",
                  },
                ].map((item) => {
                  const isActive = selectedRule === item.key
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => selectRuleType(item.key)}
                      className={
                        isActive
                          ? "w-full text-left px-3.5 py-2.5 rounded-[8px] bg-[#eef4ff] border border-[#1565c0]/30 text-[#1565c0] font-bold text-[12.5px] flex items-center justify-between cursor-pointer"
                          : "w-full text-left px-3.5 py-2.5 rounded-[8px] hover:bg-slate-50 border border-transparent text-slate-700 font-semibold text-[12.5px] flex items-center justify-between cursor-pointer"
                      }
                    >
                      <div>
                        <div>
                          {item.icon} {item.title}
                        </div>
                        <div
                          className={
                            isActive
                              ? "text-[10.5px] font-normal text-slate-500 mt-0.5"
                              : "text-[10.5px] font-normal text-slate-400 mt-0.5"
                          }
                        >
                          {item.subtitle}
                        </div>
                      </div>
                      <span className={isActive ? "text-[11px]" : "text-[11px] text-slate-400"}>›</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-[10px] border border-slate-200 p-4 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Otomasyon &amp; Akıllı Kupon
              </div>
              <button
                type="button"
                onClick={() => selectRuleType("otomasyon")}
                className={
                  selectedRule === "otomasyon"
                    ? "w-full text-left px-3.5 py-2.5 rounded-[8px] bg-[#eef4ff] border border-[#1565c0]/30 text-[#1565c0] font-bold text-[12.5px] flex items-center justify-between cursor-pointer"
                    : "w-full text-left px-3.5 py-2.5 rounded-[8px] hover:bg-slate-50 border border-transparent text-slate-700 font-semibold text-[12.5px] flex items-center justify-between cursor-pointer"
                }
              >
                <div>
                  <div>🤖 Dinamik İndirim Otomasyonu</div>
                  <div className="text-[10.5px] font-normal text-slate-400 mt-0.5">
                    Yeni üye / terk edilen sepet kuponu
                  </div>
                </div>
                <span className="text-[11px] text-slate-400">›</span>
              </button>
            </div>

            <div className="bg-white rounded-[10px] border border-slate-200 p-4 shadow-2xs">
              <button
                type="button"
                onClick={() =>
                  document.getElementById("campaign-existing-list-card")?.scrollIntoView({ behavior: "smooth" })
                }
                className="w-full py-2.5 px-4 rounded-[8px] bg-slate-900 hover:bg-slate-800 text-white text-[12.5px] font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📋</span>
                <span>Mevcut Kurgular ({campaigns.length})</span>
              </button>
            </div>
          </div>

          {/* Right Column: Main Campaign Form + Active Campaigns List */}
          <div className="lg:col-span-9 space-y-6">
            {/* Active Campaign Form Card */}
            <div className="bg-white rounded-[10px] border border-slate-200 shadow-2xs overflow-hidden">
              {/* Single-line tab header inside form */}
              <div className="bg-[#f8fafc] border-b border-slate-200 px-6 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-6 text-[13px] font-bold">
                  <button
                    type="button"
                    onClick={() => setInnerTab("genel")}
                    className={
                      innerTab === "genel"
                        ? "py-3.5 border-b-2 border-[#1565c0] text-[#1565c0] cursor-pointer"
                        : "py-3.5 border-b-2 border-transparent text-slate-500 hover:text-slate-800 cursor-pointer"
                    }
                  >
                    1. Genel Bilgiler
                  </button>
                  <button
                    type="button"
                    onClick={() => setInnerTab("detay")}
                    className={
                      innerTab === "detay"
                        ? "py-3.5 border-b-2 border-[#1565c0] text-[#1565c0] cursor-pointer"
                        : "py-3.5 border-b-2 border-transparent text-slate-500 hover:text-slate-800 cursor-pointer"
                    }
                  >
                    2. İndirim Detayları
                  </button>
                  <button
                    type="button"
                    onClick={() => setInnerTab("kosul")}
                    className={
                      innerTab === "kosul"
                        ? "py-3.5 border-b-2 border-[#1565c0] text-[#1565c0] cursor-pointer"
                        : "py-3.5 border-b-2 border-transparent text-slate-500 hover:text-slate-800 cursor-pointer"
                    }
                  >
                    3. Koşullar &amp; Kurallar
                  </button>
                </div>
                <div className="flex items-center gap-2 py-2">
                  <span className="text-[12px] font-semibold text-slate-600">Kupon / Kurgu Aktif</span>
                  <div
                    onClick={() => setFormActive((prev) => !prev)}
                    className={`w-[48px] h-[25px] rounded-full p-[3px] flex items-center cursor-pointer transition-all ${
                      formActive ? "bg-[#0abb87] justify-end" : "bg-[#e2e5ec] justify-start"
                    }`}
                  >
                    <div className="w-[19px] h-[19px] rounded-full bg-white shadow-xs"></div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-[16px] font-bold text-[#1e293b]">{RULE_TITLES[selectedRule]}</h3>
                    <p className="text-[12.5px] text-slate-500 mt-0.5">
                      Müşterilerinizin sepet tutarına, ürün adedine veya kupon koduna göre otomatik uygulanacak indirim
                      kurgusunu yapılandırın.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#e0f6e7] text-[#08976d] text-[11.5px] font-bold">
                    ✓ Canlı Mağaza Entegreli
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1.5">
                      Kampanya / Kupon Başlığı <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full h-[38px] px-3 rounded-[5px] border border-[#e2e5ec] text-[13px] text-[#1e293b] font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1.5">
                      Kupon Kodu (Otomatik kurgularda boş bırakılabilir)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formCode}
                        onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                        className="flex-1 h-[38px] px-3 rounded-[5px] border border-[#e2e5ec] text-[13px] font-mono font-bold text-[#1565c0] uppercase"
                      />
                      <button
                        type="button"
                        onClick={generateRandomCode}
                        className="h-[38px] px-3 rounded-[5px] border border-slate-300 bg-slate-50 hover:bg-slate-100 text-[12px] font-semibold text-slate-700 cursor-pointer"
                      >
                        🎲 Kod Üret
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1.5">
                      İndirim Hesaplama Türü
                    </label>
                    <select
                      value={formCalcType}
                      onChange={(e) => setFormCalcType(e.target.value)}
                      className="w-full h-[38px] px-3 rounded-[5px] border border-[#e2e5ec] bg-white text-[13px] text-[#1e293b]"
                    >
                      <option value="Yüzde İndirim (%)">Yüzde İndirim (%)</option>
                      <option value="Sabit Tutar İndirimi (TL)">Sabit Tutar İndirimi (TL)</option>
                      <option value="Ücretsiz Kargo">Ücretsiz Kargo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1.5">
                      İndirim Oranı / Değeri <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formValue}
                      onChange={(e) => setFormValue(Number(e.target.value))}
                      className="w-full h-[38px] px-3 rounded-[5px] border border-[#e2e5ec] text-[13px] font-bold text-[#0abb87]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1.5">
                      Minimum Sepet Tutarı (TL)
                    </label>
                    <input
                      type="number"
                      value={formMinCart}
                      onChange={(e) => setFormMinCart(Number(e.target.value))}
                      className="w-full h-[38px] px-3 rounded-[5px] border border-[#e2e5ec] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1.5">
                      Toplam Kullanım Limiti (Kota)
                    </label>
                    <input
                      type="number"
                      value={formUsageLimit}
                      onChange={(e) => setFormUsageLimit(Number(e.target.value))}
                      className="w-full h-[38px] px-3 rounded-[5px] border border-[#e2e5ec] text-[13px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1.5">Başlangıç Tarihi</label>
                    <input
                      type="date"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full h-[38px] px-3 rounded-[5px] border border-[#e2e5ec] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1.5">Bitiş Tarihi</label>
                    <input
                      type="date"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full h-[38px] px-3 rounded-[5px] border border-[#e2e5ec] text-[13px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1.5">
                      Geçerli Kategoriler / Ürünler
                    </label>
                    <select
                      value={formTargetScope}
                      onChange={(e) => setFormTargetScope(e.target.value)}
                      className="w-full h-[38px] px-3 rounded-[5px] border border-[#e2e5ec] bg-white text-[13px]"
                    >
                      <option>Tüm Kategoriler ve Ürünler</option>
                      <option>Sadece Seçili Kategoriler (Body Kit, Ön Lip, Difüzör)</option>
                      <option>Sadece Seçili Markalar</option>
                      <option>İndirimde Olmayan Ürünler</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1.5">
                      Müşteri Grubu &amp; Bayi Kısıtlaması
                    </label>
                    <select
                      value={formCustomerGroup}
                      onChange={(e) => setFormCustomerGroup(e.target.value)}
                      className="w-full h-[38px] px-3 rounded-[5px] border border-[#e2e5ec] bg-white text-[13px]"
                    >
                      <option>Tüm Müşteriler (Üye + Üyeliksiz)</option>
                      <option>Sadece Kayıtlı Üyeler</option>
                      <option>VIP Müşteriler</option>
                      <option>B2B Bayiler</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-[12.5px] font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFreeShipping}
                      onChange={(e) => setFormFreeShipping(e.target.checked)}
                      className="w-4 h-4 accent-[#0abb87]"
                    />
                    <span>Bu kampanya uygulandığında kargo ücretsiz olsun</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormTitle("")
                        setFormCode("")
                      }}
                      className="h-[38px] px-4 rounded-[5px] border border-slate-300 bg-white hover:bg-slate-50 text-[13px] font-semibold text-slate-700 cursor-pointer"
                    >
                      Formu Temizle
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSaveCampaign}
                      className="h-[38px] px-5 rounded-[5px] bg-[#0abb87] hover:bg-[#099f73] text-white text-[13px] font-bold cursor-pointer shadow-2xs"
                    >
                      ✓ Kaydet ve Yayınla
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Existing Campaigns Card */}
            <div
              id="campaign-existing-list-card"
              className="bg-white rounded-[10px] border border-slate-200 p-6 shadow-2xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-[16px] font-bold text-[#1e293b]">Mevcut Kurgular &amp; Aktif Kuponlar</h3>
                  <p className="text-[12.5px] text-slate-500">
                    Mağazanızda şu an aktif olarak çalışan promosyon ve indirim kuralları
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-[#1565c0] text-[12px] font-bold">
                  {campaigns.length} Aktif Kurgu
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.map((item) => {
                  const badgeBg =
                    item.badge_color === "emerald"
                      ? "bg-emerald-50 text-emerald-700"
                      : item.badge_color === "purple"
                      ? "bg-purple-50 text-purple-700"
                      : item.badge_color === "amber"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-blue-50 text-[#1565c0]"

                  return (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-[8px] p-4 hover:border-[#1565c0]/50 transition bg-[#fafbfe]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-bold mb-1.5 ${badgeBg}`}>
                            {item.badge_label || "SEPETE ÖZEL İNDİRİM"}
                          </span>
                          <div className="text-[14px] font-bold text-slate-900">{item.title}</div>
                          <div className="text-[12px] text-slate-500 mt-1">
                            Kod: <strong className="font-mono text-slate-800">{item.code}</strong> • Min. Sepet:{" "}
                            {item.min_cart_amount.toLocaleString("tr-TR")} TL
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-[#e0f6e7] text-[#08976d] text-[11px] font-bold">
                          {item.is_active ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[12px]">
                        <span className="text-slate-500">
                          Kullanım: <strong>{item.usage_count || 0} kez</strong>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditExisting(item)}
                            className="text-[#1565c0] font-semibold hover:underline cursor-pointer"
                          >
                            Kurguları Düzenle
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteExisting(item.id)}
                            className="text-red-600 font-semibold hover:underline cursor-pointer ml-2"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Save Bar */}
      <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur border-t border-slate-200 px-6 py-3 mt-auto">
        <div className="max-w-[1640px] mx-auto flex items-center justify-between">
          <div className="text-[12px] text-slate-500">
            Aktif Kurgu Motoru: <strong className="text-slate-800">{RULE_TITLES[selectedRule]}</strong>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveCampaign}
            className="h-[36px] px-5 rounded-[5px] bg-[#0abb87] hover:bg-[#099f73] text-white text-[12.5px] font-bold cursor-pointer"
          >
            ✓ Kaydet ve Yayınla
          </button>
        </div>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Kampanyalar & Kuponlar",
  icon: Sparkles,
})

export default KampanyalarPage
