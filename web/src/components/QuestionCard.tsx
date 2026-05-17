import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { InlineMath } from 'react-katex';
import type { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  onSubmit: (answer: string) => void;
  isLoading: boolean;
}

export default function QuestionCard({ question, onSubmit, isLoading }: QuestionCardProps) {
  const [answer, setAnswer] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when question changes
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [question.question_id, isLoading]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer.trim());
      setAnswer('');
    }
  };

  // Parse and render text with LaTeX
  const renderQuestion = () => {
    const parts = question.question.split(/(\$[^$]+\$)/g);

    return (
      <div className="text-xl font-medium leading-relaxed">
        {parts.map((part, index) => {
          if (part.startsWith('$') && part.endsWith('$')) {
            const math = part.slice(1, -1);
            // Check if previous part ends with ":" to add more space before equation
            const prevPart = index > 0 ? parts[index - 1] : '';
            const spacingClass = prevPart.trim().endsWith(':') ? 'ml-4' : 'ml-1';
            return (
              <span key={index} className={`inline-block ${spacingClass} text-2xl`}>
                <InlineMath math={math} />
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="card">
      <div className="mb-4">
        <span className="inline-block p-[2px] rounded-full bg-gradient-to-r from-[#6B4FFF] to-[#FF6EC7]">
          <span className="inline-block px-3 py-1 bg-surface text-sm rounded-full">
            <span className="bg-gradient-to-r from-[#6B4FFF] to-[#FF6EC7] bg-clip-text text-transparent font-medium">
              {question.skill_name}
            </span>
          </span>
        </span>
        <span className="ml-2 text-sm text-gray-400">
          Difficulty: {question.difficulty}/5
        </span>
      </div>

      <div className="mb-6 py-5">
        {renderQuestion()}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="answer" className="block text-sm font-medium mb-2">
            Your Answer
          </label>
          <input
            ref={inputRef}
            id="answer"
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-lg"
            placeholder="Enter your answer (e.g., 3, 1/2, or 1.5)"
            disabled={isLoading}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            name="quiz-answer"
            data-form-type="other"
          />
          <p className="text-sm text-gray-500 mt-2">
            Equivalent forms are accepted unless the question asks for a specific format.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !answer.trim()}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Checking...' : 'Submit Answer'}
        </button>
      </form>
    </div>
  );
}
