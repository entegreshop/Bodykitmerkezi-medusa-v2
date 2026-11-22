import { HttpTypes } from "@medusajs/types"
import { extractVehicleCompatibility } from "@modules/products/components/product-actions/vehicle-compatibility"
import type { ReviewItem } from "./index"

function hashString(input: string, salt = 0): number {
  let h = (2166136261 ^ salt) >>> 0
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h >>> 0
}

const FIRST_NAMES: string[] = [
  "Ahmet", "Mustafa", "Burak", "Gökhan", "Serkan", "Oğuzhan", "Kaan", "Tolgahan",
  "Yasin", "Hakan", "Onur", "Alperen", "Uğur", "Fatih", "Sinan", "Volkan",
  "Furkan", "Kerem", "Mertcan", "İbrahim", "Levent", "Selim", "Ercan", "Tarık",
  "Cihan", "Batuhan", "Ömer", "Yusuf", "Enes", "Semih", "Cem", "Barış",
  "Erhan", "Koray", "Tuncay", "İlker", "Zafer", "Orhan", "Murat", "Kadir",
  "Ramazan", "Salih", "Ferhat", "Samet", "Mesut", "Cengiz", "Tamer", "Ayhan",
  "Bilal", "Metin", "Yunus", "Erdem", "Caner", "Berkay", "Atakan", "Taha",
  "Doğan", "Tayfun", "Okan", "Eren", "Halil", "İsmail", "Bülent", "Serdar",
  "Selçuk", "Nihat", "Adem", "Turgay", "Ersin", "Engin", "Veysel", "Kenan",
  "Suat", "Yavuz", "Çağlar", "Buğra", "Anıl", "Kürşat", "Alper", "Harun",
  "Zeynep", "Elif", "Merve", "Büşra", "Ayşe", "Fatma", "Esra", "Gülşah",
  "Derya", "Pınar", "Sibel", "Özlem", "Gamze", "Tuğba", "Ebru", "Cansu",
  "Gizem", "Hande", "Selin", "Duygu", "Damla", "Burcu", "Yasemin", "Aslı",
  "Melis", "Şeyma", "Hilal", "Kübra", "Betül", "Neslihan", "Nihan", "Sevgi",
  "Sinem", "İrem", "Ceren", "Başak", "Didem", "Filiz", "Gonca", "Songül",
]

const SURNAME_TOKENS: string[] = [
  "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Yıldırım", "Öztürk",
  "Aydın", "Özdemir", "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara",
  "Koç", "Kurt", "Özkan", "Şimşek", "Polat", "Özcan", "Korkmaz", "Çakır",
  "Erdoğan", "Yavuz", "Can", "Acar", "Şen", "Aktaş", "Güler", "Yalçın",
  "Güneş", "Bozkurt", "Bulut", "Keskin", "Ünal", "Turan", "Gül", "Avcı",
  "Işık", "Kaplan", "Tekin", "Köse", "Yüksel", "Ateş", "Aksoy", "Coşkun",
  "Sarı", "Taş", "Uçar", "Bilir", "Duman", "Eren", "Ergin", "Gezer",
  "Mutlu", "Orhan", "Özer", "Sağlam", "Sönmez", "Taşkın", "Tunç", "Uysal",
  "Varol", "Yaman", "Zengin", "Akın", "Alkan", "Başaran", "Bayrak", "Biçer",
  "Ceylan", "Demirci", "Dinç", "Duran", "Ekinci", "Erdem", "Gündüz", "Karaca",
  "Karataş", "Kocaman", "Mercan", "Oğuz", "Özel", "Sezer", "Toprak", "Tosun",
]

function buildUniqueCustomerName(globalIndex: number): string {
  const firstIdx = globalIndex % FIRST_NAMES.length
  const surIdx = Math.floor(globalIndex / FIRST_NAMES.length) % SURNAME_TOKENS.length
  const formatMode = Math.floor(globalIndex / (FIRST_NAMES.length * 3)) % 3
  const firstName = FIRST_NAMES[firstIdx]
  const surname = SURNAME_TOKENS[(surIdx + firstIdx * 7) % SURNAME_TOKENS.length]

  if (formatMode === 0) {
    return `${firstName} ${surname.charAt(0)}.`
  }
  if (formatMode === 1) {
    return `${firstName} ${surname.slice(0, 2)}***`
  }
  return `${firstName} ${surname}`
}

