'use client';

import { useCallback, useRef, useState } from 'react';
import { AlertTriangle, Info, Loader2 } from 'lucide-react';
import AnalysisDashboard from '@/components/AnalysisDashboard';
import DiagnosticQuiz from '@/components/DiagnosticQuiz';
import LearningRoadmap from '@/components/LearningRoadmap';
import type {
  APIErrorPayload,
  APIRequestPayload,
  APIResponsePayload,
  QuizResult,
} from '@/lib/types';

type Stage = 'quiz' | 'loading' | 'roadmap';

export default function HomePage() {
  const [stage, setStage] = useState<Stage>('quiz');
  const [result, setResult] = useState<QuizResult | null>(null);
  const [roadmap, setRoadmap] = useState<APIResponsePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Guards against a stale response landing after the user has reset.
  const requestIdRef = useRef(0);

  const handleQuizComplete = useCallback(async (quizResult: QuizResult) => {
    const requestId = ++requestIdRef.current;
    setResult(quizResult);
    setError(null);
    setStage('loading');

    const payload: APIRequestPayload = {
      strengths: quizResult.strengths,
      weaknesses: quizResult.weaknesses,
    };

    try {
      const response = await fetch('/api/generate-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as APIResponsePayload | APIErrorPayload;
      if (requestId !== requestIdRef.current) return;

      if (!response.ok || !('nodes' in data)) {
        throw new Error('error' in data ? data.error : 'Failed to generate roadmap.');
      }

      setRoadmap(data);
      setStage('roadmap');
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStage('quiz');
    }
  }, []);

  const handleReset = useCallback(() => {
    requestIdRef.current += 1;
    setResult(null);
    setRoadmap(null);
    setError(null);
    setStage('quiz');
  }, []);

  if (stage === 'loading') {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-sky-500/20" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full border border-sky-500/40 bg-slate-900">
            <Loader2 className="h-9 w-9 animate-spin text-sky-400" aria-hidden />
          </span>
        </div>
        <p role="status" className="mt-8 max-w-md text-lg font-medium text-slate-200">
          AI is diagnosing knowledge gaps and generating your custom roadmap...
        </p>
        <p className="mt-2 text-sm text-slate-500">This usually takes a few seconds.</p>
      </main>
    );
  }

  if (stage === 'roadmap' && result && roadmap) {
    return (
      <main className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6">
        <AnalysisDashboard result={result} onReset={handleReset} />

        {roadmap.warning && (
          <p className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {roadmap.warning}
          </p>
        )}

        <div className="h-[calc(100vh-6rem)] min-h-[600px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
          <LearningRoadmap initialNodes={roadmap.nodes} initialEdges={roadmap.edges} />
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-10 sm:px-6">
      {error && (
        <div
          role="alert"
          className="mx-auto mb-6 flex max-w-2xl items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error} Please retake the quiz to try again.</span>
        </div>
      )}
      <DiagnosticQuiz onComplete={handleQuizComplete} />
    </main>
  );
}
