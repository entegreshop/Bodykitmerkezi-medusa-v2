import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

const configFilePath = path.join(process.cwd(), "uploads", "pages-config.json")

export const defaultPages = {
  "hakkimizda": {
    title: "Hakkımızda",
    content: `BodyKit Merkezi olarak, otomotiv tutkunlarına yüksek kaliteli oto dış modifiye ve aksesuar çözümleri sunmak amacıyla yola çıktık. Türkiye'nin dört bir yanındaki araç sahiplerine ve oto servislerine OEM standartlarında body kit, tampon, difüzör, ön ek (lip), yan marşpiyel, bagaj çıtası, spoiler, panjur ve egzoz aksesuarları tedarik etmekteyiz.

Ürün yelpazemiz; birinci sınıf esnek ve dayanıklı ABS plastik ile fiber/karbon kompozit malzemelerden üretilmiş olup araç modeline %100 birebir uyum sağlayacak şekilde tasarlanmıştır.

Müşteri memnuniyeti, şeffaf fiyatlandırma, güvenli paketleme ve hızlı teslimat ilkelerimiz doğrultusunda, aracınıza estetik ve sportif bir görünüm kazandırırken her adımda uzman ekibimizle teknik destek sunuyoruz.

İletişim & Şirket Bilgileri:
Unvan: ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SANAYİ TİCARET LİMİTED ŞİRKETİ (Ticari Marka: BodyKit Merkezi)
Adres: Merkez Mah. Muallim Naci Sk. Merve No: 9 Güngören / İstanbul 34160
Telefon: +90 532 337 00 81
E-posta: info@bodykitmerkezi.com`
  },
  "mesafeli-satis": {
    title: "Mesafeli Satış Sözleşmesi",
    content: `MADDE 1 - TARAFLAR

1.1. SATICI:
Unvan: ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SANAYİ TİCARET LİMİTED ŞİRKETİ (Ticari Marka: BodyKit Merkezi)
Adres: Merkez Mah. Muallim Naci Sk. Merve No: 9 Güngören / İstanbul 34160
Telefon: +90 532 337 00 81
E-posta: info@bodykitmerkezi.com
Web Sitesi: https://bodykitmerkezi.com

1.2. ALICI:
bodykitmerkezi.com web sitesi üzerinden elektronik ortamda sipariş veren ve sipariş formunda belirtilen gerçek veya tüzel kişi ("Tüketici / Alıcı").

MADDE 2 - SÖZLEŞMENİN KONUSU
İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait https://bodykitmerkezi.com web sitesinden elektronik ortamda siparişini yaptığı, sitede nitelikleri ve satış fiyatı belirtilen ürünlerin satışı, ödemesi ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.

MADDE 3 - SÖZLEŞME KONUSU ÜRÜN VE FİYAT BİLGİLERİ
3.1. Ürünlerin türü, miktarı, marka/modeli, rengi, vergiler dahil satış bedeli ve kargo ücreti, web sitesinde ürün sayfasında ve sipariş onay ekranında açıkça belirtilmiştir.
3.2. Fiyatlarımız tüm vergiler (KDV) dahil olup web sitesinde ilan edilen fiyatlar satış anında geçerli olan kesin fiyatlardır. Gizli, sonradan talep edilen ek bir ücret bulunmamaktadır.

MADDE 4 - GENEL HÜKÜMLER VE TESLİMAT
4.1. ALICI, sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.
4.2. Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu ile her bir ürün için ALICI'nın yerleşim yerinin uzaklığına bağlı olarak ALICI veya gösterdiği adresteki kişi/kuruluşa anlaşmalı kargo firması aracılığıyla teslim edilir. Ortalama kargo teslim süresi 1-3 iş günüdür.
4.3. Kargo teslimatı sırasında ürün ambalajında ezilme, yırtılma veya hasar tespit edilmesi durumunda kargo görevlisine derhal "Hasar Tespit Tutanağı" tutturulmalı ve ürün teslim alınmamalıdır.

MADDE 5 - CAYMA HAKKI
5.1. ALICI, sözleşme konusu ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa tesliminden itibaren 14 (ondört) gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.
5.2. Cayma hakkının kullanılması için bu süre içinde SATICI'ya info@bodykitmerkezi.com e-posta adresine veya +90 532 337 00 81 numaralı müşteri hizmetleri hattına yazılı bildirimde bulunulması ve ürünün kullanılmamış, montajı denenmemiş, yapıştırıcı sürülmemiş veya boyanmamış olması şarttır.
5.3. Cayma hakkı kapsamında iade edilecek ürünün kutusu, ambalajı, varsa aksesuarları ve faturası ile birlikte eksiksiz olarak SATICI'nın yukarıda belirtilen fiziki adresine geri gönderilmesi gerekmektedir.
5.4. SATICI, cayma bildiriminin kendisine ulaşmasından itibaren en geç 14 gün içinde, ürünün iade şartlarına uygunluğunun teyit edilmesiyle tahsil edilen tüm ödemeleri ALICI'ya aynı ödeme kanalı üzerinden (kredi kartına / banka hesabına) defaten iade eder.

MADDE 6 - CAYMA HAKKI KULLANILAMAYACAK HALLER
Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda özel olarak hazırlanan, üzerinde delme, kesme, boyama veya araca özel modifikasyon işlemi yapılmış ürünler ile koruyucu bandı sökülmüş, montajı yapılmış veya hasar görmüş ürünlerde cayma hakkı kullanılamaz.

MADDE 7 - YETKİLİ MAHKEME
İşbu sözleşmenin uygulanmasında, Sanayi ve Teknoloji Bakanlığı'nca ilan edilen değere kadar Tüketici Hakem Heyetleri ile ALICI'nın veya SATICI'nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.`
  },
  "iade-ve-degisim": {
    title: "İptal, İade ve Değişim Koşulları",
    content: `BodyKit Merkezi olarak müşteri memnuniyetini en üst düzeyde tutmayı ilke ediniyoruz. Google Merchant Center, tüketici hakları mevzuatı ve e-ticaret standartları uyarınca uygulanan iade, iptal ve değişim politikamız aşağıda detaylandırılmıştır.

1. İADE VE CAYMA HAKKI SÜRESİ
Siparişinizi teslim aldığınız tarihten itibaren 14 gün içerisinde herhangi bir gerekçe göstermeksizin ürün iadesi veya değişim talebinde bulunabilirsiniz.

2. İADE ŞARTLARI
- İade edilecek ürünün tekrar satılabilirliği bozulmamış olmalıdır.
- Ürün üzerinde montaj denemesi yapılmamış, delik açılmamış, yapıştırıcı/silikon sürülmemiş ve boyanmamış olmalıdır.
- Ürün orijinal kutusu, koruyucu ambalajı ve tüm montaj parçaları ile birlikte eksiksiz gönderilmelidir.
- Fatura veya sevk irsaliyesi iade paketi ile birlikte gönderilmelidir.

3. KARGO VE İADE MASRAFLARI
- Kusurlu / Hasarlı / Yanlış Gönderilen Ürünler: Üründe üretim hatası bulunması, kargoda hasar görmesi veya sipariş ettiğinizden farklı bir ürünün ulaşması durumunda iade kargo ücreti tamamen BodyKit Merkezi tarafından karşılanır.
- Cayma Hakkı / Müşteri Tercihli İadeler: Üründe herhangi bir kusur olmaksızın vazgeçme veya model değişikliği durumlarında anlaşmalı kargo firmamızla gönderim ücreti alıcıya aittir.

4. HASARLI KARGO PROSEDÜRÜ
Kargo paketini teslim alırken lütfen kurye eşliğinde dış ambalajı ve ürünü kontrol ediniz. Herhangi bir çatlak, kırık veya ezilme tespit ederseniz kargo görevlisine "Kargo Hasar Tespit Tutanağı" tutturunuz ve paketi teslim almayınız. Tutanaklı hasarlı ürünler için derhal ücretsiz değişim veya %100 para iadesi sağlanır.

5. PARA İADESİ SÜRECİ VE ÖDEME
- İade ettiğiniz ürün depomuza ulaştıktan sonra teknik ekibimiz tarafından incelenir ve onaylanır.
- Onaylanan iadelerin bedeli 3 ila 7 iş günü içerisinde ödemeyi gerçekleştirdiğiniz kredi kartına, banka kartına veya banka hesabınıza kesintisiz olarak aktarılır.
- Bankanızın süreçlerine bağlı olarak tutarın ekstrenize yansıması birkaç iş günü sürebilir.

6. SİPARİŞ İPTALİ
Kargoya henüz teslim edilmemiş olan siparişlerinizi aynı gün içinde +90 532 337 00 81 numaralı müşteri hattımızı arayarak veya info@bodykitmerkezi.com adresine yazarak anında ve ücretsiz iptal edebilirsiniz. Tutar aynı gün içinde kartınıza iade edilir.

7. İADE ADRESİ VE İLETİŞİM
İade Alıcı Adı: BodyKit Merkezi Depo & İade Birimi
Adres: Merkez Mah. Muallim Naci Sk. Merve No: 9 Güngören / İstanbul 34160
Telefon: +90 532 337 00 81
E-posta: info@bodykitmerkezi.com`
  },
  "teslimat-kargo": {
    title: "Teslimat ve Kargo Şartları",
    content: `BodyKit Merkezi üzerinden verilen tüm siparişler, otomotiv yedek parça ve gövde aksesuarlarına özel koruyucu ambalajlarla paketlenerek güvenle sevk edilir.

1. SİPARİŞ HAZIRLIK VE GÖNDERİM SÜRESİ
- Hafta içi saat 15:00'e kadar onaylanan siparişler aynı gün veya en geç 1-2 iş günü içerisinde kargo firmasına teslim edilir.
- Hafta sonu ve resmi tatil günlerinde verilen siparişler, takip eden ilk iş gününde işleme alınır.

2. ANLAŞMALI KARGO VE LOJİSTİK FİRMALARI
- Standart Paketler (Ön ek, spoiler, difüzör, ayna kapağı vb.): Yurtiçi Kargo, MNG Kargo ve Aras Kargo güvencesiyle adrese teslim sevk edilir.
- Büyük ve Hacimli Paketler (Tampon, marşpiyel, komple bodykit setleri): Kırılmayı önleyen korumalı sandık veya mukavemetli ambalaj ile anlaşmalı ambar kargo lojistik firmalarıyla sigortalı olarak taşınır.

3. KARGO ÜCRET POLİTİKASI
- 3.000 TL ve üzeri tüm alışverişlerinizde kargo Türkiye geneli ÜCRETSİZDİR.
- 3.000 TL altındaki siparişlerde kargo ücreti sipariş oluşturma ve sepet aşamasında şeffaf bir şekilde gösterilir. Kapıda veya teslimatta sonradan sürpriz bir ek masraf talep edilmez.

4. TESLİMAT SÜRESİ
- Kargo firmasına teslim edilen paketlerin teslimat süresi, teslimat ilinin İstanbul'a olan mesafesine bağlı olarak 1 ila 3 iş günüdür (Mobil alanlarda kargo dağıtım günleri farklılık gösterebilir).

5. KARGO TAKİBİ
Siparişiniz sevk edildiğinde tarafınıza SMS ve e-posta ile kargo takip barkod numarası gönderilir. Ayrıca sitemiz üzerindeki "Sipariş Takip" sayfasından kargonuzun nerede olduğunu anlık olarak takip edebilirsiniz.

6. TESLİMATTA DİKKAT EDİLMESİ GEREKENLER
Kargo teslimatı sırasında paketi kuryenin yanında açarak ürünün sağlamlığını kontrol ediniz. Eğer üründe herhangi bir kırık veya çatlak varsa tutanak tutturarak ürünü teslim almayınız ve bize bilgi veriniz.`
  },
  "kvkk": {
    title: "KVKK Aydınlatma Metni",
    content: `6698 SAYILI KİŞİSEL VERİLERİN KORUNMASI KANUNU (KVKK) KAPSAMINDA AYDINLATMA METNİ

BodyKit Merkezi Oto Modifiye & Aksesuar ("BodyKit Merkezi") olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, veri sorumlusu sıfatıyla, kişisel verilerinizin güvenliğine ve gizliliğine azami hassasiyet göstermekteyiz.

1. KİŞİSEL VERİLERİN İŞLENME AMACI
Toplanan kişisel verileriniz (Ad, soyad, telefon numarası, e-posta adresi, teslimat ve fatura adresi, T.C. kimlik numarası / vergi numarası, sipariş geçmişi ve IP adresi);
- bodykitmerkezi.com üzerinden satın alınan ürün ve hizmetlerin sunulması,
- Siparişlerin hazırlanması, faturalandırılması ve anlaşmalı kargo firmaları ile adresinize teslim edilmesi,
- Satış sonrası destek, garanti, iade ve değişim süreçlerinin yürütülmesi,
- Yasal mevzuattan kaynaklanan yükümlülüklerin (Türk Ticaret Kanunu, Vergi Usul Kanunu, Tüketici Mevzuatı) yerine getirilmesi
amaçlarıyla KVKK'nın 5. ve 6. maddelerine uygun olarak işlenmektedir.

2. KİŞİSEL VERİLERİN AKTARILMASI
Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda ve KVKK'nın 8. ve 9. maddelerine uygun olarak:
- Siparişinizin size ulaştırılması için anlaşmalı kargo ve lojistik şirketlerine,
- Güvenli online ödeme işlemlerinin tamamlanabilmesi için BDDK lisanslı ödeme altyapısı sağlayıcılarına (PayTR),
- Yasal yükümlülüklerimizin ifası için yetkili kamu kurum ve kuruluşları ile adli makamlara
aktarılabilmektedir. Kişisel verileriniz hiçbir surette üçüncü şahıslara ticari amaçla satılmaz veya devredilmez.

3. KİŞİSEL VERİ TOPLAMANIN YÖNTEMİ VE HUKUKİ SEBEBİ
Kişisel verileriniz, bodykitmerkezi.com web sitemiz, mobil arayüzlerimiz, iletişim formları, çağrı hattımız ve elektronik ortamlar aracılığıyla toplanmaktadır. Bu veriler sözleşmenin kurulması ve ifası, hukuki yükümlülüğün yerine getirilmesi ve meşru menfaatler hukuki sebeplerine dayalı olarak toplanır.

4. VERİ SAHİBİNİN HAKLARI (KVKK MADDE 11)
KVKK'nın 11. maddesi uyarınca veri sahipleri;
- Kişisel verilerinin işlenip işlenmediğini öğrenme,
- Kişisel verileri işlenmişse buna ilişkin bilgi talep etme,
- Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,
- Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,
- Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,
- KVKK ve ilgili diğer kanun hükümlerine uygun olarak işlenmiş olmasına rağmen, işlenmesini gerektiren sebeplerin ortadan kalkması hâlinde kişisel verilerin silinmesini veya yok edilmesini isteme
haklarına sahiptir.

Başvuru ve İletişim:
Haklarınızı kullanmak için info@bodykitmerkezi.com e-posta adresimize yazılı olarak başvurabilirsiniz.`
  },
  "gizlilik-sozlesmesi": {
    title: "Gizlilik ve Güvenlik Sözleşmesi",
    content: `GİZLİLİK VE GÜVENLİK POLİTİKASI

BodyKit Merkezi (bodykitmerkezi.com), kullanıcılarının ve müşterilerinin güvenliğini en üst seviyede tutmayı taahhüt eder. Bu metin, sitemizi ziyaret ettiğinizde ve alışveriş yaptığınızda bilgilerinizin nasıl korunduğunu açıklar.

1. KREDİ KARTI VE ÖDEME GÜVENLİĞİ
- Sitemiz üzerinden yapılan tüm kredi kartı ve banka kartı ödemeleri 256-Bit SSL (Secure Sockets Layer) güvenlik sertifikası ile şifrelenerek doğrudan banka altyapısına iletilir.
- Kredi kartı numaranız, son kullanma tarihiniz ve CVV güvenlik kodunuz kesinlikle BodyKit Merkezi sunucularında veya veri tabanında saklanmaz ve kaydedilmez.
- Tüm kartlı işlemler, bankaların zorunlu kıldığı 3D Secure (SMS şifre doğrulama) koruması altında gerçekleştirilir.

2. KİŞİSEL BİLGİ GÜVENLİĞİ
- Üyelik ve sipariş sırasında ilettiğiniz ad-soyad, telefon, e-posta ve teslimat adresi gibi bilgiler sadece siparişinizin eksiksiz teslim edilmesi ve müşteri desteği sağlanması amacıyla kullanılır.
- Bilgileriniz yasal mevzuat sınırları dışında kesinlikle üçüncü şahıslar, reklam ağları veya ticari kuruluşlarla paylaşılmaz.

3. ÇEREZ (COOKIE) KULLANIMI
- bodykitmerkezi.com'da kullanıcı deneyimini iyileştirmek, sepetinizdeki ürünleri hatırlamak ve oturum güvenliğini sağlamak amacıyla teknik ve analitik çerezler kullanılmaktadır.
- Dilediğiniz zaman internet tarayıcınızın ayarlarından çerezleri engelleyebilir veya silebilirsiniz.

4. E-BÜLTEN VE İLETİŞİM İZİNLERİ
- Onayınız olmadan ticari elektronik ileti (SMS veya kampanya e-postası) gönderilmez. Onay vermiş olsanız dahi dilediğiniz an tek tıkla bülten üyeliğinden çıkabilirsiniz.

Veri Sorumlusu İletişim:
BodyKit Merkezi Oto Modifiye & Aksesuar
Adres: Merkez Mah. Muallim Naci Sk. Merve No: 9 Güngören / İstanbul 34160
E-posta: info@bodykitmerkezi.com
Tel: +90 532 337 00 81`
  },
  "kullanici-sozlesmesi": {
    title: "Kullanıcı Sözleşmesi",
    content: `KULLANICI SÖZLEŞMESİ VE KULLANIM KOŞULLARI

1. TARAFLAR VE KABUL
Bu web sitesini (bodykitmerkezi.com) ziyaret eden veya alışveriş yapan tüm kullanıcılar işbu Kullanıcı Sözleşmesi'nde yer alan şartları okumuş, anlamış ve kabul etmiş sayılır.

2. HİZMETİN KAPSAMI
BodyKit Merkezi, otomotiv gövde aksesuarları, body kit parçaları, tampon, spoiler, difüzör ve ilgili modifiye ürünlerinin online satış ve tedarik hizmetini sunar.

3. KULLANICI YÜKÜMLÜLÜKLERİ
- Kullanıcı, site üzerinde gerçekleştirdiği tüm işlemlerde yürürlükteki Türkiye Cumhuriyeti yasalarına, ahlak kurallarına ve dürüstlük ilkelerine uygun hareket edeceğini kabul eder.
- Sipariş verirken beyan edilen ad, soyad, telefon, teslimat adresi ve fatura bilgilerinin doğruluğundan kullanıcı sorumludur. Yanlış veya eksik bilgiden doğan teslimat gecikmelerinden BodyKit Merkezi sorumlu tutulamaz.
- Kullanıcı, satın aldığı parçaların montajını yetkili oto montaj veya kaporta servislerinde yaptırmakla yükümlüdür. Hatalı montajdan kaynaklanan ürün veya araç hasarları kullanıcının sorumluluğundadır.

4. FİKRİ MÜLKİYET HAKLARI
bodykitmerkezi.com sitesinde yer alan tasarım, metin, görsel, logo ve yazılımların tüm hakları BodyKit Merkezi'ne aittir. İzinsiz kopyalanamaz, çoğaltılamaz veya başka bir platformda ticari amaçla kullanılamaz.

5. SÖZLEŞME DEĞİŞİKLİKLERİ
BodyKit Merkezi, dilediği zaman işbu sözleşme şartlarını güncelleme hakkını saklı tutar. Güncellenen şartlar sitede yayınlandığı andan itibaren yürürlüğe girer.`
  },
  "iletisim": {
    title: "İletişim",
    content: `BODYKİT MERKEZİ (ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SANAYİ TİCARET LİMİTED ŞİRKETİ)

Bizimle iletişime geçmekten çekinmeyiniz. Uzman ekibimiz araç uyumluluğu, montaj detayları, sipariş takibi ve teknik sorularınız için hizmetinizdedir.

Fiziki Mağaza & Depo Adresi:
Merkez Mah. Muallim Naci Sk. Merve No: 9 Güngören / İstanbul 34160

Telefon & WhatsApp Hattı:
+90 532 337 00 81

E-Posta:
info@bodykitmerkezi.com

Çalışma Saatleri:
Pazartesi - Cuma: 09:00 - 19:00
Cumartesi: 09:00 - 18:00
Pazar: Kapalı

Müşteri Hizmetleri Yanıt Süresi:
Mesai saatleri içerisinde iletilen e-posta ve mesajlara en geç 2 saat içinde dönüş yapılmaktadır.`
  },
  "siparis-takip": {
    title: "Sipariş Takip",
    content: `SİPARİŞİNİZİ KOLAYCA TAKİP EDİN

Siparişinizin durumunu öğrenmek için aşağıdaki yöntemleri kullanabilirsiniz:

1. Kargo Takip Numarası ile:
Siparişiniz kargoya verildiğinde cep telefonunuza gönderilen SMS ve e-posta bildirimindeki kargo takip bağlantısına tıklayarak ilgili kargo firmasının (Yurtiçi Kargo, MNG Kargo, Aras Kargo) web sitesinden anlık sorgulama yapabilirsiniz.

2. Müşteri Destek Hattı ile:
Sipariş numaranız ile birlikte +90 532 337 00 81 numaralı WhatsApp destek hattımıza mesaj atarak veya info@bodykitmerkezi.com adresine e-posta göndererek müşteri temsilcimizden bilgi alabilirsiniz.`
  },
  "havale-bildirimleri": {
    title: "Havale ve EFT Bildirimleri",
    content: `HAVALE / EFT İLE ÖDEME VE ONAY SÜRECİ

Havale veya EFT yöntemiyle verdiğiniz siparişlerin hızlıca onaylanıp kargoya hazırlanabilmesi için:

1. Sipariş tutarını, sipariş sonunda belirtilen resmi banka hesap numaramıza (IBAN) transfer ediniz.
2. Transfer açıklaması (açıklama) kısmına mutlaka SIPARIS NUMARANIZI veya ADINIZI SOYADINIZI yazınız.
3. Ödeme dekontunuzu +90 532 337 00 81 numaralı WhatsApp hattımıza iletebilir veya info@bodykitmerkezi.com adresine gönderebilirsiniz.

Ödemeniz muhasebe birimimizce kontrol edildikten sonra sipariş durumunuz derhal "Onaylandı" aşamasına alınır ve ürününüz kargo için paketlenir.`
  }
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return new Response("", { headers: corsHeaders })
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

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pages = readConfig()
  res.status(200).json({ pages })
}
