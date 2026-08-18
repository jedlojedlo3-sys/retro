'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative w-full min-h-[92vh] flex items-end overflow-hidden bg-ink">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/store-02.jpg"
          alt="Retro Boutique Prilep"
          fill
          priority
          className="object-cover object-center scale-[1.02]"
          style={{ filter: 'brightness(0.55) saturate(0.85)' }}
        />
        {/* Gradient — stronger at bottom for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />
        {/* Side vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 pb-16 sm:pb-24 flex flex-col lg:flex-row items-end justify-between gap-10">

        {/* Left: Main headline */}
        <div className="space-y-7 max-w-3xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-retro-orange" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-retro-orange">
              {t('hero_eyebrow')}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="font-display leading-[0.88] tracking-tight">
            <span className="block text-white text-7xl sm:text-9xl md:text-[10rem]">
              {t('hero_title_1')}
            </span>
            <span
              className="block text-7xl sm:text-9xl md:text-[10rem]"
              style={{
                WebkitTextStroke: '1.5px rgba(255,255,255,0.7)',
                color: 'transparent',
              }}
            >
              {t('hero_title_2')}
            </span>
          </h1>

          {/* Description */}
          <p className="text-white/65 text-sm sm:text-base max-w-lg leading-relaxed font-light">
            {t('hero_desc')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start gap-3 pt-2">
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-ink font-semibold text-sm tracking-wide hover:bg-retro-orange hover:text-white transition-all duration-300 active:scale-[0.98]"
            >
              <span>{t('hero_cta_shop')}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              href="/#visit"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/25 text-white/80 hover:border-white hover:text-white font-medium text-sm tracking-wide transition-all duration-300 backdrop-blur-sm"
            >
              <MapPin size={14} className="text-retro-orange" />
              <span>{t('hero_cta_visit')}</span>
            </Link>
          </div>
        </div>

        {/* Right: EST badge — desktop only */}
        <div className="hidden lg:flex flex-col items-center gap-1 mb-2 opacity-80 hover:opacity-100 transition-opacity">
          <div className="w-[1px] h-16 bg-white/20 mb-4" />
          <span className="text-[9px] tracking-[0.3em] uppercase text-retro-orange font-bold">EST.</span>
          <span className="font-display text-5xl text-white leading-none">2003</span>
          <span className="text-[9px] tracking-[0.25em] uppercase text-white/40 font-medium mt-1">PRILEP, MK</span>
          <div className="w-[1px] h-16 bg-white/20 mt-4" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-2 opacity-40">
        <div className="w-[1px] h-10 bg-white animate-pulse" />
      </div>
    </section>
  );
}
