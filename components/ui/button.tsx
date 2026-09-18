import Link from 'next/link';
import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  className?: string;
  disabled?: boolean;
  onClick?: () => void | Promise<void>;
};

const VARIANT_CLASSES = {
  primary:
    'bg-[var(--primary)] text-white hover:bg-[var(--primary-strong)]',
  secondary:
    'border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)]',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-[var(--muted)] hover:bg-[var(--accent)]',
};

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ' +
  'transition focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

export function Button({
  children,
  href,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  onClick,
}: ButtonProps) {
  const cls = `${BASE} ${VARIANT_CLASSES[variant]} ${className}`;
  if (href) {
    return (
      <Link className={cls} href={href}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
