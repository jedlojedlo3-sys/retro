'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, MapPin, Clock, Shield } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function Footer() {
  const year = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-ink text-white">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16 sm:py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-1 ring-white/15">
              <Image src="/assets/logo-retro.png" alt="Retro Boutique" fill className="object-cover" sizes="40px" />
            </div>
            <div>
              <span className="font-display text-2xl tracking-wide block">RETRO BOUTIQUE</span>
              <span className="text-[9px] tracking-[0.2em] uppercase text-white/30 block">Prilep · Est. 2003</span>
            </div>
          </div>
          <p className="text-sm text-white/45 leading-relaxed max-w-xs">
            {t('footer_about')}
          </p>
          <a
            href="https://www.instagram.com/retro_boutique/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/50 hover:text-white transition-colors duration-200"
          >
            <Instagram size={14} />
            <span>@retro_boutique</span>
          </a>
        </div>

        {/* Location */}
        <div className="space-y-5">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            {t('visit_address_label')}
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2.5 text-white/60">
              <MapPin size={15} className="text-retro-orange shrink-0 mt-0.5" />
              <span>Stiv Naumov 8<br />Prilep 7500<br />North Macedonia</span>
            </div>
            <div className="flex items-start gap-2.5 text-white/60">
              <Clock size={15} className="text-retro-orange shrink-0 mt-0.5" />
              <span>
                {t('visit_mon_sat')} 09:00–20:00<br />
                <span className="text-white/30">{t('visit_sun')} {t('visit_closed')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Click & Collect */}
        <div className="space-y-5">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            Click & Collect
          </h4>
          <p className="text-sm text-white/45 leading-relaxed">
            {t('footer_click_collect_desc')}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/50 hover:text-white link-underline transition-colors duration-200"
          >
            <span>{t('nav_collection')}</span>
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06] max-w-7xl mx-auto px-6 sm:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-white/25 tracking-wide">
        <span>© {year} Retro Boutique Prilep. {t('footer_rights')}</span>
        <Link
          href="/admin"
          className="flex items-center gap-1.5 hover:text-white/60 transition-colors duration-200"
        >
          <Shield size={11} />
          <span>{t('nav_admin')}</span>
        </Link>
      </div>
    </footer>
  );
}
