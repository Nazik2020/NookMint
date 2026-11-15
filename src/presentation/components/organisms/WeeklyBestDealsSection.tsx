'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, ArrowRight, Star } from 'lucide-react';
import { formatLKR } from '@/shared/utils/currency';
import { useCart } from '@/presentation/context/CartContext';

interface DealProduct {
  id: string;
  title: string;
  vendor: string;
  mrp: number;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  isActive?: boolean;
}

export const WeeklyBestDealsSection: React.FC = () => {
  const { addToCart } = useCart();
  const [activeFilter, setActiveFilter] = useState('Almost Sold out');

  // Live countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: '02',
    hours: '14',
    minutes: '35',
    seconds: '40',
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const seconds = String(59 - now.getSeconds()).padStart(2, '0');
      const minutes = String(59 - now.getMinutes()).padStart(2, '0');
      setTimeLeft((prev) => ({ ...prev, minutes, seconds }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    'Up to 90% off',
    'Under LKR 2,000',
    'Almost Sold out',
    'Beauty & Health',
    'Jewelry & Accessories',
    'Home & Kitchen',
    'Men\'s Clothing',
    'Sports & Outdoors',
  ];

  const dealsProducts: DealProduct[] = [
    {
      id: 'deal-watch-01',
      title: 'Horizon Pro AMOLED Smartwatch with Calling & GPS',
      vendor: 'Motion View',
      mrp: 6990,
      price: 4990,
      rating: 5,
      reviews: 28,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=85',
      category: 'Gadgets',
    },
    {
      id: 'deal-phone-01',
      title: 'Titanium Flagship Smartphone 256GB Natural Grey',
      vendor: 'Motion View',
      mrp: 210000,
      price: 189900,
      rating: 5,
      reviews: 45,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=85',
      category: 'Phones',
      isActive: true, // Displays prominent [Add to Cart] button matching Screenshot 3
    },
    {
      id: 'deal-shoe-01',
      title: 'Light-Up Aerodynamic Kids Sport Sneaker',
      vendor: 'ActiveWear',
      mrp: 7500,
      price: 5490,
      rating: 4.8,
      reviews: 19,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=85',
      category: 'Footwear',
    },
    {
      id: 'deal-phone-02',
      title: 'Ultra Slim Dual SIM 5G Smartphone Onyx Black',
      vendor: 'TechStore',
      mrp: 145000,
      price: 124900,
      rating: 4.9,
      reviews: 32,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=85',
      category: 'Phones',
    },
    {
      id: 'deal-laptop-01',
      title: 'Ultra Retina Pro Laptop 16" Intel Core i9 32GB',
      vendor: 'ProArt Studio',
      mrp: 320000,
      price: 289000,
      rating: 5,
      reviews: 58,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=85',
      category: 'Computers',
    },
  ];

  const handleAdd = (product: DealProduct) => {
    addToCart(
      {
        id: product.id,
        title: product.title,
        slug: product.id,
        description: product.title,
        category: product.category,
        brand: product.vendor,
        sellingPrice: product.price,
        mrp: product.mrp,
        isCodAvailable: true,
        images: [product.image],
        variants: [{ size: 'Standard', stock: 25, sku: product.id }],
        rating: product.rating,
        reviewCount: product.reviews,
      },
      'Standard',
      1
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12" aria-label="Weekly Best Deals">
      <div className="rounded-3xl bg-[#092B24] border border-emerald-900/60 p-6 sm:p-10 lg:p-12 text-white shadow-2xl space-y-8">
        {/* ============================================================ */}
        {/* TOP ROW: Heading & Live Countdown Badges matching Screenshot 3 */}
        {/* ============================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/40 pb-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Weekly Best Deals
          </h2>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-200">
            <span>Limited time only!</span>
            <div className="flex items-center gap-1.5 font-mono font-black">
              <span className="px-2 py-1 bg-[#EF4444] text-white rounded-md text-xs sm:text-sm shadow-xs">
                {timeLeft.days}
              </span>
              <span className="px-2 py-1 bg-[#EF4444] text-white rounded-md text-xs sm:text-sm shadow-xs">
                {timeLeft.hours}
              </span>
              <span className="px-2 py-1 bg-[#EF4444] text-white rounded-md text-xs sm:text-sm shadow-xs">
                {timeLeft.minutes}
              </span>
              <span className="px-2 py-1 bg-[#EF4444] text-white rounded-md text-xs sm:text-sm shadow-xs">
                {timeLeft.seconds}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CATEGORY FILTER PILLS matching Screenshot 3 */}
        {/* ============================================================ */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isActive = activeFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#EA580C] text-white shadow-md'
                    : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-800/40'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* 5-COLUMN PRODUCT CARDS GRID matching Screenshot 3 */}
        {/* ============================================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {dealsProducts.map((p) => (
            <div
              key={p.id}
              className="group relative bg-white text-slate-900 rounded-2xl overflow-hidden p-3.5 flex flex-col justify-between hover:shadow-xl transition-all duration-300 border border-slate-100"
            >
              {/* Card Top: Sale Badge + Wishlist Heart */}
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-full bg-[#EF4444] text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                  Sale
                </span>
                <button
                  type="button"
                  className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Product Packshot */}
              <div className="relative aspect-[4/3] w-full rounded-xl bg-slate-50/80 p-2 flex items-center justify-center overflow-hidden mb-3">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-contain object-center group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              </div>

              {/* Details */}
              <div className="space-y-1 text-left flex-1 flex flex-col justify-between">
                <div>
                  {/* Vendor tag with purple bullet */}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 inline-block"></span>
                    <span>{p.vendor}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug pt-1" title={p.title}>
                    {p.title}
                  </h3>
                </div>

                <div className="pt-2 space-y-2">
                  {/* Pricing */}
                  <div className="flex items-baseline gap-2">
                    <span className="font-black text-xs sm:text-sm text-slate-900">
                      {formatLKR(p.price)}
                    </span>
                    <span className="text-[10px] text-slate-400 line-through">
                      {formatLKR(p.mrp)}
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-[11px] text-amber-500">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-slate-400 text-[10px]">({p.reviews})</span>
                  </div>

                  {/* Action Button: Solid Teal on active card or hover */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleAdd(p)}
                      className="w-full py-2 px-3 rounded-lg font-bold text-xs bg-[#0F3E36] hover:bg-[#07241F] text-white flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer active:scale-98"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ============================================================ */}
        {/* BOTTOM 3 BENTO PROMO CARDS matching Screenshot 3 */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4">
          {/* Promo Card 1 (5 Cols): Fitness For Smart Special Offer */}
          <div className="md:col-span-5 rounded-3xl overflow-hidden bg-[#D8EEFD] text-slate-900 p-6 sm:p-7 flex flex-col justify-between relative min-h-[220px]">
            <div className="space-y-1.5 z-10 max-w-[220px] text-left">
              <span className="text-[11px] font-bold text-sky-700 tracking-wider uppercase block">
                — Gadget Collection
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                Fitness For Smart Special Offer
              </h3>
              <p className="text-[11px] text-slate-600 leading-snug">
                Dining, living, & desk areas serve their purposes
              </p>
              <div className="pt-2">
                <Link
                  href="/products?q=smartwatch"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0F3E36] hover:bg-[#07241F] text-white font-bold text-xs transition-colors shadow-2xs"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Smartwatches SVG graphic */}
            <div className="absolute right-0 bottom-0 w-48 sm:w-56 h-48 pointer-events-none">
              <Image
                src="/images/deals-smartwatches.svg"
                alt="Colorful smartwatches"
                fill
                className="object-contain object-bottom-right"
                unoptimized
              />
            </div>
          </div>

          {/* Promo Card 2 (4 Cols): Men's Fashion Offer */}
          <div className="md:col-span-4 rounded-3xl overflow-hidden bg-[#FEF3C7] text-slate-900 p-6 flex flex-col justify-between relative min-h-[220px]">
            <div className="space-y-1.5 z-10 max-w-[180px] text-left">
              <span className="text-[11px] font-bold text-amber-700 tracking-wider block">
                — Men's Fashion
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                Men's Fashion
              </h3>
              <p className="text-[11px] text-slate-700 font-semibold">
                Offer starts from <strong className="text-slate-900 font-bold">Rs. 2,490</strong>
              </p>
              <div className="pt-2">
                <Link
                  href="/products?category=Clothing+%26+Fashion"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs transition-colors shadow-2xs"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Photo of stylish male model */}
            <div className="absolute right-0 bottom-0 w-44 h-full pointer-events-none">
              <Image
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=85"
                alt="Stylish men's fashion model"
                fill
                className="object-cover object-top"
                unoptimized
              />
            </div>
          </div>

          {/* Promo Card 3 (3 Cols): Felly Fan Offer */}
          <div className="md:col-span-3 rounded-3xl overflow-hidden bg-[#E0F2FE] text-slate-900 p-6 flex flex-col justify-between relative min-h-[220px]">
            <div className="space-y-1.5 z-10 text-left">
              <span className="text-[11px] font-bold text-sky-700 tracking-wider block">
                Home Appliances
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                Felly Fan Offer
              </h3>
              <p className="text-[11px] text-slate-700 font-semibold">
                Offer starts from <strong className="text-slate-900 font-bold">Rs. 3,950</strong>
              </p>
              <div className="pt-2">
                <Link
                  href="/products?category=Household+%26+Daily+Items"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs transition-colors shadow-2xs"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Modern Gadget / Home appliance photo */}
            <div className="absolute right-0 bottom-0 w-36 h-36 pointer-events-none">
              <Image
                src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=85"
                alt="Desktop fan and cool appliance"
                fill
                className="object-contain object-bottom-right"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};