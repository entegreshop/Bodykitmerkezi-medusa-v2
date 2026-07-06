import { Module } from "@medusajs/framework/utils"
import { XmlSource } from "./models/xml-source"

export const XML_IMPORT_MODULE = "xml_import"

export default Module(XML_IMPORT_MODULE, {
  service: class XmlImportService {
    // We can add methods here later, for now we just need the DML model to be registered
  },
})
