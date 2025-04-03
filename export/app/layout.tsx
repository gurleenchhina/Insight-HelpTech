import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HelpTech Pest Control',
  description: 'Pest control recommendations for technicians in Ontario, Canada',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-background">
          <header className="bg-primary text-white p-4">
            <div className="container mx-auto">
              <h1 className="text-2xl font-bold">HelpTech</h1>
              <p className="text-sm">Pest Control Solutions</p>
            </div>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}