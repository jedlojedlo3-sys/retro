'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut, PlusCircle, Shirt, ClipboardList, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface AdminHeaderProps {
  title?: string;
  showBack?: boolean;
  backUrl?: string;
}

export function AdminHeader({ title, showBack = false, backUrl = '/admin' }: AdminHeaderProps) {
  const router = useRouter();
  const { language, toggleLanguage, t } = useLanguage();
  const displayTitle = title || t('admin_dash_title');

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {
      // ignore
    }
    localStorage.removeItem('retro_admin_auth');
    sessionStorage.removeItem('retro_admin_auth');
    window.location.href = '/admin/login';
  };

  return (
    <header className="sticky top-0 z-40 bg-ink text-white border-b border-white/10 px-3 py-2.5 sm:px-6 w-full max-w-full overflow-hidden">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Back & Logo & Title */}
        <div className="flex items-center gap-2 min-w-0">
          {showBack && (
            <Link
              href={backUrl}
              className="p-1 -ml-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors shrink-0"
              aria-label={t('admin_res_modal_back')}
            >
              <ArrowLeft size={18} />
            </Link>
          )}

          <Link href="/admin" className="flex items-center gap-2 min-w-0">
            <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-white/20 shrink-0">
              <Image src="/assets/logo-retro.png" alt="Retro" fill className="object-cover" />
            </div>
            <span className="font-display text-base sm:text-xl tracking-wider text-white truncate max-w-[110px] xs:max-w-[160px] sm:max-w-none">
              {displayTitle}
            </span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 text-xs">
          <Link
            href="/admin/products?new=1"
            className="p-1.5 sm:px-3 sm:py-1 bg-retro-orange text-white rounded font-bold hover:bg-white hover:text-ink transition-colors flex items-center gap-1 shrink-0 text-[11px]"
            title={t('admin_add_header')}
          >
            <PlusCircle size={15} />
            <span className="hidden sm:inline">{t('admin_products_add_btn')}</span>
          </Link>

          <Link
            href="/admin/products"
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
            title={t('admin_products_header')}
          >
            <Shirt size={16} />
          </Link>

          <Link
            href="/admin/reservations"
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
            title={t('admin_res_header')}
          >
            <ClipboardList size={16} />
          </Link>

          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2 py-0.5 rounded-full border border-white/20 hover:border-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/90 hover:text-white transition-all flex items-center gap-0.5"
            title="Switch Language / Смени јазик"
          >
            <Globe size={10} />
            <span>{language === 'mk' ? 'EN' : 'MK'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-1.5 text-white/60 hover:text-red-400 hover:bg-white/10 rounded transition-colors ml-0.5"
            title={t('admin_logout')}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
