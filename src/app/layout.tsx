import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SoldSync — Stop Double-Sales Instantly',
  description:
    'SoldSync auto-delists your items across Shopify, eBay, and Etsy the moment a sale happens. Real-time webhooks. Zero polling. No double-sales.',
  keywords: ['reseller tools', 'eBay Etsy sync', 'auto delist', 'prevent double sales', 'vintage reseller', 'shopify sync'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-[#1a1916] text-[#f0ece6] overflow-x-hidden`}>
        {children}
      </body>
    </html>
  )
}
