'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, MapPin, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ReservationConfirmationClientProps {
  number: string;
}

export function ReservationConfirmationClient({ number }: ReservationConfirmationClientProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white border border-ink/10 p-8 sm:p-12 shadow-xl space-y-8 text-center sm:text-left">
      {/* Top Success Badge */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pb-6 border-b border-ink/10">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle size={36} />
        </div>
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-retro-orange block">
            {t('conf_eyebrow')}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl uppercase text-ink">
            {t('conf_title')}
          </h1>
        </div>
      </div>

      {/* Reservation Number Card */}
      <div className="bg-paper p-6 border border-ink/10 text-center space-y-2">
        <span className="text-xs uppercase font-bold tracking-wider text-muted block">
          {t('conf_number_label')}
        </span>
        <span className="font-display text-4xl sm:text-5xl text-retro-orange tracking-wider block font-bold">
          {number}
        </span>
        <p className="text-xs text-muted max-w-md mx-auto">
          {t('conf_number_note')}
        </p>
      </div>

      {/* Pickup Details */}
      <div className="space-y-4 text-sm text-ink/80">
        <h3 className="text-xs uppercase font-bold tracking-wider text-ink">
          {t('conf_pickup_info')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-paper-light border border-ink/10 space-y-1">
            <div className="flex items-center gap-2 font-bold text-ink text-xs uppercase tracking-wider">
              <MapPin size={16} className="text-retro-orange" />
              <span>{t('conf_location_label')}</span>
            </div>
            <p className="text-sm font-semibold">Stiv Naumov 8, Prilep 7500</p>
          </div>

          <div className="p-4 bg-paper-light border border-ink/10 space-y-1">
            <div className="flex items-center gap-2 font-bold text-ink text-xs uppercase tracking-wider">
              <Clock size={16} className="text-retro-orange" />
              <span>{t('conf_hours_label')}</span>
            </div>
            <p className="text-sm font-semibold">Mon–Sat: 09:00 – 20:00</p>
          </div>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs leading-relaxed space-y-1">
          <strong>{t('conf_notice_title')}</strong>
          <p>{t('conf_notice_desc')}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-ink/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <a
          href="https://www.google.com/maps/search/?api=1&query=Stiv+Naumov+8+Prilep+North+Macedonia"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-ink text-white hover:bg-retro-orange hover:text-ink font-bold text-xs uppercase tracking-wider transition-colors"
        >
          <MapPin size={16} />
          <span>{t('conf_maps_btn')}</span>
        </a>

        <Link
          href="/products"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-ink text-ink hover:bg-paper font-bold text-xs uppercase tracking-wider transition-colors"
        >
          <span>{t('conf_back_btn')}</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
