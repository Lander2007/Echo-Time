import type { Metadata, Viewport } from 'next';
import { Inter, IBM_Plex_Mono, Anton } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

const anton = Anton({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-anton',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ECHO TIME — University Time Bank',
  description:
    'Swiss Editorial university time-banking platform. Trade hours, not tuition. 1.00 Hour = 1.00 Echo with atomic escrow and zero barter deadlock.',
  keywords: [
    'Echo Time',
    'University Time Bank',
    'Time Banking',
    'Student Skills Exchange',
    'Atomic Escrow',
    'Swiss Editorial Design',
  ],
  authors: [{ name: 'ECHO TIME Atelier' }],
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: 'ECHO TIME — University Time Bank',
    description:
      'Swiss Editorial university time-banking platform. Trade hours, not tuition. 1.00 Hour = 1.00 Echo with atomic escrow and zero barter deadlock.',
    siteName: 'ECHO TIME',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ECHO TIME — University Time Bank',
    description: 'Swiss Editorial university time-banking platform. Trade hours, not tuition.',
  },
};

export const viewport: Viewport = {
  themeColor: '#1A1B17',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#1A1B17]">
      <body
        className={`${inter.variable} ${ibmPlexMono.variable} ${anton.variable} font-swiss-sans bg-[#1A1B17] text-[#F1EFE8] antialiased selection:bg-[#C9E54B] selection:text-[#1A1B17]`}
      >
        {children}
      </body>
    </html>
  );
}
