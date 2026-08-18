'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function VisitSection() {
  const { t } = useLanguage();

  return (
    <section id="visit" className="w-full py-16 sm:py-24 px-4 sm:px-8 bg-paper">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Info Card */}
          <div className="lg:col-span-5 bg-retro-orange text-ink p-8 sm:p-12 flex flex-col justify-between shadow-lg">
            <div className="space-y-6">
              <span className="text-xs uppercase font-extrabold tracking-widest block opacity-80">
                {t('visit_eyebrow')}
              </span>
              <h2 className="font-display text-5xl sm:text-6xl uppercase leading-none">
                RETRO <br />
                BOUTIQUE
              </h2>
              <p className="text-sm sm:text-base leading-relaxed opacity-95 font-medium">
                {t('visit_desc')}
              </p>

              <div className="space-y-4 pt-4 border-t border-ink/20 text-sm">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">
                    {t('visit_address_label')}
                  </span>
                  <strong className="text-base font-bold">Stiv Naumov 8, Prilep 7500</strong>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">
                    {t('visit_hours_label')}
                  </span>
                  <div className="space-y-0.5">
                    <p className="flex justify-between">
                      <span>{t('visit_mon_sat')}</span>
                      <strong>09:00 – 20:00</strong>
                    </p>
                    <p className="flex justify-between">
                      <span>{t('visit_sun')}</span>
                      <strong>{t('visit_closed')}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Stiv+Naumov+8+Prilep+North+Macedonia"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-4 bg-ink text-white hover:bg-white hover:text-ink font-bold text-xs uppercase tracking-wider transition-colors"
              >
                <span>{t('visit_maps_btn')}</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* Map Embed Card */}
          <div className="lg:col-span-7 min-h-[400px] bg-paper-dark border border-ink/15 overflow-hidden relative shadow-md">
            <iframe
              title="Retro Boutique Prilep location"
              src="https://www.google.com/maps?q=Stiv%20Naumov%208%2C%20Prilep%2C%20North%20Macedonia&output=embed"
              className="w-full h-full min-h-[420px] border-0 grayscale contrast-125"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
