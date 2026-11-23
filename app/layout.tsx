import type { Metadata, Viewport } from 'next';
import { Inter, IBM_Plex_Mono, Anton, Cairo } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

const anton = Anton({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-anton',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  weight: ['600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Echo Time – Your Time. Your Opportunities.',
  description:
    'Discover student skills, exchange time credits, find your next collaborator, and build your portfolio with Echo Time.',
  keywords: [
    'Echo Time',
    'Student skill-exchange platform',
    'Time credits',
    'University skill sharing',
    'Student collaboration',
    'Student portfolio',
  ],
  authors: [{ name: 'Echo Time' }],
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: 'Echo Time – Your Time. Your Opportunities.',
    description:
      'Discover student skills, exchange time credits, find your next collaborator, and build your portfolio with Echo Time.',
    siteName: 'Echo Time',
    type: 'website',
    url: 'https://echotime-gdoud7zw.manus.space/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Echo Time – Your Time. Your Opportunities.',
    description:
      'Discover student skills, exchange time credits, find your next collaborator, and build your portfolio with Echo Time.',
  },
};

export const viewport: Viewport = {
  themeColor: '#F5F2F3',
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#F5F2F3]">
      <body
        className={`${inter.variable} ${ibmPlexMono.variable} ${anton.variable} ${cairo.variable} font-swiss-sans bg-[#F5F2F3] text-[#0B1026] antialiased selection:bg-[#021F94] selection:text-[#F5F2F3]`}
      >
        {children}
      </body>
    </html>
  );
}
