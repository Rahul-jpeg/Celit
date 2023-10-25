import { cn } from '@/lib/utils';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';
import 'react-loading-skeleton/dist/skeleton.css';
import { Toaster } from '@/components/ui/toaster';
import 'simplebar-react/dist/simplebar.min.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Celit | PDF whisperer',
  description: 'Talk to your PDFs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <Providers>
        <body
          className={cn(
            'antialiased min-h-screen font-sans grainy',
            inter.className,
          )}
        >
          <Toaster />
          <Navbar />
          {children}
        </body>
      </Providers>
    </html>
  );
}
