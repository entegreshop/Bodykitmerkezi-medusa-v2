import { Container, Text } from "@medusajs/ui"
import { 
  House, 
  ShoppingCartSolid, 
  TagSolid, 
  ArrowUpRightOnBox, 
  RocketLaunchSolid, 
  UsersSolid, 
  SwatchSolid, 
  ChartPie, 
  ToolsSolid, 
  CogSixToothSolid 
} from "@medusajs/icons"
import { useLocation, Link } from "react-router-dom"
import { useState, useRef, useEffect } from "react"

export const ErpTopNav = () => {
  const location = useLocation()
  const pathname = location.pathname
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const navItems = [
    { label: "ANA SAYFA", icon: <House />, path: "/dashboard" },
    { 
      label: "SİPARİŞLER", 
      icon: <ShoppingCartSolid />, 
      path: "/siparis-yonetimi",
      dropdown: {
        columns: [
          {
            title: "Sipariş Durumları",
            titleColor: "text-gray-900",
            items: [
              { label: "Onay Bekleyenler", path: "/siparis-yonetimi?status=pending", badge: "1" },
              { label: "Hazırlananlar", path: "/siparis-yonetimi?status=processing", badge: "4" },
              { label: "Kargolananlar", path: "/siparis-yonetimi?status=shipped" },
              { label: "Teslim Edilenler", path: "/siparis-yonetimi?status=delivered" },
              { label: "İade Edilenler", path: "/siparis-yonetimi?status=returned" },
              { label: "İptal Edilenler", path: "/siparis-yonetimi?status=canceled" },
              { label: "Tüm Siparişler", path: "/siparis-yonetimi" },
              { label: "Ödeme Hatası Alınanlar", path: "/siparis-yonetimi?status=requires_action" },
            ]
          },
          {
            title: "Sipariş İşlemleri",
            titleColor: "text-blue-600",
            items: [
              { label: "Hızlı Satış", path: "/siparis-yonetimi/hizli-satis" },
              { label: "İade Talepleri", path: "/siparis-yonetimi/iade-talepleri", badge: "Yeni" },
              { label: "Aktif Sepetler", path: "/siparis-yonetimi/aktif-sepetler" },
              { label: "Terk Edilmiş Sepetler", path: "/siparis-yonetimi/terk-edilmis-sepetler" },
              { label: "Telefonla Sipariş Talepleri", path: "/siparis-yonetimi/telefonla-siparis" },
              { label: "Havale Bildirimleri", path: "/siparis-yonetimi/havale-bildirimleri" },
              { label: "Sipariş Etiketleri", path: "/siparis-yonetimi/siparis-etiketleri" },
              { label: "Risk Kriterleri", path: "/siparis-yonetimi/risk-kriterleri" },
            ]
          }
        ]
      }
    },
    { 
      label: "ÜRÜNLER", 
      icon: <TagSolid />, 
      path: "/gelismis-urunler",
      dropdown: {
        columns: [
          {
            title: "",
            titleColor: "",
            items: [
              { label: "Ürünler", path: "/gelismis-urunler" },
              { label: "Koleksiyonlar", path: "/koleksiyonlar" },
              { label: "Kategoriler", path: "/kategoriler" },
              { label: "Markalar", path: "/markalar" },
              { label: "Etiketler", path: "/etiketler" },
            ]
          },
          {
            title: "Ürün İşlemleri",
            titleColor: "text-blue-600",
            items: [
              { label: "Ürün Yorumları", path: "/reviews" },
              { label: "Toplu Ürün Güncelleme", path: "/urun-islemleri/toplu-guncelleme" },
            ]
          },
          {
            title: "İçeri / Dışarı Aktar",
            titleColor: "text-blue-600",
            items: [
              { label: "Excel İçeri / Dışarı Aktar", path: "/excel-transfer" },
              { label: "XML İçeri Aktar", path: "/xml-import" },
              { label: "XML Dışarı Aktar", path: "/xml-export" },
            ]
          }
        ]
      }
    },

    { 
      label: "KAMPANYALAR", 
      icon: <RocketLaunchSolid />, 
      path: "/kampanyalar",
      dropdown: {
        columns: [
          {
            title: "",
            titleColor: "",
            items: [
              { label: "Kampanya Kurguları (Kuponlar)", path: "/kampanyalar" },
              { label: "Dinamik İndirim Otomasyonu", path: "/kampanya-kurgulari" },
              { label: "Hediye Çekleri", path: "/kampanyalar/hediye-cekleri" },
              { label: "Promosyonlar", path: "/kampanyalar/promosyonlar" },
              { label: "Hızlı İndirimler", path: "/kampanyalar/hizli-indirimler" },
              { label: "E-Posta Bültenleri", path: "/kampanyalar/e-posta-bultenleri" },
              { label: "SMS Bültenleri", path: "/kampanyalar/sms-bultenleri" },
              { label: "Mobil Bildirimler", path: "/kampanyalar/mobil-bildirimler" },
            ]
          }
        ]
      }
    },
    { 
      label: "MÜŞTERİLER", 
      icon: <UsersSolid />, 
      path: "/customers",
      dropdown: {
        columns: [
          {
            title: "",
            titleColor: "",
            items: [
              { label: "Üyeler", path: "/customers" },
              { label: "Bayiler", path: "/musteriler/bayiler" },
              { label: "Müşteri Grupları", path: "/customer-groups" },
              { label: "Bakiye Yüklemeleri", path: "/musteriler/bakiye-yuklemeleri" },
              { label: "Hızlı Ödemeler", path: "/musteriler/hizli-odemeler" },
              { label: "İletişim Talepleri", path: "/musteriler/iletisim-talepleri", badge: "14" },
              { label: "Müşteri Talepleri", path: "/musteriler/musteri-talepleri", badge: "8" },
            ]
          }
        ]
      }
    },
    { 
      label: "TASARIM", 
      icon: <SwatchSolid />, 
      path: "/sosyal-linkler",
      dropdown: {
        columns: [
          {
            title: "",
            titleColor: "",
            items: [
              { label: "Vitrin Yönetimi", path: "/gelismis-vitrin-yonetimi" },
              { label: "Temalar", path: "/tasarim/temalar" },
              { label: "Blok Yönetimi", path: "/tasarim/blok-yonetimi" },
              { label: "Görsel Optimizasyonu", path: "/tasarim/gorsel-optimizasyonu" },
              { label: "SEO Optimizasyonu", path: "/tasarim/seo-optimizasyonu" },
              { label: "301 Yönlendirmeleri", path: "/tasarim/301-yonlendirmeleri" },
              { label: "404 Kırık Linkler", path: "/tasarim/404-kirik-linkler" },
              { label: "Sitemap", path: "/tasarim/sitemap" },
              { label: "Görsel Yükle", path: "/tasarim/gorsel-yukle" },
            ]
          },
          {
            title: "İçerikler",
            titleColor: "text-blue-600",
            items: [
              { label: "Sayfalar", path: "/tasarim/sayfalar" },
              { label: "Kayan Yazılar", path: "/announcements" },
              { label: "Yardım İçerikleri", path: "/tasarim/yardim-icerikleri" },
              { label: "Sıkça Sorulan Sorular", path: "/tasarim/sss" },
              { label: "Blog", path: "/tasarim/blog" },
              { label: "Manşetler", path: "/tasarim/mansetler" },
              { label: "Bannerlar", path: "/tasarim/bannerlar" },
              { label: "Popup", path: "/tasarim/popup" },
              { label: "Story", path: "/tasarim/story" },
            ]
          }
        ]
      }
    },
    { label: "RAPORLAR", icon: <ChartPie />, path: "/raporlar" },
    { 
      label: "ARAÇLAR", 
      icon: <ToolsSolid />, 
      path: "/araclar",
      dropdown: {
        columns: [
          {
            title: "",
            titleColor: "",
            items: [
              { label: "Ödeme Yöntemleri", path: "/payment-integrations" },
              { label: "Kargo ve Teslimat", path: "/shipping-integrations" },
              { label: "E-Posta ve SMS", path: "/bildirimler" },
              { label: "E-Fatura & E-Arşiv", path: "/e-fatura" },
              { label: "Eklentiler", path: "/araclar/eklentiler" },
            ]
          }
        ]
      }
    },
    { 
      label: "AYARLAR", 
      icon: <CogSixToothSolid />, 
      path: "/gelismis-ayarlar",
      dropdown: {
        columns: [
          {
            title: "",
            titleColor: "",
            items: [
              { label: "Mağaza Ayarları", path: "/gelismis-ayarlar" },
              { label: "Sözleşmeler ve Metinler", path: "/ayarlar/sozlesmeler" },
              { label: "Pazarlama ve Doğrulama", path: "/marketing" },
              { label: "Yazdırma Etiketleri", path: "/ayarlar/yazdirma-etiketleri" },
              { label: "Para Birimleri", path: "/settings/currencies" },
              { label: "Vergiler", path: "/settings/taxes" },
              { label: "Diller", path: "/ayarlar/diller" },
              { label: "Web Servis", path: "/ayarlar/web-servis" },
              { label: "Personeller", path: "/settings/users" },
              { label: "Lisans", path: "/ayarlar/lisans" },
            ]
          }
        ]
      }
    },
  ]

  return (
    <div ref={navRef} className="w-full relative bg-white border-b border-ui-border-base flex items-center justify-between px-6 py-2 shadow-sm mb-6 rounded-xl z-50">
      {/* Sol - Logo / Marka */}
      <div className="flex items-center gap-x-2 mr-8">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg">
          K
        </div>
        <Text weight="plus" className="text-xl tracking-tight text-ui-fg-base hidden md:block">
          KOMBINGO
        </Text>
      </div>

      {/* Orta - Navigasyon Linkleri */}
      <div className="flex-1 flex items-center justify-center gap-x-1 md:gap-x-4 overflow-x-auto no-scrollbar">
        {navItems.map((item, idx) => {
          const isActive = pathname === item.path || (item.path !== "/dashboard" && pathname?.startsWith(item.path));
          const hasDropdown = !!item.dropdown;
          const isOpen = openDropdown === idx;

          const content = (
            <>
              <div className={`mb-1 transition-transform ${isOpen ? "-translate-y-0.5" : ""} ${hasDropdown ? "group-hover:-translate-y-0.5" : "hover:-translate-y-0.5"} ${isActive || isOpen ? "text-indigo-600" : ""}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-bold tracking-wider ${isActive || isOpen ? "text-indigo-600" : ""}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-indigo-600 rounded-t-full shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
              )}
            </>
          );

          return (
            <div key={idx} className="flex items-center justify-center">
              {hasDropdown ? (
                <button 
                  onClick={() => setOpenDropdown(isOpen ? null : idx)}
                  className={`flex flex-col items-center justify-center min-w-[72px] px-3 py-2 rounded-lg transition-all duration-200 relative ${
                    isActive || isOpen
                      ? "bg-ui-bg-base" 
                      : "hover:bg-ui-bg-subtle-hover text-ui-fg-subtle hover:text-ui-fg-base"
                  }`}
                >
                  {content}
                </button>
              ) : (
                <Link 
                  to={item.path}
                  onClick={() => setOpenDropdown(null)}
                  className={`flex flex-col items-center justify-center min-w-[72px] px-3 py-2 rounded-lg transition-all duration-200 relative ${
                    isActive 
                      ? "bg-ui-bg-base" 
                      : "hover:bg-ui-bg-subtle-hover text-ui-fg-subtle hover:text-ui-fg-base"
                  }`}
                >
                  {content}
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {/* Sağ - Ekstra Aksiyonlar (Opsiyonel / Placeholder) */}
      <div className="flex items-center gap-x-3 ml-8">
         <a 
            href="https://kombingo.com" 
            target="_blank" 
            className="hidden lg:flex items-center justify-center px-4 py-2 text-xs font-bold bg-ui-bg-base border border-ui-border-base rounded-md hover:bg-ui-bg-subtle-hover transition-colors shadow-sm"
         >
            Siteyi Görüntüle
         </a>
      </div>

      {/* Mega Menüler (Tüm Navigasyon Çubuğunun Altında Tam Genişlikte Açılır) */}
      {navItems.map((item, idx) => {
        if (!item.dropdown || openDropdown !== idx) return null;

        return (
          <div key={`mega-${idx}`} className="absolute top-full left-0 w-full pt-3 z-[100]">
            <div className="bg-white rounded-xl shadow-2xl border border-ui-border-base p-8 relative animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-12 gap-8">
                
                {/* Sol Menü Kolonları */}
                <div className={`col-span-8 lg:col-span-9 grid gap-8 ${item.dropdown.columns.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {item.dropdown.columns.map((col, cIdx) => (
                    <div key={cIdx} className="flex flex-col gap-y-3">
                      {col.title && (
                        <h3 className={`text-[15px] font-bold ${col.titleColor} mb-2 border-b border-gray-100 pb-2`}>
                          {col.title}
                        </h3>
                      )}
                      <div className="flex flex-col gap-y-2">
                        {col.items.map((sub, i) => (
                          <Link 
                            key={i} 
                            to={sub.path} 
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center justify-between text-sm text-gray-600 hover:text-indigo-600 hover:bg-gray-50 px-2 py-1.5 rounded-md transition-colors"
                          >
                            <div className="flex items-center gap-x-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              <span className="font-medium">{sub.label}</span>
                            </div>
                            {sub.badge && (
                              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-none">
                                {sub.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sağ Bilgi/Tanıtım Kolonu (Mega Menü Özelliği) */}
                <div className="col-span-4 lg:col-span-3 bg-gray-50/80 rounded-xl p-6 border border-gray-100 flex flex-col justify-center items-center text-center shadow-inner">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    {item.icon}
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mb-2">{item.label} YÖNETİMİ</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Tüm {item.label.toLowerCase()} süreçlerinizi, durum takiplerini ve ekstra işlemleri bu genişletilmiş menüden hızlıca yönetebilirsiniz.
                  </p>
                </div>

              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
