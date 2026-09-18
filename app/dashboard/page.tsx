import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Assessment from '@/models/Assessment';
import { Card } from '@/components/ui/card';
import { LogoutButton } from '@/components/logout-button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Clock3,
  ShieldCheck,
  ArrowRight,
  HeartPulse,
  TrendingUp,
} from 'lucide-react';

async function getStats(userId: string) {
  try {
    await connectDB();
    const [total, analyzed, last] = await Promise.all([
      Assessment.countDocuments({ userId }),
      Assessment.countDocuments({ userId, status: 'analyzed' }),
      Assessment.findOne({ userId }).sort({ createdAt: -1 }).select('createdAt riskLevel').lean(),
    ]);
    return { total, analyzed, last };
  } catch {
    return { total: 0, analyzed: 0, last: null };
  }
}

const RISK_TONE: Record<string, 'danger' | 'warning' | 'success'> = {
  emergency: 'danger',
  high: 'danger',
  moderate: 'warning',
  low: 'success',
};

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const stats = await getStats(String(user._id));

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Welcome header */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-[var(--muted)]">Patient workspace</p>
          <h1 className="mt-1 text-2xl font-black sm:text-3xl">
            Good to see you, {user.name.split(' ')[0]}.
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            Use MediRule to organize reported symptoms and review explainable health advisories.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/assessment">
            Start assessment <ArrowRight size={17} />
          </Button>
          {user.role === 'admin' && (
            <Button href="/admin" variant="secondary">
              Admin dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-5">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--accent)] text-[var(--primary)]">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-2xl font-black">{stats.total}</p>
            <p className="text-sm text-[var(--muted)]">Total assessments</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--accent)] text-[var(--primary)]">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-2xl font-black">{stats.analyzed}</p>
            <p className="text-sm text-[var(--muted)]">Analysed</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--accent)] text-[var(--primary)]">
            <HeartPulse size={22} />
          </div>
          <div>
            {stats.last ? (
              <>
                <div className="flex items-center gap-2">
                  {stats.last.riskLevel && (
                    <Badge tone={RISK_TONE[stats.last.riskLevel] ?? 'success'}>
                      {stats.last.riskLevel}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Last:{' '}
                  {new Date(stats.last.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </>
            ) : (
              <p className="text-sm text-[var(--muted)]">No assessments yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* Feature cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--muted)]">Assessment flow</span>
            <Activity className="text-[var(--primary)]" size={20} />
          </div>
          <p className="mt-3 font-bold">Step-by-step</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Symptoms → details → safety screening → analysis.
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--muted)]">Explainability</span>
            <ShieldCheck className="text-[var(--primary)]" size={20} />
          </div>
          <p className="mt-3 font-bold">No black box</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            See matched symptoms, condition names, and rule thresholds.
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--muted)]">History</span>
            <Clock3 className="text-[var(--primary)]" size={20} />
          </div>
          <Link
            href="/history"
            className="mt-3 inline-flex items-center gap-1 font-bold text-[var(--primary)] hover:underline"
          >
            View assessments <ArrowRight size={16} />
          </Link>
        </Card>
      </div>

      {/* Tips */}
      <Card className="mt-6 p-7">
        <h2 className="text-xl font-bold">Before you begin</h2>
        <ul className="mt-4 grid gap-3 text-sm text-[var(--muted)] md:grid-cols-3">
          <li className="rounded-xl bg-[var(--accent)] p-4">
            Report what you actually experience. Avoid guessing.
          </li>
          <li className="rounded-xl bg-[var(--accent)] p-4">
            Custom symptoms can be saved for knowledge-base review.
          </li>
          <li className="rounded-xl bg-[var(--accent)] p-4">
            Emergency warning signs should be handled by urgent professional care.
          </li>
        </ul>
      </Card>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </main>
  );
}