function detectPartLabel(title: string): {
  partName: string
  installPlace: string
  featureWord: string
} {
  const t = (title || "").toLowerCase()
  if (t.includes("marşpiyel") || t.includes("marspiyel")) {
    return {
      partName: "marşpiyel takımı",
      installPlace: "yan marşpiyel hattına",
      featureWord: "yan profil duruşu",
    }
  }
  if (t.includes("spoiler") || t.includes("spoyler")) {
    return {
      partName: "spoiler",
      installPlace: "bagaj üstü / tavan hattına",
      featureWord: "arka sportif görünümü",
    }
  }
  if (t.includes("difüzör") || t.includes("difuzor") || t.includes("arka ek") || t.includes("arka tampon eki")) {
    return {
      partName: "arka difüzör / ek",
      installPlace: "arka tampon alt kısmına",
      featureWord: "arka tampon ve egzoz çıkışı duruşu",
    }
  }
  if (t.includes("body kit") || t.includes("bodykit") || t.includes("seti")) {
    return {
      partName: "body kit seti",
      installPlace: "ön, yan ve arka tampon hatlarına",
      featureWord: "komple kasa uyumu",
    }
  }
  if (t.includes("bagaj havuzu")) {
    return {
      partName: "bagaj havuzu",
      installPlace: "bagaj zemini girintilerine",
      featureWord: "kenar bariyeri ve kokusuz malzeme yapısı",
    }
  }
  if (t.includes("panjur") || t.includes("böbrek") || t.includes("bobrek")) {
    return {
      partName: "ön panjur",
      installPlace: "ön tampon panjur tırnaklarına",
      featureWord: "ön yüz agresif duruşu",
    }
  }
  if (t.includes("ayna")) {
    return {
      partName: "ayna kapağı",
      installPlace: "dikiz aynası yuvasına",
      featureWord: "tırnak ve yüzey kalitesi",
    }
  }
  if (t.includes("ön ek") || t.includes("on ek") || t.includes("lip") || t.includes("ön tampon")) {
    return {
      partName: "ön ek (lip)",
      installPlace: "ön tampon alt kavislerine",
      featureWord: "ön tampon hizası ve yere yakın duruşu",
    }
  }
  return {
    partName: "parça",
    installPlace: "aracın orijinal bağlantı noktalarına",
    featureWord: "kalıp ve malzeme kalitesi",
  }
}

function formatReadableVehicle(brandAndModel: string, startYear: number, endYear: number, indexVariant: number): string {
  const cleanBrand = (brandAndModel || "Aracım")
    .split(/\s+/)
    .map((w) => {
      if (w.length <= 3 && /^(BMW|VW|MG|MG4|BYD|F30|F10|G20|E90|E46|W204|W205|MK\d|B\d|FC5|FB7|FD6|FE1|i20|i30)$/i.test(w)) {
        return w.toUpperCase()
      }
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    })
    .join(" ")

  const pickedYear =
    startYear > 1990 && endYear >= startYear
      ? startYear + (indexVariant % Math.max(1, endYear - startYear + 1))
      : 2018

  const mode = indexVariant % 4
  if (mode === 0) return `${pickedYear} model ${cleanBrand}`
  if (mode === 1) return `${cleanBrand} (${pickedYear})`
  if (mode === 2) return `${cleanBrand} aracım`
  return `${pickedYear} ${cleanBrand} kasası`
}

