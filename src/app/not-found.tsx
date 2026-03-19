import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a1916] text-[#f0ece6] px-6">
      <p className="text-7xl font-bold text-[#2e2c28] mb-6 font-mono">404</p>
      <h1 className="text-2xl font-bold text-[#f0ece6] mb-2">Page not found</h1>
      <p className="text-[#7a7268] text-sm mb-10 text-center max-w-xs">
        This page doesn&apos;t exist. Your listings, however, are still protected.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-sm text-[#7a7268] hover:text-[#b8b0a6] transition-colors px-4 py-2"
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 rounded-lg bg-[#c97a40] hover:bg-[#b86c34] px-5 py-2.5 text-sm font-medium text-white transition-colors"
        >
          Go to dashboard
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
