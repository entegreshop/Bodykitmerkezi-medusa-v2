import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, Input, Label, toast } from "@medusajs/ui"
import { useState, useEffect, useRef } from "react"

// Ensure we have access to the medusa backend API
const API_URL = process.env.MEDUSA_ADMIN_BACKEND_URL || ""

const FileUploadField = ({
  label,
  value,
  onChange,
  onRemove,
  defaultImage
}: {
  label: string
  value: string | null
  onChange: (file: File) => void
  onRemove: () => void
  defaultImage?: boolean
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  
  return (
    <div className="flex flex-col gap-2 mb-6">
      <Label>{label}</Label>
      <div className="border border-ui-border-base rounded-lg p-4 bg-ui-bg-subtle relative group">
        {value ? (
          <div className="relative">
            {defaultImage && (
              <div className="bg-ui-bg-base border border-ui-border-base rounded-md p-1 mb-2">
                <Text size="xsmall" className="text-ui-fg-subtle">Görseli olmayan içerikler için varsayılan görsel.</Text>
              </div>
            )}
            <img src={value} alt={label} className="max-h-32 object-contain rounded-md" />
            <div className="mt-2 flex gap-2">
              <Button size="small" variant="secondary" onClick={() => inputRef.current?.click()}>
                Değiştir
              </Button>
              <Button size="small" variant="danger" onClick={onRemove}>
                Kaldır
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-ui-border-base rounded-md cursor-pointer hover:bg-ui-bg-base" onClick={() => inputRef.current?.click()}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ui-fg-subtle mb-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <Text size="small" className="text-ui-fg-subtle">Görsel Yükle (PNG, JPG)</Text>
          </div>
        )}
        <input 
          type="file" 
          ref={inputRef}
          className="hidden" 
          accept="image/png, image/jpeg, image/jpg, image/webp" 
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onChange(e.target.files[0])
            }
          }}
        />
      </div>
    </div>
  )
}

