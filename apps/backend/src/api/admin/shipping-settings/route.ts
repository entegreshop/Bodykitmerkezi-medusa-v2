import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"
import os from "os"

const configFilePath = path.join(process.cwd(), "uploads", "shipping-settings.json")

const defaultData = {
  systemType: "advanced", // "advanced" | "simple"
  standardShippingEnabled: true,
  standardShippingFee: 100,
  standardShippingCurrency: "TL",
  standardShippingCartType: "Tüm sepetlere ekle",
  freeShippingEnabled: true,
  freeShippingThreshold: 500,
  freeShippingCurrency: "TL",
  regions: [
    {
      id: "reg_tr",
      countryCode: "tr",
      countryName: "Türkiye",
      name: "Asya 1",
      cities: ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"]
    }
  ],
  carriers: [
    {
      id: "carrier_aras",
      key: "aras",
      general: {
        name: "ARAS KARGO",
        active: true,
        description: "Aras kargo ile hızlı teslimat.",
        sortOrder: 4,
        taxNumber: "",
        customerType: "Hepsi",
        companyCode: "",
        logoUrl: "",
        customDeliveryTime: false,
        limitCartTotal: false,
        limitVolumetricWeight: false,
        limitProductQuantity: false
      },
      api: {
        apiActive: false,
        autoGenerateBarcode: true,
        generateBarcodeForNonCarrier: false,
        markAsShippedOnBranchReceive: true,
        barcodeGenerationStage: "Yeni Sipariş",
        sendFixedVolumetricWeight: false,
        apiAuthorization: "PA4RQ2XMfG1DgwLrYO8pW3zs9tZ7yjvhINJd6FSk",
        apiFrom: "info@giyimbox.com",
        branchName: "MNG"
      },
      regions: {
        deliveryType: "all",
        countries: []
      }
    },
    {
      id: "carrier_interline",
      key: "interline",
      general: {
        name: "INTERLINE KARGO",
        active: false,
        description: "",
        sortOrder: 0,
        taxNumber: "",
        customerType: "Hepsi",
        companyCode: "",
        logoUrl: "",
        customDeliveryTime: false,
        limitCartTotal: false,
        limitVolumetricWeight: false,
        limitProductQuantity: false
      },
      api: {
        apiActive: false,
        autoGenerateBarcode: false,
        generateBarcodeForNonCarrier: false,
        markAsShippedOnBranchReceive: false,
        barcodeGenerationStage: "Yeni Sipariş",
        sendFixedVolumetricWeight: false,
        apiAuthorization: "",
        apiFrom: "",
        branchName: ""
      },
      regions: {
        deliveryType: "all",
        countries: []
      }
    },
    {
      id: "carrier_kargoist",
      key: "kargoist",
      general: {
        name: "KARGOİST",
        active: false,
        description: "",
        sortOrder: 0,
        taxNumber: "",
        customerType: "Hepsi",
        companyCode: "",
        logoUrl: "",
        customDeliveryTime: false,
        limitCartTotal: false,
        limitVolumetricWeight: false,
        limitProductQuantity: false
      },
      api: {
        apiActive: false,
        autoGenerateBarcode: false,
        generateBarcodeForNonCarrier: false,
        markAsShippedOnBranchReceive: false,
        barcodeGenerationStage: "Yeni Sipariş",
        sendFixedVolumetricWeight: false,
        apiAuthorization: "",
        apiFrom: "",
        branchName: ""
      },
      regions: {
        deliveryType: "all",
        countries: []
      }
    },
    {
      id: "carrier_ptt",
      key: "ptt",
      general: {
        name: "PTT Kargo",
        active: false,
        description: "",
        sortOrder: 0,
        taxNumber: "",
        customerType: "Hepsi",
        companyCode: "",
        logoUrl: "",
        customDeliveryTime: false,
        limitCartTotal: false,
        limitVolumetricWeight: false,
        limitProductQuantity: false
      },
      api: {
        apiActive: false,
        autoGenerateBarcode: false,
        generateBarcodeForNonCarrier: false,
        markAsShippedOnBranchReceive: false,
        barcodeGenerationStage: "Yeni Sipariş",
        sendFixedVolumetricWeight: false,
        apiAuthorization: "",
        apiFrom: "",
        branchName: ""
      },
      regions: {
        deliveryType: "all",
        countries: []
      }
    },
    {
      id: "carrier_nova",
      key: "kargonova",
      general: {
        name: "KargoNOVA",
        active: false,
        description: "",
        sortOrder: 0,
        taxNumber: "",
        customerType: "Hepsi",
        companyCode: "",
        logoUrl: "",
        customDeliveryTime: false,
        limitCartTotal: false,
        limitVolumetricWeight: false,
        limitProductQuantity: false
      },
      api: {
        apiActive: false,
        autoGenerateBarcode: false,
        generateBarcodeForNonCarrier: false,
        markAsShippedOnBranchReceive: false,
        barcodeGenerationStage: "Yeni Sipariş",
        sendFixedVolumetricWeight: false,
        apiAuthorization: "",
        apiFrom: "",
        branchName: ""
      },
      regions: {
        deliveryType: "all",
        countries: []
      }
    }
  ],
  generalShippingFees: [],
  productSpecificFees: []
}

