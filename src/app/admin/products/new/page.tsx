'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddProductPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/products');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <p className="text-xs uppercase font-bold tracking-wider text-muted animate-pulse">
        Се пренасочува кон производи...
      </p>
    </div>
  );
}
