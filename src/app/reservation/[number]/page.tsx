import React from 'react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { ReservationConfirmationClient } from '@/components/storefront/ReservationConfirmationClient';
import { Metadata } from 'next';

interface ReservationConfirmationProps {
  params: Promise<{ number: string }>;
}

export async function generateMetadata({ params }: ReservationConfirmationProps): Promise<Metadata> {
  const { number } = await params;
  return {
    title: `Потврда за резервација ${number} — Retro Boutique`,
  };
}

export default async function ReservationConfirmationPage({
  params,
}: ReservationConfirmationProps) {
  const { number } = await params;

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Header />

      <main className="flex-1 py-16 sm:py-24 px-4 sm:px-12 max-w-3xl mx-auto w-full">
        <ReservationConfirmationClient number={number} />
      </main>

      <Footer />
    </div>
  );
}
