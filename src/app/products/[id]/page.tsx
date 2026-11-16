import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MockProductRepository } from '@/infrastructure/repositories/MockProductRepository';
import { ProductDetailClient } from './ProductDetailClient';
import Link from 'next/link';

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const repository = new MockProductRepository();
  const product = await repository.getProductById(id);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nookmint.com';
  const productImage = product.images?.[0] || '/nookmint_images/hero.png';
  const priceFormatted = `LKR ${product.sellingPrice.toLocaleString()}`;

  return {
    title: `${product.title} - ${priceFormatted}`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.title} | NookMint Sri Lanka`,
      description: `Buy ${product.title} online for ${priceFormatted}. Cash on Delivery across Sri Lanka.`,
      url: `${siteUrl}/products/${product.id}`,
      images: [
        {
          url: productImage,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} - ${priceFormatted}`,
      description: product.description.slice(0, 160),
      images: [productImage],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const repository = new MockProductRepository();
  const product = await repository.getProductById(id);

  if (!product || product.isHidden || product.status === 'inactive') {
    notFound();
  }

  const categoryName = typeof product.category === 'string' ? product.category : 'Catalogue';
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nookmint.com';

  // Schema.org Product structured data for Google Search rich snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images,
    description: product.description,
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'NookMint',
    },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/products/${product.id}`,
      priceCurrency: 'LKR',
      price: product.sellingPrice,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Google Rich Snippets JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
