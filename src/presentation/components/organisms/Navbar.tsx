'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/presentation/context/CartContext';
import { BrandLogo } from '@/presentation/components/atoms/BrandLogo';
import { AnnouncementBar } from '@/presentation/components/molecules/AnnouncementBar';
import {
  ShoppingBag,
  Search,
  MessageCircle,
  Menu,
  X,
  ChevronDown,
  User,
  LayoutGrid,
  Tag,
  Phone,
  ShoppingCart,
  Home,
  Shirt,
  Zap,
  Sprout,
  Headphones,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { summary } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  // Prevent background scrolling on mobile when navigation drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // If on Seller Admin, do not render storefront header
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  // Full-Screen Dedicated Mobile Navigation Drawer (Completely isolated, zero bleed-through)
  if (mobileMenuOpen) {
    return (
      <div
        className="fixed inset-0 z-[99999] bg-white w-full h-[100dvh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
      >
        {/* Mobile Drawer Top Bar: Brand Logo + Cart + Close Button */}
        <div className="px-4 py-3 border-b border-slate-200/90 flex items-center justify-between bg-white shrink-0">
          <BrandLogo variant="navbar" />
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 relative p-2"
              title="Shopping Cart"
              aria-label={`Shopping cart with ${summary.itemsCount} items`}
            >
              <div className="relative flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-slate-700" />
                <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-[#EA580C] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {summary.itemsCount > 0 ? summary.itemsCount : 0}
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-800 transition-colors shadow-2xs"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-slate-900" />
            </button>
          </div>
        </div>

        {/* Mobile Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 bg-white overscroll-contain">
          {/* Quick Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004D40]"
            />
          </form>

          {/* Department Navigation */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">
              Browse Departments
            </span>
            <nav className="flex flex-col space-y-1.5 text-sm font-bold text-slate-800">
              <Link
                href="/products?category=Household+%26+Kitchen"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-3 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/70 active:bg-emerald-100 flex items-center gap-3 text-slate-900 border border-slate-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                  <Home className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Household &amp; Kitchen</div>
                  <div className="text-[11px] text-slate-500 font-normal">Cookware, storage &amp; home essentials</div>
                </div>
              </Link>
              <Link
                href="/products?category=Home+%26+Garden"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-3 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/70 active:bg-emerald-100 flex items-center gap-3 text-slate-900 border border-slate-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                  <Sprout className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Home &amp; Garden</div>
                  <div className="text-[11px] text-slate-500 font-normal">Gardening tools, planters &amp; outdoor</div>
                </div>
              </Link>
              <Link
                href="/products?category=Smart+Gadgets+%26+Audio"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-3 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/70 active:bg-emerald-100 flex items-center justify-between text-slate-900 border border-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                    <Headphones className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Smart Gadgets &amp; Audio</div>
                    <div className="text-[11px] text-slate-500 font-normal">Wireless earbuds &amp; lapel mics</div>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 shrink-0">
                  Hot
                </span>
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-3 rounded-2xl bg-emerald-50/40 hover:bg-emerald-50 flex items-center gap-3 text-slate-900 border border-emerald-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-[#004D40] text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="font-bold text-[#004D40]">Explore All Products</div>
                  <div className="text-[11px] text-slate-500 font-normal">Browse full catalogue</div>
                </div>
              </Link>
            </nav>
          </div>

          {/* WhatsApp Direct Order Concierge */}
          <div className="pt-2">
            <a
              href="https://wa.me/94714897262?text=Hello%20NookMint%2C%20I%20would%20like%20to%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98"
            >
              <MessageCircle className="w-4.5 h-4.5" />
              <span>Order on WhatsApp (+94 71 489 7262)</span>
            </a>
          </div>

          {/* Islandwide COD Banner */}
          <div className="p-3.5 rounded-2xl bg-[#004D40] text-white text-center space-y-0.5">
            <div className="text-xs font-bold">100% Cash on Delivery</div>
            <div className="text-[10px] text-emerald-200">Zero advance payment required across all 25 districts</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-white w-full max-w-full shadow-2xs">
      {/* 1. Top Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Main Header Row (Logo, Search Bar, Action Links) */}
      <div className="border-b border-slate-200/90 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 lg:gap-8">
          {/* Brand Logo */}
          <BrandLogo variant="navbar" />

          {/* Prominent Center Search Bar (Reference 1 Pill Shape) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl relative items-center"
          >
            <div className="relative w-full flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products and categories"
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004D40] focus:bg-white transition-all"
                aria-label="Search products and categories"
              />
            </div>
          </form>

          {/* Right Header Navigation Icons (WhatsApp | Cart | Account) matching Reference Image 1 */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* WhatsApp Direct Ordering */}
            <a
              href="https://wa.me/94714897262?text=Hello%20NookMint%2C%20I%20would%20like%20to%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
              title="WhatsApp Direct Ordering"
            >
              <div className="w-5 h-5 flex items-center justify-center text-emerald-600">
                <MessageCircle className="w-5 h-5 fill-emerald-600/10 text-emerald-600" />
              </div>
              <span>WhatsApp</span>
            </a>

            {/* Cart with Orange Counter Badge */}
            <Link
              href="/cart"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#004D40] transition-colors relative group"
              title="Shopping Cart"
              aria-label={`Shopping cart with ${summary.itemsCount} items`}
            >
              <div className="relative flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-slate-700 group-hover:text-[#004D40] transition-colors" />
                <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-[#EA580C] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {summary.itemsCount > 0 ? summary.itemsCount : 0}
                </span>
              </div>
              <span className="hidden sm:inline pl-1">Cart</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-4.5 h-4.5 text-slate-900" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Row */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products and categories"
              className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004D40]"
            />
          </form>
        </div>
      </div>

      {/* 3. Sub-Navigation Bar (Row 2 - Category Bar matching Reference Image 1) */}
      <div className="hidden md:block bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-start gap-8">
          {/* Left: Prominent [All Categories v] Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              onMouseEnter={() => setCategoriesOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#004D40] hover:bg-[#00332c] text-white text-xs font-bold tracking-wide flex items-center gap-2 transition-colors shadow-2xs"
              aria-expanded={categoriesOpen}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-200" />
              <span>All Categories</span>
              <ChevronDown className={`w-3.5 h-3.5 text-emerald-200 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {categoriesOpen && (
              <div
                onMouseLeave={() => setCategoriesOpen(false)}
                className="absolute top-full left-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-50 animate-fadeIn"
              >
                <Link
                  href="/products?category=Household+%26+Kitchen"
                  onClick={() => setCategoriesOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#004D40] rounded-xl transition-colors"
                >
                  <Home className="w-4 h-4 text-emerald-600" />
                  <span>Household & Kitchen</span>
                </Link>
                <Link
                  href="/products?category=Home+%26+Garden"
                  onClick={() => setCategoriesOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#004D40] rounded-xl transition-colors"
                >
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  <span>Home & Garden Supplies</span>
                </Link>
                <Link
                  href="/products?category=Smart+Gadgets+%26+Audio"
                  onClick={() => setCategoriesOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#004D40] rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Headphones className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span>Smart Gadgets (Earbuds, Mics)</span>
                  </div>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 tracking-wider">
                    Hot
                  </span>
                </Link>
                <Link
                  href="/products"
                  onClick={() => setCategoriesOpen(false)}
                  className="block px-3 py-2 text-xs font-bold text-[#004D40] hover:bg-emerald-50 rounded-xl transition-colors border-t border-slate-100 mt-1"
                >
                  View All Products Catalogue →
                </Link>
              </div>
            )}
          </div>

          {/* Department Horizontal Links matching Updated Inventory Focus */}
          <nav className="flex items-center gap-7 text-xs font-bold text-slate-700" aria-label="Department Links">
            <Link
              href="/products?category=Household+%26+Kitchen"
              className="flex items-center gap-1.5 hover:text-[#004D40] transition-colors py-1"
            >
              <Home className="w-3.5 h-3.5 text-slate-500" />
              <span>Household & Kitchen</span>
            </Link>

            <Link
              href="/products?category=Home+%26+Garden"
              className="flex items-center gap-1.5 hover:text-[#004D40] transition-colors py-1"
            >
              <Sprout className="w-3.5 h-3.5 text-slate-500" />
              <span>Gardening</span>
            </Link>

            <Link
              href="/products?category=Smart+Gadgets+%26+Audio"
              className="flex items-center gap-1.5 hover:text-[#004D40] transition-colors py-1"
            >
              <Headphones className="w-3.5 h-3.5 text-slate-500" />
              <span>Smart Gadgets</span>
            </Link>

            <Link
              href="/products?filter=sale"
              className="flex items-center gap-1.5 hover:text-[#004D40] transition-colors py-1"
            >
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              <span>Offers</span>
            </Link>

            <Link
              href="/contact"
              className="flex items-center gap-1.5 hover:text-[#004D40] transition-colors py-1"
            >
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>Contact</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
