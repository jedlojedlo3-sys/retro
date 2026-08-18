'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  // Check localStorage immediately for 0ms instant authorization
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    if (pathname === '/admin/login') return true;
    return localStorage.getItem('retro_admin_auth') === 'Retro2003Admin';
  });
  const [checking, setChecking] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (pathname === '/admin/login') return false;
    return localStorage.getItem('retro_admin_auth') !== 'Retro2003Admin';
  });

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAuthorized(true);
      setChecking(false);
      return;
    }

    const localAuth = localStorage.getItem('retro_admin_auth');
    if (localAuth === 'Retro2003Admin') {
      setIsAuthorized(true);
      setChecking(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth', { cache: 'no-store' });
        if (res.ok) {
          setIsAuthorized(true);
          localStorage.setItem('retro_admin_auth', 'Retro2003Admin');
        } else {
          setIsAuthorized(false);
          router.replace('/admin/login');
        }
      } catch {
        setIsAuthorized(false);
        router.replace('/admin/login');
      } finally {
        setChecking(false);
      }
    }

    checkAuth();
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-retro-orange border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase font-bold text-muted tracking-wider">{t('admin_checking')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized && pathname !== '/admin/login') {
    return null;
  }

  return <div className="w-full max-w-full overflow-x-hidden">{children}</div>;
}
