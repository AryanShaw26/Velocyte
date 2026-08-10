import { useEffect, useMemo, useState } from "react";

import {
  GitPullRequest,
  Plus,
  Search,
  Trash2,
  Pencil,
  X,
  FolderKanban,
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

  // All Pull Requests
  const [pullRequests, setPullRequests] = useState([]);

  // All projects
  const [projects, setProjects] = useState([]);


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
  // CREATE PR STATE
  // ============================================================

  const [showCreatePR, setShowCreatePR] = useState(false);

  const [creating, setCreating] = useState(false);

  const [createError, setCreateError] = useState("");

  const [prTitle, setPrTitle] = useState("");

  const [prStatus, setPrStatus] = useState("open");

  const [selectedProject, setSelectedProject] = useState("");


  // ============================================================
  // EDIT PR STATE
  // ============================================================

  const [showEditPR, setShowEditPR] = useState(false);

  const [editingPR, setEditingPR] = useState(null);

  const [updating, setUpdating] = useState(false);

  const [updateError, setUpdateError] = useState("");


  // ============================================================
  // FETCH DATA
  // ============================================================

  const fetchData = async () => {

    if (!accessToken) {

      setLoading(false);

      return;
    }


    try {

      setLoading(true);

      setError("");


      // ========================================================
      // FETCH ALL PULL REQUESTS
      // ========================================================

      const prResponse = await fetch(
        "http://127.0.0.1:8000/api/pull-requests",
        {
          method: "GET",

          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );


      const prData =
        await prResponse.json();


      if (!prResponse.ok) {

        throw new Error(
          prData.detail ||
          "Failed to load pull requests."
        );

      }


      // ========================================================
      // FETCH PROJECTS
      // ========================================================

      const projectsResponse =
        await fetch(
          "http://127.0.0.1:8000/api/projects",
          {
            method: "GET",

            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );


      const projectsData =
        await projectsResponse.json();


      if (!projectsResponse.ok) {

        throw new Error(
          projectsData.detail ||
          "Failed to load projects."
        );

      }


      // ========================================================
      // STORE DATA
      // ========================================================

      setPullRequests(prData);

      setProjects(projectsData);


      // ========================================================
      // DEFAULT PROJECT
      // ========================================================

      if (
        projectsData.length > 0 &&
        !selectedProject
      ) {

        setSelectedProject(
          projectsData[0].id
        );

      }

    } catch (error) {

      console.error(
        "Pull Requests page error:",
        error
      );


      setError(
        error.message ||
        "Unable to load pull requests."
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
  // GET PROJECT NAME
  // ============================================================

  const getProjectName = (projectId) => {

    const project =
      projects.find(
        (item) =>
          item.id === projectId
      );


    return (
      project?.name ||
      "Unknown Project"
    );
  };


  // ============================================================
  // FILTER PULL REQUESTS
  // ============================================================

  const filteredPullRequests =
    useMemo(() => {

      const searchValue =
        search.toLowerCase().trim();


      return pullRequests.filter(
        (pullRequest) => {

          const projectName =
            getProjectName(
              pullRequest.project_id
            ).toLowerCase();


          // Search title
          const matchesTitle =
            pullRequest.title
              .toLowerCase()
              .includes(searchValue);


          // Search project
          const matchesProject =
            projectName.includes(
              searchValue
            );


          // Search result
          const matchesSearch =
            matchesTitle ||
            matchesProject;


          // Status result
          const matchesStatus =
            statusFilter === "all" ||
            pullRequest.status ===
              statusFilter;


          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );

    }, [
      pullRequests,
      projects,
      search,
      statusFilter,
    ]);


  // ============================================================
  // CREATE PULL REQUEST
  // ============================================================

  const handleCreatePR = async (event) => {

    event.preventDefault();

    setCreateError("");


    // ----------------------------------------------------------
    // Validate title
    // ----------------------------------------------------------

    if (!prTitle.trim()) {

      setCreateError(
        "Pull Request title is required."
      );

      return;
    }


    // ----------------------------------------------------------
    // Validate project
    // ----------------------------------------------------------

    if (!selectedProject) {

      setCreateError(
        "Please select a project."
      );

      return;
    }


    try {

      setCreating(true);


      // ========================================================
      // CREATE API REQUEST
      // ========================================================

      const response =
        await fetch(
          `http://127.0.0.1:8000/api/projects/${selectedProject}/pull-requests`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",

              Authorization:
                `Bearer ${accessToken}`,
            },

            body: JSON.stringify({

              title:
                prTitle.trim(),

              status:
                prStatus,

            }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to create Pull Request."
        );

      }


      // ========================================================
      // RESET FORM
      // ========================================================

      setPrTitle("");

      setPrStatus("open");

      setCreateError("");


      // Close modal
      setShowCreatePR(false);


      // Refresh data
      await fetchData();

    } catch (error) {

      console.error(
        "Create PR error:",
        error
      );


      setCreateError(
        error.message ||
        "Unable to create Pull Request."
      );

    } finally {

      setCreating(false);

    }
  };


  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  const handleOpenEdit = (pullRequest) => {

    setEditingPR({
      ...pullRequest,
    });


    setUpdateError("");

    setShowEditPR(true);

  };


  // ============================================================
  // UPDATE PULL REQUEST
  // ============================================================

  const handleUpdatePR = async (event) => {

    event.preventDefault();


    if (!editingPR) {
      return;
    }


    setUpdateError("");


    // Validate title
    if (!editingPR.title.trim()) {

      setUpdateError(
        "Pull Request title is required."
      );

      return;
    }


    try {

      setUpdating(true);


      // ========================================================
      // PATCH REQUEST
      // ========================================================

      const response =
        await fetch(
          `http://127.0.0.1:8000/api/projects/pull-requests/${editingPR.id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",

              Authorization:
                `Bearer ${accessToken}`,
            },

            body: JSON.stringify({

              title:
                editingPR.title.trim(),

              status:
                editingPR.status,

            }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to update Pull Request."
        );

      }


      // ========================================================
      // UPDATE UI
      // ========================================================

      setPullRequests(
        (currentPRs) =>
          currentPRs.map(
            (pullRequest) =>
              pullRequest.id === data.id
                ? data
                : pullRequest
          )
      );


      // Close modal
      setShowEditPR(false);

      setEditingPR(null);

      setUpdateError("");

    } catch (error) {

      console.error(
        "Update PR error:",
        error
      );


      setUpdateError(
        error.message ||
        "Unable to update Pull Request."
      );

    } finally {

      setUpdating(false);

    }
  };


  // ============================================================
  // DELETE PULL REQUEST
  // ============================================================

  const handleDeletePR = async (pullRequestId) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this Pull Request?"
      );


    if (!confirmed) {
      return;
    }


    try {

      const response =
        await fetch(
          `http://127.0.0.1:8000/api/projects/pull-requests/${pullRequestId}`,
          {
            method: "DELETE",

            headers: {
              Accept:
                "application/json",

              Authorization:
                `Bearer ${accessToken}`,
            },
          }
        );


      if (!response.ok) {

        let data = {};


        try {

          data =
            await response.json();

        } catch {

          // DELETE 204 has no body

        }


        throw new Error(
          data.detail ||
          "Failed to delete Pull Request."
        );

      }


      // ========================================================
      // REMOVE FROM UI
      // ========================================================

      setPullRequests(
        (currentPRs) =>
          currentPRs.filter(
            (pullRequest) =>
              pullRequest.id !==
              pullRequestId
          )
      );

    } catch (error) {

      console.error(
        "Delete PR error:",
        error
      );


      alert(
        error.message ||
        "Unable to delete Pull Request."
      );

    }

  };


  // ============================================================
  // STATUS BADGE
  // ============================================================

  const getStatusStyles = (status) => {

    switch (status) {

      case "merged":

        return (
          "bg-purple-500/10 " +
          "text-purple-400"
        );


      case "closed":

        return (
          "bg-red-500/10 " +
          "text-red-400"
        );


      case "open":

      default:

        return (
          "bg-emerald-500/10 " +
          "text-emerald-400"
        );

    }

  };


  // ============================================================
  // LOADING UI
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
                    className="h-24 animate-pulse rounded-xl bg-[#111116]"
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
  // MAIN UI
  // ============================================================

  return (

    <div className="min-h-screen bg-[#07070a] text-white">


      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar />


      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="ml-64 min-h-screen p-8">

        <div className="mx-auto max-w-7xl">


          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <div className="mb-8 flex items-center justify-between">

            <div>

              <h1 className="text-3xl font-bold">
                Pull Requests
              </h1>


              <p className="mt-2 text-gray-400">
                Manage and review your project's pull requests.
              </p>

            </div>


            {/* NEW PR */}

            <button
              type="button"
              onClick={() => {

                setCreateError("");

                setShowCreatePR(true);

              }}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-500 px-5 py-3 font-semibold text-white shadow-lg shadow-purple-900/20 transition hover:scale-[1.02]"
            >

              <Plus size={19} />

              New Pull Request

            </button>

          </div>


          {/* ==================================================
              SEARCH + FILTER
          ================================================== */}

          <div className="mb-6 flex flex-col gap-4 md:flex-row">


            {/* SEARCH */}

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
                placeholder="Search pull requests..."
                className="w-full rounded-lg border border-white/10 bg-[#111116] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500"
              />

            </div>


            {/* STATUS FILTER */}

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

              <option value="closed">
                Closed
              </option>

              <option value="merged">
                Merged
              </option>

            </select>

          </div>


          {/* ==================================================
              PAGE ERROR
          ================================================== */}

          {error && (

            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-400">

              {error}

            </div>

          )}


          {/* ==================================================
              EMPTY STATE
          ================================================== */}

          {!error &&
            filteredPullRequests.length === 0 && (

              <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-[#111116] px-6 py-20 text-center">


                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">

                  <GitPullRequest
                    size={25}
                  />

                </div>


                <h2 className="mt-5 text-lg font-semibold">

                  {search ||
                  statusFilter !== "all"

                    ? "No pull requests found"

                    : "No pull requests yet"}

                </h2>


                <p className="mt-2 max-w-md text-sm text-gray-500">

                  {search ||
                  statusFilter !== "all"

                    ? "Try changing your search or filter."

                    : "Create your first pull request to start tracking changes."}

                </p>


                {!search &&
                  statusFilter === "all" && (

                    <button
                      type="button"
                      onClick={() =>
                        setShowCreatePR(
                          true
                        )
                      }
                      className="mt-6 flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold transition hover:bg-purple-500"
                    >

                      <Plus size={18} />

                      Create Pull Request

                    </button>

                  )}

              </div>

            )}


          {/* ==================================================
              PR LIST
          ================================================== */}

          {!error &&
            filteredPullRequests.length > 0 && (

              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111116]">


                {/* TABLE HEADER */}

                <div className="hidden border-b border-white/10 px-6 py-4 text-xs font-medium uppercase tracking-wide text-gray-500 md:grid md:grid-cols-[2fr_1.2fr_1fr_80px]">

                  <span>
                    Pull Request
                  </span>

                  <span>
                    Project
                  </span>

                  <span>
                    Status
                  </span>

                  <span>
                    Actions
                  </span>

                </div>


                {/* PR ROWS */}

                {filteredPullRequests.map(
                  (pullRequest) => (

                    <div
                      key={
                        pullRequest.id
                      }
                      className="group border-b border-white/10 px-6 py-5 last:border-b-0 md:grid md:grid-cols-[2fr_1.2fr_1fr_80px] md:items-center"
                    >


                      {/* PR INFORMATION */}

                      <div className="min-w-0">

                        <div className="flex items-center gap-2">

                          <GitPullRequest
                            size={17}
                            className="shrink-0 text-purple-400"
                          />


                          <h2 className="truncate font-semibold text-white">

                            {pullRequest.title}

                          </h2>

                        </div>

                      </div>


                      {/* PROJECT */}

                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-400 md:mt-0">

                        <FolderKanban
                          size={16}
                          className="text-purple-400"
                        />


                        <span className="truncate">

                          {getProjectName(
                            pullRequest.project_id
                          )}

                        </span>

                      </div>


                      {/* STATUS */}

                      <div className="mt-4 md:mt-0">

                        <span
                          className={
                            `inline-flex rounded-full ` +
                            `px-3 py-1 text-xs ` +
                            `font-medium ` +
                            getStatusStyles(
                              pullRequest.status
                            )
                          }
                        >

                          {pullRequest.status
                            .charAt(0)
                            .toUpperCase() +
                            pullRequest.status.slice(
                              1
                            )}

                        </span>

                      </div>


                      {/* ACTIONS */}

                      <div className="mt-4 flex justify-end gap-2 md:mt-0">


                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenEdit(
                              pullRequest
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-purple-500/10 hover:text-purple-400"
                          aria-label={
                            `Edit ${pullRequest.title}`
                          }
                          title="Edit pull request"
                        >

                          <Pencil
                            size={17}
                          />

                        </button>


                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDeletePR(
                              pullRequest.id
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
                          aria-label={
                            `Delete ${pullRequest.title}`
                          }
                          title="Delete pull request"
                        >

                          <Trash2
                            size={17}
                          />

                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

        </div>

      </main>


      {/* ======================================================
          CREATE PULL REQUEST MODAL
      ====================================================== */}

      {showCreatePR && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">


          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111116] shadow-2xl">


            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

              <div>

                <h2 className="text-lg font-semibold text-white">
                  Create Pull Request
                </h2>


                <p className="mt-1 text-sm text-gray-500">
                  Add a new pull request to your project.
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setShowCreatePR(
                    false
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Close"
              >

                <X size={20} />

              </button>

            </div>


            {/* CREATE FORM */}

            <form
              onSubmit={
                handleCreatePR
              }
              className="space-y-5 p-6"
            >


              {/* ERROR */}

              {createError && (

                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">

                  {createError}

                </div>

              )}


              {/* PROJECT */}

              <div>

                <label
                  htmlFor="pr-project"
                  className="mb-2 block text-sm font-medium text-gray-200"
                >
                  Project
                </label>


                <select
                  id="pr-project"
                  value={
                    selectedProject
                  }
                  onChange={(event) =>
                    setSelectedProject(
                      event.target.value
                    )
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
                        key={
                          project.id
                        }
                        value={
                          project.id
                        }
                      >

                        {
                          project.name
                        }

                      </option>

                    )
                  )}

                </select>

              </div>


              {/* TITLE */}

              <div>

                <label
                  htmlFor="pr-title"
                  className="mb-2 block text-sm font-medium text-gray-200"
                >
                  Pull Request title
                </label>


                <input
                  id="pr-title"
                  type="text"
                  value={
                    prTitle
                  }
                  onChange={(event) =>
                    setPrTitle(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Add authentication system"
                  maxLength={250}
                  disabled={creating}
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-purple-500"
                />

              </div>


              {/* STATUS */}

              <div>

                <label
                  htmlFor="pr-status"
                  className="mb-2 block text-sm font-medium text-gray-200"
                >
                  Status
                </label>


                <select
                  id="pr-status"
                  value={
                    prStatus
                  }
                  onChange={(event) =>
                    setPrStatus(
                      event.target.value
                    )
                  }
                  disabled={creating}
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                >

                  <option value="open">
                    Open
                  </option>


                  <option value="closed">
                    Closed
                  </option>


                  <option value="merged">
                    Merged
                  </option>

                </select>

              </div>


              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">


                <button
                  type="button"
                  onClick={() =>
                    setShowCreatePR(
                      false
                    )
                  }
                  disabled={creating}
                  className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-2.5 text-sm font-medium text-white transition hover:from-purple-500 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {creating
                    ? "Creating..."
                    : "Create Pull Request"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ======================================================
          EDIT PULL REQUEST MODAL
      ====================================================== */}

      {showEditPR &&
        editingPR && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">


            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111116] shadow-2xl">


              {/* EDIT MODAL HEADER */}

              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

                <div>

                  <h2 className="text-lg font-semibold text-white">
                    Edit Pull Request
                  </h2>


                  <p className="mt-1 text-sm text-gray-500">
                    Update your pull request.
                  </p>

                </div>


                <button
                  type="button"
                  onClick={() => {

                    setShowEditPR(
                      false
                    );

                    setEditingPR(
                      null
                    );

                    setUpdateError(
                      ""
                    );

                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5 hover:text-white"
                  aria-label="Close"
                >

                  <X size={20} />

                </button>

              </div>


              {/* EDIT FORM */}

              <form
                onSubmit={
                  handleUpdatePR
                }
                className="space-y-5 p-6"
              >


                {/* ERROR */}

                {updateError && (

                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">

                    {updateError}

                  </div>

                )}


                {/* TITLE */}

                <div>

                  <label
                    htmlFor="edit-pr-title"
                    className="mb-2 block text-sm font-medium text-gray-200"
                  >
                    Pull Request title
                  </label>


                  <input
                    id="edit-pr-title"
                    type="text"
                    value={
                      editingPR.title
                    }
                    onChange={(event) =>
                      setEditingPR({
                        ...editingPR,
                        title:
                          event.target.value,
                      })
                    }
                    maxLength={250}
                    disabled={updating}
                    className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-purple-500"
                  />

                </div>


                {/* STATUS */}

                <div>

                  <label
                    htmlFor="edit-pr-status"
                    className="mb-2 block text-sm font-medium text-gray-200"
                  >
                    Status
                  </label>


                  <select
                    id="edit-pr-status"
                    value={
                      editingPR.status
                    }
                    onChange={(event) =>
                      setEditingPR({
                        ...editingPR,
                        status:
                          event.target.value,
                      })
                    }
                    disabled={updating}
                    className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  >

                    <option value="open">
                      Open
                    </option>


                    <option value="closed">
                      Closed
                    </option>


                    <option value="merged">
                      Merged
                    </option>

                  </select>

                </div>


                {/* BUTTONS */}

                <div className="flex justify-end gap-3 border-t border-white/10 pt-5">


                  <button
                    type="button"
                    onClick={() => {

                      setShowEditPR(
                        false
                      );

                      setEditingPR(
                        null
                      );

                      setUpdateError(
                        ""
                      );

                    }}
                    disabled={updating}
                    className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    disabled={
                      updating ||
                      !editingPR.title.trim()
                    }
                    className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-2.5 text-sm font-medium text-white transition hover:from-purple-500 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
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


export default PullRequests;