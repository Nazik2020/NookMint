import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Layers, ShieldCheck, Truck, ArrowRight, CheckCircle2, MessageSquare, Building2, Store } from 'lucide-react';

export const metadata = {
  title: 'About Us | NookMint • Home, Kitchen, Garden & Smart Gadgets',
  description: 'Learn about NookMint - Sri Lanka’s premier store for cozy household essentials, durable kitchenware, gardening supplies, and smart audio gadgets with 100% islandwide Cash on Delivery (COD).',
};

export default function AboutPage() {
  return (
    <div className="space-y-16 sm:space-y-24 py-10 sm:py-16 bg-[#FAF6F3]/50">
      {/* 1. Hero Editorial Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#064E3B]">
              <Layers className="w-3.5 h-3.5" />
              <span>Cozy Living • Curated For Sri Lanka</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.12] font-serif">
              Cozy Home, Kitchen & Smart Gadgets Store
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              NookMint is your authentic destination for high-quality everyday essentials across Sri Lanka. We handpick durable cookware, ergonomic gardening tools, ambient home accents, and smart audio gadgets like earbuds and wireless lapel mics — delivered directly to your doorstep with 100% verified Cash on Delivery (COD).
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% Cash on Delivery (COD)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Prompt WhatsApp Confirmation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>25 Districts Islandwide Delivery</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#064E3B] hover:bg-[#04382A] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-950/20 active:scale-98"
              >
                <span>Browse Catalogue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                <span>Contact Team</span>
              </Link>
            </div>
          </div>

          {/* Right Studio Image Column */}
          <div className="lg:col-span-5 relative h-80 sm:h-96 lg:h-full min-h-[420px] bg-slate-100">
            <Image
              src="/nookmint_images/hero.png"
              alt="NookMint Home and Garden Essentials with Smart Gadgets"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg text-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#064E3B] flex items-center justify-center font-bold shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#064E3B] block">Authentic Quality</span>
                  <p className="text-xs font-bold text-slate-900">Verified Kitchen, Garden & Audio Tech</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Three Pillar Value Props */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#064E3B] flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg font-serif">Curated Departments</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Order durable non-stick kitchenware, precision gardening shears, home organizers, and smart wireless audio earbuds all in one place.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#064E3B] flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg font-serif">Doorstep COD Nationwide</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Serving all 25 districts across Sri Lanka with transparent delivery zone rates and 100% doorstep cash payment.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#064E3B] flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg font-serif">Direct WhatsApp Support</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instant order confirmations, fast status tracking updates, and dedicated customer support via WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
