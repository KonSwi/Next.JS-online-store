import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NextJS Online Store',
  description: 'Etap 1 — baza projektu',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="bg-white text-black">{children}</body>
    </html>
  );
}
