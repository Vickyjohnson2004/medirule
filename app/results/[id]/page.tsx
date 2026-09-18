'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Download,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Info,
  HeartPulse,
  Stethoscope,
} from 'lucide-react';

const RISK_COLORS: Record<string, string> = {
  emergency: 'bg-red-500',
  high: 'bg-orange-500',
  moderate: 'bg-amber-400',
  low: 'bg-emerald-500',
};

const RISK_WIDTH: Record<string, string> = {
  emergency: 'w-full',
  high: 'w-3/4',
  moderate: 'w-1/2',
  low: 'w-1/4',
};

function RiskGauge({ level }: { level: string }) {
  const color = RISK_COLORS[level] ?? 'bg-slate-400';
  const width = RISK_WIDTH[level] ?? 'w-1/4';
  return (
    <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-[var(--accent)]">
      <div className={`h-3 rounded-full transition-all duration-700 ${color} ${width}`} />
    </div>
  );
}

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/assessments/${id}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.data) setData(j.data);
        else setError('Unable to load results.');
        setLoading(false);
      })
      .catch(() => {
        setError('Network error — please refresh.');
        setLoading(false);
      });
  }, [id]);

  /* ── Loading skeleton ──────────────────────────────────────── */
  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mb-6 h-8 w-48 animate-pulse rounded-xl bg-[var(--accent)]" />
        <Card className="p-8">
          <div className="h-5 w-32 animate-pulse rounded bg-[var(--accent)]" />
          <div className="mt-5 h-3 animate-pulse rounded-full bg-[var(--accent)]" />
          <div className="mt-8 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-[var(--accent)]" />
            ))}
          </div>
        </Card>
      </main>
    );
  }

  /* ── Error ──────────────────────────────────────────────────── */
  if (error || !data) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Alert tone="danger">{error || 'Something went wrong.'}</Alert>
        <div className="mt-5">
          <Button href="/history" variant="secondary">
            <ArrowLeft size={16} /> Back to history
          </Button>
        </div>
      </main>
    );
  }

  /* ── No result yet ──────────────────────────────────────────── */
  if (!data.result) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Alert tone="warning">
          <strong>Analysis pending.</strong> This assessment has not yet produced a result. Please
          try refreshing in a moment, or contact support if this persists.
        </Alert>
        <div className="mt-5">
          <Button href="/history" variant="secondary">
            <ArrowLeft size={16} /> Back to history
          </Button>
        </div>
      </main>
    );
  }

  const r = data.result;
  const riskTone =
    r.riskLevel === 'emergency' || r.riskLevel === 'high'
      ? 'danger'
      : r.riskLevel === 'moderate'
        ? 'warning'
        : 'success';

  /* ── Main results view ──────────────────────────────────────── */
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header row */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-[var(--primary)]">Assessment results</p>
          <h1 className="mt-1 text-2xl font-black sm:text-3xl">Your rule-based health advisory</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/history" variant="secondary">
            <ArrowLeft size={16} /> History
          </Button>
          <a
            href={`/api/reports/${id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)]"
          >
            <Download size={16} /> PDF report
          </a>
        </div>
      </div>

      {/* Red-flag emergency banner */}
      {r.redFlags?.length > 0 && (
        <div className="mt-6">
          <Alert tone="danger">
            <h2 className="font-black">Urgent medical attention recommended</h2>
            <p className="mt-1">
              The information submitted includes a symptom that may require urgent professional
              evaluation. Do not rely on this system to assess an emergency.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              {r.redFlags.map((f: any) => (
                <li key={f.name}>
                  <strong>{f.name}:</strong> {f.message}
                </li>
              ))}
            </ul>
          </Alert>
        </div>
      )}

      {/* Risk level card */}
      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-[var(--border)] p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <HeartPulse size={16} />
                Risk level
              </div>
              <p className="mt-1 text-3xl font-black capitalize">{r.riskLevel}</p>
              <RiskGauge level={r.riskLevel} />
            </div>
            <Badge tone={riskTone as any}>{r.riskLevel.toUpperCase()}</Badge>
          </div>
          <p className="mt-4 text-xs text-[var(--muted)]">
            Risk classification is an application-level safety category, not a medical diagnosis or
            probability.
          </p>
        </div>

        {/* Matched patterns */}
        <div className="p-6">
          <div className="flex items-center gap-2">
            <Stethoscope size={20} className="text-[var(--primary)]" />
            <h2 className="text-xl font-bold">Possible health patterns</h2>
          </div>

          {r.noMatch ? (
            <div className="mt-4">
              <Alert tone="warning">
                <strong>No sufficiently matching health pattern was found.</strong>
                <p className="mt-1">
                  The current knowledge base does not contain enough information to confidently
                  match your symptoms to a predefined pattern. Consider evaluation by a qualified
                  healthcare professional.
                </p>
              </Alert>
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              {r.ruleVersionSnapshot?.map((m: any) => {
                const pct = m.maxScore > 0 ? Math.round((m.score / m.maxScore) * 100) : 0;
                return (
                  <Card key={m.ruleId} className="overflow-hidden p-0">
                    {/* Condition banner */}
                    {m.conditionName && m.conditionName !== m.name && (
                      <div className="border-b border-[var(--border)] bg-[var(--accent)] px-5 py-2.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                          Condition / disease
                        </p>
                        <p className="mt-0.5 font-bold">{m.conditionName}</p>
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
                        <div className="min-w-0">
                          <Badge tone="info">Rule match</Badge>
                          <h3 className="mt-2 text-lg font-bold">{m.name}</h3>
                          {m.description && (
                            <p className="mt-1 text-sm text-[var(--muted)]">{m.description}</p>
                          )}
                        </div>
                        <div className="shrink-0 text-left sm:text-right">
                          <p className="text-2xl font-black">
                            {m.score}
                            <span className="text-sm font-normal text-[var(--muted)]">
                              {' '}
                              / {m.maxScore}
                            </span>
                          </p>
                          <p className="text-xs text-[var(--muted)]">
                            threshold {m.minimumScore} · v{m.version}
                          </p>
                        </div>
                      </div>

                      {/* Score bar */}
                      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--accent)]">
                        <div
                          className="h-2 rounded-full bg-[var(--primary)] transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-[var(--muted)]">{pct}% match score</p>

                      {/* Matched / missing symptoms */}
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                            Matched symptoms
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {m.matchedSymptoms?.length > 0 ? (
                              m.matchedSymptoms.map((x: string) => (
                                <span
                                  key={x}
                                  className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                                >
                                  <CheckCircle2 size={12} />
                                  {x}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-[var(--muted)]">
                                No named symptoms in this rule.
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                            Missing from rule
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {m.missingSymptoms?.length > 0 ? (
                              m.missingSymptoms.map((x: string) => (
                                <span
                                  key={x}
                                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold dark:bg-slate-800"
                                >
                                  {x}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-[var(--muted)]">
                                No required symptoms missing.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Explanation */}
                      {m.explanation && (
                        <div className="mt-5 rounded-xl bg-[var(--accent)] p-4 text-sm">
                          <strong>Why it matched: </strong>
                          {m.explanation}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Advisory */}
      <Card className="mt-6 p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Info size={20} className="text-[var(--primary)]" />
          Health advisory
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{r.advisory}</p>
      </Card>

      {/* Unknown symptoms */}
      {r.unknownSymptoms?.length > 0 && (
        <div className="mt-6">
          <Alert tone="warning">
            <strong>Some symptoms were not confidently classified.</strong>
            <p className="mt-1">
              {r.unknownSymptoms.join(', ')}. These have been recorded for knowledge-base review
              and may limit the precision of this assessment.
            </p>
          </Alert>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6">
        <Alert tone="info">
          <strong>Important: </strong>
          {r.disclaimer}
        </Alert>
      </div>

      {/* Bottom actions */}
      <div className="mt-8 flex flex-wrap gap-3 border-t border-[var(--border)] pt-6">
        <Button href="/assessment" variant="primary">
          Start new assessment
        </Button>
        <Button href="/history" variant="secondary">
          <ArrowLeft size={16} /> View all history
        </Button>
      </div>
    </main>
  );
}
