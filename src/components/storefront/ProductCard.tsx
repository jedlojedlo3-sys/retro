'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/database';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ReserveModal } from './ReserveModal';

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
  const hasDiscount = Boolean(product.original_price && product.original_price > product.price);
  const discountPercent = hasDiscount
    ? Math.round((((product.original_price || 0) - product.price) / (product.original_price || 1)) * 100)
    : 0;

  return (
    <>
      <div className="group flex flex-col bg-white border border-black/[0.06] overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:border-black/[0.12]">
        {/* Image Container */}
        <Link href={`/products/${product.id}`} className="relative aspect-[3/4] w-full overflow-hidden bg-surface block">
          <Image
            src={product.image_url || '/assets/look-01.jpg'}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
          />

          {/* Badges on Image */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.is_new && !isOutOfStock && (
              <span className="px-2 py-0.5 bg-ink text-white text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                NEW
              </span>
            )}
            {hasDiscount && !isOutOfStock && (
              <span className="px-2 py-0.5 bg-retro-orange text-white text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                -{discountPercent}%
              </span>
            )}
            {isOutOfStock && (
              <span className="px-2 py-0.5 bg-ink/90 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                {t('sold_out')}
              </span>
            )}
            {isLowStock && !product.is_new && !hasDiscount && (
              <span className="px-2 py-0.5 bg-retro-orange text-white text-[9px] sm:text-[10px] font-bold uppercase">
                {t('only_x_left', { count: totalAvailable })}
              </span>
            )}
          </div>

          <div className="absolute top-2 right-2 z-10">
            <span className="px-2 py-0.5 bg-white/90 text-ink text-[9px] sm:text-[10px] font-extrabold uppercase backdrop-blur-sm border border-black/[0.06]">
              {getCategoryText(product.category)}
            </span>
          </div>

          {/* Quick Reserve overlay on desktop hover */}
          {!isOutOfStock && (
            <div className="hidden sm:block absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
              <button
                onClick={(e) => { e.preventDefault(); setReserveModalOpen(true); }}
                className="w-full py-3 bg-ink text-white text-xs font-bold uppercase tracking-[0.12em] hover:bg-retro-orange hover:text-white transition-colors duration-200"
              >
                {t('btn_reserve')}
              </button>
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 gap-2">
          <div>
            <Link href={`/products/${product.id}`} className="block">
              <h3 className="font-semibold text-xs sm:text-sm text-ink group-hover:text-retro-orange transition-colors duration-200 line-clamp-1 tracking-tight">
                {product.name}
              </h3>
            </Link>

            {/* Price with Discount Support */}
            {hasDiscount ? (
              <div className="flex items-baseline gap-1.5 flex-wrap mt-0.5">
                <span className="font-display text-lg sm:text-xl text-retro-orange font-bold leading-tight">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs text-muted line-through opacity-70">
                  {formatPrice(product.original_price)}
                </span>
              </div>
            ) : (
              <p className="font-display text-lg sm:text-xl text-ink mt-0.5 tracking-wide leading-tight">
                {formatPrice(product.price)}
              </p>
            )}
          </div>

          {/* Sizes chips */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.variants.slice(0, 5).map((variant) => {
                const avail = Math.max(0, variant.stock_quantity - variant.reserved_quantity);
                return (
                  <span
                    key={variant.id}
                    className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 border font-semibold ${
                      avail > 0
                        ? 'border-black/10 text-ink bg-surface'
                        : 'border-black/[0.04] text-muted/30 line-through bg-surface'
                    }`}
                  >
                    {variant.size}
                  </span>
                );
              })}
              {product.variants.length > 5 && (
                <span className="text-[9px] text-muted self-center font-bold">
                  +{product.variants.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Mobile Tap-to-Reserve Button */}
          <div className="pt-1 sm:hidden">
            <button
              onClick={() => setReserveModalOpen(true)}
              disabled={isOutOfStock}
              className={`w-full py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                isOutOfStock
                  ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  : 'bg-ink text-white hover:bg-retro-orange active:scale-95'
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
