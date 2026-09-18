import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

type AlertTone = 'info' | 'warning' | 'danger' | 'success';

const TONE_CLASSES: Record<AlertTone, string> = {
  danger:
    'border-red-300 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100',
  warning:
    'border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100',
  success:
    'border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100',
  info:
    'border-cyan-300 bg-cyan-50 text-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-100',
};

const TONE_ICONS: Record<AlertTone, React.ElementType> = {
  danger: AlertTriangle,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

export function Alert({
  children,
  tone = 'info',
}: {
  children: React.ReactNode;
  tone?: AlertTone;
}) {
  const Icon = TONE_ICONS[tone];
  return (
    <div className={`flex gap-3 rounded-2xl border p-4 text-sm ${TONE_CLASSES[tone]}`}>
      <Icon className="mt-0.5 shrink-0" size={19} />
      <div>{children}</div>
    </div>
  );
}
