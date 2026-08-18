'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, CheckCircle, AlertCircle, MapPin, ArrowRight, Sparkles, Phone, User } from 'lucide-react';
import { Product } from '@/types/database';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ReserveModalProps {
  product: Product;
  selectedVariantId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReserveModal({
  product,
  selectedVariantId: initialVariantId,
  isOpen,
  onClose,
}: ReserveModalProps) {
  const { t } = useLanguage();

  // Find initial available variant
  const availableVariants = (product.variants || []).filter(
    (v) => (v.stock_quantity - v.reserved_quantity) > 0
  );

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    initialVariantId || availableVariants[0]?.id || ''
  );
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success state
  const [reservationSuccess, setReservationSuccess] = useState<{
    reservationNumber: string;
  } | null>(null);

  if (!isOpen) return null;

  const currentVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const availableQty = currentVariant
    ? Math.max(0, currentVariant.stock_quantity - currentVariant.reserved_quantity)
    : 0;

  const handleCloseAll = () => {
    setReservationSuccess(null);
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedVariantId) {
      setErrorMessage(t('err_select_size'));
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage(t('err_enter_name'));
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMessage(t('err_enter_phone'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          items: [
            {
              variant_id: selectedVariantId,
              quantity: 1,
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete reservation.');
      }

      // Smooth in-place success screen (no jarring page redirect!)
      setReservationSuccess({
        reservationNumber: data.data.reservation_number || `RB-${Math.floor(1000 + Math.random() * 9000)}`,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Грешка при резервација. Обидете се повторно.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white border-t sm:border border-black/15 shadow-2xl rounded-t-2xl sm:rounded-none overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.08] bg-surface">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-retro-orange animate-pulse" />
            <span className="font-display text-xl sm:text-2xl uppercase tracking-wide text-ink">
              {t('modal_title')}
            </span>
          </div>
          <button
            onClick={handleCloseAll}
            className="p-1.5 text-muted hover:text-ink hover:bg-black/5 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── SUCCESS STATE (In-Place Friendly Receipt) ──────────────── */}
        {reservationSuccess ? (
          <div className="p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95 duration-200">
            {/* Green Success Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle size={36} strokeWidth={2.4} />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-200">
                {t('modal_success_title')}
              </span>
              <h3 className="font-display text-3xl sm:text-4xl uppercase text-ink pt-1">
                {customerName ? `${customerName}, фала ти!` : t('conf_title')}
              </h3>
              <p className="text-xs text-muted max-w-xs mx-auto leading-relaxed">
                {t('modal_success_desc')}
              </p>
            </div>

            {/* Ticket Card */}
            <div className="bg-surface p-4 border border-black/10 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                {t('modal_success_ticket')}
              </span>
              <span className="font-display text-3xl text-retro-orange tracking-wider font-bold block">
                #{reservationSuccess.reservationNumber}
              </span>
              <p className="text-[11px] text-muted">
                {product.name} · <strong>{currentVariant?.size}</strong> · {formatPrice(product.price)}
              </p>
            </div>

            {/* Store Location */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs flex items-center justify-center gap-2">
              <MapPin size={15} className="text-retro-orange shrink-0" />
              <span>Stiv Naumov 8, Prilep (48 часа за проба)</span>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-1">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Stiv+Naumov+8,+Prilep,+Macedonia&travelmode=driving"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-ink text-white hover:bg-retro-orange text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <MapPin size={15} />
                <span>{t('modal_open_maps')}</span>
              </a>

              <button
                type="button"
                onClick={handleCloseAll}
                className="w-full py-3 border border-black/15 hover:bg-surface text-xs font-bold uppercase tracking-wider text-ink transition-colors"
              >
                {t('modal_continue_shopping')}
              </button>
            </div>
          </div>
        ) : (
          /* ── RESERVATION FORM (Friendly 2-Field Flow) ──────────────── */
          <div className="overflow-y-auto p-5 sm:p-6 space-y-4 flex-1">
            {/* Friendly Badge */}
            <div className="p-2.5 bg-retro-orange/10 border border-retro-orange/25 text-retro-orange text-xs font-bold flex items-center gap-2">
              <Sparkles size={15} className="shrink-0" />
              <span>{t('modal_friendly_badge')}</span>
            </div>

            {/* Selected Product Summary Box */}
            <div className="flex items-center gap-3.5 p-3 bg-surface border border-black/[0.08]">
              <div className="relative w-14 h-18 bg-paper-dark shrink-0 overflow-hidden border border-black/10">
                <Image
                  src={product.image_url || '/assets/look-01.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-ink truncate">{product.name}</h4>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="font-display text-lg text-ink font-normal">
                    {formatPrice(product.price)}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-[11px] text-muted line-through opacity-70">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] uppercase font-extrabold text-retro-orange block mt-0.5">
                  Големина: {currentVariant?.size || '—'}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* 1. Size Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1.5">
                  {t('modal_size_label')}:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
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
                        className={`py-2 px-1 text-xs font-bold border transition-all text-center flex flex-col items-center justify-center ${
                          isSelected
                            ? 'border-ink bg-ink text-white shadow-sm ring-1 ring-ink'
                            : isAvailable
                            ? 'border-black/15 bg-white text-ink hover:border-ink'
                            : 'border-zinc-200 bg-zinc-100 text-zinc-400 line-through cursor-not-allowed'
                        }`}
                      >
                        <span className="text-xs">{variant.size}</span>
                        <span className="text-[8px] font-normal opacity-75">
                          {isAvailable ? `${avail} пар.` : '0'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Customer Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1">
                  {t('modal_name_label')} <span className="text-retro-orange">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    required
                    placeholder={t('modal_name_placeholder')}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border border-black/15 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm font-semibold text-ink focus:outline-none focus:border-ink rounded-none"
                  />
                </div>
              </div>

              {/* 3. Customer Phone */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1">
                  {t('modal_phone_label')} <span className="text-retro-orange">*</span>
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="tel"
                    required
                    placeholder={t('modal_phone_placeholder')}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full border border-black/15 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm font-semibold text-ink focus:outline-none focus:border-ink rounded-none"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Friendly Reassurance note */}
              <p className="text-[10px] text-muted text-center pt-0.5">
                {t('modal_notice')}
              </p>

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedVariantId || availableQty <= 0}
                  className={`w-full py-3.5 bg-ink text-white hover:bg-retro-orange font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 ${
                    isSubmitting ? 'opacity-50 cursor-wait' : ''
                  }`}
                >
                  <span>{isSubmitting ? t('modal_processing') : t('modal_confirm')}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
