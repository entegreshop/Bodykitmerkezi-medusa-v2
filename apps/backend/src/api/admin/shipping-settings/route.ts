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
    const dir = path.dirname(configFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
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
  const fee = Number(body.standardShippingFee ?? 0)
  const currency = body.standardShippingCurrency || "TL"

  if (typeof fee !== "number" || !isFinite(fee) || fee < 0) {
    return res.status(400).json({ success: false, message: "Geçersiz kargo ücreti" })
  }
  if (currency !== "TL") {
    return res.status(400).json({ success: false, message: "Sadece TL desteklenmektedir" })
  }

  // 1. Always persist JSON config first so settings are never lost
  const savedToDisk = writeConfig(body)
  if (!savedToDisk) {
    return res.status(500).json({ success: false, message: "Ayar dosyaya kaydedilemedi." })
  }

  // 2. Sync canonical Medusa shipping options (both base TRY price and regional Turkey price)
  try {
    const { ContainerRegistrationKeys } = await import("@medusajs/framework/utils")
    const { updateShippingOptionsWorkflow } = await import("@medusajs/core-flows")
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
        price_type: "flat"
      }
    })

    const medusaAmount = body.standardShippingEnabled === false ? 0 : Math.round(fee * 100)

    if (shippingOptions && shippingOptions.length > 0) {
      const optionsWithTry = shippingOptions.filter((opt: any) =>
        opt.prices?.some((p: any) => p.currency_code?.toLowerCase() === "try")
      )

      for (const option of (optionsWithTry as any[])) {
        const updatedPrices = option.prices
          .filter((p: any) => p.currency_code?.toLowerCase() === "try" && p.id)
          .map((p: any) => ({
            id: p.id,
            amount: medusaAmount
          }))

        if (updatedPrices.length > 0) {
          try {
            await updateShippingOptionsWorkflow(req.scope).run({
              input: [
                {
                  id: option.id,
                  prices: updatedPrices
                }
              ]
            })
          } catch (wfErr) {
            console.warn(`Warning updating shipping option ${option.id} via id+amount, trying full price payload:`, wfErr)
            const fallbackPrices = option.prices.map((p: any) => {
              const isTry = p.currency_code?.toLowerCase() === "try"
              const payload: any = {
                id: p.id,
                amount: isTry ? medusaAmount : p.amount
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
            })
            await updateShippingOptionsWorkflow(req.scope).run({
              input: [
                {
                  id: option.id,
                  prices: fallbackPrices
                }
              ]
            })
          }
        }
      }
    }
  } catch (err: any) {
    console.error("Warning syncing Medusa shipping option prices (JSON config was saved):", err)
  }

  return res.json({ success: true, config: body })
}

