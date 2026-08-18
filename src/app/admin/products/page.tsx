'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Edit3, Eye, EyeOff, Search, Trash2 } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Product } from '@/types/database';
import { formatPrice } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { getClientProducts, saveClientProduct, deleteClientProduct } from '@/lib/products-store';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AdminProductsPage() {
  const { t, getCategoryText } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'hidden'>('all');

  const fetchProducts = async () => {
    const clientList = getClientProducts([]);
    setProducts(clientList);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*, variants:product_variants(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const merged = getClientProducts(data as Product[]);
        setProducts(merged);
      }
    } catch {
      // keep client list
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleActive = async (productId: string, currentActive: boolean) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const updatedProduct = { ...target, active: !currentActive };
    saveClientProduct(updatedProduct);

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? updatedProduct : p))
    );

    try {
      const supabase = createClient();
      await supabase.from('products').update({ active: !currentActive }).eq('id', productId);
    } catch {
      // ignore
    }
  };

  const handleToggleNew = async (productId: string, currentNew?: boolean) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const updatedProduct = { ...target, is_new: !currentNew };
    saveClientProduct(updatedProduct);

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? updatedProduct : p))
    );

    try {
      const supabase = createClient();
      await supabase.from('products').update({ is_new: !currentNew }).eq('id', productId);
    } catch {
      // ignore
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`${t('admin_confirm_delete')}\n\n"${productName}"`)) {
      return;
    }

    deleteClientProduct(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    try {
      const supabase = createClient();
      await supabase.from('products').delete().eq('id', productId);
    } catch {
      // ignore
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
      <AdminHeader title={t('admin_products_header')} showBack backUrl="/admin" />

      <main className="max-w-2xl mx-auto w-full p-4 sm:p-6 space-y-4">
        {/* Top Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder={t('admin_products_search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-black/10 text-ink focus:outline-none focus:border-ink rounded-none"
            />
          </div>

          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 bg-ink text-white hover:bg-retro-orange hover:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
          >
            <PlusCircle size={15} />
            <span>{t('admin_products_add_btn')}</span>
          </Link>
        </div>

        {/* Filter tabs: All, Active, Hidden */}
        <div className="flex gap-2 text-xs font-bold">
          <button
            onClick={() => setFilterActive('all')}
            className={`px-3 py-1.5 border transition-all ${
              filterActive === 'all' ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-black/10'
            }`}
          >
            {t('admin_tab_all')} ({products.length})
          </button>
          <button
            onClick={() => setFilterActive('active')}
            className={`px-3 py-1.5 border transition-all ${
              filterActive === 'active' ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-black/10'
            }`}
          >
            {t('admin_tab_active')} ({products.filter((p) => p.active).length})
          </button>
          <button
            onClick={() => setFilterActive('hidden')}
            className={`px-3 py-1.5 border transition-all ${
              filterActive === 'hidden' ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-black/10'
            }`}
          >
            {t('admin_tab_hidden')} ({products.filter((p) => !p.active).length})
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
                  product.active ? 'border-black/10 shadow-sm' : 'border-dashed border-zinc-300 opacity-60 bg-zinc-50'
                }`}
              >
                {/* Left: Image & Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-16 h-20 bg-surface shrink-0 overflow-hidden border border-black/10">
                    <Image
                      src={product.image_url || '/assets/look-01.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 bg-surface text-muted border border-black/10">
                        {getCategoryText(product.category)}
                      </span>
                      {product.is_new && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-retro-orange text-white">
                          NEW ⭐
                        </span>
                      )}
                      {!product.active && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-zinc-200 text-zinc-600">
                          {t('admin_status_hidden')}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-ink truncate">{product.name}</h3>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-display text-base text-ink font-normal">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-muted font-medium">
                        {t('admin_stock_avail', { count: totalStock })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggleNew(product.id, product.is_new)}
                    className={`p-2 border transition-colors ${
                      product.is_new
                        ? 'border-retro-orange bg-retro-orange/10 text-retro-orange'
                        : 'border-black/10 hover:border-retro-orange text-muted hover:text-retro-orange'
                    }`}
                    title={product.is_new ? 'Remove NEW flag' : 'Mark as NEW'}
                  >
                    ⭐
                  </button>

                  <button
                    onClick={() => handleToggleActive(product.id, product.active)}
                    className="p-2 border border-black/10 hover:border-ink text-ink transition-colors"
                    title={product.active ? 'Hide' : 'Show'}
                  >
                    {product.active ? <Eye size={16} /> : <EyeOff size={16} className="text-muted" />}
                  </button>

                  <Link
                    href={`/admin/products/${product.id}`}
                    className="px-3 py-2 bg-surface hover:bg-ink hover:text-white border border-black/10 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 size={14} />
                    <span>{t('admin_btn_edit')}</span>
                  </Link>

                  <button
                    onClick={() => handleDeleteProduct(product.id, product.name)}
                    className="p-2 border border-black/10 hover:border-red-600 hover:text-red-600 text-muted transition-colors"
                    title={t('admin_btn_delete')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && !loading && (
            <div className="bg-white border border-black/10 p-8 text-center text-xs text-muted">
              {t('admin_no_products')}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
