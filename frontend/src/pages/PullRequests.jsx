import { useEffect, useMemo, useState } from "react";

import {
  GitPullRequest,
  Search,
  ExternalLink,
  FolderKanban,
  RefreshCw,
  GitBranch,
  X,
  ArrowLeft,
  Calendar,
  User,
  FileCode2,
  GitMerge,
} from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import { useAuth } from "../context/AuthContext";

function PullRequests() {
  // ============================================================
  // AUTHENTICATION
  // ============================================================

  const { accessToken } = useAuth();

  // ============================================================
  // DATA
  // ============================================================

  const [projects, setProjects] = useState([]);
  const [pullRequests, setPullRequests] = useState([]);

  // ============================================================
  // SELECTED PROJECT
  // ============================================================

  const [selectedProject, setSelectedProject] = useState("");

  // ============================================================
  // SELECTED PR
  // ============================================================

  const [selectedPR, setSelectedPR] = useState(null);

  const [loadingPRDetails, setLoadingPRDetails] =
    useState(false);

  const [prDetailsError, setPrDetailsError] =
    useState("");

  // ============================================================
  // PR CODE CHANGES
  // ============================================================

  const [changedFiles, setChangedFiles] = useState([]);
  const [prDiff, setPrDiff] = useState("");
  const [loadingChanges, setLoadingChanges] = useState(false);
  const [changesError, setChangesError] = useState("");
  const [expandedFiles, setExpandedFiles] = useState({});

  // ============================================================
  // AI REVIEW
  // ============================================================

  const [aiReview, setAIReview] = useState(null);
  const [runningAIReview, setRunningAIReview] = useState(false);
  const [aiReviewError, setAIReviewError] = useState("");

  // ============================================================
  // GITHUB PR ACTIONS
  // ============================================================

  const [prAction, setPRAction] = useState(null);
  const [prActionError, setPRActionError] = useState("");
  const [showPRActionModal, setShowPRActionModal] = useState(false);
  const [processingPRAction, setProcessingPRAction] = useState(false);

  // ============================================================
  // SEARCH + FILTER
  // ============================================================

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ============================================================
  // PAGE STATE
  // ============================================================

  const [loadingProjects, setLoadingProjects] =
    useState(true);

  const [loadingPRs, setLoadingPRs] =
    useState(false);

  const [error, setError] = useState("");
  const [prError, setPrError] = useState("");

  // ============================================================
  // AUTH HEADERS
  // ============================================================

  const getHeaders = () => ({
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  });

  // ============================================================
  // FETCH PROJECTS
  // ============================================================

  const fetchProjects = async () => {
    if (!accessToken) {
      setLoadingProjects(false);
      return;
    }

    try {
      setLoadingProjects(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/projects",
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load projects."
        );
      }

      const projectList = Array.isArray(data)
        ? data
        : data.projects || [];

      setProjects(projectList);

      // Automatically select first GitHub project
      if (!selectedProject) {
        const githubProject = projectList.find(
          (project) =>
            project.github_repo_id &&
            project.github_owner &&
            project.github_repository
        );

        if (githubProject) {
          setSelectedProject(
            githubProject.id
          );
        }
      }
    } catch (error) {
      console.error(
        "Fetch projects error:",
        error
      );

      setError(
        error.message ||
          "Unable to load projects."
      );
    } finally {
      setLoadingProjects(false);
    }
  };

  // ============================================================
  // FETCH REAL GITHUB PULL REQUESTS
  // ============================================================

  const fetchGithubPullRequests = async (
    projectId = selectedProject
  ) => {
    if (!accessToken || !projectId) {
      setPullRequests([]);
      return;
    }

    try {
      setLoadingPRs(true);
      setPrError("");

      const response = await fetch(
        `http://127.0.0.1:8000/api/github/projects/${projectId}/pull-requests`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to load GitHub pull requests."
        );
      }

      const githubPRs = Array.isArray(
        data.pull_requests
      )
        ? data.pull_requests
        : [];

      setPullRequests(githubPRs);
    } catch (error) {
      console.error(
        "Fetch GitHub pull requests error:",
        error
      );

      setPullRequests([]);

      setPrError(
        error.message ||
          "Unable to load GitHub pull requests."
      );
    } finally {
      setLoadingPRs(false);
    }
  };

  // ============================================================
  // FETCH ONE GITHUB PR
  // ============================================================

  const fetchPullRequestDetails = async (
    prNumber
  ) => {
    if (
      !accessToken ||
      !selectedProject ||
      !prNumber
    ) {
      return;
    }

    try {
      setLoadingPRDetails(true);
      setPrDetailsError("");

      const response = await fetch(
        `http://127.0.0.1:8000/api/github/projects/${selectedProject}/pull-requests/${prNumber}`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to load pull request details."
        );
      }

      setSelectedPR(
        data.pull_request
      );
    } catch (error) {
      console.error(
        "Fetch PR details error:",
        error
      );

      setPrDetailsError(
        error.message ||
          "Unable to load pull request details."
      );
    } finally {
      setLoadingPRDetails(false);
    }
  };

  // ============================================================
  // FETCH PR CHANGED FILES + ACTUAL DIFF
  // ============================================================

  const fetchPullRequestChanges = async (
    prNumber,
    projectId = selectedProject
  ) => {
    if (!accessToken || !projectId || !prNumber) {
      return;
    }

    try {
      setLoadingChanges(true);
      setChangesError("");
      setChangedFiles([]);
      setPrDiff("");

      const [filesResponse, diffResponse] =
        await Promise.all([
          fetch(
            `http://127.0.0.1:8000/api/github/projects/${projectId}/pull-requests/${prNumber}/files`,
            {
              method: "GET",
              headers: getHeaders(),
            }
          ),
          fetch(
            `http://127.0.0.1:8000/api/github/projects/${projectId}/pull-requests/${prNumber}/diff`,
            {
              method: "GET",
              headers: getHeaders(),
            }
          ),
        ]);

      const filesData = await filesResponse.json();
      const diffData = await diffResponse.json();

      if (!filesResponse.ok) {
        throw new Error(
          filesData.detail || "Failed to load changed files."
        );
      }

      if (!diffResponse.ok) {
        throw new Error(
          diffData.detail || "Failed to load pull request diff."
        );
      }

      setChangedFiles(
        Array.isArray(filesData.files)
          ? filesData.files
          : []
      );

      setPrDiff(
        typeof diffData.diff === "string"
          ? diffData.diff
          : ""
      );
    } catch (error) {
      console.error("Fetch PR changes error:", error);

      setChangesError(
        error.message ||
          "Unable to load pull request changes."
      );
    } finally {
      setLoadingChanges(false);
    }
  };

  // ============================================================
  // RUN AI REVIEW
  // ============================================================

  const runAIReview = async (prNumber) => {
    if (!accessToken || !selectedProject || !prNumber) {
      return;
    }

    try {
      setRunningAIReview(true);
      setAIReviewError("");
      setAIReview(null);

      const response = await fetch(
        `http://127.0.0.1:8000/api/projects/${selectedProject}/ai-reviews/run/${prNumber}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to run AI review."
        );
      }

      setAIReview(data);
    } catch (error) {
      console.error("AI review error:", error);

      setAIReviewError(
        error.message || "Unable to run AI review."
      );
    } finally {
      setRunningAIReview(false);
    }
  };

  // ============================================================
  // OPEN MERGE / CLOSE CONFIRMATION
  // ============================================================

  const openPRActionConfirmation = (action) => {
    setPRAction(action);
    setPRActionError("");
    setShowPRActionModal(true);
  };

  const closePRActionConfirmation = () => {
    if (processingPRAction) {
      return;
    }

    setShowPRActionModal(false);
    setPRAction(null);
    setPRActionError("");
  };

  // ============================================================
  // EXECUTE MERGE / CLOSE ACTION
  // ============================================================

  const executePRAction = async () => {
    if (
      !accessToken ||
      !selectedProject ||
      !selectedPR ||
      !prAction
    ) {
      return;
    }

    try {
      setProcessingPRAction(true);
      setPRActionError("");

      const endpoint =
        prAction === "merge"
          ? `http://127.0.0.1:8000/api/github/projects/${selectedProject}/pull-requests/${selectedPR.number}/merge`
          : `http://127.0.0.1:8000/api/github/projects/${selectedProject}/pull-requests/${selectedPR.number}/close`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            `Failed to ${prAction} pull request.`
        );
      }

      // Close confirmation modal immediately after GitHub accepts
      // the operation.
      setShowPRActionModal(false);
      setPRAction(null);

      // GitHub is the source of truth. Re-fetch both the list and
      // the selected PR so the UI immediately moves the PR to
      // MERGED or CLOSED.
      await fetchGithubPullRequests(selectedProject);
      await fetchPullRequestDetails(selectedPR.number);
    } catch (error) {
      console.error(
        `GitHub PR ${prAction} error:`,
        error
      );

      setPRActionError(
        error.message ||
          `Unable to ${prAction} pull request.`
      );
    } finally {
      setProcessingPRAction(false);
    }
  };

  // ============================================================
  // TOGGLE FILE PATCH
  // ============================================================

  const toggleFile = (filename) => {
    setExpandedFiles((previous) => ({
      ...previous,
      [filename]: !previous[filename],
    }));
  };

  // ============================================================
  // SELECT PR
  // ============================================================

  const handleSelectPR = async (pullRequest) => {
    setSelectedPR(null);
    setChangedFiles([]);
    setPrDiff("");
    setExpandedFiles({});
    setChangesError("");
    setAIReview(null);
    setAIReviewError("");

    await fetchPullRequestDetails(
      pullRequest.number
    );

    await fetchPullRequestChanges(
      pullRequest.number
    );
  };

  // ============================================================
  // CLOSE PR DETAILS
  // ============================================================

  const closePRDetails = () => {
    setSelectedPR(null);
    setPrDetailsError("");
    setChangedFiles([]);
    setPrDiff("");
    setChangesError("");
    setExpandedFiles({});
    setAIReview(null);
    setAIReviewError("");
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchProjects();
  }, [accessToken]);

  // ============================================================
  // LOAD PRs WHEN PROJECT CHANGES
  // ============================================================

  useEffect(() => {
    if (selectedProject) {
      setSelectedPR(null);

      fetchGithubPullRequests(
        selectedProject
      );
    }
  }, [
    selectedProject,
    accessToken,
  ]);

  // ============================================================
  // SELECTED PROJECT
  // ============================================================

  const currentProject = useMemo(() => {
    return projects.find(
      (project) =>
        project.id === selectedProject
    );
  }, [
    projects,
    selectedProject,
  ]);

  // ============================================================
  // PR STATUS
  //
  // GitHub is the source of truth:
  //
  // merged === true
  //      -> MERGED
  //
  // state === "closed"
  //      -> CLOSED
  //
  // state === "open"
  //      -> OPEN
  // ============================================================

  const getPRStatus = (pullRequest) => {
    if (pullRequest.merged === true) {
      return "merged";
    }

    if (
      pullRequest.state === "closed"
    ) {
      return "closed";
    }

    return "open";
  };

  // ============================================================
  // STATUS STYLES
  // ============================================================

  const getStatusStyles = (status) => {
    switch (status) {
      case "merged":
        return "bg-purple-500/10 text-purple-400";

      case "closed":
        return "bg-red-500/10 text-red-400";

      case "open":
      default:
        return "bg-emerald-500/10 text-emerald-400";
    }
  };

  // ============================================================
  // FILTER PULL REQUESTS
  // ============================================================

  const filteredPullRequests = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    return pullRequests.filter(
      (pullRequest) => {
        const status =
          getPRStatus(
            pullRequest
          );

        const title =
          (
            pullRequest.title || ""
          ).toLowerCase();

        const author =
          (
            pullRequest.author || ""
          ).toLowerCase();

        const branch =
          (
            pullRequest.head_branch ||
            ""
          ).toLowerCase();

        const matchesSearch =
          !searchValue ||
          title.includes(
            searchValue
          ) ||
          author.includes(
            searchValue
          ) ||
          branch.includes(
            searchValue
          );

        const matchesStatus =
          statusFilter === "all" ||
          status === statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    pullRequests,
    search,
    statusFilter,
  ]);

  // ============================================================
  // GROUP PRs BY STATUS
  // ============================================================

  const openPullRequests = useMemo(() => {
    return filteredPullRequests.filter(
      (pullRequest) =>
        getPRStatus(
          pullRequest
        ) === "open"
    );
  }, [filteredPullRequests]);

  const mergedPullRequests = useMemo(() => {
    return filteredPullRequests.filter(
      (pullRequest) =>
        getPRStatus(
          pullRequest
        ) === "merged"
    );
  }, [filteredPullRequests]);

  const closedPullRequests = useMemo(() => {
    return filteredPullRequests.filter(
      (pullRequest) =>
        getPRStatus(
          pullRequest
        ) === "closed"
    );
  }, [filteredPullRequests]);

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    try {
      return new Date(
        date
      ).toLocaleDateString(
        undefined,
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      );
    } catch {
      return "Unknown date";
    }
  };

  // ============================================================
  // LOADING PROJECTS
  // ============================================================

  if (loadingProjects) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white">
        <Sidebar />

        <main className="ml-64 min-h-screen p-8">
          <div className="mx-auto max-w-7xl">

            <div className="h-8 w-64 animate-pulse rounded bg-white/10" />

            <div className="mt-3 h-5 w-96 animate-pulse rounded bg-white/5" />

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
  // PR DETAILS VIEW
  // ============================================================

  if (selectedPR) {
    const status =
      getPRStatus(selectedPR);

    return (
      <div className="min-h-screen bg-[#07070a] text-white">

        <Sidebar />

        <main className="ml-64 min-h-screen p-8">

          <div className="mx-auto max-w-5xl">

            {/* BACK */}

            <button
              type="button"
              onClick={
                closePRDetails
              }
              className="mb-6 flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
            >
              <ArrowLeft size={17} />
              Back to Pull Requests
            </button>

            {/* PR DETAILS CARD */}

            <div className="rounded-2xl border border-white/10 bg-[#111116]">

              {/* HEADER */}

              <div className="border-b border-white/10 p-6">

                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                  <div className="min-w-0">

                    <div className="flex items-center gap-3">

                      <GitPullRequest
                        size={24}
                        className="shrink-0 text-purple-400"
                      />

                      <span className="text-gray-500">
                        #{selectedPR.number}
                      </span>

                      <h1 className="text-2xl font-bold">
                        {selectedPR.title}
                      </h1>

                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyles(
                          status
                        )}`}
                      >
                        {status
                          .charAt(0)
                          .toUpperCase() +
                          status.slice(1)}
                      </span>

                      {selectedPR.draft && (
                        <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
                          Draft
                        </span>
                      )}

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      closePRDetails
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/5 hover:text-white"
                  >
                    <X size={19} />
                  </button>

                </div>

              </div>

              {/* PR METADATA */}

              <div className="grid gap-4 border-b border-white/10 p-6 sm:grid-cols-2 lg:grid-cols-4">

                <div>

                  <p className="text-xs text-gray-500">
                    Author
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-300">
                    <User size={15} />

                    {selectedPR.author ||
                      "Unknown"}
                  </div>

                </div>

                <div>

                  <p className="text-xs text-gray-500">
                    Branch
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-300">

                    <GitBranch size={15} />

                    <span className="truncate">
                      {
                        selectedPR.head_branch
                      }
                    </span>

                  </div>

                  <p className="ml-5 mt-1 text-xs text-gray-600">
                    →{" "}
                    {
                      selectedPR.base_branch
                    }
                  </p>

                </div>

                <div>

                  <p className="text-xs text-gray-500">
                    Created
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-300">

                    <Calendar size={15} />

                    {formatDate(
                      selectedPR.created_at
                    )}

                  </div>

                </div>

                <div>

                  <p className="text-xs text-gray-500">
                    Files changed
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-300">

                    <FileCode2 size={15} />

                    {selectedPR.changed_files ??
                      "—"}

                  </div>

                </div>

              </div>

              {/* DESCRIPTION */}

              <div className="border-b border-white/10 p-6">

                <h2 className="mb-3 text-sm font-semibold text-gray-200">
                  Description
                </h2>

                <div className="rounded-xl border border-white/10 bg-[#0b0b0f] p-5">

                  {selectedPR.body ? (
                    <p className="whitespace-pre-wrap text-sm leading-7 text-gray-400">
                      {selectedPR.body}
                    </p>
                  ) : (
                    <p className="text-sm italic text-gray-600">
                      No description provided.
                    </p>
                  )}

                </div>

              </div>

              {/* CODE CHANGES */}

              <div className="border-b border-white/10 p-6">

                <h2 className="mb-4 text-sm font-semibold text-gray-200">
                  Code Changes
                </h2>

                <div className="grid gap-4 sm:grid-cols-3">

                  <div className="rounded-xl border border-white/10 bg-[#0b0b0f] p-4">

                    <p className="text-xs text-gray-500">
                      Additions
                    </p>

                    <p className="mt-2 text-xl font-semibold text-emerald-400">
                      +{selectedPR.additions ?? 0}
                    </p>

                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#0b0b0f] p-4">

                    <p className="text-xs text-gray-500">
                      Deletions
                    </p>

                    <p className="mt-2 text-xl font-semibold text-red-400">
                      -{selectedPR.deletions ?? 0}
                    </p>

                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#0b0b0f] p-4">

                    <p className="text-xs text-gray-500">
                      Changed files
                    </p>

                    <p className="mt-2 text-xl font-semibold text-white">
                      {selectedPR.changed_files ??
                        0}
                    </p>

                  </div>

                </div>

              </div>

              {/* ==================================================
                  CHANGED FILES
              ================================================== */}

              <div className="border-b border-white/10 p-6">

                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-200">
                      Changed Files
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Files modified by this pull request
                    </p>
                  </div>

                  {!loadingChanges && (
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">
                      {changedFiles.length} file
                      {changedFiles.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {loadingChanges && (
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0b0b0f] p-5">
                    <RefreshCw
                      size={18}
                      className="animate-spin text-purple-400"
                    />
                    <span className="text-sm text-gray-400">
                      Loading changed files and code diff...
                    </span>
                  </div>
                )}

                {changesError && !loadingChanges && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                    {changesError}
                  </div>
                )}

                {!loadingChanges &&
                  !changesError &&
                  changedFiles.length === 0 && (
                    <div className="rounded-xl border border-white/10 bg-[#0b0b0f] p-5 text-sm text-gray-500">
                      No changed files were returned by GitHub.
                    </div>
                  )}

                {!loadingChanges &&
                  !changesError &&
                  changedFiles.length > 0 && (
                    <div className="space-y-2">
                      {changedFiles.map((file) => {
                        const isExpanded =
                          Boolean(
                            expandedFiles[file.filename]
                          );

                        return (
                          <div
                            key={file.filename}
                            className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0f]"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                toggleFile(
                                  file.filename
                                )
                              }
                              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-white/[0.025]"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <FileCode2
                                  size={17}
                                  className="shrink-0 text-purple-400"
                                />
                                <span className="truncate text-sm text-gray-300">
                                  {file.filename}
                                </span>
                              </div>

                              <div className="flex shrink-0 items-center gap-3">
                                <span className="text-xs text-emerald-400">
                                  +{file.additions ?? 0}
                                </span>

                                <span className="text-xs text-red-400">
                                  -{file.deletions ?? 0}
                                </span>

                                <span className="text-xs text-gray-600">
                                  {file.status}
                                </span>

                                <span className="text-xs text-gray-500">
                                  {isExpanded
                                    ? "Hide"
                                    : "View"}
                                </span>
                              </div>
                            </button>

                            {isExpanded &&
                              file.patch && (
                                <pre className="max-h-[500px] overflow-auto border-t border-white/10 bg-[#07070a] p-4 text-xs leading-6 text-gray-400">
                                  <code>{file.patch}</code>
                                </pre>
                              )}

                            {isExpanded &&
                              !file.patch && (
                                <div className="border-t border-white/10 p-4 text-xs text-gray-600">
                                  GitHub did not provide a patch for this file.
                                </div>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  )}
              </div>

              {/* ==================================================
                  ACTUAL PULL REQUEST DIFF
              ================================================== */}

              <div className="border-b border-white/10 p-6">

                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-gray-200">
                    Code Diff
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Complete GitHub diff for this pull request
                  </p>
                </div>

                {loadingChanges && (
                  <div className="rounded-xl border border-white/10 bg-[#0b0b0f] p-5 text-sm text-gray-500">
                    Loading diff...
                  </div>
                )}

                {!loadingChanges &&
                  !changesError &&
                  prDiff && (
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#07070a]">
                      <div className="flex items-center justify-between border-b border-white/10 bg-[#0b0b0f] px-4 py-3">
                        <span className="text-xs font-medium text-gray-400">
                          GitHub Pull Request Diff
                        </span>

                        <span className="text-xs text-gray-600">
                          {prDiff.split("\n").length} lines
                        </span>
                      </div>

                      <pre className="max-h-[650px] overflow-auto p-5 text-xs leading-6 text-gray-400">
                        <code>{prDiff}</code>
                      </pre>
                    </div>
                  )}

                {!loadingChanges &&
                  !changesError &&
                  !prDiff && (
                    <div className="rounded-xl border border-white/10 bg-[#0b0b0f] p-5 text-sm text-gray-500">
                      No diff was returned by GitHub.
                    </div>
                  )}
              </div>

              {/* MERGED INFORMATION */}

              {status === "merged" && (
                <div className="border-b border-white/10 p-6">

                  <div className="flex items-center gap-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">

                    <GitMerge
                      size={20}
                      className="text-purple-400"
                    />

                    <div>

                      <p className="text-sm font-medium text-purple-300">
                        Pull request merged
                      </p>

                      {selectedPR.merged_at && (
                        <p className="mt-1 text-xs text-gray-500">
                          Merged on{" "}
                          {formatDate(
                            selectedPR.merged_at
                          )}
                        </p>
                      )}

                    </div>

                  </div>

                </div>
              )}

              {/* CLOSED INFORMATION */}

              {status === "closed" && (
                <div className="border-b border-white/10 p-6">

                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">

                    <p className="text-sm font-medium text-red-300">
                      Pull request closed
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      This pull request was closed without being merged.
                    </p>

                  </div>

                </div>
              )}

              {/* ==================================================
                  AI REVIEW RESULT
              ================================================== */}

              {aiReview && (
                <div className="border-b border-white/10 p-6">

                  <div className="mb-5 flex items-center justify-between gap-4">

                    <div>
                      <h2 className="text-sm font-semibold text-gray-200">
                        AI Code Review
                      </h2>

                      <p className="mt-1 text-xs text-gray-500">
                        Automated review generated from the GitHub pull request changes.
                      </p>
                    </div>

                    <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3 text-center">

                      <p className="text-xs text-gray-500">
                        Score
                      </p>

                      <p className="mt-1 text-2xl font-bold text-purple-400">
                        {aiReview.score ?? "—"}
                        {aiReview.score !== null &&
                        aiReview.score !== undefined
                          ? "/100"
                          : ""}
                      </p>

                    </div>

                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#0b0b0f] p-5">

                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Summary
                    </p>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-300">
                      {aiReview.summary ||
                        "No AI review summary was returned."}
                    </p>

                  </div>

                  <div className="mt-5">

                    <div className="mb-3 flex items-center justify-between">

                      <div>
                        <h3 className="text-sm font-semibold text-gray-200">
                          Findings
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Issues identified by the AI reviewer.
                        </p>
                      </div>

                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">
                        {(aiReview.findings || []).length} finding
                        {(aiReview.findings || []).length !== 1
                          ? "s"
                          : ""}
                      </span>

                    </div>

                    {(aiReview.findings || []).length === 0 ? (

                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">

                        <p className="text-sm font-medium text-emerald-300">
                          No issues found
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          The AI reviewer did not identify any supported issues in the submitted changes.
                        </p>

                      </div>

                    ) : (

                      <div className="space-y-3">

                        {(aiReview.findings || []).map(
                          (finding, index) => {

                            const severity = (
                              finding.severity || "medium"
                            ).toLowerCase();

                            const severityClass =
                              severity === "critical"
                                ? "border-red-500/30 bg-red-500/5 text-red-300"
                                : severity === "high"
                                ? "border-orange-500/30 bg-orange-500/5 text-orange-300"
                                : severity === "low"
                                ? "border-blue-500/30 bg-blue-500/5 text-blue-300"
                                : "border-yellow-500/30 bg-yellow-500/5 text-yellow-300";

                            return (
                              <div
                                key={
                                  finding.id ||
                                  `${finding.filename}-${index}`
                                }
                                className="rounded-xl border border-white/10 bg-[#0b0b0f] p-5"
                              >

                                <div className="flex flex-wrap items-center gap-2">

                                  <span
                                    className={`rounded-full border px-2.5 py-1 text-xs font-medium uppercase ${severityClass}`}
                                  >
                                    {severity}
                                  </span>

                                  {finding.filename && (
                                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-gray-400">
                                      {finding.filename}
                                    </span>
                                  )}

                                  {finding.line_reference && (
                                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-gray-500">
                                      {finding.line_reference}
                                    </span>
                                  )}

                                </div>

                                <h4 className="mt-4 text-sm font-semibold text-white">
                                  {finding.issue ||
                                    "Review finding"}
                                </h4>

                                {finding.explanation && (
                                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-400">
                                    {finding.explanation}
                                  </p>
                                )}

                                {finding.recommendation && (
                                  <div className="mt-4 rounded-lg border border-purple-500/10 bg-purple-500/5 p-4">

                                    <p className="text-xs font-medium text-purple-300">
                                      Recommendation
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-gray-400">
                                      {finding.recommendation}
                                    </p>

                                  </div>
                                )}

                              </div>
                            );
                          }
                        )}

                      </div>

                    )}

                  </div>

                </div>
              )}

              {aiReviewError && (
                <div className="border-b border-white/10 p-6">

                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">

                    <p className="text-sm font-medium text-red-300">
                      AI review failed
                    </p>

                    <p className="mt-1 text-sm text-red-400">
                      {aiReviewError}
                    </p>

                  </div>

                </div>
              )}

              {/* ==================================================
                  PR ACTION ERROR
              ================================================== */}

              {prActionError && (
                <div className="border-b border-white/10 p-6">
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                    <p className="text-sm font-medium text-red-300">
                      GitHub action failed
                    </p>
                    <p className="mt-1 text-sm text-red-400">
                      {prActionError}
                    </p>
                  </div>
                </div>
              )}

              {/* ACTIONS */}

              <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">

                <a
                  href={
                    selectedPR.html_url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-5 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
                >
                  <ExternalLink size={16} />
                  Open on GitHub
                </a>

                {/* OPEN-PR ACTIONS */}

                {status === "open" && (
                  <div className="flex flex-col gap-3 sm:flex-row">

                    {/* AI REVIEW */}

                    <button
                      type="button"
                      onClick={() =>
                        runAIReview(selectedPR.number)
                      }
                      disabled={
                        runningAIReview ||
                        processingPRAction
                      }
                      className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 text-sm font-medium text-white transition hover:from-purple-500 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {runningAIReview && (
                        <RefreshCw
                          size={16}
                          className="animate-spin"
                        />
                      )}

                      {runningAIReview
                        ? "Reviewing..."
                        : "Review with AI"}
                    </button>

                    {/* MERGE */}

                    <button
                      type="button"
                      onClick={() =>
                        openPRActionConfirmation("merge")
                      }
                      disabled={
                        runningAIReview ||
                        processingPRAction
                      }
                      className="flex items-center justify-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-6 py-3 text-sm font-medium text-purple-300 transition hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <GitMerge size={16} />
                      Merge PR
                    </button>

                    {/* CLOSE */}

                    <button
                      type="button"
                      onClick={() =>
                        openPRActionConfirmation("close")
                      }
                      disabled={
                        runningAIReview ||
                        processingPRAction
                      }
                      className="flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-6 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X size={16} />
                      Close PR
                    </button>

                  </div>
                )}

              </div>

            </div>

          </div>

        </main>

        {/* ========================================================
            MERGE / CLOSE CONFIRMATION MODAL
        ======================================================== */}

        {showPRActionModal && selectedPR && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111116] shadow-2xl">

              <div className="flex items-start justify-between border-b border-white/10 p-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {prAction === "merge"
                      ? "Merge Pull Request?"
                      : "Close Pull Request?"}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    #{selectedPR.number} {selectedPR.title}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closePRActionConfirmation}
                  disabled={processingPRAction}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close confirmation"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6">

                {prAction === "merge" ? (
                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                    <p className="text-sm leading-6 text-gray-300">
                      This will perform the real GitHub merge. The pull
                      request will be merged into{" "}
                      <span className="font-medium text-white">
                        {selectedPR.base_branch}
                      </span>.
                    </p>
                    <p className="mt-3 text-xs leading-5 text-gray-500">
                      Make sure the AI review and GitHub checks are
                      satisfactory before continuing.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                    <p className="text-sm leading-6 text-gray-300">
                      This will close the real GitHub pull request
                      without merging it.
                    </p>
                    <p className="mt-3 text-xs leading-5 text-gray-500">
                      The PR will remain visible in Velocyte under
                      Closed Pull Requests.
                    </p>
                  </div>
                )}

                {prActionError && (
                  <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
                    {prActionError}
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-3">

                  <button
                    type="button"
                    onClick={closePRActionConfirmation}
                    disabled={processingPRAction}
                    className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={executePRAction}
                    disabled={processingPRAction}
                    className={
                      prAction === "merge"
                        ? "flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                        : "flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    }
                  >
                    {processingPRAction && (
                      <RefreshCw
                        size={16}
                        className="animate-spin"
                      />
                    )}

                    {processingPRAction
                      ? prAction === "merge"
                        ? "Merging..."
                        : "Closing..."
                      : prAction === "merge"
                      ? "Confirm Merge"
                      : "Confirm Close"}
                  </button>

                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ============================================================
  // MAIN PR LIST
  // ============================================================

  return (
    <div className="min-h-screen bg-[#07070a] text-white">

      <Sidebar />

      <main className="ml-64 min-h-screen p-8">

        <div className="mx-auto max-w-7xl">

          {/* ====================================================
              HEADER
          ==================================================== */}

          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h1 className="text-3xl font-bold">
                Pull Requests
              </h1>

              <p className="mt-2 text-gray-400">
                View and review real GitHub pull requests.
              </p>

            </div>

            {/* PROJECT SELECTOR */}

            <div className="flex items-center gap-3">

              <FolderKanban
                size={18}
                className="text-purple-400"
              />

              <select
                value={selectedProject}
                onChange={(event) =>
                  setSelectedProject(
                    event.target.value
                  )
                }
                className="min-w-[260px] rounded-lg border border-white/10 bg-[#111116] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
              >

                <option value="">
                  Select GitHub project
                </option>

                {projects
                  .filter(
                    (project) =>
                      project.github_repo_id &&
                      project.github_owner &&
                      project.github_repository
                  )
                  .map(
                    (project) => (
                      <option
                        key={project.id}
                        value={project.id}
                      >
                        {project.name}
                      </option>
                    )
                  )}

              </select>

              <button
                type="button"
                onClick={() =>
                  fetchGithubPullRequests()
                }
                disabled={
                  !selectedProject ||
                  loadingPRs
                }
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-[#111116] text-gray-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                title="Refresh pull requests"
              >

                <RefreshCw
                  size={18}
                  className={
                    loadingPRs
                      ? "animate-spin"
                      : ""
                  }
                />

              </button>

            </div>

          </div>

          {/* ====================================================
              CONNECTED REPOSITORY
          ==================================================== */}

          {currentProject && (
            <div className="mb-6 flex flex-col gap-2 rounded-xl border border-purple-500/20 bg-purple-500/5 px-5 py-4 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Connected repository
                </p>

                <p className="mt-1 font-medium text-white">
                  {currentProject.github_owner}/
                  {currentProject.github_repository}
                </p>

              </div>

              <a
                href={`https://github.com/${currentProject.github_owner}/${currentProject.github_repository}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
              >
                Open GitHub
                <ExternalLink size={15} />
              </a>

            </div>
          )}

          {/* ====================================================
              SEARCH + FILTER
          ==================================================== */}

          {selectedProject && (
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
                  placeholder="Search GitHub pull requests..."
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

                <option value="open">
                  Open
                </option>

                <option value="merged">
                  Merged
                </option>

                <option value="closed">
                  Closed
                </option>

              </select>

            </div>
          )}

          {/* ====================================================
              ERROR
          ==================================================== */}

          {(error || prError) && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-400">
              {error || prError}
            </div>
          )}

          {/* ====================================================
              NO PROJECT
          ==================================================== */}

          {!selectedProject && !error && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-[#111116] px-6 py-20 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <GitPullRequest size={25} />
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                Select a GitHub project
              </h2>

              <p className="mt-2 max-w-md text-sm text-gray-500">
                Select a project connected to a GitHub repository to view its real pull requests.
              </p>

            </div>
          )}

          {/* ====================================================
              LOADING
          ==================================================== */}

          {selectedProject &&
            loadingPRs && (
              <div className="space-y-3">

                {[1, 2, 3].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-32 animate-pulse rounded-xl bg-[#111116]"
                    />
                  )
                )}

              </div>
            )}

          {/* ====================================================
              EMPTY
          ==================================================== */}

          {selectedProject &&
            !loadingPRs &&
            !prError &&
            filteredPullRequests.length ===
              0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-[#111116] px-6 py-20 text-center">

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <GitPullRequest size={25} />
                </div>

                <h2 className="mt-5 text-lg font-semibold">
                  {search ||
                  statusFilter !==
                    "all"
                    ? "No pull requests found"
                    : "No GitHub pull requests"}
                </h2>

                <p className="mt-2 max-w-md text-sm text-gray-500">
                  {search ||
                  statusFilter !==
                    "all"
                    ? "Try changing your search or status filter."
                    : "This repository does not currently have any pull requests."}
                </p>

              </div>
            )}

          {/* ====================================================
              SEPARATED PR SECTIONS
          ==================================================== */}

          {selectedProject &&
            !loadingPRs &&
            !prError &&
            filteredPullRequests.length > 0 && (
              <div className="space-y-8">

                {/* ==================================================
                    OPEN
                ================================================== */}

                {openPullRequests.length > 0 && (
                  <PRSection
                    title="Open Pull Requests"
                    count={
                      openPullRequests.length
                    }
                    status="open"
                    pullRequests={
                      openPullRequests
                    }
                    onSelectPR={
                      handleSelectPR
                    }
                    getStatusStyles={
                      getStatusStyles
                    }
                    formatDate={
                      formatDate
                    }
                  />
                )}

                {/* ==================================================
                    MERGED
                ================================================== */}

                {mergedPullRequests.length >
                  0 && (
                  <PRSection
                    title="Merged Pull Requests"
                    count={
                      mergedPullRequests.length
                    }
                    status="merged"
                    pullRequests={
                      mergedPullRequests
                    }
                    onSelectPR={
                      handleSelectPR
                    }
                    getStatusStyles={
                      getStatusStyles
                    }
                    formatDate={
                      formatDate
                    }
                  />
                )}

                {/* ==================================================
                    CLOSED
                ================================================== */}

                {closedPullRequests.length >
                  0 && (
                  <PRSection
                    title="Closed Pull Requests"
                    count={
                      closedPullRequests.length
                    }
                    status="closed"
                    pullRequests={
                      closedPullRequests
                    }
                    onSelectPR={
                      handleSelectPR
                    }
                    getStatusStyles={
                      getStatusStyles
                    }
                    formatDate={
                      formatDate
                    }
                  />
                )}

              </div>
            )}

        </div>
      </main>

      {/* ========================================================
          PR DETAILS LOADING
      ======================================================== */}

      {loadingPRDetails && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">

          <div className="rounded-xl border border-white/10 bg-[#111116] px-8 py-6 text-center">

            <RefreshCw
              size={24}
              className="mx-auto animate-spin text-purple-400"
            />

            <p className="mt-4 text-sm text-gray-300">
              Loading pull request...
            </p>

          </div>

        </div>
      )}

      {/* ========================================================
          PR DETAILS ERROR
      ======================================================== */}

      {prDetailsError && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-xl border border-red-500/20 bg-[#111116] p-6">

            <div className="flex items-start justify-between">

              <h2 className="font-semibold text-white">
                Unable to load PR
              </h2>

              <button
                type="button"
                onClick={() =>
                  setPrDetailsError("")
                }
                className="text-gray-500 hover:text-white"
              >
                <X size={18} />
              </button>

            </div>

            <p className="mt-3 text-sm text-red-400">
              {prDetailsError}
            </p>

          </div>

        </div>
      )}

    </div>
  );
}

