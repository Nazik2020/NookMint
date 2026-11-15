'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/core/entities/Product';
import { ProductCard } from '@/presentation/components/molecules/ProductCard';
import { MockProductRepository } from '@/infrastructure/repositories/MockProductRepository';
import { ArrowRight } from 'lucide-react';

interface NewArrivalsSectionProps {
  products: Product[];
}

export const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = ({ products }) => {
  // Dynamically filter all products flagged as New Arrivals by admin
  const dynamicNewArrivals = products.filter((p) => p.isNewArrival);

  const displayProducts =
    dynamicNewArrivals.length > 0
      ? dynamicNewArrivals
      : products.slice(0, 8);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5" aria-label="New Arrivals">
      {/* Header Row matching Reference Image 1 */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            New Arrivals
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Latest additions to our smart tech gadgets, kitchenware & gardening supplies
          </p>
        </div>

        <Link
          href="/products?filter=new"
          className="text-xs sm:text-sm font-bold text-[#064E3B] hover:text-emerald-700 flex items-center gap-1 transition-colors"
        >
          <span>View All New Arrivals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Clean 4-Column Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        {displayProducts.map((product) => (
          <div key={product.id} className="min-w-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};
