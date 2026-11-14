import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"
import os from "os"

const configFilePath = path.join(process.cwd(), "uploads", "pages-config.json")

const defaultPages = {
  "hakkimizda": {
    title: "Hakkımızda",
    content: "BodyKit Merkezi olarak Türkiye'nin en kapsamlı oto body kit, tampon, spoiler, difüzör ve modifiye aksesuarları mağazasıyız."
  },
  "mesafeli-satis": {
    title: "Mesafeli Satış Sözleşmesi",
    content: "İşbu sözleşme 13.06.2003 tarih ve 25137 sayılı Resmi Gazetede yayımlanan Mesafeli Sözleşmeler Uygulama Usul ve Esasları Hakkında Yönetmelik gereği internet üzerinden gerçekleştiren satışlar için sözleşme yapılması zorunluluğuna istinaden düzenlenmiş olup, maddeler halinde aşağıda belirtilmiştir."
  },
  "iade-ve-degisim": {
    title: "İptal, İade ve Değişim Koşulları",
    content: "Almış olduğunuz ürünleri kullanılmamış ve etiketleri sökülmemiş olması şartıyla 14 gün içerisinde iade edebilir veya değiştirebilirsiniz."
  },
  "kvkk": {
    title: "KVKK",
    content: "Kişisel Verilerin Korunması Kanunu uyarınca verileriniz güvenle işlenmektedir. Verileriniz üçüncü kişilerle paylaşılmamaktadır."
  },
  "teslimat-kargo": {
    title: "Teslimat ve Kargo Şartları",
    content: "Saat 15:00'a kadar verilen tüm siparişleriniz aynı gün kargoya teslim edilmektedir. Teslimat süresi ortalama 1-3 iş günüdür."
  },
  "kullanici-sozlesmesi": {
    title: "Kullanıcı Sözleşmesi",
    content: "Web sitemizi kullanarak aşağıdaki kullanım şartlarını kabul etmiş sayılırsınız."
  },
  "gizlilik-sozlesmesi": {
    title: "Gizlilik Sözleşmesi",
    content: "Müşterilerimizin gizliliğine önem veriyoruz ve kişisel verilerinizi yetkisiz erişime karşı koruyoruz."
  },
  "iletisim": {
    title: "İletişim",
    content: "BODYKİT MERKEZİ\nAdres: İkitelli OSB Oto Sanayi Sitesi Başakşehir / İstanbul\nTel: 0532 337 00 81\nE-posta: info@bodykitmerkezi.com"
  },
  "siparis-takip": {
    title: "Sipariş Takip",
    content: "Siparişinizi hesabım sayfasından veya kargo takip numaranızı kullanarak kargo firması sitesinden takip edebilirsiniz."
  },
  "havale-bildirimleri": {
    title: "Havale Bildirimleri",
    content: "Havale/EFT ile yaptığınız ödemeleriniz için dekontunuzu WhatsApp hattımızdan bize iletebilirsiniz."
  }
}

function readConfig() {
  try {
    if (fs.existsSync(configFilePath)) {
      const content = fs.readFileSync(configFilePath, "utf-8")
      return JSON.parse(content)
    }
  } catch (err) {
    console.error("Error reading pages config:", err)
  }
  return defaultPages
}

function writeConfig(data: any) {
  try {
    const dir = path.dirname(configFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(configFilePath, JSON.stringify(data, null, 2), "utf-8")
    return true
  } catch (err) {
    console.error("Error writing pages config:", err)
    return false
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pages = readConfig()
  res.json({ pages })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as any
  
  if (!body.pages) {
    return res.status(400).json({ success: false, message: "Missing pages data" })
  }

  const success = writeConfig(body.pages)
  if (success) {
    res.json({ success: true, pages: body.pages })
  } else {
    res.status(500).json({ success: false, message: "Could not write configuration" })
  }
}
