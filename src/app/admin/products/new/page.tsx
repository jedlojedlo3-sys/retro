'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Camera, Trash2, Check, AlertCircle } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Category, Product, ProductVariant } from '@/types/database';
import { CATEGORIES } from '@/lib/utils';
import { saveClientProduct } from '@/lib/products-store';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const PRESET_CLOTHING_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const PRESET_JEANS_SIZES = ['30', '31', '32', '33', '34', '36'];

interface VariantInput {
  size: string;
  stock_quantity: number;
}

export default function AddProductPage() {
  const router = useRouter();
  const { t, getCategoryText } = useLanguage();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('jeans');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isNew, setIsNew] = useState(true);
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
    } catch {
      setErrorMessage('Upload error');
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
      setErrorMessage('Please enter product name.');
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setErrorMessage('Please enter valid price in den.');
      return;
    }

    if (images.length === 0) {
      setErrorMessage('Please add at least one product photo.');
      return;
    }

    if (variants.length === 0) {
      setErrorMessage('Please add at least one size with stock.');
      return;
    }

    setIsSubmitting(true);

    const newProductId = `prod-${Date.now()}`;
    const productVariants: ProductVariant[] = variants.map((v, idx) => ({
      id: `v-${newProductId}-${idx}`,
      product_id: newProductId,
      size: v.size.toUpperCase(),
      stock_quantity: v.stock_quantity,
      reserved_quantity: 0,
      display_order: idx + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const newProduct: Product = {
      id: newProductId,
      name: name.trim(),
      category,
      price: Number(price),
      description: description.trim() || null,
      image_url: images[0],
      additional_images: images.slice(1),
      active: true,
      is_new: isNew,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      variants: productVariants,
    };

    saveClientProduct(newProduct);

    try {
      await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newProductId,
          name: name.trim(),
          category,
          price: Number(price),
          description: description.trim() || null,
          image_url: images[0],
          additional_images: images.slice(1),
          variants,
          active: true,
          is_new: isNew,
        }),
      });
    } catch {
      // client store already saved
    }

    router.push('/admin/products');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col pb-16">
      <AdminHeader title={t('admin_add_header')} showBack backUrl="/admin" />

      <main className="max-w-xl mx-auto w-full p-4 sm:p-6 space-y-6">
        <form onSubmit={handleSubmit} className="bg-white border border-black/10 p-6 sm:p-8 space-y-6 shadow-sm">
          {/* 1. Photos Section */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink">
              {t('admin_photos_label')} <span className="text-retro-orange">*</span>
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((url, idx) => (
                <div key={idx} className="relative aspect-[3/4] bg-surface border border-black/10 group">
                  <Image src={url} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-ink text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 right-1 bg-ink/80 text-white text-[9px] font-bold text-center uppercase py-0.5">
                      {t('admin_photo_main')}
                    </span>
                  )}
                </div>
              ))}

              {/* Upload trigger button */}
              <label className="relative aspect-[3/4] border-2 border-dashed border-black/20 hover:border-retro-orange flex flex-col items-center justify-center cursor-pointer bg-surface hover:bg-white transition-colors p-2 text-center">
                <Camera size={26} className="text-muted group-hover:text-retro-orange mb-1" />
                <span className="text-[11px] font-bold uppercase tracking-wide text-ink">
                  {isUploading ? t('admin_photo_uploading') : t('admin_photo_upload')}
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
              {t('admin_name_label')} <span className="text-retro-orange">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={t('admin_name_placeholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-black/10 bg-surface px-3.5 py-3 text-sm font-semibold text-ink focus:outline-none focus:border-ink rounded-none"
            />
          </div>

          {/* 3. Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                {t('admin_category_label')} <span className="text-retro-orange">*</span>
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
                className="w-full border border-black/10 bg-surface px-3.5 py-3 text-sm font-bold text-ink focus:outline-none focus:border-ink rounded-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {getCategoryText(cat.key)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                {t('admin_price_label')} <span className="text-retro-orange">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="50"
                placeholder="1890"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-black/10 bg-surface px-3.5 py-3 text-sm font-bold text-ink focus:outline-none focus:border-ink rounded-none"
              />
            </div>
          </div>

          {/* 4. Sizes & Stock Quantities */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                {t('admin_sizes_label')} <span className="text-retro-orange">*</span>
              </label>

              {/* Fast presets */}
              <div className="flex gap-2 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => applyPresetSizes(PRESET_CLOTHING_SIZES)}
                  className="px-2.5 py-1 bg-surface border border-black/10 hover:border-ink text-ink"
                >
                  S–XXL
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetSizes(PRESET_JEANS_SIZES)}
                  className="px-2.5 py-1 bg-surface border border-black/10 hover:border-ink text-ink"
                >
                  30–36
                </button>
              </div>
            </div>

            {/* List of size stock rows */}
            <div className="space-y-2 bg-surface p-3 border border-black/10">
              {variants.map((v, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-2.5 border border-black/10">
                  <span className="font-bold text-sm text-ink w-12">{v.size}</span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(idx, -1)}
                      className="w-8 h-8 bg-surface hover:bg-ink hover:text-white border border-black/10 font-bold text-sm flex items-center justify-center transition-colors"
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
                      className="w-14 text-center font-bold text-sm bg-surface border border-black/10 py-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(idx, 1)}
                      className="w-8 h-8 bg-surface hover:bg-ink hover:text-white border border-black/10 font-bold text-sm flex items-center justify-center transition-colors"
                    >
                      +
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="p-1.5 text-muted hover:text-red-600 ml-2"
                      title="Delete size"
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
                  placeholder={t('admin_size_custom_placeholder')}
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-black/10"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  className="px-3 py-1.5 bg-ink text-white hover:bg-retro-orange hover:text-white text-xs font-bold uppercase transition-colors"
                >
                  {t('admin_size_custom_btn')}
                </button>
              </div>
            </div>
          </div>

          {/* 5. Description (Optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              {t('admin_desc_label')} <span className="text-muted font-normal text-[10px]">{t('admin_optional')}</span>
            </label>
            <textarea
              rows={3}
              placeholder={t('admin_desc_placeholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-black/10 bg-surface p-3 text-sm text-ink focus:outline-none focus:border-ink rounded-none"
            />
          </div>

          {/* 6. Mark as NEW Flag */}
          <div className="p-4 bg-surface border border-black/10 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-ink block">
                ⭐ {t('admin_is_new_label')}
              </span>
              <p className="text-[11px] text-muted mt-0.5">
                {t('admin_is_new_desc')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsNew(!isNew)}
              className={`px-3.5 py-2 font-bold text-xs uppercase tracking-wider border transition-all shrink-0 ${
                isNew
                  ? 'bg-retro-orange text-white border-retro-orange shadow-sm'
                  : 'bg-white text-muted border-black/10 hover:border-ink hover:text-ink'
              }`}
            >
              {isNew ? t('admin_is_new_active') : t('admin_is_new_inactive')}
            </button>
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
            className={`w-full py-4 bg-ink text-white hover:bg-retro-orange hover:text-white font-bold text-sm uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 ${
              isSubmitting ? 'opacity-50 cursor-wait' : ''
            }`}
          >
            <Check size={18} />
            <span>{isSubmitting ? t('admin_saving') : t('admin_btn_publish')}</span>
          </button>
        </form>
      </main>
    </div>
  );
}
