'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        throw new Error(error.message || 'Невалидна е-пошта или лозинка.');
      }

      if (data.session) {
        router.push('/admin');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(
        err.message?.includes('Invalid login credentials')
          ? 'Погрешна е-пошта или лозинка.'
          : err.message || 'Се појави грешка при најавата.'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white border border-ink/15 shadow-2xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border border-ink/20 mx-auto">
            <Image src="/assets/logo-retro.png" alt="Retro Boutique" fill className="object-cover" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-retro-orange block">
              ПРИВАТЕН ПАНЕЛ
            </span>
            <h1 className="font-display text-3xl uppercase tracking-wider text-ink">
              RETRO ADMIN
            </h1>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
              Е-пошта
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email"
                required
                placeholder="maria@retroboutique.mk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-paper border border-ink/20 text-ink focus:outline-none focus:border-ink rounded-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
              Лозинка
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-paper border border-ink/20 text-ink focus:outline-none focus:border-ink rounded-none"
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
            className={`w-full py-3.5 bg-ink text-white hover:bg-retro-orange hover:text-ink font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
              isLoading ? 'opacity-50 cursor-wait' : ''
            }`}
          >
            <span>{isLoading ? 'Се најавува...' : 'Најави се'}</span>
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
