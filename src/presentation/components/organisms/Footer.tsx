'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/presentation/components/atoms/BrandLogo';
import { MessageCircle, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Isolate Seller Admin from storefront footer
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#004D40] text-white border-t border-emerald-950" aria-label="Store Footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Column 1: Brand & Tagline matching Reference Image 1 */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo variant="footer" />

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal max-w-sm">
              Your trusted store for household & kitchen essentials, home & garden supplies, and smart audio gadgets. Providing islandwide Cash on Delivery across Sri Lanka.
            </p>
          </div>

          {/* Column 2: Shop */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-extrabold text-xs sm:text-sm tracking-wider uppercase text-white">Shop</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-emerald-100/80 font-normal">
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/products?category=Household+%26+Kitchen" className="hover:text-white transition-colors">Household & Kitchen</Link></li>
              <li><Link href="/products?category=Home+%26+Garden" className="hover:text-white transition-colors">Home & Garden</Link></li>
              <li><Link href="/products?category=Smart+Gadgets+%26+Audio" className="hover:text-white transition-colors">Smart Gadgets</Link></li>
            </ul>
          </div>

          {/* Column 3: Help */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-extrabold text-xs sm:text-sm tracking-wider uppercase text-white">Help</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-emerald-100/80 font-normal">
              <li><Link href="/delivery" className="hover:text-white transition-colors">How to Order (COD)</Link></li>
              <li><a href="https://wa.me/94714897262?text=Hello%20NookMint,%20I%20would%20like%20to%20check%20my%20order%20status" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Order Inquiries (WhatsApp)</a></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Return Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: About */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-extrabold text-xs sm:text-sm tracking-wider uppercase text-white">About</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-emerald-100/80 font-normal">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Our Store</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Column 5: Contact */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-extrabold text-xs sm:text-sm tracking-wider uppercase text-white">Contact</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-100/80 font-normal">
              <li>
                <a
                  href="https://wa.me/94714897262?text=Hello%20NookMint%2C%20I%20have%20an%20inquiry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>WhatsApp Orders</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+94714897262"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>+94 71 489 7262</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@nookmint.lk"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span className="text-[11.5px] sm:text-xs">support@nookmint.lk</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Standard Legal Navigation */}
      <div className="border-t border-emerald-800/60 bg-[#00382E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200/70">
          <p>© {new Date().getFullYear()} NookMint · Built by AspireV Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-emerald-700/60">·</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <span className="text-emerald-700/60">·</span>
            <Link href="/delivery" className="hover:text-white transition-colors">Delivery Info</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
