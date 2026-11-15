import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import * as fs from "fs"
import * as path from "path"

const CONFIG_PATH = path.join(process.cwd(), "uploads", "hero-config-bodykit.json")

const defaultCategories = [
  { id: "yeni-gelenler", name: "Yeni Gelenler", icon: "sparkles", link: "/store", image_url: "", badge_text: "YENİ", active: true },
  { id: "bodykit", name: "Bodykit Setleri", icon: "car", link: "/categories/bodykit", image_url: "", badge_text: "POPÜLER", active: true },
  { id: "difuzor", name: "Difüzör", icon: "exhaust", link: "/categories/difuzor", image_url: "", badge_text: "", active: true },
  { id: "spoiler", name: "Spoiler", icon: "wing", link: "/categories/spoiler", image_url: "", badge_text: "", active: true },
  { id: "tampon-ek", name: "Tampon Ekleri", icon: "bumper", link: "/categories/tampon-ek", image_url: "", badge_text: "", active: true },
  { id: "marspiyel", name: "Marşpiyel", icon: "sideskirt", link: "/categories/marspiyel", image_url: "", badge_text: "", active: true },
  { id: "panjur", name: "Ön Panjur", icon: "grille", link: "/categories/panjur", image_url: "", badge_text: "", active: true },
  { id: "aydinlatma", name: "Aydınlatma", icon: "headlight", link: "/categories/aydinlatma", image_url: "", badge_text: "", active: true },
  { id: "aksesuar", name: "Aksesuar", icon: "gear", link: "/categories/aksesuar", image_url: "", badge_text: "", active: true }
]

const defaultBanners = [
  {
    id: "banner-1",
    tag: "TREND KOLEKSİYON",
    title: "PREMIUM BODYKIT SETLERİ",
    description: "Aracınızın görünümünü tamamen değiştirecek agresif ve aerodinamik bodykit setleri vitrinde.",
    btn_text: "Koleksiyonu Keşfet",
    btn_link: "/store",
    btn_bg_color: "#4f46e5",
    btn_text_color: "#ffffff",
    image_url: "",
    bg_color: "#EEF0F4",
    text_color: "#09090B",
    tag_color: "#4338CA",
    tag_bg: "#E0E7FF",
    active: true
  },
  {
    id: "banner-2",
    tag: "ÖZEL SEÇKİ",
    title: "DİFÜZÖR & SPOILER",
    description: "Sportif detaylar ve yüksek kaliteli plastik/karbon görünümüyle aracınıza değer katın.",
    btn_text: "Fırsatları İncele",
    btn_link: "/store",
    btn_bg_color: "#d97706",
    btn_text_color: "#ffffff",
    image_url: "",
    bg_color: "#F3EFEA",
    text_color: "#09090B",
    tag_color: "#B45309",
    tag_bg: "#FEF3C7",
    active: true
  }
]

const defaultCarouselBlocks = [
  {
    id: "carousel-1",
    title: "Çok Satan Bodykit & Spoiler Ürünleri",
    subtitle: "En çok tercih edilen aracınıza özel tasarım ürünler",
    source_type: "latest",
    handle: "",
    limit: 10,
    bg_color: "#ffffff",
    text_color: "#111827",
    view_all_text: "Tümünü Gör",
    view_all_link: "/store",
    active: true
  }
]

