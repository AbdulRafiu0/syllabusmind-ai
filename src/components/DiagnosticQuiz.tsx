'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import type { QuizQuestion, QuizResult } from '@/lib/types';

// A large bank of questions to pull from randomly
const QUESTION_BANK: QuizQuestion[] = [
  { id: 'q1', topic: 'Variables', question: 'What does this code print?\n```\na = "7"\nb = 3\nprint(a * b)\n```', options: ['21', '777', 'TypeError', '73'], correctIndex: 1 },
  { id: 'q2', topic: 'For/While Loops', question: 'What does this code print?\n```\ntotal = 0\nfor i in range(1, 4):\n    total += i\nprint(total)\n```', options: ['3', '4', '6', '10'], correctIndex: 2 },
  { id: 'q3', topic: 'Functions & Scope', question: 'What does this code print?\n```\nx = 10\n\ndef change():\n    x = 5\n    return x\n\nchange()\nprint(x)\n```', options: ['5', '10', '15', 'NameError'], correctIndex: 1 },
  { id: 'q4', topic: 'Lists & Indexing', question: 'What does this code print?\n```\ncolors = ["red", "blue", "green"]\nprint(colors[-1])\n```', options: ['red', 'blue', 'green', 'IndexError'], correctIndex: 2 },
  { id: 'q5', topic: 'Dictionaries', question: 'How do you safely update or add a new key-value pair to a dictionary `user`?\n```\nuser = {"name": "Alice"}\n```', options: ['user.add("age", 25)', 'user["age"] = 25', 'user.append("age", 25)', 'user.insert("age", 25)'], correctIndex: 1 },
  { id: 'q6', topic: 'Conditionals', question: 'What is the output of this code?\n```\nif 5 > 2:\n    print("A")\nelif 5 == 5:\n    print("B")\nelse:\n    print("C")\n```', options: ['A', 'B', 'A and B', 'C'], correctIndex: 0 },
  { id: 'q7', topic: 'Strings', question: 'What does this evaluate to?\n```\n"hello".upper()\n```', options: ['Hello', 'HELLO', 'hello', 'Error'], correctIndex: 1 },
  { id: 'q8', topic: 'Boolean Logic', question: 'What is the result of:\n```\nTrue and False\n```', options: ['True', 'False', 'None', 'Error'], correctIndex: 1 },
  { id: 'q9', topic: 'Sets', question: 'What is the length of this set?\n```\nmy_set = {1, 2, 2, 3}\nprint(len(my_set))\n```', options: ['2', '3', '4', 'Error'], correctIndex: 1 },
  { id: 'q10', topic: 'Tuples', question: 'Which of the following creates a tuple?', options: ['[1, 2, 3]', '{1, 2, 3}', '(1, 2, 3)', '<1, 2, 3>'], correctIndex: 2 },
  { id: 'q11', topic: 'List Comprehensions', question: 'What does this produce?\n```\n[x for x in range(3)]\n```', options: ['[0, 1, 2]', '[1, 2, 3]', '[0, 1, 2, 3]', 'Error'], correctIndex: 0 },
  { id: 'q12', topic: 'Modules & Imports', question: 'How do you import only the `sqrt` function from the `math` module?', options: ['import sqrt from math', 'import math.sqrt', 'from math import sqrt', 'use math:sqrt'], correctIndex: 2 },
  { id: 'q13', topic: 'Error Handling', question: 'Which keyword is used to catch exceptions in Python?', options: ['catch', 'except', 'handle', 'error'], correctIndex: 1 },
  { id: 'q14', topic: 'Functions & Scope', question: 'What does this code do?\n```\ndef greet(name="User"):\n    print(name)\n\ngreet()\n```', options: ['Prints nothing', 'Throws an error', 'Prints "User"', 'Prints "name"'], correctIndex: 2 },
  { id: 'q15', topic: 'Variables', question: 'Which data type is the result of `3 / 2` in Python 3?', options: ['int', 'float', 'double', 'decimal'], correctIndex: 1 }
];

interface DiagnosticQuizProps {
  onComplete: (result: QuizResult) => void;
}

function QuestionBody({ text }: { text: string }) {
  const [prompt, code] = text.split('```');
  return (
    <>
      <p className="text-lg font-semibold text-slate-50">{prompt.trim()}</p>
      {code && (
        <pre className="mt-3 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-sm leading-relaxed text-sky-200">
          <code>{code.trim()}</code>
        </pre>
      )}
    </>
  );
}

export default function DiagnosticQuiz({ onComplete }: DiagnosticQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  // Randomize 5 questions on mount
  useEffect(() => {
    const shuffled = [...QUESTION_BANK].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 5); // Adjust this number if you want more/fewer questions
    setQuestions(selectedQuestions);
    setAnswers(selectedQuestions.map(() => null));
  }, []);

  if (questions.length === 0) return null; // Prevents hydration mismatch

  const total = questions.length;
  const question = questions[step];
  const selected = answers[step];
  const isLast = step === total - 1;

  const selectOption = (index: number) => {
    setAnswers((prev) => prev.map((value, i) => (i === step ? index : value)));
  };

  const evaluate = () => {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) strengths.push(q.topic);
      else weaknesses.push(q.topic);
    });

    // Make sure we only pass unique topics to the prompt
    onComplete({
      totalQuestions: total,
      correctAnswers: strengths.length,
      strengths: Array.from(new Set(strengths)),
      weaknesses: Array.from(new Set(weaknesses)),
    });
  };

  const handleNext = () => {
    if (selected === null) return;
    if (isLast) evaluate();
    else setStep((s) => s + 1);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300 ring-1 ring-inset ring-sky-500/30">
          <Sparkles aria-hidden className="h-3.5 w-3.5"/>
          Python diagnostic
        </span>
        <h1 className="mt-3 text-3xl font-bold text-slate-50">Find your knowledge gaps</h1>
        <p className="mt-2 text-sm text-slate-400">
          Answer {total} quick questions and our AI will build a personalised learning roadmap.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>
              Question {step + 1} of {total}
            </span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-slate-300">
              {question.topic}
            </span>
          </div>
          <div className="mt-2 flex gap-1.5" aria-hidden>
            {questions.map((q, i) => (
              <div
                key={q.id}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-sky-500' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* This line is fixed: */}
        <QuestionBody text={question.question}/>

        <div role="radiogroup" aria-label={`Answers for question ${step + 1}`} className="mt-5 space-y-2.5">
          {question.options.map((option, index) => {
            const isSelected = selected === index;
            return (
              <label
                key={`${question.id}-${index}`}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                  isSelected
                    ? 'border-sky-500 bg-sky-500/10 ring-1 ring-sky-500/50'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  className="h-4 w-4 accent-sky-500"
                  checked={isSelected}
                  onChange={() => selectOption(index)}
                />
                <span className="font-mono text-sm text-slate-100">{option}</span>
              </label>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:invisible"
          >
            <ArrowLeft aria-hidden className="h-4 w-4"/>
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={selected === null}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLast ? 'Generate my roadmap' : 'Next'}
            <ArrowRight aria-hidden className="h-4 w-4"/>
          </button>
        </div>
      </div>
    </div>
  );
}