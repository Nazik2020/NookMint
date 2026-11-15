import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Headphones, Truck, ArrowRight } from 'lucide-react';

export const TrustFeaturesSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12" aria-label="Customer Guarantees">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Money Back Guarantee matching Reference Image 5 */}
        <div className="group rounded-[26px] bg-white border border-slate-200/90 p-7 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 shadow-2xs group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-7 h-7 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">
                Money Back Guarantee
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Enjoy a hassle-free shopping experience with our verified quality return guarantee.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/returns"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004D40] hover:text-[#EA580C] transition-colors"
            >
              <span>Explore More</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Card 2: 24/7 Customer Service (Hero Card in Deep Forest Teal matching Reference Image 5) */}
        <div className="group rounded-[26px] bg-[#004D40] text-white p-7 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 border border-emerald-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 text-emerald-200 flex items-center justify-center shrink-0 border border-white/20 shadow-2xs group-hover:scale-105 transition-transform">
              <Headphones className="w-7 h-7 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white tracking-tight">
                24/7 Customer Service
              </h3>
              <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
                Our team ensures you&apos;re never alone — reach out anytime on WhatsApp for prompt order care.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <a
              href="https://wa.me/94787844914?text=Hello%20NookMint%2C%20I%20have%20a%20question%20about%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white transition-colors"
            >
              <span>Explore More</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Card 3: Fast & Free Shipping matching Reference Image 5 */}
        <div className="group rounded-[26px] bg-white border border-slate-200/90 p-7 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 shadow-2xs group-hover:scale-105 transition-transform">
              <Truck className="w-7 h-7 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">
                Fast & Islandwide Shipping
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Prompt doorstep delivery across all 25 Sri Lankan districts with Cash on Delivery.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/delivery"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004D40] hover:text-[#EA580C] transition-colors"
            >
              <span>Explore More</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
