'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAuthorized(true);
      setChecking(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth');
        if (res.ok) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.replace('/admin/login');
        }
      } catch {
        const authLocal = localStorage.getItem('retro_admin_auth');
        if (authLocal === 'Retro2003Admin') {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.replace('/admin/login');
        }
      } finally {
        setChecking(false);
      }
    }

    checkAuth();
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
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

  return <>{children}</>;
}