const defaultBannerCarousels = [
  {
    id: "banner-carousel-bodykit",
    title: "Komple Bodykit Setleri",
    title_color: "#111827",
    cta_text: "Fırsatları Kaçırma",
    cta_link: "/categories/bodykit",
    cta_color: "#e11d48",
    footer_note: "Aracınıza birebir uyumlu 1. sınıf ABS plastik ve PP komple bodykit setlerinde sepette ekstra indirim avantajı.",
    badge_text: "BODYKIT FIRSATI",
    bg_image_url: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1600&auto=format&fit=crop&q=80",
    bg_color: "#dce6f2",
    source_type: "category",
    handle: "bodykit",
    limit: 8,
    position: "below_collection",
    free_shipping_text: "HIZLI KARGO",
    active: true
  },
  {
    id: "banner-carousel-difuzor",
    title: "Arka Difüzör & Egzoz Uçları",
    title_color: "#111827",
    cta_text: "Difüzör Modellerini Keşfet",
    cta_link: "/categories/difuzor",
    cta_color: "#1d4ed8",
    footer_note: "Çift çıkışlı, F1 çakar lambalı ve parlak siyah (Piano Black) arka difüzör modellerinde özel fiyatlar.",
    badge_text: "DİFÜZÖR SEÇKİSİ",
    bg_image_url: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1600&auto=format&fit=crop&q=80",
    bg_color: "#dbeafe",
    source_type: "category",
    handle: "difuzor",
    limit: 8,
    position: "below_collection",
    free_shipping_text: "HIZLI KARGO",
    active: true
  },
  {
    id: "banner-carousel-spoiler",
    title: "Bagaj & Tavan Spoiler Modelleri",
    title_color: "#111827",
    cta_text: "Spoiler Fırsatlarını İncele",
    cta_link: "/categories/spoiler",
    cta_color: "#c91d82",
    footer_note: "M4, PSM, Clubsport ve R-Line tasarım bagaj üstü ve tavan spoiler modellerinde hızlı kargo avantajı.",
    badge_text: "SPOILER SERİSİ",
    bg_image_url: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=1600&auto=format&fit=crop&q=80",
    bg_color: "#fce7f3",
    source_type: "category",
    handle: "spoiler",
    limit: 8,
    position: "below_collection",
    free_shipping_text: "HIZLI KARGO",
    active: true
  },
  {
    id: "banner-carousel-tampon",
    title: "Ön Lip & Tampon Ekleri",
    title_color: "#111827",
    cta_text: "Sportif Stili Yakala",
    cta_link: "/categories/tampon-ek",
    cta_color: "#7c3aed",
    footer_note: "Esnek kırılmaz yapılı, boyalı ve boyasız ön tampon eki (lip) ve splitter modellerinde özel indirimler.",
    badge_text: "SPORTİF GÖRÜNÜM",
    bg_image_url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1600&auto=format&fit=crop&q=80",
    bg_color: "#ede9fe",
    source_type: "category",
    handle: "tampon-ek",
    limit: 8,
    position: "below_collection",
    free_shipping_text: "HIZLI KARGO",
    active: true
  },
  {
    id: "banner-carousel-marspiyel",
    title: "Yan Marşpiyel Takımları",
    title_color: "#111827",
    cta_text: "Marşpiyel Setlerini Gör",
    cta_link: "/categories/marspiyel",
    cta_color: "#b45309",
    footer_note: "Sağ-sol takım yan marşpiyel ve marşpiyel altı bıçak setlerinde sezonun en iyi fiyatları.",
    badge_text: "AERODİNAMİK SET",
    bg_image_url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1600&auto=format&fit=crop&q=80",
    bg_color: "#fef3c7",
    source_type: "category",
    handle: "marspiyel",
    limit: 8,
    position: "below_collection",
    free_shipping_text: "HIZLI KARGO",
    active: true
  },
  {
    id: "banner-carousel-panjur",
    title: "Spor Panjur & Böbrek Izgara",
    title_color: "#111827",
    cta_text: "Tüm Modelleri Gör",
    cta_link: "/categories/panjur",
    cta_color: "#059669",
    footer_note: "Diamond, GT-R Panamericana, M Çift Çizgi ve RS petek ön panjur modellerinde sepette ekstra indirim.",
    badge_text: "RS & M PERFORMANCE",
    bg_image_url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1600&auto=format&fit=crop&q=80",
    bg_color: "#d1fae5",
    source_type: "category",
    handle: "panjur",
    limit: 8,
    position: "below_collection",
    free_shipping_text: "HIZLI KARGO",
    active: true
  },
  {
    id: "banner-carousel-aydinlatma",
    title: "LED Far & Stop Aydınlatma",
    title_color: "#111827",
    cta_text: "Aydınlatma Ürünlerini Keşfet",
    cta_link: "/categories/aydinlatma",
    cta_color: "#e11d48",
    footer_note: "Kayar sinyalli LED stop, lazer far ve sis farı takımlarında kaçırılmayacak fiyatlar.",
    badge_text: "LED TEKNOLOJİSİ",
    bg_image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&auto=format&fit=crop&q=80",
    bg_color: "#ffe4e6",
    source_type: "category",
    handle: "aydinlatma",
    limit: 8,
    position: "below_collection",
    free_shipping_text: "HIZLI KARGO",
    active: true
  },
  {
    id: "banner-carousel-aksesuar",
    title: "İç & Dış Oto Aksesuar",
    title_color: "#111827",
    cta_text: "Aksesuar Koleksiyonunu Gör",
    cta_link: "/categories/aksesuar",
    cta_color: "#9333ea",
    footer_note: "Yarasa ayna kapağı, kelebek cam panjuru (louver), rüzgarlık ve karbon detaylarla aracınızı tamamlayın.",
    badge_text: "TREND AKSESUAR",
    bg_image_url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600&auto=format&fit=crop&q=80",
    bg_color: "#f3e8ff",
    source_type: "category",
    handle: "aksesuar",
    limit: 8,
    position: "below_collection",
    free_shipping_text: "HIZLI KARGO",
    active: true
  },
  {
    id: "banner-carousel-yeni",
    title: "Yeni Gelen Bodykit Ürünleri",
    title_color: "#111827",
    cta_text: "Yeni Ürünleri Keşfet",
    cta_link: "/store",
    cta_color: "#f02d9c",
    footer_note: "Haftanın en yeni BodyKit Merkezi tasarımları stoklarla sınırlı özel lansman fiyatlarıyla.",
    badge_text: "YENİ SEZON",
    bg_image_url: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1600&auto=format&fit=crop&q=80",
    bg_color: "#fce7f3",
    source_type: "latest",
    handle: "",
    limit: 8,
    position: "below_collection",
    free_shipping_text: "HIZLI KARGO",
    active: true
  },
  {
    id: "banner-carousel-coksatan",
    title: "Çok Satan Favori Modeller",
    title_color: "#111827",
    cta_text: "Popüler Ürünleri İncele",
    cta_link: "/store",
    cta_color: "#ea580c",
    footer_note: "Müşterilerimizin en çok tercih ettiği bodykit, spoiler ve difüzör setleri hızlı kargo fırsatıyla.",
    badge_text: "BEST SELLER 🔥",
    bg_image_url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1600&auto=format&fit=crop&q=80",
    bg_color: "#ffedd5",
    source_type: "collection",
    handle: "cok-satanlar",
    limit: 8,
    position: "below_collection",
    free_shipping_text: "HIZLI KARGO",
    active: true
  }
]

