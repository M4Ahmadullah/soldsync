import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductShowcase from '@/components/ProductShowcase';
import BentoGrid from '@/components/BentoGrid';
import IntegrationMarquee from '@/components/IntegrationMarquee';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0B] flex flex-col items-center overflow-x-hidden pt-24 pb-20">
      
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-12 mb-20 relative">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6366F1]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8B5CF6]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex-1 flex flex-col items-start z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981] text-sm font-medium mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            Zero-UI Background Utility
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-100 mb-6 leading-[1.1]">
            Sell anywhere.<br/>
            <span className="text-gradient">Oversell nowhere.</span>
          </h1>
          
          <p className="text-xl text-zinc-400 mb-10 leading-relaxed max-w-lg">
            The invisible engine that syncs your Shopify, Etsy, and eBay inventory in milliseconds. Stop apologizing for double-sales.
          </p>

          <Link
            href="/dashboard"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-medium text-white bg-[#6366F1] hover:bg-[#4f52e2] transition-colors duration-300 rounded-xl overflow-hidden shadow-[0_0_30px_-5px_var(--color-indigo-core)]"
          >
            <span className="relative z-10 font-medium">Start Syncing for $9.99/mo</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="flex-1 w-full max-w-[600px] z-10 mt-10 lg:mt-0 lg:ml-8 perspective-1000">
          <ProductShowcase />
        </div>
      </section>

      {/* Integration Marquee */}
      <IntegrationMarquee />

      {/* Bento Grid Features */}
      <BentoGrid />

    </main>
  );
}
