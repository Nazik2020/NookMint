'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/core/entities/Product';
import { useCart } from '@/presentation/context/CartContext';
import { SizeSelector } from '@/presentation/components/molecules/SizeSelector';
import { ProductGallery } from '@/presentation/components/molecules/ProductGallery';
import { PriceTag } from '@/presentation/components/atoms/PriceTag';
import { PaymentMethod } from '@/shared/types/common';
import {
  ShoppingBag,
  Check,
  ArrowRight,
  MessageCircle,
  Plus,
  Minus,
  Truck,
  RotateCcw,
  MapPin,
  Sparkles,
  ShieldCheck,
  Banknote,
  Loader2,
  Phone,
  User,
  Home,
  CheckCircle2,
  Zap,
  X,
  Share2,
  Copy,
  Mail,
  PartyPopper,
  PackageCheck,
} from 'lucide-react';
import { SRI_LANKA_DISTRICTS } from '@/core/constants/SriLankaDistricts';
import { formatLKR } from '@/shared/utils/currency';

function parseInlineFormatting(str: string) {
  if (!str) return null;
  const parts = str.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const cleaned = part.replace(/(?:^\s*#+\s*)|(?:\s*#+\s*$)/g, '').replace(/\*/g, '');
    return <span key={i}>{cleaned}</span>;
  });
}

