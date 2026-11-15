'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

export const getCategoryImage = (categoryName: string): string => {
  const lower = categoryName.toLowerCase();
  if (lower.includes('grocer') || lower.includes('food') || lower.includes('rice') || lower.includes('tea')) {
    return '/images/optimized/cat-groceries-opt.jpg';
  }
  if (lower.includes('house') || lower.includes('kitchen') || lower.includes('home') || lower.includes('cleaning')) {
    return '/images/optimized/cat-household-opt.jpg';
  }
  if (lower.includes('cloth') || lower.includes('fashion') || lower.includes('apparel') || lower.includes('shirt')) {
    return '/images/optimized/cat-fashion-opt.jpg';
  }
  return '/images/optimized/cat-groceries-opt.jpg';
};

export const CategorySection: React.FC = () => {
  const categories = [
    {
      id: 'household',
      name: 'Household & Kitchen',
      badge: '95+ Essentials',
      subtitle: 'Cookware, cleaning, and daily home items.',
      href: '/products?category=Household+%26+Kitchen',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
      alt: 'Kitchen cookware and household essentials',
    },
    {
      id: 'garden',
      name: 'Home & Garden',
      badge: '60+ Garden Tools',
      subtitle: 'Hand trowels, planters, and garden supplies.',
      href: '/products?category=Home+%26+Garden',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80',
      alt: 'Gardening hand tools and pots',
    },
    {
      id: 'gadgets',
      name: 'Smart Gadgets & Audio',
      badge: 'Trending Tech',
      subtitle: 'Wireless earbuds, lapel mics, and smart gear.',
      href: '/products?category=Smart+Gadgets+%26+Audio',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
      alt: 'Wireless earpods, mics, and tech gadgets',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-7" aria-label="Shop by category">
      {/* Centered Section Header */}
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Shop by Category
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Explore our main categories and find what you need.
        </p>
      </div>

      {/* 3-Column Structured Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            className="group relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/70 hover:border-emerald-300/80 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            {/* Circular Avatar with Studio Ring Border */}
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden shrink-0 border-2 border-white ring-4 ring-slate-100 shadow-2xs group-hover:scale-104 transition-transform duration-300">
              <Image
                src={cat.image}
                alt={cat.alt}
                fill
                sizes="120px"
                className="object-cover object-center"
                unoptimized
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Department Details */}
            <div className="space-y-1 min-w-0 flex-1">
              <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-[#004D40] text-[10px] font-extrabold tracking-wide border border-emerald-100/60 mb-0.5">
                {cat.badge}
              </span>

              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-[#004D40] transition-colors truncate">
                {cat.name}
              </h3>

              <p className="text-xs text-slate-500 leading-snug line-clamp-1">
                {cat.subtitle}
              </p>

              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004D40] group-hover:text-[#EA580C] transition-colors">
                  <span>Explore category</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
