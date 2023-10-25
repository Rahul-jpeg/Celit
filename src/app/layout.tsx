import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';
import { Toaster } from '@/components/ui/toaster';
import { cn, constructMetaData } from '@/lib/utils';
import { Inter } from 'next/font/google';
import 'react-loading-skeleton/dist/skeleton.css';
import 'simplebar-react/dist/simplebar.min.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = constructMetaData();

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