const POSITIVE_OPENERS: string[] = [
  "Sipariş vermeden önce kalıp konusunda tereddütüm vardı ama",
  "Sanayideki kaporta ustamla birlikte montajını yaptık;",
  "Hafta sonu kendi garajımda montajını gerçekleştirdim,",
  "Daha önce başka yerden aldığım yan sanayi parçada boşluk kalmıştı fakat",
  "WhatsApp üzerinden şasi ve model yılını teyit ettikten sonra sipariş geçtim,",
  "Boyacı ustam bile yüzeyinin pürüzsüzlüğünü görünce şaşırdı,",
  "Uzun süredir bu kasa için düzgün kalıplı ürün arıyordum,",
  "Arkadaşımın tavsiyesi üzerine BodyKit Merkezi'nden sipariş verdim;",
  "Paket içerisinden çıkan ürünün malzeme et kalınlığı beklentimin çok üzerinde,",
  "Astar ve boya işlemini kendi ustama yaptırdım,",
  "Kutusunu açar açmaz esnek ABS malzemenin kalitesi hemen belli oluyor,",
  "Aracın orijinal hatlarını bozmadan sportif bir görünüm isteyenler için birebir;",
  "Montaj esnasında ekstra kesme veya taşlama yapmamıza hiç gerek kalmadı,",
  "Hem fiyat olarak piyasaya göre makul hem de kalıp işçiliği çok temiz;",
  "Tampon köşelerindeki dönüş kavisleri milimi milimine denk geldi,",
  "Ürünün esnekliği sayesinde kaldırım sürtmelerinde hemen kırılacak bir yapısı yok,",
  "Siyah silikon ve akıllı vida ile sabitledik, sanki fabrikasyon üzerinde gelmiş gibi durdu;",
  "Özellikle uç kısımların çamurluk ağzıyla birleştiği nokta sıfıra sıfır oturdu,",
  "Kalıptan çapaklı çıkar diye korkmuştum ancak kenar tesviyesi gayet düzgün geldi,",
  "Aracın havasını tek parçayla bu kadar değiştireceğini tahmin etmiyordum;",
]

const POSITIVE_CLOSERS: string[] = [
  "aracın duruşu resmen bir üst segmente çıktı, elinize sağlık.",
  "gören herkes orijinal fabrika çıkışlı sanıyor.",
  "kalın balonlu naylonla sarıldığı için en ufak çizik bile olmadan ulaştı.",
  "bu kasaya sahip olanlara gözüm kapalı öneririm.",
  "montaj sonrası boşluk veya sarkma kesinlikle yapmadı.",
  "malzeme esnek olduğu için kasislerde esneyip formunu koruyor.",
  "fiyatını sonuna kadar hak eden bir işçilik var.",
  "satıcı ekibin iletişimi ve paketleme özeni gerçekten takdire şayan.",
  "aracın ön ve yan çizgileriyle bütünlüğü harika sağladı.",
  "boya tutuşu ve astar uyumu da ustamın dediğine göre çok başarılı.",
  "bu fiyata bu kalitede kalıp bulmak gerçekten zor, teşekkürler.",
  "tereddüt etmeden sipariş verebilirsiniz, kalıp birebir uyumlu.",
  "hem sağlamlık hem estetik açıdan beklentimi fazlasıyla karşıladı.",
  "diğer parçaları da önümüzdeki ay buradan tamamlamayı düşünüyorum.",
  "paketleme o kadar sağlamdı ki açmak için 10 dakika uğraştık.",
  "araca kattığı agresif görüntü tam istediğim kıvamda oldu.",
]

const FOUR_STAR_MINOR_NOTES: string[] = [
  "Kalıp ve malzeme kalitesi çok iyi, sadece montajda köşeleri tam oturtmak için ısı tabancasıyla hafif esnetmek gerekti, o yüzden 4 yıldız verdim.",
  "Ürün aracın hatlarına güzel oturdu ancak içinden montaj vidası çıkmadı, nalburdan kendim temin ettim. Parça kalitesi ise 10 numara.",
  "Parçanın duruşu ve esnekliği gayet başarılı, yalnız boya öncesi hafif bir zımpara ve astar yoklaması gerekiyor, genel olarak memnunum.",
  "Araca uyumu beklediğimden iyi çıktı, sadece kargo paketi köşeden hafif ezilmişti ama ürün esnek plastik olduğu için zarar görmemiş.",
  "Montajı iki kişi yapınca çok daha rahat hizalanıyor, tek başıma biraz uğraştırdı ama sonuç harika oldu.",
  "Malzeme kalitesi sağlam, sadece yoğunluktan dolayı siparişten 2 gün sonra kargoya verildi, ürünün kendisinde hiçbir kusur yok.",
]

