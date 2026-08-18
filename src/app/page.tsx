import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShoppingBag, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { HeroSection } from '@/components/storefront/HeroSection';
import { ProductCard } from '@/components/storefront/ProductCard';
import { VisitSection } from '@/components/storefront/VisitSection';
import { getActiveProducts } from '@/lib/products';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  const products = await getActiveProducts();
  const featuredProducts = products.slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Header />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Editorial Statement */}
        <section className="py-20 sm:py-28 px-4 sm:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-7 space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-retro-orange block">
              НОВА СЕЛЕКЦИЈА
            </span>
            <h2 className="font-display text-5xl sm:text-7xl uppercase leading-[0.9] text-ink">
              Облечи се едноставно. <br />
              <span className="text-muted-light">Изгледај средено.</span>
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="text-base sm:text-lg text-muted-dark leading-relaxed">
              Retro Boutique е локална машка продавница во Прилеп. Секое парче е внимателно избрано за да ти понуди врвна удобност, совршен крој и автентичен секојдневен изглед.
            </p>
          </div>
        </section>

        {/* 3. Campaign Looks Grid */}
        <section className="px-4 sm:px-12 pb-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Large campaign card */}
            <div className="md:col-span-7 relative min-h-[480px] sm:min-h-[580px] bg-ink overflow-hidden group">
              <Image
                src="/assets/store-01.jpg"
                alt="Retro Boutique Campaign"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 filter saturate-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent flex flex-col justify-end p-8 text-white">
                <span className="text-xs font-mono text-retro-orange font-bold">LOOK 01</span>
                <h3 className="font-display text-4xl sm:text-5xl uppercase mt-1">
                  Everyday Denim & Layers
                </h3>
                <p className="text-sm text-white/80 max-w-md mt-2">
                  Квалитетен тексас и лесни плетени џемпери за секој ден.
                </p>
              </div>
            </div>

            {/* Second campaign card */}
            <div className="md:col-span-5 relative min-h-[480px] sm:min-h-[580px] bg-ink overflow-hidden group">
              <Image
                src="/assets/look-02.jpg"
                alt="Statement shirts"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 filter saturate-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent flex flex-col justify-end p-8 text-white">
                <span className="text-xs font-mono text-retro-orange font-bold">LOOK 02</span>
                <h3 className="font-display text-4xl sm:text-5xl uppercase mt-1">
                  Statement Кошули
                </h3>
                <p className="text-sm text-white/80 max-w-md mt-2">
                  Крој што одговара и за лежерен и за структуриран стил.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Featured Products Catalogue */}
        <section className="py-20 bg-white border-y border-ink/10 px-4 sm:px-12">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-ink/10">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-retro-orange block">
                  ПОНУДА ВО ПРОДАВНИЦАТА
                </span>
                <h2 className="font-display text-4xl sm:text-6xl uppercase text-ink">
                  Актуелни модели
                </h2>
              </div>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-ink hover:text-retro-orange group transition-colors"
              >
                <span>Сите производи ({products.length})</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center pt-8">
              <Link
                href="/products"
                className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-white hover:bg-retro-orange hover:text-ink font-bold text-sm tracking-wider uppercase transition-colors"
              >
                <span>Отвори го целиот каталог</span>
                <ShoppingBag size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* 5. How Click & Collect Works */}
        <section className="py-20 sm:py-28 bg-ink text-white px-4 sm:px-12">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-retro-orange block">
                КАКО ФУНКЦИОНИРА
              </span>
              <h2 className="font-display text-4xl sm:text-6xl uppercase">
                Онлајн избор. Локално подигање.
              </h2>
              <p className="text-white/70 text-sm sm:text-base">
                Едноставен процес без кредитни картички и без комплицирани процедури.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white/5 border border-white/10 p-8 space-y-4 hover:border-retro-orange/50 transition-colors">
                <span className="font-display text-5xl text-retro-orange">01</span>
                <h3 className="font-display text-2xl uppercase tracking-wide">Избери парче & големина</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Прегледај ја понудата и избери ја големината што ти треба. Залихата се ажурира во реално време.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white/5 border border-white/10 p-8 space-y-4 hover:border-retro-orange/50 transition-colors">
                <span className="font-display text-5xl text-retro-orange">02</span>
                <h3 className="font-display text-2xl uppercase tracking-wide">Резервирај со телефон</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Внеси само име и телефонски број. Парчето се резервира веднаш и те чека во продавницата 48 часа.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white/5 border border-white/10 p-8 space-y-4 hover:border-retro-orange/50 transition-colors">
                <span className="font-display text-5xl text-retro-orange">03</span>
                <h3 className="font-display text-2xl uppercase tracking-wide">Подигни & плати во Retro</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Посети нè на Stiv Naumov 8 во Прилеп, пробај го парчето и плати на каса.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Story / About Retro */}
        <section id="story" className="py-20 sm:py-28 px-4 sm:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative aspect-[4/5] bg-ink overflow-hidden border border-ink/10 shadow-xl">
              <Image
                src="/assets/look-01.jpg"
                alt="Retro Boutique Prilep about"
                fill
                className="object-cover filter saturate-80"
              />
            </div>
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs uppercase font-extrabold tracking-widest text-retro-orange block">
                ОД 2003 ГОДИНА
              </span>
              <h2 className="font-display text-5xl sm:text-7xl uppercase leading-[0.9] text-ink">
                Не само продавница. <br />
                <span className="text-muted">Твој локален избор.</span>
              </h2>
              <p className="text-base text-ink/80 leading-relaxed">
                Повеќе од две децении Retro Boutique им нуди на мажите во Прилеп квалитетна, практична и модерна секојдневна гардероба.
              </p>
              <p className="text-base text-ink/80 leading-relaxed">
                Нашата најголема вредност е искрената помош: ако не си сигурен за големина, должина или со што најдобро да го искомбинираш избраниот џемпер или кошула, ние сме тука лично да ти помогнеме.
              </p>

              <div className="pt-4 flex flex-wrap gap-4 text-xs uppercase font-bold tracking-wider text-ink/70">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-paper-dark">
                  <CheckCircle2 size={16} className="text-retro-orange" />
                  <span>20+ години традиција</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-paper-dark">
                  <ShieldCheck size={16} className="text-retro-orange" />
                  <span>Проверени кроеви и материјали</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Visit Section */}
        <VisitSection />
      </main>

      <Footer />
    </div>
  );
}
