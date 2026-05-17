import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const { checkAuth, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleContinue = async () => {
    clearError();

    try {
      await checkAuth();
      const state = useAuthStore.getState();
      const user = state.user;
      if (!user) {
        window.location.reload();
        return;
      }
      // Redirect based on user type: admins → /admin, regular users → /quiz
      navigate(user.is_admin ? '/admin' : '/quiz', { replace: true });
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 safe-area-inset">
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-10">
          <img
            src="/logo.png"
            alt="Study Buddy"
            className="h-20 sm:h-32 mx-auto mb-3 sm:mb-4"
          />
          <p className="text-base sm:text-lg text-gray-400">Your Adaptive Learning Companion</p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold mb-3 text-center">
            Sign in with Google
          </h2>
          <p className="text-sm text-gray-400 text-center mb-6">
            Use jeldridge2583@gmail.com or jesse@junipr.io through Cloudflare Access.
          </p>

          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-400 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Checking access...' : 'Continue'}
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Adaptive Learning • Personalized Practice • Track Your Progress
        </p>
      </div>
    </div>
  );
}
