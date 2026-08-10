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

  const [selectedProject, setSelectedProject] = useState("");

  const [selectedPullRequest, setSelectedPullRequest] = useState("");


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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to run AI review.");
      }

      // Close the modal
      setShowCreateReview(false);

      // Refresh AI reviews
      await fetchData();

      // Clear errors
      setCreateError("");
    } catch (error) {
      console.error("Run GitHub AI review error:", error);

      setCreateError(error.message || "Unable to run AI review.");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateReview = async (event) => {
    event.preventDefault();

    setCreateError("");

    // --------------------------------------------------------
    // Validate project
    // --------------------------------------------------------

    if (!selectedProject) {
      setCreateError("Please select a project.");

      return;
    }

    // --------------------------------------------------------
    // Validate Pull Request
    // --------------------------------------------------------

    if (!selectedPullRequest) {
      setCreateError("Please select a Pull Request.");

      return;
    }

    // --------------------------------------------------------
    // Validate score
    // --------------------------------------------------------

    if (
      reviewScore !== "" &&
      (Number(reviewScore) < 0 || Number(reviewScore) > 100)
    ) {
      setCreateError("Score must be between 0 and 100.");

      return;
    }

    try {
      setCreating(true);

      // ====================================================
      // CREATE REVIEW
      // ====================================================

      const response = await fetch(
        `http://127.0.0.1:8000/api/projects/${selectedProject}/ai-reviews`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Accept: "application/json",

            Authorization: `Bearer ${accessToken}`,
          },

          body: JSON.stringify({
            pull_request_id: selectedPullRequest,

            status: reviewStatus,

            score: reviewScore === "" ? null : Number(reviewScore),

            summary: reviewSummary.trim() || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create AI review.");
      }

      // ====================================================
      // RESET FORM
      // ====================================================

      setReviewStatus("completed");

      setReviewScore("");

      setReviewSummary("");

      setCreateError("");

      // Close modal
      setShowCreateReview(false);

      // Refresh data
      await fetchData();
    } catch (error) {
      console.error("Create AI review error:", error);

      setCreateError(error.message || "Unable to create AI review.");
    } finally {
      setCreating(false);
    }
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

                      <h2 className="truncate font-semibold text-white">
                        AI Code Review
                      </h2>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

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

            <form onSubmit={handleCreateReview} className="space-y-5 p-6">
              {/* ERROR */}

              {createError && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {createError}
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
                  {creating ? "Running AI Review..." : "Run AI Review"}
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