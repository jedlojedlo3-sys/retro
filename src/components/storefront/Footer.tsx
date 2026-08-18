'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, MapPin, Clock, Shield } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-ink text-white pt-14 pb-8 px-4 sm:px-8 border-t border-ink/20 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-white/10">
        {/* Col 1: Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20">
              <Image
                src="/assets/logo-retro.png"
                alt="Retro Boutique"
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div>
              <span className="font-display text-2xl tracking-wider block">RETRO BOUTIQUE</span>
              <span className="text-[11px] text-white/50 uppercase tracking-widest block -mt-1">
                Prilep · Est. 2003
              </span>
            </div>
          </div>
          <p className="text-sm text-white/70 leading-relaxed max-w-sm">
            {t('footer_about')}
          </p>
        </div>

        {/* Col 2: Location & Hours */}
        <div className="space-y-3">
          <h4 className="font-display text-lg tracking-wider uppercase text-retro-orange">
            {t('visit_hours_label')}
          </h4>
          <div className="space-y-2 text-sm text-white/80">
            <p className="flex items-start gap-2">
              <MapPin size={18} className="text-retro-orange shrink-0 mt-0.5" />
              <span>Stiv Naumov 8, Prilep 7500, North Macedonia</span>
            </p>
            <p className="flex items-start gap-2">
              <Clock size={18} className="text-retro-orange shrink-0 mt-0.5" />
              <span>
                {t('visit_mon_sat')} <strong>09:00 – 20:00</strong>
                <br />
                {t('visit_sun')} <span className="text-white/50">{t('visit_closed')}</span>
              </span>
            </p>
          </div>
        </div>

        {/* Col 3: Click & Collect Details */}
        <div className="space-y-3">
          <h4 className="font-display text-lg tracking-wider uppercase text-retro-orange">
            Click & Collect
          </h4>
          <p className="text-sm text-white/70 leading-relaxed">
            {t('footer_click_collect_desc')}
          </p>
          <div className="pt-2">
            <a
              href="https://www.instagram.com/retro_boutique/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-xs uppercase tracking-wider font-semibold transition-colors"
            >
              <Instagram size={16} className="text-retro-orange" />
              <span>{t('footer_instagram_btn')}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
        <span>© {currentYear} Retro Boutique Prilep. {t('footer_rights')}</span>
        <div className="flex items-center gap-6">
          <Link href="/admin" className="hover:text-white/80 flex items-center gap-1 transition-colors">
            <Shield size={13} />
            <span>{t('nav_admin')}</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
