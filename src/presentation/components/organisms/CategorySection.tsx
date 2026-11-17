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
      id: 'kitchen',
      name: 'Kitchen & Dining',
      badge: 'Daily Essentials',
      subtitle: 'Cookware, slicers, utensils, and food prep.',
      href: '/products?category=Kitchen+%26+Dining',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
      alt: 'Kitchen cookware, tools, and food prep items',
    },
    {
      id: 'gadgets',
      name: 'Smart Gadgets & Audio',
      badge: 'Trending Tech',
      subtitle: 'AirPods, earbuds, kids watches, and LED torches.',
      href: '/products?category=Smart+Gadgets+%26+Audio',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
      alt: 'AirPods, wireless earpods, kids watches, and gadgets',
    },
    {
      id: 'home',
      name: 'Home & Living',
      badge: 'Home Utilities',
      subtitle: 'Organizers, emergency lights, and daily essentials.',
      href: '/products?category=Home+%26+Living',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
      alt: 'Home storage organizers, daily essentials, and lighting',
    },
    {
      id: 'garden',
      name: 'Home & Garden',
      badge: 'Garden Tools',
      subtitle: 'Hand trowels, planters, shears, and supplies.',
      href: '/products?category=Home+%26+Garden',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80',
      alt: 'Gardening hand tools, planters, and pots',
    },
    {
      id: 'vehicle',
      name: 'Car & Vehicle Accessories',
      badge: 'Auto Gadgets',
      subtitle: 'Car mounts, fast chargers, inflators, and tools.',
      href: '/products?category=Car+%26+Vehicle+Accessories',
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
      alt: 'Car gadgets, wireless chargers, and auto accessories',
    },
    {
      id: 'beauty',
      name: 'Beauty & Personal Care',
      badge: 'Cosmetics & Care',
      subtitle: 'Makeup sets, cosmetic brush kits, and stylers.',
      href: '/products?category=Beauty+%26+Personal+Care',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80',
      alt: 'Women makeup sets, brushes, and personal care',
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
