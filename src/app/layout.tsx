'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { ValidatedSessionProvider } from '@/components/ValidatedSessionProvider';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ValidatedSessionProvider>
          {children}
        </ValidatedSessionProvider>
      </body>
    </html>
  );
}
