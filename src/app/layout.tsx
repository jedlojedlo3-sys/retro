import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { MobileBottomNav } from '@/components/storefront/MobileBottomNav';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://retro-boutique.vercel.app'),
  title: 'Retro Boutique — Машка мода во Прилеп од 2003',
  description:
    'Retro Boutique — локална машка продавница во Прилеп. Фармерки, џемпери, кошули и панталони. Стив Наумов 8, Прилеп.',
  keywords: ['Retro Boutique', 'Машка облека Прилеп', 'Фармерки Прилеп', 'Retro Prilep'],
  openGraph: {
    title: 'Retro Boutique — Машка облека Прилеп',
    description: 'Машка casual облека во Прилеп од 2003. Резервирај онлајн, подигни во продавница.',
    url: 'https://retro-boutique.vercel.app',
    siteName: 'Retro Boutique',
    locale: 'mk_MK',
    type: 'website',
  },
  icons: { icon: '/assets/logo-retro.png', apple: '/assets/logo-retro.png' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'Retro Boutique',
  foundingDate: '2003',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Stiv Naumov 8',
    addressLocality: 'Prilep',
    postalCode: '7500',
    addressCountry: 'MK',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '20:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Wednesday', 'Saturday'],
      opens: '09:00',
      closes: '16:00',
    },
  ],
  sameAs: ['https://www.instagram.com/retro_boutique/'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mk">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-paper text-ink selection:bg-retro-orange selection:text-white pb-16 md:pb-0">
        <LanguageProvider>
          {children}
          <MobileBottomNav />
        </LanguageProvider>
      </body>
    </html>
  );
}
