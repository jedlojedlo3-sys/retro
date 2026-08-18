'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, CheckCircle2, AlertCircle, MapPin, Clock } from 'lucide-react';
import { Product, ProductVariant } from '@/types/database';
import { formatPrice } from '@/lib/utils';

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
  const router = useRouter();

  // Find initial available variant
  const availableVariants = (product.variants || []).filter(
    (v) => (v.stock_quantity - v.reserved_quantity) > 0
  );

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    initialVariantId || availableVariants[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const availableQty = currentVariant
    ? Math.max(0, currentVariant.stock_quantity - currentVariant.reserved_quantity)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedVariantId) {
      setErrorMessage('Ве молиме изберете големина.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Ве молиме внесете име и презиме.');
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMessage('Ве молиме внесете телефонски број за контакт.');
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
          customer_email: customerEmail.trim() || undefined,
          items: [
            {
              variant_id: selectedVariantId,
              quantity: quantity,
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Се појави грешка при резервацијата.');
      }

      // Successful reservation -> redirect to confirmation page
      router.push(`/reservation/${data.data.reservation_number}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Се појави неочекувана грешка. Обидете се повторно.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-paper border border-ink/20 shadow-2xl rounded-none overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-ink/10 bg-white">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-retro-orange block">
              CLICK & COLLECT
            </span>
            <h2 className="font-display text-2xl tracking-wide text-ink">Резервирај за подигање</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-ink/70 hover:text-ink hover:bg-paper rounded-none transition-colors"
            aria-label="Затвори"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {/* Selected Product Summary */}
          <div className="flex items-center gap-4 p-3.5 bg-white border border-ink/10">
            <div className="relative w-16 h-20 bg-paper-dark shrink-0 overflow-hidden">
              <Image
                src={product.image_url || '/assets/look-01.jpg'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-ink truncate">{product.name}</h4>
              <p className="font-display text-xl text-ink font-normal">{formatPrice(product.price)}</p>
              <p className="text-xs text-muted">
                {currentVariant ? `Избрана големина: ${currentVariant.size}` : 'Изберете големина подолу'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form id="reserve-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Size Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
                Избери големина <span className="text-retro-orange">*</span>
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.variants?.map((variant) => {
                  const avail = Math.max(0, variant.stock_quantity - variant.reserved_quantity);
                  const isAvailable = avail > 0;
                  const isSelected = selectedVariantId === variant.id;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        setQuantity(1);
                      }}
                      className={`py-2.5 px-2 text-xs font-bold border transition-all text-center flex flex-col items-center justify-center ${
                        isSelected
                          ? 'border-ink bg-ink text-white shadow-md'
                          : isAvailable
                          ? 'border-ink/20 bg-white text-ink hover:border-ink'
                          : 'border-zinc-200 bg-zinc-100 text-zinc-400 line-through cursor-not-allowed'
                      }`}
                    >
                      <span className="text-sm">{variant.size}</span>
                      <span className="text-[9px] font-normal opacity-80">
                        {isAvailable ? `${avail} на залиха` : 'Нема'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            {availableQty > 1 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                  Количина
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="border border-ink/20 bg-white text-ink px-3 py-2 text-sm font-semibold rounded-none focus:outline-none focus:border-ink"
                  >
                    {Array.from({ length: Math.min(availableQty, 5) }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'парче' : 'парчиња'}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-muted">
                    Вкупно: <strong>{formatPrice(product.price * quantity)}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Customer Information */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                  Име и презиме <span className="text-retro-orange">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Пр. Марко Петров"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border border-ink/20 bg-white text-ink px-3.5 py-2.5 text-sm focus:outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                  Телефонски број <span className="text-retro-orange">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="07x xxx xxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full border border-ink/20 bg-white text-ink px-3.5 py-2.5 text-sm focus:outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                  Е-пошта <span className="text-muted text-[10px] font-normal">(опционално)</span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full border border-ink/20 bg-white text-ink px-3.5 py-2.5 text-sm focus:outline-none focus:border-ink"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Important Notice */}
            <div className="p-3.5 bg-paper-dark/60 border border-ink/10 text-xs text-ink/80 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-ink">
                <MapPin size={14} className="text-retro-orange" />
                <span>Подигање: Stiv Naumov 8, Prilep</span>
              </div>
              <p className="text-[11px] leading-relaxed text-muted">
                * Ова е резервација, а не онлајн купување. Плаќањето се врши во продавницата при подигнување на производот. Резервацијата важи 48 часа.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-ink/10 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto text-center sm:text-left">
            <span className="text-[11px] uppercase tracking-wider text-muted block">Вкупно:</span>
            <span className="font-display text-2xl text-ink leading-tight">
              {formatPrice(product.price * quantity)}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-3 border border-ink/20 text-ink hover:bg-paper text-xs uppercase tracking-wider font-bold transition-colors"
            >
              Откажи
            </button>
            <button
              type="submit"
              form="reserve-form"
              disabled={isSubmitting || !selectedVariantId || availableQty <= 0}
              className={`flex-1 sm:flex-initial px-6 py-3 bg-ink text-white hover:bg-retro-orange hover:text-ink text-xs uppercase tracking-wider font-bold transition-colors ${
                isSubmitting ? 'opacity-50 cursor-wait' : ''
              }`}
            >
              {isSubmitting ? 'Се обработува...' : 'Потврди резервација'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
