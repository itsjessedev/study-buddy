import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Skill } from '../types';
import LessonPlayer from './LessonPlayer';
import { LESSONS } from '../data/lessons';

interface CourseLearningPanelProps {
  onStartQuiz: (skillId: number) => void;
}

export default function CourseLearningPanel({ onStartQuiz }: CourseLearningPanelProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedSkill = skills.find((skill) => skill.id === selectedSkillId) ?? skills[0];
  const selectedLesson = selectedSkill ? LESSONS[selectedSkill.slug] : null;

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await api.get<{ skills: Skill[] }>('/skills');
        setSkills(response.skills);
        setSelectedSkillId(response.skills[0]?.id ?? null);
        setError(null);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load lessons');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, []);

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
      <div className="rounded-lg border border-white/10 bg-[#111111] p-3 shadow-lg shadow-black/20">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <div>
            <p className="text-xs font-semibold uppercase text-accent">Course path</p>
            <h2 className="text-lg leading-tight text-white">Choose a lesson</h2>
          </div>
          <p className="hidden text-sm text-gray-500 sm:block">{skills.length} topics</p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {skills.map((skill) => (
            <button
              key={skill.id}
              type="button"
              onClick={() => setSelectedSkillId(skill.id)}
              className={`min-h-[64px] rounded-lg border px-3 py-2 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] ${
                selectedSkill.id === skill.id
                  ? 'border-accent/80 bg-accent/10 text-white shadow-sm shadow-accent/10'
                  : 'border-white/10 bg-black/30 text-gray-400 hover:border-gray-600 hover:text-gray-100'
              }`}
              aria-pressed={selectedSkill.id === skill.id}
            >
              <span className="line-clamp-2 leading-snug">{skill.name}</span>
            </button>
          ))}
        </div>
      </div>

      <LessonPlayer
        lesson={selectedLesson}
        onStartQuiz={() => onStartQuiz(selectedSkill.id)}
      />
    </div>
  );
}
