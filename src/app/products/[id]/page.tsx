import { notFound } from 'next/navigation';
import { MockProductRepository } from '@/infrastructure/repositories/MockProductRepository';
import { ProductDetailClient } from './ProductDetailClient';
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

  if (!product || product.isHidden || product.status === 'inactive') {
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

      {/* Reactive Product Presentation with Color-Sync Gallery */}
      <ProductDetailClient product={product} />
    </div>
  );
}
