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

      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-12 max-w-7xl mx-auto w-full space-y-8">
        {/* Page Header */}
        <div className="border-b border-ink/10 pb-8 space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-retro-orange block">
            RETRO BOUTIQUE · PRILEP
          </span>
          <h1 className="font-display text-5xl sm:text-7xl uppercase text-ink leading-none">
            Машка Колекција
          </h1>
          <p className="text-sm sm:text-base text-muted-dark max-w-xl">
            Избери големина и резервирај онлајн. Подигнување и плаќање исклучиво во продавницата на Stiv Naumov 8 во Прилеп.
          </p>
        </div>

        {/* Catalog Component with Live Filter and Search */}
        <ProductsCatalog initialProducts={products} />
      </main>

      <Footer />
    </div>
  );
}
