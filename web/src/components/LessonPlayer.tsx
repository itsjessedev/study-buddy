import { useMemo, useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import { api } from '../api/client';
import type { Lesson } from '../data/lessons';

interface LessonPlayerProps {
  lesson: Lesson;
  onStartQuiz: () => void;
}

function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1/$2')
    .replace(/\\sqrt\{([^{}]+)\}/g, 'sqrt($1)')
    .replace(/\\pi|π/g, 'pi')
    .replace(/\\leq|≤/g, '<=')
    .replace(/\\geq|≥/g, '>=')
    .replace(/\\ne|\\neq|≠|=\/=/g, '!=')
    .replace(/∞|infinity/g, 'oo')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, '')
    .replace(/−/g, '-')
    .replace(/·|×/g, '*');
}

function parseNumberLike(value: string): number | null {
  const normalized = normalizeAnswer(value);
  if (!normalized) return null;

  const percentMatch = normalized.match(/^(-?\d+(?:\.\d+)?)%$/);
  if (percentMatch) {
    return Number(percentMatch[1]) / 100;
  }

  const mixedMatch = normalized.match(/^(-?\d+)&(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = Number(mixedMatch[1]);
    const numerator = Number(mixedMatch[2]);
    const denominator = Number(mixedMatch[3]);
    if (denominator === 0) return null;
    const sign = whole < 0 ? -1 : 1;
    return whole + sign * (numerator / denominator);
  }

  const fractionMatch = normalized.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    if (denominator === 0) return null;
    return numerator / denominator;
  }

  if (/^-?\d+(?:\.\d+)?$/.test(normalized)) {
    return Number(normalized);
  }

  return null;
}

function valuesEquivalent(userAnswer: string, expectedAnswer: string): boolean {
  const actual = normalizeAnswer(userAnswer);
  const expected = normalizeAnswer(expectedAnswer);
  if (actual === expected) return true;

  const actualNumber = parseNumberLike(actual);
  const expectedNumber = parseNumberLike(expected);
  if (actualNumber !== null && expectedNumber !== null) {
    return Math.abs(actualNumber - expectedNumber) < 1e-9;
  }

  if (actual.includes(',') && expected.includes(',')) {
    const cleanList = (value: string) => {
      const trimmed = (
        (value.startsWith('(') && value.endsWith(')')) ||
        (value.startsWith('[') && value.endsWith(']'))
      )
        ? value.slice(1, -1)
        : value;
      return trimmed.split(',').filter(Boolean).sort();
    };
    const actualParts = cleanList(actual);
    const expectedParts = cleanList(expected);
    return (
      actualParts.length === expectedParts.length &&
      actualParts.every((part, index) => valuesEquivalent(part, expectedParts[index]))
    );
  }

  return false;
}

function answerMatches(userAnswer: string, expectedAnswer: string) {
  return expectedAnswer.split('|').some((alternative) => valuesEquivalent(userAnswer, alternative));
}

