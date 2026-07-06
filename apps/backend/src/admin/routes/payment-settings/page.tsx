import { useState, useEffect } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CreditCard, CheckCircle, Plus, Trash, ArrowPath, Sparkles } from "@medusajs/icons"

interface Installment {
  taksit: string
  oran: number
  active: boolean
}

interface PaymentConfig {
  free_shipping_threshold: number
  paytr: {
    active: boolean
    min_total: number
    max_total: number
    merchant_id: string
    merchant_key: string
    merchant_salt: string
    test_mode: string
    disable_3d_secure_intl: boolean
    installments: Installment[]
  }
  bank_transfer: {
    active: boolean
    name: string
    adjustment_type: string
    adjustment_value: number
    instructions: string
    min_total: number
    max_total: number
  }
  cash_on_delivery: {
    active: boolean
    name: string
    adjustment_type: string
    adjustment_value: number
    instructions: string
    min_total: number
    max_total: number
  }
  card_on_delivery: {
    active: boolean
    name: string
    adjustment_type: string
    adjustment_value: number
    instructions: string
    min_total: number
    max_total: number
  }
}

const defaultInstallments: Installment[] = [
  { taksit: "Tek Çekim", oran: 0, active: true },
  { taksit: "2 Taksit", oran: 7.31, active: true },
  { taksit: "3 Taksit", oran: 9.35, active: true },
  { taksit: "4 Taksit", oran: 11.38, active: true },
  { taksit: "5 Taksit", oran: 13.43, active: true },
  { taksit: "6 Taksit", oran: 15.46, active: true },
  { taksit: "7 Taksit", oran: 17.49, active: true },
  { taksit: "8 Taksit", oran: 18.53, active: true },
  { taksit: "9 Taksit", oran: 21.58, active: true },
  { taksit: "10 Taksit", oran: 23.8, active: true },
  { taksit: "11 Taksit", oran: 25.84, active: true },
  { taksit: "12 Taksit", oran: 27.68, active: true }
]

const initialConfig: PaymentConfig = {
  free_shipping_threshold: 3000,
  paytr: {
    active: true,
    min_total: 0,
    max_total: 100000,
    merchant_id: "647433",
    merchant_key: "Xon89DCuBQGLIM7",
    merchant_salt: "tXX2UJMk5CZrBke4",
    test_mode: "Kapalı",
    disable_3d_secure_intl: false,
    installments: defaultInstallments
  },
  bank_transfer: {
    active: true,
    name: "Havale / EFT",
    adjustment_type: "discount_percentage",
    adjustment_value: 5,
    instructions: "Havale - EFT ile şimdi ödemeyi gönder. Sonra siparişi tamamla...\n\nÖdeme Bilgileri\nTR77 0011 1000 0000 0146 7748 72\n\nHesap Sahibi: NUH ŞAHİN\nHesap Bilgisi: Finans Bank",
    min_total: 0,
    max_total: 100000
  },
  cash_on_delivery: {
    active: true,
    name: "Kapıda Ödeme (Nakit)",
    adjustment_type: "surcharge_amount",
    adjustment_value: 40,
    instructions: "Kapıda nakit ödeme ile teslimat sırasında ödemenizi yapabilirsiniz.",
    min_total: 0,
    max_total: 10000
  },
  card_on_delivery: {
    active: true,
    name: "Kapıda Ödeme (Kredi Kartı)",
    adjustment_type: "surcharge_amount",
    adjustment_value: 40,
    instructions: "Kapıda kredi kartı ödemesi ile teslimat sırasında kartınızla ödemenizi yapabilirsiniz.",
    min_total: 0,
    max_total: 10000
  }
}

