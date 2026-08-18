'use client';

import { Product, ProductVariant } from '@/types/database';
import { FALLBACK_DEMO_PRODUCTS } from './mock-data';

const STORAGE_KEY = 'retro_boutique_custom_products';
const STORAGE_DELETED_KEY = 'retro_boutique_deleted_ids';

export function getClientProducts(initialProducts: Product[] = []): Product[] {
  if (typeof window === 'undefined') {
    const base = initialProducts.length > 0 ? initialProducts : FALLBACK_DEMO_PRODUCTS;
    return [...base].sort((a, b) => {
      if (a.is_new && !b.is_new) return -1;
      if (!a.is_new && b.is_new) return 1;
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });
  }

  try {
    const deletedIds: string[] = JSON.parse(localStorage.getItem(STORAGE_DELETED_KEY) || '[]');
    const storedCustom: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    const baseList = initialProducts.length > 0 ? initialProducts : FALLBACK_DEMO_PRODUCTS;

    // Start with base list excluding deleted
    const filteredBase = baseList.filter((p) => !deletedIds.includes(p.id));

    // Map custom updates over base list or append new ones
    const productMap = new Map<string, Product>();
    filteredBase.forEach((p) => productMap.set(p.id, p));
    storedCustom.forEach((p) => {
      if (!deletedIds.includes(p.id)) {
        productMap.set(p.id, p);
      }
    });

    return Array.from(productMap.values()).sort((a, b) => {
      if (a.is_new && !b.is_new) return -1;
      if (!a.is_new && b.is_new) return 1;
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });
  } catch {
    return initialProducts.length > 0 ? initialProducts : FALLBACK_DEMO_PRODUCTS;
  }
}

export function getClientProductById(id: string, initialProduct?: Product | null): Product | null {
  const all = getClientProducts(initialProduct ? [initialProduct] : []);
  return all.find((p) => p.id === id) || null;
}

export function saveClientProduct(product: Product): void {
  if (typeof window === 'undefined') return;
  try {
    const custom: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const existingIndex = custom.findIndex((p) => p.id === product.id);

    if (existingIndex >= 0) {
      custom[existingIndex] = product;
    } else {
      custom.unshift(product);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));

    // Also remove from deleted IDs if it was there
    const deletedIds: string[] = JSON.parse(localStorage.getItem(STORAGE_DELETED_KEY) || '[]');
    const newDeleted = deletedIds.filter((dId) => dId !== product.id);
    localStorage.setItem(STORAGE_DELETED_KEY, JSON.stringify(newDeleted));
  } catch (err) {
    console.error('Failed to save client product', err);
  }
}

export function deleteClientProduct(productId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const deletedIds: string[] = JSON.parse(localStorage.getItem(STORAGE_DELETED_KEY) || '[]');
    if (!deletedIds.includes(productId)) {
      deletedIds.push(productId);
      localStorage.setItem(STORAGE_DELETED_KEY, JSON.stringify(deletedIds));
    }

    const custom: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = custom.filter((p) => p.id !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete client product', err);
  }
}
