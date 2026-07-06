import { useState, useEffect } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Sparkles } from "@medusajs/icons"

interface DashboardStats {
  orders: {
    new: number
    preparing: number
    onayBekleyen: number
    hazirlanan: number
    kargolanan: number
    teslimEdilen: number
    iadeEdilen: number
    circleCount: number
    channels: Array<{ name: string; count: number | string }>
  }
  salesPerformance: {
    totalRevenue: number
    totalOrders: number
    dailyAvgRevenue: number
    dailyAvgOrders: number
    weeklyAvgRevenue: number
    weeklyAvgOrders: number
    monthlyAvgRevenue: number
    monthlyAvgOrders: number
  }
  cartSummary: {
    averageCart: number
    averagePrice: number
    averageProductCount: number
    averageQuantityCount: number
  }
  activeVisitors: {
    count: number
    desktopPercent: number
    mobilePercent: number
  }
  conversionRates: {
    overallRate: number
    visitors: number
    cartsCreated: number
    cartsCreatedPercent: number
    checkoutInitiated: number
    checkoutInitiatedPercent: number
    addressEntered: number
    addressEnteredPercent: number
    sales: number
    salesPercent: number
  }
  bestSellers: Array<{
    title: string
    subtitle: string
    thumbnail: string
    sku: string
    quantity: number
    price: number
    costPrice: number
    totalSales: number
  }>
  criticalStocks: Array<{
    product_title: string
    variant_title: string
    sku: string
    thumbnail: string
    stock: number
  }>
  trafficSources?: Array<{
    source: string
    visitors: number
    sales: number
    rate: number
  }>
  chartData?: {
    labels: string[]
    orders: number[]
    revenue: number[]
  }
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val) + " TL"
}

const formatNumber = (val: number) => {
  return new Intl.NumberFormat("tr-TR").format(val)
}

