import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export const MidPageCalloutBanner: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4" aria-label="Browse all categories callout">
      <div className="relative rounded-2xl overflow-hidden bg-[#004D40] text-white px-6 py-5 sm:px-8 sm:py-6 lg:px-10 lg:py-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
          {/* Left Text & CTA matching Reference Design */}
          <div className="md:col-span-7 space-y-2.5 sm:space-y-3 text-center md:text-left">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
              Find what you need, faster.
            </h2>

            <p className="text-xs sm:text-[13.5px] text-emerald-100/90 max-w-lg mx-auto md:mx-0 leading-relaxed font-normal">
              Explore household essentials, gardening supplies, and smart audio gadgets delivered islandwide with Cash on Delivery.
            </p>

            <div className="pt-1 flex justify-center md:justify-start">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all hover:scale-101 active:scale-98"
              >
                <span>Browse All Products</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>

          {/* Right Image Visual - Compact, proportional frame fitting the height */}
          <div className="md:col-span-5 relative w-full h-36 sm:h-40 md:h-44 lg:h-48 rounded-xl overflow-hidden shadow-sm">
            <Image
              src="/nookmint_images/hero.png"
              alt="NookMint household essentials, kitchenware, and smart tech gadgets"
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover object-center"
              unoptimized
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
