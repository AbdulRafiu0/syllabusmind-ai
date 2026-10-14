'use client';

import { CheckCircle2, RotateCcw, Target, AlertTriangle } from 'lucide-react';
import type { QuizResult } from '@/lib/types';

interface AnalysisDashboardProps {
  result: QuizResult;
  onReset: () => void;
}

export default function AnalysisDashboard({ result, onReset }: AnalysisDashboardProps) {
  const percent =
    result.totalQuestions > 0
      ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
      : 0;

  const scoreColor =
    percent >= 80 ? 'text-emerald-400' : percent >= 50 ? 'text-amber-400' : 'text-rose-400';
  const barColor =
    percent >= 80 ? 'bg-emerald-500' : percent >= 50 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <section
      aria-label="Diagnostic analysis"
      className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="md:w-64">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <Target className="h-4 w-4" aria-hidden />
            Diagnostic score
          </div>
          <p className={`mt-1 text-5xl font-bold tabular-nums ${scoreColor}`}>{percent}%</p>
          <p className="mt-1 text-sm text-slate-400">
            {result.correctAnswers} of {result.totalQuestions} questions correct
          </p>
          <div
            className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Mastered strengths
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.strengths.length > 0 ? (
                result.strengths.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/40"
                  >
                    {topic}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">No topics mastered yet. Your roadmap will build them.</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-300">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              Weak areas needing review
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.weaknesses.length > 0 ? (
                result.weaknesses.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-rose-500/15 px-3 py-1 text-sm font-medium text-rose-300 ring-1 ring-inset ring-rose-500/40"
                  >
                    {topic}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">No weak areas. Great work!</span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-700"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Retake quiz
        </button>
      </div>
    </section>
  );
}
