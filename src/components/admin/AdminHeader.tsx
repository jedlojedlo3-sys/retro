'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut, PlusCircle, Shirt, ClipboardList } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AdminHeaderProps {
  title?: string;
  showBack?: boolean;
  backUrl?: string;
}

export function AdminHeader({ title = 'RETRO ADMIN', showBack = false, backUrl = '/admin' }: AdminHeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.push('/admin/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-ink text-white border-b border-white/10 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <Link
              href={backUrl}
              className="p-1.5 -ml-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
              aria-label="Назад"
            >
              <ArrowLeft size={20} />
            </Link>
          )}

          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-white/20">
              <Image src="/assets/logo-retro.png" alt="Retro" fill className="object-cover" />
            </div>
            <span className="font-display text-xl tracking-wider text-white">
              {title}
            </span>
          </Link>
        </div>

        {/* Quick actions & logout */}
        <div className="flex items-center gap-1 sm:gap-3 text-xs font-semibold">
          <Link
            href="/admin/products/new"
            className="p-2 sm:px-3 sm:py-1.5 bg-retro-orange text-ink rounded font-bold hover:bg-white transition-colors flex items-center gap-1.5"
            title="Додај производ"
          >
            <PlusCircle size={16} />
            <span className="hidden sm:inline">Додај</span>
          </Link>

          <Link
            href="/admin/products"
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Производи"
          >
            <Shirt size={18} />
          </Link>

          <Link
            href="/admin/reservations"
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Резервации"
          >
            <ClipboardList size={18} />
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 text-white/60 hover:text-red-400 hover:bg-white/10 rounded transition-colors ml-1"
            title="Одјави се"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
