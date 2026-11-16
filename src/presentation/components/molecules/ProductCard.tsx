'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/core/entities/Product';
import { formatLKR } from '@/shared/utils/currency';
import { useCart } from '@/presentation/context/CartContext';
import { ShoppingCart, Check, MessageSquare, Ban, MessageCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

// High-resolution studio photography fallbacks (zero blur, ultra sharp)
const LOCAL_FALLBACKS: Record<string, string> = {
  'pop-03': '/images1/pexels-ron-lach-10557898.jpg',
  'pop-04': '/images1/pexels-theo-cold-814199886-34005929.jpg',
  'pop-05': '/images1/pexels-ron-lach-10388755.jpg',
  'new-02': '/images1/pexels-vlada-karpovich-3958200.jpg',
  'new-04': '/images1/pexels-izafi-38539045.jpg',
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const initialImg =
    product.images?.[0] ||
    LOCAL_FALLBACKS[product.id] ||
    '/nookmint_images/hero.png';
  const [imgSrc, setImgSrc] = useState<string>(initialImg);

  const totalStock = product.variants && product.variants.length > 0
    ? product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
    : 10;
  const isOutOfStock = totalStock <= 0 && !product.inquiryOnly;

  const selectedSize = product.variants?.[0]?.size || 'Standard';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, selectedSize, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const whatsappInquiryUrl = `https://wa.me/94714897262?text=${encodeURIComponent(
    `Hello! I would like to order: ${product.title} (${formatLKR(product.sellingPrice)})`
  )}`;

  return (
    <div className={`group relative flex flex-col h-full bg-white rounded-2xl sm:rounded-3xl overflow-hidden border transition-all duration-300 transform-gpu will-change-transform ${
      isOutOfStock
        ? 'border-slate-200/70 shadow-2xs'
        : 'border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300'
    }`}>
      {/* 1. Image Frame Area with Responsive Aspect Ratio & Badges */}
      <div className="relative aspect-[4/3] w-full bg-[#FAF6F3] p-2.5 sm:p-3 flex items-center justify-center overflow-hidden">
        {/* Badges on Top Left */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {product.isNewArrival && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-wider shadow-2xs">
              ★ New
            </span>
          )}
          {product.offerPercentage && product.offerPercentage > 0 && !isOutOfStock && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-700 text-white font-extrabold text-[9px] sm:text-[10px] tracking-wide shadow-2xs">
              {product.offerPercentage}% OFF
            </span>
          )}
        </div>

        {/* HCI Out of Stock Signifier Badge on Top Right */}
        {isOutOfStock && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1.5 border border-white/20 backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>Out of Stock</span>
            </span>
          </div>
        )}

        <Link
          href={`/products/${product.id}`}
          className="relative block w-full h-full rounded-xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B]"
          aria-label={`View details for ${product.title}`}
        >
          <Image
            src={imgSrc}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover object-center transition-transform duration-500 ease-out ${
              isOutOfStock
                ? 'opacity-65 grayscale-[35%]'
                : 'group-hover:scale-105'
            }`}
            loading="lazy"
            decoding="async"
            unoptimized={imgSrc.startsWith('http') && !imgSrc.includes('unsplash.com') && !imgSrc.includes('supabase.co')}
            onError={() => {
              const fallback = LOCAL_FALLBACKS[product.id] || '/nookmint_images/hero.png';
              if (imgSrc !== fallback) {
                setImgSrc(fallback);
              }
            }}
          />
        </Link>
      </div>

      {/* 2. Content & Pricing Details with Consistent Vertical Alignment */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div className="space-y-1">
          {/* Subcategory / Department */}
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider line-clamp-1">
            {product.subcategory || product.category}
          </span>

          {/* Product Title (2-line clamp with min-height for equal row height across grid) */}
          <Link href={`/products/${product.id}`} className="block group-hover:text-[#064E3B] transition-colors">
            <h3
              className="font-bold text-xs sm:text-[13px] text-slate-900 leading-snug line-clamp-2 min-h-[34px] sm:min-h-[38px]"
              title={product.title}
            >
              {product.title}
            </h3>
          </Link>

          {/* Pricing format & Stock Status Badge */}
          <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className={`font-black text-sm sm:text-base tracking-tight font-serif ${isOutOfStock ? 'text-slate-500' : 'text-slate-900'}`}>
                {formatLKR(product.sellingPrice)}
              </span>
              {product.mrp && product.mrp > product.sellingPrice && (
                <span className="text-[11px] text-slate-400 line-through font-mono">
                  {formatLKR(product.mrp)}
                </span>
              )}
            </div>

            {isOutOfStock && (
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                Sold Out
              </span>
            )}
          </div>
        </div>

        {/* 3. Action Button: Full-width in Deep Forest Green #064E3B or Out of Stock with Restock Inquiry */}
        <div className="pt-1">
          {product.inquiryOnly ? (
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Inquire via WhatsApp</span>
            </a>
          ) : isOutOfStock ? (
            <div className="w-full flex items-center gap-1.5">
              <button
                type="button"
                disabled
                className="flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-3 bg-slate-100 text-slate-400 font-extrabold text-xs rounded-xl border border-slate-200 cursor-not-allowed select-none"
                aria-label={`${product.title} is currently out of stock`}
              >
                <Ban className="w-3.5 h-3.5 text-slate-400" />
                <span>Out of Stock</span>
              </button>
              <a
                href={`https://wa.me/94714897262?text=${encodeURIComponent(`Hello NookMint! 👋\nCould you please let me know when "${product.title}" will be back in stock?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Inquire restock on WhatsApp"
                className="p-2 sm:py-2.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#064E3B] border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                aria-label="Inquire restock on WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
              </a>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={`Add ${product.title} to cart`}
              className={`w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-2xs ${
                isAdded
                  ? 'bg-emerald-700 text-white shadow-emerald-200'
                  : 'bg-[#064E3B] hover:bg-[#04382A] text-white hover:shadow-xs active:scale-98'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
