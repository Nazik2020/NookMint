'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Order } from '@/core/entities/Order';
import { PaymentMethod, OrderStatus, Address } from '@/shared/types/common';
import { formatLKR } from '@/shared/utils/currency';
import {
  Package,
  Search,
  MapPin,
  CheckCircle2,
  Truck,
  Banknote,
  ChevronRight,
  MessageCircle,
  ShoppingBag,
  ShieldCheck,
  Phone,
  Copy,
  Check,
  HelpCircle,
  FileText
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'track' | 'cod-guide' | 'address'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Guest Order Tracking State
  const [trackQuery, setTrackQuery] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<Order[] | null>(null);
  const [searchError, setSearchError] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Saved Address
  const [savedAddress, setSavedAddress] = useState<Address | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressFormData, setAddressFormData] = useState<Address>({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Colombo 03',
    district: 'Colombo',
    state: 'Western Province',
    pincode: '00300',
  });

  // Fetch initial orders
  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch('/api/orders/lookup');
        const data = await res.json();
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();

    // Load saved address
    try {
      const saved = localStorage.getItem('innovative_saved_address');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedAddress(parsed);
        setAddressFormData(parsed);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleCopyOrderNumber = (orderNum: string) => {
    navigator.clipboard.writeText(orderNum);
    setCopiedOrderId(orderNum);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);

    if (!trackQuery.trim() && !trackPhone.trim()) {
      setSearchError('Please enter an Order Reference or Mobile Number.');
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (trackQuery.trim()) params.append('orderNumber', trackQuery.trim());
      if (trackPhone.trim()) params.append('phone', trackPhone.trim());

      const res = await fetch(`/api/orders/lookup?${params.toString()}`);
      const data = await res.json();

      if (data.success && data.orders && data.orders.length > 0) {
        setSearchResult(data.orders);
      } else {
        setSearchError(data.message || 'No orders found matching your search.');
      }
    } catch {
      setSearchError('Network error while searching for order. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('innovative_saved_address', JSON.stringify(addressFormData));
      setSavedAddress(addressFormData);
      setIsEditingAddress(false);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* 1. Header Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="space-y-2 max-w-xl z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-[#064E3B] border border-emerald-200">
              CUSTOMER CARE & ORDER DESK
            </span>
            <span className="text-xs font-semibold text-slate-400">• Islandwide Sri Lanka</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Order Inquiries & Support Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Check your order details, receive official WhatsApp invoices, and connect directly with our support team for prompt 100% Cash on Delivery (COD) service.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 z-10 w-full md:w-auto">
          <a
            href="https://wa.me/94787844914?text=Hello%20NookMint,%20I%20have%20an%20order%20inquiry"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Support (+94 78 784 4914)</span>
          </a>

          <Link
            href="/products"
            className="w-full sm:w-auto px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Products</span>
          </Link>
        </div>
      </div>

      {/* 2. Dashboard Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 overflow-x-auto pb-px" role="tablist">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          role="tab"
          aria-selected={activeTab === 'orders'}
          className={`px-4 sm:px-6 py-3 font-bold text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'orders'
              ? 'border-[#064E3B] text-[#064E3B]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('track')}
          role="tab"
          aria-selected={activeTab === 'track'}
          className={`px-4 sm:px-6 py-3 font-bold text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'track'
              ? 'border-[#064E3B] text-[#064E3B]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Lookup by Phone</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cod-guide')}
          role="tab"
          aria-selected={activeTab === 'cod-guide'}
          className={`px-4 sm:px-6 py-3 font-bold text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'cod-guide'
              ? 'border-[#064E3B] text-[#064E3B]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Banknote className="w-4 h-4 text-emerald-700" />
          <span>COD & WhatsApp Invoice Guide</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('address')}
          role="tab"
          aria-selected={activeTab === 'address'}
          className={`px-4 sm:px-6 py-3 font-bold text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'address'
              ? 'border-[#064E3B] text-[#064E3B]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Delivery Address</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: MY ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#064E3B] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-2xs max-w-xl mx-auto text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#064E3B] flex items-center justify-center mx-auto border border-emerald-100">
                <Package className="w-8 h-8 stroke-[1.8]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  No Orders Placed Yet
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  When you submit an order for household goods, kitchenware, or gadgets, it will appear here with your WhatsApp invoice reference.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <Link
                  href="/products"
                  className="px-6 py-3 bg-[#064E3B] hover:bg-[#04382A] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-950/20 active:scale-98"
                >
                  Browse Store Catalog
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveTab('track')}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Lookup Order by Phone
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isCod = order.paymentMethod === PaymentMethod.COD;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
                  >
                    {/* Header */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 font-mono font-black text-sm text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-200">
                          <span>#{order.orderNumber}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyOrderNumber(order.orderNumber)}
                            className="text-slate-400 hover:text-emerald-700 transition-colors"
                            title="Copy Order Number"
                          >
                            {copiedOrderId === order.orderNumber ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                            order.status === OrderStatus.DELIVERED
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>

                        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                          <Banknote className="w-3.5 h-3.5 text-emerald-700" />
                          <span>100% Cash on Delivery</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                        <span>Placed: <strong className="text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</strong></span>
                        <span className="text-slate-300">|</span>
                        <span>Total: <strong className="text-slate-900 font-extrabold text-sm">{formatLKR(order.grandTotal)}</strong></span>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="p-5 sm:p-6 space-y-4">
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <div className="relative w-16 h-20 rounded-2xl overflow-hidden bg-[#FAF6F3] border border-slate-100 shrink-0">
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.title}
                                fill
                                sizes="64px"
                                className="object-cover object-center"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {item.product.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Option: <span className="font-bold text-slate-700">{item.selectedSize}</span> • Qty: <span className="font-bold text-slate-700">{item.quantity}</span>
                              </p>
                              <p className="text-xs font-extrabold text-emerald-800 mt-1">
                                {formatLKR(item.product.sellingPrice * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Address & Actions */}
                      <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                        <div className="text-slate-600 space-y-0.5">
                          <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider text-slate-400">
                            Deliver To:
                          </span>
                          <p className="font-bold text-slate-900">{order.shippingAddress.fullName} ({order.shippingAddress.phone})</p>
                          <p className="text-slate-600">{order.shippingAddress.addressLine1}, {order.shippingAddress.city} ({order.shippingAddress.district || 'Sri Lanka'})</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={`https://wa.me/94787844914?text=${encodeURIComponent(
                              `Hello NookMint! 👋\nI am inquiring about my Order #${order.orderNumber}.\nCustomer: ${order.shippingAddress.fullName}\nPhone: ${order.shippingAddress.phone}\nPlease let me know the status of my order and WhatsApp invoice.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Inquire</span>
                          </a>

                          <Link
                            href={`/order-success/${order.id}`}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Receipt</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LOOKUP BY PHONE */}
      {activeTab === 'track' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#064E3B] block">
                ORDER LOOKUP
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Find Your Order & Invoice
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your mobile number or order reference to view details and connect on WhatsApp.
              </p>
            </div>

            <form onSubmit={handleTrackSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mobile Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={trackPhone}
                    onChange={(e) => setTrackPhone(e.target.value)}
                    placeholder="e.g. 077 123 4567"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Or Order Reference Number (e.g. NM-2026-...)
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={trackQuery}
                    onChange={(e) => setTrackQuery(e.target.value)}
                    placeholder="e.g. NM-2026-8941"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] font-medium text-slate-900"
                  />
                </div>
              </div>

              {searchError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  {searchError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-3.5 bg-[#064E3B] hover:bg-[#04382A] disabled:opacity-50 text-white font-extrabold uppercase tracking-wider text-xs rounded-xl shadow-md shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSearching ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Locating Order...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search Order Status</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Search Results Display */}
          {searchResult && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">
                Search Results ({searchResult.length})
              </h3>
              {searchResult.map((resOrder) => (
                <div key={resOrder.id} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-black text-sm text-slate-900">#{resOrder.orderNumber}</span>
                      <p className="text-xs text-slate-500 mt-0.5">Placed: {new Date(resOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {resOrder.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1">
                    <p>Delivering To: <strong>{resOrder.shippingAddress.fullName}</strong> ({resOrder.shippingAddress.city})</p>
                    <p>Payment: <strong>Cash on Delivery (Doorstep)</strong> • Total: <strong className="text-slate-900">{formatLKR(resOrder.grandTotal)}</strong></p>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      href={`/order-success/${resOrder.id}`}
                      className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      View Order Receipt
                    </Link>
                    <a
                      href={`https://wa.me/94787844914?text=Hello%20NookMint,%20inquiring%20about%20Order%20%23${resOrder.orderNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#25D366] text-white text-xs font-bold rounded-xl hover:bg-[#20bd5a] transition-colors flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Check</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CASH ON DELIVERY & INVOICING GUIDE */}
      {activeTab === 'cod-guide' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#064E3B] block">
                100% CASH ON DELIVERY (COD) ASSURANCE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                How Ordering & WhatsApp Invoicing Works
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                We believe in simple, transparent shopping. You do not need to make online card payments or bank deposits — everything is handled with Cash on Delivery across all 25 districts in Sri Lanka.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#064E3B] text-white flex items-center justify-center font-black">
                  1
                </div>
                <h4 className="font-extrabold text-slate-900">Submit Your Details</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Enter your Name, WhatsApp Contact Number, and Delivery Address. Only the product price is listed on the site.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#064E3B] text-white flex items-center justify-center font-black">
                  2
                </div>
                <h4 className="font-extrabold text-slate-900">WhatsApp Official Invoice</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Our team sends your official invoice including courier delivery charges directly to your WhatsApp before dispatch.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#064E3B] text-white flex items-center justify-center font-black">
                  3
                </div>
                <h4 className="font-extrabold text-slate-900">Doorstep Cash Payment</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Our courier driver delivers your package. Inspect it and pay exact cash. Zero advance payments needed!
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-900 block">Have an urgent question or delivery modification?</span>
                <span className="text-slate-500 text-[11px]">Our WhatsApp support is active daily.</span>
              </div>
              <a
                href="https://wa.me/94787844914?text=Hi%20NookMint!%20I%20have%20a%20question%20about%20Cash%20on%20Delivery%20orders."
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp +94 78 784 4914</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SAVED ADDRESS */}
      {activeTab === 'address' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#064E3B] block">
                  LOCAL BROWSER STORAGE
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Saved Delivery Address
                </h2>
              </div>
              {savedAddress && !isEditingAddress && (
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(true)}
                  className="text-xs font-bold text-[#064E3B] hover:underline cursor-pointer"
                >
                  Edit Address
                </button>
              )}
            </div>

            {isEditingAddress || !savedAddress ? (
              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={addressFormData.fullName}
                      onChange={(e) => setAddressFormData({ ...addressFormData, fullName: e.target.value })}
                      placeholder="e.g. Kasun Perera"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={addressFormData.phone}
                      onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                      placeholder="e.g. 077 123 4567"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      value={addressFormData.addressLine1}
                      onChange={(e) => setAddressFormData({ ...addressFormData, addressLine1: e.target.value })}
                      placeholder="e.g. No 15, Station Road"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City / Town *</label>
                    <input
                      type="text"
                      required
                      value={addressFormData.city}
                      onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                      placeholder="e.g. Maharagama"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                    <input
                      type="text"
                      value={addressFormData.district || 'Colombo'}
                      onChange={(e) => setAddressFormData({ ...addressFormData, district: e.target.value })}
                      placeholder="e.g. Colombo"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#064E3B] hover:bg-[#04382A] text-white text-xs font-extrabold rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Save Address
                  </button>
                  {savedAddress && (
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <MapPin className="w-4 h-4 text-[#064E3B]" />
                  <span>{savedAddress.fullName}</span>
                </div>
                <p className="text-slate-600">{savedAddress.addressLine1}</p>
                {savedAddress.addressLine2 && <p className="text-slate-600">{savedAddress.addressLine2}</p>}
                <p className="text-slate-600">{savedAddress.city}, {savedAddress.district || 'Sri Lanka'}</p>
                <p className="font-mono text-slate-700">Mobile: {savedAddress.phone}</p>
                <p className="text-[11px] text-emerald-700 font-semibold pt-1">
                  ✓ Automatically auto-fills when you checkout!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
