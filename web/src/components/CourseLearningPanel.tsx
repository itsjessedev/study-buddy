import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { ProgressSummary, Skill } from '../types';
import LessonPlayer from './LessonPlayer';
import { LESSONS } from '../data/lessons';

interface CourseLearningPanelProps {
  onStartQuiz: (skillId: number) => void;
}

const LESSON_COMPLETE_STORAGE_KEY = 'study-buddy-guided-lesson-completions';
const READY_MASTERY_SCORE = 70;

function loadLessonCompletions(): string[] {
  try {
    const stored = localStorage.getItem(LESSON_COMPLETE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function CourseLearningPanel({ onStartQuiz }: CourseLearningPanelProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [lessonCompletions, setLessonCompletions] = useState<string[]>(() => loadLessonCompletions());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const masteryBySkillId = new Map(
    progress?.mastery_by_skill.map((mastery) => [mastery.skill_id, mastery]) ?? []
  );

  const guidedSkill = skills.find((skill) => {
    const mastery = masteryBySkillId.get(skill.id)?.mastery_score ?? 0;
    const lessonComplete = lessonCompletions.includes(skill.slug);
    return !lessonComplete || mastery < READY_MASTERY_SCORE;
  }) ?? skills[skills.length - 1];
  const guidedSkillId = guidedSkill?.id ?? null;

  const selectedSkill = skills.find((skill) => skill.id === selectedSkillId) ?? guidedSkill ?? skills[0];
  const selectedLesson = selectedSkill ? LESSONS[selectedSkill.slug] : null;
  const selectedIndex = selectedSkill ? skills.findIndex((skill) => skill.id === selectedSkill.id) : -1;
  const pathWindowStart = Math.max(0, selectedIndex - 2);
  const pathWindowEnd = Math.min(skills.length, selectedIndex + 6);
  const visiblePathSkills = skills.slice(pathWindowStart, pathWindowEnd);
  const selectedMastery = selectedSkill ? masteryBySkillId.get(selectedSkill.id)?.mastery_score ?? 0 : 0;
  const selectedLessonComplete = selectedSkill ? lessonCompletions.includes(selectedSkill.slug) : false;
  const completedSteps = skills.filter((skill) => {
    const mastery = masteryBySkillId.get(skill.id)?.mastery_score ?? 0;
    return lessonCompletions.includes(skill.slug) && mastery >= READY_MASTERY_SCORE;
  }).length;
  const pathProgress = skills.length > 0 ? Math.round((completedSteps / skills.length) * 100) : 0;

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const [skillsResponse, progressResponse] = await Promise.all([
          api.get<{ skills: Skill[] }>('/skills'),
          api.get<ProgressSummary>('/progress'),
        ]);
        setSkills(skillsResponse.skills);
        setProgress(progressResponse);
        setError(null);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load lessons');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, []);

  useEffect(() => {
    if (guidedSkillId !== null) {
      setSelectedSkillId(guidedSkillId);
    }
  }, [guidedSkillId]);

  const markLessonComplete = (skill: Skill) => {
    setLessonCompletions((current) => {
      if (current.includes(skill.slug)) return current;
      const next = [...current, skill.slug];
      localStorage.setItem(LESSON_COMPLETE_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleStartQuiz = () => {
    if (!selectedSkill) return;
    markLessonComplete(selectedSkill);
    onStartQuiz(selectedSkill.id);
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-white/10 bg-surface py-12 text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="text-gray-400">Loading lessons...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-12 text-center">
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  if (!selectedSkill || !selectedLesson) {
    return (
      <div className="rounded-lg border border-white/10 bg-surface px-4 py-12 text-center">
        <p className="text-gray-400">No lessons are available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-lg border border-white/10 bg-[#111111] shadow-lg shadow-black/20">
        <div className="border-b border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-accent">Guided Calc I readiness path</p>
              <h2 className="text-xl leading-tight text-white">
                {selectedLessonComplete && selectedMastery < READY_MASTERY_SCORE
                  ? `Quiz practice: ${selectedSkill.name}`
                  : `Next lesson: ${selectedSkill.name}`}
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Step {selectedIndex + 1} of {skills.length}. Study Buddy advances when the lesson is done and your quiz mastery is at least {READY_MASTERY_SCORE}%.
              </p>
            </div>
            {selectedLessonComplete && (
              <button
                type="button"
                onClick={handleStartQuiz}
                className="btn-secondary w-full sm:w-auto"
              >
                Continue Quiz Practice
              </button>
            )}
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-black/40" aria-label="Guided path progress">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent via-primary to-secondary transition-[width] duration-500"
              style={{ width: `${pathProgress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>{completedSteps} ready</span>
            <span>{skills.length - completedSteps} remaining</span>
          </div>
        </div>

        <div className="grid gap-2 p-3 sm:grid-cols-2">
          {pathWindowStart > 0 && (
            <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-center text-xs text-gray-500 sm:col-span-2">
              {pathWindowStart} earlier topic{pathWindowStart === 1 ? '' : 's'} already in the path
            </div>
          )}
          {visiblePathSkills.map((skill) => {
            const index = skills.findIndex((pathSkill) => pathSkill.id === skill.id);
            const mastery = masteryBySkillId.get(skill.id)?.mastery_score ?? 0;
            const lessonComplete = lessonCompletions.includes(skill.slug);
            const isReady = lessonComplete && mastery >= READY_MASTERY_SCORE;
            const isCurrent = skill.id === selectedSkill.id;
            const status = isReady
              ? 'Ready'
              : isCurrent && lessonComplete
                ? 'Quiz needed'
                : isCurrent
                  ? 'Current'
                  : 'Upcoming';

            return (
            <div
              key={skill.id}
              className={`flex min-h-[72px] items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                isCurrent
                  ? 'border-accent/70 bg-accent/10 text-white shadow-sm shadow-accent/10'
                  : isReady
                    ? 'border-success/30 bg-success/10 text-gray-200'
                    : 'border-white/10 bg-black/25 text-gray-500'
              }`}
            >
              <div
                className={`flex h-8 w-8 flex-none items-center justify-center rounded-full border text-xs font-semibold ${
                  isReady
                    ? 'border-success/60 bg-success/20 text-success'
                    : isCurrent
                      ? 'border-accent/70 bg-accent text-background'
                      : 'border-white/10 bg-black/30 text-gray-500'
                }`}
              >
                {isReady ? '✓' : index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-1 font-medium">{skill.name}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <span>{status}</span>
                  <span aria-hidden="true">·</span>
                  <span>{Math.round(mastery)}% mastery</span>
                </div>
              </div>
            </div>
            );
          })}
          {pathWindowEnd < skills.length && (
            <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-center text-xs text-gray-500 sm:col-span-2">
              {skills.length - pathWindowEnd} later topic{skills.length - pathWindowEnd === 1 ? '' : 's'} queued after this stretch
            </div>
          )}
        </div>
      </div>

      <LessonPlayer
        key={selectedSkill.slug}
        lesson={selectedLesson}
        onStartQuiz={handleStartQuiz}
      />
    </div>
  );
}
