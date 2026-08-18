'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/database';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ReserveModal } from './ReserveModal';
import { ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const { t, getCategoryText } = useLanguage();

  const totalAvailable = product.variants?.reduce((acc, v) => {
    return acc + Math.max(0, v.stock_quantity - v.reserved_quantity);
  }, 0) ?? 0;

  const isOutOfStock = totalAvailable <= 0;
  const isLowStock = !isOutOfStock && totalAvailable <= 2;

  return (
    <>
      <div className="group flex flex-col bg-white border border-black/[0.06] overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:border-black/[0.12]">
        {/* Image */}
        <Link href={`/products/${product.id}`} className="relative aspect-[3/4] w-full overflow-hidden bg-surface">
          <Image
            src={product.image_url || '/assets/look-01.jpg'}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_new && !isOutOfStock && (
              <span className="badge bg-retro-orange text-white font-extrabold tracking-wider animate-pulse">
                NEW
              </span>
            )}
            {isOutOfStock && (
              <span className="badge bg-ink/80 text-white backdrop-blur-sm">
                {t('sold_out')}
              </span>
            )}
            {isLowStock && !product.is_new && (
              <span className="badge bg-retro-orange text-white">
                {t('only_x_left', { count: totalAvailable })}
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <span className="badge bg-white/90 text-ink backdrop-blur-sm border border-black/[0.06]">
              {getCategoryText(product.category)}
            </span>
          </div>

          {/* Quick Reserve overlay button */}
          {!isOutOfStock && (
            <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={(e) => { e.preventDefault(); setReserveModalOpen(true); }}
                className="w-full py-3.5 bg-ink text-white text-xs font-semibold uppercase tracking-[0.15em] hover:bg-retro-orange transition-colors duration-200"
              >
                {t('btn_reserve')}
              </button>
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="p-4 flex flex-col gap-3">
          <div>
            <Link href={`/products/${product.id}`}>
              <h3 className="font-semibold text-sm text-ink group-hover:text-retro-orange transition-colors duration-200 line-clamp-1 tracking-tight">
                {product.name}
              </h3>
            </Link>
            <p className="font-display text-xl text-ink mt-0.5 tracking-wide">
              {formatPrice(product.price)}
            </p>
          </div>

          {/* Sizes */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.variants.map((variant) => {
                const avail = Math.max(0, variant.stock_quantity - variant.reserved_quantity);
                return (
                  <span
                    key={variant.id}
                    className={`text-[10px] px-1.5 py-0.5 border font-medium transition-colors ${
                      avail > 0
                        ? 'border-black/10 text-ink bg-surface hover:border-ink'
                        : 'border-black/[0.04] text-muted/40 line-through bg-surface'
                    }`}
                    title={avail > 0 ? `${avail} in stock` : 'Out of stock'}
                  >
                    {variant.size}
                  </span>
                );
              })}
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center justify-between pt-2 border-t border-black/[0.06]">
            <Link
              href={`/products/${product.id}`}
              className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted hover:text-ink link-underline transition-colors duration-200"
            >
              <span>{t('btn_details')}</span>
              <ArrowRight size={12} />
            </Link>
            <button
              onClick={() => setReserveModalOpen(true)}
              disabled={isOutOfStock}
              className={`text-[11px] font-bold uppercase tracking-wider px-4 py-2 transition-all duration-200 ${
                isOutOfStock
                  ? 'text-muted/40 cursor-not-allowed'
                  : 'bg-ink text-white hover:bg-retro-orange active:scale-[0.97]'
              }`}
            >
              {isOutOfStock ? t('no_stock') : t('btn_reserve')}
            </button>
          </div>
        </div>
      </div>

      {reserveModalOpen && (
        <ReserveModal
          product={product}
          isOpen={reserveModalOpen}
          onClose={() => setReserveModalOpen(false)}
        />
      )}
    </>
  );
}
