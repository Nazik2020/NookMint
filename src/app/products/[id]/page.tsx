import { notFound } from 'next/navigation';
import { MockProductRepository } from '@/infrastructure/repositories/MockProductRepository';
import { PriceTag } from '@/presentation/components/atoms/PriceTag';
import { CodBadge } from '@/presentation/components/atoms/CodBadge';
import { ProductGallery } from '@/presentation/components/molecules/ProductGallery';
import { ProductDetailClient } from './ProductDetailClient';
import { ShieldCheck, Truck, RotateCcw, Banknote, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const repository = new MockProductRepository();
  const product = await repository.getProductById(id);

  if (!product) {
    notFound();
  }

  const categoryName = typeof product.category === 'string' ? product.category : 'Catalogue';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#064E3B] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#064E3B] transition-colors">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${encodeURIComponent(categoryName)}`} className="hover:text-[#064E3B] transition-colors">
          {categoryName}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-xs">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Interactive Product Gallery (Images & Video Showcase) */}
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} title={product.title} videoUrl={product.videoUrl} />
        </div>

        {/* Right Column: Details & Purchasing Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                {product.subcategory || categoryName}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-extrabold bg-emerald-50 text-[#004D40] border border-emerald-200/90 flex items-center gap-1">
                <span>Code: {product.variants?.[0]?.sku || product.id}</span>
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

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {product.description}
            </p>

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

          {/* Interactive Client Component for Options Selection & Order Actions */}
          <ProductDetailClient product={product} />

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
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-[11px] text-slate-600 font-medium">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <Truck className="w-4 h-4 mx-auto text-emerald-700" />
              <span>Islandwide Delivery</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <ShieldCheck className="w-4 h-4 mx-auto text-emerald-600" />
              <span>Authentic Quality</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <RotateCcw className="w-4 h-4 mx-auto text-amber-600" />
              <span>Easy Return Check</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
