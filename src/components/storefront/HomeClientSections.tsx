'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Product } from '@/types/database';
import { ProductCard } from './ProductCard';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getClientProducts } from '@/lib/products-store';

interface HomeClientSectionsProps {
  products: Product[];
}

export function HomeClientSections({ products: initialProducts }: HomeClientSectionsProps) {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    setProducts(getClientProducts(initialProducts));
  }, [initialProducts]);

  const activeProducts = products.filter((p) => p.active !== false);
  const featuredProducts = activeProducts.slice(0, 6);

  return (
    <>
      {/* ── 2. Editorial Statement ─────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-end">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-retro-orange" />
              <span className="section-eyebrow">{t('editorial_eyebrow')}</span>
            </div>
            <h2 className="font-display text-6xl sm:text-8xl uppercase leading-[0.88] tracking-tight text-ink">
              {t('editorial_title')}<br />
              <span className="text-muted/50">{t('editorial_subtitle')}</span>
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-base text-muted-dark leading-relaxed">
              {t('editorial_desc')}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink link-underline hover:text-retro-orange transition-colors duration-200 group"
            >
              <span>{t('featured_open_catalog')}</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. Campaign Looks ──────────────────────────────── */}
      <section className="px-6 sm:px-12 pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3">
          {/* Large card */}
          <div className="md:col-span-7 relative min-h-[500px] sm:min-h-[620px] bg-ink overflow-hidden group cursor-pointer">
            <Image
              src="/assets/store-01.jpg"
              alt="Retro Boutique Campaign"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              style={{ filter: 'brightness(0.75) saturate(0.9)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-8 sm:p-10">
              <span className="text-[9px] tracking-[0.3em] uppercase text-retro-orange font-bold block mb-2">
                LOOK 01
              </span>
              <h3 className="font-display text-4xl sm:text-5xl uppercase text-white leading-tight">
                {t('look_01_title')}
              </h3>
              <p className="text-sm text-white/60 mt-2 max-w-xs">
                {t('look_01_desc')}
              </p>
            </div>
          </div>

          {/* Side card */}
          <div className="md:col-span-5 relative min-h-[500px] sm:min-h-[620px] bg-ink overflow-hidden group cursor-pointer">
            <Image
              src="/assets/look-02.jpg"
              alt="Statement shirts"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              style={{ filter: 'brightness(0.75) saturate(0.9)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-8 sm:p-10">
              <span className="text-[9px] tracking-[0.3em] uppercase text-retro-orange font-bold block mb-2">
                LOOK 02
              </span>
              <h3 className="font-display text-4xl sm:text-5xl uppercase text-white leading-tight">
                {t('look_02_title')}
              </h3>
              <p className="text-sm text-white/60 mt-2 max-w-xs">
                {t('look_02_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Featured Products ───────────────────────────── */}
      <section className="py-24 bg-surface border-y border-black/[0.06] px-6 sm:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-retro-orange" />
                <span className="section-eyebrow">{t('featured_eyebrow')}</span>
              </div>
              <h2 className="font-display text-5xl sm:text-7xl uppercase text-ink leading-none tracking-tight">
                {t('featured_title')}
              </h2>
            </div>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink transition-colors duration-200 shrink-0"
            >
              <span>{t('featured_all')} ({products.length})</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center pt-4">
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-ink text-white text-sm font-semibold tracking-wide uppercase hover:bg-retro-orange transition-all duration-300 active:scale-[0.98]"
            >
              <span>{t('featured_open_catalog')}</span>
              <ShoppingBag size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. How it Works ───────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="max-w-xl mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-retro-orange" />
              <span className="section-eyebrow">{t('how_eyebrow')}</span>
            </div>
            <h2 className="font-display text-5xl sm:text-7xl uppercase text-ink leading-none tracking-tight">
              {t('how_title')}
            </h2>
            <p className="text-muted text-sm mt-4 leading-relaxed">
              {t('how_desc')}
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/[0.06]">
            {[
              { num: t('step_01_num'), title: t('step_01_title'), desc: t('step_01_desc') },
              { num: t('step_02_num'), title: t('step_02_title'), desc: t('step_02_desc') },
              { num: t('step_03_num'), title: t('step_03_title'), desc: t('step_03_desc') },
            ].map(({ num, title, desc }) => (
              <div
                key={num}
                className="bg-white p-10 sm:p-12 space-y-4 group hover:bg-ink transition-colors duration-500"
              >
                <span className="font-display text-6xl text-retro-orange leading-none group-hover:text-retro-orange">
                  {num}
                </span>
                <h3 className="font-display text-2xl uppercase tracking-wide text-ink group-hover:text-white transition-colors duration-500">
                  {title}
                </h3>
                <p className="text-sm text-muted leading-relaxed group-hover:text-white/60 transition-colors duration-500">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Story ──────────────────────────────────────── */}
      <section id="story" className="py-24 sm:py-32 px-6 sm:px-12 bg-surface border-y border-black/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden bg-surface-elevated shadow-card-hover">
              <Image
                src="/assets/look-01.jpg"
                alt="Retro Boutique Prilep"
                fill
                className="object-cover"
                style={{ filter: 'saturate(0.85)' }}
              />
              {/* Corner label */}
              <div className="absolute bottom-0 right-0 bg-ink text-white px-5 py-3">
                <span className="font-display text-2xl tracking-wide">EST. 2003</span>
              </div>
            </div>

            {/* Text */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px w-8 bg-retro-orange" />
                  <span className="section-eyebrow">{t('story_eyebrow')}</span>
                </div>
                <h2 className="font-display text-5xl sm:text-7xl uppercase leading-[0.88] text-ink tracking-tight">
                  {t('story_title_1')}<br />
                  <span className="text-muted/40">{t('story_title_2')}</span>
                </h2>
              </div>

              <div className="space-y-4 text-base text-muted-dark leading-relaxed">
                <p>{t('story_desc_1')}</p>
                <p>{t('story_desc_2')}</p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                {[
                  { Icon: CheckCircle2, label: t('story_badge_1') },
                  { Icon: ShieldCheck, label: t('story_badge_2') },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <Icon size={16} className="text-retro-orange shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-ink/70">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
