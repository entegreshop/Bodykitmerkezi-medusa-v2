import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const NEXT_PUBLIC_MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "https://api.bodykitmerkezi.com"
const NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

async function getHeroConfig() {
  try {
    const headers: Record<string, string> = {}
    if (NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers["x-publishable-api-key"] = NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }
    const res = await fetch(`${NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/hero-config`, {
      next: { revalidate: 30 },
      headers,
    })
    const data = await res.json()
    return data?.config || null
  } catch {
    return null
  }
}

async function getLogoConfig() {
  try {
    const headers: Record<string, string> = {}
    if (NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers["x-publishable-api-key"] = NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }
    const res = await fetch(`${NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/logo-config`, {
      next: { revalidate: 30 },
      headers,
    })
    const data = await res.json()
    let cfg = data?.config || data || null
    while (cfg && typeof cfg === "object" && cfg.config && typeof cfg.config === "object") {
      cfg = cfg.config
    }
    return cfg
  } catch (err) {
    console.error("Failed to fetch logo config in Footer:", err)
    return null
  }
}

export default async function Footer() {
  const [productCategories, logoConfig, heroConfig] = await Promise.all([
    listCategories().catch(() => []),
    getLogoConfig(),
    getHeroConfig(),
  ])

  const footerSettings = heroConfig?.footer_settings || {}
  const footerLogo = logoConfig?.footerLogo || logoConfig?.headerLogo || logoConfig?.logo || logoConfig?.logoUrl || "/logo.png"

  const contactCompany = logoConfig?.contactCompany || "ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SANAYİ TİCARET LİMİTED ŞİRKETİ"
  const contactAddress = logoConfig?.contactAddress || logoConfig?.address || "Merkez Mah. Muallim Naci Sk. Merve No: 9 Güngören / İstanbul 34160"
  const contactPhone = logoConfig?.contactPhone || logoConfig?.phone || "+90 532 337 00 81"
  const contactEmail = logoConfig?.contactEmail || logoConfig?.email || "info@bodykitmerkezi.com"
  const contactHours = logoConfig?.contactHours || logoConfig?.workingHours || "Pzt - Cmt: 09:00 - 19:00"
  const copyrightText = logoConfig?.footerCopyrightText || logoConfig?.copyrightText || `© ${new Date().getFullYear()} BodyKit Merkezi - ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SAN. TİC. LTD. ŞTİ. Tüm hakları saklıdır.`
  const socialLinks = logoConfig?.socialLinks || {}

  return (
    <footer className="border-t border-gray-200 w-full bg-white mt-16">
      <div className="content-container flex flex-col w-full">
        {/* Social Media Row */}
        <div className="flex flex-col md:flex-row justify-between items-center py-8 border-b border-gray-100 gap-y-4">
          <div>
            {footerLogo ? (
              <LocalizedClientLink href="/">
                <img src={footerLogo} alt="BodyKit Merkezi" className="h-9 w-auto object-contain" />
              </LocalizedClientLink>
            ) : (
              <LocalizedClientLink
                href="/"
                className="txt-compact-xlarge-plus text-zinc-950 hover:text-violet-600 font-bold uppercase tracking-widest flex items-center gap-1.5"
              >
                <span>BODYKİT MERKEZİ</span>
              </LocalizedClientLink>
            )}
          </div>
          {footerSettings.show_social !== false && (
            <div className="flex items-center">
              <span className="text-[13px] font-bold tracking-wide mr-4 text-black">Bizi Takip Edin</span>
              <div className="flex items-center gap-x-4">
                <a href={footerSettings.facebook_url || socialLinks.facebook || "#"} target={(footerSettings.facebook_url || socialLinks.facebook) ? "_blank" : undefined} rel="noreferrer" className="text-black hover:opacity-70 transition-opacity">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/></svg>
                </a>
                <a href={footerSettings.tiktok_url || socialLinks.tiktok || "#"} target={(footerSettings.tiktok_url || socialLinks.tiktok) ? "_blank" : undefined} rel="noreferrer" className="text-black hover:opacity-70 transition-opacity">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
                </a>
                <a href={footerSettings.instagram_url || socialLinks.instagram || "#"} target={(footerSettings.instagram_url || socialLinks.instagram) ? "_blank" : undefined} rel="noreferrer" className="text-black hover:opacity-70 transition-opacity">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href={footerSettings.youtube_url || socialLinks.youtube || "#"} target={(footerSettings.youtube_url || socialLinks.youtube) ? "_blank" : undefined} rel="noreferrer" className="text-black hover:opacity-70 transition-opacity">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21.582 6.186a2.686 2.686 0 0 0-1.884-1.895C17.973 3.824 12 3.824 12 3.824s-5.973 0-7.698.467a2.686 2.686 0 0 0-1.884 1.895C1.95 7.915 1.95 12 1.95 12s0 4.085.468 5.814a2.686 2.686 0 0 0 1.884 1.895c1.725.467 7.698.467 7.698.467s5.973 0 7.698-.467a2.686 2.686 0 0 0 1.884-1.895c.468-1.729.468-5.814.468-5.814s0-4.085-.468-5.814zM9.95 15.196V8.804l6.216 3.196-6.216 3.196z"/></svg>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Main Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-gray-100">
          {/* Kurumsal */}
          <div className="flex flex-col gap-y-4">
            <span className="font-bold text-[15px] text-black">Kurumsal</span>
            <ul className="flex flex-col gap-y-3 text-gray-500 text-[13px]">
              <li><LocalizedClientLink href="/pages/hakkimizda" className="hover:text-black hover:underline">Hakkımızda</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/pages/mesafeli-satis" className="hover:text-black hover:underline">Mesafeli Satış Sözleşmesi</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/pages/iade-ve-degisim" className="hover:text-black hover:underline">İptal, İade ve Değişim Koşulları</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/pages/kvkk" className="hover:text-black hover:underline">KVKK</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/pages/teslimat-kargo" className="hover:text-black hover:underline">Teslimat ve Kargo Şartları</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/pages/gizlilik-sozlesmesi" className="hover:text-black hover:underline">Gizlilik ve Güvenlik Sözleşmesi</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/pages/kullanici-sozlesmesi" className="hover:text-black hover:underline">Kullanıcı Sözleşmesi</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/pages/iletisim" className="hover:text-black hover:underline">İletişim</LocalizedClientLink></li>
            </ul>
          </div>

          {/* Müşteri Hizmetleri */}
          <div className="flex flex-col gap-y-4">
            <span className="font-bold text-[15px] text-black">Müşteri Hizmetleri</span>
            <ul className="flex flex-col gap-y-3 text-gray-500 text-[13px]">
              <li><LocalizedClientLink href="/pages/siparis-takip" className="hover:text-black hover:underline">Sipariş Takip</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/pages/havale-bildirimleri" className="hover:text-black hover:underline">Havale Bildirimleri</LocalizedClientLink></li>
            </ul>
          </div>

          {/* Kategoriler */}
          <div className="flex flex-col gap-y-4">
            <span className="font-bold text-[15px] text-black">Kategoriler</span>
            {productCategories && productCategories.length > 0 && (
              <ul className="flex flex-col gap-y-3 text-gray-500 text-[13px]">
                {productCategories.slice(0, 6).map((c) => {
                  if (c.parent_category) return null
                  return (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-black hover:underline uppercase"
                        href={`/categories/${c.handle}`}
                      >
                        {c.name}
                      </LocalizedClientLink>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Bize Ulaşın */}
          <div className="flex flex-col gap-y-4">
            <span className="font-bold text-[15px] text-black">Bize Ulaşın</span>
            <div className="flex flex-col gap-y-3 text-gray-500 text-[13px] leading-relaxed">
              <p className="font-semibold text-gray-900 text-[12px] leading-snug">{contactCompany}</p>
              <p className="text-[12px] text-gray-600 font-medium">Ticari Marka: BodyKit Merkezi</p>
              {contactAddress && <p>{contactAddress.startsWith("Adres") ? contactAddress : `Adres: ${contactAddress}`}</p>}
              {contactPhone && <p>{contactPhone.startsWith("Tel") ? contactPhone : `Tel: ${contactPhone}`}</p>}
              {contactEmail && <p>{contactEmail.startsWith("E-posta") ? contactEmail : `E-posta: ${contactEmail}`}</p>}
              {contactHours && <p>{contactHours}</p>}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center py-6 gap-y-5 border-t border-gray-100/60">
          {/* Left: SSL & Copyright */}
          <div className="flex flex-col text-[11px] text-gray-500 text-center md:text-left gap-y-1 order-2 md:order-1">
            <span>{footerSettings.ssl_badge_text || "Tüm bilgileriniz 256 bit SSL Sertifikası ile korunmaktadır."}</span>
            <span>{copyrightText}</span>
          </div>

          {/* Center: Frameless Animated EntegreShop Logo (Action travels directly on the logo) */}
          <div className="flex items-center justify-center order-1 md:order-2">
            <style
              dangerouslySetInnerHTML={{
                __html: `
                  @keyframes entegreLogoWave {
                    0% { background-position: 180% 0; }
                    65% { background-position: -60% 0; }
                    100% { background-position: -60% 0; }
                  }
                  @keyframes entegreNodePulse {
                    0%, 100% { transform: translate(-50%, -50%) scale(0.75); opacity: 0.25; }
                    18% { transform: translate(-50%, -50%) scale(1.35); opacity: 1; }
                    45% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.35; }
                  }
                  @keyframes entegreNodeRing {
                    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.9; }
                    45%, 100% { transform: translate(-50%, -50%) scale(2.8); opacity: 0; }
                  }
                  .entegre-logo-mask-shine {
                    background-image: linear-gradient(
                      110deg,
                      transparent 30%,
                      rgba(16, 185, 129, 0.9) 44%,
                      rgba(255, 255, 255, 0.98) 50%,
                      rgba(56, 189, 248, 0.9) 56%,
                      transparent 70%
                    );
                    background-size: 240% 100%;
                    background-repeat: no-repeat;
                    -webkit-mask-image: url('/entegreshop-logo.png');
                    mask-image: url('/entegreshop-logo.png');
                    -webkit-mask-size: contain;
                    mask-size: contain;
                    -webkit-mask-repeat: no-repeat;
                    mask-repeat: no-repeat;
                    -webkit-mask-position: center;
                    mask-position: center;
                    animation: entegreLogoWave 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                  }
                  .entegre-node-dot {
                    animation: entegreNodePulse 3.2s ease-in-out infinite;
                  }
                  .entegre-node-ripple {
                    animation: entegreNodeRing 3.2s cubic-bezier(0, 0, 0.2, 1) infinite;
                  }
                `,
              }}
            />
            <a
              href="https://entegreshop.com"
              target="_blank"
              rel="noopener noreferrer"
              title="EntegreShop"
              className="group relative inline-flex items-center justify-center cursor-pointer select-none transition-transform duration-300 hover:scale-105"
            >
              {/* Base Official EntegreShop Logo (Larger, Frameless) */}
              <img
                src="/entegreshop-logo.png"
                alt="EntegreShop"
                className="h-11 sm:h-12 w-auto object-contain block"
                loading="lazy"
              />

              {/* Travelling Light & Energy Action Directly Inside the Logo Strokes */}
              <span
                aria-hidden="true"
                className="entegre-logo-mask-shine pointer-events-none absolute inset-0 z-10"
              />

              {/* Circuit Terminal Spark on the Hexagon S-Node */}
              <span
                aria-hidden="true"
                style={{ left: "20.4%", top: "32.5%" }}
                className="entegre-node-ripple pointer-events-none absolute w-2.5 h-2.5 rounded-full bg-emerald-400/70 z-20"
              />
              <span
                aria-hidden="true"
                style={{ left: "20.4%", top: "32.5%" }}
                className="entegre-node-dot pointer-events-none absolute w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] z-20"
              />
            </a>
          </div>

          {/* Right: Payment Methods */}
          <div className="flex items-center justify-center md:justify-end gap-x-2 order-3">
            {/* Payment Logos */}
            <div className="h-6 w-10 bg-gray-100 flex items-center justify-center rounded border border-gray-200">
              <span className="text-[10px] font-bold text-blue-800">VISA</span>
            </div>
            <div className="h-6 w-10 bg-gray-100 flex items-center justify-center rounded border border-gray-200">
              <span className="text-[9px] font-bold text-blue-500 leading-none text-center">AMERICAN<br/>EXPRESS</span>
            </div>
            <div className="h-6 w-10 bg-gray-100 flex items-center justify-center rounded border border-gray-200">
              <div className="flex relative">
                <div className="w-3.5 h-3.5 bg-red-500 rounded-full mix-blend-multiply opacity-90 absolute -left-2"></div>
                <div className="w-3.5 h-3.5 bg-yellow-500 rounded-full mix-blend-multiply opacity-90"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
