import { MockProductRepository } from '@/infrastructure/repositories/MockProductRepository';
import { SettingsRepository } from '@/infrastructure/repositories/SettingsRepository';
import { ProductCard } from '@/presentation/components/molecules/ProductCard';
import Link from 'next/link';
import { ArrowUpDown, X, Tag, Sparkles, Filter, Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
    filter?: string;
    sort?: 'price-low' | 'price-high' | 'rating' | 'newest';
    codOnly?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const repository = new MockProductRepository();

  const isNewArrival = resolvedParams.filter === 'new';
  const isOnSale = resolvedParams.filter === 'sale' || resolvedParams.category === 'sale';
  const isCodOnly = resolvedParams.codOnly === 'true';

  const products = await repository.filterProducts({
    category: isOnSale ? undefined : resolvedParams.category,
    searchQuery: resolvedParams.q,
    sortBy: resolvedParams.sort,
    isNewArrival,
    onSaleOnly: isOnSale,
    codOnly: isCodOnly,
  });

  const isAllActive = !resolvedParams.category && !resolvedParams.q && !resolvedParams.filter && !resolvedParams.codOnly;
  
  const settings = await new SettingsRepository().getSettings();
  const rawCategories = settings.categories && settings.categories.length > 0
    ? settings.categories
    : ['Household & Kitchen', 'Home & Garden', 'Smart Gadgets & Audio'];
  // Deduplicate and filter out legacy/empty category names
  const categories = Array.from(
    new Set(
      rawCategories
        .map((c) => (c === 'Household & Daily Items' ? 'Household & Kitchen' : c))
        .filter((c) => c !== 'Groceries & Essentials' && c !== 'Fashion' && c !== 'Outfits')
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/80 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#064E3B] text-[11px] font-bold tracking-widest uppercase border border-emerald-200">
            <Layers className="w-3.5 h-3.5" />
            <span>NOOKMINT CURATED CATALOGUE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-serif">
            {resolvedParams.q
              ? `Search Results for "${resolvedParams.q}"`
              : resolvedParams.category
              ? resolvedParams.category
              : 'All Products & Departments'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Showing <strong className="text-slate-900 font-bold">{products.length}</strong> verified products across household essentials, kitchenware, gardening tools, and smart audio gadgets. 100% Cash on Delivery (COD) islandwide across Sri Lanka.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-start md:self-end">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Sort:</span>
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <Link
              href={`/products?${new URLSearchParams({ ...resolvedParams, sort: 'newest' }).toString()}`}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                !resolvedParams.sort || resolvedParams.sort === 'newest'
                  ? 'bg-[#064E3B] text-white border-[#064E3B] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Featured
            </Link>
            <Link
              href={`/products?${new URLSearchParams({ ...resolvedParams, sort: 'price-low' }).toString()}`}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                resolvedParams.sort === 'price-low'
                  ? 'bg-[#064E3B] text-white border-[#064E3B] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Price: Low → High
            </Link>
            <Link
              href={`/products?${new URLSearchParams({ ...resolvedParams, sort: 'newest' }).toString()}`}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                resolvedParams.sort === 'newest'
                  ? 'bg-[#064E3B] text-white border-[#064E3B] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Newest Arrivals
            </Link>
          </div>
        </div>
      </div>

      {/* Active Search Notification */}
      {resolvedParams.q && (
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs text-slate-800 shadow-2xs">
          <span>Search results for: <strong className="font-bold text-sm text-slate-900">&ldquo;{resolvedParams.q}&rdquo;</strong></span>
          <Link
            href="/products"
            className="text-xs font-extrabold text-[#064E3B] hover:underline flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Search</span>
          </Link>
        </div>
      )}

      {/* Filter Chips Bar */}
      <div className="space-y-3.5 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
        {/* Category Row */}
        <div className="flex flex-wrap items-center gap-2" role="navigation" aria-label="Category filters">
          <Link
            href="/products"
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all border ${
              isAllActive
                ? 'bg-[#064E3B] text-white border-[#064E3B] shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:border-slate-300 hover:bg-white'
            }`}
          >
            All Products ({products.length})
          </Link>

          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}`}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                resolvedParams.category === cat
                  ? 'bg-[#064E3B] text-white border-[#064E3B] shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:border-slate-300 hover:bg-white'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Quick Filter Refinements */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Filter By:</span>
          </span>

          <Link
            href={`/products?filter=new`}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all border ${
              resolvedParams.filter === 'new'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3 h-3 inline mr-1 text-amber-500" />
            New Arrivals
          </Link>

          <Link
            href={`/products?codOnly=true`}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all border ${
              isCodOnly
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Cash on Delivery Eligible
          </Link>

          {(resolvedParams.category || resolvedParams.filter || resolvedParams.q || resolvedParams.codOnly) && (
            <Link
              href="/products"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline ml-auto"
            >
              Reset Filters
            </Link>
          )}
        </div>
      </div>

      {/* Product Listing */}
      {products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs space-y-3 max-w-lg mx-auto">
          <p className="text-slate-800 font-bold text-sm">No items found for the selected filter.</p>
          <p className="text-xs text-slate-500">Try adjusting your filters or explore all categories in our catalogue.</p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-block px-5 py-2.5 bg-[#064E3B] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-[#04382A] transition-colors shadow-xs"
            >
              Clear all filters
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-7">
          {products.map((p) => (
            <div key={p.id} className="min-w-0">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
