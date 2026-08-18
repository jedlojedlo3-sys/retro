'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Lock, AlertCircle, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AdminLoginPage() {
  const { t, language, toggleLanguage } = useLanguage();
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const cleanCode = accessCode.trim();

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        localStorage.setItem('retro_admin_auth', 'Retro2003Admin');
        sessionStorage.setItem('retro_admin_auth', 'Retro2003Admin');
        // Instant hard navigation so all cookies and layout load immediately in 0ms
        window.location.href = '/admin';
      } else {
        setIsLoading(false);
        setErrorMessage(t('admin_invalid_code'));
      }
    } catch {
      // Fallback local check
      if (cleanCode === 'Retro2003Admin') {
        localStorage.setItem('retro_admin_auth', 'Retro2003Admin');
        sessionStorage.setItem('retro_admin_auth', 'Retro2003Admin');
        window.location.href = '/admin';
      } else {
        setIsLoading(false);
        setErrorMessage(t('admin_invalid_code'));
      }
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-center items-center p-4 w-full max-w-full overflow-x-hidden">
      <div className="w-full max-w-sm bg-white border border-black/[0.08] shadow-2xl p-6 sm:p-8 space-y-6 relative">
        {/* Language switch on login card */}
        <div className="absolute top-4 right-4">
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2.5 py-1 rounded-full border border-black/10 hover:border-ink text-[10px] font-bold uppercase tracking-widest text-ink transition-all flex items-center gap-1"
            title="Switch Language / Смени јазик"
          >
            <Globe size={11} />
            <span>{language === 'mk' ? 'EN' : 'MK'}</span>
          </button>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border border-black/10 mx-auto">
            <Image src="/assets/logo-retro.png" alt="Retro Boutique" fill className="object-cover" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-retro-orange block">
              {t('admin_panel_title')}
            </span>
            <h1 className="font-display text-3xl uppercase tracking-wider text-ink">
              RETRO ADMIN
            </h1>
            <p className="text-xs text-muted mt-1">
              {t('admin_login_desc')}
            </p>
          </div>
        </div>

        {/* Access Code Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              {t('admin_access_code_label')}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                required
                autoFocus
                placeholder="••••••••••••"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 text-sm font-semibold tracking-wider bg-surface border border-black/10 text-ink focus:outline-none focus:border-ink rounded-none"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 bg-ink text-white hover:bg-retro-orange hover:text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
              isLoading ? 'opacity-50 cursor-wait' : ''
            }`}
          >
            <ShieldCheck size={16} />
            <span>{isLoading ? t('admin_checking') : t('admin_login_btn')}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="pt-2 text-center">
          <a href="/" className="text-xs text-muted hover:text-ink transition-colors font-medium">
            &larr; {t('admin_back_to_site')}
          </a>
        </div>
      </div>
    </div>
  );
}
