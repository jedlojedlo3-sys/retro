'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Camera, Plus, Trash2, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Category } from '@/types/database';
import { CATEGORIES } from '@/lib/utils';

const PRESET_CLOTHING_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const PRESET_JEANS_SIZES = ['30', '31', '32', '33', '34', '36'];

interface VariantInput {
  size: string;
  stock_quantity: number;
}

export default function AddProductPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('jeans');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantInput[]>([
    { size: '30', stock_quantity: 2 },
    { size: '32', stock_quantity: 3 },
    { size: '34', stock_quantity: 2 },
    { size: '36', stock_quantity: 1 },
  ]);
  const [customSize, setCustomSize] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick preset size switchers
  const applyPresetSizes = (sizes: string[]) => {
    setVariants(sizes.map((s) => ({ size: s, stock_quantity: 2 })));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.url) {
          setImages((prev) => [...prev, data.url]);
        }
      }
    } catch (err: any) {
      setErrorMessage('Грешка при прикачување на сликата.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (sizeIndex: number, delta: number) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== sizeIndex) return v;
        const newQty = Math.max(0, v.stock_quantity + delta);
        return { ...v, stock_quantity: newQty };
      })
    );
  };

  const handleAddCustomSize = () => {
    if (!customSize.trim()) return;
    const clean = customSize.trim().toUpperCase();
    if (variants.some((v) => v.size === clean)) {
      setCustomSize('');
      return;
    }
    setVariants((prev) => [...prev, { size: clean, stock_quantity: 2 }]);
    setCustomSize('');
  };

  const handleRemoveVariant = (sizeIndex: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== sizeIndex));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Внесете назив на производот.');
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setErrorMessage('Внесете важечка цена во den.');
      return;
    }

    if (images.length === 0) {
      setErrorMessage('Прикачете барем една фотографија од производот.');
      return;
    }

    if (variants.length === 0) {
      setErrorMessage('Додајте барем една големина со залиха.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          price: Number(price),
          description: description.trim() || null,
          image_url: images[0],
          additional_images: images.slice(1),
          variants,
          active: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Се појави грешка при зачувување.');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Грешка при креирање на производот.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col pb-16">
      <AdminHeader title="ДОДАЈ ПРОИЗВОД" showBack backUrl="/admin" />

      <main className="max-w-xl mx-auto w-full p-4 sm:p-6 space-y-6">
        <form onSubmit={handleSubmit} className="bg-white border border-ink/15 p-6 sm:p-8 space-y-6 shadow-sm">
          {/* 1. Photos Section */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink">
              1. Фотографии <span className="text-retro-orange">*</span>
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((url, idx) => (
                <div key={idx} className="relative aspect-[3/4] bg-paper border border-ink/20 group">
                  <Image src={url} alt={`Слика ${idx + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-ink text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 right-1 bg-ink/80 text-white text-[9px] font-bold text-center uppercase py-0.5">
                      Главна
                    </span>
                  )}
                </div>
              ))}

              {/* Upload trigger button */}
              <label className="relative aspect-[3/4] border-2 border-dashed border-ink/30 hover:border-retro-orange flex flex-col items-center justify-center cursor-pointer bg-paper hover:bg-white transition-colors p-2 text-center">
                <Camera size={26} className="text-muted group-hover:text-retro-orange mb-1" />
                <span className="text-[11px] font-bold uppercase tracking-wide text-ink">
                  {isUploading ? 'Се прикачува...' : 'Сликај / Додај'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 2. Product Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              2. Назив на производ <span className="text-retro-orange">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Пр. Фармерки Slim Dark Blue"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-ink/20 bg-paper px-3.5 py-3 text-sm font-semibold text-ink focus:outline-none focus:border-ink rounded-none"
            />
          </div>

          {/* 3. Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                3. Категорија <span className="text-retro-orange">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value as Category;
                  setCategory(newCat);
                  if (newCat === 'jeans' || newCat === 'trousers') {
                    applyPresetSizes(PRESET_JEANS_SIZES);
                  } else {
                    applyPresetSizes(PRESET_CLOTHING_SIZES);
                  }
                }}
                className="w-full border border-ink/20 bg-paper px-3.5 py-3 text-sm font-bold text-ink focus:outline-none focus:border-ink rounded-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.labelMk}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                4. Цена (den.) <span className="text-retro-orange">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="50"
                placeholder="1890"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-ink/20 bg-paper px-3.5 py-3 text-sm font-bold text-ink focus:outline-none focus:border-ink rounded-none"
              />
            </div>
          </div>

          {/* 4. Sizes & Stock Quantities */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                5. Големини и залиха <span className="text-retro-orange">*</span>
              </label>

              {/* Fast presets */}
              <div className="flex gap-2 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => applyPresetSizes(PRESET_CLOTHING_SIZES)}
                  className="px-2.5 py-1 bg-paper border border-ink/15 hover:border-ink text-ink"
                >
                  S–XXL
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetSizes(PRESET_JEANS_SIZES)}
                  className="px-2.5 py-1 bg-paper border border-ink/15 hover:border-ink text-ink"
                >
                  30–36
                </button>
              </div>
            </div>

            {/* List of size stock rows */}
            <div className="space-y-2 bg-paper p-3 border border-ink/10">
              {variants.map((v, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-2.5 border border-ink/10">
                  <span className="font-bold text-sm text-ink w-12">{v.size}</span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(idx, -1)}
                      className="w-8 h-8 bg-paper hover:bg-ink hover:text-white border border-ink/20 font-bold text-sm flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={v.stock_quantity}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        setVariants((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, stock_quantity: val } : item))
                        );
                      }}
                      className="w-14 text-center font-bold text-sm bg-paper border border-ink/20 py-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(idx, 1)}
                      className="w-8 h-8 bg-paper hover:bg-ink hover:text-white border border-ink/20 font-bold text-sm flex items-center justify-center transition-colors"
                    >
                      +
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="p-1.5 text-muted hover:text-red-600 ml-2"
                      title="Избриши големина"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Custom Size input */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Додај друга големина (пр. 38, XXXL)"
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-ink/20"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  className="px-3 py-1.5 bg-ink text-white hover:bg-retro-orange hover:text-ink text-xs font-bold uppercase transition-colors"
                >
                  Додај
                </button>
              </div>
            </div>
          </div>

          {/* 5. Description (Optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              6. Краток опис <span className="text-muted font-normal text-[10px]">(опционално)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Материјал, крој или совети за комбинирање..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-ink/20 bg-paper p-3 text-sm text-ink focus:outline-none focus:border-ink rounded-none"
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className={`w-full py-4 bg-ink text-white hover:bg-retro-orange hover:text-ink font-bold text-sm uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 ${
              isSubmitting ? 'opacity-50 cursor-wait' : ''
            }`}
          >
            <Check size={18} />
            <span>{isSubmitting ? 'Се зачувува...' : 'Објави производ'}</span>
          </button>
        </form>
      </main>
    </div>
  );
}
