import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"
import os from "os"

const configFilePath = path.join(os.homedir(), ".xoox-shipping-settings.json")

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
  const success = writeConfig(body)
  if (success) {
    res.json({ success: true, config: body })
  } else {
    res.status(500).json({ success: false, message: "Could not write shipping configuration" })
  }
}
