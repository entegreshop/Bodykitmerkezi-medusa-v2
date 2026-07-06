import React from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import { Container, Heading, Tabs } from "@medusajs/ui"
import XmlExportTab from "./components/xml-export-tab"
import XmlImportTab from "./components/xml-import-tab"

const XmlOperationsPage = () => {
  return (
    <div className="flex flex-col gap-y-6 max-w-7xl mx-auto w-full pb-10">
      <div className="flex items-center justify-between">
        <Heading level="h1" className="text-3xl font-bold text-zinc-800">
          XML İşlemleri
        </Heading>
      </div>

      <Tabs defaultValue="import">
        <Tabs.List className="mb-6 inline-flex p-1 bg-zinc-100 rounded-lg">
          <Tabs.Trigger value="import" className="px-6 py-2.5 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-zinc-500 hover:text-zinc-700">
            XML İçeri Aktar
          </Tabs.Trigger>
          <Tabs.Trigger value="export" className="px-6 py-2.5 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-zinc-500 hover:text-zinc-700">
            XML Dışarı Aktar
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="import" className="m-0">
          <XmlImportTab />
        </Tabs.Content>
        <Tabs.Content value="export" className="m-0">
          <XmlExportTab />
        </Tabs.Content>
      </Tabs>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "XML İşlemleri",
  icon: DocumentText,
})

export default XmlOperationsPage
