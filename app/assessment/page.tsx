'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Trash2,
  Loader2,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import type { SymptomInput } from '@/types';

const STEPS = ['Symptoms', 'Details', 'Follow-up', 'Review'];

export default function Assessment() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [symptoms, setSymptoms] = useState<SymptomInput[]>([]);
  const [query, setQuery] = useState('');
  const [knownSymptoms, setKnownSymptoms] = useState<any[]>([]);
  const [customText, setCustomText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/symptoms')
      .then((r) => r.json())
      .then((j) => setKnownSymptoms(j.data || []))
      .catch(() => {});
  }, []);

  const filtered = useMemo(
    () =>
      knownSymptoms
        .filter(
          (s) =>
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.aliases?.some((a: string) => a.toLowerCase().includes(query.toLowerCase())),
        )
        .slice(0, 30),
    [knownSymptoms, query],
  );

  const addKnown = (s: any) => {
    if (!symptoms.some((x) => x.symptomId === s._id)) {
      setSymptoms((v) => [
        ...v,
        { symptomId: s._id, severity: 'mild', duration: 'less_than_24h', onset: 'gradual' },
      ]);
    }
  };

  const addCustom = () => {
    if (!customText.trim()) return;
    setSymptoms((v) => [
      ...v,
      { customText: customText.trim(), severity: 'mild', duration: 'less_than_24h', onset: 'gradual' },
    ]);
    setCustomText('');
  };

  const update = (i: number, key: keyof SymptomInput, val: string) =>
    setSymptoms((v) => v.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)));

  const remove = (i: number) => setSymptoms((v) => v.filter((_, idx) => idx !== i));

  /** Single-call submit — save + analysis happen server-side in one request */
  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms, followUpAnswers: answers }),
      });
      const j = await r.json();
      if (!r.ok) {
        setError(j.message || 'Unable to save and analyse assessment. Please try again.');
        return;
      }
      router.push(`/results/${j.data.id}`);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = step === 0 ? symptoms.length > 0 : true;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Page heading */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-[var(--primary)]">Health assessment</p>
        <h1 className="mt-1 text-2xl font-black sm:text-3xl">Tell us what you are experiencing</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          This assessment is informational. It does not diagnose disease or replace professional
          evaluation.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-1 overflow-x-auto pb-1 sm:gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex shrink-0 items-center gap-1 sm:gap-2">
            <div
              className={`grid size-8 place-items-center rounded-full text-xs font-bold transition-colors ${
                i < step
                  ? 'bg-[var(--primary)] text-white'
                  : i === step
                    ? 'bg-[var(--primary)] text-white ring-4 ring-[var(--accent)]'
                    : 'bg-[var(--accent)] text-[var(--muted)]'
              }`}
            >
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className="hidden text-xs font-semibold sm:block">{s}</span>
            {i < STEPS.length - 1 && (
              <div className="mx-1 hidden h-px w-8 bg-[var(--border)] sm:block" />
            )}
          </div>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-5">
          <Alert tone="danger">{error}</Alert>
        </div>
      )}

      <Card className="p-5 sm:p-7">
        {/* ── Step 0: Select symptoms ─────────────────────────── */}
        {step === 0 && (
          <div>
            <h2 className="text-xl font-bold">Select symptoms</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Search and select from the knowledge base, or describe a symptom not listed.
            </p>

            {/* Search box */}
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 focus-within:ring-2 focus-within:ring-[var(--primary)]">
              <Search size={18} className="shrink-0 text-[var(--muted)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search symptoms…"
                className="w-full bg-transparent py-3 outline-none"
              />
            </div>

            {/* Symptom grid */}
            <div className="mt-4 grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
              {filtered.length === 0 && (
                <p className="col-span-2 py-4 text-center text-sm text-[var(--muted)]">
                  No matching symptoms found.
                </p>
              )}
              {filtered.map((s) => (
                <button
                  key={s._id}
                  onClick={() => addKnown(s)}
                  className={`rounded-xl border p-3 text-left transition hover:border-[var(--primary)] ${
                    symptoms.some((x) => x.symptomId === s._id)
                      ? 'border-[var(--primary)] bg-[var(--accent)]'
                      : 'border-[var(--border)]'
                  }`}
                >
                  <span className="font-semibold">{s.name}</span>
                  <span className="block text-xs text-[var(--muted)]">{s.category}</span>
                </button>
              ))}
            </div>

            {/* Custom symptom input */}
            <div className="mt-6 border-t border-[var(--border)] pt-5">
              <p className="text-sm font-bold">Can&apos;t find it? Describe it</p>
              <div className="mt-2 flex gap-2">
                <input
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                  placeholder="e.g. sharp pain in lower left abdomen"
                  className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                <Button onClick={addCustom} variant="secondary">
                  <Plus size={16} /> Add
                </Button>
              </div>
            </div>

            {/* Selected chips */}
            {symptoms.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-bold">Selected ({symptoms.length})</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {symptoms.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold"
                    >
                      {knownSymptoms.find((k) => k._id === s.symptomId)?.name || s.customText}
                      <button
                        onClick={() => remove(i)}
                        aria-label="Remove symptom"
                        className="rounded-full hover:text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 1: Symptom details ──────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold">Symptom details</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              These details help the rule engine distinguish similar symptom patterns.
            </p>
            <div className="mt-6 space-y-5">
              {symptoms.map((s, i) => (
                <div key={i} className="rounded-2xl border border-[var(--border)] p-4">
                  <p className="font-bold">
                    {knownSymptoms.find((k) => k._id === s.symptomId)?.name || s.customText}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <label className="block text-sm font-semibold">
                      Severity
                      <select
                        value={s.severity}
                        onChange={(e) => update(i, 'severity', e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5"
                      >
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                      </select>
                    </label>
                    <label className="block text-sm font-semibold">
                      Duration
                      <select
                        value={s.duration}
                        onChange={(e) => update(i, 'duration', e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5"
                      >
                        <option value="less_than_24h">Less than 24 hours</option>
                        <option value="1_3_days">1–3 days</option>
                        <option value="4_7_days">4–7 days</option>
                        <option value="1_2_weeks">1–2 weeks</option>
                        <option value="more_than_2_weeks">More than 2 weeks</option>
                      </select>
                    </label>
                    <label className="block text-sm font-semibold">
                      Onset
                      <select
                        value={s.onset}
                        onChange={(e) => update(i, 'onset', e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5"
                      >
                        <option value="sudden">Sudden</option>
                        <option value="gradual">Gradual</option>
                      </select>
                    </label>
                  </div>
                  <label className="mt-3 block text-sm font-semibold">
                    Frequency / characteristics
                    <textarea
                      value={s.characteristics || ''}
                      onChange={(e) => update(i, 'characteristics', e.target.value)}
                      placeholder="Optional — e.g. worse after meals, throbbing"
                      className="mt-2 min-h-20 w-full rounded-xl border border-[var(--border)] bg-transparent p-3 outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Follow-up ───────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold">Follow-up questions</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Provide any extra context that might help the analysis.
            </p>
            <div className="mt-6 rounded-2xl bg-[var(--accent)] p-5">
              <p className="font-semibold">Safety screening</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                The analysis engine independently checks active red-flag rules against every
                symptom you submit.
              </p>
            </div>
            <label className="mt-5 block text-sm font-semibold">
              Anything else the system should know?
              <textarea
                value={answers.general || ''}
                onChange={(e) => setAnswers({ ...answers, general: e.target.value })}
                className="mt-2 min-h-32 w-full rounded-xl border border-[var(--border)] bg-transparent p-3 outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Optional context — medical history, medications, allergies, etc."
              />
            </label>
          </div>
        )}

        {/* ── Step 3: Review ──────────────────────────────────── */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold">Review before analysis</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Confirm your symptoms and details before submitting.
            </p>
            <div className="mt-5 space-y-3">
              {symptoms.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] p-4"
                >
                  <div>
                    <p className="font-semibold">
                      {knownSymptoms.find((k) => k._id === s.symptomId)?.name || s.customText}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      {s.severity} severity · {s.duration.replaceAll('_', ' ')} · {s.onset} onset
                    </p>
                  </div>
                  <Check className="text-[var(--primary)]" size={18} />
                </div>
              ))}
            </div>
            <div className="mt-5">
              <Alert tone="info">
                <strong>Before you submit:</strong> A rule match is not a diagnosis. If you have an
                emergency warning sign, seek urgent professional or emergency medical attention.
              </Alert>
            </div>
          </div>
        )}

        {/* Navigation footer */}
        <div className="mt-8 flex justify-between gap-3 border-t border-[var(--border)] pt-5">
          <Button
            variant="secondary"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ChevronLeft size={17} /> Back
          </Button>

          {step < 3 ? (
            <Button disabled={!canProceed} onClick={() => setStep((s) => Math.min(3, s + 1))}>
              Continue <ChevronRight size={17} />
            </Button>
          ) : (
            <Button disabled={loading} onClick={submit}>
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" /> Analysing…
                </>
              ) : (
                <>
                  <ClipboardList size={17} /> Submit &amp; analyse
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </main>
  );
}
