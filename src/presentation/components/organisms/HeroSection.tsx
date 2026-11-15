import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MessageCircle, Truck, CheckCircle2, ShieldCheck } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#FBF8F3] border-b border-stone-200/70"
      aria-label="Home, Garden and Smart Gadgets Hero"
    >
      {/* 1. Full-Bleed Studio Master Photography (1774x887 Home, Garden & Gadgets) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
        <Image
          src="/nookmint_images/hero.png"
          alt="NookMint Home and Garden Essentials with Smart Audio Gadgets, Earbuds, and Ambient Lanterns"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[78%_center] sm:object-[76%_center] md:object-[74%_center] lg:object-[82%_center] xl:object-right-center"
        />

        {/* Studio Soft-Light Left & Mobile Top Gradient Mask for 100% Contrast & Legibility */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#FBF8F3]/95 via-[#FBF8F3]/88 to-[#FBF8F3]/40 sm:bg-gradient-to-r sm:from-[#FBF8F3] sm:via-[#FBF8F3]/90 sm:to-transparent w-full sm:w-[68%] lg:w-[60%]"
          aria-hidden="true"
        />

        {/* Subtle Top & Bottom Feathered Edges */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#FBF8F3]/90 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-[#FBF8F3]/60 to-transparent" />
      </div>

      {/* 2. Content Layer: Positioned on Left Clean Studio Space */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10 md:py-12 lg:py-14 min-h-[440px] sm:min-h-[500px] lg:min-h-[530px] flex items-center">
        <div className="max-w-xl lg:max-w-2xl space-y-3.5 sm:space-y-4 text-left">

          {/* Quality & Islandwide COD Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-xs border border-emerald-200/80 shadow-2xs text-[#004D40] text-[11px] sm:text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Islandwide Cash on Delivery • 2-4 Days Doorstep Delivery</span>
          </div>

          {/* Clean 2-Line Headline for Optimal Screen Fit & Typographic Balance on Mobile & Desktop */}
          <h1 className="text-[28px] sm:text-[38px] md:text-[46px] lg:text-[52px] font-black tracking-tight leading-[1.12] sm:leading-[1.08] text-[#111827] font-sans">
            <span>Cozy Home, Garden &amp;</span>
            <br />
            <span className="relative inline-block text-[#004D40]">
              Smart Tech Gadgets
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-[#F59E0B]"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M2,15 Q50,2 98,13" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          {/* Subhead specifically tuned to user's exact inventory */}
          <p className="text-xs sm:text-sm md:text-base text-slate-700 max-w-lg leading-relaxed font-normal">
            Quality kitchenware, home decor, gardening tools, and smart audio gadgets like earbuds &amp; wireless mics - delivered straight to your doorstep with 100% Cash on Delivery across Sri Lanka.
          </p>

          {/* Action CTA Buttons (Responsive on Mobile) */}
          <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-sm sm:text-base rounded-xl shadow-md shadow-orange-500/25 transition-all hover:scale-102 active:scale-98 text-center"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
            </Link>

            <a
              href="https://wa.me/94714897262?text=Hello%20NookMint%2C%20I%20would%20like%20to%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-white/95 hover:bg-white text-slate-800 hover:text-[#004D40] border border-slate-200/90 font-bold text-xs sm:text-sm rounded-xl shadow-2xs hover:shadow-xs transition-all active:scale-98 text-center"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Order via WhatsApp</span>
            </a>
          </div>

          {/* Below Buttons COD & Delivery Micro Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-6 text-[11px] sm:text-xs text-slate-700 font-bold">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#004D40] shrink-0" />
              <span>Islandwide Delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#004D40] shrink-0" />
              <span>Cash on Delivery (COD)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#004D40] shrink-0" />
              <span>Quality Verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
