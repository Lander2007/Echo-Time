import type { Metadata, Viewport } from 'next';
import './globals.css';

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Cairo:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-swiss-sans bg-[#F5F2F3] text-[#0B1026] antialiased selection:bg-[#021F94] selection:text-[#F5F2F3]"
      >
        {children}
      </body>
    </html>
  );
}
