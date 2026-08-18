'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Check, ShieldCheck, MapPin, Clock, Share2 } from 'lucide-react';
import { Product, ProductVariant } from '@/types/database';
import { formatPrice, getCategoryLabel } from '@/lib/utils';
import { ReserveModal } from './ReserveModal';

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const allImages = [product.image_url, ...(product.additional_images || [])].filter(Boolean);
  const [selectedImage, setSelectedImage] = useState<string>(allImages[0] || '/assets/look-01.jpg');

  // Initial available variant
  const availableVariants = (product.variants || []).filter(
    (v) => (v.stock_quantity - v.reserved_quantity) > 0
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    availableVariants[0]?.id || ''
  );
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const totalAvailable = product.variants?.reduce(
    (acc, v) => acc + Math.max(0, v.stock_quantity - v.reserved_quantity),
    0
  ) ?? 0;
  const isOutOfStock = totalAvailable <= 0;

  return (
    <div className="space-y-12">
      {/* Back Button */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-ink hover:text-retro-orange transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Назад кон колекцијата</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[3/4] w-full bg-paper-dark border border-ink/10 overflow-hidden shadow-sm">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />

            {isOutOfStock && (
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-ink/90 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                Распродадено
              </div>
            )}
          </div>

          {/* Thumbnails (if multiple images) */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative w-20 h-24 shrink-0 bg-paper-dark border-2 overflow-hidden transition-all ${
                    selectedImage === imgUrl ? 'border-ink shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={imgUrl} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Information & Size Picker */}
        <div className="lg:col-span-5 space-y-8 bg-white border border-ink/10 p-6 sm:p-8">
          <div className="space-y-2 border-b border-ink/10 pb-6">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-widest text-retro-orange">
                {getCategoryLabel(product.category)}
              </span>
              <span className="text-xs text-muted font-medium">Stiv Naumov 8, Prilep</span>
            </div>

            <h1 className="font-bold text-2xl sm:text-3xl text-ink leading-tight">
              {product.name}
            </h1>

            <p className="font-display text-3xl sm:text-4xl text-ink font-normal pt-2">
              {formatPrice(product.price)}
            </p>
          </div>

          {/* Sizes Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-ink">
                Избери големина:
              </span>
              {selectedVariant && (
                <span className="text-xs text-muted">
                  Залиха:{' '}
                  <strong className="text-ink">
                    {Math.max(0, selectedVariant.stock_quantity - selectedVariant.reserved_quantity)} парчиња
                  </strong>
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
              {product.variants?.map((variant) => {
                const avail = Math.max(0, variant.stock_quantity - variant.reserved_quantity);
                const isAvailable = avail > 0;
                const isSelected = selectedVariantId === variant.id;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`py-3 px-2 text-xs font-bold border transition-all text-center flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-ink bg-ink text-white shadow-md ring-1 ring-ink'
                        : isAvailable
                        ? 'border-ink/20 bg-paper-light text-ink hover:border-ink'
                        : 'border-zinc-200 bg-zinc-100 text-zinc-400 line-through cursor-not-allowed'
                    }`}
                  >
                    <span className="text-sm">{variant.size}</span>
                    <span className="text-[9px] font-normal opacity-80 mt-0.5">
                      {isAvailable ? `${avail} пар.` : 'Нема'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Action Button */}
          <div className="pt-4 space-y-3">
            <button
              onClick={() => setIsReserveModalOpen(true)}
              disabled={isOutOfStock || !selectedVariantId}
              className={`w-full py-4 px-6 text-center font-bold text-sm uppercase tracking-wider transition-all transform hover:-translate-y-0.5 shadow-md ${
                isOutOfStock || !selectedVariantId
                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  : 'bg-ink text-white hover:bg-retro-orange hover:text-ink'
              }`}
            >
              {isOutOfStock ? 'Нема достапна залиха' : 'Резервирај за подигање во продавница'}
            </button>

            <p className="text-[11px] text-center text-muted">
              * Резервацијата те чека во продавницата 48 часа. Плаќање при подигнување.
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <div className="pt-6 border-t border-ink/10 space-y-2">
              <h3 className="text-xs uppercase font-bold tracking-wider text-ink">Опис на моделот:</h3>
              <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Store Guarantees */}
          <div className="pt-6 border-t border-ink/10 space-y-3 text-xs text-ink/80">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-retro-orange shrink-0" />
              <span>Подигнување: Stiv Naumov 8, Prilep</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-retro-orange shrink-0" />
              <span>Работно време: Пон–Саб 09:00 – 20:00</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-retro-orange shrink-0" />
              <span>Можност за проба и замена на големина на лице место</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reserve Modal */}
      {isReserveModalOpen && (
        <ReserveModal
          product={product}
          selectedVariantId={selectedVariantId}
          isOpen={isReserveModalOpen}
          onClose={() => setIsReserveModalOpen(false)}
        />
      )}
    </div>
  );
}