const PaymentSettingsPage = () => {
  const [config, setConfig] = useState<PaymentConfig>(initialConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  // Sub-views: "list" | "paytr" | "bank_transfer" | "cash_on_delivery" | "card_on_delivery"
  const [currentView, setCurrentView] = useState<"list" | "paytr" | "bank_transfer" | "cash_on_delivery" | "card_on_delivery">("list")

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

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/admin/payment-settings")
        const data = await res.json()
        if (data && data.config) {
          setConfig(data.config)
        }
      } catch (err) {
        console.error("Failed to load payment configuration:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  const handleSave = async (updatedConfig = config) => {
    setSaving(true)
    setToastMessage("")
    try {
      const res = await fetch("/admin/payment-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedConfig),
      })
      const data = await res.json()
      if (data && data.success) {
        setToastMessage("Ödeme ayarları başarıyla kaydedildi! ✔")
        setConfig(data.config)
        setTimeout(() => setToastMessage(""), 4000)
        setCurrentView("list")
      } else {
        alert("Ayarlar kaydedilirken hata oluştu.")
      }
    } catch (err) {
      console.error("Error saving config:", err)
      alert("Bağlantı hatası oluştu.")
    } finally {
      setSaving(false)
    }
  }

  const handleInstallmentToggle = (index: number) => {
    const newInstallments = [...config.paytr.installments]
    newInstallments[index].active = !newInstallments[index].active
    setConfig({
      ...config,
      paytr: {
        ...config.paytr,
        installments: newInstallments
      }
    })
  }

  const handleAllInstallmentsToggle = (active: boolean) => {
    const newInstallments = config.paytr.installments.map(ins => ({ ...ins, active }))
    setConfig({
      ...config,
      paytr: {
        ...config.paytr,
        installments: newInstallments
      }
    })
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-zinc-500">Yükleniyor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-50 min-h-screen text-zinc-900 custom-admin-wrapper">
      <style>{`
        .custom-admin-wrapper {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
          text-rendering: optimizeLegibility !important;
        }
        
        .custom-admin-wrapper * {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        }
      `}</style>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-lg animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ----------------- DETAIL VIEW: BLACK NAVIGATION BAR (Images 3, 4, 5) ----------------- */}
      {currentView !== "list" && (
        <div className="bg-zinc-950 text-white px-8 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-x-2">
            <button 
              onClick={() => setCurrentView("list")}
              className="text-zinc-400 hover:text-white transition-colors text-sm font-semibold"
            >
              ← Ödeme Ayarları
            </button>
            <span className="text-zinc-600">/</span>
            <span className="text-sm font-bold">
              {currentView === "paytr" && "PayTR"}
              {currentView === "bank_transfer" && "Havale / EFT"}
              {currentView === "cash_on_delivery" && "Kapıda Ödeme (Nakit)"}
              {currentView === "card_on_delivery" && "Kapıda Ödeme (Kredi Kartı)"}
            </span>
          </div>
          <div className="flex items-center gap-x-3">
            <button 
              onClick={() => setCurrentView("list")}
              className="px-4 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 transition-colors"
            >
              Vazgeç
            </button>
            <button 
              onClick={() => handleSave()}
              disabled={saving}
              className="px-5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white shadow-sm transition-all"
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-8">
        
        {/* ----------------- VIEW 1: MAIN LIST VIEW (Image 1) ----------------- */}
        {currentView === "list" && (
          <div className="flex flex-col gap-y-8">
            
            {/* Header Block */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-violet-600 text-white shadow-md">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Ödeme Yöntemleri</h1>
                  <p className="text-xs text-zinc-500 font-semibold mt-0.5">Ödeme yöntemlerini ekleyebilir ve ödeme adımındaki sıralarını ayarlayabilirsiniz.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-bold transition-all">
                  ⇅ Önizleme ve Sıralama
                </button>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-sm transition-all">
                  Ödeme Yöntemi Ekle
                </button>
              </div>
            </div>

            {/* Global Settings: Free Shipping Threshold */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-y-4">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-x-2">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                Genel Kargo Ayarları
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider">Belli Bir Ücret Üzeri Ücretsiz Kargo Limiti (TL)</label>
                  <div className="flex items-center gap-x-2">
                    <input
                      type="number"
                      value={config.free_shipping_threshold}
                      onChange={(e) => setConfig({ ...config, free_shipping_threshold: Number(e.target.value) })}
                      className="w-48 px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:border-violet-500 text-xs font-bold text-zinc-900"
                    />
                    <span className="text-xs font-semibold text-zinc-400">TL</span>
                    <button 
                      onClick={() => handleSave()}
                      className="ml-auto bg-zinc-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      Limiti Güncelle
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods Table */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="grid grid-cols-[1fr_180px_120px] bg-zinc-50 text-zinc-500 font-extrabold text-[10px] uppercase tracking-wider py-3.5 px-6 border-b border-zinc-200">
                <span>Ödeme Yöntemleri</span>
                <span>Acil Durum</span>
                <span>Durum</span>
              </div>
              
              <div className="divide-y divide-zinc-200">
                {/* 1. PayTR */}
                <div 
                  onClick={() => setCurrentView("paytr")}
                  className="grid grid-cols-[1fr_180px_120px] items-center py-5 px-6 hover:bg-zinc-50/75 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-x-4">
                    <div className="w-12 h-12 rounded-lg border border-zinc-200 bg-white flex items-center justify-center font-bold text-xs text-blue-600 shadow-sm">
                      PayTR
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">PayTR</h4>
                      <p className="text-xs text-zinc-400 font-semibold mt-0.5">Ödeme Altyapı Sağlayıcı</p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400 font-semibold">-</span>
                  <div>
                    <span className={`inline-flex items-center gap-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${config.paytr.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-100 text-zinc-500 border border-zinc-200"}`}>
                      ● {config.paytr.active ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                </div>

                {/* 2. Havale / EFT */}
                <div 
                  onClick={() => setCurrentView("bank_transfer")}
                  className="grid grid-cols-[1fr_180px_120px] items-center py-5 px-6 hover:bg-zinc-50/75 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-x-4">
                    <div className="w-12 h-12 rounded-lg border border-zinc-200 bg-white flex items-center justify-center font-bold text-xs text-zinc-700 shadow-sm">
                      🏦
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">{config.bank_transfer.name}</h4>
                      <p className="text-xs text-zinc-400 font-semibold mt-0.5">Ödeme Yöntemi {config.bank_transfer.adjustment_value > 0 && `(Ek indirim: %${config.bank_transfer.adjustment_value})`}</p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400 font-semibold">-</span>
                  <div>
                    <span className={`inline-flex items-center gap-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${config.bank_transfer.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-100 text-zinc-500 border border-zinc-200"}`}>
                      ● {config.bank_transfer.active ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                </div>

                {/* 3. Kapıda Ödeme (Nakit) */}
                <div 
                  onClick={() => setCurrentView("cash_on_delivery")}
                  className="grid grid-cols-[1fr_180px_120px] items-center py-5 px-6 hover:bg-zinc-50/75 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-x-4">
                    <div className="w-12 h-12 rounded-lg border border-zinc-200 bg-white flex items-center justify-center font-bold text-xs text-zinc-700 shadow-sm">
                      💵
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">{config.cash_on_delivery.name}</h4>
                      <p className="text-xs text-zinc-400 font-semibold mt-0.5">Ödeme Yöntemi {config.cash_on_delivery.adjustment_value > 0 && `(Ek ücret: ₺${config.cash_on_delivery.adjustment_value})`}</p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400 font-semibold">-</span>
                  <div>
                    <span className={`inline-flex items-center gap-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${config.cash_on_delivery.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-100 text-zinc-500 border border-zinc-200"}`}>
                      ● {config.cash_on_delivery.active ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                </div>

                {/* 4. Kapıda Ödeme (Kredi Kartı) */}
                <div 
                  onClick={() => setCurrentView("card_on_delivery")}
                  className="grid grid-cols-[1fr_180px_120px] items-center py-5 px-6 hover:bg-zinc-50/75 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-x-4">
                    <div className="w-12 h-12 rounded-lg border border-zinc-200 bg-white flex items-center justify-center font-bold text-xs text-zinc-700 shadow-sm">
                      💳
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">{config.card_on_delivery.name}</h4>
                      <p className="text-xs text-zinc-400 font-semibold mt-0.5">Ödeme Yöntemi {config.card_on_delivery.adjustment_value > 0 && `(Ek ücret: ₺${config.card_on_delivery.adjustment_value})`}</p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400 font-semibold">-</span>
                  <div>
                    <span className={`inline-flex items-center gap-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${config.card_on_delivery.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-100 text-zinc-500 border border-zinc-200"}`}>
                      ● {config.card_on_delivery.active ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Empty State / Bottom Block (Image 1) */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm flex flex-col items-center justify-center text-center gap-y-4">
              <h3 className="text-lg font-bold text-zinc-900">Ödeme Ayarları</h3>
              <div className="w-24 h-20 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-center text-zinc-300 text-4xl shadow-inner">
                💳
              </div>
              <p className="text-xs text-zinc-400 font-semibold max-w-sm">
                Henüz ödeme ayarlarınızı belirlemediniz. Ödeme ayarları sayesinde, sepet ve müşteri koşullarına göre ödeme yöntemini gizleyebilir ve taksit sınırlandırabilirsiniz.
              </p>
              <button className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white shadow-sm transition-all mt-2">
                Ödeme Ayarı Ekle
              </button>
            </div>

          </div>
        )}

        {/* ----------------- VIEW 2: PAYTR DETAIL VIEW (Image 2) ----------------- */}
        {currentView === "paytr" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            <div className="flex flex-col gap-y-6">
              
              {/* PayTR Integration Settings */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <h3 className="text-sm font-semibold text-zinc-900">PayTR Entegrasyon Bilgileri</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-500">Merchant Id</label>
                    <input 
                      type="text"
                      placeholder="Merchant ID giriniz"
                      value={config.paytr.merchant_id || ""}
                      onChange={(e) => setConfig({
                        ...config,
                        paytr: { ...config.paytr, merchant_id: e.target.value }
                      })}
                      className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-sm font-normal text-zinc-900 shadow-sm focus:outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 transition-all placeholder-zinc-400"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-500">Merchant Key</label>
                    <input 
                      type="text"
                      placeholder="Merchant Key giriniz"
                      value={config.paytr.merchant_key || ""}
                      onChange={(e) => setConfig({
                        ...config,
                        paytr: { ...config.paytr, merchant_key: e.target.value }
                      })}
                      className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-sm font-normal text-zinc-900 shadow-sm focus:outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 transition-all placeholder-zinc-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-500">Merchant Salt</label>
                    <input 
                      type="text"
                      placeholder="Merchant Salt giriniz"
                      value={config.paytr.merchant_salt || ""}
                      onChange={(e) => setConfig({
                        ...config,
                        paytr: { ...config.paytr, merchant_salt: e.target.value }
                      })}
                      className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-sm font-normal text-zinc-900 shadow-sm focus:outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 transition-all placeholder-zinc-400"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-500">Test Modu</label>
                    <select 
                      value={config.paytr.test_mode || "Kapalı"}
                      onChange={(e) => setConfig({
                        ...config,
                        paytr: { ...config.paytr, test_mode: e.target.value }
                      })}
                      className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-sm font-normal text-zinc-900 shadow-sm focus:outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_10px_center] bg-[size:16px_16px] bg-no-repeat cursor-pointer"
                    >
                      <option value="Kapalı">Kapalı</option>
                      <option value="Açık">Açık</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-x-2.5 mt-2">
                  <input 
                    type="checkbox"
                    id="disable_3d_secure_intl"
                    checked={config.paytr.disable_3d_secure_intl || false}
                    onChange={(e) => setConfig({
                      ...config,
                      paytr: { ...config.paytr, disable_3d_secure_intl: e.target.checked }
                    })}
                    className="w-4 h-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 accent-violet-600 cursor-pointer"
                  />
                  <label htmlFor="disable_3d_secure_intl" className="text-xs text-zinc-500 font-semibold select-none cursor-pointer">
                    Yurtdışı kartlar için 3D Secure kapatılsın. (Açmadan önce lütfen Destek Ekibimiz ile iletişime geçin.)
                  </label>
                </div>
              </div>

              {/* Active Countries */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900">Aktif Ülkeleri Düzenle</h3>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Aktif Bölgeler</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-semibold text-zinc-800">
                    <option>Türkiye (TRY)</option>
                  </select>
                </div>
              </div>

              {/* Installments Table */}
              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Taksit ve Oranlar</h3>
                    <p className="text-xs text-zinc-400 font-semibold mt-0.5">Taksit sayılarını ve oranlarını tamamen kendi tercihlerinize göre belirleyebilirsiniz.</p>
                  </div>
                  <label className="flex items-center gap-x-2 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={config.paytr.installments.every(i => i.active)}
                      onChange={(e) => handleAllInstallmentsToggle(e.target.checked)}
                      className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 accent-violet-600"
                    />
                    <span className="text-xs font-bold text-zinc-700">Tümü Aktif</span>
                  </label>
                </div>

                <div className="grid grid-cols-[1fr_120px_120px_120px_100px] bg-zinc-50 text-zinc-500 font-extrabold text-[10px] uppercase tracking-wider py-3 px-6 border-b border-zinc-200 text-left">
                  <span>Taksit</span>
                  <span>Oran</span>
                  <span>Müşteri Ödeyeceği</span>
                  <span>Yatacak Tutar</span>
                  <span>Durum</span>
                </div>

                <div className="divide-y divide-zinc-200">
                  {config.paytr.installments.map((item, idx) => {
                    const multiplier = 1 + (item.oran / 100);
                    const paidAmount = 100 * multiplier;
                    return (
                      <div key={idx} className="grid grid-cols-[1fr_120px_120px_120px_100px] items-center py-4 px-6 text-xs font-semibold text-zinc-900">
                        <span>{item.taksit}</span>
                        <div className="flex items-center gap-x-1">
                          <span className="text-zinc-400">%</span>
                          <input 
                            type="number"
                            step="0.01"
                            value={item.oran}
                            onChange={(e) => {
                              const newInstallments = [...config.paytr.installments]
                              newInstallments[idx].oran = Number(e.target.value)
                              setConfig({
                                ...config,
                                paytr: { ...config.paytr, installments: newInstallments }
                              })
                            }}
                            className="w-16 px-1.5 py-1 rounded border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:border-violet-500"
                          />
                        </div>
                        <span className="text-zinc-600">₺ {paidAmount.toFixed(2)}</span>
                        <span className="text-zinc-600">₺ 100.00</span>
                        <div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={item.active}
                              onChange={() => handleInstallmentToggle(idx)}
                              className="sr-only peer" 
                            />
                            <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
                            <span className="ml-2 text-xs font-bold text-zinc-500">{item.active ? "Aktif" : "Pasif"}</span>
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900">Durum</h3>
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-[11px] text-emerald-800 font-semibold leading-relaxed">
                  Ödeme yöntemi şu anda aktif. Dilersen durumunu aşağıdan değiştirebilirsin.
                </div>
                <select 
                  value={config.paytr.active ? "active" : "inactive"}
                  onChange={(e) => setConfig({ ...config, paytr: { ...config.paytr, active: e.target.value === "active" } })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-800"
                >
                  <option value="active">✓ Aktif</option>
                  <option value="inactive">✕ Pasif</option>
                </select>
              </div>

              {/* Limits Card */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <h3 className="text-sm font-bold text-zinc-900">Ödeme Limitleri</h3>
                  <div className="w-8 h-4 bg-violet-600 rounded-full relative cursor-pointer">
                    <div className="w-3.5 h-3.5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm" />
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 font-semibold leading-normal">Ödeme yönteminin sepet tutarına göre hangi siparişlerde görüneceğini seçin.</p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-500">Minimum Sepet Tutarı</label>
                  <input 
                    type="number"
                    value={config.paytr.min_total}
                    onChange={(e) => setConfig({ ...config, paytr: { ...config.paytr, min_total: Number(e.target.value) } })}
                    className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-sm font-normal text-zinc-900 shadow-sm focus:outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-500">Maksimum Sepet Tutarı</label>
                  <input 
                    type="number"
                    value={config.paytr.max_total}
                    onChange={(e) => setConfig({ ...config, paytr: { ...config.paytr, max_total: Number(e.target.value) } })}
                    className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-sm font-normal text-zinc-900 shadow-sm focus:outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- VIEW 3: HAVALE / EFT DETAIL VIEW (Image 3) ----------------- */}
        {currentView === "bank_transfer" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            <div className="flex flex-col gap-y-6">
              
              {/* Order Adjustment Card */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900">Sipariş Tutarı Değişimi</h3>
                <div className="flex items-center gap-3">
                  <select 
                    value={config.bank_transfer.adjustment_type}
                    onChange={(e) => setConfig({ ...config, bank_transfer: { ...config.bank_transfer, adjustment_type: e.target.value } })}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-800"
                  >
                    <option value="discount_percentage">Sipariş tutarından çıkar (İndirim)</option>
                    <option value="surcharge_amount">Sipariş tutarına ekle (Komisyon/Ek Ücret)</option>
                    <option value="none">Değişiklik Yapma</option>
                  </select>
                  <select className="w-20 px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-800">
                    <option>%</option>
                    <option>₺</option>
                  </select>
                  <input 
                    type="number"
                    value={config.bank_transfer.adjustment_value}
                    onChange={(e) => setConfig({ ...config, bank_transfer: { ...config.bank_transfer, adjustment_value: Number(e.target.value) } })}
                    className="w-24 px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900"
                  />
                </div>
              </div>

              {/* Bank Details Textarea */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900">Banka Hesap Bilgileri / Açıklama</h3>
                <textarea 
                  rows={8}
                  value={config.bank_transfer.instructions}
                  onChange={(e) => setConfig({ ...config, bank_transfer: { ...config.bank_transfer, instructions: e.target.value } })}
                  className="w-full p-4 rounded-lg border border-zinc-300 text-xs font-semibold text-zinc-800 font-mono resize-none focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Email Templates Mock cards */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Havale / EFT E-posta Taslağı</h4>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Müşteriye giden e-postayı özelleştirebilirsiniz.</p>
                </div>
                <button className="px-4 py-1.5 rounded-lg border border-zinc-200 text-[10px] font-bold text-zinc-700 hover:bg-zinc-50 transition-colors">
                  Taslağı Düzenle
                </button>
              </div>

              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Havale Ödeme Onay E-posta Taslağı</h4>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Havale onaylandığında müşteriye giden e-posta.</p>
                </div>
                <button className="px-4 py-1.5 rounded-lg border border-zinc-200 text-[10px] font-bold text-zinc-700 hover:bg-zinc-50 transition-colors">
                  Taslağı Düzenle
                </button>
              </div>

            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900">Durum</h3>
                <select 
                  value={config.bank_transfer.active ? "active" : "inactive"}
                  onChange={(e) => setConfig({ ...config, bank_transfer: { ...config.bank_transfer, active: e.target.value === "active" } })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-800"
                >
                  <option value="active">✓ Aktif</option>
                  <option value="inactive">✕ Pasif</option>
                </select>
              </div>

              {/* Method Name */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-2">
                <h3 className="text-sm font-bold text-zinc-900">Ödeme Yöntemi Adı</h3>
                <input 
                  type="text"
                  value={config.bank_transfer.name}
                  onChange={(e) => setConfig({ ...config, bank_transfer: { ...config.bank_transfer, name: e.target.value } })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900"
                />
              </div>

              {/* Limits Card */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">Ödeme Limitleri</h3>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Minimum Sepet Tutarı</label>
                  <input 
                    type="number"
                    value={config.bank_transfer.min_total}
                    onChange={(e) => setConfig({ ...config, bank_transfer: { ...config.bank_transfer, min_total: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Maksimum Sepet Tutarı</label>
                  <input 
                    type="number"
                    value={config.bank_transfer.max_total}
                    onChange={(e) => setConfig({ ...config, bank_transfer: { ...config.bank_transfer, max_total: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- VIEW 4: KAPIDA ÖDEME (NAKİT) DETAIL VIEW (Image 4) ----------------- */}
        {currentView === "cash_on_delivery" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            <div className="flex flex-col gap-y-6">
              
              {/* Order Adjustment Card */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900">Sipariş Tutarı Değişimi (Hizmet Bedeli)</h3>
                <div className="flex items-center gap-3">
                  <select 
                    value={config.cash_on_delivery.adjustment_type}
                    onChange={(e) => setConfig({ ...config, cash_on_delivery: { ...config.cash_on_delivery, adjustment_type: e.target.value } })}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-800"
                  >
                    <option value="surcharge_amount">Sipariş tutarına ekle (Ek Ücret)</option>
                    <option value="none">Değişiklik Yapma</option>
                  </select>
                  <select className="w-20 px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-800">
                    <option>₺</option>
                    <option>%</option>
                  </select>
                  <input 
                    type="number"
                    value={config.cash_on_delivery.adjustment_value}
                    onChange={(e) => setConfig({ ...config, cash_on_delivery: { ...config.cash_on_delivery, adjustment_value: Number(e.target.value) } })}
                    className="w-24 px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900"
                  />
                </div>
              </div>

              {/* Description Textarea */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900">Açıklama</h3>
                <textarea 
                  rows={6}
                  value={config.cash_on_delivery.instructions}
                  onChange={(e) => setConfig({ ...config, cash_on_delivery: { ...config.cash_on_delivery, instructions: e.target.value } })}
                  className="w-full p-4 rounded-lg border border-zinc-300 text-xs font-semibold text-zinc-800 resize-none focus:outline-none focus:border-violet-500"
                />
              </div>

            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900">Durum</h3>
                <select 
                  value={config.cash_on_delivery.active ? "active" : "inactive"}
                  onChange={(e) => setConfig({ ...config, cash_on_delivery: { ...config.cash_on_delivery, active: e.target.value === "active" } })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-800"
                >
                  <option value="active">✓ Aktif</option>
                  <option value="inactive">✕ Pasif</option>
                </select>
              </div>

              {/* Method Name */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-2">
                <h3 className="text-sm font-bold text-zinc-900">Ödeme Yöntemi Adı</h3>
                <input 
                  type="text"
                  value={config.cash_on_delivery.name}
                  onChange={(e) => setConfig({ ...config, cash_on_delivery: { ...config.cash_on_delivery, name: e.target.value } })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900"
                />
              </div>

              {/* Limits Card */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">Ödeme Limitleri</h3>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Minimum Sepet Tutarı</label>
                  <input 
                    type="number"
                    value={config.cash_on_delivery.min_total}
                    onChange={(e) => setConfig({ ...config, cash_on_delivery: { ...config.cash_on_delivery, min_total: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Maksimum Sepet Tutarı</label>
                  <input 
                    type="number"
                    value={config.cash_on_delivery.max_total}
                    onChange={(e) => setConfig({ ...config, cash_on_delivery: { ...config.cash_on_delivery, max_total: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- VIEW 5: KAPIDA ÖDEME (KREDİ KARTI) DETAIL VIEW (Image 5) ----------------- */}
        {currentView === "card_on_delivery" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            <div className="flex flex-col gap-y-6">
              
              {/* Order Adjustment Card */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900">Sipariş Tutarı Değişimi (Hizmet Bedeli)</h3>
                <div className="flex items-center gap-3">
                  <select 
                    value={config.card_on_delivery.adjustment_type}
                    onChange={(e) => setConfig({ ...config, card_on_delivery: { ...config.card_on_delivery, adjustment_type: e.target.value } })}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-800"
                  >
                    <option value="surcharge_amount">Sipariş tutarına ekle (Ek Ücret)</option>
                    <option value="none">Değişiklik Yapma</option>
                  </select>
                  <select className="w-20 px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-800">
                    <option>₺</option>
                    <option>%</option>
                  </select>
                  <input 
                    type="number"
                    value={config.card_on_delivery.adjustment_value}
                    onChange={(e) => setConfig({ ...config, card_on_delivery: { ...config.card_on_delivery, adjustment_value: Number(e.target.value) } })}
                    className="w-24 px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900"
                  />
                </div>
              </div>

              {/* Description Textarea */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900">Açıklama</h3>
                <textarea 
                  rows={6}
                  value={config.card_on_delivery.instructions}
                  onChange={(e) => setConfig({ ...config, card_on_delivery: { ...config.card_on_delivery, instructions: e.target.value } })}
                  className="w-full p-4 rounded-lg border border-zinc-300 text-xs font-semibold text-zinc-800 resize-none focus:outline-none focus:border-violet-500"
                />
              </div>

            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900">Durum</h3>
                <select 
                  value={config.card_on_delivery.active ? "active" : "inactive"}
                  onChange={(e) => setConfig({ ...config, card_on_delivery: { ...config.card_on_delivery, active: e.target.value === "active" } })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-800"
                >
                  <option value="active">✓ Aktif</option>
                  <option value="inactive">✕ Pasif</option>
                </select>
              </div>

              {/* Method Name */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-2">
                <h3 className="text-sm font-bold text-zinc-900">Ödeme Yöntemi Adı</h3>
                <input 
                  type="text"
                  value={config.card_on_delivery.name}
                  onChange={(e) => setConfig({ ...config, card_on_delivery: { ...config.card_on_delivery, name: e.target.value } })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900"
                />
              </div>

              {/* Limits Card */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">Ödeme Limitleri</h3>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Minimum Sepet Tutarı</label>
                  <input 
                    type="number"
                    value={config.card_on_delivery.min_total}
                    onChange={(e) => setConfig({ ...config, card_on_delivery: { ...config.card_on_delivery, min_total: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Maksimum Sepet Tutarı</label>
                  <input 
                    type="number"
                    value={config.card_on_delivery.max_total}
                    onChange={(e) => setConfig({ ...config, card_on_delivery: { ...config.card_on_delivery, max_total: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Ödeme Yöntemleri",
  icon: CreditCard,
})

export default PaymentSettingsPage
