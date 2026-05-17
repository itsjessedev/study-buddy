import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useQuizStore } from '../store/quizStore';
import { useEvaluationStore } from '../store/evaluationStore';
import QuestionCard from '../components/QuestionCard';
import FeedbackModal from '../components/FeedbackModal';
import SkillSelector from '../components/SkillSelector';
import ReportCard from '../components/ReportCard';
import Tutorial from '../components/Tutorial';
import EvaluationProgress from '../components/EvaluationProgress';
import StreakIndicator from '../components/StreakIndicator';
import CourseLearningPanel from '../components/CourseLearningPanel';

type Mode = 'learn' | 'practice' | 'evaluation';

const TUTORIAL_STORAGE_KEY_PREFIX = 'study-buddy-tutorial-completed-';

export default function Quiz() {
  const { user, logout } = useAuthStore();
  const [searchParams] = useSearchParams();
  const initialMode: Mode = searchParams.get('mode') === 'practice'
    ? 'practice'
    : searchParams.get('mode') === 'evaluation'
      ? 'evaluation'
      : 'learn';
  const [mode, setMode] = useState<Mode>(initialMode);
  const [showSectionToast, setShowSectionToast] = useState(false);
  const [completedSectionName, setCompletedSectionName] = useState<string | null>(null);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showNewEvalConfirm, setShowNewEvalConfirm] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Practice mode store
  const quizStore = useQuizStore();

  // Evaluation mode store
  const evaluationStore = useEvaluationStore();

  const navigate = useNavigate();

  const tutorialStorageKey = user ? `${TUTORIAL_STORAGE_KEY_PREFIX}${user.id}` : null;

  // Check if tutorial should be shown (first login for this user)
  useEffect(() => {
    if (tutorialStorageKey) {
      const tutorialCompleted = localStorage.getItem(tutorialStorageKey);
      if (!tutorialCompleted) {
        // Small delay to let the UI render first
        const timer = setTimeout(() => setShowTutorial(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [tutorialStorageKey]);

  const handleTutorialComplete = () => {
    if (tutorialStorageKey) {
      localStorage.setItem(tutorialStorageKey, 'true');
    }
    setShowTutorial(false);
  };

  const handleTutorialSkip = () => {
    if (tutorialStorageKey) {
      localStorage.setItem(tutorialStorageKey, 'true');
    }
    setShowTutorial(false);
  };

  const handleShowTutorial = () => {
    setShowTutorial(true);
  };

  // Handle section change toast
  useEffect(() => {
    if (evaluationStore.sectionChanged && evaluationStore.completedSection) {
      setCompletedSectionName(evaluationStore.completedSection);
      setShowSectionToast(true);

      // Clear any existing timeout
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }

      // Auto-dismiss after 2 seconds
      toastTimeoutRef.current = setTimeout(() => {
        setShowSectionToast(false);
        evaluationStore.clearSectionChange();
      }, 2000);
    }

    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [evaluationStore.sectionChanged, evaluationStore.completedSection, evaluationStore]);

  // Check for pending session on mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (mode === 'learn') {
      setHasCheckedSession(true);
      return;
    }

    if (mode === 'evaluation' && !hasCheckedSession) {
      evaluationStore.checkForPendingSession();
      setHasCheckedSession(true);
    }
  }, [user, navigate, mode, hasCheckedSession, evaluationStore]);

  // Start evaluation or practice after session check (only if no pending session)
  useEffect(() => {
    if (!user || !hasCheckedSession || mode === 'learn') return;

    // If there's a pending session, wait for user choice
    if (evaluationStore.hasPendingSession) return;

    // Don't start if tutorial is showing
    if (showTutorial) return;

    // Start evaluation on mount if in evaluation mode and not already active
    if (mode === 'evaluation' && !evaluationStore.isActive && !evaluationStore.showReport && !evaluationStore.isLoading) {
      evaluationStore.startEvaluation();
    }

    // Fetch first question on mount in practice mode
    if (mode === 'practice' && !quizStore.isLoading && !quizStore.currentQuestion && !quizStore.feedback) {
      quizStore.fetchNextQuestion();
    }
  }, [user, mode, hasCheckedSession, evaluationStore, quizStore, showTutorial]);

  // Resume prompt handlers
  const handleResumeEvaluation = async () => {
    await evaluationStore.resumeEvaluation();
  };

  const handleStartNewEvaluation = async () => {
    setShowNewEvalConfirm(false);
    evaluationStore.dismissPendingSession();
    await evaluationStore.startEvaluation();
  };

  const handleConfirmNewEvaluation = () => {
    setShowNewEvalConfirm(true);
  };

  const handleCancelNewEvaluation = () => {
    setShowNewEvalConfirm(false);
  };

  // Mode switching handlers
  const handleStartLearn = () => {
    setMode('learn');
    evaluationStore.reset();
    setHasCheckedSession(true);
  };

  const handleStartEvaluation = async () => {
    setMode('evaluation');
    setHasCheckedSession(false); // Re-check for pending session
  };

  const handleExitEvaluation = () => {
    setMode('practice');
    evaluationStore.reset();
    // Fetch a new practice question
    quizStore.fetchNextQuestion();
  };

  // Practice mode handlers
  const handlePracticeSubmit = async (answer: string) => {
    await quizStore.submitAnswer(answer);
    // Update streak based on answer result
    if (quizStore.feedback?.is_correct) {
      setCurrentStreak(prev => prev + 1);
    } else {
      setCurrentStreak(0);
    }
  };

  const handlePracticeContinue = () => {
    quizStore.clearFeedback();
    if (!quizStore.currentQuestion) {
      quizStore.fetchNextQuestion();
    }
  };

  const handleSelectSkill = (skillId: number | null) => {
    quizStore.setSelectedSkill(skillId);
    quizStore.fetchNextQuestion(skillId);
  };

  const handleLessonQuizStart = (skillId: number) => {
    setMode('practice');
    quizStore.setSelectedSkill(skillId);
    quizStore.fetchNextQuestion(skillId);
  };

  // Evaluation mode handlers
  const handleEvaluationSubmit = async (answer: string) => {
    await evaluationStore.submitAnswer(answer);
    // If evaluation ended, the report will show automatically
  };

  const handleCloseReport = () => {
    handleExitEvaluation();
  };

  if (!user) {
    return null; // Redirecting
  }

  // Determine which store to use based on mode
  const currentQuestion = mode === 'practice'
    ? quizStore.currentQuestion
    : mode === 'evaluation'
      ? evaluationStore.currentQuestion
      : null;
  const isLoading = mode === 'practice'
    ? quizStore.isLoading
    : mode === 'evaluation'
      ? evaluationStore.isLoading
      : false;
  const error = mode === 'practice'
    ? quizStore.error
    : mode === 'evaluation'
      ? evaluationStore.error
      : null;

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      <div className="max-w-3xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
        {/* Header */}
        <header className="bg-surface border border-gray-800 rounded-t-lg px-3 sm:px-6 py-3 sm:py-4">
          {/* Mobile: Stack logo and buttons */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
            <img
              src="/logo.png"
              alt="Study Buddy"
              className="h-16 sm:h-24 self-center sm:self-auto"
              data-tutorial="logo"
            />
            <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-4">
              {/* Streak indicator - show in practice mode */}
              {mode === 'practice' && currentStreak > 0 && (
                <StreakIndicator streak={currentStreak} showLabel={false} />
              )}
              <button
                onClick={handleShowTutorial}
                className="p-2 text-sm text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-all outline-none no-select"
                title="Show tutorial"
              >
                ?
              </button>
              <button
                onClick={() => navigate('/progress')}
                className="px-3 py-2 text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-gray-700 hover:border-gray-500 rounded-lg transition-all outline-none no-select"
                data-tutorial="progress-button"
              >
                Progress
              </button>
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                <span className="text-white font-medium text-sm sm:text-base">{user.first_name}</span>
                <span className="text-gray-600 hidden sm:inline">|</span>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="text-sm text-gray-400 hover:text-red-400 transition-colors outline-none focus:outline-none focus-visible:outline-none border-none focus:ring-0 no-select"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Mode Switcher - Stack on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3" data-tutorial="mode-switcher">
            <div className="grid grid-cols-3 bg-background rounded-lg p-1 border border-gray-700 w-full sm:w-auto">
              <button
                onClick={handleStartLearn}
                disabled={mode === 'learn'}
                className={`px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium transition-colors no-select ${
                  mode === 'learn'
                    ? 'bg-accent text-background'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                data-tutorial="learn-mode"
              >
                Learn
              </button>
              <button
                onClick={() => mode !== 'practice' && handleExitEvaluation()}
                disabled={mode === 'practice'}
                className={`px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium transition-colors no-select ${
                  mode === 'practice'
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                data-tutorial="practice-mode"
              >
                Quiz Only
              </button>
              <button
                onClick={handleStartEvaluation}
                disabled={mode === 'evaluation' || evaluationStore.isActive}
                className={`px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium transition-colors no-select ${
                  mode === 'evaluation'
                    ? 'bg-secondary text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                data-tutorial="evaluation-mode"
              >
                Check
              </button>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              {mode === 'learn' && 'Interactive lessons with practice checkpoints'}
              {mode === 'practice' && 'Extra quiz practice for a refresher topic'}
              {mode === 'evaluation' && 'Quick readiness check across the refresher'}
            </p>
          </div>
        </header>

        {/* Sub-header - Fixed height area for mode-specific controls */}
        <div
          className="bg-surface border-x border-gray-800 px-3 sm:px-6 py-3 sm:py-4 min-h-[100px] sm:h-[120px] flex items-center justify-center relative"
          data-tutorial="progress-bar"
        >
          {/* Section Complete Toast */}
          {showSectionToast && completedSectionName && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 animate-slideDown">
              <div className="bg-success text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <span className="text-lg">✓</span>
                <span className="font-medium">{completedSectionName} Complete!</span>
              </div>
            </div>
          )}

          {mode === 'learn' ? (
            <p className="text-gray-400 text-sm text-center">
              Continue the next lesson in your Calc I readiness path, then prove it with a focused quiz.
            </p>
          ) : mode === 'evaluation' && evaluationStore.isActive && evaluationStore.progress ? (
            <EvaluationProgress
              currentSection={evaluationStore.progress.section_name}
              sectionIndex={evaluationStore.progress.section_index || 0}
              totalSections={evaluationStore.progress.total_sections || 5}
              questionsInSection={evaluationStore.progress.section_total}
              questionsCompletedInSection={evaluationStore.progress.section_completed}
              overallProgress={evaluationStore.progress.overall_percent}
              estimatedMinutesRemaining={Math.max(1, Math.ceil((100 - evaluationStore.progress.overall_percent) / 10))}
            />
          ) : mode === 'practice' ? (
            <div className="w-full">
              <SkillSelector
                onSelectSkill={handleSelectSkill}
                selectedSkillId={quizStore.selectedSkillId}
              />
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Starting readiness check...</p>
          )}
        </div>

        {/* Main Content */}
        <main className="bg-background px-3 sm:px-6 py-4 sm:py-8 border-x border-b border-gray-800 rounded-b-lg">

          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div data-tutorial="question-card">
            {mode === 'learn' ? (
              <CourseLearningPanel onStartQuiz={handleLessonQuizStart} />
            ) : isLoading && !currentQuestion ? (
              <div className="card text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-400">
                  {mode === 'evaluation' ? 'Starting readiness check...' : 'Loading next question...'}
                </p>
              </div>
            ) : currentQuestion ? (
              <QuestionCard
                question={currentQuestion}
                onSubmit={mode === 'practice' ? handlePracticeSubmit : handleEvaluationSubmit}
                isLoading={isLoading}
              />
            ) : (
              <div className="card text-center py-12">
                <p className="text-gray-400 mb-4">No questions available</p>
                <button
                  onClick={() => mode === 'practice' ? quizStore.fetchNextQuestion() : handleStartEvaluation()}
                  className="btn-primary"
                >
                  {mode === 'practice' ? 'Start Quiz Practice' : 'Start Readiness Check'}
                </button>
              </div>
            )}
          </div>

          {/* Help Text */}
          {mode !== 'learn' && (
            <div className="mt-8 text-center text-sm text-gray-500">
              {mode === 'practice' ? (
                <p>Quiz Only: use this when you want extra reps without the guided lesson.</p>
              ) : (
                <p>Readiness Check: testing each refresher topic at multiple difficulty levels.</p>
              )}
            </div>
          )}
        </main>

        {/* Feedback Modal - Only in Practice Mode */}
        {mode === 'practice' && quizStore.feedback && (
          <FeedbackModal
            feedback={quizStore.feedback}
            onContinue={handlePracticeContinue}
            streak={quizStore.feedback.is_correct ? currentStreak : 0}
          />
        )}

        {/* Report Card - Only in Evaluation Mode */}
        {mode === 'evaluation' && evaluationStore.showReport && evaluationStore.report && (
          <ReportCard report={evaluationStore.report} onClose={handleCloseReport} />
        )}

        {/* Resume Evaluation Prompt */}
        {mode === 'evaluation' && evaluationStore.hasPendingSession && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-surface border border-gray-700 rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-white mb-2">Resume Evaluation?</h2>
              <p className="text-gray-400 mb-6">
                You have an unfinished evaluation. Would you like to continue where you left off or start a new one?
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleResumeEvaluation}
                  className="w-full btn-primary py-3 text-lg"
                >
                  Resume Evaluation
                </button>
                <button
                  onClick={handleConfirmNewEvaluation}
                  className="w-full btn-secondary py-3"
                >
                  Start New Evaluation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm New Evaluation Dialog */}
        {showNewEvalConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-surface border border-gray-700 rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-white mb-2">Start New Evaluation?</h2>
              <p className="text-gray-400 mb-6">
                This will discard your previous progress. Are you sure you want to start over?
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleStartNewEvaluation}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Yes, Start New
                </button>
                <button
                  onClick={handleCancelNewEvaluation}
                  className="w-full btn-secondary py-3"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tutorial Overlay */}
        {showTutorial && (
          <Tutorial onComplete={handleTutorialComplete} onSkip={handleTutorialSkip} />
        )}
      </div>
    </div>
  );
}
