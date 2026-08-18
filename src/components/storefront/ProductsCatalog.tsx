'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '@/types/database';
import { CATEGORIES } from '@/lib/utils';
import { ProductCard } from './ProductCard';
import { Search, PackageOpen, X, Sparkles, Package, ArrowUpDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getClientProducts } from '@/lib/products-store';

interface ProductsCatalogProps {
  initialProducts: Product[];
}

type SortOption = 'new_first' | 'newest' | 'price_asc' | 'price_desc';

export function ProductsCatalog({ initialProducts }: ProductsCatalogProps) {
  const { t, getCategoryText, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('new_first');

  useEffect(() => {
    setProducts(getClientProducts(initialProducts));
  }, [initialProducts]);

  const activeProducts = useMemo(() => {
    return products.filter((p) => p.active !== false);
  }, [products]);

  const newCount = useMemo(() => activeProducts.filter((p) => p.is_new).length, [activeProducts]);

  const filteredProducts = useMemo(() => {
    return activeProducts
      .filter((product) => {
        if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
        if (onlyNew && !product.is_new) return false;
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
        if (sortBy === 'new_first') {
          if (a.is_new && !b.is_new) return -1;
          if (!a.is_new && b.is_new) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [activeProducts, selectedCategory, searchQuery, onlyInStock, onlyNew, sortBy, getCategoryText]);

  const hasActiveFilters = selectedCategory !== 'all' || searchQuery.trim() || onlyInStock || onlyNew || sortBy !== 'new_first';

  const resetAll = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setOnlyInStock(false);
    setOnlyNew(false);
    setSortBy('new_first');
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="pb-8 border-b border-black/[0.06] space-y-3">
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

      {/* ── FILTER PANEL ─────────────────────────────── */}
      <div className="bg-white border border-black/[0.06] shadow-card overflow-hidden">

        {/* Row 1: Category pills */}
        <div className="px-5 pt-5 pb-4 border-b border-black/[0.04]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">
            {language === 'mk' ? 'Категорија' : 'Category'}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] border transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-ink text-white border-ink'
                  : 'border-black/10 text-muted hover:border-ink hover:text-ink bg-surface'
              }`}
            >
              {t('cat_all')} <span className="opacity-60 ml-1">({activeProducts.length})</span>
            </button>
            {CATEGORIES.map((cat) => {
              const count = activeProducts.filter((p) => p.category === cat.key).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] border transition-all duration-200 ${
                    selectedCategory === cat.key
                      ? 'bg-ink text-white border-ink'
                      : 'border-black/10 text-muted hover:border-ink hover:text-ink bg-surface'
                  }`}
                >
                  {getCategoryText(cat.key)} <span className="opacity-60 ml-1">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Quick toggles row */}
        <div className="px-5 py-4 border-b border-black/[0.04]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">
            {language === 'mk' ? 'Hitre izbire' : 'Quick Filters'}
          </p>
          <div className="flex flex-wrap gap-2">
            {/* NEW toggle */}
            {newCount > 0 && (
              <button
                onClick={() => setOnlyNew(!onlyNew)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-wider border transition-all duration-200 ${
                  onlyNew
                    ? 'bg-retro-orange text-white border-retro-orange'
                    : 'border-black/10 text-ink bg-surface hover:border-retro-orange hover:text-retro-orange'
                }`}
              >
                <Sparkles size={12} />
                <span>{language === 'mk' ? 'Нови пристигнувања' : 'New Arrivals'}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${onlyNew ? 'bg-white/30' : 'bg-retro-orange/10 text-retro-orange'}`}>
                  {newCount}
                </span>
              </button>
            )}

            {/* In stock toggle */}
            <button
              onClick={() => setOnlyInStock(!onlyInStock)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider border transition-all duration-200 ${
                onlyInStock
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'border-black/10 text-ink bg-surface hover:border-emerald-700 hover:text-emerald-700'
              }`}
            >
              <Package size={12} />
              <span>{t('only_in_stock')}</span>
            </button>
          </div>
        </div>

        {/* Row 3: Search + Sort */}
        <div className="px-5 py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/60 pointer-events-none" />
            <input
              type="text"
              placeholder={language === 'mk' ? 'Пребарај по назив, категорија...' : 'Search by name, category...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 text-xs bg-surface border border-black/[0.08] text-ink placeholder:text-muted/50 focus:outline-none focus:border-ink/30 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown size={13} className="text-muted/60" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-surface border border-black/[0.08] text-ink px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-ink/30 transition-colors cursor-pointer"
            >
              <option value="new_first">{language === 'mk' ? '⭐ Нови прво' : '⭐ New First'}</option>
              <option value="newest">{t('sort_newest')}</option>
              <option value="price_asc">{t('sort_price_asc')}</option>
              <option value="price_desc">{t('sort_price_desc')}</option>
            </select>
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider border border-black/10 text-muted hover:text-red-600 hover:border-red-300 transition-colors shrink-0"
            >
              <X size={12} />
              <span>{t('reset_filters')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {filteredProducts.length > 0 && (
        <p className="text-xs text-muted font-medium">
          {filteredProducts.length} {language === 'mk' ? 'производи' : 'products'}
          {onlyNew && <span className="ml-2 px-2 py-0.5 bg-retro-orange/10 text-retro-orange font-bold rounded-full text-[10px]">NEW</span>}
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
            onClick={resetAll}
            className="mt-2 px-6 py-3 bg-ink text-white text-xs font-semibold uppercase tracking-wider hover:bg-retro-orange transition-colors duration-200"
          >
            {t('reset_filters')}
          </button>
        </div>
      )}
    </div>
  );
}
