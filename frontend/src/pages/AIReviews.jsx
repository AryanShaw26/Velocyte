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
  const { accessToken } = useAuth();

  // ============================================================
  // DATA
  // ============================================================

  const [reviews, setReviews] = useState([]);
  const [projects, setProjects] = useState([]);
  const [pullRequests, setPullRequests] = useState([]);

  // ============================================================
  // SEARCH / FILTER
  // ============================================================

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ============================================================
  // PAGE STATE
  // ============================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // ANALYTICS PROJECT FILTER
  // IMPORTANT:
  // This is separate from the project selected in Create Review.
  // ============================================================

  const [analyticsProject, setAnalyticsProject] = useState("");

  // ============================================================
  // CREATE REVIEW MODAL
  // ============================================================

  const [showCreateReview, setShowCreateReview] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [runStage, setRunStage] = useState("");

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedPullRequest, setSelectedPullRequest] = useState("");

  // ============================================================
  // REVIEW DETAILS
  // ============================================================

  const [expandedReviewId, setExpandedReviewId] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  // ============================================================
  // EDIT REVIEW
  // ============================================================

  const [showEditReview, setShowEditReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  // ============================================================
  // HELPER: NORMALIZE API LIST
  // ============================================================

  const normalizeList = (data, possibleKeys = []) => {
    if (Array.isArray(data)) {
      return data;
    }

    for (const key of possibleKeys) {
      if (Array.isArray(data?.[key])) {
        return data[key];
      }
    }

    return [];
  };

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

      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };

      // ========================================================
      // 1. FETCH REVIEWS
      // ========================================================

      const reviewsResponse = await fetch(
        "http://127.0.0.1:8000/api/ai-reviews",
        {
          method: "GET",
          headers,
        }
      );

      let reviewsData = {};

      try {
        reviewsData = await reviewsResponse.json();
      } catch {
        reviewsData = {};
      }

      if (!reviewsResponse.ok) {
        throw new Error(
          reviewsData.detail || "Failed to load AI reviews."
        );
      }

      const normalizedReviews = normalizeList(reviewsData, [
        "reviews",
        "ai_reviews",
        "data",
      ]);

      // ========================================================
      // 2. FETCH PROJECTS
      // ========================================================

      const projectsResponse = await fetch(
        "http://127.0.0.1:8000/api/projects",
        {
          method: "GET",
          headers,
        }
      );

      let projectsData = {};

      try {
        projectsData = await projectsResponse.json();
      } catch {
        projectsData = {};
      }

      if (!projectsResponse.ok) {
        throw new Error(
          projectsData.detail || "Failed to load projects."
        );
      }

      const normalizedProjects = normalizeList(projectsData, [
        "projects",
        "data",
      ]);

      // ========================================================
      // 3. FETCH PULL REQUESTS FOR EVERY PROJECT
      // ========================================================

      const allPullRequests = [];

      for (const project of normalizedProjects) {
        if (!project?.id) {
          continue;
        }

        try {
          const pullRequestsResponse = await fetch(
            `http://127.0.0.1:8000/api/projects/${project.id}/pull-requests`,
            {
              method: "GET",
              headers,
            }
          );

          if (!pullRequestsResponse.ok) {
            console.warn(
              `Unable to load pull requests for project ${project.id}`
            );
            continue;
          }

          let pullRequestsData = {};

          try {
            pullRequestsData = await pullRequestsResponse.json();
          } catch {
            pullRequestsData = {};
          }

          const normalizedPullRequests = normalizeList(
            pullRequestsData,
            [
              "pull_requests",
              "pullRequests",
              "data",
              "items",
            ]
          );

          // Add project_id ourselves if backend doesn't include it.
          normalizedPullRequests.forEach((pullRequest) => {
            allPullRequests.push({
              ...pullRequest,
              project_id:
                pullRequest.project_id ?? project.id,
            });
          });
        } catch (pullRequestError) {
          console.warn(
            `Failed to fetch PRs for project ${project.id}:`,
            pullRequestError
          );
        }
      }

      // ========================================================
      // STORE DATA
      // ========================================================

      setReviews(normalizedReviews);
      setProjects(normalizedProjects);
      setPullRequests(allPullRequests);

      // ========================================================
      // DEFAULT MODAL PROJECT
      // ========================================================

      if (
        normalizedProjects.length > 0 &&
        !selectedProject
      ) {
        setSelectedProject(
          String(normalizedProjects[0].id)
        );
      }

      // ========================================================
      // DEFAULT ANALYTICS PROJECT
      // Keep analytics as "All projects"
      // ========================================================

      // We intentionally do NOT automatically select
      // the first analytics project.
      // This allows the complete review history to appear.

      // ========================================================
      // DEFAULT MODAL PR
      // ========================================================

      if (
        allPullRequests.length > 0 &&
        !selectedPullRequest
      ) {
        setSelectedPullRequest(
          String(allPullRequests[0].id)
        );
      }
    } catch (fetchError) {
      console.error(
        "AI Reviews page error:",
        fetchError
      );

      setError(
        fetchError.message ||
          "Unable to load AI reviews."
      );
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
  // PROJECT NAME
  // ============================================================

  const getProjectName = (projectId) => {
    const project = projects.find(
      (item) =>
        String(item.id) === String(projectId)
    );

    return project?.name || "Unknown Project";
  };

  // ============================================================
  // GET PULL REQUEST
  // ============================================================

  const getPullRequest = (pullRequestId) => {
    return pullRequests.find(
      (pullRequest) =>
        String(pullRequest.id) ===
        String(pullRequestId)
    );
  };

  // ============================================================
  // GET PULL REQUEST TITLE
  // ============================================================

  const getPullRequestTitle = (pullRequestId) => {
    const pullRequest =
      getPullRequest(pullRequestId);

    return (
      pullRequest?.title ||
      pullRequest?.name ||
      `Pull Request #${pullRequest?.github_pr_number || pullRequestId || "Unknown"}`
    );
  };

  // ============================================================
  // PRS FOR CREATE-REVIEW PROJECT
  // IMPORTANT:
  // String() comparison fixes number/string mismatch.
  // ============================================================

  const projectPullRequests = useMemo(() => {
    if (!selectedProject) {
      return [];
    }

    return pullRequests.filter(
      (pullRequest) =>
        String(pullRequest.project_id) ===
        String(selectedProject)
    );
  }, [pullRequests, selectedProject]);

  // ============================================================
  // REVIEW HISTORY
  // ============================================================

  const projectReviewHistory = useMemo(() => {
    let scopedReviews = reviews;

    if (analyticsProject) {
      scopedReviews = reviews.filter(
        (review) =>
          String(review.project_id) ===
          String(analyticsProject)
      );
    }

    return [...scopedReviews].sort(
      (a, b) => {
        const dateA = new Date(
          a.created_at ||
            a.updated_at ||
            0
        ).getTime();

        const dateB = new Date(
          b.created_at ||
            b.updated_at ||
            0
        ).getTime();

        return dateA - dateB;
      }
    );
  }, [reviews, analyticsProject]);

  // ============================================================
  // SCORED REVIEWS
  // ============================================================

  const scoredHistory = useMemo(() => {
    return projectReviewHistory.filter(
      (review) =>
        review.score !== null &&
        review.score !== undefined &&
        review.score !== "" &&
        !Number.isNaN(
          Number(review.score)
        )
    );
  }, [projectReviewHistory]);

  // ============================================================
  // FORMAT DATE
  // ============================================================

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

  // ============================================================
  // SCORE TREND
  // ============================================================

  const getTrendPoints = () => {
    if (scoredHistory.length === 0) {
      return "";
    }

    const width = 760;
    const height = 220;
    const paddingX = 36;
    const paddingY = 24;

    const usableWidth =
      width - paddingX * 2;

    const usableHeight =
      height - paddingY * 2;

    return scoredHistory
      .map((review, index) => {
        const x =
          scoredHistory.length === 1
            ? width / 2
            : paddingX +
              (index /
                (scoredHistory.length - 1)) *
                usableWidth;

        const score = Math.max(
          0,
          Math.min(
            100,
            Number(review.score)
          )
        );

        const y =
          height -
          paddingY -
          (score / 100) *
            usableHeight;

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

    const usableWidth =
      width - paddingX * 2;

    const usableHeight =
      height - paddingY * 2;

    return scoredHistory.map(
      (review, index) => {
        const x =
          scoredHistory.length === 1
            ? width / 2
            : paddingX +
              (index /
                (scoredHistory.length - 1)) *
                usableWidth;

        const score = Math.max(
          0,
          Math.min(
            100,
            Number(review.score)
          )
        );

        const y =
          height -
          paddingY -
          (score / 100) *
            usableHeight;

        return {
          x,
          y,
          score,
          review,
        };
      }
    );
  };

  // ============================================================
  // FILTER REVIEWS
  // ============================================================

  const filteredReviews = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    return reviews.filter((review) => {
      const projectName =
        getProjectName(
          review.project_id
        ).toLowerCase();

      const pullRequestTitle =
        getPullRequestTitle(
          review.pull_request_id
        ).toLowerCase();

      const summary = (
        review.summary || ""
      ).toLowerCase();

      const matchesSearch =
        !searchValue ||
        projectName.includes(
          searchValue
        ) ||
        pullRequestTitle.includes(
          searchValue
        ) ||
        summary.includes(
          searchValue
        );

      const matchesStatus =
        statusFilter === "all" ||
        review.status ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    reviews,
    projects,
    pullRequests,
    search,
    statusFilter,
  ]);

  // ============================================================
  // PROJECT CHANGE IN CREATE REVIEW
  // ============================================================

  const handleProjectChange = (
    event
  ) => {
    const projectId =
      event.target.value;

    setSelectedProject(
      String(projectId)
    );

    const projectPRs =
      pullRequests.filter(
        (pullRequest) =>
          String(
            pullRequest.project_id
          ) === String(projectId)
      );

    if (projectPRs.length > 0) {
      setSelectedPullRequest(
        String(projectPRs[0].id)
      );
    } else {
      setSelectedPullRequest("");
    }
  };

  // ============================================================
  // OPEN CREATE REVIEW MODAL
  // ============================================================

  const handleOpenCreateReview = () => {
    setCreateError("");
    setRunStage("");

    // Automatically select first project
    if (projects.length > 0) {
      const firstProjectId =
        String(projects[0].id);

      setSelectedProject(
        firstProjectId
      );

      const firstProjectPRs =
        pullRequests.filter(
          (pullRequest) =>
            String(
              pullRequest.project_id
            ) === firstProjectId
        );

      if (firstProjectPRs.length > 0) {
        setSelectedPullRequest(
          String(firstProjectPRs[0].id)
        );
      } else {
        setSelectedPullRequest("");
      }
    } else {
      setSelectedProject("");
      setSelectedPullRequest("");
    }

    setShowCreateReview(true);
  };

  // ============================================================
  // RUN AI REVIEW
  // ============================================================

  const handleRunAIReview =
    async () => {
      setCreateError("");
      setRunStage("");

      if (!selectedProject) {
        setCreateError(
          "Please select a project."
        );
        return;
      }

      if (!selectedPullRequest) {
        setCreateError(
          "Please select a Pull Request."
        );
        return;
      }

      const selectedPR =
        pullRequests.find(
          (pullRequest) =>
            String(pullRequest.id) ===
            String(
              selectedPullRequest
            )
        );

      if (!selectedPR) {
        setCreateError(
          "Pull Request not found."
        );
        return;
      }

      if (!selectedPR.github_pr_number) {
        setCreateError(
          "This Pull Request is not connected to a GitHub Pull Request."
        );
        return;
      }

      try {
        setCreating(true);
        setRunStage("github");

        const response =
          await fetch(
            `http://127.0.0.1:8000/api/projects/${selectedProject}/ai-reviews/run/${selectedPR.github_pr_number}`,
            {
              method: "POST",
              headers: {
                Accept:
                  "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

        setRunStage(
          "processing"
        );

        let data = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          throw new Error(
            data.detail ||
              data.message ||
              "The AI review could not be completed."
          );
        }

        // Refresh all data
        await fetchData();

        setRunStage(
          "completed"
        );

        await new Promise(
          (resolve) =>
            setTimeout(resolve, 700)
        );

        setShowCreateReview(
          false
        );

        setCreateError("");
        setRunStage("");
      } catch (runError) {
        console.error(
          "Run GitHub AI review error:",
          runError
        );

        setRunStage("failed");

        setCreateError(
          runError.message ||
            "Unable to run AI review."
        );
      } finally {
        setCreating(false);
      }
    };

  // ============================================================
  // REVIEW DETAILS
  // ============================================================

  const handleOpenDetails = (
    review
  ) => {
    setSelectedReview(review);
  };

  const handleCloseDetails =
    () => {
      setSelectedReview(null);
    };

  // ============================================================
  // OPEN EDIT
  // ============================================================

  const handleOpenEdit = (
    review
  ) => {
    setEditingReview({
      ...review,
    });

    setUpdateError("");
    setShowEditReview(true);
  };

  // ============================================================
  // UPDATE REVIEW
  // ============================================================

  const handleUpdateReview =
    async (event) => {
      event.preventDefault();

      if (!editingReview) {
        return;
      }

      setUpdateError("");

      if (
        editingReview.score !==
          null &&
        editingReview.score !==
          "" &&
        (
          Number(
            editingReview.score
          ) < 0 ||
          Number(
            editingReview.score
          ) > 100
        )
      ) {
        setUpdateError(
          "Score must be between 0 and 100."
        );
        return;
      }

      try {
        setUpdating(true);

        const response =
          await fetch(
            `http://127.0.0.1:8000/api/projects/ai-reviews/${editingReview.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
                Accept:
                  "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                status:
                  editingReview.status,

                score:
                  editingReview.score ===
                    "" ||
                  editingReview.score ===
                    null
                    ? null
                    : Number(
                        editingReview.score
                      ),

                summary:
                  editingReview.summary ||
                  null,
              }),
            }
          );

        let data = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Failed to update AI review."
          );
        }

        setReviews(
          (currentReviews) =>
            currentReviews.map(
              (review) =>
                String(review.id) ===
                String(data.id)
                  ? data
                  : review
            )
        );

        setShowEditReview(
          false
        );

        setEditingReview(null);
        setUpdateError("");
      } catch (updateErrorValue) {
        console.error(
          "Update AI review error:",
          updateErrorValue
        );

        setUpdateError(
          updateErrorValue.message ||
            "Unable to update AI review."
        );
      } finally {
        setUpdating(false);
      }
    };

  // ============================================================
  // DELETE REVIEW
  // ============================================================

  const handleDeleteReview =
    async (reviewId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this AI review?"
        );

      if (!confirmed) {
        return;
      }

      try {
        const response =
          await fetch(
            `http://127.0.0.1:8000/api/projects/ai-reviews/${reviewId}`,
            {
              method: "DELETE",
              headers: {
                Accept:
                  "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

        if (!response.ok) {
          let data = {};

          try {
            data =
              await response.json();
          } catch {
            data = {};
          }

          throw new Error(
            data.detail ||
              "Failed to delete AI review."
          );
        }

        setReviews(
          (currentReviews) =>
            currentReviews.filter(
              (review) =>
                String(review.id) !==
                String(reviewId)
            )
        );

        if (
          selectedReview &&
          String(
            selectedReview.id
          ) === String(reviewId)
        ) {
          setSelectedReview(null);
        }
      } catch (deleteError) {
        console.error(
          "Delete AI review error:",
          deleteError
        );

        alert(
          deleteError.message ||
            "Unable to delete AI review."
        );
      }
    };

  // ============================================================
  // STATUS STYLES
  // ============================================================

  const getStatusStyles = (
    status
  ) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-400";

      case "failed":
        return "bg-red-500/10 text-red-400";

      case "processing":
        return "bg-blue-500/10 text-blue-400";

      default:
        return "bg-purple-500/10 text-purple-400";
    }
  };

  // ============================================================
  // SCORE STYLES
  // ============================================================

  const getScoreStyles = (
    score
  ) => {
    if (
      score === null ||
      score === undefined ||
      score === ""
    ) {
      return "text-gray-500";
    }

    if (Number(score) >= 80) {
      return "text-emerald-400";
    }

    if (Number(score) >= 60) {
      return "text-yellow-400";
    }

    return "text-red-400";
  };

  // ============================================================
  // SEVERITY STYLES
  // ============================================================

  const getSeverityStyles = (
    severity
  ) => {
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
              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="h-28 animate-pulse rounded-xl bg-[#111116]"
                  />
                )
              )}
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
              HEADER
          ================================================== */}

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                AI Reviews
              </h1>

              <p className="mt-2 text-gray-400">
                Review code quality, risks, and
                AI-generated insights.
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleOpenCreateReview
              }
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
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search AI reviews..."
                className="w-full rounded-lg border border-white/10 bg-[#111116] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-purple-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-lg border border-white/10 bg-[#111116] px-4 py-3 text-sm text-gray-300 outline-none focus:border-purple-500"
            >
              <option value="all">
                All statuses
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="processing">
                Processing
              </option>

              <option value="failed">
                Failed
              </option>
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

          {!error && (
            <section className="mb-8 space-y-5">

              {/* ==================================================
                  ANALYTICS HEADER
              ================================================== */}

              <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#111116] p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Bot
                      size={18}
                      className="text-purple-400"
                    />

                    <h2 className="text-lg font-semibold text-white">
                      Code Quality History
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    Track previous AI reviews
                    and score changes over
                    time.
                  </p>
                </div>

                <select
                  value={analyticsProject}
                  onChange={(event) =>
                    setAnalyticsProject(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-2.5 text-sm text-gray-300 outline-none focus:border-purple-500 lg:w-64"
                >
                  <option value="">
                    All projects
                  </option>

                  {projects.map(
                    (project) => (
                      <option
                        key={project.id}
                        value={String(
                          project.id
                        )}
                      >
                        {project.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* ==================================================
                  REVIEW HISTORY
              ================================================== */}

              <div className="rounded-xl border border-white/10 bg-[#111116] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">
                      Review History
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      {analyticsProject
                        ? `Previous reviews for ${getProjectName(
                            analyticsProject
                          )}`
                        : "Previous AI reviews across your projects"}
                    </p>
                  </div>

                  <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
                    {
                      projectReviewHistory.length
                    }{" "}
                    review
                    {projectReviewHistory.length ===
                    1
                      ? ""
                      : "s"}
                  </span>
                </div>

                {projectReviewHistory.length >
                0 ? (
                  <div className="space-y-2">
                    {[
                      ...projectReviewHistory,
                    ]
                      .reverse()
                      .map(
                        (review) => (
                          <button
                            key={
                              review.id
                            }
                            type="button"
                            onClick={() =>
                              handleOpenDetails(
                                review
                              )
                            }
                            className="grid w-full grid-cols-[1fr_auto] items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-purple-500/20 hover:bg-white/[0.04] md:grid-cols-[1.8fr_1fr_120px_110px]"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white">
                                {getPullRequestTitle(
                                  review.pull_request_id
                                )}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {formatReviewDate(
                                  review.created_at ||
                                    review.updated_at
                                )}
                              </p>
                            </div>

                            <span className="hidden truncate text-xs text-gray-400 md:block">
                              {getProjectName(
                                review.project_id
                              )}
                            </span>

                            <span
                              className={
                                "text-sm font-bold " +
                                getScoreStyles(
                                  review.score
                                )
                              }
                            >
                              {review.score !==
                                null &&
                              review.score !==
                                undefined &&
                              review.score !==
                                ""
                                ? `${review.score}/100`
                                : "—"}
                            </span>

                            <span
                              className={
                                "hidden rounded-full px-2.5 py-1 text-center text-xs font-medium md:inline-flex " +
                                getStatusStyles(
                                  review.status
                                )
                              }
                            >
                              {(
                                review.status ||
                                "unknown"
                              )
                                .replace(
                                  "_",
                                  " "
                                )
                                .replace(
                                  /\b\w/g,
                                  (
                                    letter
                                  ) =>
                                    letter.toUpperCase()
                                )}
                            </span>

                            <span className="text-xs text-purple-400 md:hidden">
                              View
                            </span>
                          </button>
                        )
                      )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-white/10 bg-[#0b0b0f] p-8 text-center">
                    <p className="text-sm font-medium text-white">
                      No review history yet
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Completed reviews will
                      appear here automatically.
                    </p>
                  </div>
                )}
              </div>

              {/* ==================================================
                  SCORE TREND
              ================================================== */}

              <div className="rounded-xl border border-white/10 bg-[#111116] p-5">
                <div className="mb-4">
                  <h3 className="font-semibold text-white">
                    Score Trend
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    AI code quality score over
                    time.
                  </p>
                </div>

                {scoredHistory.length >
                0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <svg
                        viewBox="0 0 760 220"
                        className="h-56 min-w-[680px] w-full"
                        role="img"
                        aria-label="AI review score trend"
                      >
                        {[0, 25, 50, 75, 100].map(
                          (score) => {
                            const y =
                              196 -
                              (score /
                                100) *
                                172;

                            return (
                              <g
                                key={
                                  score
                                }
                              >
                                <line
                                  x1="36"
                                  y1={
                                    y
                                  }
                                  x2="724"
                                  y2={
                                    y
                                  }
                                  stroke="rgba(255,255,255,0.08)"
                                  strokeWidth="1"
                                />

                                <text
                                  x="4"
                                  y={
                                    y +
                                    4
                                  }
                                  fill="rgba(156,163,175,0.8)"
                                  fontSize="11"
                                >
                                  {
                                    score
                                  }
                                </text>
                              </g>
                            );
                          }
                        )}

                        <polyline
                          points={getTrendPoints()}
                          fill="none"
                          stroke="#a855f7"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {getTrendPointCoordinates().map(
                          ({
                            x,
                            y,
                            score,
                            review,
                          }) => (
                            <g
                              key={
                                review.id
                              }
                            >
                              <circle
                                cx={
                                  x
                                }
                                cy={
                                  y
                                }
                                r="5"
                                fill="#a855f7"
                                stroke="#111116"
                                strokeWidth="3"
                              />

                              <text
                                x={
                                  x
                                }
                                y={
                                  y -
                                  11
                                }
                                textAnchor="middle"
                                fill="white"
                                fontSize="11"
                                fontWeight="600"
                              >
                                {
                                  score
                                }
                              </text>
                            </g>
                          )
                        )}
                      </svg>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Reviews
                        </p>

                        <p className="mt-1 text-xl font-bold text-white">
                          {
                            scoredHistory.length
                          }
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
                              scoredHistory[
                                scoredHistory.length -
                                  1
                              ].score
                            )
                          }
                        >
                          {
                            scoredHistory[
                              scoredHistory.length -
                                1
                            ].score
                          }
                          /100
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
                              scoredHistory[
                                scoredHistory.length -
                                  1
                              ].score
                            ) -
                              Number(
                                scoredHistory[0]
                                  .score
                              ) >=
                            0
                              ? "text-emerald-400"
                              : "text-red-400")
                          }
                        >
                          {Number(
                            scoredHistory[
                              scoredHistory.length -
                                1
                            ].score
                          ) -
                            Number(
                              scoredHistory[0]
                                .score
                            ) >=
                          0
                            ? "+"
                            : ""}

                          {Number(
                            scoredHistory[
                              scoredHistory.length -
                                1
                            ].score
                          ) -
                            Number(
                              scoredHistory[0]
                                .score
                            )}
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
                      Run at least one scored AI
                      review to start the trend.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ==================================================
              EMPTY REVIEW LIST
          ================================================== */}

          {!error &&
            filteredReviews.length ===
              0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-[#111116] px-6 py-20 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <Bot size={25} />
                </div>

                <h2 className="mt-5 text-lg font-semibold">
                  {search ||
                  statusFilter !==
                    "all"
                    ? "No AI reviews found"
                    : "No AI reviews yet"}
                </h2>

                <p className="mt-2 max-w-md text-sm text-gray-500">
                  {search ||
                  statusFilter !==
                    "all"
                    ? "Try changing your search or filter."
                    : "Create your first AI review to start analyzing your projects."}
                </p>

                {!search &&
                  statusFilter ===
                    "all" && (
                    <button
                      type="button"
                      onClick={
                        handleOpenCreateReview
                      }
                      className="mt-6 flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold transition hover:bg-purple-500"
                    >
                      <Plus size={18} />
                      Create AI Review
                    </button>
                  )}
              </div>
            )}

          {/* ==================================================
              REVIEW TABLE
          ================================================== */}

          {!error &&
            filteredReviews.length >
              0 && (
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111116]">

                <div className="hidden border-b border-white/10 px-6 py-4 text-xs font-medium uppercase tracking-wide text-gray-500 md:grid md:grid-cols-[2fr_1.2fr_1.4fr_100px_1fr_80px]">
                  <span>
                    Review
                  </span>

                  <span>
                    Project
                  </span>

                  <span>
                    Pull Request
                  </span>

                  <span>
                    Score
                  </span>

                  <span>
                    Status
                  </span>

                  <span>
                    Actions
                  </span>
                </div>

                {filteredReviews.map(
                  (review) => (
                    <div
                      key={
                        review.id
                      }
                      className="group border-b border-white/10 px-6 py-5 last:border-b-0 md:grid md:grid-cols-[2fr_1.2fr_1.4fr_100px_1fr_80px] md:items-center"
                    >
                      {/* REVIEW */}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Bot
                            size={17}
                            className="shrink-0 text-purple-400"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenDetails(
                                review
                              )
                            }
                            className="truncate text-left font-semibold text-white hover:text-purple-400"
                          >
                            AI Code Review
                          </button>
                        </div>

                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                          {review.summary ||
                            "No review summary available."}
                        </p>
                      </div>

                      {/* PROJECT */}

                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-400 md:mt-0">
                        <FolderKanban
                          size={16}
                          className="text-purple-400"
                        />

                        <span className="truncate">
                          {getProjectName(
                            review.project_id
                          )}
                        </span>
                      </div>

                      {/* PR */}

                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-400 md:mt-0">
                        <GitPullRequest
                          size={16}
                          className="text-purple-400"
                        />

                        <span className="truncate">
                          {getPullRequestTitle(
                            review.pull_request_id
                          )}
                        </span>
                      </div>

                      {/* SCORE */}

                      <div className="mt-4 md:mt-0">
                        <span
                          className={
                            "text-lg font-bold " +
                            getScoreStyles(
                              review.score
                            )
                          }
                        >
                          {review.score !==
                            null &&
                          review.score !==
                            undefined &&
                          review.score !==
                            ""
                            ? `${review.score}/100`
                            : "—"}
                        </span>
                      </div>

                      {/* STATUS */}

                      <div className="mt-4 md:mt-0">
                        <span
                          className={
                            "inline-flex rounded-full px-3 py-1 text-xs font-medium " +
                            getStatusStyles(
                              review.status
                            )
                          }
                        >
                          {(
                            review.status ||
                            "unknown"
                          )
                            .replace(
                              "_",
                              " "
                            )
                            .replace(
                              /\b\w/g,
                              (
                                letter
                              ) =>
                                letter.toUpperCase()
                            )}
                        </span>
                      </div>

                      {/* ACTIONS */}

                      <div className="mt-4 flex justify-end gap-2 md:mt-0">
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenDetails(
                              review
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-purple-500/10 hover:text-purple-400"
                          title="View details"
                        >
                          <Eye
                            size={17}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenEdit(
                              review
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-purple-500/10 hover:text-purple-400"
                          title="Edit review"
                        >
                          <Pencil
                            size={17}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteReview(
                              review.id
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-red-500/10 hover:text-red-400"
                          title="Delete review"
                        >
                          <Trash2
                            size={17}
                          />
                        </button>
                      </div>

                      {/* FINDINGS */}

                      <div className="mt-5 md:col-span-6">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedReviewId(
                              expandedReviewId ===
                                review.id
                                ? null
                                : review.id
                            )
                          }
                          className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-left hover:bg-white/[0.04]"
                        >
                          <div>
                            <p className="text-sm font-medium text-white">
                              Findings (
                              {Array.isArray(
                                review.findings
                              )
                                ? review.findings
                                    .length
                                : 0}
                              )
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {Array.isArray(
                                review.findings
                              ) &&
                              review.findings
                                .length >
                                0
                                ? "View AI-identified issues, explanations, and recommendations."
                                : "No findings were reported for this review."}
                            </p>
                          </div>

                          <span className="text-xs font-medium text-purple-400">
                            {expandedReviewId ===
                            review.id
                              ? "Hide"
                              : "View"}
                          </span>
                        </button>

                        {expandedReviewId ===
                          review.id && (
                          <div className="mt-3 space-y-3">
                            {Array.isArray(
                              review.findings
                            ) &&
                            review.findings
                              .length >
                              0 ? (
                              review.findings.map(
                                (
                                  finding,
                                  index
                                ) => (
                                  <div
                                    key={
                                      finding.id ||
                                      `${review.id}-${index}`
                                    }
                                    className="rounded-xl border border-white/10 bg-[#0b0b0f] p-5"
                                  >
                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                      <div className="min-w-0">
                                        <h3 className="font-semibold text-white">
                                          {finding.issue ||
                                            "Code issue identified"}
                                        </h3>

                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                          {finding.filename && (
                                            <span className="rounded-md bg-white/5 px-2 py-1 text-gray-400">
                                              {
                                                finding.filename
                                              }
                                            </span>
                                          )}

                                          {finding.line_reference && (
                                            <span className="rounded-md bg-white/5 px-2 py-1 text-gray-400">
                                              {
                                                finding.line_reference
                                              }
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <span
                                        className={
                                          "inline-flex w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase " +
                                          getSeverityStyles(
                                            finding.severity
                                          )
                                        }
                                      >
                                        {finding.severity ||
                                          "medium"}
                                      </span>
                                    </div>

                                    {finding.explanation && (
                                      <div className="mt-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                          Explanation
                                        </p>

                                        <p className="mt-1 text-sm leading-6 text-gray-300">
                                          {
                                            finding.explanation
                                          }
                                        </p>
                                      </div>
                                    )}

                                    {finding.recommendation && (
                                      <div className="mt-4 rounded-lg border border-purple-500/10 bg-purple-500/5 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-purple-400">
                                          Recommendation
                                        </p>

                                        <p className="mt-1 text-sm leading-6 text-gray-300">
                                          {
                                            finding.recommendation
                                          }
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )
                              )
                            ) : (
                              <div className="rounded-lg border border-white/10 bg-[#0b0b0f] p-5 text-sm text-gray-500">
                                This review has no AI findings.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
        </div>
      </main>

      {/* ========================================================
          REVIEW DETAILS MODAL
      ======================================================== */}

      {selectedReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              handleCloseDetails();
            }
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111116] shadow-2xl">

            <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Bot
                    size={20}
                    className="text-purple-400"
                  />

                  <h2 className="text-xl font-semibold text-white">
                    AI Code Review
                  </h2>
                </div>

                <p className="mt-1 truncate text-sm text-gray-500">
                  {getPullRequestTitle(
                    selectedReview.pull_request_id
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseDetails
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6">

              <div className="grid gap-4 md:grid-cols-4">

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Score
                  </p>

                  <p
                    className={
                      "mt-2 text-2xl font-bold " +
                      getScoreStyles(
                        selectedReview.score
                      )
                    }
                  >
                    {selectedReview.score !==
                      null &&
                    selectedReview.score !==
                      undefined
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
                      getStatusStyles(
                        selectedReview.status
                      )
                    }
                  >
                    {(
                      selectedReview.status ||
                      "unknown"
                    )
                      .replace(
                        "_",
                        " "
                      )
                      .replace(
                        /\b\w/g,
                        (
                          letter
                        ) =>
                          letter.toUpperCase()
                      )}
                  </span>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Project
                  </p>

                  <p className="mt-2 truncate text-sm font-medium text-white">
                    {getProjectName(
                      selectedReview.project_id
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Findings
                  </p>

                  <p className="mt-2 text-2xl font-bold text-white">
                    {Array.isArray(
                      selectedReview.findings
                    )
                      ? selectedReview.findings
                          .length
                      : 0}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  AI Summary
                </p>

                <p className="mt-2 text-sm leading-7 text-gray-300">
                  {selectedReview.summary ||
                    "No review summary available."}
                </p>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white">
                  Review Findings
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Issues identified by the AI
                  code review engine.
                </p>

                {Array.isArray(
                  selectedReview.findings
                ) &&
                selectedReview.findings
                  .length > 0 ? (
                  <div className="mt-4 space-y-4">
                    {selectedReview.findings.map(
                      (
                        finding,
                        index
                      ) => (
                        <div
                          key={
                            finding.id ||
                            `${selectedReview.id}-${index}`
                          }
                          className="rounded-xl border border-white/10 bg-[#0b0b0f] p-5"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex items-start gap-3">
                              {finding.severity ===
                                "critical" ||
                              finding.severity ===
                                "high" ? (
                                <AlertTriangle
                                  size={19}
                                  className="mt-0.5 text-orange-400"
                                />
                              ) : (
                                <CheckCircle2
                                  size={19}
                                  className="mt-0.5 text-yellow-400"
                                />
                              )}

                              <div>
                                <h4 className="font-semibold text-white">
                                  {finding.issue ||
                                    "Code issue identified"}
                                </h4>

                                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                  {finding.filename && (
                                    <span className="rounded-md bg-white/5 px-2 py-1 text-gray-400">
                                      {
                                        finding.filename
                                      }
                                    </span>
                                  )}

                                  {finding.line_reference && (
                                    <span className="rounded-md bg-white/5 px-2 py-1 text-gray-400">
                                      {
                                        finding.line_reference
                                      }
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <span
                              className={
                                "inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase " +
                                getSeverityStyles(
                                  finding.severity
                                )
                              }
                            >
                              {finding.severity ||
                                "medium"}
                            </span>
                          </div>

                          {finding.explanation && (
                            <div className="mt-5 border-t border-white/10 pt-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Explanation
                              </p>

                              <p className="mt-2 text-sm leading-7 text-gray-300">
                                {
                                  finding.explanation
                                }
                              </p>
                            </div>
                          )}

                          {finding.recommendation && (
                            <div className="mt-4 rounded-lg border border-purple-500/10 bg-purple-500/5 p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-purple-400">
                                Recommendation
                              </p>

                              <p className="mt-2 text-sm leading-7 text-gray-300">
                                {
                                  finding.recommendation
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
                    <CheckCircle2
                      size={28}
                      className="mx-auto text-green-400"
                    />

                    <p className="mt-3 font-medium text-white">
                      No issues found
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
              <button
                type="button"
                onClick={
                  handleCloseDetails
                }
                className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white"
              >
                Close
              </button>

              {(() => {
                const selectedPR =
                  getPullRequest(
                    selectedReview.pull_request_id
                  );

                return selectedPR?.html_url ? (
                  <a
                    href={
                      selectedPR.html_url
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-2.5 text-sm font-medium text-white"
                  >
                    Open GitHub PR
                    <ExternalLink
                      size={15}
                    />
                  </a>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CREATE AI REVIEW MODAL
      ======================================================== */}

      {showCreateReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111116] shadow-2xl">

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Create AI Review
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Connect an AI review to a
                  Pull Request.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreateReview(
                    false
                  )
                }
                disabled={creating}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleRunAIReview();
              }}
              className="space-y-5 p-6"
            >

              {createError && (
                <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="font-medium">
                      AI review failed
                    </p>

                    <p className="mt-1 text-red-300/80">
                      {createError}
                    </p>
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
                        {runStage ===
                        "github"
                          ? "Fetching GitHub Pull Request..."
                          : "AI is analyzing the Pull Request..."}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Please keep this window
                        open.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {runStage ===
                "completed" &&
                !creating && (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
                    <CheckCircle2
                      size={18}
                    />

                    <span>
                      AI review completed
                      successfully.
                    </span>
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
                  onChange={
                    handleProjectChange
                  }
                  disabled={creating}
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                >
                  <option value="">
                    Select a project
                  </option>

                  {projects.map(
                    (project) => (
                      <option
                        key={project.id}
                        value={String(
                          project.id
                        )}
                      >
                        {project.name}
                      </option>
                    )
                  )}
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
                  value={
                    selectedPullRequest
                  }
                  onChange={(event) =>
                    setSelectedPullRequest(
                      event.target.value
                    )
                  }
                  disabled={
                    creating ||
                    !selectedProject ||
                    projectPullRequests.length ===
                      0
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                >
                  <option value="">
                    {!selectedProject
                      ? "Select a project first"
                      : projectPullRequests.length ===
                        0
                      ? "No Pull Requests for this project"
                      : "Select a Pull Request"}
                  </option>

                  {projectPullRequests.map(
                    (pullRequest) => (
                      <option
                        key={
                          pullRequest.id
                        }
                        value={String(
                          pullRequest.id
                        )}
                      >
                        #{pullRequest.github_pr_number
                          ? `${pullRequest.github_pr_number} `
                          : ""}
                        {pullRequest.title ||
                          `Pull Request ${pullRequest.id}`}
                      </option>
                    )
                  )}
                </select>

                {selectedProject &&
                  projectPullRequests.length ===
                    0 && (
                    <p className="mt-2 text-xs text-yellow-400">
                      No pull requests were
                      found for this project.
                    </p>
                  )}
              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setShowCreateReview(
                      false
                    )
                  }
                  disabled={creating}
                  className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creating ||
                    !selectedProject ||
                    !selectedPullRequest
                  }
                  className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-2.5 text-sm font-medium text-white hover:from-purple-500 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <Loader2
                        size={16}
                        className="mr-2 inline animate-spin"
                      />

                      {runStage ===
                      "github"
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

      {/* ========================================================
          EDIT AI REVIEW MODAL
      ======================================================== */}

      {showEditReview &&
        editingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111116] shadow-2xl">

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
                    setShowEditReview(
                      false
                    );
                    setEditingReview(
                      null
                    );
                    setUpdateError("");
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-white/5 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={
                  handleUpdateReview
                }
                className="space-y-5 p-6"
              >
                {updateError && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {updateError}
                  </div>
                )}

                {/* STATUS */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-200">
                    Status
                  </label>

                  <select
                    value={
                      editingReview.status ||
                      ""
                    }
                    onChange={(event) =>
                      setEditingReview(
                        {
                          ...editingReview,
                          status:
                            event.target
                              .value,
                        }
                      )
                    }
                    disabled={updating}
                    className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  >
                    <option value="completed">
                      Completed
                    </option>

                    <option value="processing">
                      Processing
                    </option>

                    <option value="failed">
                      Failed
                    </option>
                  </select>
                </div>

                {/* SCORE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-200">
                    Score
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={
                      editingReview.score ??
                      ""
                    }
                    onChange={(event) =>
                      setEditingReview(
                        {
                          ...editingReview,
                          score:
                            event.target
                              .value,
                        }
                      )
                    }
                    disabled={updating}
                    className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>

                {/* SUMMARY */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-200">
                    Summary
                  </label>

                  <textarea
                    rows={4}
                    value={
                      editingReview.summary ||
                      ""
                    }
                    onChange={(event) =>
                      setEditingReview(
                        {
                          ...editingReview,
                          summary:
                            event.target
                              .value,
                        }
                      )
                    }
                    disabled={updating}
                    className="w-full resize-none rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditReview(
                        false
                      );
                      setEditingReview(
                        null
                      );
                      setUpdateError("");
                    }}
                    disabled={updating}
                    className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updating}
                    className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {updating
                      ? "Saving..."
                      : "Save Changes"}
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