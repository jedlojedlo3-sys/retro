'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const ADMIN_SECRET_CODE = 'Retro2003Admin';

export default function AdminLoginPage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if already authenticated
    const isAuth =
      localStorage.getItem('retro_admin_auth') === ADMIN_SECRET_CODE ||
      sessionStorage.getItem('retro_admin_auth') === ADMIN_SECRET_CODE;
    if (isAuth) {
      router.replace('/admin');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const cleanCode = accessCode.trim();

    if (cleanCode === ADMIN_SECRET_CODE) {
      localStorage.setItem('retro_admin_auth', ADMIN_SECRET_CODE);
      sessionStorage.setItem('retro_admin_auth', ADMIN_SECRET_CODE);
      document.cookie = `retro_admin_auth=${ADMIN_SECRET_CODE}; path=/; max-age=604800; SameSite=Lax`;

      router.push('/admin');
      router.refresh();
    } else {
      setIsLoading(false);
      setErrorMessage('Невалиден пристапен код.');
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white border border-black/[0.08] shadow-2xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border border-black/10 mx-auto">
            <Image src="/assets/logo-retro.png" alt="Retro Boutique" fill className="object-cover" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-retro-orange block">
              ПРИВАТЕН ПАНЕЛ
            </span>
            <h1 className="font-display text-3xl uppercase tracking-wider text-ink">
              RETRO ADMIN
            </h1>
            <p className="text-xs text-muted mt-1">
              Внесете го безбедносниот код за пристап
            </p>
          </div>
        </div>

        {/* Access Code Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              Пристапен код
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
            <span>{isLoading ? 'Проверка...' : 'Влези во Админ'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="pt-2 text-center">
          <a href="/" className="text-xs text-muted hover:text-ink transition-colors font-medium">
            &larr; Кон веб-страницата
          </a>
        </div>
      </div>
    </div>
  );
}
