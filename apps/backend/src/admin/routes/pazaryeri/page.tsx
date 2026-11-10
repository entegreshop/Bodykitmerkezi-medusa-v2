import React, { useEffect, useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BuildingStorefront } from "@medusajs/icons"

interface MarketplaceStore {
  id: string
  name: string
  badge: string
  color: string
  status: "Aktif" | "Pasif" | "Kurulum Bekliyor"
  sellerId: string
  apiKey: string
  apiSecret: string
  autoSyncStock: boolean
  autoSyncPrice: boolean
  autoImportOrders: boolean
  commissionRate: string
  syncedProducts: number
  lastSync: string
}

const INITIAL_MARKETPLACES: MarketplaceStore[] = [
  {
    id: "trendyol",
    name: "Trendyol",
    badge: "TY",
    color: "#f27a1a",
    status: "Aktif",
    sellerId: "104829",
    apiKey: "••••••••••••••••",
    apiSecret: "••••••••••••••••",
    autoSyncStock: true,
    autoSyncPrice: true,
    autoImportOrders: true,
    commissionRate: "18",
    syncedProducts: 124,
    lastSync: "10 dk önce",
  },
  {
    id: "hepsiburada",
    name: "Hepsiburada",
    badge: "HB",
    color: "#ff6000",
    status: "Aktif",
    sellerId: "bodykitmerkezi_hb",
    apiKey: "••••••••••••••••",
    apiSecret: "••••••••••••••••",
    autoSyncStock: true,
    autoSyncPrice: true,
    autoImportOrders: true,
    commissionRate: "15",
    syncedProducts: 98,
    lastSync: "25 dk önce",
  },
  {
    id: "n11",
    name: "N11",
    badge: "N11",
    color: "#5d3ebc",
    status: "Aktif",
    sellerId: "bodykit_n11",
    apiKey: "••••••••••••••••",
    apiSecret: "••••••••••••••••",
    autoSyncStock: true,
    autoSyncPrice: false,
    autoImportOrders: true,
    commissionRate: "14",
    syncedProducts: 86,
    lastSync: "1 saat önce",
  },
  {
    id: "pazarama",
    name: "Pazarama",
    badge: "PZ",
    color: "#e11d48",
    status: "Kurulum Bekliyor",
    sellerId: "",
    apiKey: "",
    apiSecret: "",
    autoSyncStock: false,
    autoSyncPrice: false,
    autoImportOrders: false,
    commissionRate: "12",
    syncedProducts: 0,
    lastSync: "-",
  },
  {
    id: "ciceksepeti",
    name: "Çiçeksepeti",
    badge: "ÇS",
    color: "#0284c7",
    status: "Kurulum Bekliyor",
    sellerId: "",
    apiKey: "",
    apiSecret: "",
    autoSyncStock: false,
    autoSyncPrice: false,
    autoImportOrders: false,
    commissionRate: "15",
    syncedProducts: 0,
    lastSync: "-",
  },
  {
    id: "amazon",
    name: "Amazon Türkiye",
    badge: "AMZ",
    color: "#0f172a",
    status: "Kurulum Bekliyor",
    sellerId: "",
    apiKey: "",
    apiSecret: "",
    autoSyncStock: false,
    autoSyncPrice: false,
    autoImportOrders: false,
    commissionRate: "12",
    syncedProducts: 0,
    lastSync: "-",
  },
]