// ============================================================
// PR SECTION COMPONENT
// ============================================================

function PRSection({
  title,
  count,
  status,
  pullRequests,
  onSelectPR,
  getStatusStyles,
  formatDate,
}) {
  return (
    <section>

      {/* ======================================================
          SECTION HEADER
      ====================================================== */}

      <div className="mb-3 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <h2 className="text-lg font-semibold text-white">
            {title}
          </h2>

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyles(
              status
            )}`}
          >
            {count}
          </span>

        </div>

      </div>

      {/* ======================================================
          PR CARDS
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111116]">

        {pullRequests.map(
          (pullRequest) => (
            <div
              key={
                pullRequest.number
              }
              onClick={() =>
                onSelectPR(
                  pullRequest
                )
              }
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  onSelectPR(
                    pullRequest
                  );
                }
              }}
              className="group cursor-pointer border-b border-white/10 px-6 py-5 transition last:border-b-0 hover:bg-white/[0.025]"
            >

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

                {/* ==================================================
                    TITLE
                ================================================== */}

                <div className="min-w-0 flex-1">

                  <div className="flex items-start gap-3">

                    <GitPullRequest
                      size={19}
                      className="mt-1 shrink-0 text-purple-400"
                    />

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="text-sm text-gray-500">
                          #{pullRequest.number}
                        </span>

                        <h3 className="font-semibold text-white group-hover:text-purple-300">
                          {
                            pullRequest.title
                          }
                        </h3>

                      </div>

                      <p className="mt-1 text-xs text-gray-500">
                        Updated{" "}
                        {formatDate(
                          pullRequest.updated_at
                        )}
                      </p>

                    </div>

                  </div>

                </div>

                {/* ==================================================
                    BRANCH
                ================================================== */}

                <div className="flex min-w-[220px] items-center gap-2 text-sm text-gray-400">

                  <GitBranch
                    size={16}
                    className="shrink-0 text-purple-400"
                  />

                  <span className="truncate">
                    {
                      pullRequest.head_branch
                    }
                  </span>

                  <span className="text-gray-600">
                    →
                  </span>

                  <span className="truncate text-gray-500">
                    {
                      pullRequest.base_branch
                    }
                  </span>

                </div>

                {/* ==================================================
                    AUTHOR
                ================================================== */}

                <div className="min-w-[140px] text-sm text-gray-400">

                  {pullRequest.author ||
                    "Unknown"}

                </div>

                {/* ==================================================
                    STATUS
                ================================================== */}

                <div className="min-w-[90px]">

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusStyles(
                      status
                    )}`}
                  >
                    {status
                      .charAt(0)
                      .toUpperCase() +
                      status.slice(1)}
                  </span>

                </div>

                {/* ==================================================
                    GITHUB LINK
                ================================================== */}

                <div
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >

                  <a
                    href={
                      pullRequest.html_url
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-purple-500/10 hover:text-purple-400"
                    title="Open on GitHub"
                  >
                    <ExternalLink
                      size={17}
                    />
                  </a>

                </div>

              </div>

            </div>
          )
        )}

      </div>

    </section>
  );
}

export default PullRequests;