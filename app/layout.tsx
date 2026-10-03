import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Revenue OS',
  description: 'AI-powered operating system for building, marketing, selling, and measuring digital revenue.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}