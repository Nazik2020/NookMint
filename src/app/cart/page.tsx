'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/presentation/context/CartContext';
import { PriceTag } from '@/presentation/components/atoms/PriceTag';
import { formatLKR } from '@/shared/utils/currency';
import { COD_RULES } from '@/core/constants/CodRules';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Banknote, ShieldCheck, CheckCircle2, Truck } from 'lucide-react';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, summary } = useCart();
  const [storeSettings, setStoreSettings] = React.useState<any | null>(null);

  React.useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setStoreSettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 sm:py-28 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-[#064E3B] flex items-center justify-center mx-auto border border-emerald-100 shadow-2xs">
          <ShoppingBag className="w-10 h-10 stroke-[1.7]" />
        </div>
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#064E3B] block">
            YOUR BAG IS CURRENTLY EMPTY
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-sans tracking-tight">
            Ready to Stock Up on Essentials?
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Explore our curated catalogue for household essentials, kitchenware, gardening tools, and smart audio gadgets.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-500/20 hover:scale-102 active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]"
          >
            <span>Explore All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const codMin = storeSettings?.delivery?.codMinOrder ?? COD_RULES.MIN_ORDER_AMOUNT;
  const codMax = storeSettings?.delivery?.codMaxOrder ?? COD_RULES.MAX_ORDER_AMOUNT;
  const isCodEligible = summary.subtotal >= codMin && summary.subtotal <= codMax;
  const freeShippingThreshold = storeSettings?.delivery?.freeShippingThreshold ?? (summary.subtotal + summary.freeShippingGap || 5000);
  const freeShippingProgress = Math.min(100, Math.round((summary.subtotal / freeShippingThreshold) * 100));

  const hasDropship = items.some((item) => (item.product.sourceType || 'dropship') === 'dropship');
  const cartTotalPayable = hasDropship ? summary.subtotal : summary.grandTotal;

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-12 space-y-5 sm:space-y-8">
      {/* Page Header */}
      <div className="space-y-1.5 border-b border-slate-200/80 pb-4">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[#064E3B] block">
          REVIEW YOUR SELECTION
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Shopping Cart ({summary.itemsCount} {summary.itemsCount === 1 ? 'item' : 'items'})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Transparent COD & WhatsApp Invoicing Info Banner */}
          <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs flex flex-col xs:flex-row sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-950">
              <Banknote className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>100% Cash on Delivery Across Sri Lanka</span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0 self-start xs:self-auto sm:self-auto">
              Zero Advance Required
            </span>
          </div>

          {/* Items Container */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
            {items.map((item) => {
              const matchedVariant = item.product.variants?.find((v) => v.size === item.selectedSize);
              const displayImage = matchedVariant?.image || item.product.images[0] || '/nookmint_images/hero.png';

              return (
              <div
                key={`${item.product.id}-${item.selectedSize}`}
                className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center justify-between transition-colors hover:bg-slate-50/40"
              >
                <div className="flex gap-3.5 sm:gap-4 items-start sm:items-center flex-1 min-w-0 w-full">
                  {/* Next.js Optimized Image Frame */}
                  <Link
                    href={`/products/${item.product.id}`}
                    className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden bg-slate-50 shrink-0 group border border-slate-200/60"
                  >
                    <Image
                      src={displayImage}
                      alt={`${item.product.title} - ${item.selectedSize}`}
                      fill
                      sizes="(max-width: 640px) 80px, 96px"
                      unoptimized={displayImage?.startsWith('http') && !displayImage?.includes('unsplash.com') && !displayImage?.includes('supabase.co')}
                      className="object-cover object-center group-hover:scale-104 transition-transform duration-300"
                    />
                  </Link>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {item.selectedSize}
                      </span>
                      {item.product.isCodAvailable && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          COD Available
                        </span>
                      )}
                    </div>
                    <Link href={`/products/${item.product.id}`} className="block">
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-[#064E3B] transition-colors leading-snug">
                        {item.product.title}
                      </h3>
                    </Link>
                    {item.product.brand && (
                      <p className="text-xs text-slate-500 truncate">{item.product.brand}</p>
                    )}
                    <PriceTag sellingPrice={item.product.sellingPrice} mrp={item.product.mrp} size="sm" />
                  </div>
                </div>

                {/* Quantity and Actions: Full-width responsive layout on mobile */}
                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="sm:hidden text-xs text-slate-500 font-medium">
                    Item Total: <strong className="text-slate-900 font-bold">{formatLKR(item.product.sellingPrice * item.quantity)}</strong>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
                        className="w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-center hover:bg-slate-200/70 text-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#064E3B]"
                        title="Decrease quantity"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-extrabold text-slate-900">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
                        className="w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-center hover:bg-slate-200/70 text-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#064E3B]"
                        title="Increase quantity"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                      className="w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors rounded-xl hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                      title="Remove item"
                      aria-label={`Remove ${item.product.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>

          {/* Continue Shopping Link: Stack cleanly on mobile */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2 sm:items-center justify-between text-xs text-center sm:text-left">
            <Link
              href="/products"
              className="font-bold text-slate-600 hover:text-[#064E3B] inline-flex items-center justify-center sm:justify-start gap-1.5 transition-colors"
            >
              <span>← Continue Shopping Catalogue</span>
            </Link>
            <span className="text-slate-400">All prices in Sri Lankan Rupees (LKR)</span>
          </div>
        </div>

        {/* Order Summary & COD Banner */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4.5 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <h2 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal ({summary.itemsCount} items)</span>
                <span className="font-bold text-slate-900">{formatLKR(summary.subtotal)}</span>
              </div>
              {summary.discount > 0 && (
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Savings</span>
                  <span className="text-emerald-700 font-bold">-{formatLKR(summary.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 font-medium items-center">
                <span>Courier Delivery</span>
                <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
                  Invoiced on WhatsApp
                </span>
              </div>
            </div>

            {/* Dropship WhatsApp Invoice Notice */}
            {hasDropship && (
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <span className="font-bold block">💡 Delivery Fee Notice:</span>
                <p className="leading-relaxed">
                  Only product price is charged here ({formatLKR(summary.subtotal)}). Courier delivery fee will be calculated based on your city and sent on your official WhatsApp invoice before courier dispatch.
                </p>
              </div>
            )}

            {/* COD Status Pill */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>Doorstep Cash on Delivery (COD)</span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                {isCodEligible
                  ? 'Pay cash upon delivery directly to our courier partner across all 25 districts.'
                  : `Minimum order for COD is ${formatLKR(codMin)}.`}
              </p>
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-bold text-slate-900">Total Payable:</span>
                {hasDropship && <p className="text-[10px] text-slate-500 font-medium">Product price only</p>}
              </div>
              <span className="text-2xl font-black text-[#064E3B]">{formatLKR(cartTotalPayable)}</span>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all hover:scale-101 active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>256-Bit SSL Encrypted & Doorstep Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
