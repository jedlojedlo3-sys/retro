'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Product } from '@/types/database';
import { ProductCard } from './ProductCard';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface HomeClientSectionsProps {
  products: Product[];
}

export function HomeClientSections({ products }: HomeClientSectionsProps) {
  const { t } = useLanguage();
  const featuredProducts = products.slice(0, 6);

  return (
    <>
      {/* 2. Editorial Statement */}
      <section className="py-20 sm:py-28 px-4 sm:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
        <div className="md:col-span-7 space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-retro-orange block">
            {t('editorial_eyebrow')}
          </span>
          <h2 className="font-display text-5xl sm:text-7xl uppercase leading-[0.9] text-ink">
            {t('editorial_title')} <br />
            <span className="text-muted-light">{t('editorial_subtitle')}</span>
          </h2>
        </div>
        <div className="md:col-span-5">
          <p className="text-base sm:text-lg text-muted-dark leading-relaxed">
            {t('editorial_desc')}
          </p>
        </div>
      </section>

      {/* 3. Campaign Looks Grid */}
      <section className="px-4 sm:px-12 pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Large campaign card */}
          <div className="md:col-span-7 relative min-h-[480px] sm:min-h-[580px] bg-ink overflow-hidden group">
            <Image
              src="/assets/store-01.jpg"
              alt="Retro Boutique Campaign"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 filter saturate-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent flex flex-col justify-end p-8 text-white">
              <span className="text-xs font-mono text-retro-orange font-bold">LOOK 01</span>
              <h3 className="font-display text-4xl sm:text-5xl uppercase mt-1">
                {t('look_01_title')}
              </h3>
              <p className="text-sm text-white/80 max-w-md mt-2">
                {t('look_01_desc')}
              </p>
            </div>
          </div>

          {/* Second campaign card */}
          <div className="md:col-span-5 relative min-h-[480px] sm:min-h-[580px] bg-ink overflow-hidden group">
            <Image
              src="/assets/look-02.jpg"
              alt="Statement shirts"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 filter saturate-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent flex flex-col justify-end p-8 text-white">
              <span className="text-xs font-mono text-retro-orange font-bold">LOOK 02</span>
              <h3 className="font-display text-4xl sm:text-5xl uppercase mt-1">
                {t('look_02_title')}
              </h3>
              <p className="text-sm text-white/80 max-w-md mt-2">
                {t('look_02_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Products Catalogue */}
      <section className="py-20 bg-white border-y border-ink/10 px-4 sm:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-ink/10">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-retro-orange block">
                {t('featured_eyebrow')}
              </span>
              <h2 className="font-display text-4xl sm:text-6xl uppercase text-ink">
                {t('featured_title')}
              </h2>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-ink hover:text-retro-orange group transition-colors"
            >
              <span>{t('featured_all')} ({products.length})</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center pt-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-white hover:bg-retro-orange hover:text-ink font-bold text-sm tracking-wider uppercase transition-colors"
            >
              <span>{t('featured_open_catalog')}</span>
              <ShoppingBag size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. How Click & Collect Works */}
      <section className="py-20 sm:py-28 bg-ink text-white px-4 sm:px-12">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-retro-orange block">
              {t('how_eyebrow')}
            </span>
            <h2 className="font-display text-4xl sm:text-6xl uppercase">
              {t('how_title')}
            </h2>
            <p className="text-white/70 text-sm sm:text-base">
              {t('how_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white/5 border border-white/10 p-8 space-y-4 hover:border-retro-orange/50 transition-colors">
              <span className="font-display text-5xl text-retro-orange">{t('step_01_num')}</span>
              <h3 className="font-display text-2xl uppercase tracking-wide">{t('step_01_title')}</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                {t('step_01_desc')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/5 border border-white/10 p-8 space-y-4 hover:border-retro-orange/50 transition-colors">
              <span className="font-display text-5xl text-retro-orange">{t('step_02_num')}</span>
              <h3 className="font-display text-2xl uppercase tracking-wide">{t('step_02_title')}</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                {t('step_02_desc')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/5 border border-white/10 p-8 space-y-4 hover:border-retro-orange/50 transition-colors">
              <span className="font-display text-5xl text-retro-orange">{t('step_03_num')}</span>
              <h3 className="font-display text-2xl uppercase tracking-wide">{t('step_03_title')}</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                {t('step_03_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Story / About Retro */}
      <section id="story" className="py-20 sm:py-28 px-4 sm:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative aspect-[4/5] bg-ink overflow-hidden border border-ink/10 shadow-xl">
            <Image
              src="/assets/look-01.jpg"
              alt="Retro Boutique Prilep about"
              fill
              className="object-cover filter saturate-80"
            />
          </div>
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase font-extrabold tracking-widest text-retro-orange block">
              {t('story_eyebrow')}
            </span>
            <h2 className="font-display text-5xl sm:text-7xl uppercase leading-[0.9] text-ink">
              {t('story_title_1')} <br />
              <span className="text-muted">{t('story_title_2')}</span>
            </h2>
            <p className="text-base text-ink/80 leading-relaxed">
              {t('story_desc_1')}
            </p>
            <p className="text-base text-ink/80 leading-relaxed">
              {t('story_desc_2')}
            </p>

            <div className="pt-4 flex flex-wrap gap-4 text-xs uppercase font-bold tracking-wider text-ink/70">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-paper-dark">
                <CheckCircle2 size={16} className="text-retro-orange" />
                <span>{t('story_badge_1')}</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-paper-dark">
                <ShieldCheck size={16} className="text-retro-orange" />
                <span>{t('story_badge_2')}</span>
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
