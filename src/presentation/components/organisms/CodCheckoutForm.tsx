'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/presentation/context/CartContext';
import { Address, PaymentMethod } from '@/shared/types/common';
import { COD_RULES } from '@/core/constants/CodRules';
import { SRI_LANKA_DISTRICTS } from '@/core/constants/SriLankaDistricts';
import { SRI_LANKAN_BANK_ACCOUNTS } from '@/core/constants/BankAccounts';
import { formatLKR } from '@/shared/utils/currency';
import {
  Banknote,
  Building2,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Truck,
  Copy,
  Check,
  HelpCircle,
  MessageCircle
} from 'lucide-react';

export const CodCheckoutForm: React.FC = () => {
  const router = useRouter();
  const { items, summary, selectedPaymentMethod, setSelectedPaymentMethod, clearCart } = useCart();

  const [formData, setFormData] = useState<Address>({
    fullName: '',
    phone: '',
    alternatePhone: '',
    addressLine1: '',
    addressLine2: '',
    district: 'Colombo',
    city: 'Colombo 03',
    state: 'Western Province',
    pincode: '00300',
    landmark: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedBankIdx, setCopiedBankIdx] = useState<number | null>(null);
  const [storeSettings, setStoreSettings] = useState<any | null>(null);

  // Load saved address and dynamic store settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem('innovative_saved_address');
      if (saved) {
        setFormData(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }

    // Fetch dynamic store settings (Bank Accounts, Delivery Fees)
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setStoreSettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);

  const handleDistrictChange = (districtName: string) => {
    const matched = SRI_LANKA_DISTRICTS.find((d) => d.district === districtName);
    setFormData((prev) => ({
      ...prev,
      district: districtName,
      state: matched ? matched.province : prev.state,
      city: matched && matched.majorTowns.length > 0 ? matched.majorTowns[0] : prev.city,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCopyAccount = (accNo: string, idx: number) => {
    navigator.clipboard.writeText(accNo);
    setCopiedBankIdx(idx);
    setTimeout(() => setCopiedBankIdx(null), 2000);
  };

  // Dynamic delivery fee & timeframe calculation based on selected district, districtRates, and product settings
  const getDistrictDeliveryInfo = (districtName: string): { fee: number; estimatedDays: string; groupName?: string } => {
    if (!districtName) return { fee: 350, estimatedDays: 'Same-Day / 1 Day' };

    // Check custom district rates / groups configured by admin
    if (storeSettings?.delivery?.districtRates && Array.isArray(storeSettings.delivery.districtRates)) {
      const match = storeSettings.delivery.districtRates.find(
        (r: any) => r.districts?.includes(districtName) || r.districts?.includes('*')
      );
      if (match) {
        return {
          fee: match.fee,
          estimatedDays: match.estimatedDays || '1-3 Business Days',
          groupName: match.name,
        };
      }
    }

    const colomboFee = storeSettings?.delivery?.colomboFee ?? 350;
    const wpFee = storeSettings?.delivery?.westernProvinceFee ?? 400;
    const outstationFee = storeSettings?.delivery?.outstationFee ?? 500;
    if (districtName === 'Colombo') {
      return { fee: colomboFee, estimatedDays: 'Same-Day / 1 Day', groupName: 'Colombo District' };
    }
    if (districtName === 'Gampaha' || districtName === 'Kalutara') {
      return { fee: wpFee, estimatedDays: '1-2 Business Days', groupName: 'Western Province' };
    }
    return { fee: outstationFee, estimatedDays: '2-3 Business Days', groupName: 'Outstation Courier' };
  };

  const hasCustomProductFee = items.some((item) => item.product.deliveryFeeType === 'custom');
  const allProductsFreeShipping = items.length > 0 && items.every((item) => item.product.deliveryFeeType === 'free');
  const maxCustomProductFee = hasCustomProductFee
    ? Math.max(
        ...items
          .filter((item) => item.product.deliveryFeeType === 'custom' && typeof item.product.customDeliveryFee === 'number')
          .map((item) => item.product.customDeliveryFee as number)
      )
    : 0;

  const currentDistrictInfo = getDistrictDeliveryInfo(formData.district || 'Colombo');
  const hasDropship = items.some((item) => (item.product.sourceType || 'dropship') === 'dropship');
  const freeThreshold = storeSettings?.delivery?.freeShippingThreshold ?? 5000;
  const isFreeDelivery = (summary.subtotal >= freeThreshold || allProductsFreeShipping) && items.length > 0;
  
  const baseShippingFee = hasCustomProductFee && maxCustomProductFee > 0
    ? maxCustomProductFee
    : currentDistrictInfo.fee;

  const actualShippingFee = items.length === 0 || hasDropship ? 0 : isFreeDelivery ? 0 : baseShippingFee;
  const actualCodFee = selectedPaymentMethod === PaymentMethod.COD && items.length > 0
    ? (summary.subtotal >= COD_RULES.FREE_COD_THRESHOLD ? 0 : COD_RULES.COD_HANDLING_FEE)
    : 0;
  const actualGrandTotal = summary.subtotal + actualShippingFee + actualCodFee;
  const finalGrandTotal = hasDropship ? summary.subtotal : actualGrandTotal;

  const codMin = storeSettings?.delivery?.codMinOrder ?? COD_RULES.MIN_ORDER_AMOUNT;
  const codMax = storeSettings?.delivery?.codMaxOrder ?? COD_RULES.MAX_ORDER_AMOUNT;
  const isCodBlocked = summary.subtotal < codMin || summary.subtotal > codMax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.addressLine1.trim()) {
      setErrorMessage('Please fill in all mandatory delivery fields (Name, Phone, Address).');
      return;
    }

    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9 || cleanPhone.length > 12) {
      setErrorMessage('Please enter a valid Sri Lankan mobile number (e.g., 0771234567).');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save address locally for returning orders
      try {
        localStorage.setItem('innovative_saved_address', JSON.stringify(formData));
      } catch {
        // Ignore
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress: formData,
          paymentMethod: selectedPaymentMethod,
          isCodOtpConfirmed: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || 'Failed to place order. Please review your details.');
        setIsSubmitting(false);
        return;
      }

      // Successful order creation
      clearCart();
      router.push(`/order-success/${data.order.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Connection error. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Checkout Form */}
      <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
        {/* Step 1: Delivery Address */}
        <div className="bg-white p-4.5 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex flex-col xs:flex-row sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#064E3B] text-white text-xs flex items-center justify-center font-sans font-extrabold">
                1
              </span>
              <span>Delivery Details</span>
            </h2>
            <span className="text-[11px] font-semibold text-slate-500">
              Islandwide Delivery Across Sri Lanka
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name *
              </label>
              <input
                id="fullName"
                type="text"
                required
                name="fullName"
                autoComplete="name"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Ruwani Fernando"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1.5">
                Contact Number One (Primary) *
              </label>
              <input
                id="phone"
                type="tel"
                required
                maxLength={12}
                name="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 077 123 4567"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
              <p className="text-[10px] text-slate-400 mt-1">Primary mobile for delivery driver & WhatsApp</p>
            </div>

            <div>
              <label htmlFor="alternatePhone" className="block text-xs font-bold text-slate-700 mb-1.5">
                Contact Number Two (Optional)
              </label>
              <input
                id="alternatePhone"
                type="tel"
                maxLength={12}
                name="alternatePhone"
                value={formData.alternatePhone || ''}
                onChange={handleChange}
                placeholder="e.g. 071 987 6543"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
              <p className="text-[10px] text-slate-400 mt-1">Backup number in case primary is busy</p>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="addressLine1" className="block text-xs font-bold text-slate-700 mb-1.5">
                Delivery Address (House / Street / Lane) *
              </label>
              <input
                id="addressLine1"
                type="text"
                required
                name="addressLine1"
                autoComplete="street-address"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="e.g. No. 42/1, Temple Road"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="district" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Delivery District & City Coverage *</span>
                <span className="text-[11px] font-normal text-slate-500">
                  Select your district to see exact delivery fee
                </span>
              </label>
              <select
                id="district"
                name="district"
                value={formData.district || 'Colombo'}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full px-3.5 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all font-medium text-slate-900 cursor-pointer"
              >
                {SRI_LANKA_DISTRICTS.map((d) => {
                  const info = getDistrictDeliveryInfo(d.district);
                  return (
                    <option key={d.district} value={d.district}>
                      {d.district} ({d.province}) — {isFreeDelivery ? 'FREE Delivery' : `Delivery Fee: Rs. ${info.fee} (${info.estimatedDays})`}
                    </option>
                  );
                })}
              </select>

              {/* Dynamic Delivery Fee Info Box */}
              {hasDropship ? (
                <div className="mt-2.5 p-3 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-950 font-medium">
                    <MessageCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Courier Delivery Fee: <strong className="font-bold">Invoiced on WhatsApp</strong> (Destination: {formData.district})</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200 shrink-0">
                    Pay Upon Delivery
                  </span>
                </div>
              ) : (
                <div className="mt-2.5 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#064E3B] shrink-0" />
                    <span className="text-slate-700">
                      Doorstep Courier to <strong className="text-slate-900 font-bold">{formData.district}</strong>:
                    </span>
                    {isFreeDelivery ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase">
                        FREE DELIVERY APPLIED
                      </span>
                    ) : (
                      <span className="font-black text-[#064E3B] font-mono text-sm">
                        {formatLKR(baseShippingFee)}
                      </span>
                    )}
                    {currentDistrictInfo.groupName && (
                      <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded bg-white text-slate-600 font-bold border border-emerald-200">
                        {currentDistrictInfo.groupName}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                    <span>⚡</span> {currentDistrictInfo.estimatedDays || '1-3 Business Days'} Doorstep Courier
                  </span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="city" className="block text-xs font-bold text-slate-700 mb-1.5">
                Town / City *
              </label>
              <input
                id="city"
                type="text"
                required
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Nugegoda, Negombo, Kandy"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="landmark" className="block text-xs font-bold text-slate-700 mb-1.5">
                Landmark or Delivery Instructions (Optional)
              </label>
              <input
                id="landmark"
                type="text"
                name="landmark"
                value={formData.landmark || ''}
                onChange={handleChange}
                placeholder="e.g. Near Arpico Supercentre, Gate 2, Call before arriving"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Payment Mode - Strictly 100% Cash on Delivery (COD) */}
        <div className="bg-white p-4.5 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col xs:flex-row sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#004D40] text-white text-xs flex items-center justify-center font-sans font-extrabold shrink-0">
                2
              </span>
              <span>Payment Mode</span>
            </h2>
            <span className="text-[10px] sm:text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 sm:py-1 rounded-md border border-emerald-200 self-start xs:self-auto sm:self-auto">
              100% Cash on Delivery (COD)
            </span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl border-2 border-emerald-600/30 bg-emerald-50/50 flex items-start gap-3">
            <Banknote className="w-5 h-5 sm:w-6 sm:h-6 text-[#004D40] shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-col xs:flex-row xs:items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-xs sm:text-base text-slate-900">
                  Cash on Delivery (Doorstep Payment)
                </span>
                <span className="text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide w-fit">
                  Zero Advance Payment
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                Pay cash to our courier partner at your doorstep only after receiving and inspecting your package. No bank deposit or credit card needed!
              </p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || items.length === 0}
          className="w-full px-4 py-3.5 sm:py-4 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-50 text-white rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex flex-col items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 active:scale-[0.99] cursor-pointer"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider">Submitting Your Order...</span>
            </div>
          ) : hasDropship ? (
            <>
              <div className="flex items-center justify-center gap-2 font-black text-xs sm:text-sm uppercase tracking-wider">
                <MessageCircle className="w-4.5 h-4.5 text-emerald-200 shrink-0 fill-emerald-200/20" />
                <span>Confirm Cash on Delivery Order</span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-amber-100 font-medium normal-case tracking-normal">
                Courier fee &amp; official invoice will be sent to your WhatsApp
              </span>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-200 shrink-0" />
              <span className="font-black text-xs sm:text-sm uppercase tracking-wider">Confirm Cash on Delivery Order • {formatLKR(finalGrandTotal)}</span>
            </div>
          )}
        </button>
      </form>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white p-4.5 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3 font-serif">
            Order Summary ({summary.itemsCount} Items)
          </h3>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.selectedSize}`} className="py-3 flex gap-3 text-xs items-center">
                <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-[#FAF6F3] shrink-0 border border-slate-100">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.title}
                    fill
                    sizes="56px"
                    unoptimized={item.product.images[0]?.startsWith('http') && !item.product.images[0]?.includes('unsplash.com') && !item.product.images[0]?.includes('supabase.co')}
                    className="object-cover object-top"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 truncate">{item.product.title}</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">Size: {item.selectedSize} • Qty: {item.quantity}</p>
                  <p className="font-extrabold text-blue-600 mt-1">
                    {formatLKR(item.product.sellingPrice * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Items Total:</span>
              <span className="font-bold text-slate-900">{formatLKR(summary.subtotal)}</span>
            </div>

            <div className="flex justify-between text-slate-600 font-medium">
              <span className="flex items-center gap-1">
                <span>Courier to {formData.district}:</span>
                {!hasDropship && isFreeDelivery && (
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    FREE
                  </span>
                )}
              </span>
              <span>
                {hasDropship ? (
                  <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                    Invoiced on WhatsApp
                  </span>
                ) : actualShippingFee === 0 ? (
                  <span className="font-bold text-emerald-700">FREE</span>
                ) : (
                  <span className="font-bold text-slate-900">{formatLKR(actualShippingFee)}</span>
                )}
              </span>
            </div>

            {selectedPaymentMethod === PaymentMethod.COD && actualCodFee > 0 && !hasDropship && (
              <div className="flex justify-between text-slate-600 font-medium">
                <span>COD Handling Fee:</span>
                <span className="font-bold text-slate-900">{formatLKR(actualCodFee)}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline gap-3">
              <div className="min-w-0 pr-1">
                <span className="text-sm font-black text-slate-900 font-serif">Total Payable:</span>
                <p className="text-[10px] text-slate-500 font-medium">
                  {hasDropship ? 'Product price only • Courier fee on WhatsApp invoice' : 'All taxes & packaging included'}
                </p>
              </div>
              <span className="text-base sm:text-lg font-black text-slate-900 font-mono tracking-tight shrink-0 whitespace-nowrap text-right">
                {formatLKR(finalGrandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Reassurance Card */}
        <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <Truck className="w-4 h-4 text-amber-700" />
            <span>Sri Lanka Islandwide Fulfilment Guarantee</span>
          </div>
          <p className="leading-relaxed text-[11px] text-amber-900/90">
            Every package is carefully inspected and wrapped in protective eco-friendly packaging. We partner with Prompt Xpress, Pronto, and Domex to ensure prompt doorstep delivery.
          </p>
        </div>
      </div>
    </div>
  );
};