const PazaryeriPage = () => {
  const [activeTab, setActiveTab] = useState<string>("magazalar")
  const [lastSyncedSearch, setLastSyncedSearch] = useState<string>("")
  const [stores, setStores] = useState<MarketplaceStore[]>(INITIAL_MARKETPLACES)
  const [editingStore, setEditingStore] = useState<MarketplaceStore | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window === "undefined") return
      const currentSearch = window.location.search
      setLastSyncedSearch((prev) => {
        if (prev === currentSearch) return prev
        const params = new URLSearchParams(currentSearch)
        const tabParam = params.get("tab")
        if (
          tabParam &&
          [
            "magazalar",
            "fiyat-rekabeti",
            "icerik-eslestirmeleri",
            "urun-gonderimleri",
            "urun-eslestirmeleri",
          ].includes(tabParam)
        ) {
          setActiveTab(tabParam)
        } else if (!tabParam) {
          setActiveTab("magazalar")
        }
        return currentSearch
      })
    }
    syncFromUrl()
    window.addEventListener("popstate", syncFromUrl)
    const interval = setInterval(syncFromUrl, 250)
    return () => {
      window.removeEventListener("popstate", syncFromUrl)
      clearInterval(interval)
    }
  }, [])

  const handleSaveStore = () => {
    if (!editingStore) return
    setStores((prev) =>
      prev.map((s) => (s.id === editingStore.id ? editingStore : s))
    )
    setEditingStore(null)
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 md:p-8 text-slate-800">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
        {/* 1. MAĞAZALAR */}
        {activeTab === "magazalar" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  Pazaryeri Mağazaları
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Trendyol, Hepsiburada, N11, Pazarama ve diğer pazaryeri mağaza API bağlantılarını yönetin.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Mağaza ara..."
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {stores
                .filter((s) =>
                  s.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((store) => (
                  <div
                    key={store.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          style={{ backgroundColor: store.color }}
                          className="w-11 h-11 rounded-xl text-white font-extrabold text-sm flex items-center justify-center shadow-xs"
                        >
                          {store.badge}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            {store.name}
                          </h3>
                          <span className="text-[11px] text-slate-500">
                            Satıcı ID: {store.sellerId || "Tanımlanmadı"}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          store.status === "Aktif"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {store.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-lg p-3 border border-slate-100 text-center">
                      <div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase">
                          Eşleşen Ürün
                        </div>
                        <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                          {store.syncedProducts}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase">
                          Komisyon
                        </div>
                        <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                          %{store.commissionRate}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase">
                          Son Senk.
                        </div>
                        <div className="text-xs font-bold text-slate-700 mt-1">
                          {store.lastSync}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            store.autoSyncStock ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        />
                        Stok & Fiyat Senk.
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingStore({ ...store })}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Ayarlar
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 2. FİYAT REKABETİ ANALİZİ */}
        {activeTab === "fiyat-rekabeti" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Fiyat Rekabeti Analizi (Buybox Takibi)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pazaryerlerindeki ürünlerinizin rakip fiyatlarını ve Buybox durumunu anlık takip edin.
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Buybox Fiyatlarını Şimdi Tara
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase bg-slate-50">
                    <th className="py-3 px-4">Ürün Adı</th>
                    <th className="py-3 px-4">Pazaryeri</th>
                    <th className="py-3 px-4">Sizin Fiyatınız</th>
                    <th className="py-3 px-4">En Düşük Rakip</th>
                    <th className="py-3 px-4">Buybox Durumu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      Peugeot 301 Makyajsız Body Kit Uyumlu Seti Plastik
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-orange-600">
                      Trendyol
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₺7.750,00
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">
                      ₺7.890,00
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                        Buybox Sizde
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      Fiat Linea Makyajsız Body Kit Seti Plastik
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-orange-600">
                      Hepsiburada
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₺6.999,00
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-rose-600">
                      ₺6.850,00
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px]">
                        Rakip Önde (-₺149)
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      Volkswagen Golf 6 Uyumlu Body Kit Seti Plastik
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-purple-700">
                      N11
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₺6.999,00
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">
                      ₺7.150,00
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                        Buybox Sizde
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. İÇERİK EŞLEŞTİRMELERİ */}
        {activeTab === "icerik-eslestirmeleri" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  İçerik Eşleştirmeleri (Kategori & Nitelik Eşleştirme)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mağaza kategorilerinizi ve ürün niteliklerinizi pazaryeri kategori ağacıyla eşleştirin.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  localCat: "Body Kit Setleri",
                  tyCat: "Otomotiv > Oto Dış Aksesuar > Body Kit",
                  hbCat: "Oto Aksesuar > Tuning > Body Kit",
                  status: "Eşleşti",
                },
                {
                  localCat: "Ön Tampon Ekleri (Lip)",
                  tyCat: "Otomotiv > Oto Dış Aksesuar > Tampon & Ekleri",
                  hbCat: "Oto Aksesuar > Tuning > Ön Tampon Lip",
                  status: "Eşleşti",
                },
                {
                  localCat: "Spoiler & Kanat",
                  tyCat: "Otomotiv > Oto Dış Aksesuar > Spoiler",
                  hbCat: "Oto Aksesuar > Tuning > Spoiler",
                  status: "Eşleşti",
                },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">
                      {row.localCat}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                      {row.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <strong>Trendyol:</strong> {row.tyCat}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <strong>Hepsiburada:</strong> {row.hbCat}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. ÜRÜN GÖNDERİMLERİ */}
        {activeTab === "urun-gonderimleri" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Pazaryeri Ürün Gönderimleri
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pazaryerlerine toplu ürün, fiyat ve stok aktarım kuyruğunu yönetin.
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                Tüm Pazaryerlerine Stok & Fiyat Gönder
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase bg-slate-50">
                    <th className="py-3 px-4">Gönderim No</th>
                    <th className="py-3 px-4">Hedef Mağaza</th>
                    <th className="py-3 px-4">İşlem Tipi</th>
                    <th className="py-3 px-4">Ürün Sayısı</th>
                    <th className="py-3 px-4">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  <tr>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      #BATCH-9482
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      Trendyol
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      Stok ve Fiyat Güncelleme
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      124 Ürün
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                        Tamamlandı
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      #BATCH-9481
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      Hepsiburada
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      Yeni Ürün Aktarımı
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      98 Ürün
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                        Tamamlandı
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. ÜRÜN EŞLEŞTİRMELERİ */}
        {activeTab === "urun-eslestirmeleri" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Pazaryeri Ürün Eşleştirmeleri
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sitenizdeki ürünler ile pazaryerlerindeki barkod ve stok kodlarının (SKU) eşleşme durumu.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase bg-slate-50">
                    <th className="py-3 px-4">Ürün Adı</th>
                    <th className="py-3 px-4">Stok Kodu (SKU)</th>
                    <th className="py-3 px-4">Trendyol</th>
                    <th className="py-3 px-4">Hepsiburada</th>
                    <th className="py-3 px-4">N11</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      Peugeot 301 Makyajsız Body Kit Uyumlu Seti Plastik
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      BKM-P301-SET
                    </td>
                    <td className="py-3.5 px-4 text-emerald-600 font-bold">
                      ✓ Eşleşti
                    </td>
                    <td className="py-3.5 px-4 text-emerald-600 font-bold">
                      ✓ Eşleşti
                    </td>
                    <td className="py-3.5 px-4 text-emerald-600 font-bold">
                      ✓ Eşleşti
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      Fiat Linea Makyajsız Body Kit Seti Plastik
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      BKM-LINEA-SET
                    </td>
                    <td className="py-3.5 px-4 text-emerald-600 font-bold">
                      ✓ Eşleşti
                    </td>
                    <td className="py-3.5 px-4 text-emerald-600 font-bold">
                      ✓ Eşleşti
                    </td>
                    <td className="py-3.5 px-4 text-emerald-600 font-bold">
                      ✓ Eşleşti
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      Volkswagen Golf 6 Uyumlu Body Kit Seti Plastik
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      BKM-GOLF6-SET
                    </td>
                    <td className="py-3.5 px-4 text-emerald-600 font-bold">
                      ✓ Eşleşti
                    </td>
                    <td className="py-3.5 px-4 text-emerald-600 font-bold">
                      ✓ Eşleşti
                    </td>
                    <td className="py-3.5 px-4 text-emerald-600 font-bold">
                      ✓ Eşleşti
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Store API Modal */}
      {editingStore && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingStore.name} API Bağlantı Ayarları
              </h3>
              <button
                type="button"
                onClick={() => setEditingStore(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Satıcı ID (Supplier / Merchant ID)
                </label>
                <input
                  type="text"
                  value={editingStore.sellerId}
                  onChange={(e) =>
                    setEditingStore({ ...editingStore, sellerId: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  API Key
                </label>
                <input
                  type="text"
                  value={editingStore.apiKey}
                  onChange={(e) =>
                    setEditingStore({ ...editingStore, apiKey: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  API Secret
                </label>
                <input
                  type="password"
                  value={editingStore.apiSecret}
                  onChange={(e) =>
                    setEditingStore({ ...editingStore, apiSecret: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Komisyon Oranı (%)
                  </label>
                  <input
                    type="text"
                    value={editingStore.commissionRate}
                    onChange={(e) =>
                      setEditingStore({
                        ...editingStore,
                        commissionRate: e.target.value,
                      })
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mağaza Durumu
                  </label>
                  <select
                    value={editingStore.status}
                    onChange={(e) =>
                      setEditingStore({
                        ...editingStore,
                        status: e.target.value as MarketplaceStore["status"],
                      })
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold bg-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Pasif">Pasif</option>
                    <option value="Kurulum Bekliyor">Kurulum Bekliyor</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingStore(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSaveStore}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Pazaryeri",
  icon: BuildingStorefront,
})

export default PazaryeriPage
