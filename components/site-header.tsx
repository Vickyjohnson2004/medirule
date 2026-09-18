'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from './theme-provider';

const navLinks = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/health-info', label: 'Health education' },
  { href: '/history', label: 'My assessments' },
];

export function SiteHeader() {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-[var(--primary)] text-white">
            <Activity size={19} />
          </span>
          <span>MediRule</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded-xl border border-[var(--border)] px-4 py-2 transition hover:bg-[var(--accent)]"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-[var(--primary)] px-4 py-2 font-semibold text-white transition hover:bg-[var(--primary-strong)]"
          >
            Get started
          </Link>
        </nav>

        {/* Right-side actions */}
        <div className="flex items-center gap-2">
          <button
            aria-label="Toggle dark mode"
            onClick={toggle}
            className="rounded-xl border border-[var(--border)] p-2 transition hover:bg-[var(--accent)]"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Mobile hamburger */}
          <button
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-xl border border-[var(--border)] p-2 transition hover:bg-[var(--accent)] md:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--background)] px-4 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-[var(--muted)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-center text-sm font-semibold hover:bg-[var(--accent)]"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[var(--primary-strong)]"
              >
                Get started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
