'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/core/entities/Product';
import { useCart } from '@/presentation/context/CartContext';
import { SizeSelector } from '@/presentation/components/molecules/SizeSelector';
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
} from 'lucide-react';
import { SRI_LANKA_DISTRICTS } from '@/core/constants/SriLankaDistricts';
import { formatLKR } from '@/shared/utils/currency';

export const ProductDetailClient: React.FC<{ product: Product }> = ({ product }) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>(product.variants[0]?.size || 'Standard');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0]?.name || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Colombo');
  const [storeDelivery, setStoreDelivery] = useState<any>(null);

  // Fast COD Form State
  const fastCodFormRef = useRef<HTMLDivElement>(null);
  const [showFastCodForm, setShowFastCodForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Colombo 03');
  const [orderNote, setOrderNote] = useState('');
  const [isSubmittingCod, setIsSubmittingCod] = useState(false);
  const [codError, setCodError] = useState('');

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

  const currentVariant = product.variants?.find((v) => v.size === selectedSize) || product.variants?.[0] || {
    sku: product.id,
    size: 'Standard',
    stock: 10,
    price: product.sellingPrice,
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
    setTimeout(() => setIsAdded(false), 2000);
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
        phone: phone1.trim(),
        alternatePhone: phone2.trim(),
        addressLine1: address.trim(),
        addressLine2: '',
        landmark: orderNote.trim(),
        city: city.trim(),
        district: selectedDistrict,
        state: currentDistrictObj?.province || 'Western Province',
        pincode: '00000',
      };

      // Save locally for future orders
      try {
        localStorage.setItem('innovative_saved_address', JSON.stringify(shippingAddress));
      } catch {
        // Ignore
      }

      const orderItem = {
        product,
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
        throw new Error(data.error || 'Failed to place order. Please try again.');
      }

      router.push(`/order-success/${data.order.id}`);
    } catch (err: any) {
      setCodError(err.message || 'Something went wrong. Please try again or order via WhatsApp.');
      setIsSubmittingCod(false);
    }
  };

  const whatsappInquiryUrl = `https://wa.me/94787844914?text=${encodeURIComponent(
    `Hello NookMint! 👋\n` +
      `I would like to ${product.inquiryOnly ? 'request a quotation / consultation for' : 'order'}:\n` +
      `📦 Product: ${product.title}\n` +
      `📌 SKU / Code: ${currentVariant.sku || product.id}\n` +
      `📌 Option: ${selectedSize}\n` +
      `${selectedColor ? `🎨 Color: ${selectedColor}\n` : ''}` +
      `🔢 Quantity: ${quantity}\n` +
      `💰 Listed Price: ${formatLKR(product.sellingPrice)}\n` +
      `📍 Delivery to: ${selectedDistrict}\n` +
      `Please let me know availability and delivery schedule. Thank you!`
  )}`;

  return (
    <div className="space-y-6">
      {/* 1. Color Swatches (if available) */}
      {product.colors && product.colors.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Color Option:</span>
            <span className="text-slate-500 font-semibold">{selectedColor}</span>
          </div>
          <div className="flex items-center gap-2" role="radiogroup" aria-label="Available Colors">
            {product.colors.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => setSelectedColor(color.name)}
                className={`w-7 h-7 rounded-full border border-slate-300 transition-all ${
                  selectedColor === color.name
                    ? 'ring-2 ring-blue-600 ring-offset-2 scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
                aria-label={color.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* 2. Variant / Option Selector (Only if multiple options exist) */}
      {product.variants && product.variants.length > 1 ? (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              Select Option / Model:
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {stockCount > 0 ? (
                <span className="text-emerald-600 font-bold">✓ {stockCount} in stock</span>
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
              setShowFastCodForm(true);
            }}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs p-3 rounded-2xl bg-slate-50/80 border border-slate-200">
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

      {/* 3. EV / Inquiry Workflow Notice */}
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
            <Banknote className="w-5 h-5 text-emerald-300 shrink-0" />
            <span>⚡ Order Now (Cash on Delivery)</span>
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
            <span>Order or Inquire via WhatsApp (+94 78 784 4914)</span>
          </a>

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
                      <span>⚡ Fast Cash on Delivery Order</span>
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

              {codError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  ⚠️ {codError}
                </div>
              )}

              <form onSubmit={handleFastCodSubmit} className="space-y-3.5">
                {/* 1. Customer Name */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Kasun Perera"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
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

                {/* 4. Town / City (and District for Own Inventory) */}
                {isDropship ? (
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                      Town / City <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Maharagama, Nugegoda, Kandy, Galle..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        District <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      >
                        {SRI_LANKA_DISTRICTS.map((d) => (
                          <option key={d.district} value={d.district}>
                            {d.district} ({d.province})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        Town / City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Maharagama, Kandy..."
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                )}

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

                  {isDropship ? (
                    <>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Courier Delivery:</span>
                        <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                          Invoiced via WhatsApp
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                        <strong>💡 Official Invoice Notice:</strong> Only product price is charged here ({formatLKR(itemTotal)}). Courier delivery fee based on your destination will be calculated and provided on your official WhatsApp invoice before courier dispatch.
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Courier Delivery ({selectedDistrict}):</span>
                        <span className={`font-semibold ${deliveryInfo.isFree ? 'text-emerald-700' : 'text-slate-900'}`}>
                          {deliveryInfo.text}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                        <span className="flex items-center gap-1 font-bold">
                          <Truck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Estimated Delivery:</span>
                        </span>
                        <span className="font-extrabold">{deliveryInfo.eta || '1 - 2 Business Days'}</span>
                      </div>
                    </>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-black">
                    <div>
                      <span className="text-slate-900 text-xs">Total Order Value:</span>
                      {isDropship && <span className="block text-[10px] text-slate-500 font-medium">Product price only</span>}
                    </div>
                    <span className="text-base font-mono text-emerald-800">{formatLKR(totalPayable)}</span>
                  </div>
                </div>

                {/* Submit COD Order Button */}
                <button
                  type="submit"
                  disabled={isSubmittingCod}
                  className="w-full py-4 px-6 rounded-2xl bg-[#064E3B] hover:bg-[#04382A] active:scale-98 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingCod ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Order...</span>
                    </>
                  ) : isDropship ? (
                    <>
                      <MessageCircle className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span>Confirm Order (Invoice will be sent to your WhatsApp)</span>
                    </>
                  ) : (
                    <>
                      <Banknote className="w-5 h-5" />
                      <span>Confirm Cash on Delivery Order • {formatLKR(totalPayable)}</span>
                    </>
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
      {isDropship ? (
        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">Islandwide COD Delivery via Courier</div>
              <div className="text-[11px] text-slate-500">Delivered via Prompt Xpress & Domex • Invoice with courier fee sent via WhatsApp</div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
            100% COD
          </span>
        </div>
      ) : (
        /* Interactive Delivery Estimator for Own In-House Products */
        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>Estimated Courier & Delivery to Your District</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              COD Available
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
              >
                {SRI_LANKA_DISTRICTS.map((d) => (
                  <option key={d.district} value={d.district}>
                    {d.district} ({d.province})
                  </option>
                ))}
              </select>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between sm:justify-start gap-2">
              <span className="text-slate-500 text-[11px]">Fee:</span>
              <span className={`font-black font-mono text-sm ${deliveryInfo.isFree ? 'text-emerald-700' : 'text-slate-900'}`}>
                {deliveryInfo.text}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span>⚡ Estimated Arrival: <strong className="text-slate-800">{deliveryInfo.eta}</strong></span>
            <span className="text-slate-400">Islandwide Tracked Delivery</span>
          </div>
        </div>
      )}
    </div>
  );
};
