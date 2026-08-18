'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Edit3, Eye, EyeOff, Search, AlertCircle } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Product } from '@/types/database';
import { formatPrice, getCategoryLabel } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { FALLBACK_DEMO_PRODUCTS } from '@/lib/mock-data';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'hidden'>('all');

  const fetchProducts = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*, variants:product_variants(*)')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setProducts(FALLBACK_DEMO_PRODUCTS);
      } else {
        setProducts(data as Product[]);
      }
    } catch {
      setProducts(FALLBACK_DEMO_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleActive = async (productId: string, currentActive: boolean) => {
    const nextActive = !currentActive;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, active: nextActive } : p))
    );

    try {
      const supabase = createClient();
      await supabase.from('products').update({ active: nextActive }).eq('id', productId);
    } catch (err) {
      console.error('Failed to toggle active', err);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (filterActive === 'active' && !p.active) return false;
    if (filterActive === 'hidden' && p.active) return false;
    if (searchQuery.trim()) {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-paper flex flex-col pb-16">
      <AdminHeader title="ПРОИЗВОДИ" showBack backUrl="/admin" />

      <main className="max-w-2xl mx-auto w-full p-4 sm:p-6 space-y-4">
        {/* Top Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Пребарај..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-ink/15 text-ink focus:outline-none focus:border-ink rounded-none"
            />
          </div>

          <Link
            href="/admin/products/new"
            className="px-3.5 py-2 bg-ink text-white hover:bg-retro-orange hover:text-ink font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <PlusCircle size={15} />
            <span>Додај</span>
          </Link>
        </div>

        {/* Filter tabs: All, Active, Hidden */}
        <div className="flex gap-2 text-xs font-bold">
          <button
            onClick={() => setFilterActive('all')}
            className={`px-3 py-1.5 border transition-all ${
              filterActive === 'all' ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-ink/15'
            }`}
          >
            Сите ({products.length})
          </button>
          <button
            onClick={() => setFilterActive('active')}
            className={`px-3 py-1.5 border transition-all ${
              filterActive === 'active' ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-ink/15'
            }`}
          >
            Активни ({products.filter((p) => p.active).length})
          </button>
          <button
            onClick={() => setFilterActive('hidden')}
            className={`px-3 py-1.5 border transition-all ${
              filterActive === 'hidden' ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-ink/15'
            }`}
          >
            Скриени ({products.filter((p) => !p.active).length})
          </button>
        </div>

        {/* Product Cards List */}
        <div className="space-y-3">
          {filteredProducts.map((product) => {
            const totalStock =
              product.variants?.reduce(
                (acc, v) => acc + Math.max(0, v.stock_quantity - v.reserved_quantity),
                0
              ) ?? 0;

            return (
              <div
                key={product.id}
                className={`bg-white border p-3.5 sm:p-4 flex items-center justify-between gap-4 transition-all ${
                  product.active ? 'border-ink/15 shadow-sm' : 'border-dashed border-zinc-300 opacity-60 bg-zinc-50'
                }`}
              >
                {/* Left: Image & Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-16 h-20 bg-paper-dark shrink-0 overflow-hidden border border-ink/10">
                    <Image
                      src={product.image_url || '/assets/look-01.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 bg-paper text-muted border border-ink/10">
                        {getCategoryLabel(product.category)}
                      </span>
                      {!product.active && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-zinc-200 text-zinc-600">
                          Скриен
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-ink truncate">{product.name}</h3>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-display text-base text-ink font-normal">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-muted font-medium">
                        Достапно: <strong>{totalStock} пар.</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(product.id, product.active)}
                    className="p-2 border border-ink/15 hover:border-ink rounded text-ink transition-colors"
                    title={product.active ? 'Скриј од продавница' : 'Прикажи во продавница'}
                  >
                    {product.active ? <Eye size={16} /> : <EyeOff size={16} className="text-muted" />}
                  </button>

                  <Link
                    href={`/admin/products/${product.id}`}
                    className="px-3 py-2 bg-paper hover:bg-ink hover:text-white border border-ink/20 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 size={14} />
                    <span>Измени</span>
                  </Link>
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && !loading && (
            <div className="bg-white border border-ink/10 p-8 text-center text-xs text-muted">
              Нема производи за прикажување.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
