import { useState, useEffect } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CheckCircle } from "@medusajs/icons"

interface SMSConfig {
  active: boolean
  usercode: string
  password: string
  msgheader: string
  admin_phone: string
  sms_service: string
}

const initialConfig: SMSConfig = {
  active: false,
  usercode: "",
  password: "",
  msgheader: "",
  admin_phone: "",
  sms_service: "netgsm"
}

const SmsSettingsPage = () => {
  const [config, setConfig] = useState<SMSConfig>(initialConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error">("success")
  const [showPassword, setShowPassword] = useState(false)

  // Test SMS fields
  const [testPhone, setTestPhone] = useState("")
  const [testMessage, setTestMessage] = useState("Netgsm SMS entegrasyonu başarıyla test edildi!")
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/admin/sms-settings")
        const data = await res.json()
        if (data && data.config) {
          setConfig(data.config)
        }
      } catch (err) {
        console.error("Failed to load SMS configuration:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg)
    setToastType(type)
    setTimeout(() => setToastMessage(""), 4000)
  }

  const handleSave = async (updatedConfig = config) => {
    setSaving(true)
    try {
      const res = await fetch("/admin/sms-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedConfig),
      })
      const data = await res.json()
      if (data && data.success) {
        showToast("SMS Ayarları başarıyla kaydedildi! ✔", "success")
        setConfig(data.config)
      } else {
        showToast("Ayarlar kaydedilirken hata oluştu.", "error")
      }
    } catch (err) {
      console.error("Error saving config:", err)
      showToast("Bağlantı hatası oluştu.", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleTestSms = async () => {
    if (!testPhone) {
      showToast("Lütfen test için geçerli bir telefon numarası girin.", "error")
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch("/admin/sms-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test: true,
          test_phone: testPhone,
          test_message: testMessage,
          usercode: config.usercode,
          password: config.password,
          msgheader: config.msgheader
        }),
      })
      const data = await res.json()
      if (data && data.success) {
        setTestResult({ success: true, message: "SMS başarıyla gönderildi!" })
        showToast("Test SMS'i başarıyla gönderildi!", "success")
      } else {
        const errMsg = data.error || "Bilinmeyen Netgsm hatası."
        setTestResult({ success: false, message: `Hata: ${errMsg} (Kod: ${data.code || 'Yok'})` })
        showToast("Test SMS'i gönderilemedi.", "error")
      }
    } catch (err: any) {
      console.error("Error during test SMS send:", err)
      setTestResult({ success: false, message: `Bağlantı hatası: ${err.message}` })
      showToast("Bağlantı hatası oluştu.", "error")
    } finally {
      setTesting(false)
    }
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
    <div className="bg-zinc-50 min-h-screen text-zinc-900 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl shadow-lg border transition-all ${
          toastType === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          {toastType === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          ) : (
            <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-5xl mx-auto p-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-8">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Netgsm SMS Entegrasyonu
            </h1>
            <p className="text-xs text-zinc-500 mt-1 font-medium">
              Sipariş alımı, kargolama ve iptal işlemlerinde müşterilerinize ve yöneticilerinize otomatik SMS bildirimleri gönderin.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white shadow-md shadow-violet-100 hover:shadow-violet-200 transition-all disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Middle: Configuration Form */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Netgsm API Credentials Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-5">
              <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                API Yetkilendirme Bilgileri
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Kullanıcı Kodu / Üye No</label>
                  <input 
                    type="text"
                    placeholder="örn. 8508401067"
                    value={config.usercode}
                    onChange={(e) => setConfig({ ...config, usercode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-900 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">API Şifresi</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Netgsm API Şifreniz"
                      value={config.password}
                      onChange={(e) => setConfig({ ...config, password: e.target.value })}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-900 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Onaylı SMS Başlığı (Alfasayısal Header)</label>
                <input 
                  type="text"
                  placeholder="örn. ENTEGRESHOP"
                  value={config.msgheader}
                  onChange={(e) => setConfig({ ...config, msgheader: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-900 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-50"
                />
                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Netgsm panelinizde onaylanmış, SMS gönderimlerinde gönderen olarak görünecek başlık.</p>
              </div>
            </div>

            {/* Notifications Configuration Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-5">
              <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Bildirim Ayarları & Alıcılar
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Yönetici Telefon Numarası</label>
                <input 
                  type="text"
                  placeholder="örn. 05323370081"
                  value={config.admin_phone}
                  onChange={(e) => setConfig({ ...config, admin_phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-900 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-50"
                />
                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Yeni sipariş geldiğinde yöneticilere SMS uyarısı gönderilecek telefon numarası.</p>
              </div>

              <div className="bg-zinc-50/60 border border-zinc-150 rounded-xl p-4 flex flex-col gap-3">
                <h4 className="text-xs font-bold text-zinc-800">Gönderilen Şablonlar:</h4>
                <ul className="text-xs font-medium text-zinc-500 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span><strong>Yeni Sipariş (Müşteri):</strong> Sayın [Müşteri], #[SiparişNo] nolu siparişiniz başarıyla alınmıştır...</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span><strong>Yeni Sipariş (Yönetici):</strong> Yeni Sipariş! Sipariş No: #[SiparişNo], Tutar: [Tutar]...</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span><strong>Kargoya Verildi (Müşteri):</strong> Sayın [Müşteri], #[SiparişNo] nolu siparişiniz kargoya verilmiştir. [KargoBilgisi]...</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span><strong>Sipariş İptali (Müşteri):</strong> Sayın [Müşteri], #[SiparişNo] nolu siparişiniz iptal edilmiştir.</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>

          {/* Right Column: Toggle Status and Interactive Tester */}
          <div className="flex flex-col gap-6">
            
            {/* Active Status Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold text-zinc-900">Durum</h3>
              <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed">
                Netgsm SMS bildirim sistemini tamamen açıp kapatabilirsiniz.
              </p>
              
              <div className="flex items-center justify-between border-t border-zinc-100 pt-4 mt-1">
                <span className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">SMS Servisi</span>
                <button
                  type="button"
                  onClick={() => {
                    const newActive = !config.active
                    setConfig({ ...config, active: newActive })
                    handleSave({ ...config, active: newActive })
                  }}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    config.active ? "bg-violet-600" : "bg-zinc-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      config.active ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="text-center mt-2">
                <span className={`inline-flex items-center gap-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                  config.active 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                    : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${config.active ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
                  {config.active ? "Otomatik SMS Aktif" : "Sistem Pasif durumda"}
                </span>
              </div>
            </div>

            {/* SMS Tester Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Entegrasyon Test Konsolu
              </h3>
              <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed">
                Kaydetmeden veya kaydettikten sonra Netgsm API'nizi test etmek için telefon numarası girip test mesajı gönderin.
              </p>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Test Telefon No</label>
                <input 
                  type="text"
                  placeholder="örn. 5323370081"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-900 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Test Mesajı</label>
                <textarea 
                  rows={3}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-800 resize-none bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <button
                type="button"
                onClick={handleTestSms}
                disabled={testing || !testPhone}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {testing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Gönderiliyor...</span>
                  </>
                ) : (
                  <span>Test SMS Gönder</span>
                )}
              </button>

              {testResult && (
                <div className={`mt-2 p-3.5 rounded-xl border text-xs font-bold flex flex-col gap-1.5 ${
                  testResult.success 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}>
                  <div className="flex items-center gap-1.5">
                    {testResult.success ? (
                      <span className="text-emerald-600 font-bold">✓</span>
                    ) : (
                      <span className="text-rose-600 font-bold">✕</span>
                    )}
                    <span>{testResult.success ? "Gönderim Başarılı!" : "Gönderim Başarısız!"}</span>
                  </div>
                  <div className="text-[10px] font-semibold text-zinc-500 font-mono break-all leading-normal">
                    {testResult.message}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "SMS Ayarları",
  icon: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
})

export default SmsSettingsPage
