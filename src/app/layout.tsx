import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/presentation/context/CartContext';
import { Navbar } from '@/presentation/components/organisms/Navbar';
import { Footer } from '@/presentation/components/organisms/Footer';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  weight: ['600', '700'],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nookmint.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'NookMint | Home, Garden & Smart Tech Gadgets • Sri Lanka COD',
    template: '%s | NookMint Sri Lanka',
  },
  description: 'NookMint - Online ordering store for household essentials, kitchenware, home & garden supplies, and smart audio gadgets like earbuds & wireless mics. Islandwide Cash on Delivery across Sri Lanka.',
  keywords: [
    'NookMint',
    'Sri Lanka online shopping',
    'Cash on delivery Sri Lanka',
    'Earbuds Colombo',
    'Wireless mic Sri Lanka',
    'Kitchen essentials Colombo',
    'Home and garden Sri Lanka',
    'Dropshipping Sri Lanka',
  ],
  authors: [{ name: 'NookMint' }],
  creator: 'NookMint',
  publisher: 'NookMint',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'NookMint | Home, Garden & Smart Tech Gadgets • Sri Lanka COD',
    description: 'Online ordering store for household essentials, kitchenware, home & garden supplies, and smart audio gadgets. 100% Cash on Delivery across Sri Lanka.',
    url: siteUrl,
    siteName: 'NookMint',
    images: [
      {
        url: '/nookmint_images/hero.png',
        width: 1200,
        height: 630,
        alt: 'NookMint E-Commerce Store',
      },
    ],
    locale: 'en_LK',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NookMint | Home, Garden & Smart Tech Gadgets',
    description: 'Household essentials, home & garden supplies, and smart gadgets. Islandwide Cash on Delivery across Sri Lanka.',
    images: ['/nookmint_images/hero.png'],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden w-full max-w-full">
      <body className={`${plusJakartaSans.variable} ${playfairDisplay.variable} font-sans min-h-screen flex flex-col bg-white text-slate-900 antialiased overflow-x-hidden w-full max-w-full selection:bg-blue-100 selection:text-blue-900`}>
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
