import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "StyleForge — Distill a writing voice into SFT data",
  description: "Personal-style SFT data production tool",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
