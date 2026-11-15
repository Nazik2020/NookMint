'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Order } from '@/core/entities/Order';
import { PaymentMethod } from '@/shared/types/common';
import { formatLKR } from '@/shared/utils/currency';
import {
  CheckCircle2,
  Banknote,
  MapPin,
  Calendar,
  MessageCircle,
  Copy,
  Check,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  PhoneCall
} from 'lucide-react';

export const OrderSuccessClient: React.FC<{ order: Order }> = ({ order }) => {
  const [copiedRef, setCopiedRef] = useState(false);

  const handleCopyRef = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello NookMint! 👋\nI have placed a Cash on Delivery order on your website.\n\n` +
      `📦 Order Number: #${order.orderNumber}\n` +
      `👤 Customer: ${order.shippingAddress.fullName}\n` +
      `📱 Mobile: ${order.shippingAddress.phone}${order.shippingAddress.alternatePhone ? ` / ${order.shippingAddress.alternatePhone}` : ''}\n` +
      `💳 Payment: Cash on Delivery (COD)\n` +
      `💰 Total Due: ${formatLKR(order.grandTotal)}\n` +
      `📍 Delivery: ${order.shippingAddress.addressLine1}, ${order.shippingAddress.city} (${order.shippingAddress.district || 'Sri Lanka'})\n\n` +
      `Please let me know when it is dispatched. Thank you!`
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-8">
      {/* 1. Main Confirmation Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-2xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700 block">
            CASH ON DELIVERY ORDER CONFIRMED • AWAITING DISPATCH
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Thank You for Choosing NookMint!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            We have received your delivery details and our team is preparing your package for courier handover.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl mt-1">
            <span className="text-xs text-slate-500 font-medium">Order Reference:</span>
            <span className="font-mono font-black text-sm text-slate-900">#{order.orderNumber}</span>
            <button
              type="button"
              onClick={handleCopyRef}
              className="text-slate-400 hover:text-emerald-700 transition-colors ml-1"
              title="Copy Order Reference"
            >
              {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Official WhatsApp Invoice Notice */}
          <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start sm:items-center gap-2.5 text-left max-w-xl mx-auto">
            <MessageCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
            <p className="leading-relaxed text-[11px]">
              <strong>Official Invoice Notice:</strong> Your official order invoice with exact courier delivery fees will be sent directly to your WhatsApp (<span className="font-bold font-mono">{order.shippingAddress.phone}</span>). Pay 100% Cash on Delivery (COD) upon courier arrival.
            </p>
          </div>
        </div>

        {/* 2. Cash on Delivery (COD) Doorstep Notice Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-[#F0FDF4] border border-emerald-200/90 text-left space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-emerald-950 text-sm sm:text-base">
              <Banknote className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>Doorstep Cash on Delivery (COD) Payment</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-700 text-white font-extrabold text-[10px] tracking-wider uppercase">
              Zero Advance Required
            </span>
          </div>

          <p className="text-xs text-emerald-950 leading-relaxed">
            Please have cash of <strong className="text-slate-900 font-black text-sm">{formatLKR(order.grandTotal)}</strong> ready for our courier driver upon package handover.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-emerald-900 pt-2 border-t border-emerald-200/70">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Courier driver calls you on: <strong>{order.shippingAddress.phone}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Islandwide Tracked Express Courier</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Inspect parcel package before cash handover</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>No online cards or bank deposit slips needed</span>
            </div>
          </div>
        </div>

        {/* 3. Delivery & Customer Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-4 border-t border-slate-100 text-xs">
          <div className="space-y-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-slate-500 font-semibold flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Estimated Delivery Timeline:</span>
            </span>
            <p className="font-bold text-slate-900">{order.estimatedDeliveryDate || '1 - 3 Business Days'}</p>
            <p className="text-[11px] text-slate-500">Prompt Xpress / Domex Courier Islandwide</p>
          </div>

          <div className="space-y-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-slate-500 font-semibold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Delivering To:</span>
            </span>
            <p className="font-bold text-slate-900 truncate">
              {order.shippingAddress.fullName}
            </p>
            <p className="text-[11px] text-slate-600 truncate">
              {order.shippingAddress.addressLine1}, {order.shippingAddress.city} ({order.shippingAddress.district || 'Sri Lanka'})
            </p>
          </div>
        </div>

        {/* 4. Action Buttons */}
        <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`https://wa.me/94787844914?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Confirm on WhatsApp</span>
          </a>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <span>View in Customer Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/products"
            className="w-full sm:w-auto px-6 py-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};
