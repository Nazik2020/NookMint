import { MockProductRepository } from '@/infrastructure/repositories/MockProductRepository';
import { HeroSection } from '@/presentation/components/organisms/HeroSection';
import { BentoFeatureBanners } from '@/presentation/components/organisms/BentoFeatureBanners';
import { CategorySection } from '@/presentation/components/organisms/CategorySection';
import { PopularProductsSection } from '@/presentation/components/organisms/PopularProductsSection';
import { MidPageCalloutBanner } from '@/presentation/components/organisms/MidPageCalloutBanner';
import { NewArrivalsSection } from '@/presentation/components/organisms/NewArrivalsSection';
import { OrderWorkflowSection } from '@/presentation/components/organisms/OrderWorkflowSection';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * HomePage - Modular Clean Architecture Presentation Layer
 * Pixel-Perfect Multi-Category E-Commerce Experience adhering to Client Requirements & Reference Design
 */
export default async function HomePage() {
  const repository = new MockProductRepository();
  const products = await repository.getAllProducts();

  return (
    <div className="space-y-6 sm:space-y-10 pb-16 bg-white">
      {/* 1. Hero Section ("Everyday essentials, made easy.") */}
      <HeroSection />

      {/* 2. Department Feature Banners (Fresh Picks & Style Essentials) */}
      <BentoFeatureBanners />

      {/* 3. Shop By Category Showcase (Groceries, Household, Fashion) */}
      <CategorySection />

      {/* 4. Popular Products Grid (5-column clean packshots) */}
      <PopularProductsSection products={products} />

      {/* 5. Mid-Page Callout Banner ("Find what you need, faster.") */}
      <MidPageCalloutBanner />

      {/* 6. New Arrivals Grid (4-column clean packshots) */}
      <NewArrivalsSection products={products} />

      {/* 7. 3-Step Simple Order Workflow & WhatsApp Support Hub */}
      <OrderWorkflowSection />
    </div>
  );
}
