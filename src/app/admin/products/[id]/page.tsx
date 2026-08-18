'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { Camera, Trash2, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Category, Product, ProductVariant } from '@/types/database';
import { CATEGORIES } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { FALLBACK_DEMO_PRODUCTS } from '@/lib/mock-data';
import { getClientProductById, saveClientProduct, deleteClientProduct } from '@/lib/products-store';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { t, getCategoryText } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('jeans');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [customSize, setCustomSize] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      // 1. Check client store first
      const clientProd = getClientProductById(productId);
      if (clientProd) {
        setProduct(clientProd);
        setName(clientProd.name);
        setCategory(clientProd.category);
        setPrice(String(clientProd.price));
        setDescription(clientProd.description || '');
        setActive(clientProd.active);
        setImages([clientProd.image_url, ...(clientProd.additional_images || [])].filter(Boolean));
        setVariants(
          (clientProd.variants || []).sort((a, b) => a.display_order - b.display_order)
        );
        setLoading(false);
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*, variants:product_variants(*)')
          .eq('id', productId)
          .single();

        let prod = data as Product | null;
        if (error || !prod) {
          prod = clientProd || FALLBACK_DEMO_PRODUCTS.find((p) => p.id === productId) || null;
        }

        if (prod) {
          setProduct(prod);
          setName(prod.name);
          setCategory(prod.category);
          setPrice(String(prod.price));
          setDescription(prod.description || '');
          setActive(prod.active);
          setImages([prod.image_url, ...(prod.additional_images || [])].filter(Boolean));
          setVariants(
            (prod.variants || []).sort((a, b) => a.display_order - b.display_order)
          );
        }
      } catch {
        const demo = clientProd || FALLBACK_DEMO_PRODUCTS.find((p) => p.id === productId);
        if (demo) {
          setProduct(demo);
          setName(demo.name);
          setCategory(demo.category);
          setPrice(String(demo.price));
          setDescription(demo.description || '');
          setActive(demo.active);
          setImages([demo.image_url, ...(demo.additional_images || [])]);
          setVariants(demo.variants || []);
        }
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
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

  const handleStockDelta = (variantIndex: number, delta: number) => {
    setVariants((prev) =>
      prev.map((v, idx) => {
        if (idx !== variantIndex) return v;
        const newStock = Math.max(v.reserved_quantity, v.stock_quantity + delta);
        return { ...v, stock_quantity: newStock };
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
    const newVariant: ProductVariant = {
      id: `v-${productId}-${clean}`,
      product_id: productId,
      size: clean,
      stock_quantity: 2,
      reserved_quantity: 0,
      display_order: variants.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setVariants((prev) => [...prev, newVariant]);
    setCustomSize('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter product name.');
      return;
    }

    if (!price || isNaN(Number(price))) {
      setErrorMessage('Please enter valid price.');
      return;
    }

    if (images.length === 0) {
      setErrorMessage('Please add at least one photo.');
      return;
    }

    setIsSubmitting(true);

    const updatedProduct: Product = {
      id: productId,
      name: name.trim(),
      category,
      price: Number(price),
      description: description.trim() || null,
      image_url: images[0],
      additional_images: images.slice(1),
      variants,
      active,
      created_at: product?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveClientProduct(updatedProduct);
    setProduct(updatedProduct);

    try {
      await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId,
          name: name.trim(),
          category,
          price: Number(price),
          description: description.trim() || null,
          image_url: images[0],
          additional_images: images.slice(1),
          variants,
          active,
        }),
      });
    } catch {
      // client store already updated
    }

    setSuccessMessage(t('admin_saved_success'));
    setTimeout(() => setSuccessMessage(null), 3500);
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`${t('admin_confirm_delete')}\n\n"${name}"`)) {
      return;
    }
    deleteClientProduct(productId);
    try {
      const supabase = createClient();
      await supabase.from('products').delete().eq('id', productId);
    } catch {
      // ignore
    }
    router.push('/admin/products');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-bold text-sm text-muted">{t('admin_checking')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col pb-16">
      <AdminHeader title={t('admin_edit_header')} showBack backUrl="/admin/products" />

      <main className="max-w-xl mx-auto w-full p-4 sm:p-6 space-y-6">
        <form onSubmit={handleSave} className="bg-white border border-black/10 p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Active status & header */}
          <div className="flex items-center justify-between pb-4 border-b border-black/10">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted">{t('admin_visibility_status')}</span>
              <h3 className="font-display text-2xl uppercase">
                {active ? t('admin_status_active_store') : t('admin_status_hidden_store')}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`px-3 py-1.5 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border transition-colors ${
                active
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-zinc-100 text-zinc-600 border-zinc-300'
              }`}
            >
              {active ? <Eye size={15} /> : <EyeOff size={15} />}
              <span>{active ? t('admin_status_visible') : t('admin_status_hidden')}</span>
            </button>
          </div>

          {/* 1. Photos */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink">
              {t('admin_photos_label')}
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

              <label className="relative aspect-[3/4] border-2 border-dashed border-black/20 hover:border-retro-orange flex flex-col items-center justify-center cursor-pointer bg-surface hover:bg-white transition-colors p-2 text-center">
                <Camera size={24} className="text-muted group-hover:text-retro-orange mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-ink">
                  {isUploading ? t('admin_photo_uploading') : `+ ${t('admin_photo_upload')}`}
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
              {t('admin_name_label')}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-black/10 bg-surface px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink rounded-none"
            />
          </div>

          {/* 3. Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                {t('admin_category_label')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full border border-black/10 bg-surface px-3.5 py-2.5 text-sm font-bold text-ink focus:outline-none focus:border-ink rounded-none"
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
                {t('admin_price_label')}
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-black/10 bg-surface px-3.5 py-2.5 text-sm font-bold text-ink focus:outline-none focus:border-ink rounded-none"
              />
            </div>
          </div>

          {/* 4. Stock Controls */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink">
              {t('admin_sizes_label')}
            </label>

            <div className="space-y-2.5 bg-surface p-3.5 border border-black/10">
              {variants.map((v, idx) => {
                const available = Math.max(0, v.stock_quantity - v.reserved_quantity);

                return (
                  <div key={idx} className="bg-white p-3 border border-black/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-base text-ink w-10">{v.size}</span>
                        <div className="text-[11px] text-muted space-x-2">
                          <span>Physical: <strong className="text-ink">{v.stock_quantity}</strong></span>
                          <span>·</span>
                          <span>Reserved: <strong className="text-retro-orange">{v.reserved_quantity}</strong></span>
                          <span>·</span>
                          <span>Avail: <strong className="text-emerald-700 font-bold">{available}</strong></span>
                        </div>
                      </div>

                      {/* +/- Quick stock modifier */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStockDelta(idx, -1)}
                          disabled={v.stock_quantity <= v.reserved_quantity}
                          className="w-8 h-8 bg-surface hover:bg-ink hover:text-white border border-black/10 font-bold text-base flex items-center justify-center disabled:opacity-40 transition-colors"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={v.reserved_quantity}
                          value={v.stock_quantity}
                          onChange={(e) => {
                            const val = Math.max(v.reserved_quantity, parseInt(e.target.value) || 0);
                            setVariants((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, stock_quantity: val } : item))
                            );
                          }}
                          className="w-12 text-center font-bold text-sm bg-surface border border-black/10 py-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleStockDelta(idx, 1)}
                          className="w-8 h-8 bg-surface hover:bg-ink hover:text-white border border-black/10 font-bold text-base flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add Custom Size */}
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

          {/* 5. Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              {t('admin_desc_label')}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-black/10 bg-surface p-3 text-sm text-ink focus:outline-none focus:border-ink rounded-none"
            />
          </div>

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 bg-ink text-white hover:bg-retro-orange hover:text-white font-bold text-sm uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 ${
              isSubmitting ? 'opacity-50 cursor-wait' : ''
            }`}
          >
            <Check size={18} />
            <span>{isSubmitting ? t('admin_saving') : t('admin_btn_save')}</span>
          </button>

          {/* Delete Product */}
          <div className="pt-4 border-t border-black/10 text-center">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 transition-colors py-2 px-3"
            >
              <Trash2 size={15} />
              <span>{t('admin_delete_product_btn')}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
