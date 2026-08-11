import { useEffect, useMemo, useState } from "react";

import {
  Bot,
  Plus,
  Search,
  Trash2,
  Pencil,
  X,
  FolderKanban,
  GitPullRequest,
  Eye,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";


import Sidebar from "../components/dashboard/Sidebar";
import { useAuth } from "../context/AuthContext";

function AIReviews() {
  // ============================================================
  // AUTHENTICATION
  // ============================================================

  const { accessToken } = useAuth();

  // ============================================================
  // DATA
  // ============================================================

  const [reviews, setReviews] = useState([]);

  const [projects, setProjects] = useState([]);

  // All Pull Requests belonging to the user's projects
  const [pullRequests, setPullRequests] = useState([]);

  // ============================================================
  // SEARCH + FILTER
  // ============================================================

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  // ============================================================
  // PAGE STATE
  // ============================================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ============================================================
  // CREATE REVIEW STATE
  // ============================================================

  const [showCreateReview, setShowCreateReview] = useState(false);

  const [creating, setCreating] = useState(false);

  const [createError, setCreateError] = useState("");

  const [runStage, setRunStage] = useState("");

  const [selectedProject, setSelectedProject] = useState("");

  const [selectedPullRequest, setSelectedPullRequest] = useState("");

  // ============================================================
  // REVIEW DETAILS STATE
  // ============================================================

  const [expandedReviewId, setExpandedReviewId] = useState(null);

  const [selectedReview, setSelectedReview] = useState(null);


  // ============================================================
  // EDIT REVIEW STATE
  // ============================================================

  const [showEditReview, setShowEditReview] = useState(false);

  const [editingReview, setEditingReview] = useState(null);

  const [updating, setUpdating] = useState(false);

  const [updateError, setUpdateError] = useState("");

  // ============================================================
  // FETCH ALL DATA
  // ============================================================

  const fetchData = async () => {
    if (!accessToken) {
      setLoading(false);

      return;
    }

    try {
      setLoading(true);

      setError("");

      // ====================================================
      // 1. FETCH AI REVIEWS
      // ====================================================

      const reviewsResponse = await fetch(
        "http://127.0.0.1:8000/api/ai-reviews",
        {
          method: "GET",

          headers: {
            Accept: "application/json",

            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const reviewsData = await reviewsResponse.json();

      if (!reviewsResponse.ok) {
        throw new Error(reviewsData.detail || "Failed to load AI reviews.");
      }

      // ====================================================
      // 2. FETCH PROJECTS
      // ====================================================

      const projectsResponse = await fetch(
        "http://127.0.0.1:8000/api/projects",
        {
          method: "GET",

          headers: {
            Accept: "application/json",

            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const projectsData = await projectsResponse.json();

      if (!projectsResponse.ok) {
        throw new Error(projectsData.detail || "Failed to load projects.");
      }

      // ====================================================
      // 3. FETCH PULL REQUESTS
      // ====================================================
      //
      // We fetch PRs project-by-project because our backend
      // currently exposes PRs through the project endpoint.
      //
      // ====================================================

      const allPullRequests = [];

      for (const project of projectsData) {
        const pullRequestsResponse = await fetch(
          `http://127.0.0.1:8000/api/projects/${project.id}/pull-requests`,
          {
            method: "GET",

            headers: {
              Accept: "application/json",

              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!pullRequestsResponse.ok) {
          console.warn(
            `Unable to load pull requests for project ${project.id}`,
          );

          continue;
        }

        const projectPullRequests = await pullRequestsResponse.json();

        if (Array.isArray(projectPullRequests)) {
          allPullRequests.push(...projectPullRequests);
        }
      }

      // ====================================================
      // STORE DATA
      // ====================================================

      setReviews(reviewsData);

      setProjects(projectsData);

      setPullRequests(allPullRequests);

      // ====================================================
      // DEFAULT PROJECT
      // ====================================================

      if (projectsData.length > 0 && !selectedProject) {
        setSelectedProject(projectsData[0].id);
      }

      // ====================================================
      // DEFAULT PULL REQUEST
      // ====================================================

      if (allPullRequests.length > 0 && !selectedPullRequest) {
        setSelectedPullRequest(allPullRequests[0].id);
      }
    } catch (error) {
      console.error("AI Reviews page error:", error);

      setError(error.message || "Unable to load AI reviews.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchData();
  }, [accessToken]);

  // ============================================================
  // GET PROJECT NAME
  // ============================================================

  const getProjectName = (projectId) => {
    const project = projects.find((item) => item.id === projectId);

    return project?.name || "Unknown Project";
  };

  // ============================================================
  // GET PULL REQUEST
  // ============================================================

  const getPullRequest = (pullRequestId) => {
    return pullRequests.find((pullRequest) => pullRequest.id === pullRequestId);
  };

  // ============================================================
  // GET PULL REQUEST TITLE
  // ============================================================

  const getPullRequestTitle = (pullRequestId) => {
    const pullRequest = getPullRequest(pullRequestId);

    return pullRequest?.title || "Unknown Pull Request";
  };

  // ============================================================
  // PULL REQUESTS FOR SELECTED PROJECT
  // ============================================================

  const projectPullRequests = useMemo(() => {
    if (!selectedProject) {
      return [];
    }

    return pullRequests.filter(
      (pullRequest) => pullRequest.project_id === selectedProject,
    );
  }, [pullRequests, selectedProject]);

  // ============================================================
  // REVIEW HISTORY + SCORE TREND DATA
  // ============================================================

  const projectReviewHistory = useMemo(() => {
    const scopedReviews = selectedProject
      ? reviews.filter((review) => review.project_id === selectedProject)
      : reviews;

    return [...scopedReviews]
      .filter((review) => review.created_at)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime(),
      );
  }, [reviews, selectedProject]);

  const scoredHistory = useMemo(() => {
    return projectReviewHistory.filter(
      (review) =>
        review.score !== null &&
        review.score !== undefined &&
        !Number.isNaN(Number(review.score)),
    );
  }, [projectReviewHistory]);

  const formatReviewDate = (value) => {
    if (!value) {
      return "Date unavailable";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getTrendPoints = () => {
    if (scoredHistory.length === 0) {
      return "";
    }

    const width = 760;
    const height = 220;
    const paddingX = 36;
    const paddingY = 24;

    const usableWidth = width - paddingX * 2;
    const usableHeight = height - paddingY * 2;

    return scoredHistory
      .map((review, index) => {
        const x =
          scoredHistory.length === 1
            ? width / 2
            : paddingX +
              (index / (scoredHistory.length - 1)) * usableWidth;

        const score = Math.max(
          0,
          Math.min(100, Number(review.score)),
        );

        const y =
          height -
          paddingY -
          (score / 100) * usableHeight;

        return `${x},${y}`;
      })
      .join(" ");
  };

  const getTrendPointCoordinates = () => {
    if (scoredHistory.length === 0) {
      return [];
    }

    const width = 760;
    const height = 220;
    const paddingX = 36;
    const paddingY = 24;

    const usableWidth = width - paddingX * 2;
    const usableHeight = height - paddingY * 2;

    return scoredHistory.map((review, index) => {
      const x =
        scoredHistory.length === 1
          ? width / 2
          : paddingX +
            (index / (scoredHistory.length - 1)) * usableWidth;

      const score = Math.max(
        0,
        Math.min(100, Number(review.score)),
      );

      const y =
        height -
        paddingY -
        (score / 100) * usableHeight;

      return {
        x,
        y,
        score,
        review,
      };
    });
  };

  // ============================================================
  // FILTER REVIEWS
  // ============================================================

  const filteredReviews = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return reviews.filter((review) => {
      const projectName = getProjectName(review.project_id).toLowerCase();

      const pullRequestTitle = getPullRequestTitle(
        review.pull_request_id,
      ).toLowerCase();

      const summary = (review.summary || "").toLowerCase();

      const matchesSearch =
        projectName.includes(searchValue) ||
        pullRequestTitle.includes(searchValue) ||
        summary.includes(searchValue);

      const matchesStatus =
        statusFilter === "all" || review.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reviews, projects, pullRequests, search, statusFilter]);

  // ============================================================
  // WHEN PROJECT CHANGES
  // ============================================================

  const handleProjectChange = (event) => {
    const projectId = event.target.value;

    setSelectedProject(projectId);

    // --------------------------------------------------------
    // Automatically select the first PR belonging to project
    // --------------------------------------------------------

    const projectPRs = pullRequests.filter(
      (pullRequest) => pullRequest.project_id === projectId,
    );

    if (projectPRs.length > 0) {
      setSelectedPullRequest(projectPRs[0].id);
    } else {
      setSelectedPullRequest("");
    }
  };

  // ============================================================
  // CREATE AI REVIEW
  // ============================================================
  // ============================================================
  // RUN GITHUB AI REVIEW
  // ============================================================

  const handleRunAIReview = async () => {
    setCreateError("");
    setRunStage("");

    if (!selectedProject) {
      setCreateError("Please select a project.");
      return;
    }

    if (!selectedPullRequest) {
      setCreateError("Please select a Pull Request.");
      return;
    }

    const selectedPR = pullRequests.find(
      (pullRequest) => pullRequest.id === selectedPullRequest,
    );

    if (!selectedPR) {
      setCreateError("Pull Request not found.");
      return;
    }

    if (!selectedPR.github_pr_number) {
      setCreateError(
        "This Pull Request is not connected to a GitHub Pull Request.",
      );
      return;
    }

    try {
      setCreating(true);
      setRunStage("github");

      const response = await fetch(
        `http://127.0.0.1:8000/api/projects/${selectedProject}/ai-reviews/run/${selectedPR.github_pr_number}`,
        {
          method: "POST",

          headers: {
            Accept: "application/json",

            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      setRunStage("processing");

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "The AI review could not be completed.",
        );
      }

      // Refresh the review list so the new review appears immediately.
      await fetchData();

      setRunStage("completed");

      // Give the user a short success state before closing.
      await new Promise((resolve) => setTimeout(resolve, 700));

      setShowCreateReview(false);
      setCreateError("");
      setRunStage("");
    } catch (error) {
      console.error("Run GitHub AI review error:", error);

      setRunStage("failed");

      setCreateError(
        error.message ||
          "Unable to run AI review. Please check the backend logs and try again.",
      );
    } finally {
      setCreating(false);
    }
  };

  // ============================================================
  // OPEN REVIEW DETAILS
  // ============================================================

  const handleOpenDetails = (review) => {
    setSelectedReview(review);
  };

  const handleCloseDetails = () => {
    setSelectedReview(null);
  };

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  const handleOpenEdit = (review) => {
    setEditingReview({
      ...review,
    });

    setUpdateError("");

    setShowEditReview(true);
  };

  // ============================================================
  // UPDATE AI REVIEW
  // ============================================================

  const handleUpdateReview = async (event) => {
    event.preventDefault();

    if (!editingReview) {
      return;
    }

    setUpdateError("");

    // Validate score

    if (
      editingReview.score !== null &&
      editingReview.score !== "" &&
      (Number(editingReview.score) < 0 || Number(editingReview.score) > 100)
    ) {
      setUpdateError("Score must be between 0 and 100.");

      return;
    }

    try {
      setUpdating(true);

      // ====================================================
      // UPDATE REVIEW
      // ====================================================

      const response = await fetch(
        `http://127.0.0.1:8000/api/projects/ai-reviews/${editingReview.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",

            Accept: "application/json",

            Authorization: `Bearer ${accessToken}`,
          },

          body: JSON.stringify({
            status: editingReview.status,

            score:
              editingReview.score === ""
                ? null
                : editingReview.score === null
                  ? null
                  : Number(editingReview.score),

            summary: editingReview.summary || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update AI review.");
      }

      // ====================================================
      // UPDATE LOCAL UI
      // ====================================================

      setReviews((currentReviews) =>
        currentReviews.map((review) => (review.id === data.id ? data : review)),
      );

      setShowEditReview(false);

      setEditingReview(null);

      setUpdateError("");
    } catch (error) {
      console.error("Update AI review error:", error);

      setUpdateError(error.message || "Unable to update AI review.");
    } finally {
      setUpdating(false);
    }
  };

  // ============================================================
  // DELETE AI REVIEW
  // ============================================================

  const handleDeleteReview = async (reviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this AI review?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/projects/ai-reviews/${reviewId}`,
        {
          method: "DELETE",

          headers: {
            Accept: "application/json",

            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        let data = {};

        try {
          data = await response.json();
        } catch {
          // DELETE 204 has no body
        }

        throw new Error(data.detail || "Failed to delete AI review.");
      }

      // Remove from UI

      setReviews((currentReviews) =>
        currentReviews.filter((review) => review.id !== reviewId),
      );
    } catch (error) {
      console.error("Delete AI review error:", error);

      alert(error.message || "Unable to delete AI review.");
    }
  };

  // ============================================================
  // STATUS STYLES
  // ============================================================

  const getStatusStyles = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 " + "text-emerald-400";

      case "failed":
        return "bg-red-500/10 " + "text-red-400";

      case "processing":
        return "bg-blue-500/10 " + "text-blue-400";

      default:
        return "bg-purple-500/10 " + "text-purple-400";
    }
  };

  // ============================================================
  // SCORE STYLES
  // ============================================================

  const getScoreStyles = (score) => {
    if (score === null || score === undefined) {
      return "text-gray-500";
    }

    if (score >= 80) {
      return "text-emerald-400";
    }

    if (score >= 60) {
      return "text-yellow-400";
    }

    return "text-red-400";
  };

  // ============================================================
  // FINDING SEVERITY STYLES
  // ============================================================

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/15 text-red-300 border-red-500/20";

      case "high":
        return "bg-orange-500/15 text-orange-300 border-orange-500/20";

      case "medium":
        return "bg-yellow-500/15 text-yellow-300 border-yellow-500/20";

      case "low":
        return "bg-blue-500/15 text-blue-300 border-blue-500/20";

      default:
        return "bg-gray-500/15 text-gray-300 border-gray-500/20";
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white">
        <Sidebar />

        <main className="ml-64 min-h-screen p-8">
          <div className="mx-auto max-w-7xl">
            <div className="h-8 w-64 animate-pulse rounded bg-white/10" />

            <div className="mt-3 h-5 w-80 animate-pulse rounded bg-white/5" />

            <div className="mt-8 h-14 animate-pulse rounded-xl bg-[#111116]" />

            <div className="mt-5 space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-xl bg-[#111116]"
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
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

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI Reviews</h1>

              <p className="mt-2 text-gray-400">
                Review code quality, risks, and AI-generated insights.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setCreateError("");

                setShowCreateReview(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-500 px-5 py-3 font-semibold text-white shadow-lg shadow-purple-900/20 transition hover:scale-[1.02]"
            >
              <Plus size={19} />
              New AI Review
            </button>
          </div>

          {/* ==================================================
                        SEARCH + FILTER
                    ================================================== */}

          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="relative max-w-md flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search AI reviews..."
                className="w-full rounded-lg border border-white/10 bg-[#111116] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-white/10 bg-[#111116] px-4 py-3 text-sm text-gray-300 outline-none focus:border-purple-500"
            >
              <option value="all">All statuses</option>

              <option value="completed">Completed</option>

              <option value="processing">Processing</option>

              <option value="failed">Failed</option>
            </select>
          </div>

          {/* ==================================================
                        REVIEW HISTORY + SCORE TREND
                    ================================================== */}

          {!error && (
            <section className="mb-8 space-y-5">
              {/* Analytics header */}

              <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#111116] p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Bot size={18} className="text-purple-400" />
                    <h2 className="text-lg font-semibold text-white">
                      Code Quality History
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    Track previous AI reviews and score changes over time.
                  </p>
                </div>

                <select
                  value={selectedProject}
                  onChange={handleProjectChange}
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-2.5 text-sm text-gray-300 outline-none focus:border-purple-500 lg:w-64"
                >
                  <option value="">All projects</option>

                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* History */}

              <div className="rounded-xl border border-white/10 bg-[#111116] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">
                      Review History
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      {selectedProject
                        ? `Previous reviews for ${getProjectName(selectedProject)}`
                        : "Previous AI reviews across your projects"}
                    </p>
                  </div>

                  <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
                    {projectReviewHistory.length} review
                    {projectReviewHistory.length === 1 ? "" : "s"}
                  </span>
                </div>

                {projectReviewHistory.length > 0 ? (
                  <div className="space-y-2">
                    {[...projectReviewHistory]
                      .reverse()
                      .map((review, index) => (
                        <button
                          key={review.id}
                          type="button"
                          onClick={() => handleOpenDetails(review)}
                          className="grid w-full grid-cols-[1fr_auto] items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-purple-500/20 hover:bg-white/[0.04] md:grid-cols-[1.8fr_1fr_120px_110px]"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                              {getPullRequestTitle(review.pull_request_id)}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {formatReviewDate(review.created_at)}
                            </p>
                          </div>

                          <span className="hidden truncate text-xs text-gray-400 md:block">
                            {getProjectName(review.project_id)}
                          </span>

                          <span
                            className={
                              "text-sm font-bold " +
                              getScoreStyles(review.score)
                            }
                          >
                            {review.score !== null &&
                            review.score !== undefined
                              ? `${review.score}/100`
                              : "—"}
                          </span>

                          <span
                            className={
                              "hidden rounded-full px-2.5 py-1 text-center text-xs font-medium md:inline-flex " +
                              getStatusStyles(review.status)
                            }
                          >
                            {review.status
                              .replace("_", " ")
                              .replace(/\b\w/g, (letter) =>
                                letter.toUpperCase(),
                              )}
                          </span>

                          <span className="text-xs text-purple-400 md:hidden">
                            View
                          </span>
                        </button>
                      ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-white/10 bg-[#0b0b0f] p-8 text-center">
                    <p className="text-sm font-medium text-white">
                      No review history yet
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Completed reviews will appear here automatically.
                    </p>
                  </div>
                )}
              </div>

              {/* Score Trend */}

              <div className="rounded-xl border border-white/10 bg-[#111116] p-5">
                <div className="mb-4">
                  <h3 className="font-semibold text-white">
                    Score Trend
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    AI code quality score over time.
                  </p>
                </div>

                {scoredHistory.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <svg
                        viewBox="0 0 760 220"
                        className="h-56 min-w-[680px] w-full"
                        role="img"
                        aria-label="AI review score trend"
                      >
                        {[0, 25, 50, 75, 100].map((score) => {
                          const y = 196 - (score / 100) * 172;

                          return (
                            <g key={score}>
                              <line
                                x1="36"
                                y1={y}
                                x2="724"
                                y2={y}
                                stroke="rgba(255,255,255,0.08)"
                                strokeWidth="1"
                              />

                              <text
                                x="4"
                                y={y + 4}
                                fill="rgba(156,163,175,0.8)"
                                fontSize="11"
                              >
                                {score}
                              </text>
                            </g>
                          );
                        })}

                        <polyline
                          points={getTrendPoints()}
                          fill="none"
                          stroke="#a855f7"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {getTrendPointCoordinates().map(
                          ({ x, y, score, review }, index) => (
                            <g key={review.id}>
                              <circle
                                cx={x}
                                cy={y}
                                r="5"
                                fill="#a855f7"
                                stroke="#111116"
                                strokeWidth="3"
                              />

                              <text
                                x={x}
                                y={y - 11}
                                textAnchor="middle"
                                fill="white"
                                fontSize="11"
                                fontWeight="600"
                              >
                                {score}
                              </text>

                              <text
                                x={x}
                                y="212"
                                textAnchor="middle"
                                fill="rgba(156,163,175,0.8)"
                                fontSize="10"
                              >
                                R{index + 1}
                              </text>
                            </g>
                          ),
                        )}
                      </svg>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Reviews
                        </p>
                        <p className="mt-1 text-xl font-bold text-white">
                          {scoredHistory.length}
                        </p>
                      </div>

                      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Latest Score
                        </p>
                        <p
                          className={
                            "mt-1 text-xl font-bold " +
                            getScoreStyles(
                              scoredHistory[scoredHistory.length - 1].score,
                            )
                          }
                        >
                          {scoredHistory[scoredHistory.length - 1].score}/100
                        </p>
                      </div>

                      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Change
                        </p>
                        <p
                          className={
                            "mt-1 text-xl font-bold " +
                            (Number(
                              scoredHistory[scoredHistory.length - 1].score,
                            ) -
                              Number(scoredHistory[0].score) >=
                            0
                              ? "text-emerald-400"
                              : "text-red-400")
                          }
                        >
                          {Number(
                            scoredHistory[scoredHistory.length - 1].score,
                          ) -
                            Number(scoredHistory[0].score) >=
                          0
                            ? "+"
                            : ""}
                          {Number(
                            scoredHistory[scoredHistory.length - 1].score,
                          ) - Number(scoredHistory[0].score)}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-white/10 bg-[#0b0b0f] p-8 text-center">
                    <p className="text-sm font-medium text-white">
                      No score history yet
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Run at least one scored AI review to start the trend.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ==================================================
                        ERROR
                    ================================================== */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* ==================================================
                        EMPTY STATE
                    ================================================== */}

          {!error && filteredReviews.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-[#111116] px-6 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <Bot size={25} />
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                {search || statusFilter !== "all"
                  ? "No AI reviews found"
                  : "No AI reviews yet"}
              </h2>

              <p className="mt-2 max-w-md text-sm text-gray-500">
                {search || statusFilter !== "all"
                  ? "Try changing your search or filter."
                  : "Create your first AI review to start analyzing your projects."}
              </p>

              {!search && statusFilter === "all" && (
                <button
                  type="button"
                  onClick={() => setShowCreateReview(true)}
                  className="mt-6 flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold transition hover:bg-purple-500"
                >
                  <Plus size={18} />
                  Create AI Review
                </button>
              )}
            </div>
          )}

          {/* ==================================================
                        REVIEW LIST
                    ================================================== */}

          {!error && filteredReviews.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111116]">
              {/* TABLE HEADER */}

              <div className="hidden border-b border-white/10 px-6 py-4 text-xs font-medium uppercase tracking-wide text-gray-500 md:grid md:grid-cols-[2fr_1.2fr_1.4fr_100px_1fr_80px]">
                <span>Review</span>

                <span>Project</span>

                <span>Pull Request</span>

                <span>Score</span>

                <span>Status</span>

                <span>Actions</span>
              </div>

              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="group border-b border-white/10 px-6 py-5 last:border-b-0 md:grid md:grid-cols-[2fr_1.2fr_1.4fr_100px_1fr_80px] md:items-center"
                >
                  {/* REVIEW */}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Bot size={17} className="shrink-0 text-purple-400" />

                      <button
                        type="button"
                        onClick={() => handleOpenDetails(review)}
                        className="truncate text-left font-semibold text-white transition hover:text-purple-400"
                      >
                        AI Code Review
                      </button>
                    </div>

                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {review.summary || "No review summary available."}
                    </p>
                  </div>

                  {/* PROJECT */}

                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-400 md:mt-0">
                    <FolderKanban size={16} className="text-purple-400" />

                    <span className="truncate">
                      {getProjectName(review.project_id)}
                    </span>
                  </div>

                  {/* PULL REQUEST */}

                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-400 md:mt-0">
                    <GitPullRequest size={16} className="text-purple-400" />

                    <span className="truncate">
                      {getPullRequestTitle(review.pull_request_id)}
                    </span>
                  </div>

                  {/* SCORE */}

                  <div className="mt-4 md:mt-0">
                    <span
                      className={
                        `text-lg font-bold ` + getScoreStyles(review.score)
                      }
                    >
                      {review.score !== null && review.score !== undefined
                        ? `${review.score}/100`
                        : "—"}
                    </span>
                  </div>

                  {/* STATUS */}

                  <div className="mt-4 md:mt-0">
                    <span
                      className={
                        `inline-flex rounded-full px-3 py-1 text-xs font-medium ` +
                        getStatusStyles(review.status)
                      }
                    >
                      {review.status
                        .replace("_", " ")
                        .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                    </span>
                  </div>

                  {/* ACTIONS */}

                  <div className="mt-4 flex justify-end gap-2 md:mt-0">
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(review)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-purple-500/10 hover:text-purple-400"
                      aria-label="View AI review details"
                      title="View details"
                    >
                      <Eye size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(review)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-purple-500/10 hover:text-purple-400"
                      aria-label="Edit AI review"
                      title="Edit review"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteReview(review.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
                      aria-label="Delete AI review"
                      title="Delete review"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  {/* FINDINGS */}

                  <div className="mt-5 md:col-span-6">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedReviewId(
                          expandedReviewId === review.id ? null : review.id,
                        )
                      }
                      className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-left transition hover:bg-white/[0.04]"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          Findings ({Array.isArray(review.findings) ? review.findings.length : 0})
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {Array.isArray(review.findings) && review.findings.length > 0
                            ? "View AI-identified issues, explanations, and recommendations."
                            : "No findings were reported for this review."}
                        </p>
                      </div>

                      <span className="text-xs font-medium text-purple-400">
                        {expandedReviewId === review.id ? "Hide" : "View"}
                      </span>
                    </button>

                    {expandedReviewId === review.id && (
                      <div className="mt-3 space-y-3">
                        {Array.isArray(review.findings) &&
                        review.findings.length > 0 ? (
                          review.findings.map((finding) => (
                            <div
                              key={finding.id}
                              className="rounded-xl border border-white/10 bg-[#0b0b0f] p-5"
                            >
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="min-w-0">
                                  <h3 className="font-semibold text-white">
                                    {finding.issue || "Code issue identified"}
                                  </h3>

                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                    {finding.filename && (
                                      <span className="rounded-md bg-white/5 px-2 py-1 text-gray-400">
                                        {finding.filename}
                                      </span>
                                    )}

                                    {finding.line_reference && (
                                      <span className="rounded-md bg-white/5 px-2 py-1 text-gray-400">
                                        {finding.line_reference}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <span
                                  className={
                                    "inline-flex w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase " +
                                    getSeverityStyles(finding.severity)
                                  }
                                >
                                  {finding.severity || "medium"}
                                </span>
                              </div>

                              {finding.explanation && (
                                <div className="mt-4">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Explanation
                                  </p>
                                  <p className="mt-1 text-sm leading-6 text-gray-300">
                                    {finding.explanation}
                                  </p>
                                </div>
                              )}

                              {finding.recommendation && (
                                <div className="mt-4 rounded-lg border border-purple-500/10 bg-purple-500/5 p-4">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-400">
                                    Recommendation
                                  </p>
                                  <p className="mt-1 text-sm leading-6 text-gray-300">
                                    {finding.recommendation}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="rounded-lg border border-white/10 bg-[#0b0b0f] p-5 text-sm text-gray-500">
                            This review has no AI findings.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ======================================================
                REVIEW DETAILS MODAL
            ====================================================== */}

      {selectedReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseDetails();
            }
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111116] shadow-2xl">
            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Bot size={20} className="text-purple-400" />
                  <h2 className="text-xl font-semibold text-white">
                    AI Code Review
                  </h2>
                </div>

                <p className="mt-1 truncate text-sm text-gray-500">
                  {getPullRequestTitle(selectedReview.pull_request_id)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseDetails}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Close review details"
              >
                <X size={20} />
              </button>
            </div>

            {/* CONTENT */}

            <div className="overflow-y-auto p-6">
              {/* OVERVIEW */}

              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Score
                  </p>
                  <p
                    className={
                      "mt-2 text-2xl font-bold " +
                      getScoreStyles(selectedReview.score)
                    }
                  >
                    {selectedReview.score !== null &&
                    selectedReview.score !== undefined
                      ? `${selectedReview.score}/100`
                      : "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Status
                  </p>
                  <span
                    className={
                      "mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium " +
                      getStatusStyles(selectedReview.status)
                    }
                  >
                    {selectedReview.status
                      .replace("_", " ")
                      .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                  </span>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Project
                  </p>
                  <p className="mt-2 truncate text-sm font-medium text-white">
                    {getProjectName(selectedReview.project_id)}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Findings
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {Array.isArray(selectedReview.findings)
                      ? selectedReview.findings.length
                      : 0}
                  </p>
                </div>
              </div>

              {/* SUMMARY */}

              <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  AI Summary
                </p>

                <p className="mt-2 text-sm leading-7 text-gray-300">
                  {selectedReview.summary || "No review summary available."}
                </p>
              </div>

              {/* FINDINGS */}

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Review Findings
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Issues identified by the AI code review engine.
                    </p>
                  </div>
                </div>

                {Array.isArray(selectedReview.findings) &&
                selectedReview.findings.length > 0 ? (
                  <div className="space-y-4">
                    {selectedReview.findings.map((finding, index) => (
                      <div
                        key={finding.id || `${selectedReview.id}-${index}`}
                        className="rounded-xl border border-white/10 bg-[#0b0b0f] p-5"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {finding.severity === "critical" ||
                                finding.severity === "high" ? (
                                  <AlertTriangle
                                    size={19}
                                    className="text-orange-400"
                                  />
                                ) : (
                                  <CheckCircle2
                                    size={19}
                                    className="text-yellow-400"
                                  />
                                )}
                              </div>

                              <div>
                                <h4 className="font-semibold text-white">
                                  {finding.issue || "Code issue identified"}
                                </h4>

                                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                  {finding.filename && (
                                    <span className="rounded-md bg-white/5 px-2 py-1 text-gray-400">
                                      {finding.filename}
                                    </span>
                                  )}

                                  {finding.line_reference && (
                                    <span className="rounded-md bg-white/5 px-2 py-1 text-gray-400">
                                      {finding.line_reference}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <span
                            className={
                              "inline-flex w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase " +
                              getSeverityStyles(finding.severity)
                            }
                          >
                            {finding.severity || "medium"}
                          </span>
                        </div>

                        {finding.explanation && (
                          <div className="mt-5 border-t border-white/10 pt-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Explanation
                            </p>
                            <p className="mt-2 text-sm leading-7 text-gray-300">
                              {finding.explanation}
                            </p>
                          </div>
                        )}

                        {finding.recommendation && (
                          <div className="mt-4 rounded-lg border border-purple-500/10 bg-purple-500/5 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-purple-400">
                              Recommendation
                            </p>
                            <p className="mt-2 text-sm leading-7 text-gray-300">
                              {finding.recommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
                    <CheckCircle2
                      size={28}
                      className="mx-auto text-green-400"
                    />
                    <p className="mt-3 font-medium text-white">
                      No issues found
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      This review did not report any AI findings.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER */}

            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
              <button
                type="button"
                onClick={() => setExpandedReviewId(null)}
                className="text-sm text-gray-500 transition hover:text-gray-300"
              >
                Close expanded findings
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseDetails}
                  className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
                >
                  Close
                </button>

                {(() => {
                  const selectedPR = pullRequests.find(
                    (pr) => pr.id === selectedReview.pull_request_id,
                  );

                  return selectedPR?.html_url ? (
                    <a
                      href={selectedPR.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-2.5 text-sm font-medium text-white transition hover:from-purple-500 hover:to-purple-400"
                    >
                      Open GitHub PR
                      <ExternalLink size={15} />
                    </a>
                  ) : null;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
                CREATE AI REVIEW MODAL
            ====================================================== */}

      {showCreateReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111116] shadow-2xl">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Create AI Review
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Connect an AI review to a Pull Request.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateReview(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleRunAIReview();
              }}
              className="space-y-5 p-6"
            >
              {/* ERROR */}

              {createError && (
                <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">AI review failed</p>
                    <p className="mt-1 text-red-300/80">{createError}</p>
                  </div>
                </div>
              )}

              {creating && (
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                  <div className="flex items-center gap-3">
                    <Loader2
                      size={20}
                      className="animate-spin text-purple-400"
                    />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {runStage === "github"
                          ? "Fetching GitHub Pull Request..."
                          : "AI is analyzing the Pull Request..."}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        GitHub changes are being reviewed by the AI engine.
                        Please keep this window open.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full w-1/2 animate-pulse rounded-full bg-purple-500" />
                  </div>
                </div>
              )}

              {runStage === "completed" && !creating && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
                  <CheckCircle2 size={18} />
                  <span>AI review completed successfully.</span>
                </div>
              )}

              {/* PROJECT */}

              <div>
                <label
                  htmlFor="review-project"
                  className="mb-2 block text-sm font-medium text-gray-200"
                >
                  Project
                </label>

                <select
                  id="review-project"
                  value={selectedProject}
                  onChange={handleProjectChange}
                  disabled={creating}
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                >
                  <option value="">Select a project</option>

                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* PULL REQUEST */}

              <div>
                <label
                  htmlFor="review-pull-request"
                  className="mb-2 block text-sm font-medium text-gray-200"
                >
                  Pull Request
                </label>

                <select
                  id="review-pull-request"
                  value={selectedPullRequest}
                  onChange={(event) =>
                    setSelectedPullRequest(event.target.value)
                  }
                  disabled={creating || projectPullRequests.length === 0}
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                >
                  <option value="">
                    {projectPullRequests.length === 0
                      ? "No Pull Requests for this project"
                      : "Select a Pull Request"}
                  </option>

                  {projectPullRequests.map((pullRequest) => (
                    <option key={pullRequest.id} value={pullRequest.id}>
                      {pullRequest.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() => setShowCreateReview(false)}
                  disabled={creating}
                  className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleRunAIReview}
                  disabled={
                    creating || !selectedProject || !selectedPullRequest
                  }
                  className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-2.5 text-sm font-medium text-white transition hover:from-purple-500 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <Loader2 size={16} className="mr-2 inline animate-spin" />
                      {runStage === "github"
                        ? "Fetching GitHub..."
                        : "Analyzing PR..."}
                    </>
                  ) : (
                    "Run AI Review"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
                EDIT AI REVIEW MODAL
            ====================================================== */}

      {showEditReview && editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111116] shadow-2xl">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Edit AI Review
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update the review details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowEditReview(false);

                  setEditingReview(null);

                  setUpdateError("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleUpdateReview} className="space-y-5 p-6">
              {updateError && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {updateError}
                </div>
              )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditReview(false);

                    setEditingReview(null);

                    setUpdateError("");
                  }}
                  disabled={updating}
                  className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-2.5 text-sm font-medium text-white transition hover:from-purple-500 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIReviews;