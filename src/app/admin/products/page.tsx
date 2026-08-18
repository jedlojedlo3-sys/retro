'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  PlusCircle,
  Edit3,
  Eye,
  EyeOff,
  Search,
  Trash2,
  Check,
  Sparkles,
  Camera,
  X,
  AlertCircle,
  Percent,
  Tag
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Product, ProductVariant, Category } from '@/types/database';
import { CATEGORIES, formatPrice } from '@/lib/utils';
import { getClientProducts, saveClientProduct, deleteClientProduct } from '@/lib/products-store';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const PRESET_CLOTHING_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const PRESET_JEANS_SIZES = ['30', '31', '32', '33', '34', '36'];
const PRICE_PRESETS = [690, 790, 890, 1290, 1390, 1490, 1690, 1890, 1990, 2490, 2690, 2790, 3290];

interface VariantInput {
  id?: string;
  size: string;
  stock_quantity: number;
  reserved_quantity?: number;
}

export default function AdminProductsPage() {
  const { t, getCategoryText } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'new' | 'sale' | 'active' | 'hidden'>('all');

  // Inline price quick edit state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  // ── Unified Modal State (Add & Edit combined) ─────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('shirts');
  const [formPrice, setFormPrice] = useState('1490');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsNew, setFormIsNew] = useState(true);
  const [formActive, setFormActive] = useState(true);
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formVariants, setFormVariants] = useState<VariantInput[]>([]);
  const [formCustomSize, setFormCustomSize] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchProducts = () => {
    const clientList = getClientProducts([]);
    setProducts(clientList);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    if (typeof window !== 'undefined' && window.location.search.includes('new=1')) {
      openNewModal();
    }
  }, []);

  // ── Open Modal for NEW Product ─────────────────────────────────────────
  const openNewModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('shirts');
    setFormPrice('1490');
    setFormOriginalPrice('');
    setFormDescription('');
    setFormIsNew(true);
    setFormActive(true);
    setFormImages([]);
    setFormVariants(PRESET_CLOTHING_SIZES.map((s) => ({ size: s, stock_quantity: 2, reserved_quantity: 0 })));
    setFormCustomSize('');
    setModalError(null);
    setIsModalOpen(true);
  };

  // ── Open Modal for EDIT Product ────────────────────────────────────────
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormPrice(String(product.price));
    setFormOriginalPrice(product.original_price ? String(product.original_price) : '');
    setFormDescription(product.description || '');
    setFormIsNew(product.is_new ?? false);
    setFormActive(product.active !== false);
    setFormImages([product.image_url, ...(product.additional_images || [])].filter(Boolean));
    setFormVariants(
      (product.variants || []).map((v) => ({
        id: v.id,
        size: v.size,
        stock_quantity: v.stock_quantity,
        reserved_quantity: v.reserved_quantity,
      }))
    );
    setFormCustomSize('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleCategoryChange = (newCat: Category) => {
    setFormCategory(newCat);
    if (!editingProduct) {
      if (newCat === 'jeans' || newCat === 'trousers') {
        setFormVariants(PRESET_JEANS_SIZES.map((s) => ({ size: s, stock_quantity: 2, reserved_quantity: 0 })));
        if (formPrice === '1490') setFormPrice('1990');
      } else {
        setFormVariants(PRESET_CLOTHING_SIZES.map((s) => ({ size: s, stock_quantity: 2, reserved_quantity: 0 })));
      }
    }
  };

  // Quick discount applicator helper
  const applyQuickDiscount = (discountPercent: number) => {
    const base = Number(formOriginalPrice) || Number(formPrice) || 1000;
    const discounted = Math.round((base * (1 - discountPercent / 100)) / 10) * 10;
    setFormOriginalPrice(String(base));
    setFormPrice(String(discounted));
  };

  const removeDiscount = () => {
    if (formOriginalPrice) {
      setFormPrice(formOriginalPrice);
    }
    setFormOriginalPrice('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setModalError(null);

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
          setFormImages((prev) => [...prev, data.url]);
        }
      }
    } catch {
      setModalError('Грешка при прикачување на сликата.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleVariantDelta = (index: number, delta: number) => {
    setFormVariants((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v;
        const minAllowed = v.reserved_quantity || 0;
        const newQty = Math.max(minAllowed, v.stock_quantity + delta);
        return { ...v, stock_quantity: newQty };
      })
    );
  };

  const handleAddCustomSize = () => {
    if (!formCustomSize.trim()) return;
    const clean = formCustomSize.trim().toUpperCase();
    if (formVariants.some((v) => v.size === clean)) {
      setFormCustomSize('');
      return;
    }
    setFormVariants((prev) => [...prev, { size: clean, stock_quantity: 2, reserved_quantity: 0 }]);
    setFormCustomSize('');
  };

  const handleRemoveVariant = (index: number) => {
    setFormVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!formName.trim()) {
      setModalError('Внесете назив на производот.');
      return;
    }

    const priceNum = Number(formPrice);
    if (!formPrice || isNaN(priceNum) || priceNum <= 0) {
      setModalError('Внесете важечка продажна цена во денари.');
      return;
    }

    const origPriceNum = formOriginalPrice && !isNaN(Number(formOriginalPrice)) && Number(formOriginalPrice) > priceNum
      ? Number(formOriginalPrice)
      : null;

    if (formImages.length === 0) {
      setModalError('Потребна е барем една слика.');
      return;
    }

    if (formVariants.length === 0) {
      setModalError('Потребна е барем една големина со залиха.');
      return;
    }

    setIsSubmitting(true);

    const productId = editingProduct ? editingProduct.id : `prod-${Date.now()}`;
    const productVariants: ProductVariant[] = formVariants.map((v, idx) => ({
      id: v.id || `v-${productId}-${v.size}`,
      product_id: productId,
      size: v.size.toUpperCase(),
      stock_quantity: v.stock_quantity,
      reserved_quantity: v.reserved_quantity || 0,
      display_order: idx + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const updatedProduct: Product = {
      id: productId,
      name: formName.trim(),
      category: formCategory,
      price: priceNum,
      original_price: origPriceNum,
      description: formDescription.trim() || null,
      image_url: formImages[0],
      additional_images: formImages.slice(1),
      active: formActive,
      is_new: formIsNew,
      created_at: editingProduct?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      variants: productVariants,
    };

    saveClientProduct(updatedProduct);

    if (editingProduct) {
      setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProduct : p)));
    } else {
      setProducts((prev) => [updatedProduct, ...prev]);
    }

    try {
      await fetch('/api/admin/products', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId,
          name: formName.trim(),
          category: formCategory,
          price: priceNum,
          original_price: origPriceNum,
          description: formDescription.trim() || null,
          image_url: formImages[0],
          additional_images: formImages.slice(1),
          variants: formVariants,
          active: formActive,
          is_new: formIsNew,
        }),
      });
    } catch {
      // client store updated
    }

    setIsSubmitting(false);
    closeModal();
  };

  const handleDelete = (productId: string, productName: string) => {
    if (!window.confirm(`${t('admin_confirm_delete')}\n\n"${productName}"`)) {
      return;
    }

    deleteClientProduct(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (isModalOpen && editingProduct?.id === productId) {
      closeModal();
    }
  };

  const handleQuickStock = (productId: string, variantIndex: number, delta: number) => {
    const target = products.find((p) => p.id === productId);
    if (!target || !target.variants) return;

    const newVariants = target.variants.map((v, idx) => {
      if (idx !== variantIndex) return v;
      const newStock = Math.max(v.reserved_quantity, v.stock_quantity + delta);
      return { ...v, stock_quantity: newStock };
    });

    const updatedProduct: Product = {
      ...target,
      variants: newVariants,
      updated_at: new Date().toISOString(),
    };

    saveClientProduct(updatedProduct);
    setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProduct : p)));
  };

  const startEditPrice = (product: Product) => {
    setEditingPriceId(product.id);
    setTempPrice(String(product.price));
  };

  const savePrice = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const num = Number(tempPrice);
    if (!isNaN(num) && num > 0) {
      const updatedProduct: Product = {
        ...target,
        price: num,
        updated_at: new Date().toISOString(),
      };
      saveClientProduct(updatedProduct);
      setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProduct : p)));
    }
    setEditingPriceId(null);
  };

  const handleToggleActive = (productId: string, currentActive: boolean) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const updatedProduct = { ...target, active: !currentActive, updated_at: new Date().toISOString() };
    saveClientProduct(updatedProduct);
    setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProduct : p)));
  };

  const handleToggleNew = (productId: string, currentNew?: boolean) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const updatedProduct = { ...target, is_new: !currentNew, updated_at: new Date().toISOString() };
    saveClientProduct(updatedProduct);
    setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProduct : p)));
  };

  const filteredProducts = products.filter((p) => {
    if (filterActive === 'active' && !p.active) return false;
    if (filterActive === 'hidden' && p.active) return false;
    if (filterActive === 'new' && !p.is_new) return false;
    if (filterActive === 'sale' && (!p.original_price || p.original_price <= p.price)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(q) ||
        getCategoryText(p.category).toLowerCase().includes(q)
      );
    }
    return true;
  });

  const saleCount = products.filter((p) => p.original_price && p.original_price > p.price).length;

  // Computed discount preview inside modal
  const modalHasDiscount = Boolean(
    formOriginalPrice &&
    !isNaN(Number(formOriginalPrice)) &&
    !isNaN(Number(formPrice)) &&
    Number(formOriginalPrice) > Number(formPrice)
  );
  const modalDiscountPercent = modalHasDiscount
    ? Math.round(((Number(formOriginalPrice) - Number(formPrice)) / Number(formOriginalPrice)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-paper flex flex-col pb-20 w-full max-w-full overflow-x-hidden">
      <AdminHeader title={t('admin_products_header')} showBack backUrl="/admin" />

      <main className="max-w-4xl mx-auto w-full p-3 sm:p-6 space-y-3 sm:space-y-4">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder={t('admin_products_search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-black/10 text-ink focus:outline-none focus:border-ink rounded-none"
            />
          </div>

          {/* Unified ➕ Add Product Button (Opens Modal) */}
          <button
            type="button"
            onClick={openNewModal}
            className="px-4 py-2 bg-retro-orange text-white hover:bg-ink font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-sm"
          >
            <PlusCircle size={15} />
            <span>➕ {t('admin_dash_add_prod_title')}</span>
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-1.5 text-xs font-bold">
          <button
            onClick={() => setFilterActive('all')}
            className={`px-3 py-1 border transition-all ${
              filterActive === 'all' ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-black/10'
            }`}
          >
            {t('admin_tab_all')} ({products.length})
          </button>
          <button
            onClick={() => setFilterActive('new')}
            className={`px-3 py-1 border transition-all ${
              filterActive === 'new' ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-black/10'
            }`}
          >
            ⭐ NEW ({products.filter((p) => p.is_new).length})
          </button>
          <button
            onClick={() => setFilterActive('sale')}
            className={`px-3 py-1 border transition-all ${
              filterActive === 'sale' ? 'bg-retro-orange text-white border-retro-orange shadow-sm' : 'bg-white text-ink border-black/10'
            }`}
          >
            🔥 {t('admin_tab_sale')} ({saleCount})
          </button>
          <button
            onClick={() => setFilterActive('active')}
            className={`px-3 py-1 border transition-all ${
              filterActive === 'active' ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-black/10'
            }`}
          >
            {t('admin_tab_active')} ({products.filter((p) => p.active).length})
          </button>
          <button
            onClick={() => setFilterActive('hidden')}
            className={`px-3 py-1 border transition-all ${
              filterActive === 'hidden' ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-black/10'
            }`}
          >
            {t('admin_tab_hidden')} ({products.filter((p) => !p.active).length})
          </button>
        </div>

        {/* Product Cards List with Responsive Layout */}
        <div className="space-y-3">
          {filteredProducts.map((product) => {
            const totalStock =
              product.variants?.reduce(
                (acc, v) => acc + Math.max(0, v.stock_quantity - v.reserved_quantity),
                0
              ) ?? 0;

            const hasDiscount = Boolean(product.original_price && product.original_price > product.price);
            const discountPct = hasDiscount
              ? Math.round((((product.original_price || 0) - product.price) / (product.original_price || 1)) * 100)
              : 0;

            return (
              <div
                key={product.id}
                className={`bg-white border p-3 sm:p-4 transition-all shadow-sm ${
                  product.active ? 'border-black/10' : 'border-dashed border-zinc-300 opacity-70 bg-zinc-50'
                }`}
              >
                {/* Top Row: Thumbnail, Info & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      onClick={() => openEditModal(product)}
                      className="relative w-14 h-18 sm:w-16 sm:h-20 bg-surface shrink-0 overflow-hidden border border-black/10 cursor-pointer group"
                    >
                      <Image
                        src={product.image_url || '/assets/look-01.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="min-w-0 space-y-1 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-surface text-muted border border-black/10">
                          {getCategoryText(product.category)}
                        </span>
                        {product.is_new && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-ink text-white">
                            NEW ⭐
                          </span>
                        )}
                        {hasDiscount && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-retro-orange text-white">
                            🔥 -{discountPct}%
                          </span>
                        )}
                        {!product.active && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-zinc-200 text-zinc-600">
                            {t('admin_status_hidden')}
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => openEditModal(product)}
                        className="font-bold text-sm text-ink truncate cursor-pointer hover:text-retro-orange transition-colors"
                      >
                        {product.name}
                      </h3>

                      {/* Inline Price with 1-click Quick Edit */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {editingPriceId === product.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={tempPrice}
                              autoFocus
                              onChange={(e) => setTempPrice(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && savePrice(product.id)}
                              className="w-20 px-2 py-0.5 border border-ink text-xs font-bold bg-white"
                            />
                            <button
                              onClick={() => savePrice(product.id)}
                              className="p-1 bg-ink text-white hover:bg-emerald-600"
                            >
                              <Check size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditPrice(product)}
                            className="font-display text-base sm:text-lg text-ink hover:text-retro-orange transition-colors flex items-center gap-1.5"
                            title="Click to edit price"
                          >
                            <span className={hasDiscount ? 'text-retro-orange font-bold' : ''}>
                              {formatPrice(product.price)}
                            </span>
                            {hasDiscount && (
                              <span className="text-xs text-muted line-through opacity-70">
                                {formatPrice(product.original_price)}
                              </span>
                            )}
                            <span className="text-[10px] text-muted">✏️</span>
                          </button>
                        )}
                        <span className="text-muted text-xs font-medium">
                          ({t('admin_stock_avail', { count: totalStock })})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-1 self-end sm:self-start shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-black/5 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleToggleNew(product.id, product.is_new)}
                      className={`px-2 py-1.5 border text-xs font-bold transition-all ${
                        product.is_new
                          ? 'border-ink bg-ink text-white'
                          : 'border-black/10 hover:border-ink text-muted hover:text-ink bg-white'
                      }`}
                      title={product.is_new ? 'Remove NEW' : 'Mark as NEW'}
                    >
                      ⭐ {product.is_new ? 'NEW' : ''}
                    </button>

                    <button
                      onClick={() => handleToggleActive(product.id, product.active)}
                      className="p-1.5 border border-black/10 hover:border-ink text-ink bg-white transition-colors"
                      title={product.active ? 'Hide from shop' : 'Show in shop'}
                    >
                      {product.active ? <Eye size={15} /> : <EyeOff size={15} className="text-muted" />}
                    </button>

                    {/* Opens SAME unified modal prefilled */}
                    <button
                      onClick={() => openEditModal(product)}
                      className="px-2.5 py-1.5 border border-black/10 hover:bg-ink hover:text-white text-ink bg-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={13} />
                      <span>{t('admin_btn_edit')}</span>
                    </button>

                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="p-1.5 border border-black/10 hover:border-red-600 hover:text-red-600 text-muted bg-white transition-colors"
                      title={t('admin_btn_delete')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Bottom: Inline Quick Stock Modifier (+/- per size) */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-black/[0.06]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                      Брза залиха (Stock +/-):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.variants.map((variant, vIdx) => {
                        const avail = Math.max(0, variant.stock_quantity - variant.reserved_quantity);
                        return (
                          <div
                            key={variant.id || vIdx}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-surface border border-black/10 text-xs"
                          >
                            <span className="font-bold text-ink">{variant.size}</span>
                            <button
                              type="button"
                              onClick={() => handleQuickStock(product.id, vIdx, -1)}
                              disabled={variant.stock_quantity <= variant.reserved_quantity}
                              className="w-4 h-4 bg-white hover:bg-ink hover:text-white border border-black/10 font-bold flex items-center justify-center transition-colors disabled:opacity-30 text-[10px]"
                            >
                              -
                            </button>
                            <span className="font-extrabold text-ink min-w-[12px] text-center text-[11px]">
                              {avail}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickStock(product.id, vIdx, 1)}
                              className="w-4 h-4 bg-white hover:bg-ink hover:text-white border border-black/10 font-bold flex items-center justify-center transition-colors text-[10px]"
                            >
                              +
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredProducts.length === 0 && !loading && (
            <div className="bg-white border border-black/10 p-6 text-center text-xs text-muted">
              {t('admin_no_products')}
            </div>
          )}
        </div>
      </main>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* ── UNIFIED RESPONSIVE MODAL DRAWER ─────────────────────────────────── */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-black/20 w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl p-4 sm:p-6 space-y-4 rounded-none">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-retro-orange block">
                  {editingProduct ? 'ИЗМЕНА НА ПРОИЗВОД' : 'НОВ ПРОИЗВОД'}
                </span>
                <h2 className="font-display text-2xl uppercase text-ink truncate">
                  {editingProduct ? formName || t('admin_edit_header') : t('admin_add_header')}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 text-muted hover:text-ink hover:bg-surface transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveModal} className="space-y-3.5">
              {/* 1. Photos */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                  {t('admin_photos_label')} <span className="text-retro-orange">*</span>
                </label>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {formImages.map((url, idx) => (
                    <div key={idx} className="relative aspect-[3/4] bg-surface border border-black/10 group">
                      <Image src={url} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 bg-ink text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={11} />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-0.5 left-0.5 right-0.5 bg-ink/80 text-white text-[8px] font-bold text-center uppercase py-0.2">
                          {t('admin_photo_main')}
                        </span>
                      )}
                    </div>
                  ))}

                  <label className="relative aspect-[3/4] border-2 border-dashed border-black/20 hover:border-retro-orange flex flex-col items-center justify-center cursor-pointer bg-surface hover:bg-white transition-colors p-2 text-center">
                    <Camera size={22} className="text-muted group-hover:text-retro-orange mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-ink">
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
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                  {t('admin_name_label')} <span className="text-retro-orange">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('admin_name_placeholder')}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border border-black/10 bg-surface px-3 py-2 text-xs sm:text-sm font-semibold text-ink focus:outline-none focus:border-ink rounded-none"
                />
              </div>

              {/* 3. Category selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                  {t('admin_category_label')} <span className="text-retro-orange">*</span>
                </label>
                <div className="flex flex-wrap gap-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => handleCategoryChange(cat.key)}
                      className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border transition-all ${
                        formCategory === cat.key
                          ? 'bg-ink text-white border-ink'
                          : 'bg-surface text-ink border-black/10 hover:border-ink'
                      }`}
                    >
                      {getCategoryText(cat.key)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Price and Discount (Popust) Setup */}
              <div className="p-3 bg-surface border border-black/10 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Selling Price */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1">
                      {t('admin_price_label')} <span className="text-retro-orange">*</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        required
                        min="0"
                        step="50"
                        placeholder="1490"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        className="w-full border border-black/15 bg-white px-2.5 py-1.5 text-sm font-bold text-ink focus:outline-none focus:border-ink"
                      />
                      <span className="font-display text-sm text-ink font-bold shrink-0">den.</span>
                    </div>
                  </div>

                  {/* Regular / Original Price (for Discount) */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1">
                      {t('admin_orig_price_label')}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        step="50"
                        placeholder="1990 (опционално)"
                        value={formOriginalPrice}
                        onChange={(e) => setFormOriginalPrice(e.target.value)}
                        className="w-full border border-black/15 bg-white px-2.5 py-1.5 text-sm font-bold text-ink focus:outline-none focus:border-ink placeholder:text-xs placeholder:font-normal"
                      />
                      <span className="font-display text-sm text-muted font-bold shrink-0">den.</span>
                    </div>
                  </div>
                </div>

                {/* Quick Discount Calculator Buttons */}
                <div className="space-y-1 pt-1 border-t border-black/5">
                  <span className="text-[10px] font-bold uppercase text-muted tracking-wider block">
                    Брз попуст (Quick %):
                  </span>
                  <div className="flex flex-wrap gap-1 items-center">
                    <button
                      type="button"
                      onClick={() => applyQuickDiscount(10)}
                      className="px-2 py-0.5 bg-white hover:bg-retro-orange hover:text-white border border-black/10 text-[10px] font-bold transition-colors"
                    >
                      -10%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickDiscount(20)}
                      className="px-2 py-0.5 bg-white hover:bg-retro-orange hover:text-white border border-black/10 text-[10px] font-bold transition-colors"
                    >
                      -20%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickDiscount(30)}
                      className="px-2 py-0.5 bg-white hover:bg-retro-orange hover:text-white border border-black/10 text-[10px] font-bold transition-colors"
                    >
                      -30%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickDiscount(50)}
                      className="px-2 py-0.5 bg-white hover:bg-retro-orange hover:text-white border border-black/10 text-[10px] font-bold transition-colors"
                    >
                      -50%
                    </button>

                    {formOriginalPrice && (
                      <button
                        type="button"
                        onClick={removeDiscount}
                        className="px-2 py-0.5 text-red-600 hover:bg-red-50 text-[10px] font-bold ml-auto transition-colors"
                      >
                        ✕ Без попуст
                      </button>
                    )}
                  </div>
                </div>

                {/* Active discount summary banner */}
                {modalHasDiscount && (
                  <div className="p-2 bg-retro-orange/10 border border-retro-orange/30 text-xs flex items-center justify-between text-retro-orange font-bold">
                    <span className="flex items-center gap-1">
                      <Tag size={13} />
                      <span>Активен попуст: -{modalDiscountPercent}%</span>
                    </span>
                    <span>Заштеда: {Number(formOriginalPrice) - Number(formPrice)} den.</span>
                  </div>
                )}

                {/* Fast price chips */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {PRICE_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormPrice(String(p))}
                      className={`px-1.5 py-0.2 text-[10px] font-bold border transition-colors ${
                        formPrice === String(p)
                          ? 'bg-ink text-white border-ink'
                          : 'bg-white text-muted border-black/10 hover:border-ink hover:text-ink'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Sizes & Stock Management */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                  {t('admin_sizes_label')} <span className="text-retro-orange">*</span>
                </label>

                <div className="space-y-1 bg-surface p-2.5 border border-black/10 max-h-40 overflow-y-auto">
                  {formVariants.map((v, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-1.5 border border-black/10 text-xs">
                      <span className="font-bold text-xs text-ink w-10">{v.size}</span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleVariantDelta(idx, -1)}
                          className="w-6 h-6 bg-surface hover:bg-ink hover:text-white border border-black/10 font-bold text-xs flex items-center justify-center transition-colors"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-xs text-ink">
                          {v.stock_quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleVariantDelta(idx, 1)}
                          className="w-6 h-6 bg-surface hover:bg-ink hover:text-white border border-black/10 font-bold text-xs flex items-center justify-center transition-colors"
                        >
                          +
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="p-1 text-muted hover:text-red-600 ml-0.5"
                          title="Delete size"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Custom Size */}
                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder={t('admin_size_custom_placeholder')}
                      value={formCustomSize}
                      onChange={(e) => setFormCustomSize(e.target.value)}
                      className="flex-1 px-2.5 py-1 text-xs bg-white border border-black/10"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSize}
                      className="px-2.5 py-1 bg-ink text-white hover:bg-retro-orange hover:text-white text-xs font-bold uppercase transition-colors"
                    >
                      {t('admin_size_custom_btn')}
                    </button>
                  </div>
                </div>
              </div>

              {/* 6. NEW ⭐ & Visible 👁️ Toggles */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                {/* NEW toggle */}
                <button
                  type="button"
                  onClick={() => setFormIsNew(!formIsNew)}
                  className={`p-2 border text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                    formIsNew
                      ? 'bg-ink text-white border-ink shadow-sm'
                      : 'bg-surface text-muted border-black/10 hover:border-ink hover:text-ink'
                  }`}
                >
                  <Sparkles size={12} />
                  <span>⭐ {formIsNew ? 'НОВО (NEW)' : 'Не е ново'}</span>
                </button>

                {/* Visible toggle */}
                <button
                  type="button"
                  onClick={() => setFormActive(!formActive)}
                  className={`p-2 border text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                    formActive
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                      : 'bg-zinc-100 text-zinc-500 border-zinc-300'
                  }`}
                >
                  {formActive ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{formActive ? 'Видлив' : 'Скриен'}</span>
                </button>
              </div>

              {/* 7. Description (Optional) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-0.5">
                  {t('admin_desc_label')} <span className="text-muted font-normal text-[9px]">{t('admin_optional')}</span>
                </label>
                <textarea
                  rows={2}
                  placeholder={t('admin_desc_placeholder')}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full border border-black/10 bg-surface p-2 text-xs text-ink focus:outline-none focus:border-ink rounded-none"
                />
              </div>

              {modalError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-1.5">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2.5 border-t border-black/10 flex items-center justify-between gap-2">
                {editingProduct ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingProduct.id, editingProduct.name)}
                    className="px-3 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={13} />
                    <span>{t('admin_btn_delete')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-3 py-2.5 border border-black/10 text-muted hover:text-ink text-xs font-bold uppercase tracking-wider"
                  >
                    Откажи
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className={`flex-1 py-3 bg-ink text-white hover:bg-retro-orange hover:text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5 ${
                    isSubmitting ? 'opacity-50 cursor-wait' : ''
                  }`}
                >
                  <Check size={15} />
                  <span>
                    {isSubmitting
                      ? t('admin_saving')
                      : editingProduct
                      ? t('admin_btn_save')
                      : t('admin_btn_publish')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
