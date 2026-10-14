'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ExternalLink, PartyPopper, X, XCircle } from 'lucide-react';
import type { RoadmapNodeData } from '@/lib/types';

interface MicroLessonModalProps {
  nodeData: RoadmapNodeData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Feedback = 'idle' | 'wrong' | 'correct';

const SUCCESS_DELAY_MS = 1500;

export default function MicroLessonModal({
  nodeData,
  isOpen,
  onClose,
  onSuccess,
}: MicroLessonModalProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset whenever the modal opens for a lesson; clear any pending timer on unmount/close.
  useEffect(() => {
    if (isOpen) {
      setSelected(null);
      setFeedback('idle');
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen, nodeData?.label]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !nodeData) return null;

  const { practiceQuestion } = nodeData;
  const isCorrect = feedback === 'correct';

  const handleSubmit = () => {
    if (selected === null || isCorrect) return;

    if (selected === practiceQuestion.correctIndex) {
      setFeedback('correct');
      timerRef.current = setTimeout(() => {
        onSuccess();
        onClose();
      }, SUCCESS_DELAY_MS);
    } else {
      setFeedback('wrong');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="micro-lesson-title"
        className="pop-in relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close micro-lesson"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
        >
          <X className="h-5 w-5" />
        </button>

        <span className="inline-flex items-center rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-medium text-rose-300 ring-1 ring-inset ring-rose-500/40">
          Micro-lesson
        </span>
        <h2 id="micro-lesson-title" className="mt-3 pr-8 text-xl font-bold text-slate-50">
          {nodeData.label}
        </h2>

        <a
          href={nodeData.resourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-200 transition hover:border-sky-400/60 hover:bg-sky-500/20"
        >
          <span>
            <span className="block text-xs uppercase tracking-wide text-sky-300/70">
              Recommended resource
            </span>
            <span className="font-medium">{nodeData.resourceTitle}</span>
          </span>
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
        </a>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Practice question
          </p>
          <p className="mt-2 whitespace-pre-wrap text-base font-medium text-slate-100">
            {practiceQuestion.question}
          </p>

          <div role="radiogroup" aria-label="Answer options" className="mt-4 space-y-2">
            {practiceQuestion.options.map((option, index) => {
              const isSelected = selected === index;
              const showWrong = feedback === 'wrong' && isSelected;
              const showRight = isCorrect && index === practiceQuestion.correctIndex;

              let style = 'border-slate-700 bg-slate-800/60 hover:border-slate-500';
              if (showRight) style = 'border-emerald-500 bg-emerald-500/15';
              else if (showWrong) style = 'border-rose-500 bg-rose-500/15';
              else if (isSelected) style = 'border-sky-500 bg-sky-500/15';

              return (
                <label
                  key={`${index}-${option}`}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${style} ${
                    isCorrect ? 'pointer-events-none' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="practice-answer"
                    className="h-4 w-4 accent-sky-500"
                    checked={isSelected}
                    disabled={isCorrect}
                    onChange={() => {
                      setSelected(index);
                      if (feedback === 'wrong') setFeedback('idle');
                    }}
                  />
                  <span className="text-slate-100">{option}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div aria-live="polite" className="mt-4 min-h-[2.5rem]">
          {feedback === 'wrong' && (
            <p className="flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              <XCircle className="h-4 w-4 shrink-0" aria-hidden />
              Not quite. Review the resource above and try again.
            </p>
          )}
          {isCorrect && (
            <p className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300">
              <PartyPopper className="h-5 w-5 shrink-0 animate-bounce" aria-hidden />
              Correct! You have mastered {nodeData.label}.
            </p>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selected === null || isCorrect}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isCorrect && <CheckCircle2 className="h-4 w-4" aria-hidden />}
            Submit answer
          </button>
        </div>
      </div>
    </div>
  );
}