function FormattedProductDescription({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split(/\r?\n/);

  return (
    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2 pt-0.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Markdown headings (#, ##, ###)
        const headingMatch = trimmed.match(/^#{1,4}\s+(.+)$/);
        if (headingMatch) {
          const headingText = headingMatch[1].replace(/\*\*/g, '').trim();
          return (
            <h3 key={idx} className="font-black text-slate-900 text-sm sm:text-base mt-3 mb-1 tracking-tight">
              {headingText}
            </h3>
          );
        }

        // Bullet point lines (- or * or •)
        const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
        if (bulletMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="text-emerald-600 font-bold mt-1 text-[9px] shrink-0">●</span>
              <span className="flex-1 leading-relaxed">{parseInlineFormatting(bulletMatch[1])}</span>
            </div>
          );
        }

        // Full line bold **Heading / Callout**
        const fullBoldMatch = trimmed.match(/^\*\*([^*]+)\*\*$/);
        if (fullBoldMatch) {
          return (
            <p key={idx} className="font-black text-slate-900 text-xs sm:text-sm my-1">
              {fullBoldMatch[1]}
            </p>
          );
        }

        return (
          <p key={idx} className="leading-relaxed">
            {parseInlineFormatting(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export const ProductDetailClient: React.FC<{ product: Product }> = ({ product }) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>(product.variants?.[0]?.size || 'Standard');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showCartToast, setShowCartToast] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Colombo');
  const [storeDelivery, setStoreDelivery] = useState<any>(null);

  // Fast COD Form State
  const fastCodFormRef = useRef<HTMLDivElement>(null);
  const [showFastCodForm, setShowFastCodForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Colombo 03');
  const [orderNote, setOrderNote] = useState('');
  const [isSubmittingCod, setIsSubmittingCod] = useState(false);
  const [codError, setCodError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<{
    orderId: string;
    orderNumber: string;
    customerName: string;
    productTitle: string;
    qty: number;
    total: number;
    whatsapp: string;
  } | null>(null);

  const currentVariant = product.variants?.find((v) => v.size === selectedSize) || product.variants?.[0] || {
    sku: product.id,
    size: 'Standard',
    stock: 10,
    price: product.sellingPrice,
  };

  // Always show the primary cover photo (product.images[0]) first when opening the product page
  const [activeImage, setActiveImage] = useState<string>(
    product.images?.[0] || currentVariant?.image || '/nookmint_images/hero.png'
  );

  // Track initial mount so cover image always shows first on page load
  const isInitialMount = useRef(true);

  // Whenever user explicitly changes selected variant / color, update the large gallery display to match that color
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (currentVariant?.image) {
      setActiveImage(currentVariant.image);
    }
  }, [currentVariant?.image, selectedSize]);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings?.delivery) {
          setStoreDelivery(data.settings.delivery);
        }
      })
      .catch(() => {});

    // Try loading saved address
    try {
      const saved = localStorage.getItem('innovative_saved_address');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone1(parsed.phone);
        if (parsed.alternatePhone) setPhone2(parsed.alternatePhone);
        if (parsed.addressLine1) setAddress(parsed.addressLine1);
        if (parsed.city) setCity(parsed.city);
        if (parsed.district) setSelectedDistrict(parsed.district);
      }
    } catch {
      // Ignore
    }
  }, []);

  const getProductDeliveryInfo = (district: string) => {
    if (product.deliveryFeeType === 'free') {
      return { fee: 0, isFree: true, text: 'FREE Nationwide', eta: '1 - 2 Business Days' };
    }
    if (product.deliveryFeeType === 'custom' && typeof product.customDeliveryFee === 'number') {
      return { fee: product.customDeliveryFee, isFree: false, text: formatLKR(product.customDeliveryFee), eta: '1 - 3 Business Days' };
    }
    if (storeDelivery?.districtRates && Array.isArray(storeDelivery.districtRates)) {
      const match = storeDelivery.districtRates.find((r: any) => r.districts?.includes(district) || r.districts?.includes('*'));
      if (match) {
        return { fee: match.fee, isFree: false, text: formatLKR(match.fee), eta: match.estimatedDays || '1-3 Business Days', groupName: match.name };
      }
    }
    if (district === 'Colombo') {
      return { fee: storeDelivery?.colomboFee || 350, isFree: false, text: formatLKR(storeDelivery?.colomboFee || 350), eta: 'Same-Day / 1 Day' };
    }
    if (district === 'Gampaha' || district === 'Kalutara') {
      return { fee: storeDelivery?.westernProvinceFee || 400, isFree: false, text: formatLKR(storeDelivery?.westernProvinceFee || 400), eta: '1 - 2 Business Days' };
    }
    return { fee: storeDelivery?.outstationFee || 500, isFree: false, text: formatLKR(storeDelivery?.outstationFee || 500), eta: '2 - 3 Business Days' };
  };

  const deliveryInfo = getProductDeliveryInfo(selectedDistrict);

  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    const matched = SRI_LANKA_DISTRICTS.find((d) => d.district === newDistrict);
    if (matched && matched.majorTowns.length > 0) {
      setCity(matched.majorTowns[0]);
    }
  };

  const stockCount = currentVariant ? (currentVariant.stock ?? 0) : 0;
  const isSizeOutOfStock = stockCount <= 0 && !product.inquiryOnly;

  const isDropship = (product.sourceType || 'dropship') === 'dropship';
  const currentDistrictObj = SRI_LANKA_DISTRICTS.find((d) => d.district === selectedDistrict);
  const itemTotal = product.sellingPrice * quantity;
  const totalPayable = isDropship ? itemTotal : itemTotal + deliveryInfo.fee;

  const handleAddToCart = () => {
    if (!selectedSize || stockCount <= 0 || product.inquiryOnly) return;
    addToCart(product, selectedSize, quantity);
    setIsAdded(true);
    setShowCartToast(true);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setIsAdded(false);
      setShowCartToast(false);
    }, 6000);
  };

  // Direct 1-Click Cash on Delivery Order Submission
  const handleFastCodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodError('');

    if (!fullName.trim() || !phone1.trim() || !address.trim() || !city.trim()) {
      setCodError('Please fill in your Name, Phone Number, and Delivery Address.');
      return;
    }

    const cleanPhone = phone1.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9 || cleanPhone.length > 12) {
      setCodError('Please enter a valid Sri Lankan mobile number (e.g. 0771234567).');
      return;
    }

    setIsSubmittingCod(true);

    try {
      const shippingAddress = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone1.trim(),
        alternatePhone: phone2.trim(),
        addressLine1: address.trim(),
        addressLine2: '',
        landmark: orderNote.trim(),
        city: city.trim(),
        district: selectedDistrict,
        state: currentDistrictObj?.province || 'Western Province',
        pincode: '00300',
      };

      // Save locally for future orders
      try {
        localStorage.setItem('innovative_saved_address', JSON.stringify(shippingAddress));
      } catch {
        // Ignore
      }

      const orderItem = {
        product,
        selectedSize,
        selectedVariant: currentVariant,
        quantity,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [orderItem],
          shippingAddress,
          paymentMethod: PaymentMethod.COD,
          isCodOtpConfirmed: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to place order. Please try again.');
      }

      // Show beautiful success popup instead of immediate redirect
      setOrderSuccess({
        orderId: data.order.id,
        orderNumber: data.order.orderNumber || data.order.id,
        customerName: fullName.trim(),
        productTitle: product.title,
        qty: quantity,
        total: itemTotal,
        whatsapp: phone1.trim(),
      });
      setIsSubmittingCod(false);
    } catch (err: any) {
      setCodError(err.message || 'Something went wrong. Please try again or order via WhatsApp.');
      setIsSubmittingCod(false);
    }
  };

  const whatsappInquiryUrl = `https://wa.me/94714897262?text=${encodeURIComponent(
    `Hello NookMint! 👋\n` +
      `I would like to ${product.inquiryOnly ? 'request a quotation / consultation for' : 'order'}:\n` +
      `📦 Product: ${product.title}\n` +
      `📌 SKU / Code: ${currentVariant.sku || product.id}\n` +
      `🎨 Color / Option: ${selectedSize}\n` +
      `🔢 Quantity: ${quantity}\n` +
      `💰 Listed Price: ${formatLKR(product.sellingPrice)}\n` +
      `📍 Delivery to: ${selectedDistrict}\n` +
      `Please let me know availability and delivery schedule. Thank you!`
  )}`;

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = `${product.title} | NookMint`;
    const shareText = `Check out ${product.title} on NookMint for ${formatLKR(product.sellingPrice)} with Cash on Delivery Islandwide across Sri Lanka!`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    // Fallback: Copy direct URL to clipboard
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const [currentUrl, setCurrentUrl] = useState<string>('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const shareOnWhatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Check out this on NookMint: ${product.title} (${formatLKR(product.sellingPrice)})\nOption: ${selectedSize}\n100% Cash on Delivery across Sri Lanka!\n👉 Buy directly here: ${
      currentUrl
    }`
  )}`;

  const categoryName = typeof product.category === 'string' ? product.category : 'Catalogue';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* ======================================================== */}
      {/* Left Column: Interactive Product Gallery (Color Reactive) */}
      {/* ======================================================== */}
      <div className="lg:col-span-7">
        <ProductGallery
          images={product.images}
          title={product.title}
          videoUrl={product.videoUrl}
          activeImage={activeImage}
          onSelectImage={(img) => {
            setActiveImage(img);
            const matched = product.variants?.find((v) => v.image === img);
            if (matched && matched.size !== selectedSize) {
              setSelectedSize(matched.size);
            }
          }}
        />
      </div>

      {/* ======================================================== */}
      {/* Right Column: Details, Color Options & Order Actions     */}
      {/* ======================================================== */}
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
              {product.subcategory || categoryName}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-extrabold bg-emerald-50 text-[#004D40] border border-emerald-200/90 flex items-center gap-1">
              <span>Code: {currentVariant.sku || product.variants?.[0]?.sku || product.id}</span>
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5 text-emerald-700" />
              <span>100% Cash on Delivery (COD)</span>
            </span>
          </div>

          {product.brand && (
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              {product.brand}
            </span>
          )}

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
            {product.title}
          </h1>

          <FormattedProductDescription text={product.description} />

          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium pt-1">
            <span>Category: <strong className="text-slate-900">{categoryName}</strong></span>
            {product.unit && <span>Unit: <strong className="text-slate-900">{product.unit}</strong></span>}
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> In Stock &amp; Ready to Dispatch
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200/80">
          <PriceTag
            sellingPrice={product.sellingPrice}
            mrp={product.mrp}
            offerPercentage={product.offerPercentage}
            size="lg"
          />
        </div>

        {/* 1. Dedicated Color Swatches / Model Selector */}
        {product.variants && product.variants.length > 1 ? (
          <div className="space-y-2.5 p-4 rounded-2xl bg-[#FAF6F3] border border-slate-200/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>🎨 Select Color / Model Option:</span>
              </span>
              <span className="text-xs font-semibold">
                {stockCount > 0 ? (
                  <span className="text-emerald-700 font-extrabold">✓ {stockCount} units in stock</span>
                ) : product.inquiryOnly ? (
                  <span className="text-blue-600 font-bold">Inquiry Available</span>
                ) : (
                  <span className="text-red-500 font-bold">Out of Stock</span>
                )}
              </span>
            </div>

            <SizeSelector
              variants={product.variants}
              selectedSize={selectedSize}
              onSelectSize={(size) => {
                setSelectedSize(size);
                const matched = product.variants?.find((v) => v.size === size);
                if (matched?.image) {
                  setActiveImage(matched.image);
                }
              }}
            />

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
              <span>Active Selection: <strong className="text-slate-900">{selectedSize}</strong></span>
              {currentVariant.colorHex && (
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                  <span className="w-3 h-3 rounded-full border border-slate-300 inline-block" style={{ backgroundColor: currentVariant.colorHex }} />
                  {currentVariant.colorHex}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200">
            <span className="font-bold text-slate-700">Stock Availability:</span>
            {stockCount > 0 ? (
              <span className="text-emerald-700 font-extrabold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>In Stock ({stockCount} units available for islandwide dispatch)</span>
              </span>
            ) : (
              <span className="text-red-600 font-bold">Out of Stock</span>
            )}
          </div>
        )}

        {/* 2. EV / Inquiry Workflow Notice */}
        {product.inquiryOnly ? (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>High-Value & Mobility Direct Inquiry Workflow</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Due to customized technical specifications, warranty coverage, and regional registration, electric vehicles are coordinated directly via quotation.
            </p>
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center justify-center gap-2 text-center"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Request Formal Quotation on WhatsApp</span>
            </a>
          </div>
        ) : (
          /* Regular E-Commerce Cart & WhatsApp Order Actions */
          <div className="space-y-3 pt-1">
            {/* Primary High-Converting CTA: Full-Width Order Now Button */}
            <button
              type="button"
              disabled={isSizeOutOfStock}
              onClick={() => {
                setShowFastCodForm(true);
                setTimeout(() => {
                  fastCodFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="w-full h-13 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-md shadow-emerald-950/20 text-white bg-[#064E3B] hover:bg-[#04382A] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300 shrink-0" />
              <Truck className="w-4.5 h-4.5 text-emerald-200 shrink-0" />
              <span>Order Now (Cash on Delivery)</span>
            </button>

            {/* Secondary Row: Quantity Selector + Add to Cart Button */}
            <div className="flex items-center gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center border border-slate-200 rounded-2xl h-11 px-1 bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isSizeOutOfStock}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-xs font-black text-slate-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(stockCount || 10, quantity + 1))}
                  disabled={quantity >= (stockCount || 10) || isSizeOutOfStock}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                disabled={isSizeOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 h-11 px-5 rounded-2xl font-extrabold text-xs uppercase tracking-wider border transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isAdded
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 hover:border-slate-400 shadow-2xs'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Added to Cart!</span>
                  </>
                ) : isSizeOutOfStock ? (
                  <span>Out of Stock</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-slate-700" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>

            {/* Tertiary Action: Direct WhatsApp Order Link */}
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 px-4 rounded-2xl font-bold text-xs bg-emerald-50 hover:bg-emerald-100/80 text-[#064E3B] border border-emerald-200/80 transition-all flex items-center justify-center gap-2 text-center"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Order or Inquire via WhatsApp (+94 71 489 7262)</span>
            </a>

            {/* Share & Recommend Product Row */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleShare}
                className="flex-1 h-10 px-3.5 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs hover:border-slate-300 active:scale-98 cursor-pointer"
                title="Share product with friends"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    <span className="text-emerald-700">Link Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-slate-600" />
                    <span>Share Product</span>
                  </>
                )}
              </button>

              <a
                href={shareOnWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                suppressHydrationWarning
                className="h-10 px-3.5 rounded-2xl border border-emerald-200/90 bg-emerald-50 hover:bg-emerald-100/80 text-[#064E3B] font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs shrink-0 active:scale-98"
                title="Send product directly on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Share on WhatsApp</span>
              </a>
            </div>

            {/* ⚡ INSTANT FAST CASH ON DELIVERY (COD) ORDER FORM */}
            {!product.inquiryOnly && !isSizeOutOfStock && showFastCodForm && (
              <div
                ref={fastCodFormRef}
                className="mt-6 rounded-3xl bg-gradient-to-b from-[#F0FDF4] to-[#FBF8F3] border-2 border-emerald-500/30 p-5 sm:p-6 shadow-md shadow-emerald-950/5 space-y-4 animate-fadeIn"
              >
                <div className="flex items-start justify-between gap-3 border-b border-emerald-200/80 pb-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                        <Zap className="w-4 h-4 fill-amber-400 text-amber-500 shrink-0" />
                        <span>Fast Cash on Delivery Order</span>
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Order directly in 10 seconds. No card or bank deposit needed — pay cash upon courier delivery.
                    </p>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-700 text-white font-extrabold text-[10px] tracking-wide uppercase">
                    100% COD
                  </span>
                </div>

                {/* Selected Color & Product Confirmation Card */}
                <div className="p-3 rounded-2xl bg-white border border-emerald-200 shadow-2xs flex items-center gap-3">
                  <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-200">
                    <Image
                      src={currentVariant?.image || activeImage || product.images[0] || '/nookmint_images/hero.png'}
                      alt={product.title}
                      fill
                      sizes="48px"
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-xs truncate">{product.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="font-bold text-[#064E3B] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                        Color / Model: {selectedSize}
                      </span>
                      {currentVariant.colorHex && (
                        <span
                          className="w-3 h-3 rounded-full border border-slate-300 inline-block shrink-0"
                          style={{ backgroundColor: currentVariant.colorHex }}
                        />
                      )}
                      <span className="text-slate-500 text-[11px]">Qty: {quantity}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-black text-slate-900 text-xs">{formatLKR(itemTotal)}</div>
                  </div>
                </div>

                {codError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    ⚠️ {codError}
                  </div>
                )}

                <form onSubmit={handleFastCodSubmit} className="space-y-3.5">
                  {/* 1. Customer Name & Email / Gmail */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Ruwani Fernando"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        Email / Gmail <span className="text-slate-400 font-normal lowercase">(optional)</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. yourname@gmail.com"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Contact Numbers Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        WhatsApp Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="tel"
                          required
                          value={phone1}
                          onChange={(e) => setPhone1(e.target.value)}
                          placeholder="07X XXXXXXX"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Backup Mobile Number <span className="text-slate-400 font-normal lowercase">(optional)</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="tel"
                          value={phone2}
                          onChange={(e) => setPhone2(e.target.value)}
                          placeholder="07X XXXXXXX"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Delivery Address */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                      Delivery Address (House / Street / Road) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Home className="w-3.5 h-3.5 text-emerald-700 absolute left-3 top-3 pointer-events-none" />
                      <textarea
                        required
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House / Unit number, street name, building..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  {/* 4. District Coverage (Full Width for complete readability across all 25 districts) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                        Delivery District <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Islandwide 25 Districts
                      </span>
                    </div>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={selectedDistrict}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer shadow-2xs"
                      >
                        {SRI_LANKA_DISTRICTS.map((d) => (
                          <option key={d.district} value={d.district}>
                            {d.district} ({d.province})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Town / City */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                      Town / City <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Maharagama, Nugegoda, Kandy, Galle, Jaffna..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Dynamic Delivery Fee Info Box: Invoiced on WhatsApp */}
                  <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-amber-950 font-medium">
                      <MessageCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Courier Delivery Fee: <strong className="font-bold">Invoiced on WhatsApp</strong> (Destination: {selectedDistrict})</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200 shrink-0 self-start sm:self-auto">
                      Pay Upon Delivery
                    </span>
                  </div>

                  {/* 5. Optional Landmark / Note */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Order Note / Delivery Landmark <span className="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="e.g. Near clock tower, call before arriving..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  {/* Price Breakdown Calculation */}
                  <div className="p-3.5 rounded-2xl bg-white/90 border border-emerald-200/90 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Product Price ({quantity}x):</span>
                      <span className="font-semibold text-slate-900">{formatLKR(itemTotal)}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>Courier Delivery:</span>
                      <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                        Invoiced via WhatsApp
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                      <strong>💡 Delivery Notice:</strong> Only product price is charged here ({formatLKR(itemTotal)}). Courier delivery fee based on your destination city will be calculated and provided on your official WhatsApp invoice before courier dispatch.
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-black">
                      <div>
                        <span className="text-slate-900 text-xs">Total Order Value:</span>
                        <span className="block text-[10px] text-slate-500 font-medium">Product price only</span>
                      </div>
                      <span className="text-base font-mono text-emerald-800">{formatLKR(itemTotal)}</span>
                    </div>
                  </div>

                  {/* Submit COD Order Button */}
                  <button
                    type="submit"
                    disabled={isSubmittingCod}
                    className="w-full py-3.5 px-4 sm:px-6 rounded-2xl bg-[#064E3B] hover:bg-[#04382A] active:scale-[0.99] text-white shadow-xl shadow-emerald-950/25 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 border border-emerald-600/30"
                  >
                    {isSubmittingCod ? (
                      <div className="flex items-center justify-center gap-2 py-1">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-300" />
                        <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider">Submitting Order...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3 w-full">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-xs">
                          <MessageCircle className="w-5 h-5 text-emerald-300 fill-emerald-300/30" />
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <div className="font-black text-xs sm:text-sm uppercase tracking-wide text-white leading-tight">
                            Confirm Cash on Delivery Order
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-emerald-200/90 font-medium normal-case leading-tight mt-0.5">
                            Courier fee &amp; official invoice will be sent to your WhatsApp
                          </div>
                        </div>
                      </div>
                    )}
                  </button>

                  {/* Assurance Badges */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Zero Advance Payment</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Pay Cash Upon Delivery</span>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Delivery Section */}
        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">Islandwide COD Delivery via Courier</div>
              <div className="text-[11px] text-slate-500">Delivered via Prompt Xpress &amp; Domex • Invoice with courier fee sent via WhatsApp</div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
            100% COD
          </span>
        </div>

        {/* Dynamic Specifications & Category Attributes */}
        {(product.attributes || product.specifications) && (
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-3 text-xs">
            <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Product Specifications & Details</span>
            </h2>

            <div className="space-y-2 text-slate-600 divide-y divide-slate-100">
              {/* Dynamic Attributes Map */}
              {product.attributes && Object.entries(product.attributes).map(([key, val]) => (
                <div key={key} className="pt-2 flex justify-between gap-4">
                  <span className="font-semibold text-slate-700">{key}:</span>
                  <span className="text-slate-900 text-right">{val}</span>
                </div>
              ))}

              {/* Dynamic Specifications Array */}
              {product.specifications && product.specifications.map((spec) => (
                <div key={spec.name} className="pt-2 flex justify-between gap-4">
                  <span className="font-semibold text-slate-700">{spec.name}:</span>
                  <span className="text-slate-900 text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Value Props Row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 text-center text-[10px] sm:text-[11px] text-slate-600 font-medium">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
            <Truck className="w-4 h-4 mx-auto text-emerald-700" />
            <span className="block leading-tight">Islandwide Delivery</span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
            <ShieldCheck className="w-4 h-4 mx-auto text-emerald-600" />
            <span className="block leading-tight">Authentic Quality</span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
            <RotateCcw className="w-4 h-4 mx-auto text-amber-600" />
            <span className="block leading-tight">Easy Return Check</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* Scroll-Down Visual Storyboard / Rich Product Details     */}
      {/* (Daraz & Alibaba style visual guide & usage tutorials)   */}
      {/* ======================================================== */}
      {product.descriptionImages && product.descriptionImages.length > 0 && (
        <div className="col-span-1 lg:col-span-12 mt-6 sm:mt-10 pt-6 sm:pt-10 border-t border-slate-200/80">
          <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
            <div className="text-center space-y-1.5">
              <span className="text-[11px] font-extrabold tracking-widest uppercase text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200/80 inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Product Overview &amp; Visual Guide</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Visual Walkthrough &amp; Features
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Step-by-step application instructions, dimensions, and specifications.
              </p>
            </div>

            <div className="space-y-3 sm:space-y-5">
              {product.descriptionImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-2xs transition-shadow hover:shadow-md"
                >
                  <img
                    src={imgUrl}
                    alt={`${product.title} - Visual Guide ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-auto object-contain block"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🎉 ORDER SUCCESS POPUP MODAL */}
      {orderSuccess && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100">
            {/* Green header */}
            <div className="bg-gradient-to-br from-[#064E3B] to-[#047857] px-6 pt-7 pb-6 text-center relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />
              
              <div className="relative mx-auto w-14 h-14 rounded-full bg-emerald-400/20 border-2 border-emerald-300/40 flex items-center justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/40">
                  <Check className="w-5 h-5 text-white stroke-[3]" />
                </div>
              </div>
              
              <h2 className="text-white font-black text-lg sm:text-xl tracking-tight">
                Thank You for Your Order! 🎉
              </h2>
              <p className="text-emerald-100 text-xs mt-1 font-medium">
                We have received your order successfully
              </p>
              
              <div className="mt-3 inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full">
                <span className="text-emerald-200 text-[10px] font-bold uppercase tracking-wider">Order</span>
                <span className="text-white text-xs font-mono font-black">{orderSuccess.orderNumber}</span>
              </div>
            </div>

            {/* Order details & WhatsApp message */}
            <div className="px-5 py-4 space-y-3">
              {/* Product summary card */}
              <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2 border border-slate-100 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 font-medium">Customer:</span>
                  <span className="font-extrabold text-slate-900 text-right">{orderSuccess.customerName}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 font-medium shrink-0">Item:</span>
                  <span className="font-semibold text-slate-900 text-right leading-tight">
                    {orderSuccess.productTitle} &times; {orderSuccess.qty}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                  <span className="text-slate-700 font-bold">Product Price:</span>
                  <span className="font-black text-emerald-800 text-sm font-mono">
                    LKR {orderSuccess.total.toLocaleString()}.00
                  </span>
                </div>
              </div>

              {/* Delivery & WhatsApp notice */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-xs leading-relaxed space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Invoice on WhatsApp</span>
                </div>
                <p className="text-[11px] text-emerald-900 leading-normal">
                  Your official invoice along with the courier delivery fee will be sent directly to your WhatsApp <strong className="font-bold">({orderSuccess.whatsapp})</strong> before dispatch.
                </p>
                <div className="text-[11px] font-semibold text-emerald-800 pt-1 border-t border-emerald-200/60 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Islandwide courier delivery in 3–4 business days.</span>
                </div>
              </div>

              {/* Single action button: Continue Shopping */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setOrderSuccess(null);
                    setShowFastCodForm(false);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#064E3B] hover:bg-[#04382A] active:scale-[0.99] text-white font-black text-xs uppercase tracking-wider text-center transition-all shadow-lg shadow-emerald-950/20 cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🛒 Real-time Mobile "Added to Cart" Toast Alert */}
      {showCartToast && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 bg-[#064E3B] text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-emerald-400/40 flex items-center justify-between gap-3 animate-slideUp backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <ShoppingBag className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-300 stroke-[3]" />
                <span>Added to Cart!</span>
              </div>
              <p className="text-[11px] text-emerald-100 truncate mt-0.5">
                {quantity}x {product.title} ({selectedSize})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/cart"
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1 active:scale-95"
            >
              <span>View Cart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setShowCartToast(false)}
              className="w-7 h-7 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
