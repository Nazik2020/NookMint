import React from 'react';
import Link from 'next/link';
import { Product } from '@/core/entities/Product';
import { ProductCard } from '@/presentation/components/molecules/ProductCard';
import { MockProductRepository } from '@/infrastructure/repositories/MockProductRepository';
import { ArrowRight } from 'lucide-react';

interface PopularProductsSectionProps {
  products: Product[];
}

export const PopularProductsSection: React.FC<PopularProductsSectionProps> = ({ products }) => {
  // Dynamically showcase products selected by Admin as Popular / Best Seller
  const dynamicPopular = products.filter((p) => p.isBestSeller === true);

  const displayProducts =
    dynamicPopular.length > 0
      ? dynamicPopular
      : products.slice(0, 5);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5" aria-label="Popular Products">
      {/* Header Row matching Reference Design */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Popular Products
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Top customer favourites across household, kitchenware, garden & smart audio
          </p>
        </div>

        <Link
          href="/products"
          className="text-xs sm:text-sm font-bold text-[#064E3B] hover:text-[#04382A] flex items-center gap-1 transition-colors"
        >
          <span>View All Products</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 5-Column Responsive Product Grid */}
      {displayProducts.length === 0 ? (
        <div className="p-8 sm:p-10 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
          <p className="text-sm font-bold text-slate-700">New Products Arriving Soon!</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Our catalog is currently being updated with fresh inventory. Check back shortly or inquire directly on WhatsApp.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4.5">
          {displayProducts.map((product) => (
            <div key={product.id} className="min-w-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
