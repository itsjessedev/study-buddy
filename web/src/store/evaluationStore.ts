/**
 * Evaluation mode state management - Adaptive Testing
 */

import { create } from 'zustand';
import { evaluationAPI } from '../api/evaluation';
import type { EvaluationReport, EvaluationProgress, EvaluationQuestion } from '../api/evaluation';

const STORAGE_KEY = 'study-buddy-evaluation-session';

interface StoredSession {
  sessionId: string;
  subjects: string[];
  skillsPerSubject: Record<string, number>;
  totalSkills: number;
  timestamp: number;
}

interface EvaluationState {
  // Session data
  sessionId: string | null;
  subjects: string[];
  skillsPerSubject: Record<string, number>;
  totalSkills: number;
  isActive: boolean;

  // Resume prompt state
  hasPendingSession: boolean;
  pendingSessionId: string | null;

  // Progress tracking
  progress: EvaluationProgress | null;

  // Section transition
  sectionChanged: boolean;
  completedSection: string | null;

  // Current question
  currentQuestion: EvaluationQuestion | null;
  questionStartTime: number | null;

  // Results
  report: EvaluationReport | null;
  showReport: boolean;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  checkForPendingSession: () => void;
  resumeEvaluation: () => Promise<void>;
  startEvaluation: () => Promise<void>;
  dismissPendingSession: () => void;
  fetchNextQuestion: () => Promise<void>;
  submitAnswer: (answer: string) => Promise<boolean>;
  getReport: () => Promise<void>;
  clearSectionChange: () => void;
  reset: () => void;
}

const initialProgress: EvaluationProgress = {
  overall_completed: 0,
  overall_total: 0,
  overall_percent: 0,
  section_name: '',
  section_completed: 0,
  section_total: 0,
  section_percent: 0,
};

// Helper to save session to localStorage
function saveSession(session: StoredSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // localStorage might be unavailable
  }
}

// Helper to load session from localStorage
function loadSession(): StoredSession | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const session = JSON.parse(stored) as StoredSession;

    // Check if session is less than 24 hours old
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - session.timestamp > maxAge) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

// Helper to clear session from localStorage
function clearStoredSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage might be unavailable
  }
}

