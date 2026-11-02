import type { Metadata } from 'next';
import { siteConfig } from '@/data/content';
import { SoundProvider } from '@/context/SoundContext';
import './globals.css';

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Vaigunthan SL - Cloud-Enabled Full-Stack Developer Portfolio',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(location.pathname==='/'){document.documentElement.classList.add('loading')}}catch(e){}`,
          }}
        />
      </head>
      <body className="film-grain bg-[#0a0a0a] text-[#f4f3ef]">
        <SoundProvider>{children}{modal}</SoundProvider>
      </body>
    </html>
  );
}
