import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/sonner';
import Link from 'next/link';
import { Github } from 'lucide-react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SoloCal',
  description:
    'Your personal appointment scheduling hub. Easily create custom events and share your unique booking link for others to schedule appointments with you, hassle-free.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang='en' className='h-full'>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased animate-fade-in flex flex-col min-h-screen`}
        >
          <main className='flex-grow'>{children}</main>
          <footer className='bg-card text-card-foreground p-4 text-center mt-12'>
            {' '}
            {/* bg-card for background, text-card-foreground for text, mt-auto pushes it down */}
            <div className='container mx-auto'>
              <p className='text-sm'>
                &copy; {new Date().getFullYear()} SoloCal. All rights reserved.
              </p>
              <nav className='mt-2'>
                <ul className='flex justify-center space-x-4 text-sm'>
                  <li>
                    <Link
                      href='/privacy-policy'
                      className='text-secondary-foreground hover:text-accent transition-colors duration-200' // Using SoloCal palette colors
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='https://github.com/SilentStorm2k/'
                      className='text-secondary-foreground hover:text-accent transition-colors duration-200 flex gap-0.5 justify-center items-center' // Using SoloCal palette colors
                    >
                      <Github size={14} strokeWidth={1.75} /> Github
                    </Link>
                  </li>
                  {/* Add other legal links as needed */}
                </ul>
              </nav>
            </div>
          </footer>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
