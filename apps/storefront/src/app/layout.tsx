import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "styles/globals.css"
import PixelScripts from "@modules/layout/components/pixel-scripts"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plus-jakarta-sans",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={`${plusJakartaSans.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased text-ui-fg-base bg-white">
        <PixelScripts />
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}

