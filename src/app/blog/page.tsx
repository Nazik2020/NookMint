import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight, BookOpen, Layers } from 'lucide-react';

export const metadata = {
  title: 'Insights & Guides | Innovative Consultants',
  description: 'Guides on multi-category sourcing, Cash on Delivery fulfillment, and Sri Lankan retail operations.',
};

export default function BlogIndexPage() {
  const articles = [
    {
      slug: 'multi-category-commerce-guide',
      title: 'How Multi-Category E-Commerce Simplifies Everyday Living',
      excerpt: 'Discover how combining groceries, household goods, fashion, and personal electric mobility on a single platform eliminates checkout friction.',
      date: 'November 02, 2026',
      readTime: '4 min read',
      tag: 'COMMERCE & RETAIL',
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
    },
    {
      slug: 'doorstep-cod-guide-across-all-25-districts',
      title: 'How Cash on Delivery (COD) Works Across Sri Lanka',
      excerpt: 'Step-by-step walkthrough of doorstep courier verification, package handover, and zero-advance payment safety.',
      date: 'October 28, 2026',
      readTime: '5 min read',
      tag: 'LOGISTICS & COD',
      tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80',
    },
    {
      slug: 'tri-ply-cookware-maintenance',
      title: 'The Chef’s Guide: Maintaining Tri-Ply Induction Cookware for Decades',
      excerpt: 'Proper seasoning, heat control, and washing techniques for 18/10 stainless steel pots and pans.',
      date: 'October 22, 2026',
      readTime: '3 min read',
      tag: 'HOME ESSENTIALS',
      tagColor: 'bg-amber-50 text-amber-800 border-amber-200',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
    },
    {
      slug: 'electric-vehicles-urban-mobility-sri-lanka',
      title: 'The Future of Commuting: Electric Scooters & E-Bikes in Sri Lanka',
      excerpt: 'Cost per kilometer calculations, lithium battery longevity, and how personal electric mobility is changing urban travel in Colombo.',
      date: 'October 15, 2026',
      readTime: '4 min read',
      tag: 'SMART MOBILITY',
      tagColor: 'bg-teal-50 text-teal-800 border-teal-200',
      image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-700 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200/80 inline-block">
          INNOVATIVE INSIGHTS & JOURNAL
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Articles, Guides & Stories
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          Expert shopping guides, product care insights, and practical advice on ordering essentials across Sri Lanka.
        </p>
      </div>

      {/* Featured Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {articles.map((article) => (
          <article
            key={article.slug}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col"
          >
            <div className="relative h-60 w-full overflow-hidden bg-slate-100">
              <Image
                src={article.image}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center group-hover:scale-104 transition-transform duration-500"
              />
              <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border shadow-xs ${article.tagColor}`}>
                {article.tag}
              </span>
            </div>

            <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{article.date}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{article.readTime}</span>
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {article.title}
                </h2>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/products"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Explore Catalogue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[11px] text-slate-400 font-medium">NookMint</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
