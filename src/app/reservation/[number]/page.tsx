import React from 'react';
import Link from 'next/link';
import { CheckCircle, MapPin, Clock, Instagram, ArrowRight, Phone } from 'lucide-react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
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
        <div className="bg-white border border-ink/10 p-8 sm:p-12 shadow-xl space-y-8 text-center sm:text-left">
          {/* Top Success Badge */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pb-6 border-b border-ink/10">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle size={36} />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-retro-orange block">
                УСПЕШНА РЕЗЕРВАЦИЈА
              </span>
              <h1 className="font-display text-4xl sm:text-5xl uppercase text-ink">
                Ви благодариме!
              </h1>
            </div>
          </div>

          {/* Reservation Number Card */}
          <div className="bg-paper p-6 border border-ink/10 text-center space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-muted block">
              Број на вашата резервација:
            </span>
            <span className="font-display text-4xl sm:text-5xl text-retro-orange tracking-wider block font-bold">
              {number}
            </span>
            <p className="text-xs text-muted max-w-md mx-auto">
              Зачувајте го овој број или наведете го при подигнување на производите во продавницата.
            </p>
          </div>

          {/* Pickup Details */}
          <div className="space-y-4 text-sm text-ink/80">
            <h3 className="text-xs uppercase font-bold tracking-wider text-ink">
              Информации за подигање:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-paper-light border border-ink/10 space-y-1">
                <div className="flex items-center gap-2 font-bold text-ink text-xs uppercase tracking-wider">
                  <MapPin size={16} className="text-retro-orange" />
                  <span>Локација</span>
                </div>
                <p className="text-sm font-semibold">Stiv Naumov 8, Prilep 7500</p>
              </div>

              <div className="p-4 bg-paper-light border border-ink/10 space-y-1">
                <div className="flex items-center gap-2 font-bold text-ink text-xs uppercase tracking-wider">
                  <Clock size={16} className="text-retro-orange" />
                  <span>Работно време</span>
                </div>
                <p className="text-sm font-semibold">Пон–Саб: 09:00 – 20:00</p>
              </div>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs leading-relaxed space-y-1">
              <strong>Важна напомена:</strong>
              <p>
                Резервацијата важи <strong>48 часа</strong>. Плаќањето се врши исклучиво во продавницата при подигнување. Доколку имате прашање, контактирајте нè на Instagram.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-ink/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Stiv+Naumov+8+Prilep+North+Macedonia"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-ink text-white hover:bg-retro-orange hover:text-ink font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <MapPin size={16} />
              <span>Отвори Google Maps</span>
            </a>

            <Link
              href="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-ink text-ink hover:bg-paper font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <span>Кон колекцијата</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