export default function StoreSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<any>({
    logo: null,
    favicon: null,
    mobileLogo: null,
    footerLogo: null,
    emailLogo: null,
    defaultImage: null,
    checkoutLogo: null,
    sideMenuLogo: null,
    siteTitle: "",
    footerCopyrightText: "",
    contactCompany: "",
    contactAddress: "",
    contactPhone: "",
    contactEmail: "",
    contactHours: "",
  })

  useEffect(() => {
    fetch(`${API_URL}/admin/logo-config`)
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setConfig({
            logo: null,
            favicon: null,
            mobileLogo: null,
            footerLogo: null,
            emailLogo: null,
            defaultImage: null,
            checkoutLogo: null,
            sideMenuLogo: null,
            siteTitle: "",
            footerCopyrightText: "",
            contactCompany: "",
            contactAddress: "",
            contactPhone: "",
            contactEmail: "",
            contactHours: "",
            ...data.config
          })
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching store config", err)
        setLoading(false)
        toast.error("Ayarlar yüklenemedi")
      })
  }, [])

  const handleFileUpload = async (file: File, key: string) => {
    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = async () => {
        const base64 = reader.result as string
        
        const response = await fetch(`${API_URL}/admin/logo-config/upload`, {
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
        
        const result = await response.json()
        if (result.success) {
          setConfig((prev: any) => ({ ...prev, [key]: result.url }))
          toast.success("Görsel başarıyla yüklendi")
        } else {
          toast.error(result.message || "Görsel yüklenirken bir hata oluştu")
        }
      }
    } catch (e) {
      toast.error("Dosya okunurken hata oluştu")
    }
  }

  const removeFile = (key: string) => {
    setConfig((prev: any) => ({ ...prev, [key]: null }))
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/admin/logo-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      if (res.ok) {
        toast.success("Ayarlar başarıyla kaydedildi")
      } else {
        toast.error("Ayarlar kaydedilirken bir hata oluştu")
      }
    } catch (e) {
      toast.error("Sunucuya bağlanılamadı")
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="p-8">Yükleniyor...</div>
  }

  return (
    <Container className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Heading level="h1">Mağaza Ayarları</Heading>
          <Text className="text-ui-fg-subtle mt-2">Mağazanızın tüm görsel kimliğini ve temel ayarlarını (logo, favicon, site başlığı, footer telif hakkı vb.) buradan yönetebilirsiniz.</Text>
        </div>
        <Button variant="primary" onClick={saveConfig} isLoading={saving}>
          Kaydet
        </Button>
      </div>

      <Heading level="h2" className="mb-4">Görsel Ayarları</Heading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mb-8 border-b border-ui-border-base pb-8">
        <div>
          <FileUploadField 
            label="Logo (Ana Sayfa)" 
            value={config.logo} 
            onChange={(f) => handleFileUpload(f, 'logo')} 
            onRemove={() => removeFile('logo')} 
          />
          <FileUploadField 
            label="Mobil Logo" 
            value={config.mobileLogo} 
            onChange={(f) => handleFileUpload(f, 'mobileLogo')} 
            onRemove={() => removeFile('mobileLogo')} 
          />
          <FileUploadField 
            label="Menü Logosu (Açılır Yan Menü)" 
            value={config.sideMenuLogo} 
            onChange={(f) => handleFileUpload(f, 'sideMenuLogo')} 
            onRemove={() => removeFile('sideMenuLogo')} 
          />
          <FileUploadField 
            label="Footer Logo" 
            value={config.footerLogo} 
            onChange={(f) => handleFileUpload(f, 'footerLogo')} 
            onRemove={() => removeFile('footerLogo')} 
          />
        </div>
        <div>
          <FileUploadField 
            label="Favicon" 
            value={config.favicon} 
            onChange={(f) => handleFileUpload(f, 'favicon')} 
            onRemove={() => removeFile('favicon')} 
          />
          <FileUploadField 
            label="E-Posta Logosu" 
            value={config.emailLogo} 
            onChange={(f) => handleFileUpload(f, 'emailLogo')} 
            onRemove={() => removeFile('emailLogo')} 
          />
          <FileUploadField 
            label="Ödeme Detayı Logosu (Checkout)" 
            value={config.checkoutLogo} 
            onChange={(f) => handleFileUpload(f, 'checkoutLogo')} 
            onRemove={() => removeFile('checkoutLogo')} 
          />
          <FileUploadField 
            label="Varsayılan Görsel" 
            value={config.defaultImage} 
            onChange={(f) => handleFileUpload(f, 'defaultImage')} 
            onRemove={() => removeFile('defaultImage')}
            defaultImage={true} 
          />
        </div>
      </div>

      <Heading level="h2" className="mb-4">Metin Ayarları</Heading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="flex flex-col gap-2">
          <Label>Site Başlığı (Tarayıcı Sekmesi)</Label>
          <Input 
            placeholder="Örn: XOOX Medusa Storefront" 
            value={config.siteTitle} 
            onChange={(e) => setConfig({ ...config, siteTitle: e.target.value })} 
          />
          <Text size="xsmall" className="text-ui-fg-subtle">
            Tarayıcı sekmesinde, favicon'un hemen yanında görünen site başlığı.
          </Text>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Footer Telif Yazısı (Copyright)</Label>
          <Input 
            placeholder="Örn: © 2026 Kombingo.com Tüm Hakları Saklıdır" 
            value={config.footerCopyrightText} 
            onChange={(e) => setConfig({ ...config, footerCopyrightText: e.target.value })} 
          />
          <Text size="xsmall" className="text-ui-fg-subtle">
            Sayfanın en altındaki bilgi metni. (Güvenlik sertifikası metni sabittir, buraya sadece telif kısmını girebilirsiniz.)
          </Text>
        </div>
      </div>

      <Heading level="h2" className="mb-4 mt-8">İletişim Bilgileri (Bize Ulaşın)</Heading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="flex flex-col gap-2">
          <Label>Firma Adı</Label>
          <Input 
            placeholder="Örn: ÖZSE MODA TEKSTİL LTD. ŞTİ." 
            value={config.contactCompany || ""} 
            onChange={(e) => setConfig({ ...config, contactCompany: e.target.value })} 
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>E-Posta Adresi</Label>
          <Input 
            placeholder="Örn: E-posta: info@kombingo.com" 
            value={config.contactEmail || ""} 
            onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })} 
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Telefon Numarası</Label>
          <Input 
            placeholder="Örn: Tel: +90 530 456 43 77" 
            value={config.contactPhone || ""} 
            onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })} 
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Çalışma Saatleri</Label>
          <Input 
            placeholder="Örn: Hafta içi 09.00 - 19.00..." 
            value={config.contactHours || ""} 
            onChange={(e) => setConfig({ ...config, contactHours: e.target.value })} 
          />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label>Adres</Label>
          <Input 
            placeholder="Örn: Adres: Merkez Mahallesi..." 
            value={config.contactAddress || ""} 
            onChange={(e) => setConfig({ ...config, contactAddress: e.target.value })} 
          />
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Mağaza Ayarları",
  icon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
})