export function readConfig() {
  try {
    if (fs.existsSync(configFilePath)) {
      const content = fs.readFileSync(configFilePath, "utf-8")
      const parsed = JSON.parse(content)
      return {
        ...defaultData,
        ...parsed,
        regions: parsed.regions || defaultData.regions,
        carriers: parsed.carriers || defaultData.carriers,
        generalShippingFees: parsed.generalShippingFees || defaultData.generalShippingFees,
        productSpecificFees: parsed.productSpecificFees || defaultData.productSpecificFees
      }
    }
  } catch (err) {
    console.error("Error reading shipping config in admin api:", err)
  }
  return defaultData
}

function writeConfig(data: any) {
  try {
    fs.writeFileSync(configFilePath, JSON.stringify(data, null, 2), "utf-8")
    return true
  } catch (err) {
    console.error("Error writing shipping config in admin api:", err)
    return false
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const config = readConfig()
  res.json({ config })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as any
  const fee = body.standardShippingFee
  const currency = body.standardShippingCurrency

  // Validate incoming JSON
  if (typeof fee !== "number" || !isFinite(fee) || fee < 0) {
    return res.status(400).json({ success: false, message: "Geçersiz kargo ücreti" })
  }
  if (currency !== "TL") {
    return res.status(400).json({ success: false, message: "Sadece TL desteklenmektedir" })
  }

  // Find canonical Medusa shipping option
  const { ContainerRegistrationKeys } = await import("@medusajs/framework/utils")
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  
  const { data: shippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: [
      "id", 
      "name", 
      "price_type", 
      "provider_id", 
      "prices.*", 
      "prices.price_rules.*",
      "service_zone.geo_zones.*",
      "shipping_profile.*"
    ],
    filters: {
      provider_id: "manual_manual",
      price_type: "flat"
    }
  })

  if (!shippingOptions || shippingOptions.length === 0) {
    return res.status(400).json({ success: false, message: "Sistemde uygun kargo seçeneği bulunamadı." })
  }

  // Filter for deterministic matching conditions
  const candidates = shippingOptions.filter((opt: any) => {
    // Must belong to a Service Zone that covers Turkey
    const coversTurkey = opt.service_zone?.geo_zones?.some(
      (gz: any) => gz.country_code?.toLowerCase() === "tr"
    )

    // Must belong to the default product Shipping Profile
    const isDefaultProfile = opt.shipping_profile?.type === "default"

    // Must contain exactly one unconditional TRY base price
    const tryBasePrices = opt.prices?.filter((p: any) => 
      p.currency_code === "try" && (!p.price_rules || p.price_rules.length === 0)
    ) || []

    return coversTurkey && isDefaultProfile && tryBasePrices.length === 1
  })

  if (candidates.length === 0) {
    return res.status(400).json({ success: false, message: "Sistemde standart Türkiye gönderimi (Standart Profil, TR bölgesi, tek temel TRY fiyatı) için uygun kargo seçeneği bulunamadı." })
  }
  if (candidates.length > 1) {
    return res.status(400).json({ success: false, message: "Sistemde birden fazla standart Türkiye kargo seçeneği bulundu. Hangi seçeneğin güncelleneceği belirsiz (güvenli değil)." })
  }

  const option = candidates[0] as any
  
  // Isolate the base TRY price
  const baseTryPrice = option.prices.find((p: any) => 
    p.currency_code === "try" && (!p.price_rules || p.price_rules.length === 0)
  )
  const oldAmount = baseTryPrice.amount
  const medusaAmount = Math.round(fee * 100)
  
  // Helper to construct DTO-safe price payload
  const mapPrice = (p: any, overrideAmount?: number) => {
    const payload: any = {
      id: p.id,
      amount: overrideAmount ?? p.amount
    }
    if (p.currency_code) payload.currency_code = p.currency_code
    if (p.region_id) payload.region_id = p.region_id
    if (p.price_rules && p.price_rules.length > 0) {
      payload.rules = p.price_rules.map((pr: any) => ({
        attribute: pr.attribute,
        operator: pr.operator,
        value: pr.value
      }))
    }
    return payload
  }

  // Lazily load workflow to avoid breaking route init
  const { updateShippingOptionsWorkflow } = await import("@medusajs/core-flows")

  try {
    const { errors } = await updateShippingOptionsWorkflow(req.scope).run({
      input: [
        {
          id: option.id,
          prices: option.prices.map((p: any) => 
            p.id === baseTryPrice.id ? mapPrice(p, medusaAmount) : mapPrice(p)
          )
        }
      ]
    })

    if (errors && errors.length > 0) {
      throw new Error(errors[0].error.message)
    }

    // Persist JSON config
    const success = writeConfig(body)
    if (success) {
      return res.json({ success: true, config: body })
    } else {
      // Rollback Medusa update if JSON fails
      try {
        await updateShippingOptionsWorkflow(req.scope).run({
          input: [
            {
              id: option.id,
              prices: option.prices.map((p: any) => 
                p.id === baseTryPrice.id ? mapPrice(p, oldAmount) : mapPrice(p)
              )
            }
          ]
        })
      } catch (revertErr) {
        console.error("CRITICAL: Failed to revert Medusa shipping option after JSON save failure", revertErr)
      }
      return res.status(500).json({ success: false, message: "Ayar dosyaya kaydedilemedi." })
    }

  } catch (err: any) {
    console.error("Error updating Medusa shipping option:", err)
    return res.status(500).json({ success: false, message: "Medusa kargo fiyatı güncellenemedi." })
  }
}
