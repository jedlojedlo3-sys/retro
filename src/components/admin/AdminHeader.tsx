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
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-ink text-white border-b border-white/10 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <Link
              href={backUrl}
              className="p-1.5 -ml-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
              aria-label={t('admin_res_modal_back')}
            >
              <ArrowLeft size={20} />
            </Link>
          )}

          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-white/20">
              <Image src="/assets/logo-retro.png" alt="Retro" fill className="object-cover" />
            </div>
            <span className="font-display text-xl tracking-wider text-white">
              {displayTitle}
            </span>
          </Link>
        </div>

        {/* Quick actions & language & logout */}
        <div className="flex items-center gap-1.5 sm:gap-3 text-xs font-semibold">
          <Link
            href="/admin/products/new"
            className="p-2 sm:px-3 sm:py-1.5 bg-retro-orange text-ink rounded font-bold hover:bg-white transition-colors flex items-center gap-1.5"
            title={t('admin_add_header')}
          >
            <PlusCircle size={16} />
            <span className="hidden sm:inline">{t('admin_products_add_btn')}</span>
          </Link>

          <Link
            href="/admin/products"
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
            title={t('admin_products_header')}
          >
            <Shirt size={18} />
          </Link>

          <Link
            href="/admin/reservations"
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
            title={t('admin_res_header')}
          >
            <ClipboardList size={18} />
          </Link>

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

          <button
            onClick={handleLogout}
            className="p-2 text-white/60 hover:text-red-400 hover:bg-white/10 rounded transition-colors ml-0.5"
            title={t('admin_logout')}
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
