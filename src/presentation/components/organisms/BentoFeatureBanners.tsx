import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

export const BentoFeatureBanners: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8" aria-label="Featured Department Banners">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Banner 1: Home & Garden Essentials */}
        <Link
          href="/products?category=Home+%26+Garden"
          className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#EAF5ED] to-[#E2F2E6] border border-emerald-100/90 p-6 sm:p-7 flex flex-row items-center justify-between gap-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
        >
          {/* Left Text Column */}
          <div className="space-y-2 z-10 max-w-[210px] sm:max-w-[240px]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider shadow-2xs border border-emerald-100">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Home & Garden</span>
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Cozy Living
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-600 leading-snug">
              Gardening tools, indoor planters, and kitchenware essentials.
            </p>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#004D40] group-hover:text-[#EA580C] transition-colors">
                <span>Shop Home & Garden</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>

          {/* Right Real Photography: Gardening & Planters */}
          <div className="relative w-44 sm:w-56 md:w-60 h-28 sm:h-32 rounded-xl overflow-hidden shadow-xs border border-white/90 shrink-0">
            <Image
              src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80"
              alt="Gardening tools, indoor plants and planters"
              fill
              sizes="(max-width: 640px) 180px, 240px"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              decoding="async"
            />
          </div>
        </Link>

        {/* Banner 2: Smart Gadgets & Audio */}
        <Link
          href="/products?category=Smart+Gadgets+%26+Audio"
          className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#FDF4EB] to-[#FAEDE0] border border-orange-100/90 p-6 sm:p-7 flex flex-row items-center justify-between gap-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
        >
          {/* Left Text Column */}
          <div className="space-y-2 z-10 max-w-[210px] sm:max-w-[240px]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 text-orange-800 text-[10px] font-extrabold uppercase tracking-wider shadow-2xs border border-orange-100">
              <Sparkles className="w-3 h-3 text-orange-600" />
              <span>Audio & Tech</span>
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Smart Gadgets
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-snug">
              Wireless earbuds, streaming lapel mics, and smart daily accessories.
            </p>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#EA580C] transition-colors">
                <span>Shop Smart Gadgets</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>

          {/* Right Real Photography: Wireless Earbuds & Gadgets */}
          <div className="relative w-44 sm:w-56 md:w-60 h-28 sm:h-32 rounded-xl overflow-hidden shadow-xs border border-white/90 shrink-0">
            <Image
              src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80"
              alt="Wireless earbuds and smart tech accessories"
              fill
              sizes="(max-width: 640px) 180px, 240px"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              decoding="async"
            />
          </div>
        </Link>
      </div>
    </section>
  );
};
