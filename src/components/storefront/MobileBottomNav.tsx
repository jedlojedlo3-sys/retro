'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, MapPin, Sparkles, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { language, toggleLanguage, t } = useLanguage();

  // Hide on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const isHome = pathname === '/';
  const isProducts = pathname?.startsWith('/products');

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-black/[0.08] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))',
      }}
    >
      <div className="grid grid-cols-5 items-center h-14 max-w-lg mx-auto px-2">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 text-center transition-colors ${
            isHome ? 'text-retro-orange font-bold' : 'text-ink/60 hover:text-ink'
          }`}
        >
          <Home size={18} strokeWidth={isHome ? 2.4 : 1.8} />
          <span className="text-[10px] tracking-tight uppercase font-medium">{t('nav_home')}</span>
        </Link>

        {/* 2. Collection */}
        <Link
          href="/products"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 text-center transition-colors ${
            isProducts ? 'text-retro-orange font-bold' : 'text-ink/60 hover:text-ink'
          }`}
        >
          <ShoppingBag size={18} strokeWidth={isProducts ? 2.4 : 1.8} />
          <span className="text-[10px] tracking-tight uppercase font-medium">{t('nav_collection')}</span>
        </Link>

        {/* 3. Location */}
        <Link
          href="/#visit"
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-center text-ink/60 hover:text-ink transition-colors"
        >
          <MapPin size={18} strokeWidth={1.8} />
          <span className="text-[10px] tracking-tight uppercase font-medium">{t('nav_location')}</span>
        </Link>

        {/* 4. Story / About */}
        <Link
          href="/#story"
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-center text-ink/60 hover:text-ink transition-colors"
        >
          <Sparkles size={18} strokeWidth={1.8} />
          <span className="text-[10px] tracking-tight uppercase font-medium">{t('nav_about')}</span>
        </Link>

        {/* 5. Language Switcher */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-center text-ink/70 hover:text-retro-orange active:scale-95 transition-all"
          title="Switch Language / Смени јазик"
        >
          <div className="relative">
            <Globe size={18} strokeWidth={1.8} />
            <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-retro-orange text-white text-[8px] font-extrabold rounded-full leading-none">
              {language === 'mk' ? 'EN' : 'MK'}
            </span>
          </div>
          <span className="text-[10px] tracking-tight uppercase font-semibold text-retro-orange">
            {language === 'mk' ? 'EN' : 'MK'}
          </span>
        </button>
      </div>
    </nav>
  );
}
