'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const ADMIN_SECRET_CODE = 'Retro2003Admin';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAuthorized(true);
      setChecking(false);
      return;
    }

    const authLocal = localStorage.getItem('retro_admin_auth');
    const authSession = sessionStorage.getItem('retro_admin_auth');
    const hasValidCookie = document.cookie.includes(`retro_admin_auth=${ADMIN_SECRET_CODE}`);

    if (authLocal === ADMIN_SECRET_CODE || authSession === ADMIN_SECRET_CODE || hasValidCookie) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      router.replace('/admin/login');
    }
    setChecking(false);
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-retro-orange border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase font-bold text-muted tracking-wider">Проверка на пристап...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized && pathname !== '/admin/login') {
    return null;
  }

  return <>{children}</>;
}
