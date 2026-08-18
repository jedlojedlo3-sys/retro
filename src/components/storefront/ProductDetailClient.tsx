'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { Product } from '@/types/database';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ReserveModal } from './ReserveModal';
import { ProductCard } from './ProductCard';
import { getClientProductById, getClientProducts } from '@/lib/products-store';
import { FALLBACK_DEMO_PRODUCTS } from '@/lib/mock-data';

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product: initialProduct }: ProductDetailClientProps) {
  const { t, getCategoryText, language } = useLanguage();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [allProducts, setAllProducts] = useState<Product[]>(FALLBACK_DEMO_PRODUCTS);

  useEffect(() => {
    const updated = getClientProductById(initialProduct.id, initialProduct);
    if (updated) {
      setProduct(updated);
    }
    setAllProducts(getClientProducts(FALLBACK_DEMO_PRODUCTS));
  }, [initialProduct]);

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

  // Related products (same category or newest, excluding current)
  const relatedProducts = useMemo(() => {
    return allProducts
      .filter((p) => p.id !== product.id && p.active !== false)
      .sort((a, b) => {
        if (a.category === product.category && b.category !== product.category) return -1;
        if (a.category !== product.category && b.category === product.category) return 1;
        return 0;
      })
      .slice(0, 4);
  }, [allProducts, product]);

  return (
    <div className="space-y-12 pb-16 sm:pb-8">
      {/* Back Button */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-ink hover:text-retro-orange transition-colors"
        >
          <ArrowLeft size={16} />
          <span>{t('back_to_catalog')}</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[3/4] w-full bg-paper-dark border border-ink/10 overflow-hidden shadow-sm">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              priority
              className="object-cover object-center transition-all duration-300"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />

            {product.is_new && !isOutOfStock && (
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-ink text-white text-xs font-extrabold uppercase tracking-widest shadow-md">
                NEW ⭐
              </div>
            )}
            {product.original_price && product.original_price > product.price && !isOutOfStock && (
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-retro-orange text-white text-xs font-extrabold uppercase tracking-widest shadow-md">
                -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}% {t('sale_badge')}
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-ink/90 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                {t('sold_out')}
              </div>
            )}
          </div>

          {/* Thumbnails */}
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
        <div className="lg:col-span-5 space-y-6 bg-white border border-ink/10 p-6 sm:p-8 shadow-sm">
          <div className="space-y-2 border-b border-ink/10 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-retro-orange">
                  {getCategoryText(product.category)}
                </span>
                {product.is_new && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-ink text-white">
                    NEW
                  </span>
                )}
                {product.original_price && product.original_price > product.price && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-retro-orange text-white">
                    -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                  </span>
                )}
              </div>
              <span className="text-xs text-muted font-medium">Stiv Naumov 8, Prilep</span>
            </div>

            <h1 className="font-bold text-2xl sm:text-3xl text-ink leading-tight">
              {product.name}
            </h1>

            {/* Price with Discount Breakdown */}
            {product.original_price && product.original_price > product.price ? (
              <div className="pt-2 space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl sm:text-4xl text-retro-orange font-bold">
                    {formatPrice(product.price)}
                  </span>
                  <span className="font-display text-xl sm:text-2xl text-muted line-through opacity-70">
                    {formatPrice(product.original_price)}
                  </span>
                </div>
                <p className="text-xs text-emerald-700 font-bold">
                  {t('save_amount', {
                    amount: formatPrice(product.original_price - product.price),
                    percent: Math.round(((product.original_price - product.price) / product.original_price) * 100),
                  })}
                </p>
              </div>
            ) : (
              <p className="font-display text-3xl sm:text-4xl text-ink font-normal pt-2">
                {formatPrice(product.price)}
              </p>
            )}
          </div>

          {/* Sizes Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-ink">
                {t('choose_size')}
              </span>
              {selectedVariant && (
                <span className="text-xs text-muted">
                  {t('stock_label')}{' '}
                  <strong className="text-ink">
                    {Math.max(0, selectedVariant.stock_quantity - selectedVariant.reserved_quantity)} {t('pieces')}
                  </strong>
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
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
                        ? 'border-black/15 bg-paper text-ink hover:border-ink'
                        : 'border-zinc-200 bg-zinc-100 text-zinc-400 line-through cursor-not-allowed'
                    }`}
                  >
                    <span className="text-sm">{variant.size}</span>
                    <span className="text-[9px] font-normal opacity-80 mt-0.5">
                      {isAvailable ? `${avail} ${t('pieces_short')}` : t('no_stock')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Action Button */}
          <div className="pt-2 space-y-3">
            <button
              onClick={() => setIsReserveModalOpen(true)}
              disabled={isOutOfStock || !selectedVariantId}
              className={`w-full py-4 px-6 text-center font-bold text-xs uppercase tracking-wider transition-all transform hover:-translate-y-0.5 shadow-md flex items-center justify-center gap-2 ${
                isOutOfStock || !selectedVariantId
                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  : 'bg-ink text-white hover:bg-retro-orange'
              }`}
            >
              <ShoppingBag size={16} />
              <span>{isOutOfStock ? t('btn_no_stock_detail') : t('btn_reserve_store')}</span>
            </button>

            <p className="text-[11px] text-center text-muted">
              {t('notice_48h')}
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <div className="pt-6 border-t border-ink/10 space-y-2">
              <h3 className="text-xs uppercase font-bold tracking-wider text-ink">{t('model_description')}</h3>
              <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Store Guarantees */}
          <div className="pt-6 border-t border-ink/10 space-y-2.5 text-xs text-ink/80">
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-retro-orange shrink-0" />
              <span>{t('guarantee_location')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-retro-orange shrink-0" />
              <span>{t('guarantee_hours')}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-retro-orange shrink-0" />
              <span>{t('guarantee_fitting')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Related Boutique Items (Cross-Sell / Discovery) ─────────────────────────── */}
      {relatedProducts.length > 0 && (
        <div className="pt-10 border-t border-black/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-retro-orange block">
                RETRO PRILEP
              </span>
              <h3 className="font-display text-2xl sm:text-3xl uppercase text-ink">
                {language === 'mk' ? 'Слични парчиња од колекцијата' : 'You May Also Like'}
              </h3>
            </div>

            <Link
              href="/products"
              className="text-xs font-bold uppercase tracking-wider text-ink hover:text-retro-orange transition-colors"
            >
              {language === 'mk' ? 'Сите модели →' : 'View All →'}
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* ── Sticky Mobile Bottom Quick-Reserve Bar ────────────────────────────── */}
      <div className="sm:hidden fixed bottom-14 inset-x-0 bg-white/95 backdrop-blur-md border-t border-black/10 p-3 z-30 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-ink truncate">{product.name}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-base text-retro-orange font-bold">
              {formatPrice(product.price)}
            </span>
            {selectedVariant && (
              <span className="text-[10px] text-muted font-bold">
                · Големина: {selectedVariant.size}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsReserveModalOpen(true)}
          disabled={isOutOfStock}
          className={`py-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
            isOutOfStock
              ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
              : 'bg-ink text-white hover:bg-retro-orange active:scale-95 shadow-sm'
          }`}
        >
          {isOutOfStock ? t('sold_out') : t('btn_reserve')}
        </button>
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
