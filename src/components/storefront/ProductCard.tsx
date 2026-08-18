'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/database';
import { formatPrice, getCategoryLabel } from '@/lib/utils';
import { ReserveModal } from './ReserveModal';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [reserveModalOpen, setReserveModalOpen] = useState(false);

  // Compute total available pieces across all sizes
  const totalAvailable = product.variants?.reduce((acc, v) => {
    const avail = Math.max(0, v.stock_quantity - v.reserved_quantity);
    return acc + avail;
  }, 0) ?? 0;

  const isOutOfStock = totalAvailable <= 0;

  return (
    <>
      <div className="group flex flex-col bg-white border border-ink/10 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-ink/30">
        {/* Product Image Area */}
        <Link href={`/products/${product.id}`} className="relative aspect-[3/4] w-full overflow-hidden bg-paper-dark">
          <Image
            src={product.image_url || '/assets/look-01.jpg'}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />

          {/* Stock Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isOutOfStock ? (
              <span className="px-2.5 py-1 bg-ink/85 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
                Распродадено
              </span>
            ) : totalAvailable <= 2 ? (
              <span className="px-2.5 py-1 bg-retro-orange text-ink text-[11px] font-extrabold uppercase tracking-wider">
                Само {totalAvailable} на залиха
              </span>
            ) : null}
          </div>

          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-paper/90 text-ink text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
              {getCategoryLabel(product.category)}
            </span>
          </div>
        </Link>

        {/* Product Details Area */}
        <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4">
          <div>
            <Link href={`/products/${product.id}`} className="block">
              <h3 className="font-bold text-base sm:text-lg text-ink group-hover:text-retro-orange transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>
            <p className="font-display text-xl sm:text-2xl text-ink font-normal mt-1">
              {formatPrice(product.price)}
            </p>
          </div>

          {/* Available Sizes List */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase font-bold text-muted tracking-wider block">
                Големини:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {product.variants.map((variant) => {
                  const avail = Math.max(0, variant.stock_quantity - variant.reserved_quantity);
                  const isAvailable = avail > 0;
                  return (
                    <span
                      key={variant.id}
                      className={`text-xs px-2 py-0.5 border font-semibold ${
                        isAvailable
                          ? 'border-ink/20 text-ink bg-paper-light'
                          : 'border-ink/10 text-muted/40 line-through bg-zinc-100'
                      }`}
                      title={isAvailable ? `Достапни: ${avail}` : 'Нема залиха'}
                    >
                      {variant.size}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 border-t border-ink/10 grid grid-cols-2 gap-2">
            <Link
              href={`/products/${product.id}`}
              className="py-2.5 px-3 text-center border border-ink text-ink hover:bg-ink hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Детали
            </Link>
            <button
              onClick={() => setReserveModalOpen(true)}
              disabled={isOutOfStock}
              className={`py-2.5 px-3 text-center font-bold text-xs uppercase tracking-wider transition-colors ${
                isOutOfStock
                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-200'
                  : 'bg-ink text-white hover:bg-retro-orange hover:text-ink'
              }`}
            >
              {isOutOfStock ? 'Нема залиха' : 'Резервирај'}
            </button>
          </div>
        </div>
      </div>

      {/* Reserve Modal */}
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
