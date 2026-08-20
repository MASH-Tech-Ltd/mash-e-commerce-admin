import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_PLATFORM_NAME ? `${process.env.NEXT_PUBLIC_PLATFORM_NAME} | Merchant Hub` : 'Merchant Dashboard | Multi-Tenant SaaS',
  description: 'Premium merchant dashboard for managing your SaaS store.',
  icons: {
    icon: '/MEasy.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans">
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
