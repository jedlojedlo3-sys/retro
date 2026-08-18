'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '@/types/database';
import { CATEGORIES } from '@/lib/utils';
import { ProductCard } from './ProductCard';
import { Search, X, Sparkles, ArrowUpDown, Check } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getClientProducts } from '@/lib/products-store';

interface ProductsCatalogProps {
  initialProducts: Product[];
}

type SortOption = 'newest' | 'price_asc' | 'price_desc';

export function ProductsCatalog({ initialProducts }: ProductsCatalogProps) {
  const { t, getCategoryText, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlySale, setOnlySale] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    setProducts(getClientProducts(initialProducts));
  }, [initialProducts]);

  const activeProducts = useMemo(() => {
    return products.filter((p) => p.active !== false);
  }, [products]);

  const newCount = useMemo(() => activeProducts.filter((p) => p.is_new).length, [activeProducts]);
  const saleCount = useMemo(
    () => activeProducts.filter((p) => p.original_price && p.original_price > p.price).length,
    [activeProducts]
  );

  const filteredProducts = useMemo(() => {
    return activeProducts
      .filter((product) => {
        if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
        if (onlyNew && !product.is_new) return false;
        if (onlySale && (!product.original_price || product.original_price <= product.price)) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          if (
            !product.name.toLowerCase().includes(q) &&
            !product.description?.toLowerCase().includes(q) &&
            !getCategoryText(product.category).toLowerCase().includes(q)
          ) return false;
        }
        if (onlyInStock) {
          const avail = product.variants?.reduce((acc, v) => acc + Math.max(0, v.stock_quantity - v.reserved_quantity), 0) ?? 0;
          if (avail <= 0) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          if (a.is_new && !b.is_new) return -1;
          if (!a.is_new && b.is_new) return 1;
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        }
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        return 0;
      });
  }, [activeProducts, selectedCategory, searchQuery, onlyInStock, onlyNew, onlySale, sortBy, getCategoryText]);

  const hasActiveFilters = selectedCategory !== 'all' || searchQuery.trim() || onlyInStock || onlyNew || onlySale || sortBy !== 'newest';

  const resetAll = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setOnlyInStock(false);
    setOnlyNew(false);
    setOnlySale(false);
    setSortBy('newest');
  };

  return (
    <div className="space-y-6">
      {/* ── Collection Title Header ─────────────────────────────── */}
      <div className="pb-3 border-b border-black/[0.06] flex items-baseline justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-retro-orange block">
            RETRO BOUTIQUE · PRILEP
          </span>
          <h1 className="font-display text-4xl sm:text-6xl uppercase text-ink leading-tight tracking-tight">
            {language === 'mk' ? 'Машка Колекција' : "Men's Collection"}
          </h1>
        </div>

        <span className="text-xs font-semibold text-muted shrink-0">
          {filteredProducts.length} {language === 'mk' ? 'модели' : 'items'}
        </span>
      </div>

      {/* ── Modern Sticky Fashion Filter Toolbar (Zara / ASOS style) ─────────────────────────────── */}
      <div className="sticky top-14 sm:top-16 z-30 bg-paper/95 backdrop-blur-md py-2.5 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-black/[0.06] space-y-2.5">
        {/* Row 1: Horizontal Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {/* All */}
          <button
            onClick={() => { setSelectedCategory('all'); setOnlyNew(false); setOnlySale(false); }}
            className={`shrink-0 h-8 px-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
              selectedCategory === 'all' && !onlyNew && !onlySale
                ? 'bg-ink text-white shadow-sm'
                : 'bg-white border border-black/10 text-muted hover:text-ink hover:border-ink'
            }`}
          >
            {t('cat_all')} ({activeProducts.length})
          </button>

          {/* NEW Filter Pill */}
          {newCount > 0 && (
            <button
              onClick={() => {
                setOnlyNew(!onlyNew);
                setOnlySale(false);
                if (!onlyNew) setSelectedCategory('all');
              }}
              className={`shrink-0 h-8 px-3.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-150 flex items-center gap-1 ${
                onlyNew
                  ? 'bg-ink text-white shadow-sm ring-2 ring-ink/30'
                  : 'bg-white border border-black/15 text-ink hover:bg-ink hover:text-white'
              }`}
            >
              <Sparkles size={12} />
              <span>⭐ NEW</span>
              <span className="opacity-80 ml-0.5">({newCount})</span>
            </button>
          )}

          {/* SALE / Popust Filter Pill */}
          {saleCount > 0 && (
            <button
              onClick={() => {
                setOnlySale(!onlySale);
                setOnlyNew(false);
                if (!onlySale) setSelectedCategory('all');
              }}
              className={`shrink-0 h-8 px-3.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-150 flex items-center gap-1 ${
                onlySale
                  ? 'bg-retro-orange text-white shadow-sm ring-2 ring-retro-orange/30'
                  : 'bg-white border border-retro-orange/40 text-retro-orange hover:bg-retro-orange hover:text-white'
              }`}
            >
              <span>🔥 {t('only_sale')}</span>
              <span className="opacity-80 ml-0.5">({saleCount})</span>
            </button>
          )}

          {/* Categories */}
          {CATEGORIES.map((cat) => {
            const count = activeProducts.filter((p) => p.category === cat.key).length;
            if (count === 0) return null;
            const isSelected = selectedCategory === cat.key && !onlyNew && !onlySale;
            return (
              <button
                key={cat.key}
                onClick={() => { setSelectedCategory(cat.key); setOnlyNew(false); setOnlySale(false); }}
                className={`shrink-0 h-8 px-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                  isSelected
                    ? 'bg-ink text-white shadow-sm'
                    : 'bg-white border border-black/10 text-muted hover:text-ink hover:border-ink'
                }`}
              >
                {getCategoryText(cat.key)} ({count})
              </button>
            );
          })}
        </div>

        {/* Row 2: Search, In-Stock, Sort Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[150px] sm:min-w-[220px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder={language === 'mk' ? 'Пребарај фармерки, џемпери...' : 'Search jeans, sweaters...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-7 text-xs bg-white border border-black/10 rounded-full text-ink placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* In Stock toggle pill */}
          <button
            onClick={() => setOnlyInStock(!onlyInStock)}
            className={`h-8 px-3 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
              onlyInStock
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                : 'bg-white border-black/10 text-muted hover:text-ink'
            }`}
          >
            {onlyInStock && <Check size={12} strokeWidth={3} />}
            <span>{language === 'mk' ? 'На залиха' : 'In stock'}</span>
          </button>

          {/* Clean 3-Option Sort Selector */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-8 pl-3 pr-7 bg-white border border-black/10 rounded-full text-xs font-semibold text-ink focus:outline-none focus:border-ink transition-colors cursor-pointer appearance-none"
            >
              <option value="newest">{t('sort_newest')}</option>
              <option value="price_asc">{t('sort_price_asc')}</option>
              <option value="price_desc">{t('sort_price_desc')}</option>
            </select>
            <ArrowUpDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>

          {/* Reset button if any filter is active */}
          {hasActiveFilters && (
            <button
              onClick={resetAll}
              className="h-8 px-2.5 rounded-full text-[11px] font-bold uppercase text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1"
              title="Reset all"
            >
              <X size={12} />
              <span>{language === 'mk' ? 'Исчисти' : 'Reset'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Products Grid (2 columns on mobile, 3 on tablet, 4 on desktop) ─────────────────────────────── */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 pt-1">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 bg-white border border-black/5 p-8">
          <p className="font-display text-2xl uppercase text-ink">{t('no_products_found')}</p>
          <p className="text-xs text-muted max-w-sm mx-auto">{t('no_products_desc')}</p>
          <button
            onClick={resetAll}
            className="mt-2 px-5 py-2.5 bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-retro-orange transition-colors"
          >
            {t('reset_filters')}
          </button>
        </div>
      )}
    </div>
  );
}
