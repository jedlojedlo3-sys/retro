import React from 'react';
import { notFound } from 'next/navigation';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { ProductDetailClient } from '@/components/storefront/ProductDetailClient';
import { getProductById } from '@/lib/products';
import { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: 'Производот не е пронајден — Retro Boutique',
    };
  }

  return {
    title: `${product.name} — Retro Boutique Prilep`,
    description: product.description || `Купи ${product.name} во Retro Boutique Prilep. Резервирај онлајн, подигни во продавница.`,
    openGraph: {
      title: `${product.name} — Retro Boutique Prilep`,
      images: [{ url: product.image_url }],
    },
  };
}

export const revalidate = 60;

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Header />

      <main className="flex-1 py-10 sm:py-16 px-4 sm:px-12 max-w-7xl mx-auto w-full">
        <ProductDetailClient product={product} />
      </main>

      <Footer />
    </div>
  );
}