const defaultTrustBadges = [
  { id: "tb-1", title: "Ücretsiz Kargo", description: "3000 ₺ üzeri tüm siparişlerinizde kargo bedava", icon: "truck" },
  { id: "tb-2", title: "Hızlı Teslimat", description: "Siparişleriniz 24 saat içinde özenle kargoya teslim edilir", icon: "clock" },
  { id: "tb-3", title: "%100 Güvenli Ödeme", description: "256-bit SSL şifreleme ile kredi kartı ve kapıda ödeme", icon: "shield" },
  { id: "tb-4", title: "Kolay İade & Değişim", description: "14 gün içinde koşulsuz iade ve beden/ürün değişimi garantisi", icon: "refresh" }
]

const defaultData = {
  tag: "BODYKİT MERKEZİ • ÖZEL SERİ",
  title: "BodyKit Merkezi'ne Hoş Geldiniz",
  subtitle: "Aracınıza özel en kaliteli bodykit, difüzör, spoiler, ön lip ve marşpiyel modellerini hemen keşfedin",
  btn_text: "Şimdi Alışverişe Başla",
  btn_link: "/store",
  media_type: "image",
  media_url: "/uploads/hero-1774921088469-819611420.jpg",
  mobile_media_url: "",
  hero_height: "75vh",
  hero_overlay_opacity: 15,
  hero_text_color: "#09090B",
  hero_btn_bg: "#7C3AED",
  hero_btn_text_color: "#ffffff",
  hero_autoplay: true,
  hero_interval: 5000,
  show_hero_banner: true,
  hero_display_mode: "standard_hero",
  hero_slides: [],
  categories: defaultCategories,
  banners: defaultBanners,
  carousel_blocks: defaultCarouselBlocks,
  banner_carousels: defaultBannerCarousels,
  trust_badges: defaultTrustBadges,
  show_promo_banners: true,
  show_category_circles: true,
  show_trust_badges: true,
  top_announcement: "2026 YENİ SEZON BODYKİT & AKSESUAR KOLEKSİYONU",
  top_announcement_enabled: true,
  top_announcement_bg: "#000000",
  top_announcement_text_color: "#ffffff",
  scrolling_text_home: "3000 ₺ Üzeri Alışverişlerinizde Kargo Ücretsiz",
  scrolling_text_home_enabled: true,
  scrolling_text_home_bg: "#000000",
  scrolling_text_home_text_color: "#ffffff",
  scrolling_text_product: "Sepette %10 İndirim Kodu : BODYKIT10 • 3000 ₺ Üzeri Ücretsiz Kargo",
  scrolling_text_product_enabled: true,
  scrolling_text_product_bg: "#FFD700",
  scrolling_text_product_text_color: "#000000",
  buy_now_enabled: true,
  buy_now_text: "HEMEN AL",
  buy_now_bg: "#E50000",
  buy_now_text_color: "#ffffff",
  add_to_cart_enabled: true,
  add_to_cart_text: "SEPETE EKLE",
  add_to_cart_bg: "#000000",
  add_to_cart_text_color: "#ffffff",
  whatsapp_enabled: true,
  whatsapp_text: "WHATSAPP İLE SİPARİŞ",
  whatsapp_number: "905323370081",
  whatsapp_bg: "#ffffff",
  whatsapp_text_color: "#25D366",
  button_border_radius: "0px",
  header_settings: {
    sticky: true,
    bg_color: "#ffffff",
    text_color: "#000000",
    border_color: "#e5e7eb",
    logo_height_desktop: 44,
    logo_height_mobile: 36,
    show_search: true,
    show_account: true,
    show_cart: true
  },
  footer_settings: {
    bg_color: "#0a0a0c",
    text_color: "#ffffff",
    accent_color: "#ffffff",
    show_social: true,
    instagram_url: "https://instagram.com/bodykitmerkezi",
    facebook_url: "https://facebook.com/bodykitmerkezi",
    whatsapp_url: "https://wa.me/905323370081",
    tiktok_url: "",
    youtube_url: "",
    ssl_badge_text: "Bu site 256 Bit SSL sertifikası ile korunmaktadır.",
    show_payment_icons: true
  },
  product_detail_settings: {
    show_live_viewers: true,
    live_viewers_min: 12,
    live_viewers_max: 34,
    show_favorite_button: true,
    show_reviews_link: true,
    show_trust_row: true,
    trust_badge_1_text: "Güvenli Ödeme",
    trust_badge_2_text: "Aynı Gün Kargo",
    shipping_info_text: "Saat 15:00'a kadar verilen tüm siparişleriniz aynı gün kargoya teslim edilmektedir. Teslimat süresi ortalama 1-3 iş günüdür.",
    return_policy_text: "Siparişinizdeki ürünleri teslim aldığınız tarihten itibaren 14 gün içerisinde, kullanılmamış ve boyanmamış/monte edilmemiş olması şartıyla iade edebilirsiniz.",
    show_sticky_mobile_bar: true
  },
  cart_settings: {
    page_title: "Alışveriş Sepetim",
    show_free_shipping_bar: true,
    free_shipping_threshold: 3000,
    free_shipping_bar_color: "#10B981",
    show_coupon_box: true,
    checkout_btn_text: "Güvenli Ödemeye Geç",
    checkout_btn_bg: "#000000",
    checkout_btn_text_color: "#ffffff",
    trust_note_text: "256-Bit SSL Güvencesiyle Hızlı & Güvenli Alışveriş"
  },
  checkout_settings: {
    modal_title: "Hızlı ve Güvenli Ödeme",
    delivery_section_title: "Teslimat Adresi",
    payment_section_title: "Ödeme Yöntemi",
    accent_color: "#111827",
    submit_btn_text: "Siparişi Tamamla",
    submit_btn_bg: "#1A1A1A",
    submit_btn_text_color: "#ffffff",
    show_email: true,
    require_email: true,
    show_order_note: true,
    show_coupon: true,
    show_invoice_type: true,
    default_payment_method: "credit_card",
    ssl_badge_text: "Tüm bilgileriniz 256 bit SSL Sertifikası ile korunmaktadır.",
    copyright_text: "© 2026 BodyKit Merkezi. Tüm hakları saklıdır."
  },
  coupon_banner: {
    enabled: true,
    eyebrow: "BODYKİT MERKEZİ'NE ÖZEL",
    title_prefix: "SEPETTE EKSTRA",
    highlight_text: "%10",
    title_suffix: "İNDİRİM",
    description: "Kupon kodunu sepette veya hızlı ödeme ekranında girmeniz yeterli. Kampanya tüm yeni sezon ürünlerinde geçerlidir.",
    code_label: "KOD",
    code: "BODYKIT10",
    copy_text: "KOPYALA",
    copied_text: "KOPYALANDI",
    bg_color: "#0b0b0c",
    glow_color: "#c81e2d",
    accent_color: "#ff6a6a",
    show_popup_on_copy: true,
    popup_title: "Kupon Kodunuz Tanımlandı! 🎉",
    popup_description: "İndirim kuponunuz panoya kopyalandı ve ödeme formunuza otomatik olarak tanımlandı. Alışverişinizi tamamlarken ekstra indiriminiz anında uygulanacaktır.",
    popup_btn_text: "Alışverişe Başla & İndirimi Kullan",
    popup_btn_link: "/store",
    auto_apply_checkout: true
  },
  category_tab_carousel: {
    title: "BodyKit Collection",
    view_all_text: "Tümünü Gör",
    view_all_link: "/store",
    accent_color: "#c91d82",
    free_shipping_text: "HIZLI KARGO",
    show_installment_badge: true,
    show_coupon_badge: true,
    sepette_badge_text: "Sepette Ekstra %10 İndirim"
  },
  brand_showcase: {
    enabled: true,
    eyebrow: "ARACINIZA ÖZEL SEÇİM",
    title: "Araç Markasına Göre Bodykit & Aksesuar Vitrini",
    subtitle: "Aracınızın markasını seçin veya tüm markaların ürünlerini alt alta inceleyin.",
    view_all_text: "Tüm Mağaza Ürünlerini Gör",
    view_all_link: "/store",
    show_all_tab: true,
    all_tab_label: "TÜM MARKALAR",
    default_active_brand: "tumu",
    accent_color: "#7c3aed",
    card_accent_color: "#c91d82",
    free_shipping_text: "HIZLI KARGO",
    columns_desktop: 5,
    max_products_per_brand: 0,
    show_count_badge: true,
    show_other_products: true,
    other_products_title: "Diğer Marka & Üniversal Bodykit Ürünleri",
    other_products_subtitle: "Tüm araç modelleriyle uyumlu üniversal lip, spoiler, difüzör ve aksesuar çeşitleri"
  },
  car_brands: [
    {
      id: "bmw",
      name: "BMW",
      section_title: "BMW Bodykit & Spoiler Ürünleri",
      subtitle: "F30, F10, E90, E60, G20, M3, M4, M5 Bodykit, Spoiler & Difüzör Setleri",
      logo_url: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/bmw.png",
      keywords: ["bmw", "f30", "f10", "f20", "f22", "f32", "f36", "f80", "f82", "e90", "e92", "e60", "e46", "e36", "e39", "g20", "g30", "m performance", "bobrek", "böbrek"],
      view_all_link: "/store",
      active: true
    },
    {
      id: "volkswagen",
      name: "Volkswagen",
      section_title: "Volkswagen Bodykit & Spoiler Ürünleri",
      subtitle: "Golf 5, Golf 6, Golf 7, Golf 7.5, Golf 8, Passat B6/B7/B8, Polo, Jetta & Scirocco Bodykit",
      logo_url: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/volkswagen.png",
      keywords: ["volkswagen", "vw", "golf", "passat", "polo", "jetta", "scirocco", "tiguan", "arteon", "caddy", "transporter", "amarok", "r-line", "r line", "gti"],
      view_all_link: "/store",
      active: true
    },
    {
      id: "seat",
      name: "Seat",
      section_title: "Seat Bodykit & Spoiler Ürünleri",
      subtitle: "Leon MK2, Leon MK3, Leon MK4, FR, Cupra, Ibiza & Ateca Bodykit ve Spoiler Modelleri",
      logo_url: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/seat.png",
      keywords: ["seat", "leon", "ibiza", "ateca", "toledo", "arona", "cupra"],
      view_all_link: "/store",
      active: true
    },
    {
      id: "honda",
      name: "Honda",
      section_title: "Honda Bodykit & Spoiler Ürünleri",
      subtitle: "Civic FC5, FB7, FD6, FE1, FK8 Type-R, Accord & IES Bodykit, Tampon ve Spoiler Setleri",
      logo_url: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/honda.png",
      keywords: ["honda", "civic", "fc5", "fb7", "fd6", "fe1", "fk8", "fk2", "typer", "type-r", "type r", "ies", "vtec", "accord"],
      view_all_link: "/store",
      active: true
    },
    {
      id: "ford",
      name: "Ford",
      section_title: "Ford Bodykit & Spoiler Ürünleri",
      subtitle: "Focus 2, Focus 2.5, Focus 3, Focus 3.5, Focus 4, RS, ST, Fiesta, Mondeo & Ranger Bodykit",
      logo_url: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/ford.png",
      keywords: ["ford", "focus", "fiesta", "mondeo", "kuga", "ranger", "mustang", "puma", "courier", "connect"],
      view_all_link: "/store",
      active: true
    },
    {
      id: "fiat",
      name: "Fiat",
      section_title: "Fiat Bodykit & Spoiler Ürünleri",
      subtitle: "Egea Sedan, Egea HB, Linea, Punto, Bravo, Doblo & Fiorino Bodykit Setleri",
      logo_url: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/fiat.png",
      keywords: ["fiat", "egea", "linea", "punto", "doblo", "fiorino", "bravo", "tipo", "albea"],
      view_all_link: "/store",
      active: true
    },
    {
      id: "peugeot",
      name: "Peugeot",
      section_title: "Peugeot Bodykit & Spoiler Ürünleri",
      subtitle: "301, 206, 207, 208, 308, 407, 508, 2008, 3008 & Rifter Bodykit ve Aksesuar Ürünleri",
      logo_url: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/peugeot.png",
      keywords: ["peugeot", "peugoet", "206", "207", "208", "301", "308", "407", "508", "2008", "3008", "5008", "rifter"],
      view_all_link: "/store",
      active: true
    },
    {
      id: "opel",
      name: "Opel",
      section_title: "Opel Bodykit & Spoiler Ürünleri",
      subtitle: "Astra H, Astra J, Astra K, Insignia, Corsa D/E/F & Vectra Bodykit, Lip ve Difüzör",
      logo_url: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/opel.png",
      keywords: ["opel", "astra", "insignia", "corsa", "vectra", "mokka", "opc"],
      view_all_link: "/store",
      active: true
    },
    {
      id: "audi",
      name: "Audi",
      section_title: "Audi Bodykit & Spoiler Ürünleri",
      subtitle: "A3, A4, A5, A6, S-Line, RS3, RS4, RS5, RS6 & Q Serisi Bodykit, Panjur ve Spoiler",
      logo_url: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/audi.png",
      keywords: ["audi", "a3", "a4", "a5", "a6", "a7", "q3", "q5", "q7", "rs3", "rs4", "rs5", "rs6", "s-line", "s line"],
      view_all_link: "/store",
      active: true
    },
    {
      id: "mercedes",
      name: "Mercedes-Benz",
      section_title: "Mercedes-Benz Bodykit & Spoiler Ürünleri",
      subtitle: "W204, W205, W206, W212, W213, W176, W177, CLA, E-Serisi & C63 AMG Bodykit Setleri",
      logo_url: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/mercedes-benz.png",
      keywords: ["mercedes", "amg", "w204", "w205", "w206", "w212", "w213", "w176", "w177", "c180", "c200", "c63", "e180", "e200", "e250", "e63", "cla", "gla"],
      view_all_link: "/store",
      active: true
    },
    {
      id: "renault",
      name: "Renault",
      section_title: "Renault Bodykit & Spoiler Ürünleri",
      subtitle: "Megane 2, Megane 3, Megane 4, Clio 4, Clio 5, Fluence, Talisman, Symbol & Captur Bodykit",
      logo_url: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/renault.png",
      keywords: ["renault", "megane", "clio", "fluence", "talisman", "symbol", "captur", "kadjar", "kangoo"],
      view_all_link: "/store",
      active: true
    },
    {
      id: "hyundai",
      name: "Hyundai",
      section_title: "Hyundai Bodykit & Spoiler Ürünleri",
      subtitle: "i20, i30, Accent Blue, Accent Era, Elantra & Tucson Bodykit, Spoiler ve Difüzör",
      logo_url: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/hyundai.png",
      keywords: ["hyundai", "i20", "i30", "accent", "elantra", "tucson", "era", "blue"],
      view_all_link: "/store",
      active: true
    },
    {
      id: "toyota",
      name: "Toyota",
      section_title: "Toyota Bodykit & Spoiler Ürünleri",
      subtitle: "Corolla E160, E170, E210, Auris, Yaris, C-HR & Hilux Bodykit ve Tampon Ekleri",
      logo_url: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/toyota.png",
      keywords: ["toyota", "corolla", "auris", "yaris", "c-hr", "chr", "hilux", "avensis"],
      view_all_link: "/store",
      active: true
    },
    {
      id: "skoda",
      name: "Skoda",
      section_title: "Skoda Bodykit & Spoiler Ürünleri",
      subtitle: "Octavia A5/A7/A8, Superb, Fabia, Scala & Kamiq Bodykit, Spoiler ve Difüzör",
      logo_url: "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/skoda.png",
      keywords: ["skoda", "octavia", "superb", "fabia", "scala", "kamiq", "karoq", "kodiaq"],
      view_all_link: "/store",
      active: true
    }
  ]
}

function readHeroConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return defaultData
  }
  const content = fs.readFileSync(CONFIG_PATH, "utf-8")
  const parsed = JSON.parse(content)
  if (parsed.title && parsed.title.includes("XOOX")) {
    parsed.tag = defaultData.tag
    parsed.title = defaultData.title
    parsed.subtitle = defaultData.subtitle
  }
  return {
    ...defaultData,
    ...parsed,
    categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : defaultCategories,
    banners: parsed.banners && parsed.banners.length > 0 ? parsed.banners : defaultBanners,
    carousel_blocks: parsed.carousel_blocks && parsed.carousel_blocks.length > 0 ? parsed.carousel_blocks : defaultCarouselBlocks,
    banner_carousels: parsed.banner_carousels && parsed.banner_carousels.length > 0 ? parsed.banner_carousels : defaultBannerCarousels,
    trust_badges: parsed.trust_badges && parsed.trust_badges.length > 0 ? parsed.trust_badges : defaultTrustBadges,
    car_brands: parsed.car_brands && parsed.car_brands.length > 0 ? parsed.car_brands : defaultData.car_brands,
    header_settings: { ...defaultData.header_settings, ...(parsed.header_settings || {}) },
    footer_settings: { ...defaultData.footer_settings, ...(parsed.footer_settings || {}) },
    product_detail_settings: { ...defaultData.product_detail_settings, ...(parsed.product_detail_settings || {}) },
    cart_settings: { ...defaultData.cart_settings, ...(parsed.cart_settings || {}) },
    checkout_settings: { ...defaultData.checkout_settings, ...(parsed.checkout_settings || {}) },
    coupon_banner: { ...defaultData.coupon_banner, ...(parsed.coupon_banner || {}) },
    category_tab_carousel: { ...defaultData.category_tab_carousel, ...(parsed.category_tab_carousel || {}) },
    brand_showcase: { ...defaultData.brand_showcase, ...(parsed.brand_showcase || {}) }
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    return res.status(200).json({ success: true, config: readHeroConfig() })
  } catch (err) {
    return res.status(200).json({ success: true, config: defaultData })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const dir = path.dirname(CONFIG_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    const current = readHeroConfig()
    const body = (req.body || {}) as Record<string, any>
    const newData = {
      ...current,
      ...body,
      car_brands: Array.isArray(body.car_brands) && body.car_brands.length > 0 ? body.car_brands : current.car_brands,
      header_settings: { ...current.header_settings, ...(body.header_settings || {}) },
      footer_settings: { ...current.footer_settings, ...(body.footer_settings || {}) },
      product_detail_settings: { ...current.product_detail_settings, ...(body.product_detail_settings || {}) },
      cart_settings: { ...current.cart_settings, ...(body.cart_settings || {}) },
      checkout_settings: { ...current.checkout_settings, ...(body.checkout_settings || {}) },
      coupon_banner: { ...current.coupon_banner, ...(body.coupon_banner || {}) },
      category_tab_carousel: { ...current.category_tab_carousel, ...(body.category_tab_carousel || {}) },
      brand_showcase: { ...current.brand_showcase, ...(body.brand_showcase || {}) }
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(newData, null, 2), "utf-8")
    return res.status(200).json({ success: true, config: newData })
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message })
  }
}
