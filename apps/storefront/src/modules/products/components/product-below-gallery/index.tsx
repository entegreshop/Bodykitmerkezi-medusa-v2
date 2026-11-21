"use client"

import React, { useEffect, useMemo, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { extractVehicleCompatibility } from "@modules/products/components/product-actions/vehicle-compatibility"

export const BOYA_SERVICE_PRICE_TL = 1800
export const MONTAJ_SERVICE_PRICE_TL = 1200

type ServiceAddonsSettings = {
  service_addons_enabled: boolean
  service_addons_heading: string
  service_addons_subheading: string
  boya_enabled: boolean
  boya_title: string
  boya_description: string
  boya_price_tl: number
  montaj_enabled: boolean
  montaj_title: string
  montaj_description: string
  montaj_price_tl: number
  show_surface_note: boolean
  surface_note_text: string
}

const DEFAULT_SERVICE_ADDONS_SETTINGS: ServiceAddonsSettings = {
  service_addons_enabled: true,
  service_addons_heading: "Bu Parçayı Ne Hâlde İstiyorsunuz?",
  service_addons_subheading: "Opsiyonel Ek Hizmetler",
  boya_enabled: true,
  boya_title: "Boya Hizmeti",
  boya_description:
    "Aracınızın orijinal renk kodunda, profesyonel fırın boya atölyemizde hazırlanır",
  boya_price_tl: BOYA_SERVICE_PRICE_TL,
  montaj_enabled: true,
  montaj_title: "Montaj Hizmeti",
  montaj_description:
    "BodyKit Merkezi uzman uygulama atölyemizde aracınıza profesyonel montaj",
  montaj_price_tl: MONTAJ_SERVICE_PRICE_TL,
  show_surface_note: true,
  surface_note_text: "Boyasız (ham yüzey) gönderilir.",
}

type ProductBelowGalleryProps = {
  product: HttpTypes.StoreProduct
}

export default function ProductBelowGallery({ product }: ProductBelowGalleryProps) {
  const [boyaSelected, setBoyaSelected] = useState(false)
  const [montajSelected, setMontajSelected] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState("905323370081")
  const [globalSettings, setGlobalSettings] = useState<ServiceAddonsSettings>(
    DEFAULT_SERVICE_ADDONS_SETTINGS
  )

  const addonsConfig = useMemo<ServiceAddonsSettings>(() => {
    const prodMeta = (product.metadata as Record<string, any> | undefined)?.service_addons
    if (!prodMeta || typeof prodMeta !== "object") {
      return globalSettings
    }
    return {
      service_addons_enabled:
        typeof prodMeta.enabled === "boolean"
          ? prodMeta.enabled
          : globalSettings.service_addons_enabled,
      service_addons_heading:
        prodMeta.heading || globalSettings.service_addons_heading,
      service_addons_subheading:
        prodMeta.subheading || globalSettings.service_addons_subheading,
      boya_enabled:
        typeof prodMeta.boya_enabled === "boolean"
          ? prodMeta.boya_enabled
          : globalSettings.boya_enabled,
      boya_title: prodMeta.boya_title || globalSettings.boya_title,
      boya_description:
        prodMeta.boya_description || globalSettings.boya_description,
      boya_price_tl:
        prodMeta.boya_price_tl !== undefined && prodMeta.boya_price_tl !== ""
          ? Number(prodMeta.boya_price_tl)
          : globalSettings.boya_price_tl,
      montaj_enabled:
        typeof prodMeta.montaj_enabled === "boolean"
          ? prodMeta.montaj_enabled
          : globalSettings.montaj_enabled,
      montaj_title: prodMeta.montaj_title || globalSettings.montaj_title,
      montaj_description:
        prodMeta.montaj_description || globalSettings.montaj_description,
      montaj_price_tl:
        prodMeta.montaj_price_tl !== undefined && prodMeta.montaj_price_tl !== ""
          ? Number(prodMeta.montaj_price_tl)
          : globalSettings.montaj_price_tl,
      show_surface_note:
        typeof prodMeta.show_surface_note === "boolean"
          ? prodMeta.show_surface_note
          : globalSettings.show_surface_note,
      surface_note_text:
        prodMeta.surface_note_text || globalSettings.surface_note_text,
    }
  }, [globalSettings, product.metadata])

  useEffect(() => {
    setBoyaSelected(false)
    setMontajSelected(false)
    if (typeof window !== "undefined") {
      const payload = {
        boyaSelected: false,
        montajSelected: false,
        boyaPriceTl: addonsConfig.boya_price_tl,
        montajPriceTl: addonsConfig.montaj_price_tl,
      }
      ;(window as any).__bkmServiceAddons = payload
      window.dispatchEvent(
        new CustomEvent("bkmServiceAddonsChanged", {
          detail: payload,
        })
      )
    }
  }, [product.id])

  useEffect(() => {
    const fetchWhatsappConfig = async () => {
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.bodykitmerkezi.com"
        const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        const headers: Record<string, string> = {}
        if (publishableKey) {
          headers["x-publishable-api-key"] = publishableKey
        }
        const res = await fetch(`${backendUrl}/store/hero-config`, { headers })
        const data = await res.json()
        if (data?.config?.whatsapp_number) {
          setWhatsappNumber(data.config.whatsapp_number)
        }
        const pds = data?.config?.product_detail_settings
        if (pds && typeof pds === "object") {
          setGlobalSettings((prev) => ({
            ...prev,
            service_addons_enabled: pds.service_addons_enabled ?? prev.service_addons_enabled,
            service_addons_heading: pds.service_addons_heading || prev.service_addons_heading,
            service_addons_subheading:
              pds.service_addons_subheading || prev.service_addons_subheading,
            boya_enabled: pds.boya_enabled ?? prev.boya_enabled,
            boya_title: pds.boya_title || prev.boya_title,
            boya_description: pds.boya_description || prev.boya_description,
            boya_price_tl:
              pds.boya_price_tl !== undefined
                ? Number(pds.boya_price_tl)
                : prev.boya_price_tl,
            montaj_enabled: pds.montaj_enabled ?? prev.montaj_enabled,
            montaj_title: pds.montaj_title || prev.montaj_title,
            montaj_description: pds.montaj_description || prev.montaj_description,
            montaj_price_tl:
              pds.montaj_price_tl !== undefined
                ? Number(pds.montaj_price_tl)
                : prev.montaj_price_tl,
            show_surface_note: pds.show_surface_note ?? prev.show_surface_note,
            surface_note_text: pds.surface_note_text || prev.surface_note_text,
          }))
        }
      } catch {}
    }
    fetchWhatsappConfig()
  }, [])

  const vehicleCompat = useMemo(() => {
    return extractVehicleCompatibility(
      product.title || "",
      product.description,
      product.metadata as Record<string, any>
    )
  }, [product.title, product.description, product.metadata])

  const notifyAddonsChange = (nextBoya: boolean, nextMontaj: boolean) => {
    if (typeof window !== "undefined") {
      const payload = {
        boyaSelected: nextBoya,
        montajSelected: nextMontaj,
        boyaPriceTl: addonsConfig.boya_price_tl,
        montajPriceTl: addonsConfig.montaj_price_tl,
      }
      ;(window as any).__bkmServiceAddons = payload
      window.dispatchEvent(
        new CustomEvent("bkmServiceAddonsChanged", {
          detail: payload,
        })
      )
    }
  }

  useEffect(() => {
    const effectiveBoya =
      addonsConfig.service_addons_enabled && addonsConfig.boya_enabled ? boyaSelected : false
    const effectiveMontaj =
      addonsConfig.service_addons_enabled && addonsConfig.montaj_enabled
        ? montajSelected
        : false
    if (effectiveBoya !== boyaSelected) setBoyaSelected(effectiveBoya)
    if (effectiveMontaj !== montajSelected) setMontajSelected(effectiveMontaj)
    notifyAddonsChange(effectiveBoya, effectiveMontaj)
  }, [
    addonsConfig.service_addons_enabled,
    addonsConfig.boya_enabled,
    addonsConfig.montaj_enabled,
    addonsConfig.boya_price_tl,
    addonsConfig.montaj_price_tl,
  ])

  const handleToggleBoya = () => {
    const next = !boyaSelected
    setBoyaSelected(next)
    notifyAddonsChange(next, montajSelected)
  }

  const handleToggleMontaj = () => {
    const next = !montajSelected
    setMontajSelected(next)
    notifyAddonsChange(boyaSelected, next)
  }

  const formatTlAmount = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val)
  }

  const whatsappServiceNotes: string[] = []
  if (
    addonsConfig.service_addons_enabled &&
    addonsConfig.boya_enabled &&
    boyaSelected &&
    !vehicleCompat.isPrePaintedPianoBlack &&
    !vehicleCompat.isTrunkMat
  ) {
    whatsappServiceNotes.push(`+${addonsConfig.boya_title} (₺${addonsConfig.boya_price_tl})`)
  }
  if (
    addonsConfig.service_addons_enabled &&
    addonsConfig.montaj_enabled &&
    montajSelected &&
    !vehicleCompat.isTrunkMat
  ) {
    whatsappServiceNotes.push(
      `+${addonsConfig.montaj_title} (₺${addonsConfig.montaj_price_tl})`
    )
  }
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Merhaba, ${product.title}${
      whatsappServiceNotes.length ? ` (${whatsappServiceNotes.join(", ")})` : ""
    } aracım için uyumlu mu? Bilgi almak istiyorum.`
  )}`

  return (
    <div className="flex flex-col gap-y-5 mt-6" data-testid="product-below-gallery">
      {/* 1. ARAÇ & MODEL YILI UYUMLULUK KARTI */}
      <div
        className="rounded-xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50/70 to-zinc-100/60 p-4 sm:p-5 shadow-sm"
        data-testid="vehicle-compatibility-card"
      >
        <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-zinc-200/80">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E50000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
                <circle cx="6.5" cy="16.5" r="2.5" />
                <circle cx="16.5" cy="16.5" r="2.5" />
              </svg>
              <span>Uyumlu Araç & Kasa Bilgisi</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-zinc-900">
              {vehicleCompat.brandAndModel}
            </h2>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-900 text-white">
                {vehicleCompat.chassisLabel}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white border border-zinc-200 text-zinc-700">
                {vehicleCompat.isPrePaintedPianoBlack
                  ? "Parlak Siyah (Piano Black) Yüzey"
                  : vehicleCompat.isTrunkMat
                  ? "Araca Özel Kalıp"
                  : "Boyasız (Ham Yüzey) Gönderilir"}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Model Yılı
            </span>
            <span className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#E50000]/10 border border-[#E50000]/25 text-[#E50000] font-extrabold text-base sm:text-lg tracking-tight">
              {vehicleCompat.startYear} – {vehicleCompat.endYear}
            </span>
          </div>
        </div>

        {/* Model Yılı Zaman Şeridi (Timeline Grid) */}
        <div className="mt-4">
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
            {vehicleCompat.timelineYears.map((item, idx) => (
              <div
                key={`${item.year}-${idx}`}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`w-full h-2 rounded-full transition-all ${
                    item.active
                      ? "bg-[#E50000] shadow-[0_0_8px_rgba(229,0,0,0.35)]"
                      : "bg-zinc-200"
                  }`}
                />
                <span
                  className={`w-full text-center py-1 rounded-md text-xs transition-all ${
                    item.active
                      ? "bg-zinc-900 text-white font-bold shadow-sm"
                      : "bg-zinc-100 text-zinc-400 font-medium"
                  }`}
                >
                  {item.year}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3.5 flex items-start gap-2 rounded-lg bg-white/90 border border-zinc-200/80 px-3 py-2.5 text-xs text-zinc-600 leading-relaxed">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 mt-0.5"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>
              Ruhsatınızdaki model yılı{" "}
              <strong className="text-zinc-900 font-semibold">
                {vehicleCompat.startYear} ile {vehicleCompat.endYear}
              </strong>{" "}
              arasındaysa aracınızla birebir uyumludur.{" "}
              {vehicleCompat.startYear} ve {vehicleCompat.endYear} kasa geçiş yılları için emin
              değilseniz WhatsApp destek hattımızdan teyit alabilirsiniz.
            </span>
          </div>
        </div>
      </div>

      {/* 2. BOYA & MONTAJ ÖZELLEŞTİRME SEÇENEKLERİ */}
      {!vehicleCompat.isTrunkMat &&
        addonsConfig.service_addons_enabled &&
        (addonsConfig.boya_enabled || addonsConfig.montaj_enabled) && (
          <div
            className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-sm flex flex-col gap-y-3"
            data-testid="service-addons-card"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-800">
                {addonsConfig.service_addons_heading}
              </span>
              <span className="text-[11px] font-medium text-zinc-500">
                {addonsConfig.service_addons_subheading}
              </span>
            </div>

            {/* Boya Seçeneği */}
            {addonsConfig.boya_enabled && (
              <>
                {!vehicleCompat.isPrePaintedPianoBlack ? (
                  <button
                    type="button"
                    onClick={handleToggleBoya}
                    className={`w-full text-left rounded-lg border p-3.5 transition-all flex items-center justify-between gap-3 ${
                      boyaSelected
                        ? "border-[#E50000] bg-red-50/40 ring-1 ring-[#E50000]/30"
                        : "border-zinc-200 hover:border-zinc-300 bg-zinc-50/40"
                    }`}
                    data-testid="addon-boya-toggle"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                          boyaSelected
                            ? "bg-[#E50000] border-[#E50000] text-white"
                            : "bg-white border-zinc-300"
                        }`}
                      >
                        {boyaSelected && (
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>

                      <div className="w-9 h-9 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2Z" />
                          <path d="M12 11V3" />
                          <path d="m8 6 4-3 4 3" />
                        </svg>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-900">
                          {addonsConfig.boya_title}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {addonsConfig.boya_description}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-sm font-extrabold whitespace-nowrap ${
                        boyaSelected ? "text-[#E50000]" : "text-zinc-900"
                      }`}
                    >
                      +₺{formatTlAmount(addonsConfig.boya_price_tl)}
                    </span>
                  </button>
                ) : (
                  <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-emerald-950">
                          Kendinden Boyalı (Piano Black / Parlak Siyah) Ürün
                        </span>
                        <span className="text-[11px] text-emerald-800">
                          Bu ürün ek boya gerektirmeden parlak siyah yüzeyli olarak gönderilir.
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">
                      Boyalı
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Montaj Seçeneği */}
            {addonsConfig.montaj_enabled && (
              <button
                type="button"
                onClick={handleToggleMontaj}
                className={`w-full text-left rounded-lg border p-3.5 transition-all flex items-center justify-between gap-3 ${
                  montajSelected
                    ? "border-[#E50000] bg-red-50/40 ring-1 ring-[#E50000]/30"
                    : "border-zinc-200 hover:border-zinc-300 bg-zinc-50/40"
                }`}
                data-testid="addon-montaj-toggle"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      montajSelected
                        ? "bg-[#E50000] border-[#E50000] text-white"
                        : "bg-white border-zinc-300"
                    }`}
                  >
                    {montajSelected && (
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>

                  <div className="w-9 h-9 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-900">
                      {addonsConfig.montaj_title}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {addonsConfig.montaj_description}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-sm font-extrabold whitespace-nowrap ${
                    montajSelected ? "text-[#E50000]" : "text-zinc-900"
                  }`}
                >
                  +₺{formatTlAmount(addonsConfig.montaj_price_tl)}
                </span>
              </button>
            )}
          </div>
        )}

      {/* 3. DEĞİŞİM GÜVENCESİ, WHATSAPP UYUM TEYİDİ & KARGO / İADE BİLGİLERİ */}
      <div
        className="flex flex-col gap-y-3.5"
        data-testid="guarantees-and-whatsapp-section"
      >
        {/* Yüzey durumu bilgi satırı */}
        {addonsConfig.show_surface_note && (
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 px-1">
            <span className="w-2 h-2 rounded-full bg-zinc-400 shrink-0" />
            <span>
              {vehicleCompat.isPrePaintedPianoBlack
                ? "Parlak Siyah (Piano Black) boyalı yüzey olarak gönderilir."
                : vehicleCompat.isTrunkMat
                ? "Araca özel birebir kalıp olarak gönderilir."
                : boyaSelected
                ? "Seçiminiz doğrultusunda aracınızın orijinal renk kodunda boyalı gönderilir."
                : addonsConfig.surface_note_text}
            </span>
          </div>
        )}

        {/* 2'li Güvence Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Kart 1: Kargo Hasar Güvencesi */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 flex items-start gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-[#E50000]/10 border border-[#E50000]/20 text-[#E50000] flex items-center justify-center shrink-0 mt-0.5">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs sm:text-[13px] font-extrabold text-zinc-900 leading-snug">
                Kargoda hasar görürse değişim bizden
              </span>
              <p className="text-[11px] sm:text-xs text-zinc-600 leading-relaxed">
                Teslimatta paketi kontrol et, hasar varsa tutanak tut ve bize yaz. Değişim ve kargo bizden.
              </p>
            </div>
          </div>

          {/* Kart 2: Yanlış Parça Değişim Güvencesi */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 flex items-start gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-[#E50000]/10 border border-[#E50000]/20 text-[#E50000] flex items-center justify-center shrink-0 mt-0.5">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs sm:text-[13px] font-extrabold text-zinc-900 leading-snug">
                Yanlış parça geldiyse değişim bizden
              </span>
              <p className="text-[11px] sm:text-xs text-zinc-600 leading-relaxed">
                Uyum bilgisi bizden kaynaklı yanlışsa değişim ya da iade, kargo bizden.
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp "Aracıma uyar mı? WhatsApp'tan sor" Butonu */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-12 rounded-xl border border-emerald-500/40 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-colors shadow-sm"
          data-testid="whatsapp-fitment-button"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366] shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          <span>Aracıma uyar mı? WhatsApp&apos;tan sor</span>
        </a>

        {/* Alt Kargo & 14 Gün Cayma Hakkı Satırı */}
        <div className="pt-3 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#E50000] shrink-0 mt-1.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-extrabold text-zinc-900">
                1–3 iş günü içinde kargoda
              </span>
              <span className="text-[11px] text-zinc-500 leading-relaxed">
                Stoktaki ürünler için hazırlık süresi. Boya veya montaj seçilirse uzar.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#E50000] shrink-0 mt-1.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-extrabold text-zinc-900">
                14 gün cayma hakkı
              </span>
              <span className="text-[11px] text-zinc-500 leading-relaxed">
                Mesafeli satış mevzuatı kapsamında iade hakkınız var.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
