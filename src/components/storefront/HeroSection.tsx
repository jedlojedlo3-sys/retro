'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative w-full min-h-[85vh] flex items-end pb-16 sm:pb-24 px-4 sm:px-12 overflow-hidden bg-ink">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/store-02.jpg"
          alt="Retro Boutique Prilep storefront"
          fill
          priority
          className="object-cover object-center filter saturate-75 contrast-105"
        />
        {/* Dark Editorial Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
      </div>

      {/* Hero Content Box */}
      <div className="relative z-10 max-w-4xl text-white space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-retro-orange/90 text-ink text-xs uppercase font-extrabold tracking-widest rounded-sm">
          <span>{t('hero_eyebrow')}</span>
        </div>

        <h1 className="font-display text-6xl sm:text-8xl md:text-9xl leading-[0.85] tracking-tight uppercase">
          {t('hero_title_1')} <br />
          <span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.9)' }}>
            {t('hero_title_2')}
          </span>
        </h1>

        <p className="text-base sm:text-xl text-white/80 max-w-xl font-normal leading-relaxed">
          {t('hero_desc')}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-retro-orange text-ink hover:text-white font-bold text-sm tracking-wider uppercase transition-all transform hover:-translate-y-0.5 shadow-lg"
          >
            <span>{t('hero_cta_shop')}</span>
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/#visit"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-ink/70 hover:bg-ink text-white border border-white/20 hover:border-white/60 font-semibold text-sm tracking-wider uppercase backdrop-blur-sm transition-all"
          >
            <MapPin size={16} className="text-retro-orange" />
            <span>{t('hero_cta_visit')}</span>
          </Link>
        </div>
      </div>

      {/* Established Badge */}
      <div className="hidden lg:flex absolute right-12 bottom-12 z-10 w-36 h-36 rounded-full border border-white/40 flex-col items-center justify-center text-center text-white backdrop-blur-md bg-black/20 transform rotate-6 hover:rotate-0 transition-transform duration-300">
        <span className="text-[10px] tracking-widest uppercase font-bold text-retro-orange">EST.</span>
        <span className="font-display text-4xl leading-none">2003</span>
        <span className="text-[9px] tracking-widest uppercase font-semibold text-white/70">PRILEP</span>
      </div>
    </section>
  );
}