const CARGO_DELAY_TEMPLATES: Array<(veh: string, partName: string, installPlace: string) => string> = [
  (veh, partName, installPlace) =>
    `${veh} için aldığım ${partName} ${installPlace} sorunsuz oturdu, malzeme kalitesinde sıkıntı yok fakat kargo firması bulunduğum ilçeye teslimatı 3 gün geciktirdi. Kargo kaynaklı geç teslimat yüzünden puan kırdım.`,
  (veh, partName) =>
    `Ürünün kalıbı ${veh} ile birebir uyumlu, satıcı zamanında çıkardı ancak kargo şubesi paketi 2 gün aktarmada beklettiği için randevu aldığım kaporta ustasına geç kaldım. Kargo sürecinden dolayı 3 yıldız.`,
  (veh, partName, installPlace) =>
    `${partName} kalitesi ve ${veh} ${installPlace} uyumu gayet başarılı ama anlaşmalı kargo firması dağıtıma çıkardığı halde o gün teslim etmeyip ertesi güne bıraktı. Geç teslimat nedeniyle 4 yıldız veriyorum.`,
  (veh, partName) =>
    `Parça sağlam ve paketlemesi özenliydi, ${veh} üzerinde duruşunu beğendim. Yalnız kargo kaynaklı ciddi gecikme yaşadım, 5. günde şubeden kendim gidip teslim almak zorunda kaldım.`,
  (veh, partName, installPlace) =>
    `Satıcıya lafım yok, ${veh} için gelen ${partName} ${installPlace} tam oturdu ancak kargo firması paketi yanlış aktarma merkezine gönderdiği için 4 gün gecikmeli elime ulaştı. Kargo firması yüzünden 3 yıldız.`,
  (veh, partName) =>
    `${veh} için sipariş ettiğim ${partName} malzeme olarak esnek ve kaliteli. Fakat kargo kuryesi adreste bulamadık diyerek şubeye geri götürmüş, teslimat 3 gün uzadı. Ürün güzel ama kargo süreci yordu.`,
  (veh, partName, installPlace) =>
    `Ürün ${veh} ${installPlace} güzel uyum sağladı, çapak veya eğrilik yok. Ancak kargo firması büyük desi olduğu gerekçesiyle teslimatı geciktirdi, geç geldiği için 1 puan kırıyorum.`,
  (veh, partName) =>
    `${partName} beklediğim gibi kaliteli çıktı, ${veh} aracımın havasını değiştirdi ama kargo takip numarası girildikten sonra kargo firması 3 iş günü boyunca paketi bekletti. Geç teslimat dışında ürün 5 yıldızlık.`,
  (veh, partName, installPlace) =>
    `${veh} kasasına uyumu ve plastik kalitesi yerinde, ${installPlace} montajını yaptık. Kargo kaynaklı gecikme olmasaydı 5 yıldız verecektim, kargo firması hafta sonu araya girince 4 gün geç getirdi.`,
  (veh, partName) =>
    `Parçanın kendisi ve paketleme kalitesi çok iyi, ${veh} için tam kalıp. Ama kargo firması dağıtım bölgesinde gecikme yaşattı ve söz verilen tarihten 2 gün sonra teslim etti, kargodan dolayı 4 yıldız.`,
  (veh, partName, installPlace) =>
    `${veh} ${partName} ürününü beğendim, ${installPlace} boşluksuz oturdu. Ne yazık ki kargo firması şubede bekletip geç teslim ettiği için boyacı sıram yandı, sırf kargo gecikmesi yüzünden 3 yıldız veriyorum.`,
  (veh, partName) =>
    `Ürün kalitesi fiyatına göre gayet iyi, ${veh} üzerinde çok şık durdu. Yalnızca kargo firmasının geç teslim etmesi can sıktı, 4 günde zor ulaştı.`,
]

