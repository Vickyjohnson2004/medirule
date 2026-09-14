import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'MediRule — Rule-Based Health Advisory',
  description: 'An explainable rule-based health advisory and symptom analysis system.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body><ThemeProvider><SiteHeader />{children}</ThemeProvider></body></html>;
}
