import { useEffect, useMemo, useState } from "react";

import {
  FolderKanban,
  CheckSquare,
  GitPullRequest,
  Bot,
  TrendingUp,
  Activity,
  BarChart3,
  AlertCircle,
} from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import { useAuth } from "../context/useAuth";

function Analytics() {
  // ============================================================
  // AUTH
  // ============================================================

  const { accessToken } = useAuth();

  // ============================================================
  // STATE
  // ============================================================

  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ============================================================
  // FETCH ANALYTICS DATA
  // ============================================================

  const fetchAnalytics = async () => {
    if (!accessToken) {
      setLoading(false);

      return;
    }

    try {
      setLoading(true);

      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/dashboard/analytics",
        {
          method: "GET",

          headers: {
            Accept: "application/json",

            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load analytics.");
      }

      setAnalytics(data);
    } catch (error) {
      console.error("Analytics error:", error);

      setError(error.message || "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    fetchAnalytics();
  }, [accessToken]);

  // ============================================================
  // TASK COMPLETION %
  // ============================================================

  const taskCompletionRate = useMemo(() => {
    if (!analytics || !analytics.tasks || analytics.tasks.total === 0) {
      return 0;
    }

    return Math.round(
      (analytics.tasks.completed / analytics.tasks.total) * 100,
    );
  }, [analytics]);

  // ============================================================
  // AI SCORE
  // ============================================================

  const averageScore = analytics?.ai_reviews?.average_score;

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white">
        <Sidebar />

        <main className="ml-64 min-h-screen p-8">
          <div className="mx-auto max-w-7xl">
            {/* Header skeleton */}

            <div className="h-8 w-64 animate-pulse rounded bg-white/10" />

            <div className="mt-3 h-5 w-96 animate-pulse rounded bg-white/5" />

            {/* Cards skeleton */}

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-xl border border-white/10 bg-[#111116]"
                />
              ))}
            </div>

            {/* Chart skeleton */}

            <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="h-80 animate-pulse rounded-xl border border-white/10 bg-[#111116]" />

              <div className="h-80 animate-pulse rounded-xl border border-white/10 bg-[#111116]" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white">
        <Sidebar />

        <main className="ml-64 min-h-screen p-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8">
              <div className="flex items-center gap-3">
                <AlertCircle size={22} className="text-red-400" />

                <h1 className="text-lg font-semibold">Analytics unavailable</h1>
              </div>

              <p className="mt-3 text-sm text-red-400">{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================
  // SAFETY CHECK
  // ============================================================

  if (!analytics) {
    return null;
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-[#07070a] text-white">
      <Sidebar />

      <main className="ml-64 min-h-screen p-8">
        <div className="mx-auto max-w-7xl">
          {/* ==================================================
                        PAGE HEADER
                    ================================================== */}

          <div className="mb-8">
            <h1 className="text-3xl font-bold">Analytics</h1>

            <p className="mt-2 text-gray-400">
              Track your development activity and project performance.
            </p>
          </div>

          {/* ==================================================
                        OVERVIEW CARDS
                    ================================================== */}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {/* PROJECTS */}

            <div className="rounded-xl border border-white/10 bg-[#111116] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Projects</p>

                  <p className="mt-2 text-3xl font-bold">
                    {analytics.projects.total}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <FolderKanban size={21} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <Activity size={14} />
                Active projects
              </div>
            </div>

            {/* TASKS */}

            <div className="rounded-xl border border-white/10 bg-[#111116] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Tasks</p>

                  <p className="mt-2 text-3xl font-bold">
                    {analytics.tasks.total}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <CheckSquare size={21} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <TrendingUp size={14} />
                {analytics.tasks.completed} completed
              </div>
            </div>

            {/* PULL REQUESTS */}

            <div className="rounded-xl border border-white/10 bg-[#111116] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pull Requests</p>

                  <p className="mt-2 text-3xl font-bold">
                    {analytics.pull_requests.total}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                  <GitPullRequest size={21} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <Activity size={14} />
                Repository activity
              </div>
            </div>

            {/* AI REVIEWS */}

            <div className="rounded-xl border border-white/10 bg-[#111116] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">AI Reviews</p>

                  <p className="mt-2 text-3xl font-bold">
                    {analytics.ai_reviews.total}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <Bot size={21} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <TrendingUp size={14} />
                Avg score:{" "}
                {averageScore !== null && averageScore !== undefined
                  ? averageScore
                  : "—"}
              </div>
            </div>
          </div>

          {/* ==================================================
                        ANALYTICS GRID
                    ================================================== */}

          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* ==================================================
                            TASK OVERVIEW
                        ================================================== */}

            <div className="rounded-xl border border-white/10 bg-[#111116] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Task Overview</h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Current task completion status
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <BarChart3 size={19} />
                </div>
              </div>

              {/* COMPLETION RATE */}

              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Completion rate</span>

                  <span className="font-semibold text-white">
                    {taskCompletionRate}%
                  </span>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 to-violet-500 transition-all duration-700"
                    style={{
                      width: `${taskCompletionRate}%`,
                    }}
                  />
                </div>
              </div>

              {/* TASK COUNTS */}

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs text-gray-500">Completed</p>

                  <p className="mt-2 text-2xl font-bold text-emerald-400">
                    {analytics.tasks.completed}
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs text-gray-500">Open</p>

                  <p className="mt-2 text-2xl font-bold text-yellow-400">
                    {analytics.tasks.open}
                  </p>
                </div>
              </div>

              {/* STATUS DISTRIBUTION */}

              <div className="mt-8">
                <p className="mb-4 text-sm font-medium text-gray-300">
                  Status distribution
                </p>

                <div className="space-y-3">
                  {Object.entries(analytics.tasks.status_distribution).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3"
                      >
                        <span className="text-sm capitalize text-gray-400">
                          {status}
                        </span>

                        <span className="text-sm font-semibold text-white">
                          {count}
                        </span>
                      </div>
                    ),
                  )}

                  {Object.keys(analytics.tasks.status_distribution).length ===
                    0 && (
                    <p className="text-sm text-gray-600">
                      No task data available.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ==================================================
                            AI REVIEW OVERVIEW
                        ================================================== */}

            <div className="rounded-xl border border-white/10 bg-[#111116] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    AI Review Performance
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Code quality scores across reviews
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <Bot size={19} />
                </div>
              </div>

              {/* AVERAGE SCORE */}

              <div className="mt-8 flex items-center justify-center">
                <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full border-8 border-purple-500/20">
                  <span className="text-4xl font-bold">
                    {averageScore !== null && averageScore !== undefined
                      ? averageScore
                      : "—"}
                  </span>

                  <span className="mt-1 text-xs text-gray-500">
                    Average Score
                  </span>
                </div>
              </div>

              {/* SCORE DISTRIBUTION */}

              <div className="mt-8 space-y-4">
                {/* EXCELLENT */}

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-400">Excellent (90-100)</span>

                    <span className="font-semibold text-emerald-400">
                      {analytics.ai_reviews.score_distribution.excellent}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${
                          analytics.ai_reviews.score_distribution.excellent
                        }00%`,
                      }}
                    />
                  </div>
                </div>

                {/* GOOD */}

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-400">Good (70-89)</span>

                    <span className="font-semibold text-yellow-400">
                      {analytics.ai_reviews.score_distribution.good}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-yellow-500"
                      style={{
                        width: `${
                          analytics.ai_reviews.score_distribution.good
                        }00%`,
                      }}
                    />
                  </div>
                </div>

                {/* NEEDS IMPROVEMENT */}

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      Needs improvement (&lt;70)
                    </span>

                    <span className="font-semibold text-red-400">
                      {
                        analytics.ai_reviews.score_distribution
                          .needs_improvement
                      }
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-red-500"
                      style={{
                        width: `${
                          analytics.ai_reviews.score_distribution
                            .needs_improvement
                        }00%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
                        DEVELOPMENT SUMMARY
                    ================================================== */}

          <div className="mt-5 rounded-xl border border-white/10 bg-[#111116] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                <Activity size={19} />
              </div>

              <div>
                <h2 className="font-semibold">Development Summary</h2>

                <p className="mt-1 text-sm text-gray-500">
                  Overview of your current Velocyte workspace.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-5">
                <p className="text-sm text-gray-500">Project activity</p>

                <p className="mt-2 text-2xl font-bold">
                  {analytics.projects.total}
                </p>

                <p className="mt-1 text-xs text-gray-600">active projects</p>
              </div>

              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-5">
                <p className="text-sm text-gray-500">Task progress</p>

                <p className="mt-2 text-2xl font-bold">{taskCompletionRate}%</p>

                <p className="mt-1 text-xs text-gray-600">tasks completed</p>
              </div>

              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-5">
                <p className="text-sm text-gray-500">Code quality</p>

                <p className="mt-2 text-2xl font-bold">
                  {averageScore !== null && averageScore !== undefined
                    ? `${averageScore}/100`
                    : "—"}
                </p>

                <p className="mt-1 text-xs text-gray-600">average AI score</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Analytics;
