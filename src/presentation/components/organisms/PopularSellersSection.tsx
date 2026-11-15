import React from 'react';
import Link from 'next/link';
import { Star, ArrowUpRight, ArrowRight, LayoutGrid } from 'lucide-react';

interface SellerBrand {
  id: string;
  name: string;
  rating: number;
  reviews: string;
  iconBg: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

export const PopularSellersSection: React.FC = () => {
  const sellers: SellerBrand[] = [
    {
      id: 'seller-apple',
      name: 'Easy Fashion Ltd.',
      rating: 5,
      reviews: '1.5k Review',
      iconBg: 'bg-slate-100 text-slate-900',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.65-1.09 1.73-.95 2.76 1.01.08 2.06-.51 2.68-1.26z" />
        </svg>
      ),
    },
    {
      id: 'seller-outfit',
      name: 'Outfit Fashion',
      rating: 5,
      reviews: '1.5k Review',
      iconBg: 'bg-rose-50 text-rose-500 font-bold',
      isActive: true, // Active Highlighted card matching Screenshot 5
      icon: (
        <span className="font-sans font-black text-sm tracking-tight text-rose-500">PI</span>
      ),
    },
    {
      id: 'seller-artisan',
      name: 'Artisan Fashion',
      rating: 5,
      reviews: '1.5k Review',
      iconBg: 'bg-amber-50 text-amber-500',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
          <path d="M2 19h20v2H2zM2 5l5 3.5L12 2l5 6.5L22 5v12H2z" />
        </svg>
      ),
    },
    {
      id: 'seller-sara',
      name: 'Sara Life Style',
      rating: 5,
      reviews: '1.5k Review',
      iconBg: 'bg-slate-100 text-slate-800',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-6h2v6zm0-8h-2V7h2v1z" />
        </svg>
      ),
    },
    {
      id: 'seller-twelve',
      name: 'Twelve Clothing',
      rating: 5,
      reviews: '1.5k Review',
      iconBg: 'bg-orange-500 text-white font-bold',
      icon: (
        <span className="font-sans font-black text-xs">וח</span>
      ),
    },
    {
      id: 'seller-motion',
      name: 'Motion View',
      rating: 5,
      reviews: '1.5k Review',
      iconBg: 'bg-purple-100 text-purple-600',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <path d="M8 12 Q12 8 16 12 Q12 16 8 12" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: 'seller-oneplus',
      name: 'One Plus',
      rating: 5,
      reviews: '1.5k Review',
      iconBg: 'bg-red-50 text-red-600 font-bold',
      icon: (
        <span className="font-sans font-black text-xs text-red-600">1+</span>
      ),
    },
    {
      id: 'seller-ferrari',
      name: 'Ferrari',
      rating: 5,
      reviews: '1.5k Review',
      iconBg: 'bg-yellow-400 text-black',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
        </svg>
      ),
    },
    {
      id: 'seller-easy',
      name: 'Easy Fashion Ltd.',
      rating: 5,
      reviews: '1.5k Review',
      iconBg: 'bg-amber-100 text-amber-600',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
          <path d="M2 19h20v2H2zM2 5l5 3.5L12 2l5 6.5L22 5v12H2z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center space-y-8" aria-label="Most Popular Sellers">
      {/* Centered Heading matching Screenshot 5 */}
      <div className="space-y-2 max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          Most Popular Seller
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Dining, living, and desk areas serve their purposes in total harmony of style.
        </p>
      </div>

      {/* 2-Row × 5-Column Grid matching Screenshot 5 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
        {sellers.map((s) => (
          <div
            key={s.id}
            className={`group rounded-2xl p-5 flex flex-col items-center justify-between transition-all duration-300 relative border ${
              s.isActive
                ? 'bg-[#0F3E36] text-white border-transparent shadow-lg scale-102'
                : 'bg-white text-slate-900 border-slate-200/80 hover:border-slate-300 hover:shadow-md'
            }`}
          >
            {/* Top Brand Icon */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 mb-3 shadow-2xs ${s.iconBg}`}>
              {s.icon}
            </div>

            {/* Brand Title */}
            <h3 className={`font-bold text-xs sm:text-sm tracking-tight truncate max-w-full ${
              s.isActive ? 'text-white' : 'text-slate-900'
            }`}>
              {s.name}
            </h3>

            {/* 5-Star Rating */}
            <div className="flex items-center gap-1 pt-1.5 pb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className={`text-[10px] ${s.isActive ? 'text-emerald-200' : 'text-slate-400'}`}>
                ({s.reviews})
              </span>
            </div>

            {/* Bottom Arrow Action Icon */}
            {s.isActive ? (
              <div className="w-8 h-8 rounded-full bg-[#EA580C] text-white flex items-center justify-center shadow-xs">
                <ArrowRight className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {/* 10th Card: Explore More matching Screenshot 5 */}
        <Link
          href="/products"
          className="group rounded-2xl p-5 bg-[#EEF2F6] hover:bg-[#E2E8F0] border border-slate-200/80 flex flex-col items-center justify-center gap-2.5 transition-all text-slate-800 hover:shadow-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-white text-slate-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <LayoutGrid className="w-6 h-6 text-slate-800" />
          </div>
          <span className="font-extrabold text-sm text-slate-900">
            Explore More
          </span>
        </Link>
      </div>
    </section>
  );
};