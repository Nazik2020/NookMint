'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

export const getCategoryImage = (categoryName: string): string => {
  const lower = categoryName.toLowerCase();
  if (lower.includes('kitchen') || lower.includes('dining') || lower.includes('cookware')) {
    return '/nookmint_images/kitchen and dining.png';
  }
  if (lower.includes('gadget') || lower.includes('audio') || lower.includes('earbud') || lower.includes('tech')) {
    return '/nookmint_images/smart gadgets.png';
  }
  if (lower.includes('kid') || lower.includes('baby') || lower.includes('toy')) {
    return '/nookmint_images/kids baby toys.png';
  }
  if (lower.includes('garden') || lower.includes('plant') || lower.includes('trowel')) {
    return '/nookmint_images/home and garden.png';
  }
  if (lower.includes('living') || lower.includes('house') || lower.includes('home')) {
    return '/nookmint_images/home and living.png';
  }
  if (lower.includes('car') || lower.includes('vehicle') || lower.includes('auto')) {
    return '/nookmint_images/car and vehicle.png';
  }
  if (lower.includes('beauty') || lower.includes('makeup') || lower.includes('cosmetic') || lower.includes('persenal') || lower.includes('personal')) {
    return '/nookmint_images/beauty and persenal care.png';
  }
  return '/nookmint_images/home and living.png';
};

export const CategorySection: React.FC = () => {
  const categories = [
    {
      id: 'kitchen',
      name: 'Kitchen & Dining',
      badge: 'Daily Essentials',
      subtitle: 'Cookware, slicers, utensils, and food prep.',
      href: '/products?category=Kitchen+%26+Dining',
      image: '/nookmint_images/kitchen and dining.png',
      alt: 'Kitchen cookware, tools, and food prep items',
    },
    {
      id: 'gadgets',
      name: 'Smart Gadgets & Audio',
      badge: 'Trending Tech',
      subtitle: 'AirPods, earbuds, lapel mics, and torches.',
      href: '/products?category=Smart+Gadgets+%26+Audio',
      image: '/nookmint_images/smart gadgets.png',
      alt: 'AirPods, wireless earpods, and tech gadgets',
    },
    {
      id: 'kids',
      name: 'Kids, Baby & Toys',
      badge: 'Kids Collection',
      subtitle: 'Smartwatches, learning tablets, bottles, and toys.',
      href: '/products?category=Kids%2C+Baby+%26+Toys',
      image: '/nookmint_images/kids baby toys.png',
      alt: 'Kids watches, baby care, and learning toys',
    },
    {
      id: 'home',
      name: 'Home & Living',
      badge: 'Home Utilities',
      subtitle: 'Organizers, emergency lights, and daily essentials.',
      href: '/products?category=Home+%26+Living',
      image: '/nookmint_images/home and living.png',
      alt: 'Home storage organizers, daily essentials, and lighting',
    },
    {
      id: 'garden',
      name: 'Home & Garden',
      badge: 'Garden Tools',
      subtitle: 'Hand trowels, planters, shears, and supplies.',
      href: '/products?category=Home+%26+Garden',
      image: '/nookmint_images/home and garden.png',
      alt: 'Gardening hand tools, planters, and pots',
    },
    {
      id: 'vehicle',
      name: 'Car & Vehicle Accessories',
      badge: 'Auto Gadgets',
      subtitle: 'Car mounts, fast chargers, inflators, and tools.',
      href: '/products?category=Car+%26+Vehicle+Accessories',
      image: '/nookmint_images/car and vehicle.png',
      alt: 'Car gadgets, wireless chargers, and auto accessories',
    },
    {
      id: 'beauty',
      name: 'Beauty & Personal Care',
      badge: 'Cosmetics & Care',
      subtitle: 'Makeup sets, cosmetic brush kits, and stylers.',
      href: '/products?category=Beauty+%26+Personal+Care',
      image: '/nookmint_images/beauty and persenal care.png',
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
