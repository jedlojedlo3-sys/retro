import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://retro-boutique.vercel.app'),
  title: 'Retro Boutique — Машка мода во Прилеп од 2003',
  description:
    'Retro Boutique — локална машка продавница во Прилеп. Фармерки, џемпери, кошули и панталони. Стив Наумов 8, Прилеп.',
  keywords: [
    'Retro Boutique',
    'Машка облека Прилеп',
    'Машка мода Прилеп',
    'Фармерки Прилеп',
    'Кошули Прилеп',
    'Retro Prilep',
    'Stiv Naumov 8',
  ],
  authors: [{ name: 'Retro Boutique' }],
  openGraph: {
    title: 'Retro Boutique — Машка облека Прилеп',
    description: 'Машка casual облека во Прилеп од 2003. Резервирај онлајн, подигни во продавница.',
    url: 'https://retro-boutique.vercel.app',
    siteName: 'Retro Boutique',
    images: [
      {
        url: '/assets/logo-retro.png',
        width: 800,
        height: 800,
        alt: 'Retro Boutique Logo',
      },
    ],
    locale: 'mk_MK',
    type: 'website',
  },
  icons: {
    icon: '/assets/logo-retro.png',
    apple: '/assets/logo-retro.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'Retro Boutique',
  description: "Men's casual clothing store in Prilep, established in 2003.",
  foundingDate: '2003',
  image: 'https://retro-boutique.vercel.app/assets/logo-retro.png',
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
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '20:00',
    },
  ],
  sameAs: ['https://www.instagram.com/retro_boutique/'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mk">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-paper text-ink selection:bg-retro-orange selection:text-white">
        {children}
      </body>
    </html>
  );
}
