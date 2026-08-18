import React from 'react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { ProductsCatalog } from '@/components/storefront/ProductsCatalog';
import { getActiveProducts } from '@/lib/products';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Колекција — Retro Boutique Prilep',
  description: 'Прегледај ја понудата на машка облека во Retro Boutique Прилеп. Фармерки, кошули, џемпери и панталони.',
};

export const revalidate = 60;

export default async function ProductsPage() {
  const products = await getActiveProducts();

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Header />

      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-12 max-w-7xl mx-auto w-full">
        <ProductsCatalog initialProducts={products} />
      </main>

      <Footer />
    </div>
  );
}
