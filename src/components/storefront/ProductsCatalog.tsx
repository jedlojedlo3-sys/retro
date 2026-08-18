'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '@/types/database';
import { CATEGORIES } from '@/lib/utils';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal, PackageOpen } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getClientProducts } from '@/lib/products-store';

interface ProductsCatalogProps {
  initialProducts: Product[];
}

export function ProductsCatalog({ initialProducts }: ProductsCatalogProps) {
  const { t, getCategoryText, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  useEffect(() => {
    setProducts(getClientProducts(initialProducts));
  }, [initialProducts]);

  const activeProducts = useMemo(() => {
    return products.filter((p) => p.active !== false);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return activeProducts
      .filter((product) => {
        if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          if (!product.name.toLowerCase().includes(q) && !product.description?.toLowerCase().includes(q)) return false;
        }
        if (onlyInStock) {
          const avail = product.variants?.reduce((acc, v) => acc + Math.max(0, v.stock_quantity - v.reserved_quantity), 0) ?? 0;
          if (avail <= 0) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [activeProducts, selectedCategory, searchQuery, onlyInStock, sortBy]);

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div className="pb-10 border-b border-black/[0.06] space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-retro-orange" />
          <span className="section-eyebrow">RETRO BOUTIQUE · PRILEP</span>
        </div>
        <h1 className="font-display text-6xl sm:text-8xl uppercase text-ink leading-none tracking-tight">
          {language === 'mk' ? "Машка Колекција" : "Men's Collection"}
        </h1>
        <p className="text-sm text-muted max-w-xl leading-relaxed">
          {language === 'mk'
            ? 'Избери големина и резервирај онлајн. Подигнување и плаќање исклучиво во продавницата на Stiv Naumov 8 во Прилеп.'
            : 'Select your size and reserve online. Pickup and payment exclusively at our store at Stiv Naumov 8 in Prilep.'}
        </p>
      </div>

      {/* Filters bar */}
      <div className="bg-white border border-black/[0.06] p-5 space-y-4 shadow-card">
        {/* Category tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] border transition-all duration-200 ${
              selectedCategory === 'all'
                ? 'bg-ink text-white border-ink'
                : 'border-black/10 text-muted hover:border-ink hover:text-ink'
            }`}
          >
            {t('cat_all')} ({activeProducts.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = activeProducts.filter((p) => p.category === cat.key).length;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`shrink-0 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] border transition-all duration-200 ${
                  selectedCategory === cat.key
                    ? 'bg-ink text-white border-ink'
                    : 'border-black/10 text-muted hover:border-ink hover:text-ink'
                }`}
              >
                {getCategoryText(cat.key)} ({count})
              </button>
            );
          })}
        </div>

        {/* Search + controls row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-black/[0.06]">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/60" />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-surface border border-black/[0.06] text-ink placeholder:text-muted/50 focus:outline-none focus:border-ink/30 transition-colors"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <label className="flex items-center gap-2 text-xs font-semibold text-muted cursor-pointer select-none hover:text-ink transition-colors">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded accent-retro-orange w-3.5 h-3.5"
              />
              <span>{t('only_in_stock')}</span>
            </label>

            <div className="flex items-center gap-1.5">
              <SlidersHorizontal size={13} className="text-muted/60" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-surface border border-black/[0.06] text-ink px-3 py-2 text-xs font-medium focus:outline-none focus:border-ink/30 transition-colors"
              >
                <option value="newest">{t('sort_newest')}</option>
                <option value="price_asc">{t('sort_price_asc')}</option>
                <option value="price_desc">{t('sort_price_desc')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      {filteredProducts.length > 0 && (
        <p className="text-xs text-muted font-medium">
          {filteredProducts.length} {language === 'mk' ? 'производи' : 'products'}
        </p>
      )}

      {/* Grid or empty state */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center space-y-4">
          <PackageOpen size={40} className="mx-auto text-muted/30" />
          <h3 className="font-display text-3xl uppercase text-ink">{t('no_products_found')}</h3>
          <p className="text-sm text-muted">{t('no_products_desc')}</p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setOnlyInStock(false); }}
            className="mt-2 px-6 py-3 bg-ink text-white text-xs font-semibold uppercase tracking-wider hover:bg-retro-orange transition-colors duration-200"
          >
            {t('reset_filters')}
          </button>
        </div>
      )}
    </div>
  );
}
