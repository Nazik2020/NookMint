import React from 'react';
import { PromoBannerCard } from '@/presentation/components/molecules/PromoBannerCard';

export const PromoBannersSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Promotions and seasonal offers">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {/* Banner 1: Household & Kitchen */}
        <PromoBannerCard
          tag="KITCHEN ESSENTIALS"
          tagColor="text-emerald-800"
          title={<>Silicone Utensils & <br />Airtight Food Storage</>}
          btnText="SHOP KITCHEN"
          btnHref="/products?category=Household+%26+Kitchen"
          btnBg="bg-[#064E3B]"
          btnHoverBg="hover:bg-[#04382A]"
          bgColor="bg-emerald-50/70"
          image="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80"
          imageAlt="Household & Kitchen Essentials"
          imagePosition="right"
        />

        {/* Banner 2: Home & Garden */}
        <PromoBannerCard
          tag="HOME & GARDEN"
          tagColor="text-emerald-800"
          title={<>SK5 Pruning Shears & <br />Indoor Herb Planters</>}
          btnText="EXPLORE GARDEN"
          btnHref="/products?category=Home+%26+Garden"
          btnBg="bg-[#064E3B]"
          btnHoverBg="hover:bg-[#04382A]"
          bgColor="bg-emerald-50/70"
          image="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop&q=80"
          imageAlt="Home & Garden Supplies"
          imagePosition="right"
        />

        {/* Banner 3: Smart Audio & Tech Gadgets */}
        <PromoBannerCard
          tag="SMART TECH & AUDIO"
          tagColor="text-amber-800"
          title={<>ANC Wireless Earbuds & <br />Lavalier Lapel Mics</>}
          badge="100% Cash on Delivery"
          btnText="VIEW SMART TECH"
          btnHref="/products?category=Smart+Gadgets+%26+Audio"
          btnBg="bg-[#064E3B]"
          btnHoverBg="hover:bg-[#04382A]"
          bgColor="bg-amber-50/70"
          image="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80"
          imageAlt="Smart Audio Gadgets & Earbuds"
          imagePosition="right"
        />
      </div>
    </section>
  );
};
