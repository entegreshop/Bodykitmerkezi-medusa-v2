import React, { useState, useEffect } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText, Trash, PencilSquare, Plus, Eye, MagnifyingGlass } from "@medusajs/icons"

const CustomMultiSelect = ({ options, selected, onChange, placeholder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((o: any) => o.label.toLowerCase().includes(search.toLowerCase()));

  const toggleOption = (val: string) => {
    if (val === "all") {
      if (selected.includes("all")) onChange([]);
      else onChange(["all", ...options.filter((o:any) => o.value !== "all").map((o:any) => o.value)]);
      return;
    }
    let newSelected = selected.includes(val) ? selected.filter((s: string) => s !== val) : [...selected, val];
    if (newSelected.length === options.length - 1 && !newSelected.includes("all")) newSelected.push("all");
    if (selected.includes("all") && selected.includes(val)) newSelected = newSelected.filter((s:string) => s !== "all");
    onChange(newSelected);
  };

  const selectAll = () => onChange(options.map((o: any) => o.value));
  const clearAll = () => onChange([]);

  let displayText = placeholder;
  if (selected.includes("all") || selected.length === options.length) displayText = "Tümü Seçildi";
  else if (selected.length > 0) displayText = `${selected.length} Seçildi`;

  return (
    <div className="relative w-full" ref={ref}>
      <div 
        className="w-full h-9 border border-zinc-300 rounded px-3 flex items-center justify-between cursor-pointer bg-white hover:bg-zinc-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm text-zinc-700 truncate">{displayText}</span>
        <span className="text-zinc-400 text-[10px]">▼</span>
      </div>
      
      {isOpen && (
        <div className="absolute top-10 left-0 w-full bg-white border border-zinc-200 rounded shadow-xl z-[120] flex flex-col max-h-[300px]">
          <div className="p-2 border-b border-zinc-100">
            <input 
              type="text" 
              placeholder="Arayın.." 
              className="w-full text-sm border border-zinc-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-100 text-[11px] font-medium text-zinc-600 bg-zinc-50">
            <button type="button" onClick={selectAll} className="hover:text-blue-600">Tümünü Seç</button>
            <button type="button" onClick={clearAll} className="hover:text-red-600">Temizle</button>
          </div>
          <div className="overflow-y-auto flex-1 p-1">
            {filtered.map((opt: any) => (
              <label key={opt.value} className="flex items-center gap-x-2 px-2 py-1.5 hover:bg-zinc-50 cursor-pointer rounded">
                <input 
                  type="checkbox" 
                  className="rounded border-zinc-300 w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                  checked={selected.includes(opt.value)}
                  onChange={() => toggleOption(opt.value)}
                />
                <span className="text-sm text-zinc-700">{opt.label}</span>
              </label>
            ))}
            {filtered.length === 0 && <div className="p-2 text-sm text-zinc-500 text-center">Sonuç bulunamadı</div>}
          </div>
        </div>
      )}
    </div>
  );
};

interface XmlFeedConfig {
  id: string
  name: string
  format: string
  currency: string
  language: string
  product_source: string
  categories: string[]
  brands: string
  price_type: string
  status: string
  stock_status: string
  min_stock: number
  add_barcode: string
  profit_margin: number
  hide_no_image: boolean
}

const XmlExportPage = () => {
  const [feeds, setFeeds] = useState<XmlFeedConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentFeed, setCurrentFeed] = useState<Partial<XmlFeedConfig>>({})
  const [saving, setSaving] = useState(false)
  
  const [medusaCategories, setMedusaCategories] = useState<any[]>([])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  const fetchFeeds = async () => {
    try {
      const res = await fetch("/admin/xml-export")
      const data = await res.json()
      if (data && data.feeds) {
        setFeeds(data.feeds)
      }
    } catch (err) {
      console.error("Failed to load xml feeds:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch("/admin/product-categories?limit=999")
      const data = await res.json()
      if (data && data.product_categories) {
        setMedusaCategories(data.product_categories)
      }
    } catch (err) {
      console.error("Failed to load categories:", err)
    }
  }

  useEffect(() => {
    fetchFeeds()
    fetchCategories()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/admin/xml-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentFeed),
      })
      const data = await res.json()
      if (data && data.success) {
        setFeeds(data.feeds)
        setIsModalOpen(false)
        setCurrentFeed({})
      }
    } catch (err) {
      alert("Hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return
    try {
      const res = await fetch(`/admin/xml-export/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data && data.success) {
        setFeeds(feeds.filter((f) => f.id !== id))
      }
    } catch (err) {
      alert("Silinirken hata oluştu")
    }
  }

  const openNewModal = () => {
    setCurrentFeed({
      name: "Yeni XML",
      format: "Google Merchant Katalog",
      currency: "TL",
      language: "Varsayılan",
      product_source: typeof window !== 'undefined' ? window.location.hostname : "XOOX",
      categories: [],
      brands: "Tüm Markalar",
      price_type: "Varsayılan Satış Fiyatı",
      status: "Aktif Olanlar",
      stock_status: "Stokta Olanlar",
      min_stock: -9999,
      add_barcode: "Eklensin",
      profit_margin: 0,
      hide_no_image: true,
    })
    setIsModalOpen(true)
  }

  const getFeedUrl = (id: string) => {
    // In production, you would use your actual domain e.g. https://api.fametarz.com/xml
    const baseUrl = window.location.origin
    return `${baseUrl}/xml/${id}`
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    alert("Kopyalandı!")
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-zinc-50 min-h-screen text-zinc-900 p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="relative">
            <MagnifyingGlass className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Hızlı ara.." 
              className="pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm w-64 focus:outline-blue-500 shadow-sm"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={openNewModal}
              className="px-4 py-2 bg-[#10b981] text-white font-medium rounded shadow-sm hover:bg-emerald-600 flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Yeni XML Dosyası
            </button>
            <button className="px-4 py-2 bg-[#3b82f6] text-white font-medium rounded shadow-sm hover:bg-blue-600 flex items-center gap-2 text-sm">
              <span className="font-bold">G</span>
              Google Merchant Katalog
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-zinc-100">
                <th className="p-4 w-12"><input type="checkbox" className="w-4 h-4 rounded border-zinc-300" /></th>
                <th className="py-4 pr-4 text-sm font-bold text-zinc-700 w-12">No</th>
                <th className="p-4 text-sm font-bold text-zinc-700">Adı</th>
                <th className="p-4 text-sm font-bold text-zinc-700">Format</th>
                <th className="p-4 text-sm font-bold text-zinc-700">XML Adresi</th>
                <th className="p-4 text-sm font-bold text-zinc-700 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {feeds.map((feed, idx) => (
                <tr key={feed.id} className="border-b border-zinc-100 bg-white hover:bg-zinc-50">
                  <td className="p-4"><input type="checkbox" className="w-4 h-4 rounded border-zinc-300" /></td>
                  <td className="py-4 pr-4 text-sm font-bold text-blue-600">{idx + 1}</td>
                  <td className="p-4 text-sm font-medium text-zinc-700">{feed.name}</td>
                  <td className="p-4 text-sm text-zinc-600">{feed.format}</td>
                  <td className="p-4 text-sm text-blue-600 font-medium">
                    <span className="truncate max-w-[300px] cursor-pointer hover:underline" onClick={() => copyUrl(getFeedUrl(feed.id))}>
                      {getFeedUrl(feed.id)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setCurrentFeed(feed)
                          setIsModalOpen(true)
                        }}
                        className="p-1.5 bg-[#8b5cf6] text-white rounded shadow-sm hover:bg-violet-600 transition-colors"
                        title="Düzenle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(feed.id)}
                        className="p-1.5 bg-[#ef4444] text-white rounded shadow-sm hover:bg-red-600 transition-colors"
                        title="Sil"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {feeds.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Pagination Footer */}
          <div className="bg-white p-4 flex items-center gap-4 text-sm text-zinc-500 border-t border-zinc-100">
            <select className="border border-zinc-200 rounded p-1 text-zinc-700 bg-white outline-none">
              <option>15</option>
              <option>30</option>
              <option>50</option>
            </select>
            <span>{feeds.length} kayıttan 1 ile {feeds.length} arası gösteriliyor</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[800px] flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#2563eb] p-6 text-white flex justify-between items-start">
              <div className="flex flex-col gap-y-1">
                <h2 className="text-white text-lg font-bold m-0">XML Dışarı Aktar</h2>
                <span className="text-white font-bold text-xl">{currentFeed.id === "Yeni" || !currentFeed.id ? "Yeni Nolu XML Dosyası" : `${currentFeed.id} Nolu XML Dosyası`}</span>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-white hover:text-gray-200 text-3xl leading-none">&times;</button>
            </div>

            {/* Modal Body */}
            <form id="xml-form" onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 flex flex-col gap-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-medium text-zinc-700">XML Adı <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="text"
                    value={currentFeed.name || ""}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, name: e.target.value })}
                    className="p-2 border rounded border-zinc-300 text-sm focus:outline-blue-500 w-full"
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-medium text-zinc-700">XML Formatı</label>
                  <select
                    value={currentFeed.format || ""}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, format: e.target.value })}
                    className="p-2 border rounded border-zinc-300 text-sm focus:outline-blue-500 bg-white w-full"
                  >
                    <option>Özelleştirilmiş XML</option>
                    <option>Google Merchant Katalog</option>
                    <option>Facebook - Instagram Katalog</option>
                    <option>TikTok Katalog</option>
                  </select>
                </div>
              </div>

              {currentFeed.id && currentFeed.id !== "Yeni" && (
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-medium text-zinc-700">XML Dosya Adresi</label>
                  <div className="flex">
                    <input 
                      value={getFeedUrl(currentFeed.id)} 
                      className="p-2 border border-zinc-300 rounded-l text-sm bg-zinc-50 flex-1 outline-none border-r-0" 
                      readOnly 
                    />
                    <button type="button" className="px-4 border border-zinc-300 bg-zinc-50 rounded-r hover:bg-zinc-100 flex items-center justify-center transition-colors" onClick={() => copyUrl(getFeedUrl(currentFeed.id!))}>
                      <DocumentText className="w-5 h-5 text-zinc-600" />
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-medium text-zinc-700">Para Birimi</label>
                  <select
                    value={currentFeed.currency || ""}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, currency: e.target.value })}
                    className="p-2 border rounded border-zinc-300 text-sm focus:outline-blue-500 bg-white w-full"
                  >
                    <option>TL</option>
                    <option>USD</option>
                    <option>EUR</option>
                  </select>
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-medium text-zinc-700">İçerik Dili</label>
                  <select className="p-2 border rounded border-zinc-300 text-sm focus:outline-blue-500 bg-white w-full">
                    <option>Türkçe (Türkçe)</option>
                    <option>Varsayılan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-medium text-zinc-700">Ürün Kaynağı</label>
                  <select
                    value={currentFeed.product_source || (typeof window !== 'undefined' ? window.location.hostname : "XOOX")}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, product_source: e.target.value })}
                    className="p-2 border rounded border-zinc-300 text-sm focus:outline-blue-500 bg-white w-full"
                  >
                    <option>{typeof window !== 'undefined' ? window.location.hostname : "XOOX"}</option>
                  </select>
                </div>
                <div className="flex flex-col gap-y-2 relative z-[100]">
                  <label className="text-sm font-medium text-zinc-700">Kategoriler</label>
                  <CustomMultiSelect 
                    options={[
                      { label: "Tüm Kategoriler", value: "all" },
                      ...medusaCategories.map(cat => ({ label: cat.name, value: cat.id }))
                    ]}
                    selected={currentFeed.categories || []}
                    onChange={(newCategories: string[]) => setCurrentFeed({ ...currentFeed, categories: newCategories })}
                    placeholder="Tümü Seçildi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-y-2 relative z-[90]">
                  <label className="text-sm font-medium text-zinc-700">Markalar</label>
                  <select className="p-2 border rounded border-zinc-300 text-sm focus:outline-blue-500 bg-white w-full text-zinc-700">
                    <option>Tümü Seçildi</option>
                  </select>
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-medium text-zinc-700">Ürün Etiketleri</label>
                  <select className="p-2 border rounded border-zinc-300 text-sm focus:outline-blue-500 bg-white w-full">
                    <option>Etiket Seçilmedi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-medium text-zinc-700">Satış Fiyatı Tipi</label>
                  <select className="p-2 border rounded border-zinc-300 text-sm focus:outline-blue-500 bg-white w-full">
                    <option>Varsayılan Satış Fiyatı</option>
                  </select>
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-medium text-zinc-700">Ürün Durumu</label>
                  <select
                    value={currentFeed.status || "Aktif Olanlar"}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, status: e.target.value })}
                    className="p-2 border rounded border-zinc-300 text-sm focus:outline-blue-500 bg-white w-full"
                  >
                    <option>Aktif Olanlar</option>
                    <option>Tümü</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-medium text-zinc-700">Ürün Başlıkları</label>
                  <select className="p-2 border rounded border-zinc-300 text-sm focus:outline-blue-500 bg-white w-full">
                    <option>Sadece Baş Harfler Büyük</option>
                  </select>
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-medium text-zinc-700">Ürün Kısa Açıklaması (Ön Detay)</label>
                  <select className="p-2 border rounded border-zinc-300 text-sm focus:outline-blue-500 bg-white w-full">
                    <option>Sadece Baş Harfler Büyük</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-medium text-zinc-700">Stok Durumu</label>
                  <select className="p-2 border rounded border-zinc-300 text-sm focus:outline-blue-500 bg-white w-full">
                    <option>Tümü</option>
                    <option>Stokta Olanlar</option>
                  </select>
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-medium text-zinc-700">Minimum Stok Miktarı</label>
                  <input
                    type="number"
                    value={currentFeed.min_stock}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, min_stock: parseInt(e.target.value) })}
                    className="p-2 border rounded border-zinc-300 text-sm focus:outline-blue-500 w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-medium text-zinc-700">Ürün Barkodları</label>
                  <select className="p-2 border rounded border-zinc-300 text-sm focus:outline-blue-500 bg-white w-full">
                    <option>Eklensin</option>
                    <option>Eklenmesin</option>
                  </select>
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-medium text-zinc-700">Kar Oranı (%)</label>
                  <input
                    type="number"
                    value={currentFeed.profit_margin || 0}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, profit_margin: parseInt(e.target.value) })}
                    className="p-2 border rounded border-zinc-300 text-sm focus:outline-blue-500 w-full"
                  />
                </div>
              </div>

            </form>
            
            {/* Modal Footer */}
            <div className="bg-[#f8f9fa] p-4 flex items-center justify-between border-t border-zinc-200">
              <div className="flex items-center gap-x-2">
                <button type="button" className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300 rounded font-medium text-sm transition-colors">
                  İşlemler <span className="ml-1 text-[10px]">▲</span>
                </button>
                <button type="button" className="px-4 py-2 bg-[#9b59b6] hover:bg-[#8e44ad] text-white rounded font-medium text-sm flex items-center gap-x-2 transition-colors">
                  <span className="font-bold">⬇</span> İndir
                </button>
              </div>
              <button
                type="submit"
                form="xml-form"
                disabled={saving}
                className="px-6 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded font-medium text-sm flex items-center gap-x-2 transition-colors"
              >
                {saving ? "Kaydediliyor..." : "✔ Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default XmlExportPage
