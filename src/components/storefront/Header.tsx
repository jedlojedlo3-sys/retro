'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Instagram, MapPin } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top Notice Strip */}
      <div className="bg-retro-orange text-ink px-4 py-1.5 text-xs font-bold tracking-wider flex justify-between items-center text-center sm:text-left select-none">
        <span className="hidden sm:inline">ПРИЛЕП · ОД 2003</span>
        <span className="w-full sm:w-auto font-extrabold uppercase">
          БЕЗ ОНЛАЈН ПЛАЌАЊЕ · ПОДИГАЊЕ И ПЛАЌАЊЕ ВО ПРОДАВНИЦА
        </span>
        <span className="hidden sm:inline">ПОН–САБ 09:00–20:00</span>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-paper/95 backdrop-blur-md border-b border-ink/10 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-ink/20 group-hover:scale-105 transition-transform">
            <Image
              src="/assets/logo-retro.png"
              alt="Retro Boutique Logo"
              fill
              className="object-cover"
              sizes="40px"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl tracking-wide text-ink group-hover:text-retro-orange transition-colors">
              RETRO BOUTIQUE
            </span>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-muted -mt-1">
              Prilep · Since 2003
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-wider text-ink/80">
          <Link
            href="/products"
            className="hover:text-retro-orange transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-retro-orange after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
          >
            Колекција
          </Link>
          <Link
            href="/#story"
            className="hover:text-retro-orange transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-retro-orange after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
          >
            За нас
          </Link>
          <Link
            href="/#visit"
            className="hover:text-retro-orange transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-retro-orange after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
          >
            Локација
          </Link>
          <a
            href="https://www.instagram.com/retro_boutique/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-retro-orange transition-colors"
          >
            <Instagram size={16} />
            <span>@retro_boutique</span>
          </a>
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-ink hover:text-retro-orange focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-paper border-b border-ink/10 px-6 py-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-lg font-bold uppercase tracking-wider text-ink hover:text-retro-orange"
          >
            Колекција / Продавница
          </Link>
          <Link
            href="/#story"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-lg font-bold uppercase tracking-wider text-ink hover:text-retro-orange"
          >
            За нас
          </Link>
          <Link
            href="/#visit"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-lg font-bold uppercase tracking-wider text-ink hover:text-retro-orange"
          >
            Локација & Работно време
          </Link>
          <div className="pt-4 border-t border-ink/10 flex items-center justify-between text-sm font-semibold text-muted">
            <a
              href="https://www.instagram.com/retro_boutique/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-ink hover:text-retro-orange"
            >
              <Instagram size={18} />
              <span>@retro_boutique</span>
            </a>
            <span className="flex items-center gap-1">
              <MapPin size={16} />
              <span>Stiv Naumov 8, Prilep</span>
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
