'use client';

import React, { useState, useMemo } from 'react';
import { Product, Category } from '@/types/database';
import { CATEGORIES } from '@/lib/utils';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal, PackageOpen } from 'lucide-react';

interface ProductsCatalogProps {
  initialProducts: Product[];
}

export function ProductsCatalog({ initialProducts }: ProductsCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      // Stock filter
      if (onlyInStock) {
        const totalAvail =
          product.variants?.reduce(
            (acc, v) => acc + Math.max(0, v.stock_quantity - v.reserved_quantity),
            0
          ) ?? 0;
        if (totalAvail <= 0) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [initialProducts, selectedCategory, searchQuery, onlyInStock, sortBy]);

  return (
    <div className="space-y-8">
      {/* Category Pills & Filters Bar */}
      <div className="bg-white border border-ink/10 p-4 sm:p-6 space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-bold shrink-0 border transition-all ${
              selectedCategory === 'all'
                ? 'bg-ink text-white border-ink'
                : 'bg-paper text-ink border-ink/10 hover:border-ink'
            }`}
          >
            Сите ({initialProducts.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = initialProducts.filter((p) => p.category === cat.key).length;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 text-xs uppercase tracking-wider font-bold shrink-0 border transition-all ${
                  isSelected
                    ? 'bg-ink text-white border-ink'
                    : 'bg-paper text-ink border-ink/10 hover:border-ink'
                }`}
              >
                {cat.labelMk} ({count})
              </button>
            );
          })}
        </div>

        {/* Search, Sort and In-Stock Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-ink/10">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Пребарај производ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-paper border border-ink/15 text-ink placeholder:text-muted focus:outline-none focus:border-ink"
            />
          </div>

          {/* Right controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* In stock toggle */}
            <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded text-retro-orange focus:ring-retro-orange w-4 h-4"
              />
              <span>Само на залиха</span>
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
              <SlidersHorizontal size={14} className="text-muted" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-paper border border-ink/15 text-ink px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-ink"
              >
                <option value="newest">Најново</option>
                <option value="price_asc">Цена: Ниска → Висока</option>
                <option value="price_desc">Цена: Висока → Ниска</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid or Empty State */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-ink/10 p-12 text-center space-y-4 max-w-md mx-auto">
          <PackageOpen size={48} className="mx-auto text-muted/50" />
          <h3 className="font-display text-2xl uppercase text-ink">Нема пронајдени модели</h3>
          <p className="text-xs text-muted leading-relaxed">
            Не најдовме производи што одговараат на избраните филтри или пребарување.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setOnlyInStock(false);
            }}
            className="px-6 py-2.5 bg-ink text-white font-bold text-xs uppercase tracking-wider hover:bg-retro-orange hover:text-ink transition-colors"
          >
            Ресетирај филтри
          </button>
        </div>
      )}
    </div>
  );
}
