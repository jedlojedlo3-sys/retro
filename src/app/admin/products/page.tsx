'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Edit3, Eye, EyeOff, Search, Trash2, Check, Sparkles } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Product, ProductVariant } from '@/types/database';
import { formatPrice } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { getClientProducts, saveClientProduct, deleteClientProduct } from '@/lib/products-store';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AdminProductsPage() {
  const { t, getCategoryText } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'hidden' | 'new'>('all');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  const fetchProducts = () => {
    const clientList = getClientProducts([]);
    setProducts(clientList);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Quick Stock Adjustment directly from list without opening edit page
  const handleQuickStock = (productId: string, variantIndex: number, delta: number) => {
    const target = products.find((p) => p.id === productId);
    if (!target || !target.variants) return;

    const newVariants = target.variants.map((v, idx) => {
      if (idx !== variantIndex) return v;
      const newStock = Math.max(v.reserved_quantity, v.stock_quantity + delta);
      return { ...v, stock_quantity: newStock };
    });

    const updatedProduct: Product = {
      ...target,
      variants: newVariants,
      updated_at: new Date().toISOString(),
    };

    saveClientProduct(updatedProduct);
    setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProduct : p)));
  };

  // Quick Price Edit inline
  const startEditPrice = (product: Product) => {
    setEditingPriceId(product.id);
    setTempPrice(String(product.price));
  };

  const savePrice = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const num = Number(tempPrice);
    if (!isNaN(num) && num > 0) {
      const updatedProduct: Product = {
        ...target,
        price: num,
        updated_at: new Date().toISOString(),
      };
      saveClientProduct(updatedProduct);
      setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProduct : p)));
    }
    setEditingPriceId(null);
  };

  const handleToggleActive = (productId: string, currentActive: boolean) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const updatedProduct = { ...target, active: !currentActive, updated_at: new Date().toISOString() };
    saveClientProduct(updatedProduct);

    setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProduct : p)));
  };

  const handleToggleNew = (productId: string, currentNew?: boolean) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const updatedProduct = { ...target, is_new: !currentNew, updated_at: new Date().toISOString() };
    saveClientProduct(updatedProduct);

    setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProduct : p)));
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (!window.confirm(`${t('admin_confirm_delete')}\n\n"${productName}"`)) {
      return;
    }

    deleteClientProduct(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const filteredProducts = products.filter((p) => {
    if (filterActive === 'active' && !p.active) return false;
    if (filterActive === 'hidden' && p.active) return false;
    if (filterActive === 'new' && !p.is_new) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(q) ||
        getCategoryText(p.category).toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-paper flex flex-col pb-20">
      <AdminHeader title={t('admin_products_header')} showBack backUrl="/admin" />

      <main className="max-w-3xl mx-auto w-full p-4 sm:p-6 space-y-4">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder={t('admin_products_search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-black/10 text-ink focus:outline-none focus:border-ink rounded-none"
            />
          </div>

          <Link
            href="/admin/products/new"
            className="px-5 py-2.5 bg-retro-orange text-white hover:bg-ink font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 transition-colors shadow-sm"
          >
            <PlusCircle size={16} />
            <span>➕ {t('admin_dash_add_prod_title')}</span>
          </Link>
        </div>

        {/* Filter tabs: All, New, Active, Hidden */}
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => setFilterActive('all')}
            className={`px-3 py-1.5 border transition-all ${
              filterActive === 'all' ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-black/10'
            }`}
          >
            {t('admin_tab_all')} ({products.length})
          </button>
          <button
            onClick={() => setFilterActive('new')}
            className={`px-3 py-1.5 border transition-all ${
              filterActive === 'new' ? 'bg-retro-orange text-white border-retro-orange' : 'bg-white text-ink border-black/10'
            }`}
          >
            ⭐ NEW ({products.filter((p) => p.is_new).length})
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

        {/* Product Cards List with Inline Fast Actions */}
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
                className={`bg-white border p-4 transition-all shadow-sm ${
                  product.active ? 'border-black/10' : 'border-dashed border-zinc-300 opacity-70 bg-zinc-50'
                }`}
              >
                {/* Top: Image, Details & Action Icons */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="relative w-16 h-20 bg-surface shrink-0 overflow-hidden border border-black/10">
                      <Image
                        src={product.image_url || '/assets/look-01.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-surface text-muted border border-black/10">
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

                      {/* Inline Price with 1-click Quick Edit */}
                      <div className="flex items-center gap-2">
                        {editingPriceId === product.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={tempPrice}
                              autoFocus
                              onChange={(e) => setTempPrice(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && savePrice(product.id)}
                              className="w-20 px-2 py-0.5 border border-ink text-xs font-bold bg-white"
                            />
                            <button
                              onClick={() => savePrice(product.id)}
                              className="p-1 bg-ink text-white hover:bg-emerald-600"
                            >
                              <Check size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditPrice(product)}
                            className="font-display text-lg text-ink hover:text-retro-orange transition-colors flex items-center gap-1"
                            title="Click to edit price"
                          >
                            <span>{formatPrice(product.price)}</span>
                            <span className="text-[10px] text-muted">✏️</span>
                          </button>
                        )}
                        <span className="text-muted text-xs font-medium">
                          ({t('admin_stock_avail', { count: totalStock })})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Right: 1-Click Fast Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleNew(product.id, product.is_new)}
                      className={`p-2 border text-xs font-bold transition-all ${
                        product.is_new
                          ? 'border-retro-orange bg-retro-orange text-white'
                          : 'border-black/10 hover:border-retro-orange text-muted hover:text-retro-orange bg-white'
                      }`}
                      title={product.is_new ? 'Remove NEW' : 'Mark as NEW'}
                    >
                      ⭐ {product.is_new ? 'NEW' : ''}
                    </button>

                    <button
                      onClick={() => handleToggleActive(product.id, product.active)}
                      className="p-2 border border-black/10 hover:border-ink text-ink bg-white transition-colors"
                      title={product.active ? 'Hide from shop' : 'Show in shop'}
                    >
                      {product.active ? <Eye size={16} /> : <EyeOff size={16} className="text-muted" />}
                    </button>

                    <Link
                      href={`/admin/products/${product.id}`}
                      className="p-2 border border-black/10 hover:border-ink text-ink bg-white transition-colors"
                      title="Full Edit"
                    >
                      <Edit3 size={15} />
                    </Link>

                    <button
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      className="p-2 border border-black/10 hover:border-red-600 hover:text-red-600 text-muted bg-white transition-colors"
                      title={t('admin_btn_delete')}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Bottom: Fast Inline Stock Modifier (+/- per size) */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-black/[0.06]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1.5">
                      Брза залиха по големини (Quick Stock +/-):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant, vIdx) => {
                        const avail = Math.max(0, variant.stock_quantity - variant.reserved_quantity);
                        return (
                          <div
                            key={variant.id || vIdx}
                            className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface border border-black/10 rounded-none text-xs"
                          >
                            <span className="font-bold text-ink">{variant.size}</span>
                            <button
                              type="button"
                              onClick={() => handleQuickStock(product.id, vIdx, -1)}
                              disabled={variant.stock_quantity <= variant.reserved_quantity}
                              className="w-5 h-5 bg-white hover:bg-ink hover:text-white border border-black/10 font-bold flex items-center justify-center transition-colors disabled:opacity-30"
                            >
                              -
                            </button>
                            <span className="font-extrabold text-ink min-w-[14px] text-center">
                              {avail}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickStock(product.id, vIdx, 1)}
                              className="w-5 h-5 bg-white hover:bg-ink hover:text-white border border-black/10 font-bold flex items-center justify-center transition-colors"
                            >
                              +
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
