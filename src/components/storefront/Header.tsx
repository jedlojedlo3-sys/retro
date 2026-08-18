'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Instagram, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Announcement Strip */}
      <div className="bg-ink text-white px-4 py-2 text-[10px] font-semibold tracking-[0.15em] uppercase flex justify-between items-center">
        <span className="hidden sm:inline opacity-60">{t('top_location')}</span>
        <span className="w-full sm:w-auto text-center">
          {t('top_notice')}
        </span>
        <span className="hidden sm:inline opacity-60">{t('top_hours')}</span>
      </div>

      {/* Main Nav */}
      <div
        className={`glass border-b transition-all duration-300 px-4 sm:px-10 flex items-center justify-between h-16 ${
          scrolled ? 'shadow-nav' : 'border-black/[0.06]'
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-9 h-9 rounded-full overflow-hidden ring-1 ring-black/10 group-hover:ring-retro-orange transition-all duration-300">
            <Image
              src="/assets/logo-retro.png"
              alt="Retro Boutique Logo"
              fill
              className="object-cover"
              sizes="36px"
              priority
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-[22px] tracking-wide text-ink group-hover:text-retro-orange transition-colors duration-200">
              RETRO BOUTIQUE
            </span>
            <span className="text-[9px] tracking-[0.18em] uppercase font-medium text-muted">
              Prilep · Since 2003
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { href: '/products', label: t('nav_collection') },
            { href: '/#story', label: t('nav_about') },
            { href: '/#visit', label: t('nav_location') },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink/70 hover:text-ink link-underline transition-colors duration-200"
            >
              {label}
            </Link>
          ))}

          <a
            href="https://www.instagram.com/retro_boutique/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/60 hover:text-ink transition-colors duration-200"
          >
            <Instagram size={14} />
            <span>Instagram</span>
          </a>

          {/* Language Pill */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-black/10 hover:border-ink text-[10px] font-bold uppercase tracking-widest transition-all duration-200 hover:bg-ink hover:text-white"
            title="Switch Language / Смени јазик"
          >
            <Globe size={11} />
            <span>{language === 'mk' ? 'EN' : 'MK'}</span>
          </button>
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1 rounded-full border border-black/10 text-[10px] font-bold uppercase tracking-widest hover:border-ink transition-all"
          >
            {language === 'mk' ? 'EN' : 'MK'}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-ink hover:text-retro-orange transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-b border-black/[0.06] px-6 py-8 space-y-6 shadow-lg">
          {[
            { href: '/products', label: t('nav_collection') },
            { href: '/#story', label: t('nav_about') },
            { href: '/#visit', label: t('nav_location') },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-2xl font-display tracking-wide text-ink hover:text-retro-orange transition-colors"
            >
              {label}
            </Link>
          ))}
          <div className="pt-6 border-t border-black/[0.06]">
            <a
              href="https://www.instagram.com/retro_boutique/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted hover:text-ink transition-colors"
            >
              <Instagram size={16} />
              <span>@retro_boutique</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