export default function LessonPlayer({ lesson, onStartQuiz }: LessonPlayerProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [checkpointAnswer, setCheckpointAnswer] = useState('');
  const [checkpointState, setCheckpointState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false);

  const scene = lesson.scenes[sceneIndex];
  const isLastScene = sceneIndex === lesson.scenes.length - 1;
  const progress = ((sceneIndex + 1) / lesson.scenes.length) * 100;

  const canContinue = useMemo(() => {
    if (!scene.checkpoint) return true;
    return checkpointState === 'correct';
  }, [checkpointState, scene.checkpoint]);

  const resetCheckpoint = () => {
    setCheckpointAnswer('');
    setCheckpointState('idle');
    setIsCheckingAnswer(false);
  };

  const goToScene = (nextIndex: number) => {
    setSceneIndex(nextIndex);
    resetCheckpoint();
  };

  const handleCheck = async () => {
    if (!scene.checkpoint) return;

    setIsCheckingAnswer(true);
    try {
      const response = await api.post<{ is_correct: boolean }>('/questions/validate', {
        answer: checkpointAnswer,
        expected_answer: scene.checkpoint.answer,
      });
      setCheckpointState(response.is_correct ? 'correct' : 'incorrect');
    } catch {
      setCheckpointState(answerMatches(checkpointAnswer, scene.checkpoint.answer) ? 'correct' : 'incorrect');
    } finally {
      setIsCheckingAnswer(false);
    }
  };

  const handleNext = () => {
    if (!canContinue) return;
    if (isLastScene) {
      onStartQuiz();
      return;
    }
    goToScene(sceneIndex + 1);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-[#111111] shadow-2xl shadow-black/35">
      <div
        className="h-1 bg-gray-900"
        role="progressbar"
        aria-label="Lesson progress"
        aria-valuemin={0}
        aria-valuemax={lesson.scenes.length}
        aria-valuenow={sceneIndex + 1}
      >
        <div
          className="h-full bg-gradient-to-r from-accent via-primary to-secondary transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid min-h-[640px] lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col p-4 sm:p-6 lg:p-8">
          <div className="mb-5 flex flex-col gap-4 sm:mb-6">
            <div className="min-w-0">
              <p className="mb-2 text-xs font-semibold uppercase text-accent">
                Step {sceneIndex + 1} of {lesson.scenes.length}
              </p>
              <h2 className="text-2xl leading-tight text-white sm:text-3xl">{scene.title}</h2>
              <p className="mt-2 text-sm text-gray-400">{lesson.title}</p>
            </div>
            <div className="max-w-full overflow-x-auto pb-1">
              <div className="flex w-fit items-center gap-1 rounded-full border border-white/10 bg-black/30 p-1">
                {lesson.scenes.map((item, index) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => goToScene(index)}
                    className={`h-8 min-h-8 w-8 flex-none rounded-full p-0 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] ${
                      index === sceneIndex
                        ? 'bg-accent text-background'
                        : 'bg-transparent text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                    aria-label={`Go to lesson step ${index + 1}`}
                    aria-current={index === sceneIndex ? 'step' : undefined}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center py-3 sm:py-5">
            <div className="w-full max-w-3xl">
              <div className="lesson-stage relative flex aspect-[4/3] min-h-[320px] w-full items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#080808] p-5 shadow-inner shadow-black sm:aspect-[16/9] sm:min-h-[360px] sm:p-8">
                <div className="absolute left-4 top-4 flex gap-1.5" aria-hidden="true">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  <span className="h-2 w-2 rounded-full bg-primary-light" />
                  <span className="h-2 w-2 rounded-full bg-secondary" />
                </div>
                <div className="lesson-math w-full overflow-x-auto text-center text-white">
                  <BlockMath math={scene.math} />
                </div>
              </div>

              {scene.highlight && (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="text-xs font-semibold uppercase text-gray-400">Focus</div>
                  <div className="inline-flex min-h-[44px] w-fit max-w-full items-center overflow-x-auto rounded-md border border-accent/35 bg-accent/10 px-3 py-2 text-accent">
                    <InlineMath math={scene.highlight} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {scene.checkpoint && (
            <div className="rounded-lg border border-white/10 bg-black/30 p-4 sm:p-5">
              <label htmlFor="checkpoint-answer" className="mb-2 block text-sm font-medium text-white">
                {scene.checkpoint.prompt}
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="checkpoint-answer"
                  type="text"
                  value={checkpointAnswer}
                  disabled={isCheckingAnswer}
                  onChange={(event) => {
                    setCheckpointAnswer(event.target.value);
                    setCheckpointState('idle');
                  }}
                  className="min-h-[48px] flex-1 rounded-lg border border-gray-700 bg-surface px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  placeholder="Type the next step"
                  autoComplete="off"
                  aria-describedby="checkpoint-feedback"
                />
                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={!checkpointAnswer.trim() || isCheckingAnswer}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingAnswer ? 'Checking...' : 'Check'}
                </button>
              </div>

              <div id="checkpoint-feedback" className="min-h-[24px]" aria-live="polite">
                {checkpointState === 'incorrect' && (
                  <p className="mt-3 text-sm text-red-300">{scene.checkpoint.hint}</p>
                )}
                {checkpointState === 'correct' && (
                  <p className="mt-3 text-sm text-success">Correct. Keep going.</p>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goToScene(Math.max(0, sceneIndex - 1))}
              disabled={sceneIndex === 0}
              className="btn-secondary min-w-[104px] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canContinue}
              className="btn-primary min-w-[144px] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLastScene ? 'Start Lesson Quiz' : 'Next Step'}
            </button>
          </div>
        </div>

        <div className="border-t border-white/10 bg-[#0d0d0d] p-4 sm:p-6 lg:border-l lg:border-t-0">
          <div className="lg:sticky lg:top-6">
            <div className="mb-6">
              <div className="mb-2 text-xs font-semibold uppercase text-gray-400">Coach</div>
              <p className="leading-relaxed text-gray-200">{scene.narration}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-2 text-xs font-semibold uppercase text-gray-400">Why it matters</div>
              <p className="text-sm leading-relaxed text-gray-400">{lesson.focus}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
