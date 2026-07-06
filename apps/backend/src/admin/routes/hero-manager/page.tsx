import { useState, useEffect } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Sparkles, ComputerDesktop, CheckCircle, Plus, Trash, ArrowPath } from "@medusajs/icons"

interface Category {
  name: string
  handle: string
  icon: string
}

interface Banner {
  tag: string
  title: string
  description: string
  btn_text: string
  btn_link: string
  image_url: string
}

const defaultCategories: Category[] = [
  {
    name: "Jean Pantolon",
    handle: "jean-pantolon",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v18M15.75 3v18M8.25 8.25h7.5M8.25 15.75h7.5M3.75 5.25h16.5M3.75 18.75h16.5" /></svg>`
  },
  {
    name: "Tayt",
    handle: "tayt",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 3v18l3-4 3 4V3H9z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6 5.25h12M6 18.75h12" /></svg>`
  },
  {
    name: "Sweat",
    handle: "sweat",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.25h13.5v15H5.25z" /><path stroke-linecap="round" stroke-linejoin="round" d="M9 5.25V3h6v2.25M9.75 10.5h4.5M9.75 14.25h4.5" /></svg>`
  },
  {
    name: "Mont & Kürk",
    handle: "mont",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 5.25v15a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-15a3 3 0 0 0-3-3h-9a3 3 0 0 0-3 3z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 2.25v19.5M8.25 7.5h7.5M8.25 11.25h7.5" /></svg>`
  },
  {
    name: "Kombin",
    handle: "kombin",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v18M3 12h18M6.75 6.75h10.5v10.5H6.75z" /></svg>`
  },
  {
    name: "Tshirt",
    handle: "tshirt",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M18 5.25V3.75a1.5 1.5 0 0 0-1.5-1.5h-9A1.5 1.5 0 0 0 6 3.75v1.5M6 5.25 3 6v4.5l3-.75V20.25a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5V9.75l3 .75V6l-3-.75" /></svg>`
  },
  {
    name: "Gözlük",
    handle: "gozluk",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9h12a3 3 0 0 1 3 3v1.5a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V12a3 3 0 0 1 3-3Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 9.75a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3M18 9.75a3 3 0 0 1-3 3h-3" /></svg>`
  },
  {
    name: "Çanta",
    handle: "canta",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>`
  }
]

const defaultBanners: Banner[] = [
  {
    tag: "Trend Koleksiyon",
    title: "PREMIUM JEAN KOLEKSİYONU",
    description: "En boy likralı kot taytlar ve yüksek bel toparlayıcı jean pantolonlar şimdi en popüler kesimleriyle vitrinde.",
    btn_text: "Koleksiyonu Keşfet",
    btn_link: "/categories/jean-pantolon",
    image_url: ""
  },
  {
    tag: "Özel Seçki",
    title: "YAZ SEZONU KOMBİNLERİ",
    description: "Oysho modal kumaş şalvar takımlar ve çift şerit paraşüt kargo pantolonlar ile konforlu ve şık kombinler.",
    btn_text: "Şimdi İncele",
    btn_link: "/categories/kombin",
    image_url: ""
  }
]

const HeroManagerPage = () => {
  const [tag, setTag] = useState("")
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [btnText, setBtnText] = useState("")
  const [btnLink, setBtnLink] = useState("")
  const [mediaType, setMediaType] = useState("image")
  const [mediaUrl, setMediaUrl] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [topAnnouncement, setTopAnnouncement] = useState("")
  const [topAnnouncementEnabled, setTopAnnouncementEnabled] = useState(true)
  const [topAnnouncementBg, setTopAnnouncementBg] = useState("#000000")
  const [topAnnouncementTextColor, setTopAnnouncementTextColor] = useState("#ffffff")
  const [scrollingTextHome, setScrollingTextHome] = useState("")
  const [scrollingTextHomeEnabled, setScrollingTextHomeEnabled] = useState(true)
  const [scrollingTextHomeBg, setScrollingTextHomeBg] = useState("#000000")
  const [scrollingTextHomeTextColor, setScrollingTextHomeTextColor] = useState("#ffffff")
  const [scrollingTextProduct, setScrollingTextProduct] = useState("")
  const [scrollingTextProductEnabled, setScrollingTextProductEnabled] = useState(true)
  const [scrollingTextProductBg, setScrollingTextProductBg] = useState("#FFD700")
  const [scrollingTextProductTextColor, setScrollingTextProductTextColor] = useState("#000000")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    // Auto-detect media type
    if (file.type.startsWith("video/")) {
      setMediaType("video")
    } else if (file.type.startsWith("image/")) {
      setMediaType("image")
    }

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const base64 = reader.result as string
        const res = await fetch("/admin/hero-config/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: file.name,
            filetype: file.type,
            base64,
          }),
        })

        const data = await res.json()
        if (data && data.success) {
          setMediaUrl(data.url)
        } else {
          alert("Dosya yüklenirken hata oluştu: " + (data.message || "Bilinmeyen hata"))
        }
      } catch (err) {
        console.error("Upload error:", err)
        alert("Dosya yüklenirken bağlantı hatası oluştu.")
      } finally {
        setUploading(false)
      }
    }

    reader.onerror = () => {
      alert("Dosya okunurken bir hata oluştu.")
      setUploading(false)
    }

    reader.readAsDataURL(file)
  }

  // Fetch the current config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/admin/hero-config")
        const data = await res.json()
        if (data && data.config) {
          setTag(data.config.tag || "")
          setTitle(data.config.title || "")
          setSubtitle(data.config.subtitle || "")
          setBtnText(data.config.btn_text || "")
          setBtnLink(data.config.btn_link || "")
          setMediaType(data.config.media_type || "image")
          setMediaUrl(data.config.media_url || "")
          setCategories(data.config.categories || defaultCategories)
          setBanners(data.config.banners || defaultBanners)
          setTopAnnouncement(data.config.top_announcement || "")
          setTopAnnouncementEnabled(data.config.top_announcement_enabled ?? true)
          setTopAnnouncementBg(data.config.top_announcement_bg || "#000000")
          setTopAnnouncementTextColor(data.config.top_announcement_text_color || "#ffffff")
          setScrollingTextHome(data.config.scrolling_text_home || "")
          setScrollingTextHomeEnabled(data.config.scrolling_text_home_enabled ?? true)
          setScrollingTextHomeBg(data.config.scrolling_text_home_bg || "#000000")
          setScrollingTextHomeTextColor(data.config.scrolling_text_home_text_color || "#ffffff")
          setScrollingTextProduct(data.config.scrolling_text_product || "")
          setScrollingTextProductEnabled(data.config.scrolling_text_product_enabled ?? true)
          setScrollingTextProductBg(data.config.scrolling_text_product_bg || "#FFD700")
          setScrollingTextProductTextColor(data.config.scrolling_text_product_text_color || "#000000")
        }
      } catch (err) {
        console.error("Failed to load hero configuration:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setToastMessage("")

    try {
      const res = await fetch("/admin/hero-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tag,
          title,
          subtitle,
          btn_text: btnText,
          btn_link: btnLink,
          media_type: mediaType,
          media_url: mediaUrl,
          categories,
          banners,
          top_announcement: topAnnouncement,
          top_announcement_enabled: topAnnouncementEnabled,
          top_announcement_bg: topAnnouncementBg,
          top_announcement_text_color: topAnnouncementTextColor,
          scrolling_text_home: scrollingTextHome,
          scrolling_text_home_enabled: scrollingTextHomeEnabled,
          scrolling_text_home_bg: scrollingTextHomeBg,
          scrolling_text_home_text_color: scrollingTextHomeTextColor,
          scrolling_text_product: scrollingTextProduct,
          scrolling_text_product_enabled: scrollingTextProductEnabled,
          scrolling_text_product_bg: scrollingTextProductBg,
          scrolling_text_product_text_color: scrollingTextProductTextColor,
        }),
      })

      const data = await res.json()
      if (data && data.success) {
        setToastMessage("Vitrin, Kategori ve Kampanya ayarları başarıyla güncellendi! ✔")
        setTimeout(() => setToastMessage(""), 4000)
      } else {
        alert("Ayarlar kaydedilirken bir hata oluştu.")
      }
    } catch (err) {
      console.error("Error saving config:", err)
      alert("Sunucuyla bağlantı kurulamadı.")
    } finally {
      setSaving(false)
    }
  }

  // Category list modification handlers
  const handleCategoryChange = (index: number, field: keyof Category, value: string) => {
    const newCategories = [...categories]
    newCategories[index] = {
      ...newCategories[index],
      [field]: value
    }
    setCategories(newCategories)
  }

  const handleCategoryIconUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const base64 = reader.result as string
        const res = await fetch("/admin/hero-config/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: file.name,
            filetype: file.type,
            base64,
          }),
        })

        const data = await res.json()
        if (data && data.success) {
          handleCategoryChange(index, "icon", data.url)
        } else {
          alert("İkon yüklenirken hata oluştu: " + (data.message || "Bilinmeyen hata"))
        }
      } catch (err) {
        console.error("Icon upload error:", err)
        alert("İkon yüklenirken bağlantı hatası oluştu.")
      }
    }
    reader.readAsDataURL(file)
  }

  const addCategory = () => {
    setCategories([
      ...categories,
      {
        name: "Yeni Kategori",
        handle: "yeni-kategori",
        icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>`
      }
    ])
  }

  const removeCategory = (index: number) => {
    if (confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) {
      const newCategories = categories.filter((_, idx) => idx !== index)
      setCategories(newCategories)
    }
  }

  const resetCategories = () => {
    if (confirm("Kategorileri ilk varsayılan ayarlarına döndürmek istediğinize emin misiniz?")) {
      setCategories(defaultCategories)
    }
  }

  const renderIconPreview = (iconString: string) => {
    if (!iconString) {
      return (
        <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      )
    }

    if (iconString.trim().startsWith("<svg")) {
      return <div dangerouslySetInnerHTML={{ __html: iconString }} className="w-8 h-8 flex items-center justify-center" />
    }

    return <img src={iconString} className="w-8 h-8 object-contain" alt="İkon Önizleme" />
  }

  // Banner modification handlers
  const handleBannerChange = (index: number, field: keyof Banner, value: string) => {
    const newBanners = [...banners]
    newBanners[index] = {
      ...newBanners[index],
      [field]: value
    }
    setBanners(newBanners)
  }

  const handleBannerImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const base64 = reader.result as string
        const res = await fetch("/admin/hero-config/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: file.name,
            filetype: file.type,
            base64,
          }),
        })

        const data = await res.json()
        if (data && data.success) {
          handleBannerChange(index, "image_url", data.url)
        } else {
          alert("Görsel yüklenirken hata oluştu: " + (data.message || "Bilinmeyen hata"))
        }
      } catch (err) {
        console.error("Banner image upload error:", err)
        alert("Görsel yüklenirken bağlantı hatası oluştu.")
      }
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-zinc-500">Konfigürasyon Yükleniyor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-50 min-h-screen p-8 custom-admin-wrapper">
      <style>{`
        .custom-admin-wrapper {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
          text-rendering: optimizeLegibility !important;
        }
        
        .custom-admin-wrapper * {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        }
      `}</style>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Header Block */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-violet-600 text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)]">
              <ComputerDesktop className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Ana Sayfa Vitrin & Kategori Özelleştirme</h1>
              <p className="text-xs text-zinc-500 font-semibold mt-0.5">Hero banner, görsel/video arka planları, hızlı kategori çemberleri ve ikili kampanya banner'larını canlı düzenleyin.</p>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-[0_4px_12px_rgba(16,185,129,0.1)] transition-all duration-300 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-bold">{toastMessage}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          {/* KAYAN YAZI & DUYURU AYARLARI KARTI */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col gap-6">
            <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                Kayan Yazı & Duyuru Ayarları
              </h2>
            </div>
            
            <div className="flex flex-col gap-8">
              
              {/* SECTION 1: TEPE DUYURU METNİ */}
              <div className="p-6 rounded-xl border border-zinc-200 bg-zinc-50/30 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <span className="text-xs font-extrabold text-violet-600 uppercase tracking-wider">1. Tepe Duyuru Metni Ayarları</span>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={topAnnouncementEnabled}
                      onChange={(e) => setTopAnnouncementEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-violet-600 border-zinc-300 focus:ring-violet-500 cursor-pointer"
                    />
                    <span className="text-xs font-extrabold text-zinc-700">Bu Alanı Aktif Et</span>
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Duyuru Metni (Virgülle Ayrılmış Çoklu Cümle Destekler)</label>
                    <input
                      type="text"
                      value={topAnnouncement}
                      onChange={(e) => setTopAnnouncement(e.target.value)}
                      placeholder="Örn: 2026 YENİ SEZON MODELLER, AYNI GÜN KARGO, HIZLI TESLİMAT"
                      className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-sm font-medium transition-all"
                    />
                    <p className="text-[10px] text-zinc-400 font-semibold">
                      Sitenin en üstündeki duyuru barı metni. Virgüllerle ayırarak birden fazla duyuru girebilirsiniz (örneğin: "Yeni Sezon, Aynı Gün Kargo"). Bu durumda metinler sırayla sağdan sola kayarak ve ortada 3 saniye durarak görüntülenecektir.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Bant Arka Plan Rengi</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={topAnnouncementBg}
                          onChange={(e) => setTopAnnouncementBg(e.target.value)}
                          className="w-10 h-10 p-0.5 border border-zinc-200 rounded-lg cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={topAnnouncementBg}
                          onChange={(e) => setTopAnnouncementBg(e.target.value)}
                          className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-mono font-bold"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Yazı Rengi</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={topAnnouncementTextColor}
                          onChange={(e) => setTopAnnouncementTextColor(e.target.value)}
                          className="w-10 h-10 p-0.5 border border-zinc-200 rounded-lg cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={topAnnouncementTextColor}
                          onChange={(e) => setTopAnnouncementTextColor(e.target.value)}
                          className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-mono font-bold"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: ANA SAYFA KAYAN YAZI (MARQUEE) */}
              <div className="p-6 rounded-xl border border-zinc-200 bg-zinc-50/30 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <span className="text-xs font-extrabold text-violet-600 uppercase tracking-wider">2. Ana Sayfa Kayan Yazı (Marquee) Ayarları</span>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={scrollingTextHomeEnabled}
                      onChange={(e) => setScrollingTextHomeEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-violet-600 border-zinc-300 focus:ring-violet-500 cursor-pointer"
                    />
                    <span className="text-xs font-extrabold text-zinc-700">Bu Alanı Aktif Et</span>
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Kayan Yazı Metni</label>
                    <input
                      type="text"
                      value={scrollingTextHome}
                      onChange={(e) => setScrollingTextHome(e.target.value)}
                      placeholder="Örn: 3000 ₺ Üzeri Alışverişlerinizde Kargo Ücretsiz"
                      className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-sm font-medium transition-all"
                    />
                    <p className="text-[10px] text-zinc-400 font-semibold">
                      Ana sayfada Hero banner'ın altında sonsuz döngüyle kayan duyuru bandı metni.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Bant Arka Plan Rengi</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={scrollingTextHomeBg}
                          onChange={(e) => setScrollingTextHomeBg(e.target.value)}
                          className="w-10 h-10 p-0.5 border border-zinc-200 rounded-lg cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={scrollingTextHomeBg}
                          onChange={(e) => setScrollingTextHomeBg(e.target.value)}
                          className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-mono font-bold"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Yazı Rengi</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={scrollingTextHomeTextColor}
                          onChange={(e) => setScrollingTextHomeTextColor(e.target.value)}
                          className="w-10 h-10 p-0.5 border border-zinc-200 rounded-lg cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={scrollingTextHomeTextColor}
                          onChange={(e) => setScrollingTextHomeTextColor(e.target.value)}
                          className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-mono font-bold"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: ÜRÜN DETAY KAYAN YAZI */}
              <div className="p-6 rounded-xl border border-zinc-200 bg-zinc-50/30 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <span className="text-xs font-extrabold text-violet-600 uppercase tracking-wider">3. Ürün Detay Kayan Yazı Ayarları</span>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={scrollingTextProductEnabled}
                      onChange={(e) => setScrollingTextProductEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-violet-600 border-zinc-300 focus:ring-violet-500 cursor-pointer"
                    />
                    <span className="text-xs font-extrabold text-zinc-700">Bu Alanı Aktif Et</span>
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Kayan Yazı Metni</label>
                    <input
                      type="text"
                      value={scrollingTextProduct}
                      onChange={(e) => setScrollingTextProduct(e.target.value)}
                      placeholder="Örn: Sepette %10 İndirim Kodu : MDS10 • 3000 ₺ Üzeri Ücretsiz Kargo"
                      className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-sm font-medium transition-all"
                    />
                    <p className="text-[10px] text-zinc-400 font-semibold">
                      Ürün detay sayfalarında satın alma butonlarının hemen üzerinde sonsuz döngüyle kayan şerit metni.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Bant Arka Plan Rengi</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={scrollingTextProductBg}
                          onChange={(e) => setScrollingTextProductBg(e.target.value)}
                          className="w-10 h-10 p-0.5 border border-zinc-200 rounded-lg cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={scrollingTextProductBg}
                          onChange={(e) => setScrollingTextProductBg(e.target.value)}
                          className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-mono font-bold"
                          placeholder="#FFD700"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Yazı Rengi</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={scrollingTextProductTextColor}
                          onChange={(e) => setScrollingTextProductTextColor(e.target.value)}
                          className="w-10 h-10 p-0.5 border border-zinc-200 rounded-lg cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={scrollingTextProductTextColor}
                          onChange={(e) => setScrollingTextProductTextColor(e.target.value)}
                          className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-mono font-bold"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* BANNER AYARLARI KARTI */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col gap-8">
            
            {/* Section 1: Metinler */}
            <div className="flex flex-col gap-6">
              <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                Hero Banner Yazı Alanları ve İçerik
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tag Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Üst Etiket (Tag)</label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="MEDUSA V2 × NEXT.JS"
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-sm font-medium transition-all"
                  />
                </div>

                {/* Title Input */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Ana Başlık (Title)</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="XOOX Mağazasına Hoş Geldiniz"
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-sm font-bold text-zinc-950 transition-all"
                  />
                </div>

                {/* Subtitle Input */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Alt Başlık (Subtitle)</label>
                  <textarea
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Koleksiyonlarimizi keşfedin..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-sm font-medium transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Buton Ayarları */}
            <div className="flex flex-col gap-6">
              <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                Buton (CTA) Özellikleri
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Button Text */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Buton Yazısı (Button Text)</label>
                  <input
                    type="text"
                    value={btnText}
                    onChange={(e) => setBtnText(e.target.value)}
                    placeholder="Şimdi Alışverişe Başla"
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-sm font-medium transition-all"
                  />
                </div>

                {/* Button Link */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Buton Bağlantısı (Button URL)</label>
                  <input
                    type="text"
                    value={btnLink}
                    onChange={(e) => setBtnLink(e.target.value)}
                    placeholder="/store"
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-sm font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Arka Plan Medyası */}
            <div className="flex flex-col gap-6">
              <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                Arka Plan Medyası (Görsel veya .mp4 Video)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Media Type Dropdown */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Medya Türü (Media Type)</label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-sm font-medium transition-all"
                  >
                    <option value="image">Görsel (Image)</option>
                    <option value="video">Video (.mp4)</option>
                  </select>
                </div>

                {/* File Upload Area */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">
                    Dosya Yükle (Görsel veya .mp4 Video - Maks 25MB)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer hover:bg-zinc-50 border-zinc-300 hover:border-violet-500 transition-all duration-300 relative overflow-hidden">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                        {uploading ? (
                          <>
                            <div className="w-8 h-8 mb-3 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-bold text-violet-600">Medya Sunucuya Yükleniyor...</p>
                            <p className="text-xs text-zinc-400 mt-1">Lütfen bekleyin, dosya boyutu büyükse birkaç saniye sürebilir.</p>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-8 h-8 mb-3 text-violet-500 animate-pulse" />
                            <p className="text-sm font-bold text-zinc-700">Yüklemek istediğiniz dosyayı seçin</p>
                            <p className="text-xs text-zinc-400 mt-1">Görsel (PNG, JPG, WEBP) veya MP4 Video dosyası seçebilirsiniz</p>
                            {mediaUrl && (
                              <p className="text-[11px] font-semibold text-emerald-600 mt-2 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 truncate max-w-full">
                                Şu an yüklü: {mediaUrl.substring(mediaUrl.lastIndexOf("/") + 1)}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*,video/mp4" 
                        disabled={uploading} 
                        onChange={handleFileUpload} 
                      />
                    </label>
                  </div>
                </div>

                {/* Media URL Input */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Yüklenen Medya Bağlantısı / Manuel Link</label>
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://örnek.com/banner.jpg veya https://örnek.com/banner.mp4"
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-sm font-medium transition-all"
                  />
                  <p className="text-[10px] text-zinc-400 font-medium">Dosya yüklediğinizde burası otomatik doldurulur. Dilerseniz harici bir CDN linki de girebilirsiniz.</p>
                </div>
              </div>
            </div>
          </div>

          {/* İKİLİ KAMPANYA BANNER'LARI YÖNETİMİ KARTI */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col gap-8">
            <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
              İkili Kampanya Banner'ları Özelleştirme
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {banners.map((banner, idx) => (
                <div key={idx} className="p-6 rounded-2xl border border-zinc-200 bg-zinc-50/50 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col gap-6">
                  <div className="flex items-center justify-between border-b border-zinc-200/60 pb-3">
                    <span className="text-xs font-black text-violet-600 uppercase tracking-wider">
                      {idx === 0 ? "Left (1. Banner) Görünümü" : "Right (2. Banner) Görünümü"}
                    </span>
                  </div>

                  {/* WYSIWYG Live Preview Box */}
                  <div 
                    className="h-[180px] rounded-xl border border-zinc-200 relative overflow-hidden bg-cover bg-center flex flex-col justify-between p-4 text-left shadow-inner"
                    style={{ 
                      backgroundImage: banner.image_url ? `url(${banner.image_url})` : "none",
                      backgroundColor: idx === 0 ? "#f4f4f5" : "#fafafa" 
                    }}
                  >
                    {!banner.image_url && (
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30" />
                    )}
                    {/* Shadow overlay if image is present */}
                    {banner.image_url && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-[0.5px]" />
                    )}

                    <div className="relative z-10 flex flex-col justify-between h-full items-start">
                      <span className="px-2 py-0.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-600 text-[8px] font-bold uppercase tracking-wider">
                        {banner.tag || "Üst Etiket"}
                      </span>
                      <div className="flex flex-col gap-1 max-w-[80%]">
                        <h4 className="text-sm font-black text-zinc-950 tracking-tight leading-tight uppercase">
                          {banner.title || "Başlık Girin"}
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-semibold truncate">
                          {banner.description || "Açıklama metnini buraya yazın."}
                        </p>
                      </div>
                      <button type="button" className="bg-violet-600 text-white text-[9px] font-extrabold px-3 py-1 rounded shadow-sm shrink-0">
                        {banner.btn_text || "Buton"} →
                      </button>
                    </div>
                  </div>

                  {/* Edit Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tag */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-700 uppercase tracking-wider">Üst Rozet/Etiket</label>
                      <input
                        type="text"
                        required
                        value={banner.tag}
                        onChange={(e) => handleBannerChange(idx, "tag", e.target.value)}
                        placeholder="Örn: Trend Koleksiyon"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:border-violet-500 text-xs font-semibold text-zinc-900"
                      />
                    </div>

                    {/* Title */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-700 uppercase tracking-wider">Kampanya Başlığı</label>
                      <input
                        type="text"
                        required
                        value={banner.title}
                        onChange={(e) => handleBannerChange(idx, "title", e.target.value)}
                        placeholder="Örn: Premium Jean Koleksiyonu"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:border-violet-500 text-xs font-bold text-zinc-950"
                      />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[10px] font-extrabold text-zinc-700 uppercase tracking-wider">Açıklama Metni</label>
                      <textarea
                        required
                        value={banner.description}
                        onChange={(e) => handleBannerChange(idx, "description", e.target.value)}
                        placeholder="Kampanya detaylarını buraya yazın..."
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:border-violet-500 text-xs font-semibold text-zinc-700 resize-none"
                      />
                    </div>

                    {/* Button Text */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-700 uppercase tracking-wider">Buton Metni</label>
                      <input
                        type="text"
                        required
                        value={banner.btn_text}
                        onChange={(e) => handleBannerChange(idx, "btn_text", e.target.value)}
                        placeholder="Örn: Koleksiyonu Keşfet"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:border-violet-500 text-xs font-semibold text-zinc-900"
                      />
                    </div>

                    {/* Button Link (Collection path) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-700 uppercase tracking-wider">Buton Bağlantısı (Koleksiyon/Kategori)</label>
                      <input
                        type="text"
                        required
                        value={banner.btn_link}
                        onChange={(e) => handleBannerChange(idx, "btn_link", e.target.value)}
                        placeholder="Örn: /categories/jean-pantolon"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:border-violet-500 text-xs font-semibold text-zinc-800"
                      />
                    </div>

                    {/* Background Image Upload & Input */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[10px] font-extrabold text-zinc-700 uppercase tracking-wider">Arka Plan Görseli / Banner Resmi</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={banner.image_url}
                          onChange={(e) => handleBannerChange(idx, "image_url", e.target.value)}
                          placeholder="Arka plan görsel linki (boş bırakılırsa ızgara çizimli degrade kullanılır)"
                          className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:border-violet-500 text-xs font-medium text-zinc-800"
                        />
                        <label className="cursor-pointer bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-700 text-xs font-extrabold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 select-none">
                          <span>Görsel Yükle</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleBannerImageUpload(idx, e)}
                          />
                        </label>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HIZLI KATEGORİ İKONLARI YÖNETİMİ KARTI */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                Hızlı Kategori İkonları Yönetimi
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetCategories}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 text-xs font-bold transition-all"
                >
                  <ArrowPath className="w-3.5 h-3.5" />
                  Varsayılana Sıfırla
                </button>
                <button
                  type="button"
                  onClick={addCategory}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 shadow-sm text-xs font-bold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Yeni Kategori Ekle
                </button>
              </div>
            </div>
            
            <p className="text-xs text-zinc-400 font-semibold leading-relaxed mt-1">
              Ana sayfadaki hızlı kategori çemberlerini buradan düzenleyebilirsiniz. İkon alanından bilgisayarınızdan doğrudan bir görsel yükleyebilir (PNG, JPG, SVG, WEBP) veya manuel olarak resim adresi ya da inline SVG kodu girebilirsiniz.
            </p>

            <div className="flex flex-col gap-4 mt-2">
              {categories.map((cat, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-6 items-start">
                  
                  {/* Left: Live SVG/Image Preview */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">İkon Önizleme</span>
                    <div className="w-16 h-16 rounded-full border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-700 relative shadow-inner overflow-hidden">
                      {renderIconPreview(cat.icon)}
                    </div>
                  </div>

                  {/* Middle: Inputs */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {/* Category Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-700 uppercase tracking-wider">Kategori Adı</label>
                      <input
                        type="text"
                        required
                        value={cat.name}
                        onChange={(e) => handleCategoryChange(idx, "name", e.target.value)}
                        placeholder="Örn: Jean Pantolon"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:border-violet-500 text-xs font-semibold text-zinc-900"
                      />
                    </div>

                    {/* Category Handle/Slug */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-700 uppercase tracking-wider">Bağlantı Slug'ı (Link)</label>
                      <input
                        type="text"
                        required
                        value={cat.handle}
                        onChange={(e) => handleCategoryChange(idx, "handle", e.target.value)}
                        placeholder="Örn: jean-pantolon"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:border-violet-500 text-xs font-medium text-zinc-800"
                      />
                    </div>

                    {/* Custom Icon Image Upload & URL input */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[10px] font-extrabold text-zinc-700 uppercase tracking-wider">Kategori İkonu Görseli (Dosya Seçin veya Link Girin)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          required
                          value={cat.icon}
                          onChange={(e) => handleCategoryChange(idx, "icon", e.target.value)}
                          placeholder="Görsel bağlantısı (http...), SVG kodları veya dosya seçerek otomatik yükleyin"
                          className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:border-violet-500 text-xs font-medium text-zinc-800"
                        />
                        <label className="cursor-pointer bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-700 text-xs font-extrabold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 select-none">
                          <span>Dosya Yükle</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleCategoryIconUpload(idx, e)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="shrink-0 self-stretch flex md:flex-col justify-between md:justify-end items-end w-full md:w-auto">
                    <button
                      type="button"
                      onClick={() => removeCategory(idx)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all"
                    >
                      <Trash className="w-3.5 h-3.5" />
                      Sil
                    </button>
                  </div>

                </div>
              ))}
            </div>

            <div className="flex justify-center mt-2">
              <button
                type="button"
                onClick={addCategory}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-dashed border-zinc-300 hover:border-violet-500 hover:text-violet-600 text-zinc-500 text-xs font-extrabold transition-all duration-300 w-full justify-center bg-zinc-50/20"
              >
                <Plus className="w-4 h-4" />
                Yeni Kategori Çemberi Ekle
              </button>
            </div>

          </div>

          {/* SUBMIT ACTION FOOTER */}
          <div className="flex justify-end pt-4 border-t border-zinc-200">
            <button
              type="submit"
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm px-10 py-3.5 rounded-xl shadow-[0_4px_18px_rgba(124,58,237,0.35)] hover:shadow-[0_8px_25px_rgba(124,58,237,0.45)] transition-all duration-300 disabled:bg-zinc-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Değişiklikler Kaydediliyor...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  Değişiklikleri Kaydet
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Vitrin & Kategori Yönetimi",
  icon: Sparkles,
})

export default HeroManagerPage
