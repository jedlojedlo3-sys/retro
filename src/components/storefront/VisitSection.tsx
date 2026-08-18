'use client';

import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function VisitSection() {
  const { t } = useLanguage();

  return (
    <section id="visit" className="w-full py-24 sm:py-32 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-h-[520px]">

          {/* Info Panel */}
          <div className="lg:col-span-5 bg-ink text-white p-8 sm:p-12 flex flex-col justify-between">
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px w-8 bg-retro-orange" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-retro-orange">
                    {t('visit_eyebrow')}
                  </span>
                </div>
                <h2 className="font-display text-5xl sm:text-6xl uppercase leading-none text-white tracking-tight">
                  RETRO<br />BOUTIQUE
                </h2>
              </div>

              <p className="text-sm text-white/55 leading-relaxed">
                {t('visit_desc')}
              </p>

              <div className="space-y-5 text-sm">
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-white/30 block mb-1">
                    {t('visit_address_label')}
                  </span>
                  <span className="font-semibold text-white">Stiv Naumov 8, Prilep 7500</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase font-semibold text-white/30">
                    <Clock size={12} className="text-retro-orange" />
                    <span>{t('visit_hours_label')}</span>
                  </div>

                  <div className="space-y-1.5 font-medium bg-white/[0.04] border border-white/[0.08] p-3 text-xs">
                    <div className="flex justify-between items-center text-white">
                      <span>{t('visit_mon_tue_thu_fri')}</span>
                      <span className="font-bold text-retro-orange">{t('visit_mon_tue_thu_fri_time')}</span>
                    </div>
                    <div className="flex justify-between items-center text-white">
                      <span>{t('visit_wed_sat')}</span>
                      <span className="font-bold text-retro-orange">{t('visit_wed_sat_time')}</span>
                    </div>
                    <div className="flex justify-between items-center text-white/40 pt-1 border-t border-white/[0.06]">
                      <span>{t('visit_sun')}</span>
                      <span>{t('visit_closed')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Stiv+Naumov+8+Prilep+North+Macedonia"
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex items-center justify-between w-full py-4 px-5 border border-white/15 hover:border-white/40 hover:bg-white/5 text-white text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-300"
            >
              <span>{t('visit_maps_btn')}</span>
              <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </a>
          </div>

          {/* Map */}
          <div className="lg:col-span-7 overflow-hidden bg-surface min-h-[400px] lg:min-h-0">
            <iframe
              title="Retro Boutique Prilep location"
              src="https://www.google.com/maps?q=Stiv%20Naumov%208%2C%20Prilep%2C%20North%20Macedonia&output=embed"
              className="w-full h-full min-h-[420px] border-0 grayscale contrast-110 opacity-90"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
