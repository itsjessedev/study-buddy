import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { adminAPI } from '../api/admin';
import type { AdminStats, UserSummary, EvaluationSummary, SkillPerformance, UserDetail, AdminStatus } from '../api/admin';

type Tab = 'overview' | 'users' | 'evaluations' | 'skills';

export default function Admin() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationSummary[]>([]);
  const [skillPerformance, setSkillPerformance] = useState<SkillPerformance[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, usersData, evalsData, skillsData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getEvaluations(),
        adminAPI.getSkillPerformance(),
      ]);
      setStats(statsData);
      setUsers(usersData.users);
      setEvaluations(evalsData.evaluations);
      setSkillPerformance(skillsData.skills);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkAdminAccess = useCallback(async () => {
    try {
      const status = await adminAPI.checkStatus();
      setAdminStatus(status);
      if (!status.is_admin) {
        setError('You do not have admin access');
        setIsLoading(false);
        return;
      }
      await loadData();
    } catch {
      setError('Failed to verify admin status');
      setIsLoading(false);
    }
  }, [loadData]);

  useEffect(() => {
    // App.tsx handles auth redirect, so if we're here, user exists
    if (user) {
      checkAdminAccess();
    }
  }, [user, checkAdminAccess]);

  const handleViewUser = async (userId: number) => {
    try {
      const userData = await adminAPI.getUserDetail(userId);
      setSelectedUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user details');
    }
  };

  const handleToggleAdmin = async (userId: number) => {
    if (adminStatus?.is_readonly) return;
    try {
      await adminAPI.toggleUserAdmin(userId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle admin status');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !adminStatus?.is_admin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button onClick={() => navigate('/quiz')} className="btn-primary">
            Back to App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
        {/* Header */}
        <header className="bg-surface border border-gray-800 rounded-lg px-4 sm:px-6 py-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#6B4FFF] to-[#FF6EC7] bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {adminStatus?.is_readonly ? 'Read-only Access' : 'Full Admin Access'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/quiz')} className="btn-secondary">
                Back to App
              </button>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="px-4 py-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['overview', 'users', 'evaluations', 'skills'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-surface text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
            <button onClick={() => setError(null)} className="ml-4 underline">Dismiss</button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="card text-center">
              <p className="text-3xl sm:text-4xl font-bold text-primary">{stats.total_users}</p>
              <p className="text-sm text-gray-400 mt-1">Total Users</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl sm:text-4xl font-bold text-secondary">{stats.active_users_7d}</p>
              <p className="text-sm text-gray-400 mt-1">Active (7d)</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl sm:text-4xl font-bold text-accent">{stats.total_evaluations}</p>
              <p className="text-sm text-gray-400 mt-1">Evaluations</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl sm:text-4xl font-bold text-success">{stats.average_score}%</p>
              <p className="text-sm text-gray-400 mt-1">Avg Score</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl sm:text-4xl font-bold text-orange-400">{stats.total_questions_answered}</p>
              <p className="text-sm text-gray-400 mt-1">Questions</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl sm:text-4xl font-bold text-blue-400">{stats.evaluations_today}</p>
              <p className="text-sm text-gray-400 mt-1">Today</p>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4">All Users</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4 hidden sm:table-cell">Joined</th>
                  <th className="pb-3 pr-4">Evals</th>
                  <th className="pb-3 pr-4 hidden sm:table-cell">Questions</th>
                  <th className="pb-3 pr-4">Score</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-800 hover:bg-white/5">
                    <td className="py-3 pr-4">
                      <div>
                        <span className="font-medium text-white">{u.first_name}</span>
                        <span className="text-gray-500 ml-1">@{u.username}</span>
                        {u.is_admin && (
                          <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-400 hidden sm:table-cell">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="py-3 pr-4">{u.evaluation_count}</td>
                    <td className="py-3 pr-4 hidden sm:table-cell">{u.questions_answered}</td>
                    <td className="py-3 pr-4">
                      {u.latest_score !== null ? (
                        <span className={u.latest_score >= 70 ? 'text-success' : u.latest_score >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                          {u.latest_score}%
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleViewUser(u.id)}
                        className="text-primary hover:underline mr-3"
                      >
                        View
                      </button>
                      {!adminStatus?.is_readonly && (
                        <button
                          onClick={() => handleToggleAdmin(u.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          {u.is_admin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Evaluations Tab */}
        {activeTab === 'evaluations' && (
          <div className="card overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4">Recent Evaluations</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Score</th>
                  <th className="pb-3 pr-4 hidden sm:table-cell">Questions</th>
                  <th className="pb-3 pr-4 hidden sm:table-cell">Mastered</th>
                  <th className="pb-3 hidden sm:table-cell">Needs Study</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((e) => (
                  <tr key={e.id} className="border-b border-gray-800 hover:bg-white/5">
                    <td className="py-3 pr-4">
                      <span className="font-medium text-white">{e.first_name}</span>
                      <span className="text-gray-500 ml-1 hidden sm:inline">@{e.username}</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-400 text-xs sm:text-sm">
                      {formatDate(e.completed_at)}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`font-bold ${e.overall_score >= 70 ? 'text-success' : e.overall_score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {e.overall_score}%
                      </span>
                    </td>
                    <td className="py-3 pr-4 hidden sm:table-cell">
                      {e.total_correct}/{e.total_questions}
                    </td>
                    <td className="py-3 pr-4 text-success hidden sm:table-cell">{e.skills_mastered}</td>
                    <td className="py-3 text-red-400 hidden sm:table-cell">{e.skills_study}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="card overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4">Skill Performance</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-3 pr-4">Skill</th>
                  <th className="pb-3 pr-4 hidden sm:table-cell">Subject</th>
                  <th className="pb-3 pr-4">Tested</th>
                  <th className="pb-3 pr-4">Avg Score</th>
                  <th className="pb-3 pr-4 hidden sm:table-cell">Mastery Rate</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {skillPerformance
                  .sort((a, b) => a.avg_score - b.avg_score)
                  .map((s, i) => (
                    <tr key={i} className="border-b border-gray-800 hover:bg-white/5">
                      <td className="py-3 pr-4 font-medium text-white">{s.skill_name}</td>
                      <td className="py-3 pr-4 text-gray-400 hidden sm:table-cell">{s.subject}</td>
                      <td className="py-3 pr-4">{s.times_tested}</td>
                      <td className="py-3 pr-4">
                        <span className={s.avg_score >= 70 ? 'text-success' : s.avg_score >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                          {s.avg_score}%
                        </span>
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell">{s.mastery_rate}%</td>
                      <td className="py-3">
                        {s.avg_score < 40 ? (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Needs Attention</span>
                        ) : s.avg_score >= 70 ? (
                          <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">Good</span>
                        ) : (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">Average</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-surface border border-gray-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedUser.first_name}</h2>
                    <p className="text-gray-400">@{selectedUser.username}</p>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-background rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{selectedUser.evaluations.length}</p>
                    <p className="text-xs text-gray-400">Evaluations</p>
                  </div>
                  <div className="bg-background rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-secondary">
                      {selectedUser.evaluations[0]?.overall_score || '-'}%
                    </p>
                    <p className="text-xs text-gray-400">Latest Score</p>
                  </div>
                  <div className="bg-background rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-accent">{selectedUser.skill_stats.length}</p>
                    <p className="text-xs text-gray-400">Skills Practiced</p>
                  </div>
                </div>

                {/* Evaluations */}
                <h3 className="text-lg font-semibold mb-3">Evaluation History</h3>
                <div className="space-y-3 mb-6">
                  {selectedUser.evaluations.slice(0, 5).map((e) => (
                    <div key={e.id} className="bg-background rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">{formatDate(e.completed_at)}</span>
                        <span className={`text-xl font-bold ${e.overall_score >= 70 ? 'text-success' : 'text-yellow-400'}`}>
                          {e.overall_score}%
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-success">{e.skills_mastered} mastered</span>
                        <span className="text-blue-400">{e.skills_review} proficient</span>
                        <span className="text-red-400">{e.skills_study} need study</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                {selectedUser.skill_stats.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mb-3">Skill Breakdown</h3>
                    <div className="space-y-2">
                      {selectedUser.skill_stats.slice(0, 10).map((s, i) => (
                        <div key={i} className="flex items-center justify-between bg-background rounded-lg p-3">
                          <div>
                            <span className="text-white">{s.skill_name}</span>
                            <span className="text-gray-500 text-sm ml-2">({s.subject})</span>
                          </div>
                          <div className="text-right">
                            <span className={`font-bold ${s.accuracy >= 70 ? 'text-success' : 'text-yellow-400'}`}>
                              {s.accuracy}%
                            </span>
                            <span className="text-gray-500 text-sm ml-2">
                              ({s.correct}/{s.attempts})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
