'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PlusCircle, Shirt, ClipboardList, LogOut, Bell, ExternalLink, Globe } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { t, language, toggleLanguage } = useLanguage();
  const [newReservationsCount, setNewReservationsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const supabase = createClient();
        const { count, error } = await supabase
          .from('reservations')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'new');

        if (!error && count !== null) {
          setNewReservationsCount(count);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {
      // ignore
    }
    localStorage.removeItem('retro_admin_auth');
    sessionStorage.removeItem('retro_admin_auth');
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Top Simple Bar */}
      <header className="bg-ink text-white px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
            <Image src="/assets/logo-retro.png" alt="Retro Logo" fill className="object-cover" />
          </div>
          <span className="font-display text-2xl tracking-wider">{t('admin_dash_title')}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2.5 py-1 rounded-full border border-white/20 hover:border-white text-[10px] font-bold uppercase tracking-widest text-white/90 hover:text-white transition-all flex items-center gap-1"
            title="Switch Language / Смени јазик"
          >
            <Globe size={11} />
            <span>{language === 'mk' ? 'EN' : 'MK'}</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/70 hover:text-white flex items-center gap-1 uppercase tracking-wider font-semibold"
          >
            <span>{t('admin_store_link')}</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </header>

      {/* Main Minimal Menu Area */}
      <main className="flex-1 max-w-lg mx-auto w-full p-6 sm:p-8 flex flex-col justify-center space-y-6">
        {/* New Reservations Alert Banner (if any) */}
        {newReservationsCount > 0 && (
          <Link
            href="/admin/reservations"
            className="p-4 bg-retro-orange text-white border border-retro-orange/30 shadow-lg flex items-center justify-between group transform hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-ink text-white flex items-center justify-center font-bold">
                <Bell size={18} />
              </div>
              <div>
                <span className="font-extrabold text-sm uppercase tracking-wider block">
                  {newReservationsCount === 1
                    ? t('admin_dash_new_res_single', { count: newReservationsCount })
                    : t('admin_dash_new_res_plural', { count: newReservationsCount })}
                </span>
                <span className="text-xs opacity-90">{t('admin_dash_new_res_action')}</span>
              </div>
            </div>
            <span className="font-bold text-sm group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        )}

        {/* Big Large Action Buttons */}
        <div className="space-y-4">
          {/* 1. Add Product */}
          <Link
            href="/admin/products?new=1"
            className="w-full p-6 bg-ink text-white hover:bg-retro-orange hover:text-white transition-all flex items-center gap-5 shadow-md transform hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-retro-orange group-hover:text-white shrink-0">
              <PlusCircle size={28} />
            </div>
            <div>
              <h2 className="font-display text-3xl uppercase tracking-wider leading-tight">
                {t('admin_dash_add_prod_title')}
              </h2>
              <p className="text-xs opacity-75 mt-0.5">
                {t('admin_dash_add_prod_desc')}
              </p>
            </div>
          </Link>

          {/* 2. Products List & Stock */}
          <Link
            href="/admin/products"
            className="w-full p-6 bg-white text-ink border border-black/10 hover:border-ink transition-all flex items-center gap-5 shadow-sm transform hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-ink shrink-0">
              <Shirt size={26} />
            </div>
            <div>
              <h2 className="font-display text-3xl uppercase tracking-wider leading-tight">
                {t('admin_dash_products_title')}
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {t('admin_dash_products_desc')}
              </p>
            </div>
          </Link>

          {/* 3. Reservations */}
          <Link
            href="/admin/reservations"
            className="w-full p-6 bg-white text-ink border border-black/10 hover:border-ink transition-all flex items-center gap-5 shadow-sm transform hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-ink shrink-0">
              <ClipboardList size={26} />
            </div>
            <div>
              <h2 className="font-display text-3xl uppercase tracking-wider leading-tight">
                {t('admin_dash_reservations_title')}
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {t('admin_dash_reservations_desc')}
              </p>
            </div>
          </Link>
        </div>

        {/* Logout Button */}
        <div className="pt-6 border-t border-black/10 text-center">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-muted hover:text-red-600 transition-colors py-2 px-4"
          >
            <LogOut size={16} />
            <span>{t('admin_logout')}</span>
          </button>
        </div>
      </main>
    </div>
  );
}
