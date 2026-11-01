import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { portfolio } from '@/data/portfolio';
import './globals.css';

const { about } = portfolio;
const description = `${about.name} — ${about.role} at ${portfolio.identity.location}. Projects, achievements, skills and contact.`;

export const metadata: Metadata = {
  title: `${about.name} — Portfolio`,
  description,
  authors: [{ name: about.name }],
  openGraph: {
    title: `${about.name} — Portfolio`,
    description,
    type: 'profile',
  },
  twitter: { card: 'summary', title: `${about.name} — Portfolio`, description },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark light',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-ink font-sans text-paper antialiased">
        <a
          href="#main"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-paper px-4 py-2 text-[0.875rem] font-medium text-ink transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
