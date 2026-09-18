'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Trash2, ArrowRight, ClipboardList } from 'lucide-react';

const RISK_TONE: Record<string, 'danger' | 'warning' | 'success'> = {
  emergency: 'danger',
  high: 'danger',
  moderate: 'warning',
  low: 'success',
};

export default function History() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/assessments')
      .then((r) => r.json())
      .then((j) => {
        setRows(j.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Unable to load history. Please refresh.');
        setLoading(false);
      });
  }, []);

  const remove = async (id: string) => {
    if (!confirm('Delete this assessment? This cannot be undone.')) return;
    await fetch(`/api/assessments/${id}`, { method: 'DELETE' });
    setRows((v) => v.filter((x) => x._id !== id));
  };

  const filtered =
    filter === 'all' ? rows : rows.filter((r) => r.riskLevel === filter || (!r.riskLevel && filter === 'pending'));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--primary)]">Private history</p>
          <h1 className="mt-1 text-2xl font-black sm:text-3xl">Assessment history</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {rows.length} assessment{rows.length !== 1 ? 's' : ''} recorded.
          </p>
        </div>
        <Button href="/assessment">
          <ClipboardList size={16} /> New assessment
        </Button>
      </div>

      {/* Risk filter pills */}
      {!loading && rows.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {['all', 'emergency', 'high', 'moderate', 'low', 'pending'].map((v) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filter === v
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--accent)] text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-5">
          <Alert tone="danger">{error}</Alert>
        </div>
      )}

      {/* List */}
      <div className="mt-6 space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <Card key={i} className="h-24 animate-pulse bg-[var(--accent)]">{null}</Card>
          ))
        ) : filtered.length === 0 ? (
          <Card className="p-10 text-center">
            <ClipboardList className="mx-auto text-[var(--muted)]" size={40} />
            <p className="mt-3 font-bold">
              {rows.length === 0 ? 'No assessments yet.' : 'No matching assessments.'}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {rows.length === 0
                ? 'Your completed assessments will appear here.'
                : 'Try a different filter.'}
            </p>
            {rows.length === 0 && (
              <div className="mt-5">
                <Button href="/assessment">Start your first assessment</Button>
              </div>
            )}
          </Card>
        ) : (
          filtered.map((r) => (
            <Card key={r._id} className="p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      tone={r.riskLevel ? (RISK_TONE[r.riskLevel] ?? 'success') : 'info'}
                    >
                      {r.riskLevel ? r.riskLevel.charAt(0).toUpperCase() + r.riskLevel.slice(1) : 'Pending'}
                    </Badge>
                    <span className="text-sm text-[var(--muted)]">
                      {r.symptoms?.length || 0} symptom{r.symptoms?.length !== 1 ? 's' : ''} reported
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {new Date(r.createdAt).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/results/${r._id}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold transition hover:bg-[var(--accent)]"
                  >
                    View results <ArrowRight size={15} />
                  </Link>
                  <button
                    onClick={() => remove(r._id)}
                    className="rounded-xl border border-red-200 px-3 py-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                    aria-label="Delete assessment"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
