import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ToastProvider from '@/components/ToastProvider';

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
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
