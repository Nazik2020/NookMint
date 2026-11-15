import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RotateCcw, ShieldCheck, MessageCircle, CheckCircle2, ArrowRight, Package, Clock, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Returns, Replacements & Verification Policy | NookMint',
  description: 'Hassle-free return and replacement policy across Sri Lanka with doorstep courier service and direct WhatsApp support.',
};

export default function ReturnsPage() {
  return (
    <div className="space-y-12 sm:space-y-16 py-10 sm:py-16 bg-slate-50/50">
      {/* 1. Header with Visual Studio Split */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 p-8 sm:p-12 space-y-4">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#064E3B] bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200/80 inline-block">
              CUSTOMER SATISFACTION PROMISE
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Returns, Exchanges & Replacements Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              We stand behind the quality of every product we dispatch. If an item arrives damaged, does not match specifications, or requires an exchange, our support desk coordinates prompt replacement.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/94714897262?text=Hello%20NookMint!%20I%20would%20like%20to%20request%20an%20exchange%20or%20return%20for%20my%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-98"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Request WhatsApp Support</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative h-64 sm:h-80 lg:h-full min-h-[300px] bg-slate-100">
            <Image
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80"
              alt="NookMint order support"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 3 Step Exchange Process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <span className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#064E3B] font-black text-sm flex items-center justify-center font-sans border border-emerald-200/60">
              1
            </span>
            <h3 className="font-serif font-black text-base text-slate-900">Notify Us on WhatsApp</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Send a quick message to our team at <strong>+94 71 489 7262</strong> with your Order Number (e.g. NM-2026-XXXX) and issue details.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <span className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#064E3B] font-black text-sm flex items-center justify-center font-sans border border-emerald-200/60">
              2
            </span>
            <h3 className="font-serif font-black text-base text-slate-900">Doorstep Courier Swap</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our courier arrives with the replacement item and collects the return parcel directly from your doorstep across Sri Lanka.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <span className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#064E3B] font-black text-sm flex items-center justify-center font-sans border border-emerald-200/60">
              3
            </span>
            <h3 className="font-serif font-black text-base text-slate-900">100% Quality Guaranteed</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your item is verified and backed by NookMint&apos;s customer assurance and prompt replacement support.
            </p>
          </div>
        </div>

        {/* Eligibility Checklist */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="font-serif font-black text-lg text-slate-900 border-b border-slate-100 pb-3">
            Replacement Guidelines
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Products must include original box and accessories</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Notify within 7 days of doorstep parcel delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Doorstep courier pickup available for all 25 Sri Lankan districts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Cash on Delivery items eligible for replacement</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}