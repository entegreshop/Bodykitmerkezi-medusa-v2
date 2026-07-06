import { useState, useEffect, useMemo } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ShoppingBag, Adjustments, CheckCircle, XMark, Plus, Trash, ArrowPath, Pencil } from "@medusajs/icons"
import { PosModal } from "../routes/orders/components/pos-modal"

// Custom inline SVG icons for print options and statuses
const EInvoiceIcon = () => (
  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 8h10M7 12h10M7 16h5" />
    <circle cx="17" cy="15" r="1.5" className="fill-zinc-500" />
  </svg>
)

const InvoiceIcon = () => (
  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const PackageIcon = () => (
  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

const TruckIcon = () => (
  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 011 1v2.5a.5.5 0 01-.5.5H11m-6 0a1 1 0 100-2 1 1 0 000 2zm11 0a1 1 0 100-2 1 1 0 000 2zM13 16h4.5a1.5 1.5 0 001.5-1.5V9.5L16.5 6H13m4 6.5h2" />
  </svg>
)

const BarcodeIcon = () => (
  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h2M7 5h1M10 5h3M15 5h1M18 5h3M3 10h2M7 10h1M10 10h3M15 10h1M18 10h3M3 15h2M7 15h1M10 15h3M15 15h1M18 15h3M3 19h2M7 19h1M10 19h3M15 19h1M18 19h3" />
  </svg>
)

const PdfIcon = () => (
  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    <text x="7" y="15" fill="currentColor" fontSize="6" fontFamily="Arial" fontWeight="bold" className="text-zinc-600">PDF</text>
  </svg>
)

const EyeIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOutlineIcon = () => (
  <svg className="w-4 h-4 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const BarcodeSimpleIcon = () => (
  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2v16H3V4zm4 0h1v16H7V4zm3 0h2v16h-2V4zm4 0h1v16h-1V4zm3 0h4v16h-4V4z" />
  </svg>
)

const GiftIcon = () => (
  <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
)

const StarIcon = () => (
  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)

const CizgiLogo = () => (
  <svg width="40" height="20" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="50" y="25" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="900" fill="#18181b" textAnchor="middle" letterSpacing="2">ÇİZGİ</text>
  </svg>
)

// Main structure interface
interface OrderItem {
  id: string
  title: string
  sku: string
  barcode: string
  size: string
  unit_price: number
  quantity: number
  vat_rate: number // percent, e.g. 10
  thumbnail: string
}

interface OrderLog {
  id: string
  message: string
  created_at: string
}

interface CustomOrder {
  id: string
  display_id: string
  platform: "WhatsApp" | "Cizgibutik"
  store: string
  order_tag: string
  discount_total?: any
  discounts?: any[]
  customer: {
    first_name: string
    last_name: string
    phone: string
    email: string
    ip: string
    member_no: string
    is_visitor: boolean
  }
  shipping_address: {
    first_name: string
    last_name: string
    address_1: string
    address_2: string
    city: string // province
    district: string // ilce
    country_code: string
    country_name: string
    phone: string
  }
  billing_address: {
    first_name: string
    last_name: string
    address_1: string
    address_2: string
    city: string
    district: string
    country_code: string
    country_name: string
    phone: string
    tax_no?: string
    tax_office?: string
    tc_no?: string
  }
  items: OrderItem[]
  subtotal: number // TL
  vat_total: number // TL
  total: number // TL
  payment_method: string // human readable e.g. "Kapıda Nakit Ödeme"
  payment_option: "paytr" | "bank_transfer" | "cash_on_delivery" | "card_on_delivery"
  status: "onay_bekleyen" | "hazirlanan" | "kargolanan" | "teslim_edilen" | "iade_edilen" | "iptal_edilen" | "odeme_hatasi" | "tum_siparisler"
  carrier_name: string // e.g. "KARGOİST", "INTERLINE KARGO"
  carrier_barcode?: string
  created_at: string // format DD.MM.YYYY HH:MM
  admin_notes?: string
  logs: OrderLog[]
  integration_logs: OrderLog[]
  invoice_series?: string
  invoice_date?: string
  e_invoice_date?: string
  metadata?: Record<string, any>
}

// ==========================================
// RİSKLİ MÜŞTERİ KONTROL FONKSİYONU
// ==========================================
const checkIsCustomerRisky = (phone?: string, email?: string, orderId?: string) => {
  if (!phone && !email) return false;
  
  // Clean phone number (remove spaces, +90, etc)
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '').slice(-10) : "";
  const cleanEmail = email ? email.toLowerCase().trim() : "";

  // Iterate over all orders directly from mappedRealOrders (assuming it's in scope, 
  // but wait, we need to pass currentOrders to it, or defined it inside the component)
  return false; // We will define the real logic inside the component
}
// ==========================================

const SiparisYonetimiPage = () => {
  const [isPosOpen, setIsPosOpen] = useState(false)
  
  // Success Modal State
  const [successModal, setSuccessModal] = useState<string | null>(null)
  const showSuccess = (message: string) => {
    setSuccessModal(message)
  }

  // Real orders list from API
  const [realOrders, setRealOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)


  // Selected Order for Details Modal
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  // Bulk operation selections
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])

  // Search & Filter Panel state
  const [showFilters, setShowFilters] = useState(false)
  const [quickSearch, setQuickSearch] = useState("")

  // Tab selections
  // tabs: "onay_bekleyen" | "hazirlanan" | "kargolanan" | "teslim_edilen" | "iade_edilen" | "iptal_edilen" | "tum_siparisler" | "odeme_hatasi"
  const [activeTab, setActiveTab] = useState<string>("tum_siparisler")

  // Form Filter States
  const [filterStatus, setFilterStatus] = useState("Yeni Sipariş, Hazırlanan Sipariş, Kargolanan Sipariş, Teslim Edilen Sipariş")
  const [filterPlatform, setFilterPlatform] = useState("")
  const [filterStore, setFilterStore] = useState("")
  const [filterTag, setFilterTag] = useState("")
  const [filterOrderNo, setFilterOrderNo] = useState("")
  const [filterOrderDateStart, setFilterOrderDateStart] = useState("")
  const [filterOrderDateEnd, setFilterOrderDateEnd] = useState("")
  const [filterInvoiceDateStart, setFilterInvoiceDateStart] = useState("")
  const [filterInvoiceDateEnd, setFilterInvoiceDateEnd] = useState("")
  const [filterEInvoiceDateStart, setFilterEInvoiceDateStart] = useState("")
  const [filterEInvoiceDateEnd, setFilterEInvoiceDateEnd] = useState("")
  const [filterTotalMin, setFilterTotalMin] = useState("")
  const [filterTotalMax, setFilterTotalMax] = useState("")
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("")
  const [filterCustomerFirstName, setFilterCustomerFirstName] = useState("")
  const [filterCustomerLastName, setFilterCustomerLastName] = useState("")
  const [filterPhone, setFilterPhone] = useState("")
  const [filterTaxNo, setFilterTaxNo] = useState("")
  const [filterTaxOffice, setFilterTaxOffice] = useState("")
  const [filterTcNo, setFilterTcNo] = useState("")
  const [filterMemberNo, setFilterMemberNo] = useState("")
  const [filterCountry, setFilterCountry] = useState("")
  const [filterProvince, setFilterProvince] = useState("")
  const [filterProductNo, setFilterProductNo] = useState("")
  const [filterProductBarcode, setFilterProductBarcode] = useState("")
  const [filterProductName, setFilterProductName] = useState("")
  const [filterProductTag, setFilterProductTag] = useState("")
  const [filterGiftCardCode, setFilterGiftCardCode] = useState("")
  const [filterPromo, setFilterPromo] = useState("")
  const [filterCarrier, setFilterCarrier] = useState("")
  const [filterAdvancedSearch, setFilterAdvancedSearch] = useState("")

  // Selected editable Manager Notes inside Modal
  const [editingNotes, setEditingNotes] = useState(false)
  const [tempNotesText, setTempNotesText] = useState("")

  // Selected editable Fatura Seri inside Modal
  const [editingInvoiceSeries, setEditingInvoiceSeries] = useState(false)
  const [tempInvoiceSeriesText, setTempInvoiceSeriesText] = useState("")

  // Editable info blocks
  const [editingCustomer, setEditingCustomer] = useState(false)
  const [tempCustomer, setTempCustomer] = useState({ first_name: "", last_name: "", email: "", phone: "" })
  const [editingShipping, setEditingShipping] = useState(false)
  const [tempShipping, setTempShipping] = useState({ first_name: "", last_name: "", address_1: "", district: "", city: "" })
  const [editingBilling, setEditingBilling] = useState(false)
  const [tempBilling, setTempBilling] = useState({ first_name: "", last_name: "", address_1: "", district: "", city: "", tc_no: "" })

  const [editingProducts, setEditingProducts] = useState(false)
  const [tempProducts, setTempProducts] = useState<{id: string, unit_price: number, quantity: number}[]>([])

  // Product Search Modal State
  const [showProductSearchModal, setShowProductSearchModal] = useState(false)
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [productSearchResults, setProductSearchResults] = useState<any[]>([
    {
      id: "prod_dummy_1",
      title: "Pembe Alo Arabiyeli Taytlı Takım",
      thumbnail: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
      variants: [
        { id: "var_1", title: "S", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
        { id: "var_2", title: "M", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
        { id: "var_3", title: "L", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
        { id: "var_4", title: "XL", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
      ]
    },
    {
      id: "prod_dummy_2",
      title: "Kahve Alo Arabiyeli Taytlı Takım",
      thumbnail: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
      variants: [
        { id: "var_5", title: "S", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
        { id: "var_6", title: "M", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
        { id: "var_7", title: "L", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
        { id: "var_8", title: "XL", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
      ]
    }
  ])
  const [searchingProducts, setSearchingProducts] = useState(false)

  useEffect(() => {
    if (showProductSearchModal && productSearchQuery.trim()) {
      const delayFn = setTimeout(() => {
        handleSearchProducts()
      }, 400)
      return () => clearTimeout(delayFn)
    } else if (showProductSearchModal && !productSearchQuery.trim()) {
      // Revert to default when empty
      setProductSearchResults([
        {
          id: "prod_dummy_1",
          title: "Pembe Alo Arabiyeli Taytlı Takım",
          thumbnail: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
          variants: [
            { id: "var_1", title: "S", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
            { id: "var_2", title: "M", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
            { id: "var_3", title: "L", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
            { id: "var_4", title: "XL", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
          ]
        },
        {
          id: "prod_dummy_2",
          title: "Kahve Alo Arabiyeli Taytlı Takım",
          thumbnail: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
          variants: [
            { id: "var_5", title: "S", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
            { id: "var_6", title: "M", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
            { id: "var_7", title: "L", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
            { id: "var_8", title: "XL", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
          ]
        }
      ])
    }
  }, [productSearchQuery, showProductSearchModal])

  // Action menu inside Modal
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false)
  const [isBulkActionMenuOpen, setIsBulkActionMenuOpen] = useState(false)

  // Status Change Modal State
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusModalTargetIds, setStatusModalTargetIds] = useState<string[]>([])
  const [newStatusValue, setNewStatusValue] = useState("yeni_siparis")
  const [notifyCustomer, setNotifyCustomer] = useState(true)

  // Shipment Modal State
  const [showShipmentModal, setShowShipmentModal] = useState(false)
  const [shipmentModalTargetIds, setShipmentModalTargetIds] = useState<string[]>([])
  const [selectedCarrier, setSelectedCarrier] = useState("kargonova")

  // Print Modal State
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [printModalTargetIds, setPrintModalTargetIds] = useState<string[]>([])
  const [printTemplate, setPrintTemplate] = useState("E-Fatura")

  // Fetch real orders from Medusa V2 on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/admin/orders?limit=100&order=-created_at&fields=id,status,created_at,email,display_id,payment_status,fulfillment_status,total,currency_code,*customer,*sales_channel,*payment_collections,*items,*shipping_address,*billing_address,metadata")
        if (res.ok) {
          const data = await res.json()
          if (data && data.orders) {
            const parsedOrders = data.orders.map((o: any) => {
               if (o.metadata?.edited_customer) o.customer = { ...o.customer, ...o.metadata.edited_customer };
               if (o.metadata?.edited_shipping) o.shipping_address = { ...o.shipping_address, ...o.metadata.edited_shipping };
               if (o.metadata?.edited_billing) o.billing_address = { ...o.billing_address, ...o.metadata.edited_billing };
               if (o.metadata?.edited_items) o.items = o.metadata.edited_items;
               if (o.metadata?.edited_total != null && !isNaN(o.metadata?.edited_total)) o.total = o.metadata.edited_total;
               if (o.metadata?.edited_email) o.email = o.metadata.edited_email;
               return o;
            });
            setRealOrders(parsedOrders)
          }
        } else {
          console.error("Failed to load orders, status:", res.status)
        }
      } catch (err) {
        console.error("Failed to load orders from API:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  // Map Medusa V2 Real orders to our CustomOrder structure
  const mappedRealOrders = useMemo(() => {
    return realOrders.map((o: any) => {
      const itemsMapped: OrderItem[] = (o.items || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        sku: item.variant?.sku || "",
        barcode: item.variant?.barcode || "",
        size: item.variant_title || item.variant?.title || "Standart",
        unit_price: (item.unit_price || 0) / 100,
        quantity: item.quantity || 1,
        vat_rate: 10, // Medusa standard default
        thumbnail: item.thumbnail || ""
      }))

      const subtotalVal = itemsMapped.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0)
      const totalVal = (o.total || 0) / 100

      // Try to determine payment method name
      let payMethod = "Kredi Kartı"
      const metaOption = o.metadata?.payment_option
      if (metaOption === "cash_on_delivery") payMethod = "Kapıda Nakit Ödeme"
      else if (metaOption === "card_on_delivery") payMethod = "Kapıda Kredi Kartı ile Ödeme"
      else if (metaOption === "bank_transfer") payMethod = "Havale / EFT"
      else if (metaOption === "paytr") payMethod = "PayTR"

      // Map shipping option/carrier
      const carrierName = o.shipping_methods?.[0]?.name || "Diğer Kargo"

      // Logs
      const logsMapped: OrderLog[] = []
      if (o.metadata?.logs) {
        logsMapped.push(...o.metadata.logs)
      } else {
        logsMapped.push({ id: "real_l1", message: "Sipariş oluşturuldu", created_at: new Date(o.created_at).toLocaleString('tr-TR') })
        if (o.fulfillment_status === "fulfilled" || o.fulfillment_status === "shipped") {
          logsMapped.push({ id: "real_l2", message: "Sipariş paketlendi ve kargolandı", created_at: new Date(o.updated_at).toLocaleString('tr-TR') })
        }
      }

      // Order status mapping
      let orderStatus: CustomOrder["status"] = "tum_siparisler" as any
      if (o.metadata?.delivery_status) {
        orderStatus = o.metadata.delivery_status as CustomOrder["status"]
      } else if (o.status === "canceled") orderStatus = "iptal_edilen"
      else if (o.fulfillment_status === "shipped") orderStatus = "kargolanan"
      else if (o.status === "completed") orderStatus = "teslim_edilen"
      else if (o.fulfillment_status === "fulfilled") orderStatus = "hazirlanan"
      else orderStatus = "onay_bekleyen"

      return {
        id: o.id,
        display_id: o.display_id?.toString() || o.id.slice(-8),
        platform: o.metadata?.platform || "Cizgibutik",
        store: "Cizgibutik",
        order_tag: o.metadata?.order_tag || "Seçilmedi",
        customer: {
          first_name: o.customer?.first_name || o.shipping_address?.first_name || "Müşteri",
          last_name: o.customer?.last_name || o.shipping_address?.last_name || "",
          phone: o.customer?.phone || o.shipping_address?.phone || "",
          email: o.customer?.email || o.email || "",
          ip: o.metadata?.ip_address || "127.0.0.1",
          member_no: o.customer?.id ? `U-${o.customer.id.slice(-4).toUpperCase()}` : "Misafir",
          is_visitor: !o.customer?.id
        },
        shipping_address: {
          first_name: o.shipping_address?.first_name || "",
          last_name: o.shipping_address?.last_name || "",
          address_1: o.shipping_address?.address_1 || "",
          address_2: o.shipping_address?.address_2 || "",
          city: o.shipping_address?.province || o.shipping_address?.city || "",
          district: o.shipping_address?.city || "",
          country_code: o.shipping_address?.country_code || "tr",
          country_name: "Türkiye",
          phone: o.shipping_address?.phone || ""
        },
        billing_address: {
          first_name: o.billing_address?.first_name || o.shipping_address?.first_name || "",
          last_name: o.billing_address?.last_name || o.shipping_address?.last_name || "",
          address_1: o.billing_address?.address_1 || o.shipping_address?.address_1 || "",
          address_2: o.billing_address?.address_2 || o.shipping_address?.address_2 || "",
          city: o.billing_address?.province || o.billing_address?.city || "",
          district: o.billing_address?.city || "",
          country_code: o.billing_address?.country_code || "tr",
          country_name: "Türkiye",
          phone: o.billing_address?.phone || "",
          tc_no: o.metadata?.tc_no || "",
          tax_no: o.metadata?.tax_no || "",
          tax_office: o.metadata?.tax_office || ""
        },
        items: itemsMapped,
        subtotal: subtotalVal,
        vat_total: totalVal - subtotalVal > 0 ? totalVal - subtotalVal : totalVal * 0.1,
        total: totalVal,
        payment_method: payMethod,
        payment_option: metaOption || "cash_on_delivery",
        status: orderStatus,
        carrier_name: carrierName,
        carrier_barcode: o.metadata?.carrier_barcode || "",
        created_at: new Date(o.created_at).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        admin_notes: o.metadata?.admin_notes || "",
        logs: logsMapped,
        integration_logs: o.metadata?.integration_logs || [],
        invoice_series: o.metadata?.invoice_series || "-",
        invoice_date: o.metadata?.invoice_date || "",
        e_invoice_date: o.metadata?.e_invoice_date || ""
      } as CustomOrder
    })
  }, [realOrders])

  // Current orders list is now always real orders
  const currentOrders = mappedRealOrders

  // Tab Filtering logic
  const tabFilteredOrders = useMemo(() => {
    if (activeTab === "tum_siparisler") return currentOrders

    return currentOrders.filter(o => {
      if (activeTab === "onay_bekleyen") return o.status === "onay_bekleyen"
      if (activeTab === "hazirlanan") return o.status === "hazirlanan"
      if (activeTab === "kargolanan") return o.status === "kargolanan"
      if (activeTab === "teslim_edilen") return o.status === "teslim_edilen"
      if (activeTab === "iade_edilen") return o.status === "iade_edilen"
      if (activeTab === "iptal_edilen") return o.status === "iptal_edilen"
      if (activeTab === "odeme_hatasi") return o.status === "odeme_hatasi"
      return true
    })
  }, [currentOrders, activeTab])

  // Count of "Hazırlananlar" for the emerald tab badge
  const preparingCount = useMemo(() => {
    return currentOrders.filter(o => o.status === "hazirlanan").length
  }, [currentOrders])

  // Full Filters & Quick Search application
  const filteredOrdersList = useMemo(() => {
    return tabFilteredOrders.filter(o => {
      // 1. Quick search
      if (quickSearch) {
        const query = quickSearch.toLowerCase()
        const matchNo = o.display_id.toLowerCase().includes(query)
        const matchCust = `${o.customer.first_name} ${o.customer.last_name}`.toLowerCase().includes(query)
        const matchPhone = o.customer.phone.toLowerCase().includes(query)
        if (!matchNo && !matchCust && !matchPhone) return false
      }

      // 2. Platform filter
      if (filterPlatform && o.platform.toLowerCase() !== filterPlatform.toLowerCase()) return false

      // 3. Sipariş No filter
      if (filterOrderNo && !o.display_id.includes(filterOrderNo)) return false

      // 4. Müşteri Adı
      if (filterCustomerFirstName && !o.customer.first_name.toLowerCase().includes(filterCustomerFirstName.toLowerCase())) return false

      // 5. Müşteri Soyadı
      if (filterCustomerLastName && !o.customer.last_name.toLowerCase().includes(filterCustomerLastName.toLowerCase())) return false

      // 6. Telefon
      if (filterPhone && !o.customer.phone.replace(/\D/g, "").includes(filterPhone.replace(/\D/g, ""))) return false

      // 7. TC No
      if (filterTcNo && o.billing_address.tc_no !== filterTcNo) return false

      // 8. Kargo Firması
      if (filterCarrier && o.carrier_name.toLowerCase() !== filterCarrier.toLowerCase()) return false

      // 9. Ödeme Yöntemi
      if (filterPaymentMethod && o.payment_method.toLowerCase() !== filterPaymentMethod.toLowerCase()) return false

      // 10. Tutar Aralığı
      if (filterTotalMin && o.total < parseFloat(filterTotalMin)) return false
      if (filterTotalMax && o.total > parseFloat(filterTotalMax)) return false

      // 11. İl
      if (filterProvince && !o.shipping_address.city.toLowerCase().includes(filterProvince.toLowerCase())) return false

      // 12. Ürün Adı
      if (filterProductName) {
        const hasProduct = o.items.some(item => item.title.toLowerCase().includes(filterProductName.toLowerCase()))
        if (!hasProduct) return false
      }

      return true
    })
  }, [tabFilteredOrders, quickSearch, filterPlatform, filterOrderNo, filterCustomerFirstName, filterCustomerLastName, filterPhone, filterTcNo, filterCarrier, filterPaymentMethod, filterTotalMin, filterTotalMax, filterProvince, filterProductName])

  // Select all handler
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(filteredOrdersList.map(o => o.id))
    } else {
      setSelectedOrderIds([])
    }
  }

  // Row selection handler
  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds([...selectedOrderIds, id])
    } else {
      setSelectedOrderIds(selectedOrderIds.filter(x => x !== id))
    }
  }

  // Active Selected Order details object
  const activeOrderDetails = useMemo(() => {
    return currentOrders.find(o => o.id === selectedOrderId) || null
  }, [currentOrders, selectedOrderId])

  // Clear filters
  const handleClearFilters = () => {
    setFilterStatus("Yeni Sipariş, Hazırlanan Sipariş, Kargolanan Sipariş, Teslim Edilen Sipariş")
    setFilterPlatform("")
    setFilterStore("")
    setFilterTag("")
    setFilterOrderNo("")
    setFilterOrderDateStart("")
    setFilterOrderDateEnd("")
    setFilterInvoiceDateStart("")
    setFilterInvoiceDateEnd("")
    setFilterEInvoiceDateStart("")
    setFilterEInvoiceDateEnd("")
    setFilterTotalMin("")
    setFilterTotalMax("")
    setFilterPaymentMethod("")
    setFilterCustomerFirstName("")
    setFilterCustomerLastName("")
    setFilterPhone("")
    setFilterTaxNo("")
    setFilterTaxOffice("")
    setFilterTcNo("")
    setFilterMemberNo("")
    setFilterCountry("")
    setFilterProvince("")
    setFilterProductNo("")
    setFilterProductBarcode("")
    setFilterProductName("")
    setFilterProductTag("")
    setFilterGiftCardCode("")
    setFilterPromo("")
    setFilterCarrier("")
    setFilterAdvancedSearch("")
  }

  // Quick Action: Teslim Et (Mark Delivered)
  const handleMarkDelivered = async (orderId: string) => {
    const timeStr = new Date().toLocaleString("tr-TR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    
    // Real API status update via Medusa Order metadata update
      try {
        const target = currentOrders.find(x => x.id === orderId)
        if (!target) return
        
        const updatedLogs = [
          { id: `dl_${Date.now()}`, message: "admin teslim edildi olarak işaretledi", created_at: timeStr },
          ...target.logs
        ]

        const res = await fetch(`/admin/orders/${orderId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "completed",
            metadata: {
              ...target.billing_address, // keep old metadata
              delivery_status: "delivered",
              logs: updatedLogs
            }
          })
        })
        if (res.ok) {
          const data = await res.json()
          // Re-fetch orders list
          const refreshRes = await fetch("/admin/orders?limit=100")
          const refreshData = await refreshRes.json()
          if (refreshData && refreshData.orders) {
            setRealOrders(refreshData.orders)
            showSuccess("Sipariş başarıyla teslim edildi olarak işaretlendi.")
          }
        } else {
          alert("Sipariş güncellenirken hata oluştu.")
        }
      } catch (err) {
        console.error("Error updating order:", err)
        alert("Bağlantı hatası.")
      }
  }
  // Generic Status Change
  const handleStatusChange = async (orderId: string, newStatus: string, skipRefresh: boolean = false) => {
    try {
      const res = await fetch(`/admin/orders/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: { delivery_status: newStatus }
        })
      })
      if (res.ok && !skipRefresh) {
        const refreshRes = await fetch("/admin/orders?limit=100&fields=*customer,*shipping_address,*billing_address,*items")
        const refreshData = await refreshRes.json()
        if (refreshData && refreshData.orders) setRealOrders(refreshData.orders)
      }
    } catch(err) {
      console.error(err)
    }
  }

  // Quick Action: İptal Et (Cancel Order)
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Bu siparişi iptal etmek istediğinize emin misiniz?")) return
    const timeStr = new Date().toLocaleString("tr-TR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

    try {
        const res = await fetch(`/admin/orders/${orderId}/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        })
        if (res.ok) {
          showSuccess("Sipariş başarıyla güncellendi.")
          const refreshRes = await fetch("/admin/orders?limit=100&fields=*customer,*shipping_address,*billing_address,*items")
          const refreshData = await refreshRes.json()
          if (refreshData && refreshData.orders) {
            setRealOrders(refreshData.orders)
          }
        } else {
          alert("Sipariş iptal edilirken hata oluştu.")
        }
      } catch (err) {
        console.error(err)
      }
  }

  // Save Manager Notes inside Modal
  const handleSaveNotes = () => {
    // In real mode, would send metadata update to backend
    setRealOrders(prev => prev.map(o => {
      if (o.id === selectedOrderId) {
        return {
          ...o,
          metadata: { ...o.metadata, admin_notes: tempNotesText }
        }
      }
      return o
    }))
    setEditingNotes(false)
  }
  const handleSaveInvoiceSeries = () => {
    // In real mode, would send metadata update to backend
    setRealOrders(prev => prev.map(o => {
      if (o.id === selectedOrderId) {
        return {
          ...o,
          metadata: { ...o.metadata, invoice_series: tempInvoiceSeriesText }
        }
      }
      return o
    }))
    setEditingInvoiceSeries(false)
  }

  const handleSaveCustomer = async () => {
    setRealOrders(prev => prev.map(o => {
      if (o.id === selectedOrderId) {
        return {
          ...o,
          customer: { ...o.customer, ...tempCustomer },
          email: tempCustomer.email
        }
      }
      return o
    }))
    setEditingCustomer(false)
    const order = realOrders.find(o => o.id === selectedOrderId)
    try {
      await fetch(`/admin/orders/${selectedOrderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: tempCustomer.email,
          metadata: { ...order?.metadata, edited_customer: tempCustomer, edited_email: tempCustomer.email }
        })
      })
    } catch (err) {}
  }

  const handleSaveShipping = async () => {
    setRealOrders(prev => prev.map(o => {
      if (o.id === selectedOrderId) {
        return {
          ...o,
          shipping_address: { ...o.shipping_address, ...tempShipping }
        }
      }
      return o
    }))
    setEditingShipping(false)
    const order = realOrders.find(o => o.id === selectedOrderId)
    try {
      await fetch(`/admin/orders/${selectedOrderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          metadata: { ...order?.metadata, edited_shipping: tempShipping }
        })
      })
    } catch (err) {}
  }

  const handleSaveBilling = async () => {
    setRealOrders(prev => prev.map(o => {
      if (o.id === selectedOrderId) {
        return {
          ...o,
          billing_address: { ...o.billing_address, ...tempBilling }
        }
      }
      return o
    }))
    setEditingBilling(false)
    const order = realOrders.find(o => o.id === selectedOrderId)
    try {
      await fetch(`/admin/orders/${selectedOrderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          metadata: { ...order?.metadata, edited_billing: tempBilling }
        })
      })
    } catch (err) {}
  }

  const handleSaveProducts = async () => {
    const order = realOrders.find(o => o.id === selectedOrderId);
    if (!order) return;

    const newItems = order.items
      .filter((i: any) => tempProducts.some(t => t.id === i.id))
      .map((i: any) => {
        const tp = tempProducts.find(t => t.id === i.id)
        if (tp) {
          return { ...i, unit_price: tp.unit_price * 100, quantity: tp.quantity }
        }
        return i
      });
    
    const oldItemsSum = order.items.reduce((acc: number, i: any) => acc + (i.unit_price * i.quantity), 0);
    const newItemsSum = newItems.reduce((acc: number, i: any) => acc + (i.unit_price * i.quantity), 0);
    const newTotal = order.total - oldItemsSum + newItemsSum;

    setRealOrders(prev => prev.map(o => {
      if (o.id === selectedOrderId) {
        return { ...o, total: newTotal, items: newItems }
      }
      return o
    }))
    setEditingProducts(false)

    try {
      await fetch(`/admin/orders/${selectedOrderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          metadata: { ...order.metadata, edited_items: newItems, edited_total: newTotal }
        })
      })
    } catch (err) {}
  }

  const handleSearchProducts = async () => {
    if (!productSearchQuery.trim()) return;
    setSearchingProducts(true);
    
    // Dummy products fallback
    const dummyProducts = [
      {
        id: "prod_dummy_1",
        title: "Pembe Alo Arabiyeli Taytlı Takım",
        thumbnail: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
        variants: [
          { id: "var_1", title: "S", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
          { id: "var_2", title: "M", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
          { id: "var_3", title: "L", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
          { id: "var_4", title: "XL", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
        ]
      },
      {
        id: "prod_dummy_2",
        title: "Kahve Alo Arabiyeli Taytlı Takım",
        thumbnail: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
        variants: [
          { id: "var_5", title: "S", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
          { id: "var_6", title: "M", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
          { id: "var_7", title: "L", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
          { id: "var_8", title: "XL", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
        ]
      }
    ];

    try {
      const res = await fetch(`/admin/products?q=${encodeURIComponent(productSearchQuery)}&fields=id,title,thumbnail,description,status,created_at,updated_at,*variants,*variants.options,*options,*variants.prices`);
      const data = await res.json();
      if (data && data.products && data.products.length > 0) {
        setProductSearchResults(data.products);
      } else {
        setProductSearchResults(dummyProducts);
      }
    } catch (err) {
      console.error(err);
      setProductSearchResults(dummyProducts);
    } finally {
      setSearchingProducts(false);
    }
  }

  const handleAddProductToOrder = async (product: any, variant: any) => {
    const order = realOrders.find(o => o.id === selectedOrderId);
    if (!order) return;

    const newItem = {
      id: `item_${Math.random().toString(36).substr(2, 9)}`,
      title: product.title,
      variant: variant,
      variant_title: variant.title,
      unit_price: variant.prices?.find((p: any) => p.currency_code?.toLowerCase() === "try")?.amount ?? variant.calculated_price?.calculated_amount ?? variant.prices?.[0]?.amount ?? 0,
      quantity: 1,
      thumbnail: product.thumbnail || "",
      vat_rate: 10,
      sku: variant.sku || "",
      barcode: variant.barcode || ""
    };
    
    const newItems = [...order.items, newItem];
    const oldItemsSum = order.items.reduce((acc: number, i: any) => acc + (i.unit_price * i.quantity), 0);
    const newItemsSum = newItems.reduce((acc: number, i: any) => acc + (i.unit_price * i.quantity), 0);
    const newTotal = order.total - oldItemsSum + newItemsSum;

    setRealOrders(prev => prev.map(o => {
      if (o.id === selectedOrderId) {
        return {
          ...o,
          total: newTotal,
          items: newItems
        }
      }
      return o
    }))
    setShowProductSearchModal(false)
    showSuccess("Ürün siparişe eklendi.")

    try {
      await fetch(`/admin/orders/${selectedOrderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          metadata: { ...order.metadata, edited_items: newItems, edited_total: newTotal }
        })
      })
    } catch (err) {}
  }

  // Trigger Print popup simulation
  const triggerPrintSimulation = (type: string, orderIdOrIds: string | string[]) => {
    const ids = Array.isArray(orderIdOrIds) ? orderIdOrIds : [orderIdOrIds]
    const ordersToPrint = currentOrders.filter(o => ids.includes(o.id))
    if (ordersToPrint.length === 0) return

    const width = 800
    const height = 600
    const left = (window.innerWidth - width) / 2
    const top = (window.innerHeight - height) / 2
    const printWindow = window.open("", "_blank", `width=${width},height=${height},top=${top},left=${left}`)
    
    if (printWindow) {
      if (type === "Kargo Fişi") {
        printWindow.document.write(`
          <html>
            <head>
              <title>${type} - Toplu Yazdırma</title>
              <style>
                body { font-family: 'Times New Roman', serif; margin: 0; padding: 0; color: #000; box-sizing: border-box; }
                .page-break-container { page-break-after: always; padding: 10px; }
                .page-break-container:last-child { page-break-after: auto; }
                .top-bar { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 10px; font-family: Arial, sans-serif; }
                .logo-container { text-align: center; margin-bottom: 10px; }
                .logo-main { font-size: 36px; font-family: 'Arial Black', sans-serif; font-weight: 900; letter-spacing: 6px; margin: 0; line-height: 1; }
                .logo-sub { font-size: 10px; font-family: 'Arial', sans-serif; font-weight: bold; letter-spacing: 12px; margin-top: -12px; position: relative; z-index: 10; background: white; display: inline-block; padding: 0 5px; }
                .info-box { border: 2px solid #000; border-bottom: none; }
                .info-row { text-align: center; padding: 8px; border-bottom: 2px solid #000; font-size: 16px; font-weight: bold; }
                .info-row.address { font-size: 13px; padding: 12px 8px; }
                .products-box { border: 2px solid #000; padding: 10px; min-height: 150px; }
                .product-item { display: flex; align-items: center; margin-bottom: 10px; font-family: 'Times New Roman', serif; }
                .product-img { width: 45px; height: 60px; background: #eee; margin-right: 15px; overflow: hidden; }
                .product-img img { width: 100%; height: 100%; object-fit: cover; }
                .product-details { flex: 1; display: flex; align-items: center; font-size: 12px; font-weight: bold; }
                .product-sku { width: 90px; }
                .product-name { flex: 1; }
                .product-qty { width: 30px; text-align: right; }
                .bottom-info { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin-top: 10px; padding: 0 5px; }
                .total-box { border: 2px solid #000; display: flex; justify-content: space-between; padding: 5px 10px; font-size: 20px; font-weight: bold; margin-top: 5px; }
                .barcode-box { text-align: center; margin-top: 10px; }
                .barcode-text { font-size: 12px; font-weight: bold; font-family: Arial, sans-serif; }
                .barcode-img { height: 50px; width: 100%; max-width: 250px; margin: 5px auto 0; background: repeating-linear-gradient(90deg, #000, #000 2px, transparent 2px, transparent 5px, #000 5px, #000 8px, transparent 8px, transparent 11px, #000 11px, #000 16px, transparent 16px, transparent 18px); }
                .footer { display: flex; justify-content: space-between; font-size: 10px; margin-top: 20px; font-family: Arial, sans-serif; }
                @media print { 
                  @page { size: A5 portrait; margin: 5mm; }
                  .no-print { display: none; } 
                }
              </style>
            </head>
            <body>
              ${ordersToPrint.map((orderObj, idx) => `
              <div class="page-break-container">
                <div class="top-bar">
                  <div>${new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  <div class="no-print" style="cursor:pointer; text-decoration:underline;" onclick="window.print()">Yazdır</div>
                </div>
                
                <div class="logo-container">
                  <div style="position: relative; display: inline-block;">
                    <div class="logo-main">Ç İ Z G İ</div>
                    <div style="position: absolute; top: 15px; left: 0; width: 100%; display: flex; justify-content: space-around; font-family: Arial; font-size: 10px; font-weight: bold;">
                      <span>B</span><span>U</span><span>T</span><span>İ</span><span>K</span>
                    </div>
                  </div>
                </div>

                <div class="info-box">
                  <div class="info-row" style="text-transform: uppercase;">${orderObj.customer.first_name} ${orderObj.customer.last_name}</div>
                  <div class="info-row">${orderObj.customer.phone}</div>
                  <div class="info-row address">${orderObj.shipping_address.address_1} ${orderObj.shipping_address.district} ${orderObj.shipping_address.city}</div>
                </div>

                <div class="products-box">
                  ${orderObj.items.map((item: any) => `
                    <div class="product-item">
                      <div class="product-img">
                        ${item.thumbnail ? `<img src="${item.thumbnail}" />` : ''}
                      </div>
                      <div class="product-details">
                        <div class="product-sku">${item.sku || '-'}</div>
                        <div class="product-name">${item.title} (${item.size || '-'})</div>
                        <div class="product-qty">${item.quantity}</div>
                      </div>
                    </div>
                  `).join('')}

                  <div class="product-item">
                    <div class="product-img" style="display:flex; align-items:center; justify-content:center; background:none;">
                      <svg width="45" height="45" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                      </svg>
                    </div>
                    <div class="product-details">
                      <div class="product-sku">HZMBdl</div>
                      <div class="product-name">Kargo ve Hizmet Bedeli</div>
                      <div class="product-qty">1</div>
                    </div>
                  </div>
                </div>

                <div class="bottom-info">
                  <div>${orderObj.payment_method}</div>
                  <div>${orderObj.carrier_name || 'KARGOİST'}</div>
                </div>

                <div class="total-box">
                  <div>Genel Toplam:</div>
                  <div>${orderObj.total.toFixed(2)}</div>
                </div>

                <div class="barcode-box">
                  <div class="barcode-text">Kargo Kodu: ${orderObj.carrier_barcode || orderObj.display_id}</div>
                  <div class="barcode-img"></div>
                </div>

                <div class="footer">
                  <div>https://www.cizgibutik.com/admin/orders/refund</div>
                  <div>${idx + 1}/${ordersToPrint.length}</div>
                </div>
              </div>
              `).join('')}
            </body>
          </html>
        `)
      } else {
        printWindow.document.write(`
        <html>
          <head>
            <title>${type} - Toplu Yazdırma</title>
            <style>
              body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; padding: 0; margin: 0; color: #18181b; line-height: 1.5; }
              .page-break-container { page-break-after: always; padding: 40px; }
              .page-break-container:last-child { page-break-after: auto; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e4e4e7; padding-bottom: 20px; margin-bottom: 30px; }
              .title { font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.5px; }
              .meta-box { margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #fafafa; border: 1px solid #f4f4f5; padding: 20px; border-radius: 8px; }
              .meta-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #71717a; }
              .meta-val { font-size: 14px; font-weight: bold; margin-top: 4px; }
              table { width: 100%; border-collapse: collapse; margin: 30px 0; }
              th { background: #f4f4f5; text-transform: uppercase; font-size: 10px; font-weight: 800; padding: 12px; border-bottom: 2px solid #e4e4e7; text-align: left; }
              td { padding: 12px; border-bottom: 1px solid #f4f4f5; font-size: 13px; font-weight: 600; }
              .total-box { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; font-size: 14px; font-weight: bold; margin-top: 20px; }
              .grand-total { font-size: 18px; font-weight: 900; color: #7c3aed; }
              .btn-print { margin-top: 40px; padding: 10px 20px; background: #18181b; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
              @media print { .btn-print { display: none; } }
            </style>
          </head>
          <body>
            ${ordersToPrint.map((orderObj) => `
            <div class="page-break-container">
              <div class="header">
                <div>
                  <div class="title">${type}</div>
                  <div style="font-size: 12px; font-weight: bold; color: #a1a1aa; margin-top: 4px;">Sipariş Numarası: ${orderObj.display_id}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 18px; font-weight: 950; letter-spacing: -1px;">CIZGIBUTIK</div>
                  <div style="font-size: 11px; font-weight: bold; color: #71717a;">${orderObj.created_at}</div>
                </div>
              </div>
              
              <div class="meta-box">
                <div>
                  <div class="meta-label">Müşteri ve Teslimat Bilgileri</div>
                  <div class="meta-val">${orderObj.customer.first_name} ${orderObj.customer.last_name}</div>
                  <div style="font-size: 12px; color: #52525b; margin-top: 4px;">${orderObj.shipping_address.address_1} ${orderObj.shipping_address.district} / ${orderObj.shipping_address.city}</div>
                  <div style="font-size: 12px; color: #52525b; margin-top: 4px;">Tel: ${orderObj.customer.phone}</div>
                </div>
                <div>
                  <div class="meta-label">Ödeme & Kargo Detayları</div>
                  <div class="meta-val">${orderObj.payment_method}</div>
                  <div style="font-size: 12px; color: #52525b; margin-top: 4px;">Taşıyıcı Firma: ${orderObj.carrier_name}</div>
                  <div style="font-size: 12px; color: #52525b; margin-top: 4px;">Barkod No: ${orderObj.carrier_barcode || "-"}</div>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>SKU</th>
                    <th>Beden</th>
                    <th>Miktar</th>
                    <th>Birim Fiyat</th>
                    <th>Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderObj.items.map((item: any) => `
                    <tr>
                      <td>${item.title}</td>
                      <td>${item.sku}</td>
                      <td>${item.size}</td>
                      <td>${item.quantity} Adet</td>
                      <td>₺ ${item.unit_price.toFixed(2)}</td>
                      <td>₺ ${(item.unit_price * item.quantity).toFixed(2)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>

              <div class="total-box">
                <div>Ara Toplam: ₺ ${orderObj.subtotal.toFixed(2)}</div>
                <div>KDV: ₺ ${orderObj.vat_total.toFixed(2)}</div>
                <div class="grand-total">Genel Toplam: ₺ ${orderObj.total.toFixed(2)}</div>
              </div>

              <button class="btn-print no-print" onclick="window.print()">Yazdır</button>
            </div>
            `).join('')}
          </body>
        </html>
      `)
      }
      printWindow.document.close()
    }
  }

  useEffect(() => {
    const hideDefaultUi = () => {
       const widgetEl = document.getElementById('xoox-custom-orders-widget');
       if (widgetEl && widgetEl.parentElement) {
          const siblings = Array.from(widgetEl.parentElement.children);
          siblings.forEach(sibling => {
             if (sibling !== widgetEl) {
                (sibling as HTMLElement).style.display = 'none';
             }
          });
       }
    };
    hideDefaultUi();
    const interval = setInterval(hideDefaultUi, 100);
    return () => clearInterval(interval);
  }, [])

  return (
    <div id="xoox-custom-orders-widget" className="bg-zinc-50 min-h-screen text-ui-fg-base antialiased custom-admin-wrapper font-sans">
      {successModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
            <h3 className="font-bold text-lg text-zinc-900 mb-2">Başarılı</h3>
            <p className="text-sm text-zinc-500 mb-6">{successModal}</p>
            <button onClick={() => setSuccessModal(null)} className="w-full bg-zinc-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors">Tamam</button>
          </div>
        </div>
      )}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* TOP HEADER REMOVED */}

      {/* TAB NAVIGATION PANEL */}
      <div className="bg-zinc-100 border-b border-zinc-200 px-8 py-1 flex items-center justify-center gap-x-6 overflow-x-auto no-scrollbar shadow-sm">
        {[
          { key: "onay_bekleyen", label: "Onay Bekleyenler" },
          { key: "hazirlanan", label: "Hazırlananlar", badge: preparingCount },
          { key: "kargolanan", label: "Kargolananlar" },
          { key: "teslim_edilen", label: "Teslim Edilenler" },
          { key: "iade_edilen", label: "İade Edilenler" },
          { key: "iptal_edilen", label: "İptal Edilenler" },
          { key: "tum_siparisler", label: "Tüm Siparişler" },
          { key: "odeme_hatasi", label: "Ödeme Hatası Alınanlar" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-3.5 px-1.5 border-b-2 text-xs font-bold transition-all relative whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.key 
                ? "border-blue-600 text-blue-600 font-semibold" 
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold leading-none shadow-sm animate-pulse">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-8 max-w-[1600px] mx-auto flex flex-col gap-y-6">

        {/* SEARCH, FILTERS BUTTON & BULK OPERATIONS ROW */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white border border-zinc-200 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-50 flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Adjustments className="w-4 h-4 text-zinc-500" />
              <span>Filtreler</span>
              <svg className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400">🔍</span>
              <input
                type="text"
                placeholder="Hızlı ara..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 text-zinc-800 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button 
                onClick={() => setIsPosOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all whitespace-nowrap"
            >
                Hızlı Satış (POS)
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsBulkActionMenuOpen(!isBulkActionMenuOpen)}
                className="bg-white border border-zinc-200 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-50 flex items-center gap-1.5 shadow-sm transition-all"
              >
                🔧 Toplu İşlemler
                <svg className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isBulkActionMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>

              {isBulkActionMenuOpen && (
                <div className="absolute top-full mt-2 right-0 w-56 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-visible py-1 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-zinc-100 mb-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{selectedOrderIds.length} Sipariş Seçili</span>
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (selectedOrderIds.length === 0) {
                        alert("Lütfen sipariş seçin.");
                        return;
                      }
                      setStatusModalTargetIds(selectedOrderIds);
                      setNewStatusValue("onay_bekleyen");
                      setShowStatusModal(true);
                      setIsBulkActionMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    Durumu Değiştir
                  </button>

                  <button className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors">Toplu Fatura Yazdır</button>
                  <button className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors">Toplu Kargo Fişi Yazdır</button>
                  <button className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors">Seçilenleri Sil</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* EXPANDABLE FILTER GRID (Görsel 2) */}
        {showFilters && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6 animate-fade-in border-l-4 border-l-violet-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              
              {/* Row 1 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Sipariş Durumu</label>
                <input
                  type="text"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-700 bg-zinc-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Platform</label>
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-800 bg-white"
                >
                  <option value="">Hiçbiri seçilmedi</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Cizgibutik">Cizgibutik</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Mağaza</label>
                <select
                  value={filterStore}
                  onChange={(e) => setFilterStore(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-800 bg-white"
                >
                  <option value="">Hiçbiri seçilmedi</option>
                  <option value="cizgibutik">Cizgibutik</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Sipariş Etiketi</label>
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-800 bg-white"
                >
                  <option value="">Seçilmedi</option>
                </select>
              </div>

              {/* Row 2 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Sipariş No</label>
                <input
                  type="text"
                  placeholder="Sipariş No giriniz"
                  value={filterOrderNo}
                  onChange={(e) => setFilterOrderNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-900 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Sipariş Tarihi</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filterOrderDateStart}
                    onChange={(e) => setFilterOrderDateStart(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-semibold text-zinc-800"
                  />
                  <span className="text-xs text-zinc-400">ile</span>
                  <input
                    type="date"
                    value={filterOrderDateEnd}
                    onChange={(e) => setFilterOrderDateEnd(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-semibold text-zinc-800"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Fatura Tarihi</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filterInvoiceDateStart}
                    onChange={(e) => setFilterInvoiceDateStart(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-semibold text-zinc-800"
                  />
                  <span className="text-xs text-zinc-400">ile</span>
                  <input
                    type="date"
                    value={filterInvoiceDateEnd}
                    onChange={(e) => setFilterInvoiceDateEnd(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-semibold text-zinc-800"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">E-Fatura Tarihi</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filterEInvoiceDateStart}
                    onChange={(e) => setFilterEInvoiceDateStart(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-semibold text-zinc-800"
                  />
                  <span className="text-xs text-zinc-400">ile</span>
                  <input
                    type="date"
                    value={filterEInvoiceDateEnd}
                    onChange={(e) => setFilterEInvoiceDateEnd(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-semibold text-zinc-800"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Sipariş Tutarı</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filterTotalMin}
                    onChange={(e) => setFilterTotalMin(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-900 bg-white"
                  />
                  <span className="text-xs text-zinc-400">ile</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filterTotalMax}
                    onChange={(e) => setFilterTotalMax(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-900 bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Ödeme Yöntemi</label>
                <select
                  value={filterPaymentMethod}
                  onChange={(e) => setFilterPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-800 bg-white"
                >
                  <option value="">Seçilmedi</option>
                  <option value="Kapıda Nakit Ödeme">Kapıda Nakit Ödeme</option>
                  <option value="Kapıda Kredi Kartı ile Ödeme">Kapıda Kredi Kartı ile Ödeme</option>
                  <option value="Havale / EFT">Havale / EFT</option>
                  <option value="PayTR">PayTR</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Müşteri Adı</label>
                <input
                  type="text"
                  placeholder="Müşteri adı"
                  value={filterCustomerFirstName}
                  onChange={(e) => setFilterCustomerFirstName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-900 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Müşteri Soyadı</label>
                <input
                  type="text"
                  placeholder="Müşteri soyadı"
                  value={filterCustomerLastName}
                  onChange={(e) => setFilterCustomerLastName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-900 bg-white"
                />
              </div>

              {/* Row 4 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Telefon</label>
                <input
                  type="text"
                  placeholder="Telefon numarası"
                  value={filterPhone}
                  onChange={(e) => setFilterPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-900 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Vergi Numarası</label>
                <input
                  type="text"
                  value={filterTaxNo}
                  onChange={(e) => setFilterTaxNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-900 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Vergi Dairesi</label>
                <input
                  type="text"
                  value={filterTaxOffice}
                  onChange={(e) => setFilterTaxOffice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-900 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">TC Kimlik No</label>
                <input
                  type="text"
                  value={filterTcNo}
                  onChange={(e) => setFilterTcNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-900 bg-white"
                />
              </div>

              {/* Row 5 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Üye No</label>
                <input
                  type="text"
                  value={filterMemberNo}
                  onChange={(e) => setFilterMemberNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-900 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Ülke</label>
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-800 bg-white"
                >
                  <option value="">Hiçbiri seçilmedi</option>
                  <option value="tr">Türkiye</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">İl</label>
                <input
                  type="text"
                  value={filterProvince}
                  onChange={(e) => setFilterProvince(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-900 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Ürün No</label>
                <input
                  type="text"
                  value={filterProductNo}
                  onChange={(e) => setFilterProductNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-900 bg-white"
                />
              </div>

              {/* Row 6 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Ürün Barkodu</label>
                <input
                  type="text"
                  value={filterProductBarcode}
                  onChange={(e) => setFilterProductBarcode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-900 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Ürün Adı</label>
                <input
                  type="text"
                  value={filterProductName}
                  onChange={(e) => setFilterProductName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-900 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Ürün Etiketleri</label>
                <select
                  value={filterProductTag}
                  onChange={(e) => setFilterProductTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-800 bg-white"
                >
                  <option value="">Etiket Seçilmedi</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Hediye Çeki Kodu</label>
                <input
                  type="text"
                  value={filterGiftCardCode}
                  onChange={(e) => setFilterGiftCardCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-900 bg-white"
                />
              </div>

              {/* Row 7 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Promosyon</label>
                <select
                  value={filterPromo}
                  onChange={(e) => setFilterPromo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-800 bg-white"
                >
                  <option value="">Seçilmedi</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Kargo Firması</label>
                <select
                  value={filterCarrier}
                  onChange={(e) => setFilterCarrier(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-800 bg-white"
                >
                  <option value="">Seçilmedi</option>
                  <option value="KARGOİST">Kargoist</option>
                  <option value="INTERLINE KARGO">Interline Kargo</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Gelişmiş Arama</label>
                <select
                  value={filterAdvancedSearch}
                  onChange={(e) => setFilterAdvancedSearch(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 text-xs font-bold text-zinc-800 bg-white"
                >
                  <option value="">Hiçbiri seçilmedi</option>
                </select>
              </div>
            </div>

            <div className="flex justify-start gap-3 pt-3 border-t border-zinc-100">
              <button 
                onClick={() => setShowFilters(false)}
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-[11px] px-5 py-2.5 rounded-lg shadow-sm"
              >
                Filtrele
              </button>
              <button 
                onClick={handleClearFilters}
                className="bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-semibold text-[11px] px-5 py-2.5 rounded-lg"
              >
                Temizle
              </button>
            </div>
          </div>
        )}

        {/* ORDER LIST TABLE (Görsel 1) */}
        {loading ? (
          <div className="bg-white border border-zinc-200 rounded-2xl p-16 flex flex-col items-center justify-center gap-3 shadow-sm">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-zinc-500">Sipariş verileri yükleniyor...</span>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-hidden text-left bg-white text-[12px]">
                <thead>
                  <tr className="bg-zinc-50/80 border-b border-zinc-200 text-[11px] font-bold text-zinc-800 tracking-wide divide-x divide-zinc-200">
                    <th className="py-3 px-4 w-12 text-center">
                      <input 
                        type="checkbox"
                        checked={filteredOrdersList.length > 0 && selectedOrderIds.length === filteredOrdersList.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4 font-semibold text-zinc-800">Sipariş Bilgileri</th>
                    <th className="py-3 px-4 font-semibold text-zinc-800">Müşteri Bilgileri</th>
                    <th className="py-3 px-4 font-semibold text-zinc-800">Tutar</th>
                    <th className="py-3 px-4 font-semibold text-zinc-800">Durum</th>
                    <th className="py-3 px-4 font-semibold text-zinc-800">Kargo</th>
                    <th className="py-3 px-4 font-semibold text-zinc-800">Tarih</th>
                    <th className="py-3 px-4 font-semibold text-zinc-800">Yazdır</th>
                    <th className="py-3 px-4 font-semibold text-zinc-800 w-32">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-700">
                  {filteredOrdersList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-zinc-400 font-bold">Aramaya uygun sipariş kaydı bulunmamaktadır.</td>
                    </tr>
                  ) : (
                    filteredOrdersList.map((order, index) => {
                      const isSelected = selectedOrderIds.includes(order.id)
                      const altRow = index % 2 === 1
                      return (
                        <tr 
                          key={order.id} 
                          className={`transition-colors divide-x divide-zinc-200 ${isSelected ? 'bg-blue-50/50' : altRow ? 'bg-zinc-50/30' : 'bg-white'} hover:bg-zinc-50`}
                        >
                          <td className="py-3 px-4 text-center">
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleSelectRow(order.id, e.target.checked)}
                              className="w-4 h-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span 
                                onClick={() => {
                                  setSelectedOrderId(order.id)
                                  setTempNotesText(order.admin_notes || "")
                                  setTempInvoiceSeriesText(order.invoice_series || "-")
                                }}
                                className="font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1.5"
                              >
                                <span className="text-[13px] font-black text-zinc-800 uppercase tracking-widest">ÇİZGİ</span>
                                {order.display_id}
                              </span>
                              <span className="text-[11px] font-medium text-zinc-500 mt-0.5">{order.platform || "WhatsApp"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-zinc-800 capitalize">{order.customer.first_name} {order.customer.last_name}</span>
                                {(() => {
                                  // RISK KONTROLU
                                  const phone = order.customer?.phone || "";
                                  const email = order.customer?.email || "";
                                  const ip = order.customer?.ip || "";
                                  const fullName = `${order.customer?.first_name || ""} ${order.customer?.last_name || ""}`.toLowerCase().replace(/\s+/g, '');
                                  
                                  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '').slice(-10) : "";
                                  const cleanEmail = email ? email.toLowerCase().trim() : "";
                                  const cleanIp = ip ? ip.trim() : "";
                                  
                                  let isRisky = false;
                                  
                                  if (cleanPhone || cleanEmail || cleanIp || fullName) {
                                    for (const o of currentOrders) {
                                      if (o.id === order.id) continue;
                                      
                                      // Gecmis siparis kapida odeme mi?
                                      const isKapidaOdeme = o.payment_option === "cash_on_delivery" || o.payment_option === "card_on_delivery";
                                      if (!isKapidaOdeme) continue;
                                      
                                      // Gecmis siparis iptal/iade edilmis mi?
                                      const isCanceledOrReturned = o.status === "iptal_edilen" || o.status === "iade_edilen" || o.status === "odeme_hatasi";
                                      if (!isCanceledOrReturned) continue;
                                      
                                      const oPhone = o.customer?.phone ? o.customer.phone.replace(/[^0-9]/g, '').slice(-10) : "";
                                      const oEmail = o.customer?.email ? o.customer.email.toLowerCase().trim() : "";
                                      const oIp = o.customer?.ip ? o.customer.ip.trim() : "";
                                      const oFullName = `${o.customer?.first_name || ""} ${o.customer?.last_name || ""}`.toLowerCase().replace(/\s+/g, '');
                                      
                                      const phoneMatch = cleanPhone && oPhone && cleanPhone === oPhone;
                                      const emailMatch = cleanEmail && oEmail && cleanEmail === oEmail;
                                      const ipMatch = cleanIp && oIp && cleanIp === oIp && cleanIp !== "127.0.0.1";
                                      const nameMatch = fullName && oFullName && fullName === oFullName;
                                      
                                      if (phoneMatch || emailMatch || ipMatch || nameMatch) {
                                        isRisky = true;
                                        break;
                                      }
                                    }
                                  }

                                  return isRisky ? (
                                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-200 shadow-sm whitespace-nowrap animate-pulse">
                                      RİSKLİ SİPARİŞ
                                    </span>
                                  ) : null;
                                })()}
                              </div>
                              <span className="text-[11px] font-medium text-zinc-500 mt-0.5">{order.customer.phone}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-zinc-800">{order.total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                              <span className="text-[11px] font-medium text-zinc-500 mt-0.5">{order.payment_method}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {order.status === "teslim_edilen" && (
                              <span className="inline-flex items-center px-3 py-1 rounded border border-emerald-500 text-[11px] font-semibold text-emerald-500 leading-none">
                                Teslim Edildi
                              </span>
                            )}
                            {order.status === "kargolanan" && (
                              <span className="inline-flex items-center px-3 py-1 rounded border border-amber-500 text-[11px] font-semibold text-amber-500 leading-none">
                                Kargolandı
                              </span>
                            )}
                            {order.status === "hazirlanan" && (
                              <span className="inline-flex items-center px-3 py-1 rounded border border-blue-500 text-[11px] font-semibold text-blue-500 leading-none">
                                Hazırlanıyor
                              </span>
                            )}
                            {order.status === "onay_bekleyen" && (
                              <span className="inline-flex items-center px-3 py-1 rounded border border-zinc-400 text-[11px] font-semibold text-zinc-500 leading-none">
                                Onay Bekliyor
                              </span>
                            )}
                            {order.status === "iptal_edilen" && (
                              <span className="inline-flex items-center px-3 py-1 rounded border border-rose-500 text-[11px] font-semibold text-rose-500 leading-none">
                                İptal Edildi
                              </span>
                            )}
                            {order.status === "odeme_hatasi" && (
                              <span className="inline-flex items-center px-3 py-1 rounded border border-red-600 text-[11px] font-semibold text-red-600 leading-none">
                                Ödeme Hatası
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 uppercase font-semibold text-[11px] text-zinc-800">
                            {order.carrier_name || "KARGOİST"}
                          </td>
                          <td className="py-3 px-4 font-medium text-[11px] text-zinc-800">
                            {order.created_at}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <button 
                                title="e-Fatura" 
                                onClick={() => triggerPrintSimulation("e-Fatura", order.id)}
                                className="w-7 h-7 flex items-center justify-center rounded border border-zinc-300 bg-white hover:bg-zinc-50 relative shadow-sm"
                              >
                                <span className="font-bold text-[14px] text-zinc-600 leading-none">e</span>
                                {/* Example checkmark if printed */}
                                {order.status === "teslim_edilen" && (
                                  <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full">
                                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                  </div>
                                )}
                              </button>
                              <button 
                                title="Fatura" 
                                onClick={() => triggerPrintSimulation("Fatura", order.id)}
                                className="w-7 h-7 flex items-center justify-center rounded border border-zinc-300 bg-white hover:bg-zinc-50 relative shadow-sm"
                              >
                                <InvoiceIcon />
                                {order.status === "teslim_edilen" && (
                                  <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full">
                                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                  </div>
                                )}
                              </button>
                              <button 
                                title="Kargo Fişi" 
                                onClick={() => triggerPrintSimulation("Kargo Fişi", order.id)}
                                className="w-7 h-7 flex items-center justify-center rounded border border-zinc-300 bg-white hover:bg-zinc-50 shadow-sm"
                              >
                                <TruckIcon />
                              </button>
                              <button 
                                title="Paket Fişi" 
                                onClick={() => triggerPrintSimulation("Paket Fişi", order.id)}
                                className="w-7 h-7 flex items-center justify-center rounded border border-zinc-300 bg-white hover:bg-zinc-50 shadow-sm"
                              >
                                <PackageIcon />
                              </button>
                              <button 
                                title="PDF Fatura" 
                                onClick={() => triggerPrintSimulation("PDF", order.id)}
                                className="w-7 h-7 flex items-center justify-center rounded border border-zinc-300 bg-white hover:bg-zinc-50 shadow-sm"
                              >
                                <PdfIcon />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedOrderId(order.id)
                                  setTempNotesText(order.admin_notes || "")
                                  setTempInvoiceSeriesText(order.invoice_series || "-")
                                }}
                                className="w-7 h-7 rounded bg-[#9b66c4] hover:bg-purple-600 text-white flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                              >
                                <EyeIcon />
                              </button>
                              {order.status === "kargolanan" && (
                                <button
                                  onClick={() => handleMarkDelivered(order.id)}
                                  className="h-7 px-3 rounded bg-[#10b981] hover:bg-emerald-600 text-white font-semibold text-[11px] shadow-sm cursor-pointer transition-colors whitespace-nowrap"
                                >
                                  Teslim Et
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* DETAIL VIEW MODAL DIALOG (Görsel 3) */}
      {selectedOrderId && activeOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrderId(null)} />
          <div className="bg-zinc-100 rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-[1300px] h-[92vh] flex flex-col overflow-hidden animate-scale-up relative z-10">
            
            {/* Header segment with status and details */}
            <div className="bg-zinc-600 text-white px-6 py-4 flex items-center justify-between shadow-md select-none shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Sipariş Yönetimi</span>
                <span className="text-base font-bold tracking-tight">{activeOrderDetails.display_id} Nolu Sipariş</span>
              </div>
              <button 
                onClick={() => setSelectedOrderId(null)} 
                className="text-white hover:opacity-85 p-1 rounded-lg hover:bg-zinc-500 transition-colors"
              >
                <XMark className="w-6 h-6" />
              </button>
            </div>

            {/* Main scrollable body grid */}
            <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
              
              {/* Left Side elements */}
              <div className="flex flex-col gap-6">
                
                {/* 1. Products list table card */}
                <div className="bg-white border border-zinc-200 rounded shadow-none overflow-hidden">
                  <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div className="flex items-center gap-2 text-emerald-500">
                      <CheckCircle className="w-5 h-5" />
                      <h3 className="text-[14px] font-semibold text-zinc-900 tracking-tight">
                        Teslim Edilen Ürünler ({activeOrderDetails.items.length})
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      {!editingProducts ? (
                        <button onClick={() => {
                          setEditingProducts(true);
                          setTempProducts(activeOrderDetails.items.map(i => ({ id: i.id, unit_price: i.unit_price, quantity: i.quantity })));
                        }} className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium text-[11px] rounded shadow-sm">Düzenle</button>
                      ) : (
                        <>
                          <button onClick={handleSaveProducts} className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded shadow-sm">Kaydet</button>
                          <button onClick={() => setEditingProducts(false)} className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 text-zinc-600 hover:bg-zinc-100 font-medium text-xs rounded shadow-sm">İptal</button>
                        </>
                      )}
                      <button onClick={() => setShowProductSearchModal(true)} className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-medium text-xs rounded shadow-sm">Ürün Ekle</button>
                      <button className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium text-xs rounded shadow-sm">İade Oluştur</button>
                    </div>
                  </div>

                  <table className="w-full border-collapse text-left text-[13px] text-zinc-700">
                    <thead>
                      <tr className="bg-white border-b border-zinc-200 text-xs font-semibold text-zinc-500 tracking-wide">
                        <th className="py-3 px-4 font-semibold">Ürün</th>
                        <th className="py-3 px-4 text-center font-semibold">Fiyat</th>
                        <th className="py-3 px-4 text-center font-semibold">KDV</th>
                        <th className="py-3 px-4 text-center font-semibold">Miktar</th>
                        <th className="py-3 px-4 text-right font-semibold">Tutar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {activeOrderDetails.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-4 px-4 flex gap-3.5 items-start">
                            <div className="w-12 h-16 bg-zinc-50 border border-zinc-150 rounded overflow-hidden flex-shrink-0 flex items-center justify-center text-xl select-none">
                              {item.thumbnail ? (
                                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" style={{ imageRendering: "crisp-edges", WebkitFontSmoothing: "antialiased" }} />
                              ) : (
                                "👖"
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-[#0a2540] text-[13px]">{item.title}</span>
                              <span className="text-[12px] text-zinc-500 mt-1">
                                {item.sku ? `#${item.sku}` : ""} {item.barcode ? `- ${item.barcode}` : ""}
                              </span>
                              <span className="text-[12px] text-zinc-600 mt-0.5">BEDEN: {item.size}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center text-zinc-800 text-[13px]">
                            {editingProducts ? (
                              <input 
                                type="number" 
                                className="w-20 border rounded px-1.5 py-1 text-center text-[13px]"
                                value={tempProducts.find(t => t.id === item.id)?.unit_price || 0}
                                onChange={e => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setTempProducts(prev => prev.map(t => t.id === item.id ? { ...t, unit_price: val } : t))
                                }}
                              />
                            ) : (
                              <>{item.unit_price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center text-zinc-500 text-[13px]">
                            %{item.vat_rate}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {editingProducts ? (
                              <input 
                                type="number" 
                                className="w-16 border rounded px-1.5 py-1 text-center text-[13px] mx-auto block"
                                value={tempProducts.find(t => t.id === item.id)?.quantity || 1}
                                onChange={e => {
                                  const val = parseInt(e.target.value) || 1;
                                  setTempProducts(prev => prev.map(t => t.id === item.id ? { ...t, quantity: val } : t))
                                }}
                              />
                            ) : (
                              <div className="flex flex-col leading-tight items-center justify-center">
                                <span className="text-zinc-800 text-[13px]">{item.quantity}</span>
                                <span className="text-[11px] text-zinc-500">Adet</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right text-zinc-800 text-[13px]">
                            {editingProducts ? (
                              <div className="flex items-center justify-end gap-3">
                                <span>{((tempProducts.find(t => t.id === item.id)?.unit_price || 0) * (tempProducts.find(t => t.id === item.id)?.quantity || 0)).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                                <button
                                  title="Ürünü Sil"
                                  onClick={() => setTempProducts(prev => prev.filter(t => t.id !== item.id))}
                                  className="w-6 h-6 flex items-center justify-center rounded bg-rose-50 hover:bg-rose-100 text-rose-500 transition-colors shrink-0"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>{(item.unit_price * item.quantity).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</>
                            )}
                          </td>
                        </tr>
                      ))}

                      {/* Display calculations */}
                      <tr className="bg-white border-t border-zinc-100 text-[13px] text-zinc-600">
                        <td colSpan={3} className="py-4 px-4">
                          <div className="flex flex-col gap-1.5 text-zinc-500">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" className="w-3.5 h-3.5 rounded border-zinc-300 text-blue-600" />
                              <span>Stok miktarını göster</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" className="w-3.5 h-3.5 rounded border-zinc-300 text-blue-600" />
                              <span>Desiyi göster</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" className="w-3.5 h-3.5 rounded border-zinc-300 text-blue-600" />
                              <span>Özel kodları göster</span>
                            </label>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex flex-col gap-2 text-zinc-500">
                            <span>Ara Toplam</span>
                            <span>Genel Toplam</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right text-zinc-800">
                          <div className="flex flex-col gap-2">
                            <span>{activeOrderDetails.subtotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                            <span>{activeOrderDetails.total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 2. Admin note card */}
                <div className="bg-white border border-zinc-200 rounded p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center pb-2">
                    <h3 className="text-[12px] font-bold text-zinc-800 tracking-tight">
                      Yönetici Notu
                    </h3>
                    {!editingNotes ? (
                      <button 
                        onClick={() => { setEditingNotes(true); setTempNotesText(activeOrderDetails.admin_notes || ""); }}
                        className="text-zinc-400 hover:text-zinc-600 border border-zinc-200 rounded p-1 bg-white"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={handleSaveNotes}
                          className="text-[11px] font-bold text-emerald-600 hover:underline border border-emerald-200 bg-emerald-50 px-2 py-1 rounded"
                        >
                          Kaydet
                        </button>
                        <button 
                          onClick={() => setEditingNotes(false)}
                          className="text-[11px] font-semibold text-zinc-500 hover:underline border border-zinc-200 bg-zinc-50 px-2 py-1 rounded"
                        >
                          Vazgeç
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {editingNotes ? (
                    <textarea 
                      rows={2}
                      value={tempNotesText}
                      onChange={(e) => setTempNotesText(e.target.value)}
                      className="w-full p-2 border border-zinc-300 rounded text-xs font-semibold text-zinc-800"
                    />
                  ) : (
                    <div className="text-xs font-semibold text-zinc-800 tracking-tight bg-zinc-50 p-3 rounded border border-zinc-200 min-h-12">
                      {activeOrderDetails.admin_notes || "Yönetici notu bulunmuyor."}
                    </div>
                  )}
                </div>

                {/* 3. Customer, shipping & billing details cards grid */}
                <div className="bg-white border border-zinc-200 rounded p-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-200">
                  {/* Customer Block */}
                  <div className="flex-1 p-4 flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                      <h4 className="text-[14px] font-semibold text-[#0a2540] tracking-tight">Müşteri</h4>
                      <div className="flex items-center gap-1.5">
                        <span className="border border-zinc-200 px-2 py-0.5 rounded text-[11px] font-medium text-zinc-600 bg-zinc-50">
                          {activeOrderDetails.customer.is_visitor ? "Ziyaretçi" : "Üye"}
                        </span>
                        {!editingCustomer ? (
                          <button 
                            onClick={() => {
                              setEditingCustomer(true);
                              setTempCustomer({ first_name: activeOrderDetails.customer.first_name, last_name: activeOrderDetails.customer.last_name, email: activeOrderDetails.customer.email, phone: activeOrderDetails.customer.phone });
                            }}
                            className="text-zinc-400 hover:text-zinc-600 border border-zinc-200 rounded p-1 shadow-sm bg-white"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button onClick={handleSaveCustomer} className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Kaydet</button>
                            <button onClick={() => setEditingCustomer(false)} className="text-[10px] font-medium text-zinc-500 bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200">İptal</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-[13px] space-y-2.5 text-zinc-600">
                      {!editingCustomer ? (
                        <>
                          <div className="font-medium text-zinc-900 flex items-center gap-1.5">
                            {activeOrderDetails.customer.first_name} {activeOrderDetails.customer.last_name}
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            {activeOrderDetails.customer.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            {activeOrderDetails.customer.phone}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <input type="text" className="w-full border rounded p-1.5 text-[12px]" value={tempCustomer.first_name} onChange={e => setTempCustomer({...tempCustomer, first_name: e.target.value})} placeholder="Ad" />
                          <input type="text" className="w-full border rounded p-1.5 text-[12px]" value={tempCustomer.last_name} onChange={e => setTempCustomer({...tempCustomer, last_name: e.target.value})} placeholder="Soyad" />
                          <input type="email" className="w-full border rounded p-1.5 text-[12px]" value={tempCustomer.email} onChange={e => setTempCustomer({...tempCustomer, email: e.target.value})} placeholder="E-posta" />
                          <input type="text" className="w-full border rounded p-1.5 text-[12px]" value={tempCustomer.phone} onChange={e => setTempCustomer({...tempCustomer, phone: e.target.value})} placeholder="Telefon" />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-100">
                        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
                        <span className="font-mono text-[12px]">{activeOrderDetails.customer.ip}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address Block */}
                  <div className="flex-1 p-4 flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                      <h4 className="text-[14px] font-semibold text-[#0a2540] tracking-tight">Teslimat Bilgileri</h4>
                      {!editingShipping ? (
                        <button 
                          onClick={() => {
                            setEditingShipping(true);
                            setTempShipping({ first_name: activeOrderDetails.shipping_address.first_name, last_name: activeOrderDetails.shipping_address.last_name, address_1: activeOrderDetails.shipping_address.address_1, district: activeOrderDetails.shipping_address.district, city: activeOrderDetails.shipping_address.city });
                          }}
                          className="text-zinc-400 hover:text-zinc-600 border border-zinc-200 rounded p-1 shadow-sm bg-white"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button onClick={handleSaveShipping} className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Kaydet</button>
                          <button onClick={() => setEditingShipping(false)} className="text-[10px] font-medium text-zinc-500 bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200">İptal</button>
                        </div>
                      )}
                    </div>
                    <div className="text-[13px] space-y-2 text-zinc-600">
                      {!editingShipping ? (
                        <>
                          <div className="font-medium text-zinc-900">{activeOrderDetails.shipping_address.first_name} {activeOrderDetails.shipping_address.last_name}</div>
                          <p className="leading-relaxed">
                            {activeOrderDetails.shipping_address.address_1}
                          </p>
                          <div>{activeOrderDetails.shipping_address.district} / {activeOrderDetails.shipping_address.city} / {activeOrderDetails.shipping_address.country_name}</div>
                        </>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <input type="text" className="w-full border rounded p-1.5 text-[12px]" value={tempShipping.first_name} onChange={e => setTempShipping({...tempShipping, first_name: e.target.value})} placeholder="Ad" />
                          <input type="text" className="w-full border rounded p-1.5 text-[12px]" value={tempShipping.last_name} onChange={e => setTempShipping({...tempShipping, last_name: e.target.value})} placeholder="Soyad" />
                          <textarea rows={2} className="w-full border rounded p-1.5 text-[12px]" value={tempShipping.address_1} onChange={e => setTempShipping({...tempShipping, address_1: e.target.value})} placeholder="Açık Adres" />
                          <div className="flex gap-2">
                            <input type="text" className="w-1/2 border rounded p-1.5 text-[12px]" value={tempShipping.district} onChange={e => setTempShipping({...tempShipping, district: e.target.value})} placeholder="İlçe" />
                            <input type="text" className="w-1/2 border rounded p-1.5 text-[12px]" value={tempShipping.city} onChange={e => setTempShipping({...tempShipping, city: e.target.value})} placeholder="İl" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Billing Address Block */}
                  <div className="flex-1 p-4 flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                      <h4 className="text-[14px] font-semibold text-[#0a2540] tracking-tight">Fatura Bilgileri</h4>
                      {!editingBilling ? (
                        <button 
                          onClick={() => {
                            setEditingBilling(true);
                            setTempBilling({ first_name: activeOrderDetails.billing_address.first_name, last_name: activeOrderDetails.billing_address.last_name, address_1: activeOrderDetails.billing_address.address_1, district: activeOrderDetails.billing_address.district, city: activeOrderDetails.billing_address.city, tc_no: activeOrderDetails.billing_address.tc_no || "" });
                          }}
                          className="text-zinc-400 hover:text-zinc-600 border border-zinc-200 rounded p-1 shadow-sm bg-white"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button onClick={handleSaveBilling} className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Kaydet</button>
                          <button onClick={() => setEditingBilling(false)} className="text-[10px] font-medium text-zinc-500 bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200">İptal</button>
                        </div>
                      )}
                    </div>
                    <div className="text-[13px] space-y-2 text-zinc-600">
                      {!editingBilling ? (
                        <>
                          <div className="font-medium text-zinc-900">{activeOrderDetails.billing_address.first_name} {activeOrderDetails.billing_address.last_name}</div>
                          <p className="leading-relaxed">
                            {activeOrderDetails.billing_address.address_1}
                          </p>
                          <div>{activeOrderDetails.billing_address.district} / {activeOrderDetails.billing_address.city} / {activeOrderDetails.billing_address.country_name}</div>
                          {activeOrderDetails.billing_address.tc_no && (
                            <div className="mt-1">
                              TCKN: {activeOrderDetails.billing_address.tc_no}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <input type="text" className="w-full border rounded p-1.5 text-[12px]" value={tempBilling.first_name} onChange={e => setTempBilling({...tempBilling, first_name: e.target.value})} placeholder="Ad" />
                          <input type="text" className="w-full border rounded p-1.5 text-[12px]" value={tempBilling.last_name} onChange={e => setTempBilling({...tempBilling, last_name: e.target.value})} placeholder="Soyad" />
                          <textarea rows={2} className="w-full border rounded p-1.5 text-[12px]" value={tempBilling.address_1} onChange={e => setTempBilling({...tempBilling, address_1: e.target.value})} placeholder="Açık Adres" />
                          <div className="flex gap-2">
                            <input type="text" className="w-1/2 border rounded p-1.5 text-[12px]" value={tempBilling.district} onChange={e => setTempBilling({...tempBilling, district: e.target.value})} placeholder="İlçe" />
                            <input type="text" className="w-1/2 border rounded p-1.5 text-[12px]" value={tempBilling.city} onChange={e => setTempBilling({...tempBilling, city: e.target.value})} placeholder="İl" />
                          </div>
                          <input type="text" className="w-full border rounded p-1.5 text-[12px]" value={tempBilling.tc_no} onChange={e => setTempBilling({...tempBilling, tc_no: e.target.value})} placeholder="TC Kimlik No (Opsiyonel)" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Chronological logs (Admin logs & Integration logs) */}
                <div className="bg-white border border-zinc-200 rounded shadow-none overflow-hidden">
                  <div className="p-4 border-b border-zinc-150 bg-white">
                    <h3 className="text-[14px] font-semibold text-[#0a2540] tracking-tight">
                      Yönetici Logları
                    </h3>
                  </div>
                  <div className="divide-y divide-zinc-100 text-[13px] text-zinc-600">
                    {activeOrderDetails.logs.length === 0 ? (
                      <div className="p-4 text-center text-zinc-400">Log kaydı bulunmuyor.</div>
                    ) : (
                      activeOrderDetails.logs.map((log) => (
                        <div key={log.id} className="py-3 px-4 flex justify-between items-center hover:bg-zinc-50/50 transition-colors">
                          <span className="text-zinc-800">{log.message}</span>
                          <span className="text-[12px] text-zinc-400">{log.created_at}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded shadow-none overflow-hidden">
                  <div className="p-4 border-b border-zinc-150 bg-white">
                    <h3 className="text-[12px] font-bold text-zinc-800 tracking-tight">
                      Kargo Entegrasyon Logları
                    </h3>
                  </div>
                  <div className="divide-y divide-zinc-100 text-xs font-semibold text-zinc-700">
                    {activeOrderDetails.integration_logs.length === 0 ? (
                      <div className="p-4 text-center text-zinc-400">Kargo entegrasyon log kaydı bulunmuyor.</div>
                    ) : (
                      activeOrderDetails.integration_logs.map((log) => (
                        <div key={log.id} className="py-2.5 px-4 flex justify-between items-center hover:bg-zinc-50/50 transition-colors">
                          <span className="text-emerald-700 font-bold">{log.message}</span>
                          <span className="text-[11px] text-zinc-400 font-bold">{log.created_at}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Right Side Info Cards */}
              <div className="flex flex-col gap-6">
                
                {/* Order Meta details block */}
                {/* Header block (Order Info) */}
                <div className="bg-white border border-zinc-200 rounded p-5 flex justify-between items-start">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[16px] text-[#0066cc] font-medium tracking-tight">{activeOrderDetails.display_id}</span>
                    <span className="text-[14px] text-zinc-800 font-medium">{activeOrderDetails.customer?.first_name} {activeOrderDetails.customer?.last_name}</span>
                    <span className="text-[13px] text-zinc-700">{activeOrderDetails.created_at}</span>
                    <div className="mt-2">
                      {activeOrderDetails.status === "teslim_edilen" && (
                        <span className="inline-block px-3 py-1 rounded border border-emerald-500 text-[13px] font-medium text-emerald-600 bg-white">
                          Teslim Edildi
                        </span>
                      )}
                      {activeOrderDetails.status === "kargolanan" && (
                        <span className="inline-block px-3 py-1 rounded border border-amber-500 text-[13px] font-medium text-amber-600 bg-white">
                          Kargolandı
                        </span>
                      )}
                      {activeOrderDetails.status === "hazirlanan" && (
                        <span className="inline-block px-3 py-1 rounded border border-blue-500 text-[13px] font-medium text-blue-600 bg-white">
                          Hazırlanıyor
                        </span>
                      )}
                      {activeOrderDetails.status === "iptal_edilen" && (
                        <span className="inline-block px-3 py-1 rounded border border-rose-500 text-[13px] font-medium text-rose-600 bg-white">
                          İptal Edildi
                        </span>
                      )}
                      {activeOrderDetails.status === "onay_bekleyen" && (
                        <span className="inline-block px-3 py-1 rounded border border-zinc-400 text-[13px] font-medium text-zinc-600 bg-white">
                          Yeni Sipariş
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="w-10 h-10 bg-black flex items-center justify-center rotate-45 mb-2">
                      <div className="w-6 h-6 border-2 border-white -rotate-45" />
                    </div>
                  </div>
                </div>

                {/* Financial block */}
                <div className="bg-white border border-zinc-200 rounded p-5 flex flex-col">
                  <div className="text-[13px] space-y-3 text-zinc-600">
                    <div className="flex justify-between items-center">
                      <span>Ödeme</span>
                      <span className="text-zinc-900 font-medium text-[14px]">{activeOrderDetails.payment_method}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Sipariş Tutarı</span>
                      <span className="text-zinc-900 font-medium text-[14px]">{activeOrderDetails.total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>KDV</span>
                      <span className="text-zinc-900 font-medium text-[14px]">{activeOrderDetails.vat_total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                    </div>
                  </div>

                  {activeOrderDetails.discount_total > 0 && (
                    <>
                      <div className="h-px bg-zinc-100 my-4" />
                      <div className="text-[13px] space-y-3 text-zinc-600">
                        <div className="flex justify-between items-center">
                          <span>İndirim ({activeOrderDetails.discounts?.[0]?.code || "Genel"})</span>
                          <span className="text-zinc-900 font-medium text-[14px]">{activeOrderDetails.discount_total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Carrier info block */}
                {(() => {
                  let dCarrierName = activeOrderDetails.carrier_name || "DİĞER KARGO";
                  let dBarcode = activeOrderDetails.carrier_barcode || "-";
                  let dLink = `https://webpostman.kargoist.com/t.php?t=${dBarcode !== "-" ? dBarcode : ""}`;
                  
                  if (activeOrderDetails.metadata?.interline_barcode || activeOrderDetails.metadata?.selected_carrier === "interline") {
                    dCarrierName = "Interline Express Kargo";
                    dBarcode = activeOrderDetails.metadata?.interline_barcode || "-";
                    dLink = dBarcode !== "-" ? `https://webpostman.interlineexpress.com/tracking?h=${dBarcode}` : "#";
                  } else if (activeOrderDetails.metadata?.nova_barcode || activeOrderDetails.metadata?.selected_carrier === "kargonova") {
                    dCarrierName = "Nova Kargo";
                    dBarcode = activeOrderDetails.metadata?.nova_barcode || "-";
                    dLink = dBarcode !== "-" ? `https://webpostman.interlineexpress.com/tracking?h=${dBarcode}` : "#"; // Varsayılan olarak aynı altyapıyı kullanır
                  }

                  const hasBarcode = dBarcode && dBarcode !== "-";

                  return (
                    <div className="bg-white border border-zinc-200 rounded p-5 flex flex-col gap-4">
                      <h4 className="text-[14px] font-semibold text-[#0a2540] tracking-tight">Kargo Bilgileri</h4>
                      <div className="text-[13px] space-y-3 text-zinc-600">
                        <div className="flex justify-between items-center">
                          <span>Firma</span>
                          <span className="text-zinc-900 font-medium">{dCarrierName}</span>
                        </div>
                        {hasBarcode && (
                          <>
                            <div className="flex justify-between items-center">
                              <span>Barkod</span>
                              <span className="text-zinc-900 font-medium">{dBarcode}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Takip Kodu</span>
                              <span className="text-zinc-900 font-medium">{dBarcode}</span>
                            </div>
                            <div className="flex pt-1 mt-1 break-all">
                              <a href={dLink} target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline text-[13px]">
                                {dLink}
                              </a>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Dönüşüm Bilgileri block */}
                <div className="bg-white border border-zinc-200 rounded p-5 flex flex-col gap-4">
                  <h4 className="text-[12px] font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2">Dönüşüm Bilgileri</h4>
                  <div className="text-xs space-y-3 font-semibold text-zinc-500 pb-2 border-b border-zinc-100">
                    <div className="flex justify-between">
                      <span>Trafik Kaynağı</span>
                      <span className="text-zinc-900 font-bold">{activeOrderDetails.metadata?.traffic_source as string || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Yönlendiren</span>
                      <span className="text-zinc-900 font-bold">{activeOrderDetails.metadata?.referrer as string || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cihaz</span>
                      <span className="text-zinc-900 font-bold">{activeOrderDetails.metadata?.device_type as string || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Oturum Süresi</span>
                      <span className="text-zinc-900 font-bold">{activeOrderDetails.metadata?.session_duration as string || "-"}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 border-b border-zinc-100 pb-3">
                    <div className="text-[11px] font-bold text-zinc-800 tracking-tight">UTM Bilgileri</div>
                    <div className="grid grid-cols-2 gap-y-2 text-[11px]">
                      <div className="flex flex-col">
                        <span className="text-zinc-400">source</span>
                        <span className="text-zinc-900 font-bold">{activeOrderDetails.metadata?.utm_source as string || "-"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-zinc-400">medium</span>
                        <span className="text-zinc-900 font-bold">{activeOrderDetails.metadata?.utm_medium as string || "-"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-zinc-400">campaign</span>
                        <span className="text-zinc-900 font-bold">{activeOrderDetails.metadata?.utm_campaign as string || "-"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-zinc-400">term</span>
                        <span className="text-zinc-900 font-bold">{activeOrderDetails.metadata?.utm_term as string || "-"}</span>
                      </div>
                      <div className="flex flex-col col-span-2">
                        <span className="text-zinc-400">content</span>
                        <span className="text-zinc-900 font-bold">{activeOrderDetails.metadata?.utm_content as string || "-"}</span>
                      </div>
                    </div>
                  </div>
                  {activeOrderDetails.metadata?.is_recovered_order && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <StarIcon />
                      <span className="text-xs font-bold text-zinc-700">Kurtarılan Sipariş</span>
                    </div>
                  )}
                </div>

                {/* Other/Fatura Series block */}
                <div className="bg-white border border-zinc-200 rounded p-5 shadow-none flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                    <h4 className="text-[12px] font-bold text-zinc-800 tracking-tight">Diğer</h4>
                    {!editingInvoiceSeries ? (
                      <button 
                        onClick={() => { setEditingInvoiceSeries(true); setTempInvoiceSeriesText(activeOrderDetails.invoice_series || "-"); }}
                        className="text-zinc-400 hover:text-zinc-650"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button onClick={handleSaveInvoiceSeries} className="text-[11px] font-bold text-emerald-600 hover:underline">Kaydet</button>
                        <button onClick={() => setEditingInvoiceSeries(false)} className="text-[11px] font-semibold text-zinc-450 hover:underline">İptal</button>
                      </div>
                    )}
                  </div>
                  
                  {editingInvoiceSeries ? (
                    <input 
                      type="text"
                      value={tempInvoiceSeriesText}
                      onChange={(e) => setTempInvoiceSeriesText(e.target.value)}
                      className="w-full p-1.5 border border-zinc-300 rounded text-xs font-semibold text-zinc-800"
                    />
                  ) : (
                    <div className="text-xs space-y-3 font-semibold text-zinc-500">
                      <div className="flex justify-between">
                        <span>Fatura Seri</span>
                        <span className="text-zinc-900 font-bold">{activeOrderDetails.invoice_series || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fatura Ek Kodlar</span>
                        <span className="text-zinc-900 font-bold">-</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Footer buttons row */}
            <div className="bg-zinc-50 border-t border-zinc-200 px-6 py-4 flex items-center justify-between shrink-0 relative">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button 
                    onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                    className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-semibold text-[12px] h-9 px-4 rounded flex items-center gap-1.5 transition-colors"
                  >
                    <span>İşlemler</span>
                    <svg className={`w-3 h-3 text-zinc-500 transition-transform ${isActionMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isActionMenuOpen && (
                    <div className="absolute bottom-full mb-1 left-0 w-48 bg-white border border-zinc-200 rounded shadow-lg overflow-hidden py-1 z-10 animate-fade-in">
                      <button className="w-full text-left px-4 py-2 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">Risk Kriterlerine Ekle</button>
                      
                      <button 
                        onClick={() => {
                          setStatusModalTargetIds([activeOrderDetails.id]);
                          setNewStatusValue(activeOrderDetails.status);
                          setShowStatusModal(true);
                          setIsActionMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                      >
                        Durumu Değiştir
                      </button>

                      <button className="w-full text-left px-4 py-2 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">SMS & E-Posta Gönder</button>
                      <button className="w-full text-left px-4 py-2 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">Sözleşmeler</button>
                    </div>
                  )}
                </div>
                
                {activeOrderDetails.status !== "kargolanan" && activeOrderDetails.status !== "teslim_edilen" && activeOrderDetails.status !== "iptal_edilen" && (
                  <button 
                    onClick={() => {
                      setShipmentModalTargetIds([activeOrderDetails.id]);
                      setShowShipmentModal(true);
                      setIsActionMenuOpen(false);
                    }}
                    className="bg-[#00c853] hover:bg-[#00b248] text-white font-semibold text-[13px] h-9 px-5 rounded transition-all cursor-pointer shadow-sm"
                  >
                    Siparişi Kargola
                  </button>
                )}

                {activeOrderDetails.status !== "iptal_edilen" && (
                  <button 
                    onClick={() => handleCancelOrder(activeOrderDetails.id)}
                    className="bg-[#ff4d4d] hover:bg-[#ff3333] text-white font-semibold text-[13px] h-9 px-5 rounded transition-all cursor-pointer shadow-sm"
                  >
                    Siparişi İptal Et
                  </button>
                )}
              </div>

              {/* Print buttons row */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => triggerPrintSimulation("e-Fatura", activeOrderDetails.id)}
                  className="bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-700 font-semibold text-[12px] h-9 px-4 rounded flex items-center gap-1.5 transition-colors"
                >
                  <span className="text-rose-600 font-bold">✕</span>
                  <span>E-Fatura</span>
                </button>
                <button 
                  onClick={() => triggerPrintSimulation("Fatura", activeOrderDetails.id)}
                  className="bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-700 font-semibold text-[12px] h-9 px-4 rounded flex items-center gap-1.5 transition-colors"
                >
                  <span className="text-rose-600 font-bold">✕</span>
                  <span>Fatura</span>
                </button>
                <button 
                  onClick={() => triggerPrintSimulation("Kargo Fişi", activeOrderDetails.id)}
                  className="bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-700 font-semibold text-[12px] h-9 px-4 rounded flex items-center gap-1.5 transition-colors"
                >
                  <span className="text-emerald-600 font-bold">✔</span>
                  <span>Kargo Fişi</span>
                </button>
                <button 
                  onClick={() => triggerPrintSimulation("Fiş", activeOrderDetails.id)}
                  className="bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-700 font-semibold text-[12px] h-9 px-4 rounded flex items-center gap-1.5 transition-colors"
                >
                  <span className="text-rose-600 font-bold">✕</span>
                  <span>Fiş</span>
                </button>
                <button 
                  onClick={() => triggerPrintSimulation("PDF", activeOrderDetails.id)}
                  className="bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-700 font-semibold text-[12px] h-9 px-4 rounded flex items-center gap-1.5 transition-colors"
                >
                  <span className="text-rose-600 font-bold">✕</span>
                  <span>PDF</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      {/* Inner Modal for Status Change */}
      {showStatusModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setShowStatusModal(false)} />
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[420px] flex flex-col relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#0d6efd] text-white px-5 py-4 flex flex-col relative">
              <span className="text-[12px] font-semibold text-blue-100 mb-0.5">Sipariş İşlemleri</span>
              <span className="text-[16px] font-bold tracking-tight">Sipariş Durumunu Değiştir</span>
              <button 
                onClick={() => setShowStatusModal(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-zinc-200 opacity-90 transition-opacity"
              >
                <span className="text-xl font-bold">✕</span>
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold text-zinc-500">Sipariş Durumu</label>
                <select 
                  value={newStatusValue}
                  onChange={(e) => setNewStatusValue(e.target.value)}
                  className="w-full border border-zinc-300 rounded px-3 py-2.5 text-[13px] font-bold text-zinc-800 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                >
                  <option value="onay_bekleyen">Yeni Sipariş</option>
                  <option value="hazirlanan">Hazırlanan Sipariş</option>
                  <option value="kargolanan">Kargolanan Sipariş</option>
                  <option value="teslim_edilen">Teslim Edilen Sipariş</option>
                  <option value="iptal_edilen">İptal Edilen Sipariş</option>
                </select>
              </div>

              {newStatusValue === "kargolanan" && (
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-zinc-500">Kargo Firması</label>
                  <select 
                    value={selectedCarrier}
                    onChange={(e) => setSelectedCarrier(e.target.value)}
                    className="w-full border border-zinc-300 rounded px-3 py-2.5 text-[13px] font-bold text-zinc-800 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                  >
                    <option value="kargonova">Nova Kargo</option>
                    <option value="interline">Interline Kargo</option>
                    <option value="ptt">PTT Kargo</option>
                    <option value="aras">Aras Kargo</option>
                    <option value="yurtici">Yurtiçi Kargo</option>
                    <option value="mng">MNG Kargo</option>
                  </select>
                </div>
              )}

              <label className="flex items-center gap-2.5 cursor-pointer mt-1">
                <input 
                  type="checkbox" 
                  checked={notifyCustomer}
                  onChange={(e) => setNotifyCustomer(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-[12px] font-semibold text-zinc-600 leading-snug">
                  Müşteriye mobil uygulama bildirimleri
                </span>
              </label>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-2">
              <button
                onClick={() => setShowStatusModal(false)}
                className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold text-[12px] h-9 px-5 rounded transition-colors"
              >
                İptal
              </button>
              <button
                onClick={async () => {
                  for (const id of statusModalTargetIds) {
                    if (newStatusValue === "kargolanan") {
                      const orderToUpdate = realOrders.find(o => o.id === id);
                      const oldMetadata = orderToUpdate?.metadata || {};
                      await fetch(`/admin/orders/${id}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          metadata: {
                            ...oldMetadata,
                            selected_carrier: selectedCarrier
                          }
                        })
                      });
                    }
                    await handleStatusChange(id, newStatusValue, true);
                  }
                  setShowStatusModal(false);
                  
                  const refreshRes = await fetch("/admin/orders?limit=100&fields=*customer,*shipping_address,*billing_address,*items")
                  const refreshData = await refreshRes.json()
                  if (refreshData && refreshData.orders) setRealOrders(refreshData.orders)

                  if (statusModalTargetIds.length > 1) {
                    showSuccess(`Tamamlanan sipariş sayısı: ${statusModalTargetIds.length}`);
                  } else {
                    showSuccess("Sipariş başarıyla güncellendi.");
                  }
                }}
                className="bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-[12px] h-9 px-6 rounded transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span className="text-sm">✔</span>
                <span>Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inner Modal for Shipment (Siparişi Kargola) */}
      {showShipmentModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setShowShipmentModal(false)} />
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[420px] flex flex-col relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#0d6efd] text-white px-5 py-4 flex flex-col relative">
              <span className="text-[12px] font-semibold text-blue-100 mb-0.5">Sipariş İşlemleri</span>
              <span className="text-[16px] font-bold tracking-tight">Siparişleri Kargola</span>
              <button 
                onClick={() => setShowShipmentModal(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-zinc-200 opacity-90 transition-opacity"
              >
                <span className="text-xl font-bold">✕</span>
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 flex flex-col gap-5">
              <div className="flex border-b border-zinc-200">
                <button className="flex-1 py-2 text-[13px] font-bold text-blue-600 border-b-2 border-blue-600">API ile Kargola</button>
                <button className="flex-1 py-2 text-[13px] font-bold text-zinc-400 hover:text-zinc-600" onClick={() => alert("Manuel kargolama modülü hazırlanıyor.")}>Manuel Kargola</button>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold text-zinc-500">Kargo Firması</label>
                <select 
                  value={selectedCarrier}
                  onChange={(e) => setSelectedCarrier(e.target.value)}
                  className="w-full border border-zinc-300 rounded px-3 py-2.5 text-[13px] font-bold text-zinc-800 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                >
                  <option value="kargonova">Nova Kargo</option>
                  <option value="interline">Interline Kargo</option>
                  <option value="ptt">PTT Kargo</option>
                  <option value="aras">Aras Kargo</option>
                  <option value="yurtici">Yurtiçi Kargo</option>
                  <option value="mng">MNG Kargo</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-2">
              <button
                onClick={() => setShowShipmentModal(false)}
                className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold text-[12px] h-9 px-5 rounded transition-colors"
              >
                İptal
              </button>
              <button
                onClick={async () => {
                  for (const id of shipmentModalTargetIds) {
                    const orderToUpdate = realOrders.find(o => o.id === id);
                    const oldMetadata = orderToUpdate?.metadata || {};
                    // Update order metadata with selected carrier
                    await fetch(`/admin/orders/${id}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        metadata: {
                          ...oldMetadata,
                          selected_carrier: selectedCarrier
                        }
                      })
                    });
                    // Change status to kargolanan which triggers the subscriber
                    await handleStatusChange(id, "kargolanan", true);
                  }
                  setShowShipmentModal(false);
                  
                  const refreshRes = await fetch("/admin/orders?limit=100&fields=*customer,*shipping_address,*billing_address,*items")
                  const refreshData = await refreshRes.json()
                  if (refreshData && refreshData.orders) setRealOrders(refreshData.orders)

                  showSuccess("Siparişler başarıyla kargolandı.");
                }}
                className="bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-[12px] h-9 px-6 rounded transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span className="text-sm">✔</span>
                <span>Kargola</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inner Modal for Print Actions */}
      {showPrintModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setShowPrintModal(false)} />
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[420px] flex flex-col relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-zinc-100 px-5 py-4 flex items-center justify-between">
              <span className="text-[15px] font-bold text-zinc-800">Yazdır</span>
            </div>
            
            {/* Body */}
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold text-zinc-500">Yazdırma Şablonu</label>
                <select 
                  value={printTemplate}
                  onChange={(e) => setPrintTemplate(e.target.value)}
                  className="w-full border border-blue-500 ring-2 ring-blue-50 rounded px-3 py-2.5 text-[13px] font-bold text-zinc-800 focus:outline-none cursor-pointer bg-white"
                >
                  <option value="E-Fatura">E-Fatura</option>
                  <option value="Fatura">Fatura</option>
                  <option value="Kargo Fişi">Kargo Fişi</option>
                  <option value="Fiş">Fiş</option>
                  <option value="PDF">PDF</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-zinc-50 flex justify-end gap-2 border-t border-zinc-100">
              <button
                onClick={() => setShowPrintModal(false)}
                className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold text-[12px] h-9 px-5 rounded transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  // Simulate bulk print
                  triggerPrintSimulation(printTemplate, printModalTargetIds);
                  alert(`${printModalTargetIds.length} adet sipariş için ${printTemplate} yazdırma işlemi başlatıldı.`);
                  setShowPrintModal(false);
                }}
                className="bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-[12px] h-9 px-6 rounded transition-colors shadow-sm"
              >
                Yazdır
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedOrderIds.length > 0 && !selectedOrderId && (
        <div 
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#2c303f] rounded-xl shadow-2xl flex items-center overflow-hidden z-[99999]"
          style={{ boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.1)' }}
        >
          <button 
            onClick={() => {
              setStatusModalTargetIds(selectedOrderIds);
              setNewStatusValue("onay_bekleyen");
              setShowStatusModal(true);
            }}
            className="flex items-center gap-2 px-6 py-4 bg-[#7e22ce] hover:bg-purple-600 text-white font-bold text-xs transition-colors border-r border-zinc-700/50"
          >
            <span className="text-[14px]">☰</span>
            Durum ({selectedOrderIds.length})
          </button>
          
          <button 
            onClick={() => {
              setPrintModalTargetIds(selectedOrderIds);
              setPrintTemplate("E-Fatura");
              setShowPrintModal(true);
            }}
            className="flex items-center gap-2 px-6 py-4 bg-[#b45309] hover:bg-amber-600 text-white font-bold text-xs transition-colors border-r border-zinc-700/50"
          >
            <span className="text-[14px]">🖨️</span>
            Yazdır ({selectedOrderIds.length})
          </button>

          <button 
            onClick={() => {
              triggerPrintSimulation("E-Fatura", selectedOrderIds);
              showSuccess(`${selectedOrderIds.length} sipariş için toplu E-Fatura kesme işlemi başlatıldı.`);
            }}
            className="flex items-center gap-2 px-6 py-4 bg-[#1e40af] hover:bg-blue-700 text-white font-bold text-xs transition-colors"
          >
            <span className="text-[14px]">e</span>
            E-Fatura ({selectedOrderIds.length})
          </button>
        </div>
      )}

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setSuccessModal(null)} />
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[380px] flex flex-col relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden text-center">
            <div className="p-8 flex flex-col items-center gap-5">
              <div className="w-[72px] h-[72px] bg-[#10B981] rounded-full flex items-center justify-center shadow-md">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[20px] font-bold text-zinc-800 tracking-tight">İşlem Tamamlandı!</h3>
                <p className="text-[14px] font-medium text-zinc-500 mt-1">{successModal}</p>
              </div>
            </div>
            <div className="p-5 bg-zinc-50 border-t border-zinc-100 flex justify-center">
              <button
                onClick={() => setSuccessModal(null)}
                className="bg-[#3b82f6] hover:bg-blue-600 text-white font-bold text-[14px] w-full max-w-[140px] h-10 rounded transition-colors shadow-sm"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showProductSearchModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowProductSearchModal(false)} />
          <div className="bg-zinc-100 rounded-lg border border-zinc-200 shadow-2xl w-full max-w-[900px] h-[80vh] flex flex-col overflow-hidden relative z-10 animate-scale-up">
            
            <div className="bg-[#0d6efd] text-white px-5 py-3 flex items-center justify-between select-none shrink-0">
              <h2 className="text-sm font-bold tracking-tight">Ürünler</h2>
              <button 
                onClick={() => setShowProductSearchModal(false)} 
                className="text-white hover:opacity-85 p-1 rounded-lg transition-colors"
              >
                <XMark className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white border-b border-zinc-200 flex flex-col gap-3 shrink-0">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded focus:border-[#0d6efd] focus:ring-1 focus:ring-[#0d6efd] outline-none transition-shadow text-sm"
                  placeholder="Ürün Ara..."
                  value={productSearchQuery}
                  onChange={e => setProductSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchProducts()}
                />
              </div>
              <div className="flex gap-2">
                <select className="border border-zinc-300 rounded px-3 py-1.5 text-[11px] font-medium text-zinc-700 bg-zinc-50 flex-1"><option>Tüm Kategoriler</option></select>
                <select className="border border-zinc-300 rounded px-3 py-1.5 text-[11px] font-medium text-zinc-700 bg-zinc-50 flex-1"><option>Tüm Markalar</option></select>
                <select className="border border-zinc-300 rounded px-3 py-1.5 text-[11px] font-medium text-zinc-700 bg-zinc-50 flex-1"><option>Tüm Filtreler</option></select>
                <select className="border border-zinc-300 rounded px-3 py-1.5 text-[11px] font-medium text-zinc-700 bg-zinc-50 flex-1"><option>Yeniden Eskiye</option></select>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {searchingProducts ? (
                <div className="flex justify-center py-10"><span className="text-zinc-500 font-medium text-sm">Aranıyor...</span></div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {productSearchResults.map(product => (
                    (product.variants || []).map((variant: any) => (
                      <div key={variant.id} className="bg-white border border-zinc-200 rounded p-3 flex flex-col items-center gap-2 group relative shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-full aspect-[3/4] bg-zinc-100 rounded overflow-hidden relative">
                          {product.thumbnail ? (
                            <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">👖</div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <button 
                              onClick={() => handleAddProductToOrder(product, variant)}
                              className="w-12 h-12 bg-zinc-800 text-white rounded-full flex items-center justify-center hover:bg-zinc-700 hover:scale-110 transition-all shadow-lg"
                              title="Siparişe Ekle"
                            >
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                            </button>
                          </div>
                        </div>
                        <div className="text-center w-full">
                          <h4 className="text-[11px] font-bold text-zinc-800 line-clamp-1">{product.title}</h4>
                          <div className="text-[10px] font-semibold text-zinc-500 mt-0.5">{variant.title}</div>
                          <div className="text-xs font-bold text-zinc-900 mt-1">
                            {((variant.prices?.find((p: any) => p.currency_code === "try")?.amount || 0) / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                          </div>
                          <div className="text-[9px] text-zinc-400 mt-1 uppercase">{variant.sku || "-"}</div>
                          <div className="text-[9px] text-zinc-400 mt-0.5">Stok: {variant.inventory_quantity || 0}</div>
                        </div>
                      </div>
                    ))
                  ))}
                  {productSearchResults.length === 0 && !searchingProducts && productSearchQuery && (
                    <div className="col-span-full text-center py-10 text-zinc-500 font-medium text-sm">Sonuç bulunamadı.</div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      <PosModal isOpen={isPosOpen} onOpenChange={setIsPosOpen} onOrderCreated={() => window.location.reload()} />
    </div>
  )
}

import { defineWidgetConfig } from "@medusajs/admin-sdk"
export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default SiparisYonetimiPage