export const useEvaluationStore = create<EvaluationState>((set, get) => ({
  sessionId: null,
  subjects: [],
  skillsPerSubject: {},
  totalSkills: 0,
  isActive: false,
  hasPendingSession: false,
  pendingSessionId: null,
  progress: null,
  sectionChanged: false,
  completedSection: null,
  currentQuestion: null,
  questionStartTime: null,
  report: null,
  showReport: false,
  isLoading: false,
  error: null,

  checkForPendingSession: () => {
    const stored = loadSession();
    if (stored) {
      set({
        hasPendingSession: true,
        pendingSessionId: stored.sessionId,
        subjects: stored.subjects,
        skillsPerSubject: stored.skillsPerSubject,
        totalSkills: stored.totalSkills,
      });
    } else {
      set({
        hasPendingSession: false,
        pendingSessionId: null,
      });
    }
  },

  resumeEvaluation: async () => {
    const { pendingSessionId, subjects, skillsPerSubject, totalSkills } = get();

    if (!pendingSessionId) {
      set({ error: 'No session to resume' });
      return;
    }

    set({
      isLoading: true,
      error: null,
      isActive: true,
      showReport: false,
      report: null,
      sectionChanged: false,
      completedSection: null,
      hasPendingSession: false,
      sessionId: pendingSessionId,
      subjects,
      skillsPerSubject,
      totalSkills,
      progress: initialProgress,
    });

    try {
      // Try to fetch next question from existing session
      await get().fetchNextQuestion();
    } catch {
      // Session might have expired on backend, start fresh
      clearStoredSession();
      set({
        error: 'Session expired. Starting new evaluation...',
        isLoading: false,
        isActive: false,
        sessionId: null,
        hasPendingSession: false,
        pendingSessionId: null,
      });
    }
  },

  dismissPendingSession: () => {
    clearStoredSession();
    set({
      hasPendingSession: false,
      pendingSessionId: null,
    });
  },

  startEvaluation: async () => {
    // Clear any existing session
    clearStoredSession();

    set({
      isLoading: true,
      error: null,
      isActive: true,
      showReport: false,
      report: null,
      sectionChanged: false,
      completedSection: null,
      hasPendingSession: false,
      pendingSessionId: null,
      progress: initialProgress,
    });
    try {
      const response = await evaluationAPI.start();

      // Save session to localStorage
      saveSession({
        sessionId: response.session_id,
        subjects: response.subjects,
        skillsPerSubject: response.skills_per_subject,
        totalSkills: response.total_skills,
        timestamp: Date.now(),
      });

      set({
        sessionId: response.session_id,
        totalSkills: response.total_skills,
        subjects: response.subjects,
        skillsPerSubject: response.skills_per_subject,
        isLoading: false,
      });

      // Fetch first question
      await get().fetchNextQuestion();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to start evaluation',
        isLoading: false,
        isActive: false,
      });
    }
  },

  fetchNextQuestion: async () => {
    const { sessionId } = get();
    if (!sessionId) {
      set({ error: 'No active evaluation session' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const question = await evaluationAPI.getNext(sessionId);
      set({
        currentQuestion: question,
        questionStartTime: Date.now(),
        progress: question.progress,
        sectionChanged: question.section_changed,
        completedSection: question.completed_section,
        isLoading: false,
      });
    } catch (error) {
      // If no more questions, evaluation might be complete
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch question';
      if (errorMsg.includes('complete') || errorMsg.includes('No more')) {
        // Evaluation complete, fetch report and clear stored session
        clearStoredSession();
        await get().getReport();
        set({
          isLoading: false,
          showReport: true,
          isActive: false,
        });
      } else if (errorMsg.includes('not found') || errorMsg.includes('expired')) {
        // Session no longer valid
        clearStoredSession();
        set({
          error: 'Session expired',
          isLoading: false,
          isActive: false,
          sessionId: null,
        });
      } else {
        set({
          error: errorMsg,
          isLoading: false,
        });
      }
    }
  },

  submitAnswer: async (answer: string) => {
    const { sessionId, currentQuestion, questionStartTime } = get();

    if (!sessionId || !currentQuestion) {
      set({ error: 'No active question' });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      const timeTaken = questionStartTime
        ? Math.floor((Date.now() - questionStartTime) / 1000)
        : undefined;

      const result = await evaluationAPI.submitAnswer(sessionId, {
        question_id: currentQuestion.question_id,
        answer,
        time_taken_seconds: timeTaken,
      });

      // Update progress
      set({
        progress: result.progress,
      });

      if (result.evaluation_complete) {
        // Evaluation ended - fetch report and clear stored session
        clearStoredSession();
        await get().getReport();
        set({
          isLoading: false,
          showReport: true,
          isActive: false,
        });
        return false;
      }

      // Continue - fetch next question
      set({ isLoading: false });
      await get().fetchNextQuestion();
      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to submit answer',
        isLoading: false,
      });
      return false;
    }
  },

  getReport: async () => {
    const { sessionId } = get();
    if (!sessionId) return;

    set({ isLoading: true, error: null });
    try {
      const report = await evaluationAPI.getReport(sessionId);
      set({
        report,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch report',
        isLoading: false,
      });
    }
  },

  clearSectionChange: () => set({
    sectionChanged: false,
    completedSection: null,
  }),

  reset: () => {
    clearStoredSession();
    set({
      sessionId: null,
      subjects: [],
      skillsPerSubject: {},
      totalSkills: 0,
      isActive: false,
      hasPendingSession: false,
      pendingSessionId: null,
      progress: null,
      sectionChanged: false,
      completedSection: null,
      currentQuestion: null,
      questionStartTime: null,
      report: null,
      showReport: false,
      error: null,
    });
  },
}));