// Helper to generate dynamic SVG paths
const getSvgPaths = (data: number[], width = 560, height = 150) => {
  if (!data || data.length === 0) return { linePath: "", areaPath: "", points: [] }
  const maxVal = Math.max(...data, 1)
  const points = data.map((val, idx) => {
    const x = data.length > 1 ? (idx / (data.length - 1)) * width + 20 : 20
    const y = height + 20 - (val / maxVal) * height
    return { x, y }
  })

  const linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height + 40} L ${points[0].x} ${height + 40} Z`

  return { linePath, areaPath, points }
}

const getDomainName = () => {
  if (typeof window === "undefined") return "cizgibutik.com"
  const host = window.location.hostname
  if (host === "localhost" || host === "127.0.0.1") {
    return "cizgibutik.com"
  }
  return host.replace("www.", "")
}

const getDomainBrand = () => {
  const domain = getDomainName()
  const part = domain.split('.')[0]
  return part.charAt(0).toUpperCase() + part.slice(1)
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePeriod, setActivePeriod] = useState<string>("Bugün")
  const [liveVisitors, setLiveVisitors] = useState<number>(12)
  const [liveDesktopPercent, setLiveDesktopPercent] = useState<number>(65)
  const [liveMobilePercent, setLiveMobilePercent] = useState<number>(35)

  useEffect(() => {
    if (stats) {
      setLiveVisitors(stats.activeVisitors.count)
      setLiveDesktopPercent(stats.activeVisitors.desktopPercent)
      setLiveMobilePercent(stats.activeVisitors.mobilePercent)
    }
  }, [stats])

  // No fake fluctuation

  const periods = [
    "Bugün",
    "Dün",
    "Bu Hafta",
    "Geçen Hafta",
    "Bu Ay",
    "Geçen Ay",
    "Bu Yıl",
    "Tüm Zamanlar",
  ]

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/admin/dashboard-stats?period=${encodeURIComponent(activePeriod)}`, {
          cache: "no-store",
        })
        const data = await res.json()
        if (data && data.success) {
          setStats(data.stats)
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [activePeriod])

  if (loading || !stats) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-zinc-50 rounded-2xl border border-zinc-200 p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-zinc-500">Pano Yükleniyor...</span>
        </div>
      </div>
    )
  }

  // Calculate paths for Sales Chart
  const revenueChart = getSvgPaths(stats.chartData?.revenue || [], 560, 150)
  const ordersChart = getSvgPaths(stats.chartData?.orders || [], 560, 150)

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-6 text-zinc-800 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-zinc-900">Hoş geldin!</h1>
        <div className="flex flex-wrap items-center bg-white rounded-lg p-1 border border-zinc-200 shadow-sm gap-1">
          {periods.map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setActivePeriod(period)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                activePeriod === period
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {period}
            </button>
          ))}
          <button
            type="button"
            className="px-3 py-1.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-md flex items-center gap-1 border-l border-zinc-200 pl-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Tarih Seç
          </button>
        </div>
      </div>

      {/* Row 1: SIPARIŞLER, SATIŞ PERFORMANSI, SEPET ÖZETİ, AKTİF ZİYARETÇİLER */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        
        {/* Card 1: Sipariş */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-l-4 border-emerald-500 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-black text-emerald-600 tracking-tight">Sipariş</span>
                
                {/* Circular count with ping action */}
                <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-zinc-50 border border-zinc-200/80 shadow-sm">
                  {/* Ping animation element */}
                  <div className="absolute w-12 h-12 rounded-full border border-emerald-400/35 animate-ping" />
                  
                  <span className="text-lg font-black text-emerald-600 z-10">
                    {stats.orders.circleCount}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-100 h-3 rounded-full mb-4 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "100%" }} />
              </div>

              {/* Status List */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs font-bold border-b border-zinc-50 pb-1.5">
                  <span className="text-zinc-600">Onay Bekleyen</span>
                  <span className="text-zinc-900 font-extrabold">{stats.orders.onayBekleyen}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold border-b border-zinc-50 pb-1.5">
                  <span className="text-zinc-600">Hazırlanan</span>
                  <span className="text-blue-600 font-extrabold">{stats.orders.hazirlanan}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold border-b border-zinc-50 pb-1.5">
                  <span className="text-zinc-600">Kargolanan</span>
                  <span className="text-amber-500 font-extrabold">{stats.orders.kargolanan}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold border-b border-zinc-50 pb-1.5">
                  <span className="text-zinc-600">Teslim Edilen</span>
                  <span className="text-emerald-600 font-extrabold">{stats.orders.teslimEdilen}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold pb-1">
                  <span className="text-zinc-600">İade Edilen</span>
                  <span className="text-red-500 font-extrabold">{stats.orders.iadeEdilen}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Satış Performansı */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-zinc-900">Satış Performansı</span>
              <div className="flex gap-2">
                <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200">{activePeriod}</span>
                <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200">Siparişler</span>
              </div>
            </div>
            
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-lg font-black text-green-600">{formatCurrency(stats.salesPerformance.totalRevenue)}</span>
              <span className="text-[10px] font-bold text-zinc-400">{activePeriod} Ciro</span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-lg font-black text-emerald-700">{formatNumber(stats.salesPerformance.totalOrders)}</span>
              <span className="text-[10px] font-bold text-zinc-400">{activePeriod} Sipariş</span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t border-zinc-100">
              <div>
                <span className="block text-xs font-black text-zinc-800">{formatCurrency(stats.salesPerformance.dailyAvgRevenue)}</span>
                <span className="text-[9px] font-bold text-zinc-400">Günlük Ortalama Ciro</span>
              </div>
              <div>
                <span className="block text-xs font-black text-zinc-800">{stats.salesPerformance.dailyAvgOrders}</span>
                <span className="text-[9px] font-bold text-zinc-400">Ortalama Sipariş</span>
              </div>
              <div>
                <span className="block text-xs font-black text-zinc-800">{formatCurrency(stats.salesPerformance.weeklyAvgRevenue)}</span>
                <span className="text-[9px] font-bold text-zinc-400">Haftalık Ortalama Ciro</span>
              </div>
              <div>
                <span className="block text-xs font-black text-zinc-800">{stats.salesPerformance.weeklyAvgOrders}</span>
                <span className="text-[9px] font-bold text-zinc-400">Ortalama Sipariş</span>
              </div>
              <div className="col-span-2">
                <span className="block text-xs font-black text-zinc-800">{formatCurrency(stats.salesPerformance.monthlyAvgRevenue)}</span>
                <span className="text-[9px] font-bold text-zinc-400">Aylık Ortalama Ciro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Sepet Özeti */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-zinc-900">Sepet Özeti</span>
              <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200">{activePeriod}</span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-4">
              <div>
                <span className="text-[10px] block font-bold text-zinc-400 mb-0.5">Sepet Ortalaması</span>
                <span className="text-sm font-black text-zinc-900">{formatCurrency(stats.cartSummary.averageCart)}</span>
              </div>
              <div>
                <span className="text-[10px] block font-bold text-zinc-400 mb-0.5">Fiyat Ortalaması</span>
                <span className="text-sm font-black text-zinc-900">{formatCurrency(stats.cartSummary.averagePrice)}</span>
              </div>
              <div>
                <span className="text-[10px] block font-bold text-zinc-400 mb-0.5">Ürün Ortalaması</span>
                <span className="text-sm font-black text-zinc-900">{stats.cartSummary.averageProductCount}</span>
              </div>
              <div>
                <span className="text-[10px] block font-bold text-zinc-400 mb-0.5">Adet Ortalaması</span>
                <span className="text-sm font-black text-zinc-900">{stats.cartSummary.averageQuantityCount}</span>
              </div>
            </div>
          </div>

          {/* sparkline */}
          <div className="w-full h-16 bg-gradient-to-t from-blue-50 to-white flex items-end">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path
                d="M0 25 Q15 5, 30 15 T60 8 T90 28 T100 20 L100 30 L0 30 Z"
                fill="rgba(59, 130, 246, 0.15)"
              />
              <path
                d="M0 25 Q15 5, 30 15 T60 8 T90 28 T100 20"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>

        {/* Card 4: Aktif Ziyaretçiler */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-bold text-zinc-900">Aktif Ziyaretçiler</span>
              <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200">Son 10 Dakika</span>
            </div>

            <div className="flex flex-col items-center justify-center my-4">
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-zinc-50 border border-zinc-200 shadow-inner">
                <div className="absolute w-20 h-20 rounded-full border border-indigo-200 animate-ping" />
                <div className="flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-zinc-900">{liveVisitors}</span>
                  <span className="text-[9px] font-bold text-zinc-400">Kullanıcı</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-around border-t border-zinc-100 pt-3 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-zinc-600">Masaüstü %{liveDesktopPercent}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
              <span className="text-zinc-600">Mobil %{liveMobilePercent}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: SATIŞ GRAFİĞİ, SATIŞ KANALLARI, DÖNÜŞÜM ORANLARI */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
        
        {/* Satış Grafiği */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm xl:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-900">Satış Grafiği</span>
                <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200">{activePeriod}</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Sipariş</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Ciro</span>
                </div>
                <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200">Siparişler</span>
              </div>
            </div>

            {/* SVG Area Chart */}
            <div className="w-full h-56 pt-4 relative">
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="0" y1="40" x2="600" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="80" x2="600" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="160" x2="600" y2="160" stroke="#f1f5f9" strokeWidth="1" />

                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
                    <stop offset="100%" stopColor="rgba(59, 130, 246, 0.0)" />
                  </linearGradient>
                  <linearGradient id="orderGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" />
                    <stop offset="100%" stopColor="rgba(16, 185, 129, 0.0)" />
                  </linearGradient>
                </defs>

                {/* Dynamic Ciro (Blue Area and Line) */}
                {revenueChart.areaPath && (
                  <path d={revenueChart.areaPath} fill="url(#chartGlow)" />
                )}
                {revenueChart.linePath && (
                  <path d={revenueChart.linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                )}

                {/* Dynamic Sipariş (Green Area and Line) */}
                {ordersChart.areaPath && (
                  <path d={ordersChart.areaPath} fill="url(#orderGlow)" />
                )}
                {ordersChart.linePath && (
                  <path d={ordersChart.linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                )}

                {/* Dots on peak or all points */}
                {revenueChart.points.map((p, idx) => (
                  <circle key={`rev-dot-${idx}`} cx={p.x} cy={p.y} r="3.5" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />
                ))}
                {ordersChart.points.map((p, idx) => (
                  <circle key={`ord-dot-${idx}`} cx={p.x} cy={p.y} r="3.5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                ))}
              </svg>
            </div>
            
            {/* Months Axis */}
            <div className="flex justify-between text-[10px] font-bold text-zinc-400 mt-2 px-2">
              {(stats.chartData?.labels || []).map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Satış Kanalları */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm xl:col-span-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-zinc-900">Satış Kanalları</span>
              <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200">{activePeriod}</span>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 mb-6 justify-end">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
                <span>Sipariş</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded bg-blue-500" />
                <span>Ciro</span>
              </div>
            </div>

            {/* Bar Chart (Single Bar for Çizgibutik) */}
            <div className="w-full h-44 flex items-end justify-center pb-2 relative">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-zinc-200">
                <div className="border-t border-zinc-100 w-full h-0" />
                <div className="border-t border-zinc-100 w-full h-0" />
                <div className="border-t border-zinc-100 w-full h-0" />
                <div className="border-t border-zinc-100 w-full h-0" />
              </div>

              {/* Channel Bars */}
              <div className="flex items-end gap-3 z-10">
                <div className="flex flex-col items-center">
                  <div className="bg-blue-500 w-16 h-36 rounded-t shadow-sm hover:opacity-95 transition-opacity relative flex justify-center items-start pt-2">
                    <div className="w-2 h-2 rounded-full bg-white border border-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-[10px] font-bold text-zinc-500 mt-2">
              {getDomainBrand()}
            </div>
          </div>
        </div>

        {/* Dönüşüm Oranları */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm xl:col-span-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-zinc-900">Dönüşüm Oranları</span>
              <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200">{activePeriod}</span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-lg font-black text-blue-600">%{stats.conversionRates.overallRate}</span>
              <span className="text-[9px] font-bold text-zinc-400">Genel Oran</span>
            </div>

            {/* Funnel Progress List */}
            <div className="flex flex-col gap-3.5">
              
              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-600 mb-1">
                  <span>Ziyaretçiler</span>
                  <span>{formatNumber(stats.conversionRates.visitors)}</span>
                </div>
                <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: "100%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-600 mb-1">
                  <span>Oluşturulan Sepetler</span>
                  <div className="flex gap-2">
                    <span className="text-zinc-400">%{stats.conversionRates.cartsCreatedPercent}</span>
                    <span>{formatNumber(stats.conversionRates.cartsCreated)}</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.max(15, Math.min(100, stats.conversionRates.cartsCreatedPercent * 8))}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-600 mb-1">
                  <span>Ödeme Başlatanlar</span>
                  <div className="flex gap-2">
                    <span className="text-zinc-400">%{stats.conversionRates.checkoutInitiatedPercent}</span>
                    <span>{formatNumber(stats.conversionRates.checkoutInitiated)}</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.max(12, Math.min(100, stats.conversionRates.checkoutInitiatedPercent * 12))}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-600 mb-1">
                  <span>Adres Bilgisi Girenler</span>
                  <div className="flex gap-2">
                    <span className="text-zinc-400">%{stats.conversionRates.addressEnteredPercent}</span>
                    <span>{formatNumber(stats.conversionRates.addressEntered)}</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.max(8, Math.min(100, stats.conversionRates.addressEnteredPercent * 12))}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-600 mb-1">
                  <span>Satışlar</span>
                  <div className="flex gap-2">
                    <span className="text-zinc-400">%{stats.conversionRates.salesPercent}</span>
                    <span>{formatNumber(stats.conversionRates.sales)}</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.max(5, Math.min(100, stats.conversionRates.salesPercent * 15))}%` }} />
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Row 3: YENİ EKLENTİLER, ÖDEME YÖNTEMLERİ, KARGO FİRMALARI, TRAFİK KAYNAKLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        
        {/* Card 8: Yeni Eklentiler */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 mb-4">Yeni Eklentiler</h3>
            
            <div className="flex flex-col gap-4">
              
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0 text-sky-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-bold text-zinc-900">Kar Yağdırma Efekti</span>
                  <span className="text-[10px] text-zinc-500">Ziyaretçilerinize harika bir görsel şölen yaşatabilirsiniz.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-bold text-zinc-900">Çarkıfelek</span>
                  <span className="text-[10px] text-zinc-500">Müşterilere eğlenceli ve ödüllendirici bir alışveriş deneyimi sunan etkili bir pazarlama aracıdır.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0 text-pink-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-bold text-zinc-900">Linkten Ürün Yükle</span>
                  <span className="text-[10px] text-zinc-500">Ürün linklerini kullanarak saniyeler içerisinde ürünü sitenize ekleyebilir ve satışa açabilirsiniz.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-bold text-zinc-900">Kampanya Canı</span>
                  <span className="text-[10px] text-zinc-500">Kullanıcılara canlı bildirimlerle kampanyaları hatırlatın.</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Card 9: Ödeme Yöntemleri */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-zinc-900">Ödeme Yöntemleri</span>
              <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200">{activePeriod}</span>
            </div>

            {/* Donut Chart SVG */}
            <div className="w-full h-36 flex items-center justify-center relative my-3">
              <svg className="w-32 h-32" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4.2" />

                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="4.2"
                  strokeDasharray="48.6 51.4" strokeDashoffset="100" />
                
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#a855f7" strokeWidth="4.2"
                  strokeDasharray="26.9 73.1" strokeDashoffset="51.4" />
                
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="4.2"
                  strokeDasharray="19.7 80.3" strokeDashoffset="24.5" />

                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="4.2"
                  strokeDasharray="4.8 95.2" strokeDashoffset="4.8" />
              </svg>
              <div className="absolute text-center">
                <span className="block text-[10px] font-bold text-zinc-400">Yöntemler</span>
                <span className="text-xs font-black text-zinc-800">Ciro</span>
              </div>
            </div>
          </div>

          {/* Color legends */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-zinc-500 pt-3 border-t border-zinc-100">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
              <span className="truncate">Kapıda Nakit</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 flex-shrink-0" />
              <span className="truncate">Kapıda K. Kartı</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="truncate">PayTR</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
              <span className="truncate">Havale / EFT</span>
            </div>
          </div>
        </div>

        {/* Card 10: Kargo Firmaları */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-zinc-900">Kargo Firmaları</span>
              <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200">{activePeriod}</span>
            </div>

            {/* Donut Chart SVG */}
            <div className="w-full h-36 flex items-center justify-center relative my-3">
              <svg className="w-32 h-32" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4.2" />

                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="4.2"
                  strokeDasharray="55.3 44.7" strokeDashoffset="100" />
                
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8b5cf6" strokeWidth="4.2"
                  strokeDasharray="44.4 55.6" strokeDashoffset="44.7" />
                
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="4.2"
                  strokeDasharray="0.3 99.7" strokeDashoffset="0.3" />
              </svg>
              <div className="absolute text-center">
                <span className="block text-[10px] font-bold text-zinc-400">Dağılım</span>
                <span className="text-xs font-black text-zinc-800">Paketler</span>
              </div>
            </div>
          </div>

          {/* Color legends */}
          <div className="flex items-center justify-around text-[10px] font-bold text-zinc-500 pt-3 border-t border-zinc-100">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
              <span>KARGOİST</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 flex-shrink-0" />
              <span>INTERLINE</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <span>ARAS</span>
            </div>
          </div>
        </div>

        {/* Card 11: Trafik Kaynakları */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-zinc-900">Trafik Kaynakları</span>
              <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200">{activePeriod}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 text-[10px] font-black text-zinc-400">
                    <th className="pb-1.5 font-bold">Kaynak</th>
                    <th className="pb-1.5 font-bold text-right">Oturumlar</th>
                    <th className="pb-1.5 font-bold text-right">Satışlar</th>
                    <th className="pb-1.5 font-bold text-right">Dön. Oranı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 text-[10px] font-semibold text-zinc-600">
                  {(stats.trafficSources || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5">{item.source}</td>
                      <td className="py-1.5 text-right font-bold text-zinc-800">{formatNumber(item.visitors)}</td>
                      <td className="py-1.5 text-right font-bold text-zinc-800">{formatNumber(item.sales)}</td>
                      <td className="py-1.5 text-right text-emerald-600 font-bold">%{item.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Row 4: ÇOK SATANLAR */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
        
        {/* Çok Satanlar */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm xl:col-span-12 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-zinc-900">Çok Satanlar</span>
            <div className="flex gap-2">
              <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200">{activePeriod}</span>
              <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200">Ürünler</span>
            </div>
          </div>

          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-zinc-150 text-[10px] font-black text-zinc-400">
                <th className="pb-2 font-bold">Ürün</th>
                <th className="pb-2 font-bold text-right">Toplam Satış Miktarı</th>
                <th className="pb-2 font-bold text-right">Satış Fiyatı</th>
                <th className="pb-2 font-bold text-right">Alış Fiyatı</th>
                <th className="pb-2 font-bold text-right">Toplam Satış Tutarı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs font-semibold text-zinc-600">
              {stats.bestSellers.map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-3 flex items-center gap-3">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="w-10 h-10 object-cover rounded border border-zinc-150 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 bg-zinc-100 rounded border border-zinc-150 flex items-center justify-center text-zinc-400 font-bold text-[10px] flex-shrink-0">
                        Ürün
                      </div>
                    )}
                    <div>
                      <span className="block text-zinc-900 font-bold">{item.title}</span>
                      <span className="text-[9px] text-zinc-400 block font-bold">{item.sku}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right font-black text-zinc-800">{item.quantity}</td>
                  <td className="py-3 text-right font-bold text-zinc-700">{formatCurrency(item.price)}</td>
                  <td className="py-3 text-right font-bold text-zinc-500">{formatCurrency(item.costPrice)}</td>
                  <td className="py-3 text-right font-black text-zinc-900">{formatCurrency(item.totalSales)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Copyright Footer */}
      <div className="text-center text-[10px] font-bold text-zinc-400 border-t border-zinc-200 pt-4 pb-2">
        Version 5.1.0 Entegreshop E-Ticaret Paketleri
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Pano",
  icon: Sparkles,
})

export default DashboardPage
