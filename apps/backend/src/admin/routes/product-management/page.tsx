import { useState, useEffect } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Tag, Plus, Trash, ArrowPath, CheckCircle, ChevronLeft, Pencil } from "@medusajs/icons"

interface ProductImage {
  url: string
  filename?: string
  type?: "image" | "video"
  color?: string
}

const isVideoUrl = (url: string) => {
  if (!url) return false
  return /\.(mp4|webm|mov|ogg|avi)($|\?)/i.test(url) || url.includes("/video")
}

interface SelectedVariant {
  id?: string
  color: string
  size: string
  price: string
  discountedPrice: string
  costPrice: string
  sku: string
  barcode: string
  stock: string
  image: string
}

const INITIAL_COLORS = ["SİYAH", "KAHVE", "KREM", "LACİVERT", "BEYAZ", "PEMBE", "YEŞİL"]
const INITIAL_SIZES = ["S", "M", "L", "XL", "XXL"]

const IkasProductsPage = () => {
  // --- Navigation & Mode ---
  const [view, setView] = useState<"list" | "create" | "edit">("list")
  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  // --- API Data States ---
  const [products, setProducts] = useState<any[]>([])
  const [priceLists, setPriceLists] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  // --- Search & Filters ---
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // --- Bulk Actions ---
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkModalStep, setBulkModalStep] = useState<1 | 2>(1)
  const [bulkActionType, setBulkActionType] = useState("")
  const [bulkActionCategory, setBulkActionCategory] = useState("")
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)

  // --- Form States (IKAS Fields) ---
  const [productName, setProductName] = useState("")
  const [productType, setProductType] = useState("physical")
  const [generalPrice, setGeneralPrice] = useState("")
  const [generalDiscountedPrice, setGeneralDiscountedPrice] = useState("")
  const [generalCostPrice, setGeneralCostPrice] = useState("")
  
  const [images, setImages] = useState<ProductImage[]>([])
  const [brand, setBrand] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")
  const [seoKeywords, setSeoKeywords] = useState("")
  const [canonicalUrl, setCanonicalUrl] = useState("")
  const [seoUrl, setSeoUrl] = useState("")
  const [tags, setTags] = useState("")

  // --- Variant Options ---
  const [isVariantProduct, setIsVariantProduct] = useState(true)
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [variantsTable, setVariantsTable] = useState<SelectedVariant[]>([])
  const [checkedIndices, setCheckedIndices] = useState<number[]>([])

  const [availableColors, setAvailableColors] = useState<string[]>(INITIAL_COLORS)
  const [availableSizes, setAvailableSizes] = useState<string[]>(INITIAL_SIZES)
  const [newColor, setNewColor] = useState("")
  const [newSize, setNewSize] = useState("")

  const handleAddColor = () => {
    const val = newColor.trim().toLocaleUpperCase("tr-TR")
    if (!val) return
    if (availableColors.includes(val)) return alert("Bu renk zaten mevcut.")
    setAvailableColors(prev => [...prev, val])
    setSelectedColors(prev => [...prev, val])
    setNewColor("")
  }

  const handleAddSize = () => {
    const val = newSize.trim().toLocaleUpperCase("tr-TR")
    if (!val) return
    if (availableSizes.includes(val)) return alert("Bu beden zaten mevcut.")
    setAvailableSizes(prev => [...prev, val])
    setSelectedSizes(prev => [...prev, val])
    setNewSize("")
  }

  const handleRemoveColor = (color: string) => {
    setAvailableColors(prev => prev.filter(c => c !== color))
    setSelectedColors(prev => prev.filter(c => c !== color))
  }

  const handleRemoveSize = (size: string) => {
    setAvailableSizes(prev => prev.filter(s => s !== size))
    setSelectedSizes(prev => prev.filter(s => s !== size))
  }

  // --- Drawer / Image Picker State for Variants ---
  const [activeVariantIndexForImage, setActiveVariantIndexForImage] = useState<number | null>(null)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return
    const updated = [...images]
    const [removed] = updated.splice(draggedIndex, 1)
    updated.splice(index, 0, removed)
    setImages(updated)
    setDraggedIndex(null)
  }

  // --- Fetch Initial Data ---
  const fetchData = async () => {
    setLoading(true)
    try {
      const [productsRes, priceListsRes, categoriesRes, collectionsRes, inventoryItemsRes] = await Promise.all([
        fetch("/admin/products?limit=3000&order=-created_at&fields=id,title,description,thumbnail,images,collection_id,categories.id,categories.name,options.id,options.title,options.values.id,options.values.value,variants.id,variants.title,variants.sku,variants.barcode,variants.manage_inventory,variants.prices.amount,variants.prices.currency_code,variants.metadata,variants.inventory_items.inventory_item_id,variants.options.id,variants.options.value,variants.options.option_id").then(res => res.json()).catch(() => ({ products: [] })),
        fetch("/admin/price-lists?fields=id,title,type,status,prices.id,prices.amount,prices.currency_code,prices.price_set.variant.id").then(res => res.json()).catch(() => ({ price_lists: [] })),
        fetch("/admin/product-categories").then(res => res.json()).catch(() => ({ product_categories: [] })),
        fetch("/admin/collections").then(res => res.json()).catch(() => ({ collections: [] })),
        fetch("/admin/inventory-items?limit=3000").then(res => res.json()).catch(() => ({ inventory_items: [] }))
      ])

      const inventoryItemsMap = new Map<string, number>()
      if (inventoryItemsRes && inventoryItemsRes.inventory_items) {
        for (const item of inventoryItemsRes.inventory_items) {
          const totalStock = item.location_levels?.reduce((sum: number, lvl: any) => sum + (lvl.stocked_quantity || 0), 0) || 0
          inventoryItemsMap.set(item.id, totalStock)
        }
      }

      const productsWithStock = (productsRes.products || []).map((prod: any) => {
        if (prod.variants) {
          prod.variants = prod.variants.map((v: any) => {
            const inventoryItemId = v.inventory_items?.[0]?.inventory_item_id
            const stock = inventoryItemId ? (inventoryItemsMap.get(inventoryItemId) ?? 100) : 100
            return {
              ...v,
              inventory_quantity: stock
            }
          })
        }
        return prod
      })

      setProducts(productsWithStock)
      setPriceLists(priceListsRes.price_lists || [])
      setCategories(categoriesRes.product_categories || [])
      setCollections(collectionsRes.collections || [])
    } catch (err) {
      console.error("Error loading IKAS panel data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const linkId = "plus-jakarta-sans-font";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap";
      document.head.appendChild(link);
    }
    fetchData()
  }, [])

  // --- Helper to Slugify Handle ---
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
  }

  // --- Auto-generate Variants Table based on Color and Size selections ---
  useEffect(() => {
    if (!isVariantProduct) return

    // If options are selected, generate combinations
    const newVariants: SelectedVariant[] = []
    const colorsToUse = selectedColors.length > 0 ? selectedColors : ["Standart"]
    const sizesToUse = selectedSizes.length > 0 ? selectedSizes : ["Standart"]

    colorsToUse.forEach(color => {
      sizesToUse.forEach(size => {
        // Try to preserve existing variant data (like custom prices, sku, stock) if options match
        const label = `${color} / ${size}`
        const existing = variantsTable.find(v => v.color === color && v.size === size)

        newVariants.push({
          color,
          size,
          price: existing?.price || generalPrice || "",
          discountedPrice: existing?.discountedPrice || generalDiscountedPrice || "",
          costPrice: existing?.costPrice || generalCostPrice || "",
          sku: existing?.sku || `${slugify(productName)}-${color}-${size}`.toUpperCase(),
          barcode: existing?.barcode || "",
          stock: existing?.stock || "100",
          image: existing?.image || ""
        })
      })
    })

    setVariantsTable(newVariants)
    setCheckedIndices([])
  }, [selectedColors, selectedSizes, generalPrice, generalDiscountedPrice, generalCostPrice, productName, isVariantProduct])

  // --- Image Upload Handler ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const reader = new FileReader()
      
      const uploadPromise = new Promise<void>((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64 = reader.result as string
            const res = await fetch("/admin/hero-config/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                filename: file.name,
                filetype: file.type,
                base64
              })
            })
            const data = await res.json()
            if (data && data.success) {
              const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|ogg|avi)$/i.test(file.name)
              const activeColor = activeVariantIndexForImage !== null ? variantsTable[activeVariantIndexForImage]?.color : undefined
              
              setImages(prev => [...prev, { 
                url: data.url, 
                filename: data.filename || file.name, 
                type: isVideo ? "video" : "image",
                color: activeColor
              }])

              // Auto-assign to the active and checked variants if uploaded from drawer
              if (activeVariantIndexForImage !== null) {
                setVariantsTable(prevTable => {
                  const updated = [...prevTable]
                  const isChecked = checkedIndices.includes(activeVariantIndexForImage)
                  if (isChecked) {
                    checkedIndices.forEach(i => {
                      updated[i].image = data.url
                    })
                  } else {
                    updated[activeVariantIndexForImage].image = data.url
                  }
                  return updated
                })
              }
              resolve()
            } else {
              reject(new Error(data.message || "Yükleme başarısız"))
            }
          } catch (err) {
            reject(err)
          }
        }
        reader.onerror = () => reject(new Error("Dosya okunamadı"))
      })

      reader.readAsDataURL(file)
      try {
        await uploadPromise
      } catch (err: any) {
        alert("Görsel yüklenirken hata oluştu: " + err.message)
      }
    }
    setUploading(false)
  }

  const removeImage = (index: number) => {
    const targetImg = images[index]
    if (targetImg) {
      setVariantsTable(prev => prev.map(v => v.image === targetImg.url ? { ...v, image: "" } : v))
    }
    setImages(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleDeleteImageFromPool = (url: string) => {
    setVariantsTable(prev => prev.map(v => v.image === url ? { ...v, image: "" } : v))
    setImages(prev => prev.filter(img => img.url !== url))
  }

  // --- Find Discounted Price for a Variant in Medusa Price Lists ---
  const getSalePriceForVariant = (variantId: string) => {
    // Find active overrides in Type=sale price lists
    for (const plist of priceLists) {
      if (plist.type === "sale" && plist.prices) {
        const pMatch = plist.prices.find((p: any) => p.variant_id === variantId && p.currency_code === "try")
        if (pMatch) {
          return pMatch.amount / 100
        }
      }
    }
    return null
  }

  // --- Reset Form for Create ---
  const initCreateMode = () => {
    setProductName("")
    setProductType("physical")
    setGeneralPrice("")
    setGeneralDiscountedPrice("")
    setGeneralCostPrice("")
    setImages([])
    setBrand("")
    setCategory("")
    setDescription("")
    setTags("")
    setSelectedColors([])
    setSelectedSizes([])
    setAvailableColors(INITIAL_COLORS)
    setAvailableSizes(INITIAL_SIZES)
    setVariantsTable([])
    setCheckedIndices([])
    setIsVariantProduct(true)
    setEditingProductId(null)
    setView("create")
  }

  // --- Load Form for Edit ---
  const initEditMode = async (prod: any) => {
    setLoading(true)
    setEditingProductId(prod.id)
    setProductName(prod.title || "")
    setDescription(prod.description || "")
    setCategory(prod.categories?.[0]?.id || "")
    setBrand(prod.collection_id || "")
    
    // Detach options
    const colorOpt = prod.options?.find((o: any) => o.title.toLowerCase() === "renk")
    const sizeOpt = prod.options?.find((o: any) => o.title.toLowerCase() === "beden")

    // Set Images with variant color mapping
    const prodImages = prod.images?.map((img: any) => {
      const isVideo = isVideoUrl(img.url)
      const matchingVariant = prod.variants?.find((v: any) => v.metadata?.image === img.url)
      const colorVal = matchingVariant?.options?.find((o: any) => o.option_id === colorOpt?.id)?.value
      return {
        url: img.url,
        filename: img.url.split("/").pop() || "",
        type: isVideo ? "video" : "image" as const,
        color: colorVal
      }
    }) || []
    setImages(prodImages)
    
    const colors = colorOpt?.values?.map((v: any) => typeof v === "string" ? v : v.value) || []
    const sizes = sizeOpt?.values?.map((v: any) => typeof v === "string" ? v : v.value) || []
    setSelectedColors(colors)
    setSelectedSizes(sizes)
    setAvailableColors((prev) => {
      const merged = [...prev]
      colors.forEach(c => {
        if (!merged.includes(c)) merged.push(c)
      })
      return merged
    })
    setAvailableSizes((prev) => {
      const merged = [...prev]
      sizes.forEach(s => {
        if (!merged.includes(s)) merged.push(s)
      })
      return merged
    })

    setIsVariantProduct(prod.options?.length > 0)

    // Load variants details
    const loadedVariants: SelectedVariant[] = prod.variants?.map((v: any) => {
      const originalPrice = (v.prices?.find((p: any) => p.currency_code === "try")?.amount || 0) / 100
      const salePrice = getSalePriceForVariant(v.id) || originalPrice

      // Option values
      const cVal = v.options?.find((o: any) => o.option_id === colorOpt?.id)?.value || "Standart"
      const sVal = v.options?.find((o: any) => o.option_id === sizeOpt?.id)?.value || "Standart"

      return {
        id: v.id,
        color: cVal,
        size: sVal,
        price: originalPrice.toString(),
        discountedPrice: salePrice.toString(),
        costPrice: (v.metadata?.cost_price || 0).toString(),
        sku: v.sku || "",
        barcode: v.barcode || "",
        stock: (v.inventory_quantity || 100).toString(), // Fallback quantity
        image: v.metadata?.image || prod.thumbnail || ""
      }
    }) || []

    // Set general values from the first variant as a baseline default
    if (prod.variants?.length > 0) {
      const v = prod.variants[0]
      const op = (v.prices?.find((p: any) => p.currency_code === "try")?.amount || 0) / 100
      const sp = getSalePriceForVariant(v.id) || op
      setGeneralPrice(op.toString())
      setGeneralDiscountedPrice(sp.toString())
      setGeneralCostPrice((v.metadata?.cost_price || 0).toString())
    }

    setVariantsTable(loadedVariants)
    setCheckedIndices([])
    setView("edit")
    setLoading(false)
  }

  // --- Submit Handler (Create/Update) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productName) return alert("Lütfen ürün adını doldurun.")

    setSubmitting(true)
    try {
      let url = "/admin/products"
      let method = "POST"
      
      // Collect all variant images and uploaded images to construct product media
      const variantImages: string[] = []
      if (isVariantProduct) {
        variantsTable.forEach(v => {
          if (v.image && !variantImages.includes(v.image)) {
            variantImages.push(v.image)
          }
        })
      }
      const globalImages = images.map(img => img.url)
      const uniqueImageUrls = Array.from(new Set([...globalImages, ...variantImages]))

      // Determine Medusa V2 Payload
      const payload: any = {
        title: productName,
        description: description,
        status: "published",
        thumbnail: uniqueImageUrls[0] || "",
        images: uniqueImageUrls.map(url => ({ url })),
        collection_id: brand || undefined,
        categories: category ? [{ id: category }] : []
      }

      if (isVariantProduct) {
        payload.options = [
          { title: "Renk", values: selectedColors.length > 0 ? selectedColors : ["Standart"] },
          { title: "Beden", values: selectedSizes.length > 0 ? selectedSizes : ["Standart"] }
        ]
        payload.variants = variantsTable.map(v => ({
          title: `${v.color} / ${v.size}`,
          sku: v.sku,
          barcode: v.barcode || undefined,
          manage_inventory: true,
          options: {
            "Renk": v.color,
            "Beden": v.size
          },
          prices: [
            { currency_code: "try", amount: parseFloat(v.price) * 100 }
          ],
          metadata: {
            cost_price: parseFloat(v.costPrice) || 0,
            image: v.image || ""
          }
        }))
      } else {
        // Simple product has no options, single default variant
        payload.options = []
        payload.variants = [
          {
            title: "Standart",
            sku: `${slugify(productName)}-STD`.toUpperCase(),
            manage_inventory: true,
            prices: [
              { currency_code: "try", amount: parseFloat(generalPrice || "0") * 100 }
            ],
            metadata: {
              cost_price: parseFloat(generalCostPrice || "0") || 0
            }
          }
        ]
      }

      let savedProduct: any = null

      if (view === "edit" && editingProductId) {
        url = `/admin/products/${editingProductId}`
        method = "POST" // Medusa update is POST
        
        // 1. Update basic product fields (title, desc, categories, collection, images, etc.)
        const updateRes = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        const data = await updateRes.json()
        savedProduct = data.product

        // 2. Fetch current product options and variants to delete them
        const currentRes = await fetch(`/admin/products/${editingProductId}?fields=options.id,variants.id`)
        if (currentRes.ok) {
          const currentData = await currentRes.json()
          const currentProduct = currentData.product

          // Delete all current variants
          if (currentProduct.variants) {
            for (const v of currentProduct.variants) {
              await fetch(`/admin/products/${editingProductId}/variants/${v.id}`, { method: "DELETE" })
            }
          }

          // Delete all current options
          if (currentProduct.options) {
            for (const opt of currentProduct.options) {
              await fetch(`/admin/products/${editingProductId}/options/${opt.id}`, { method: "DELETE" })
            }
          }
        }

        // 3. Create new options
        if (isVariantProduct) {
          await fetch(`/admin/products/${editingProductId}/options`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "Renk",
              values: selectedColors.length > 0 ? selectedColors : ["Standart"]
            })
          })

          await fetch(`/admin/products/${editingProductId}/options`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "Beden",
              values: selectedSizes.length > 0 ? selectedSizes : ["Standart"]
            })
          })
        }

        // 4. Create new variants
        if (isVariantProduct) {
          for (const v of variantsTable) {
            await fetch(`/admin/products/${editingProductId}/variants`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: `${v.color} / ${v.size}`,
                sku: v.sku,
                barcode: v.barcode || undefined,
                manage_inventory: true,
                options: {
                  "Renk": v.color,
                  "Beden": v.size
                },
                prices: [
                  { currency_code: "try", amount: parseFloat(v.price) * 100 }
                ],
                metadata: {
                  cost_price: parseFloat(v.costPrice) || 0,
                  image: v.image || ""
                }
              })
            })
          }
        } else {
          // Simple product default variant
          await fetch(`/admin/products/${editingProductId}/variants`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "Standart",
              sku: `${slugify(productName)}-STD`.toUpperCase(),
              manage_inventory: true,
              prices: [
                { currency_code: "try", amount: parseFloat(generalPrice || "0") * 100 }
              ],
              metadata: {
                cost_price: parseFloat(generalCostPrice || "0") || 0
              }
            })
          })
        }

        // 5. Re-fetch product to get the newly created variants with correct Medusa V2 format and IDs
        const refreshedRes = await fetch(`/admin/products/${editingProductId}?fields=id,title,variants.id,variants.sku,variants.title,variants.options.id,variants.options.value,variants.options.option_id`)
        if (refreshedRes.ok) {
          const refreshedData = await refreshedRes.json()
          savedProduct = refreshedData.product
        }
      } else {
        const createRes = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        const data = await createRes.json()
        savedProduct = data.product
      }

      if (!savedProduct) {
        throw new Error("Ürün kaydedilemedi.")
      }

      // --- Sync Stock Levels to default stock location ---
      try {
        const slocRes = await fetch("/admin/stock-locations")
        if (slocRes.ok) {
          const slocData = await slocRes.json()
          const locationId = slocData.stock_locations?.[0]?.id

          if (locationId) {
            // Re-fetch the product to get variants with inventory item links
            const productUrl = `/admin/products/${savedProduct.id}?fields=id,title,variants.id,variants.sku,variants.barcode,variants.manage_inventory,variants.metadata,variants.inventory_items.inventory_item_id`
            const prodRes = await fetch(productUrl)
            if (prodRes.ok) {
              const prodJson = await prodRes.json()
              const refreshedVariants = prodJson.product?.variants || []

              for (const sv of refreshedVariants) {
                const sku = sv.sku
                const inventoryItemId = sv.inventory_items?.[0]?.inventory_item_id

                if (!inventoryItemId) {
                  console.warn(`No inventory item found for variant ${sv.id} (SKU: ${sku})`)
                  continue
                }

                // Match with target stock from the variantsTable or standard state
                let targetStock = 100
                if (isVariantProduct) {
                  const formV = variantsTable.find(v => v.sku === sku || `${v.color} / ${v.size}` === sv.title)
                  if (formV) {
                    targetStock = parseInt(formV.stock) || 0
                  }
                } else {
                  targetStock = parseInt(variantsTable[0]?.stock || "100") || 0
                }

                // Query existing location levels for this item
                const levelsRes = await fetch(`/admin/inventory-items/${inventoryItemId}/location-levels`)
                if (levelsRes.ok) {
                  const levelsData = await levelsRes.json()
                  const existingLevel = levelsData.inventory_levels?.find((l: any) => l.location_id === locationId)

                  if (existingLevel) {
                    // Update location level
                    await fetch(`/admin/inventory-items/${inventoryItemId}/location-levels/${locationId}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        stocked_quantity: targetStock
                      })
                    })
                  } else {
                    // Create location level association
                    await fetch(`/admin/inventory-items/${inventoryItemId}/location-levels`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        location_id: locationId,
                        stocked_quantity: targetStock
                      })
                    })
                  }
                }
              }
            }
          }
        }
      } catch (stockErr) {
        console.error("Error syncing stock levels:", stockErr)
      }

      // --- Price List overridden sync for Discounted Prices (İKAS İndirimli Fiyat) ---
      const activeSalePrices: any[] = []
      
      if (isVariantProduct) {
        variantsTable.forEach(v => {
          const matchV = savedProduct.variants?.find((sv: any) => {
            const sc = sv.options?.find((o: any) => o.value === v.color)
            const ss = sv.options?.find((o: any) => o.value === v.size)
            return sc && ss
          })
          
          if (matchV && parseFloat(v.discountedPrice) < parseFloat(v.price)) {
            activeSalePrices.push({
              variant_id: matchV.id,
              currency_code: "try",
              amount: parseFloat(v.discountedPrice) * 100
            })
          }
        })
      } else {
        const matchV = savedProduct.variants?.[0]
        if (matchV && parseFloat(generalDiscountedPrice) < parseFloat(generalPrice)) {
          activeSalePrices.push({
            variant_id: matchV.id,
            currency_code: "try",
            amount: parseFloat(generalDiscountedPrice) * 100
          })
        }
      }

      if (activeSalePrices.length > 0) {
        // Look for "Ürün İndirim Listesi" or "İKAS İndirim Listesi"
        let targetList = priceLists.find(pl => pl.title === "Ürün İndirim Listesi" || pl.title === "İKAS İndirim Listesi")
        
        if (targetList) {
          // Update list prices
          await fetch(`/admin/price-lists/${targetList.id}/prices/batch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              create: activeSalePrices
            })
          })
        } else {
          // Create list
          await fetch("/admin/price-lists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "Ürün İndirim Listesi",
              description: "Ürün Yönetimi arayüzü tarafından otomatik oluşturulmuştur.",
              type: "sale",
              status: "active",
              prices: activeSalePrices
            })
          })
        }
      }

      // Refresh list and return
      await fetchData()
      setView("list")
    } catch (err: any) {
      console.error(err)
      alert("Hata oluştu: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // --- Delete Product Handler ---
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return

    try {
      const res = await fetch(`/admin/products/${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id))
      } else {
        alert("Ürün silinemedi.")
      }
    } catch (err) {
      console.error(err)
      alert("Hata oluştu.")
    }
  }

  // --- Calculate total stock of product ---
  const getProductTotalStock = (prod: any) => {
    return prod.variants?.reduce((sum: number, v: any) => sum + (v.inventory_quantity || v.inventory_items?.[0]?.inventory_quantity || 0), 0) || 0
  }

  // --- Filtered Products list ---
  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const totalPages = Math.ceil(filteredProducts.length / pageSize)
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="bg-[#f8fafc] -m-8 p-8 min-h-screen text-slate-800 custom-admin-wrapper">
      <style>{`
        .custom-admin-wrapper {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
          text-rendering: optimizeLegibility !important;
        }
        
        .custom-admin-wrapper * {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        }

        @keyframes slideOver {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideOver {
          animation: slideOver 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      {/* -------------------- 1. LIST VIEW -------------------- */}
      {view === "list" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Ürünler</h1>
              <span className="text-slate-400 cursor-pointer" title="Ürünlerinizi yönetin">
                <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:bg-slate-50 transition-all flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Dışa Aktar</span>
              </button>
              <button
                type="button"
                className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:bg-slate-50 transition-all flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>İçe Aktar</span>
              </button>
              <button
                type="button"
                onClick={initCreateMode}
                className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
              >
                <span>Ürün Ekle</span>
              </button>
            </div>
          </div>

          {/* Search, Filter, and View Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex gap-2 w-full md:w-auto flex-1 max-w-md">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Tabloda arama yapın"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-violet-500 text-slate-800 transition-colors shadow-xs"
                />
              </div>
              <button
                type="button"
                className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:bg-slate-50 transition-all flex items-center gap-1.5"
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filtre</span>
              </button>
            </div>
            
            <div className="flex gap-2">
              <button type="button" className="bg-white border border-slate-200 text-slate-500 p-2 rounded-lg hover:bg-slate-50 transition-all shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </button>
              <button type="button" className="bg-white border border-slate-200 text-slate-500 p-2 rounded-lg hover:bg-slate-50 transition-all shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button type="button" className="bg-white border border-slate-200 text-slate-500 p-2 rounded-lg hover:bg-slate-50 transition-all shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h2v2H4V6zm6 0h2v2h-2V6zm6 0h2v2h-2V6zM4 12h2v2H4v-2zm6 0h2v2h-2v-2zm6 0h2v2h-2v-2zM4 18h2v2H4v-2zm6 0h2v2h-2v-2zm6 0h2v2h-2v-2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center py-20 text-slate-400 text-sm gap-2">
              <ArrowPath className="w-4 h-4 animate-spin text-violet-600" />
              <span>Ürünler yükleniyor...</span>
            </div>
          ) : (
            <div>
              <div className="bg-white border border-slate-150 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
                          checked={paginatedProducts.length > 0 && selectedProductIds.length === paginatedProducts.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProductIds(paginatedProducts.map((p) => p.id))
                            } else {
                              setSelectedProductIds([])
                            }
                          }}
                        />
                      </th>
                      <th className="py-3 px-4 text-slate-600 font-bold select-none cursor-pointer">
                        <span>Ürün</span>
                        <svg className="w-3.5 h-3.5 inline ml-1 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </th>
                      <th className="py-3 px-4 text-slate-600 font-bold">Satış Fiyatı</th>
                      <th className="py-3 px-4 text-slate-600 font-bold">Alış Fiyatı</th>
                      <th className="py-3 px-4 text-slate-600 font-bold select-none cursor-pointer">
                        <span>Envanter</span>
                        <svg className="w-3.5 h-3.5 inline ml-1 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </th>
                      <th className="py-3 px-4 text-slate-600 font-bold">Satış Kanalları</th>
                      <th className="py-3 px-4 text-right text-slate-600 font-bold">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-xs">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">Hiç ürün bulunamadı.</td>
                      </tr>
                    ) : (
                      paginatedProducts.map((prod) => {
                        const firstV = prod.variants?.[0]
                        const originalPrice = (firstV?.prices?.find((p: any) => p.currency_code === "try")?.amount || 0) / 100
                        const salePrice = getSalePriceForVariant(firstV?.id) || originalPrice
                        const costPrice = firstV?.metadata?.cost_price || 0
                        const stockCount = getProductTotalStock(prod)

                        return (
                          <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4 w-10">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
                                checked={selectedProductIds.includes(prod.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProductIds((prev) => [...prev, prod.id])
                                  } else {
                                    setSelectedProductIds((prev) => prev.filter((id) => id !== prod.id))
                                  }
                                }}
                              />
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-16 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                                  {prod.thumbnail ? (
                                    <img src={prod.thumbnail} alt={prod.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-xl">👕</span>
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-900 hover:text-violet-600 transition-colors cursor-pointer text-sm" onClick={() => initEditMode(prod)}>{prod.title}</span>
                                  <span className="text-xs text-slate-400 mt-1">{prod.variants?.length || 0} varyant</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col justify-center">
                                {salePrice < originalPrice ? (
                                  <>
                                    <span className="line-through text-slate-400 text-xs">₺ {originalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                    <span className="text-slate-900 font-extrabold text-sm mt-0.5">₺ {salePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="line-through text-transparent text-xs select-none">₺ 0.00</span>
                                    <span className="text-slate-900 font-extrabold text-sm mt-0.5">₺ {originalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-900 text-sm">
                              {costPrice > 0 ? `₺ ${costPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : "-"}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col justify-center">
                                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                  {stockCount === 0 && (
                                    <span className="inline-flex items-center justify-center w-4.5 h-4.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold" title="Stok Yok!">!</span>
                                  )}
                                  {stockCount} adet
                                </span>
                                <span className="text-violet-600 font-bold text-xs mt-0.5">{prod.variants?.length || 0} varyant</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 cursor-pointer select-none">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="text-slate-800 font-semibold text-xs">1 Satış Kanalı</span>
                                <svg className="w-3.5 h-3.5 text-slate-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => initEditMode(prod)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-xs text-slate-500 font-semibold select-none bg-white border border-slate-150 rounded-xl p-4.5 shadow-sm">
                <div className="flex items-center gap-4.5">
                  <div className="flex items-center gap-2">
                    <span>Satır Adedi:</span>
                    <div className="relative">
                      <select 
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value))
                          setCurrentPage(1)
                        }}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none pr-7 appearance-none cursor-pointer">
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400">▼</span>
                    </div>
                  </div>
                  <div>
                    {filteredProducts.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, filteredProducts.length)} / {filteredProducts.length} Ürün
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button 
                    type="button" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    &lt; Önceki
                  </button>
                  <span className="px-3 py-1.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg font-bold">
                    {currentPage} / {totalPages || 1}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages || totalPages === 0}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Sonraki &gt;
                  </button>
                </div>
              </div>

              {/* Floating Bottom Bulk Action Bar */}
              {selectedProductIds.length > 0 && (
                <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-[#2b3548] p-4 flex items-center justify-center gap-3 z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(true)}
                    className="bg-[#3b82f6] hover:bg-blue-600 text-white font-bold text-sm px-6 py-2.5 rounded transition-colors"
                  >
                    İşlemler ({selectedProductIds.length})
                  </button>
                  <button
                    type="button"
                    className="bg-[#a855f7] hover:bg-purple-600 text-white font-bold text-sm px-6 py-2.5 rounded transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Durum ({selectedProductIds.length})
                  </button>
                  <button
                    type="button"
                    className="bg-[#f59e0b] hover:bg-amber-600 text-white font-bold text-sm px-6 py-2.5 rounded transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Yazdır ({selectedProductIds.length})
                  </button>
                  <button
                    type="button"
                    className="bg-[#ef4444] hover:bg-red-600 text-white font-bold text-sm px-6 py-2.5 rounded transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Seçilenleri Sil ({selectedProductIds.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* -------------------- 2. CREATE & EDIT VIEW -------------------- */}
      {(view === "create" || view === "edit") && (
        <form onSubmit={handleSubmit} className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setView("list")}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 shadow-sm transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h1 className="text-xl font-bold text-slate-900">
                {view === "create" ? "Varyantlı Ürün Ekle" : "Ürünü Düzenle"}
              </h1>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setView("list")}
                className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <ArrowPath className="w-4 h-4 animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <span>Kaydet</span>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Main Fields */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Card 1: Temel Bilgiler */}
              <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Temel Bilgiler</h2>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ürün Adı *</label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Örn: Pembe Alo Arabiyeli Taytlı Takım"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-800 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Satış Fiyatı (TRY) *</label>
                    <input
                      type="number"
                      required
                      value={generalPrice}
                      onChange={(e) => {
                        const val = e.target.value
                        setGeneralPrice(val)
                        setVariantsTable(prev => prev.map(v => ({ ...v, price: val })))
                      }}
                      placeholder="₺ 2,200"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-800 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">İndirimli Fiyat (TRY)</label>
                    <input
                      type="number"
                      value={generalDiscountedPrice}
                      onChange={(e) => {
                        const val = e.target.value
                        setGeneralDiscountedPrice(val)
                        setVariantsTable(prev => prev.map(v => ({ ...v, discountedPrice: val })))
                      }}
                      placeholder="₺ 1,200"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-800 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alış Fiyatı (TRY)</label>
                    <input
                      type="number"
                      value={generalCostPrice}
                      onChange={(e) => {
                        const val = e.target.value
                        setGeneralCostPrice(val)
                        setVariantsTable(prev => prev.map(v => ({ ...v, costPrice: val })))
                      }}
                      placeholder="₺ 500"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-800 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Medya (Görseller) - Only shown for simple products */}
              {!isVariantProduct && (
                <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6 space-y-4">
                  <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Medya (Görseller)</h2>
                  
                  {/* Upload Zone */}
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-500/50 transition-colors relative cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl text-slate-350">📸</span>
                      <span className="text-xs font-bold text-slate-500">Maksimum 10MB boyutunda medya dosyası yükleyebilirsiniz.</span>
                      <span className="text-[11px] font-bold text-indigo-500">+ Görsel / Video Ekle</span>
                    </div>
                  </div>

                  {uploading && (
                    <div className="flex items-center gap-2 text-xs text-indigo-500 font-bold justify-center py-2">
                      <ArrowPath className="w-4 h-4 animate-spin" />
                      <span>Medya dosyaları yükleniyor...</span>
                    </div>
                  )}

                  {/* Images grid preview */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-2">
                      {images.map((img, idx) => {
                        const isVideo = img.type === "video" || isVideoUrl(img.url)
                        return (
                          <div 
                            key={idx} 
                            draggable
                            onDragStart={() => handleDragStart(idx)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(idx)}
                            className={`relative group aspect-[3/4] rounded-lg border overflow-hidden shadow-sm bg-slate-50 cursor-grab active:cursor-grabbing transition-all ${
                              draggedIndex === idx ? 'opacity-40 border-dashed border-indigo-400' : 'border-slate-150 hover:border-slate-350'
                            }`}
                          >
                            {isVideo ? (
                              <video src={img.url} className="w-full h-full object-cover pointer-events-none" muted autoPlay loop playsInline />
                            ) : (
                              <img src={img.url} alt="preview" className="w-full h-full object-cover pointer-events-none" />
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 bg-rose-600 text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Card 3: Varyant Yönetimi */}
              <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-extrabold text-slate-900">Varyant ve Seçenek Yönetimi</h2>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">Varyantlı Ürün</span>
                    <input
                      type="checkbox"
                      checked={isVariantProduct}
                      onChange={(e) => setIsVariantProduct(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {isVariantProduct ? (
                  <div className="space-y-4">
                    {/* Renk Seçenekleri */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Renk Seçenekleri</label>
                        <div className="flex gap-1.5 items-center">
                          <input
                            type="text"
                            placeholder="Yeni renk ekle..."
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                handleAddColor()
                              }
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold focus:outline-none focus:border-indigo-500 text-slate-800 transition-colors w-32"
                          />
                          <button
                            type="button"
                            onClick={handleAddColor}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-1 rounded-lg text-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableColors.map(color => {
                          const active = selectedColors.includes(color)
                          return (
                            <div
                              key={color}
                              onClick={() => {
                                if (active) {
                                  setSelectedColors(prev => prev.filter(c => c !== color))
                                } else {
                                  setSelectedColors(prev => [...prev, color])
                                }
                              }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm transition-all cursor-pointer ${
                                active 
                                  ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-extrabold" 
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <span>{color}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveColor(color)
                                }}
                                className="text-slate-400 hover:text-rose-600 transition-colors text-[10px] pl-0.5"
                                title="Sil"
                              >
                                ✕
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Beden Seçenekleri */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Beden Seçenekleri</label>
                        <div className="flex gap-1.5 items-center">
                          <input
                            type="text"
                            placeholder="Yeni beden ekle..."
                            value={newSize}
                            onChange={(e) => setNewSize(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                handleAddSize()
                              }
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold focus:outline-none focus:border-indigo-500 text-slate-800 transition-colors w-32"
                          />
                          <button
                            type="button"
                            onClick={handleAddSize}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-1 rounded-lg text-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableSizes.map(size => {
                          const active = selectedSizes.includes(size)
                          return (
                            <div
                              key={size}
                              onClick={() => {
                                if (active) {
                                  setSelectedSizes(prev => prev.filter(s => s !== size))
                                } else {
                                  setSelectedSizes(prev => [...prev, size])
                                }
                              }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm transition-all cursor-pointer ${
                                active 
                                  ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-extrabold" 
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <span>{size}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveSize(size)
                                }}
                                className="text-slate-400 hover:text-rose-600 transition-colors text-[10px] pl-0.5"
                                title="Sil"
                              >
                                ✕
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Generated Variants Table */}
                    {variantsTable.length > 0 && (
                      <div className="mt-6">
                        {/* Bulk Action / Selection info bar */}
                        {checkedIndices.length > 0 && (
                          <div className="flex items-center gap-4 bg-indigo-50/40 border border-indigo-100 rounded-lg px-4 py-2.5 text-xs text-indigo-900 mb-3.5 shadow-sm">
                            <span className="font-extrabold">{checkedIndices.length} Seçili Varyant var</span>
                            <div className="h-4 w-px bg-indigo-200" />
                            <span className="text-[11px] text-indigo-700 font-medium">Bir alana bilgi girdiğinizde seçili olanların tümü değişir.</span>
                            <button
                              type="button"
                              onClick={() => setCheckedIndices([])}
                              className="ml-auto text-indigo-600 hover:text-indigo-800 font-extrabold border border-indigo-200 hover:border-indigo-300 bg-white px-2.5 py-1 rounded-md transition-all shadow-sm"
                            >
                              Seçimi Temizle
                            </button>
                          </div>
                        )}
                        <div className="border border-slate-100 rounded-xl overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-max">
                            <thead>
                              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                <th className="py-2.5 px-3 w-10">
                                  <input
                                    type="checkbox"
                                    checked={checkedIndices.length === variantsTable.length && variantsTable.length > 0}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setCheckedIndices(variantsTable.map((_, i) => i))
                                      } else {
                                        setCheckedIndices([])
                                      }
                                    }}
                                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                  />
                                </th>
                                <th className="py-2.5 px-3">Görsel</th>
                                <th className="py-2.5 px-3">Varyant</th>
                                <th className="py-2.5 px-3">Satış Fiyatı</th>
                                <th className="py-2.5 px-3">İndirimli Fiyat</th>
                                <th className="py-2.5 px-3">SKU</th>
                                <th className="py-2.5 px-3">Barkod <button type="button" onClick={() => setVariantsTable(variantsTable.map(v => ({...v, barcode: "7689887" + Math.floor(100000 + Math.random() * 900000).toString()})))} className="text-blue-500 hover:underline text-[10px] font-normal normal-case ml-1">(Rastgele)</button></th>
                                <th className="py-2.5 px-3">Stok</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150 text-xs">
                              {variantsTable.map((v, idx) => {
                                const isChecked = checkedIndices.includes(idx)
                                return (
                                  <tr key={idx} className={`hover:bg-slate-50/30 ${isChecked ? 'bg-indigo-50/20' : ''}`}>
                                    <td className="py-2 px-3 w-10">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setCheckedIndices(prev => [...prev, idx])
                                          } else {
                                            setCheckedIndices(prev => prev.filter(i => i !== idx))
                                          }
                                        }}
                                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                      />
                                    </td>
                                    <td className="py-2 px-3">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveVariantIndexForImage(idx)
                                          setShowImagePicker(true)
                                        }}
                                        className="relative w-8 h-10 bg-slate-50 border border-slate-150 rounded overflow-hidden flex items-center justify-center hover:border-indigo-500 transition-colors shadow-sm"
                                      >
                                        {v.image ? (
                                          isVideoUrl(v.image) ? (
                                            <div className="relative w-full h-full">
                                              <video src={v.image} className="w-full h-full object-cover" muted playsInline />
                                              <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                                                <span className="text-[8px] text-white font-extrabold bg-black/40 px-1 py-0.5 rounded">VİDEO</span>
                                              </div>
                                            </div>
                                          ) : (
                                            <img src={v.image} alt="v-preview" className="w-full h-full object-cover" />
                                          )
                                        ) : (
                                          <span className="text-xs text-slate-400 font-bold">+</span>
                                        )}
                                      </button>
                                    </td>
                                    <td className="py-2 px-3 font-extrabold text-slate-900">
                                      {v.color} / {v.size}
                                    </td>
                                    <td className="py-2 px-3">
                                      <input
                                        type="number"
                                        value={v.price}
                                        onChange={(e) => {
                                          const val = e.target.value
                                          const updated = [...variantsTable]
                                          if (isChecked) {
                                            checkedIndices.forEach(i => {
                                              updated[i].price = val
                                            })
                                          } else {
                                            updated[idx].price = val
                                          }
                                          setVariantsTable(updated)
                                        }}
                                        className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                                      />
                                    </td>
                                    <td className="py-2 px-3">
                                      <input
                                        type="number"
                                        value={v.discountedPrice}
                                        onChange={(e) => {
                                          const val = e.target.value
                                          const updated = [...variantsTable]
                                          if (isChecked) {
                                            checkedIndices.forEach(i => {
                                              updated[i].discountedPrice = val
                                            })
                                          } else {
                                            updated[idx].discountedPrice = val
                                          }
                                          setVariantsTable(updated)
                                        }}
                                        className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                                      />
                                    </td>
                                    <td className="py-2 px-3">
                                      <input
                                        type="text"
                                        value={v.sku || ""}
                                        onChange={(e) => {
                                          const val = e.target.value
                                          const updated = [...variantsTable]
                                          if (isChecked) {
                                            checkedIndices.forEach(i => {
                                              updated[i].sku = val
                                            })
                                          } else {
                                            updated[idx].sku = val
                                          }
                                          setVariantsTable(updated)
                                        }}
                                        className="w-28 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold focus:outline-none focus:border-indigo-500 text-slate-800"
                                      />
                                    </td>
                                    <td className="py-2 px-3">
                                      <input
                                        type="text"
                                        value={v.barcode || ""}
                                        onChange={(e) => {
                                          const val = e.target.value
                                          const updated = [...variantsTable]
                                          if (isChecked) {
                                            checkedIndices.forEach(i => {
                                              updated[i].barcode = val
                                            })
                                          } else {
                                            updated[idx].barcode = val
                                          }
                                          setVariantsTable(updated)
                                        }}
                                        className="w-28 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold focus:outline-none focus:border-indigo-500 text-slate-800"
                                      />
                                    </td>
                                    <td className="py-2 px-3">
                                      <input
                                        type="number"
                                        value={v.stock}
                                        onChange={(e) => {
                                          const val = e.target.value
                                          const updated = [...variantsTable]
                                          if (isChecked) {
                                            checkedIndices.forEach(i => {
                                              updated[i].stock = val
                                            })
                                          } else {
                                            updated[idx].stock = val
                                          }
                                          setVariantsTable(updated)
                                        }}
                                        className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                                      />
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-4.5 text-xs text-slate-400 font-bold text-center">
                    Varyantsız (Tek parçalı) basit ürün türü aktif. Yukarıdaki fiyatlar geçerli olacaktır.
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar: Details & Settings */}
            <div className="space-y-6">
              
              {/* Card 4: Ürün Detayı */}
              <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Ürün Detayı</h2>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Kategori Seçin</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Marka / Koleksiyon</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Marka Seçin</option>
                    {collections.map((col: any) => (
                      <option key={col.id} value={col.id}>{col.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Etiketler</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Örn: jean, tayt, yeni-sezon"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-800 transition-colors"
                  />
                </div>
              </div>

              {/* Card 5: Açıklama */}
              <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Açıklama</h2>
                
                <div className="space-y-1">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    placeholder="Ürün açıklamasını buraya girin..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-800 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Card 6: SEO */}
              <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6 space-y-6">
                <div className="space-y-1 relative">
                  <label className="text-[12px] text-slate-700 block font-normal">SEO Başlığı <span className="text-orange-600">({seoTitle.length})</span></label>
                  <div className="relative">
                    <textarea
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-slate-300 rounded p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-800 pr-12 resize-none"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        setSeoTitle(`${productName || "Ürün"} | En Uygun Fiyatlar ve İndirimler`)
                        if (!seoKeywords) setSeoKeywords(productName)
                      }}
                      className="absolute right-2 top-2 p-1 border border-slate-400 rounded hover:bg-slate-100 transition-colors text-slate-600 flex items-center justify-center"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <text x="4" y="16" fontSize="13" fontWeight="bold" fill="currentColor" stroke="none">Ai</text>
                        <path d="M16 4l2 2l-2 2M18 6h-4" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-1 relative">
                  <label className="text-[12px] text-slate-700 block font-normal">SEO Açıklaması <span className="text-orange-600">({seoDescription.length})</span></label>
                  <div className="relative">
                    <textarea
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-white border border-slate-300 rounded p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-800 pr-12 resize-none"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        setSeoDescription(`${productName || "Bu ürün"} modeli en ucuz fiyat avantajı ve indirim fırsatıyla burada. Hemen tıkla, güvenle satın al!`)
                        if (!seoKeywords) setSeoKeywords(productName)
                      }}
                      className="absolute right-2 top-2 p-1 border border-slate-400 rounded hover:bg-slate-100 transition-colors text-slate-600 flex items-center justify-center"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <text x="4" y="16" fontSize="13" fontWeight="bold" fill="currentColor" stroke="none">Ai</text>
                        <path d="M16 4l2 2l-2 2M18 6h-4" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] text-slate-700 block font-normal">SEO Anahtar Kelimeleri <span className="text-orange-600">({seoKeywords.length})</span></label>
                  <textarea
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-slate-300 rounded p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-800 resize-none"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[12px] text-slate-700 block font-normal">Arama Önizlemesi</label>
                  <div className="border border-slate-200 rounded p-4 bg-white shadow-sm flex flex-col gap-1">
                    <div className="text-[13px] text-[#202124] flex items-center gap-1">
                      fametarz.com/ <span className="text-[#4d5156]">{productName ? productName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '') : "krem-desenli-oversize-tisort-ve-sort-takimi"}</span>
                    </div>
                    <div className="text-[18px] text-[#1a0dab] hover:underline cursor-pointer truncate">
                      {seoTitle || (productName ? `${productName} | En Uygun Fiyatlar` : "Krem Desenli Oversize Tişört ve Şort Takımı")}
                    </div>
                    <div className="text-[13px] text-[#4d5156] line-clamp-2">
                      {seoDescription || (productName ? `${productName} modeli en ucuz fiyat avantajı ve indirim fırsatıyla burada.` : "Krem Desenli Oversize Tişört ve Şort Takımı")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* -------------------- 3. DIALOG / IMAGE PICKER FOR VARIANTS -------------------- */}
      {showImagePicker && activeVariantIndexForImage !== null && (() => {
        const isChecked = checkedIndices.includes(activeVariantIndexForImage)
        const selectionCount = isChecked ? checkedIndices.length : 1
        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50 transition-all">
            <div className="bg-white w-[380px] h-full flex flex-col shadow-2xl border-l border-slate-150 animate-slideOver overflow-hidden">
              
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white flex-shrink-0">
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-slate-900">Görseller</span>
                  <span className="text-[10px] font-bold text-orange-600 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                    Seçili {selectionCount} varyant
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowImagePicker(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Upload media area directly in drawer */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-indigo-500/50 transition-colors relative cursor-pointer m-4 bg-slate-50/50 flex-shrink-0">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl text-slate-350">📸</span>
                  <span className="text-xs font-semibold text-slate-500">Görsel seç veya sürükle</span>
                  <span className="text-[11px] font-bold text-indigo-600">+ Görsel / Video Ekle</span>
                </div>
              </div>

              {/* Media selection section */}
              <div className="flex-1 overflow-y-auto min-h-0 py-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-4 mb-2.5">
                  Yüklenen Görseller
                </span>
                
                {(() => {
                  const activeColor = variantsTable[activeVariantIndexForImage]?.color
                  const filteredImages = images.filter(img => img.color === activeColor)
                  
                  if (filteredImages.length === 0) {
                    return (
                      <div className="mx-4 text-center py-10 text-xs text-slate-400 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200 animate-fadeIn">
                        Bu renk ({activeColor || "Standart"}) için henüz görsel/video yüklenmedi.
                      </div>
                    )
                  }
                  
                  return (
                    <div className="space-y-2 px-4 pb-6">
                      {filteredImages.map((img) => {
                        const globalIdx = images.findIndex(item => item.url === img.url)
                        const isSelected = variantsTable[activeVariantIndexForImage].image === img.url
                        const isVideo = img.type === "video" || isVideoUrl(img.url)
                        return (
                          <div
                            key={img.url}
                            draggable
                            onDragStart={() => handleDragStart(globalIdx)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(globalIdx)}
                            onClick={() => {
                              const updated = [...variantsTable]
                              if (isChecked) {
                                checkedIndices.forEach(i => {
                                  updated[i].image = img.url
                                })
                              } else {
                                updated[activeVariantIndexForImage].image = img.url
                              }
                              setVariantsTable(updated)
                            }}
                            className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? "border-indigo-500 bg-indigo-50/20 shadow-sm ring-1 ring-indigo-500/10"
                                : "border-slate-150 hover:border-slate-250 hover:bg-slate-50/40 bg-white"
                            } ${
                              draggedIndex === globalIdx ? 'opacity-40 border-dashed border-indigo-400' : ''
                            }`}
                          >
                            <div className="text-slate-350 font-extrabold select-none text-xs pl-1 cursor-grab active:cursor-grabbing">
                              ⋮⋮
                            </div>

                            <div className="w-10 h-14 rounded-lg border border-slate-150 overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center relative pointer-events-none">
                              {isVideo ? (
                                <video src={img.url} className="w-full h-full object-cover" muted playsInline />
                              ) : (
                                <img src={img.url} className="w-full h-full object-cover" />
                              )}
                              {isVideo && (
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                  <span className="text-[8px] text-white font-extrabold bg-black/40 px-1 py-0.5 rounded">VİDEO</span>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col flex-1 min-w-0 pointer-events-none">
                              <span className="text-[11px] font-bold text-slate-700 truncate">
                                {img.filename || `Medya`}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                                {isVideo ? "Video" : "Görsel"}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm("Bu görseli silmek istediğinize emin misiniz?")) {
                                  handleDeleteImageFromPool(img.url)
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all mr-1 z-10 flex-shrink-0"
                              title="Sil"
                            >
                              <Trash className="w-4 h-4" />
                            </button>

                            {isSelected && (
                              <div className="bg-indigo-600 text-white rounded-full p-0.5 mr-2 flex-shrink-0">
                                <CheckCircle className="w-4 h-4 text-white fill-white" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-4 py-3.5 flex gap-3 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...variantsTable]
                    if (isChecked) {
                      checkedIndices.forEach(i => {
                        updated[i].image = ""
                      })
                    } else {
                      updated[activeVariantIndexForImage].image = ""
                    }
                    setVariantsTable(updated)
                    setShowImagePicker(false)
                  }}
                  className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold py-2 rounded-lg transition-colors shadow-sm"
                >
                  Görseli Kaldır
                </button>
                <button 
                  type="button"
                  onClick={() => setShowImagePicker(false)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold py-2 rounded-lg shadow-md transition-colors"
                >
                  Tamam
                </button>
              </div>

            </div>
          </div>
        )
      })()}

      {/* -------------------- 4. BULK ACTIONS MODAL -------------------- */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
            {/* Header */}
            <div className="bg-[#1d4ed8] px-5 py-4 flex justify-between items-center text-white">
              <h2 className="text-base font-bold">Toplu İşlemler</h2>
              <button onClick={() => { setIsBulkModalOpen(false); setBulkModalStep(1); }} className="text-white hover:text-slate-200 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {bulkModalStep === 1 ? (
              /* Step 1: Select Action */
              <div className="p-6 space-y-6">
                <div className="bg-[#3b82f6] text-white p-4 rounded-lg text-sm font-medium">
                  Tabloda seçtiğiniz ürünlere aşağıdaki işlemleri uygulayabilirsiniz.
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">İşlemler</label>
                  <select 
                    value={bulkActionType}
                    onChange={(e) => setBulkActionType(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 text-slate-700"
                  >
                    <option value="">İşlem Seçiniz</option>
                    <option value="category">Kategori Değiştir</option>
                    <option value="price">Satış Fiyatını Güncelle</option>
                    <option value="stock">Stok Miktarını Güncelle</option>
                  </select>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (!bulkActionType) return alert("Lütfen bir işlem seçiniz.")
                      setBulkModalStep(2)
                    }}
                    className="bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded shadow transition-colors flex items-center gap-2"
                  >
                    <span>İleri</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Action Details */
              <div className="p-6 space-y-6">
                {bulkActionType === "category" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">Kategori Seçin</label>
                    <select
                      value={bulkActionCategory}
                      onChange={(e) => setBulkActionCategory(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 text-slate-700"
                    >
                      <option value="">Hiçbiri seçilmedi</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setBulkModalStep(1)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-5 rounded shadow-sm transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    <span>Geri</span>
                  </button>

                  <button
                    type="button"
                    disabled={isBulkUpdating}
                    onClick={async () => {
                      if (bulkActionType === "category" && !bulkActionCategory) return alert("Lütfen bir kategori seçin.")
                      setIsBulkUpdating(true)
                      try {
                        for (const id of selectedProductIds) {
                          await fetch(`/admin/products/${id}`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ categories: [{ id: bulkActionCategory }] })
                          })
                        }
                        alert("Toplu güncelleme başarıyla tamamlandı.")
                        setIsBulkModalOpen(false)
                        setBulkModalStep(1)
                        setSelectedProductIds([])
                        await fetchData()
                      } catch (e: any) {
                        alert("Hata: " + e.message)
                      } finally {
                        setIsBulkUpdating(false)
                      }
                    }}
                    className="bg-[#10b981] hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-5 rounded shadow transition-colors flex items-center gap-2"
                  >
                    {isBulkUpdating ? (
                      <ArrowPath className="w-4 h-4 animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    )}
                    <span>İşlemi Tamamla</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Ürün Yönetimi",
  icon: Tag,
})

export default IkasProductsPage
