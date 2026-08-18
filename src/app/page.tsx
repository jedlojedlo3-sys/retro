import React from 'react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { HeroSection } from '@/components/storefront/HeroSection';
import { VisitSection } from '@/components/storefront/VisitSection';
import { HomeClientSections } from '@/components/storefront/HomeClientSections';
import { getActiveProducts } from '@/lib/products';

export const revalidate = 60;

export default async function HomePage() {
  const products = await getActiveProducts();

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Header />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2-6. Interactive Translated Editorial, Looks, Featured, How it works, Story */}
        <HomeClientSections products={products} />

        {/* 7. Visit Section */}
        <VisitSection />
      </main>

      <Footer />
    </div>
  );
}