function buildReviewDate(seed: number, reviewIdx: number): string {
  // Spread dates realistically between 2 days ago and 140 days ago (ordered newest to oldest)
  const baseDaysAgo = 2 + reviewIdx * (7 + (seed % 9)) + (seed % 6)
  const d = new Date(2026, 10, 20) // Nov 20, 2026 reference
  d.setDate(d.getDate() - baseDaysAgo)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

export function getDeterministicProductReviewCount(productKey: string): number {
  const h = hashString(productKey, 0x9e3779b9)
  const bucket = h % 100
  // 80% of products have 1 or 2 reviews (42% -> 1 review, 38% -> 2 reviews)
  if (bucket < 42) return 1
  if (bucket < 80) return 2
  // 20% of products have > 3 reviews (4, 5, 6, 7, 8, or 10 reviews)
  const highCounts = [4, 5, 5, 6, 6, 7, 8, 10]
  return highCounts[(h >>> 8) % highCounts.length]
}

function isRedCoverTemplateUrl(url?: string | null): boolean {
  if (!url) return true
  if (
    url.includes("KIT-VW_1J0807217H/panel/") ||
    url.includes("KIT-VW_0062102/panel/") ||
    url.includes("KIT-VW_1062101/panel/") ||
    url.includes("KIT-VW_0082101/panel/")
  ) {
    return true
  }
  const fname = (url.split("/").pop() || "").split("?")[0].toLowerCase()
  if (
    fname.includes("1web") ||
    fname === "web.jpg" ||
    fname === "1-web.jpg" ||
    fname.includes("kapak")
  ) {
    return true
  }
  if (fname.startsWith("gg-") || fname.startsWith("gg_")) {
    if (/^gg[-_][a-z0-9]+-\d+\./.test(fname)) return false
    if (url.includes("revision=178199")) return false
    return true
  }
  return false
}

function normalizeCleanImageUrl(url?: string | null): string {
  if (!url) return ""
  if (
    url.includes("media.kitgaraj.com") &&
    (url.includes("/plus/") || url.includes("/temiz/") || url.includes("-showroom."))
  ) {
    return `/api/clean-image?url=${encodeURIComponent(url)}`
  }
  return url
}

export function generateUniqueProductReviews(product: HttpTypes.StoreProduct): ReviewItem[] {
  const productKey = String(product.id || product.handle || product.title || "default_product")
  const baseSeed = hashString(productKey, 0x85ebca6b)
  const count = getDeterministicProductReviewCount(productKey)

  const compat = extractVehicleCompatibility(
    product.title || "",
    product.description,
    product.metadata as Record<string, any>
  )
  const partInfo = detectPartLabel(product.title || "")

  // Collect distinct valid product images so we NEVER show the same image twice in reviews
  const distinctImageUrls: string[] = []
  const rawImgs = [
    ...(product.images?.map((i) => i?.url) || []),
    product.thumbnail,
  ].filter((u): u is string => Boolean(u) && !isRedCoverTemplateUrl(u))

  for (const rawUrl of rawImgs) {
    const cleanUrl = normalizeCleanImageUrl(rawUrl)
    if (cleanUrl && !distinctImageUrls.includes(cleanUrl)) {
      distinctImageUrls.push(cleanUrl)
    }
  }

  const surfaceBadge = compat.isPrePaintedPianoBlack
    ? "PARLAK SİYAH"
    : compat.isTrunkMat
    ? "ARACA ÖZEL KALIP"
    : "STANDART"

  const reviews: ReviewItem[] = []

  for (let idx = 0; idx < count; idx++) {
    const revSeed = hashString(`${productKey}::rev::${idx}`, baseSeed + idx * 7919)

    // Unique customer name index using coprime arithmetic
    const nameGlobalIdx = ((baseSeed % 9973) * 131 + idx * 1009 + (revSeed % 127)) >>> 0
    const customerName = buildUniqueCustomerName(nameGlobalIdx)

    const vehicleLabel = formatReadableVehicle(
      compat.brandAndModel,
      compat.startYear,
      compat.endYear,
      (baseSeed + idx * 3) >>> 0
    )

    // Decide rating & review type:
    // Ensure a realistic mix of 5-star, 4-star, and 3-4 star cargo-delay reviews
    let rating = 5
    let isCargoDelayReview = false
    let isMinorFourStarReview = false

    if (count === 1) {
      const rMod = revSeed % 10
      if (rMod === 0) {
        rating = 3
        isCargoDelayReview = true
      } else if (rMod === 1 || rMod === 2) {
        rating = 4
        isCargoDelayReview = rMod === 1
        isMinorFourStarReview = rMod === 2
      } else {
        rating = 5
      }
    } else if (count === 2) {
      if (idx === 0) {
        rating = 5
      } else {
        const rMod = revSeed % 10
        if (rMod < 3) {
          rating = 3
          isCargoDelayReview = true
        } else if (rMod < 6) {
          rating = 4
          isCargoDelayReview = rMod === 3
          isMinorFourStarReview = rMod >= 4
        } else {
          rating = 5
        }
      }
    } else {
      // Products with 4..10 reviews: always include at least 1 cargo-delay review (3 or 4 stars) and 1 four-star review
      if (idx === 1) {
        isCargoDelayReview = true
        rating = revSeed % 2 === 0 ? 3 : 4
      } else if (idx === 3) {
        isMinorFourStarReview = true
        rating = 4
      } else if (idx === 6 && count >= 7) {
        isCargoDelayReview = true
        rating = 3
      } else {
        rating = revSeed % 5 === 0 ? 4 : 5
        if (rating === 4) isMinorFourStarReview = true
      }
    }

    let commentText = ""
    if (isCargoDelayReview) {
      const tplIdx = ((baseSeed >>> 3) + idx * 7) % CARGO_DELAY_TEMPLATES.length
      commentText = CARGO_DELAY_TEMPLATES[tplIdx](
        vehicleLabel,
        partInfo.partName,
        partInfo.installPlace
      )
      // Ensure even cargo templates never collide verbatim across products by appending a product-specific detail
      const cargoDayNote =
        (revSeed % 3) === 0
          ? ` (${compat.startYear}-${compat.endYear} kasa için uyumu tam).`
          : (revSeed % 3) === 1
          ? ` Parçanın ${partInfo.featureWord} ise gayet güzel.`
          : ` Yine de mağaza iletişimi ilgiliydi.`
      commentText += cargoDayNote
    } else if (isMinorFourStarReview) {
      const noteIdx = ((baseSeed >>> 4) + idx * 11) % FOUR_STAR_MINOR_NOTES.length
      commentText = `${vehicleLabel} için aldığım ${partInfo.partName} ${partInfo.installPlace} uyumlu geldi. ${FOUR_STAR_MINOR_NOTES[noteIdx]}`
    } else {
      const openerIdx = ((baseSeed % POSITIVE_OPENERS.length) + idx * 7) % POSITIVE_OPENERS.length
      const closerIdx =
        ((Math.floor(baseSeed / POSITIVE_OPENERS.length) % POSITIVE_CLOSERS.length) + idx * 11) %
        POSITIVE_CLOSERS.length

      const middleVariants = [
        `${vehicleLabel} için sipariş ettiğim ${partInfo.partName} ${partInfo.installPlace} birebir oturdu,`,
        `${vehicleLabel} kasasına ${partInfo.partName} montajını sorunsuz tamamladık; özellikle ${partInfo.featureWord} çok iyi oldu,`,
        `gelen ${partInfo.partName} ${vehicleLabel} üzerinde tam beklediğim gibi durdu ve ${partInfo.installPlace} hiç boşluk bırakmadı,`,
        `${vehicleLabel} için ${partInfo.partName} arayan varsa düşünmeden alabilir, ${partInfo.featureWord} gerçekten fark yaratıyor ve`,
        `${partInfo.partName} parçası ${vehicleLabel} ${partInfo.installPlace} kavisleriyle tam uyuştu,`,
      ]
      const midIdx = ((baseSeed >>> 5) + idx * 3) % middleVariants.length
      commentText = `${POSITIVE_OPENERS[openerIdx]} ${middleVariants[midIdx]} ${POSITIVE_CLOSERS[closerIdx]}`
    }

    // Attach media ONLY to the first 1 (or at most 2 if product has >=2 distinct images) review so the same photo NEVER repeats across cards
    let mediaUrl = ""
    if (idx === 0 && distinctImageUrls.length >= 1 && !isCargoDelayReview) {
      mediaUrl = distinctImageUrls[0]
    } else if (idx === 1 && distinctImageUrls.length >= 2 && !isCargoDelayReview) {
      mediaUrl = distinctImageUrls[1]
    }

    reviews.push({
      id: `rev_gen_${productKey}_${idx}`,
      product_id: product.id,
      product_title: product.title || "",
      customer_name: customerName,
      color: idx % 2 === 0 ? surfaceBadge : "STANDART",
      rating,
      comment: commentText,
      media_url: mediaUrl,
      media_type: "image",
      verified_purchase: true,
      helpful_count: 1 + ((revSeed >>> 4) % 14),
      created_at: buildReviewDate(baseSeed, idx),
    })
  }

  return reviews
}

export function getProductReviewSummary(product: HttpTypes.StoreProduct): {
  count: number
  averageRating: string
} {
  const list = generateUniqueProductReviews(product)
  const count = list.length
  const avg =
    count > 0
      ? (list.reduce((acc, r) => acc + Number(r.rating || 5), 0) / count).toFixed(1)
      : "5.0"
  return { count, averageRating: avg }
}
