import { useEffect, useMemo, useState } from "react";

import {
  CheckSquare,
  Plus,
  Search,
  Trash2,
  X,
  FolderKanban,
  Pencil,
} from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import { useAuth } from "../context/AuthContext";


function Tasks() {

  // ============================================================
  // AUTHENTICATION
  // ============================================================

  const { accessToken } = useAuth();


  // ============================================================
  // TASK + PROJECT DATA
  // ============================================================

  // All tasks belonging to the logged-in user
  const [tasks, setTasks] = useState([]);

  // All projects belonging to the logged-in user
  const [projects, setProjects] = useState([]);


  // ============================================================
  // SEARCH + FILTER
  // ============================================================

  // Search text
  const [search, setSearch] = useState("");

  // Selected status filter
  const [statusFilter, setStatusFilter] = useState("all");


  // ============================================================
  // GENERAL PAGE STATE
  // ============================================================

  // Initial page loading
  const [loading, setLoading] = useState(true);

  // Page-level error
  const [error, setError] = useState("");


  // ============================================================
  // CREATE TASK STATE
  // ============================================================

  const [showCreateTask, setShowCreateTask] = useState(false);

  const [creating, setCreating] = useState(false);

  const [createError, setCreateError] = useState("");

  // Create-task form values
  const [taskTitle, setTaskTitle] = useState("");

  const [taskDescription, setTaskDescription] = useState("");

  const [taskStatus, setTaskStatus] = useState("todo");

  const [selectedProject, setSelectedProject] = useState("");


  // ============================================================
  // EDIT TASK STATE
  // ============================================================

  // Controls whether the Edit Task modal is visible
  const [showEditTask, setShowEditTask] = useState(false);

  // Stores the task currently being edited
  const [editingTask, setEditingTask] = useState(null);

  // Loading state while saving changes
  const [updating, setUpdating] = useState(false);

  // Error shown inside Edit Task modal
  const [updateError, setUpdateError] = useState("");


  // ============================================================
  // FETCH TASKS + PROJECTS
  // ============================================================

  const fetchData = async () => {

    // If authentication isn't ready, stop loading
    if (!accessToken) {

      setLoading(false);

      return;
    }


    try {

      setLoading(true);

      setError("");


      // ========================================================
      // FETCH ALL TASKS
      // ========================================================

      const tasksResponse = await fetch(
        "http://127.0.0.1:8000/api/tasks",
        {
          method: "GET",

          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );


      const tasksData = await tasksResponse.json();


      if (!tasksResponse.ok) {

        throw new Error(
          tasksData.detail ||
          "Failed to load tasks."
        );

      }


      // ========================================================
      // FETCH ALL PROJECTS
      // ========================================================

      const projectsResponse = await fetch(
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

      setTasks(tasksData);

      setProjects(projectsData);


      // ========================================================
      // DEFAULT PROJECT FOR CREATE TASK
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
        "Tasks page error:",
        error
      );


      setError(
        error.message ||
        "Unable to load tasks."
      );

    } finally {

      setLoading(false);

    }
  };


  // ============================================================
  // LOAD DATA WHEN USER AUTHENTICATION IS READY
  // ============================================================

  useEffect(() => {

    fetchData();

  }, [accessToken]);


  // ============================================================
  // FIND PROJECT NAME
  // ============================================================

  const getProjectName = (projectId) => {

    const project = projects.find(
      (item) => item.id === projectId
    );


    return (
      project?.name ||
      "Unknown Project"
    );
  };


  // ============================================================
  // FILTER TASKS
  // ============================================================

  const filteredTasks = useMemo(() => {

    const searchValue =
      search.toLowerCase().trim();


    return tasks.filter((task) => {

      const projectName =
        getProjectName(
          task.project_id
        ).toLowerCase();


      // Search title
      const matchesTitle =
        task.title
          .toLowerCase()
          .includes(searchValue);


      // Search description
      const matchesDescription =
        (task.description || "")
          .toLowerCase()
          .includes(searchValue);


      // Search project name
      const matchesProject =
        projectName.includes(searchValue);


      const matchesSearch =
        matchesTitle ||
        matchesDescription ||
        matchesProject;


      // Status filtering
      const matchesStatus =
        statusFilter === "all" ||
        task.status === statusFilter;


      return (
        matchesSearch &&
        matchesStatus
      );

    });

  }, [
    tasks,
    projects,
    search,
    statusFilter,
  ]);


  // ============================================================
  // CREATE TASK
  // ============================================================

  const handleCreateTask = async (event) => {

    event.preventDefault();

    setCreateError("");


    // ----------------------------------------------------------
    // VALIDATE TITLE
    // ----------------------------------------------------------

    if (!taskTitle.trim()) {

      setCreateError(
        "Task title is required."
      );

      return;
    }


    // ----------------------------------------------------------
    // VALIDATE PROJECT
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
      // CREATE TASK API
      // ========================================================

      const response = await fetch(
        `http://127.0.0.1:8000/api/projects/${selectedProject}/tasks`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },

          body: JSON.stringify({

            title:
              taskTitle.trim(),

            description:
              taskDescription.trim() ||
              null,

            status:
              taskStatus,

            assigned_to:
              null,

          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to create task."
        );

      }


      // ========================================================
      // RESET CREATE FORM
      // ========================================================

      setTaskTitle("");

      setTaskDescription("");

      setTaskStatus("todo");

      setCreateError("");


      // Close modal
      setShowCreateTask(false);


      // Refresh task list
      await fetchData();

    } catch (error) {

      console.error(
        "Create task error:",
        error
      );


      setCreateError(
        error.message ||
        "Something went wrong."
      );

    } finally {

      setCreating(false);

    }
  };


  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  const handleOpenEdit = (task) => {

    // Make a copy so the original task isn't modified
    // until Save Changes is clicked.

    setEditingTask({
      ...task,
    });


    setUpdateError("");

    setShowEditTask(true);

  };


  // ============================================================
  // UPDATE TASK
  // ============================================================

  const handleUpdateTask = async (event) => {

    event.preventDefault();


    // Safety check
    if (!editingTask) {
      return;
    }


    setUpdateError("");


    // Validate title
    if (!editingTask.title.trim()) {

      setUpdateError(
        "Task title is required."
      );

      return;
    }


    try {

      setUpdating(true);


      // ========================================================
      // PATCH TASK
      // ========================================================

      const response = await fetch(
        `http://127.0.0.1:8000/api/projects/tasks/${editingTask.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },

          body: JSON.stringify({

            title:
              editingTask.title.trim(),

            description:
              editingTask.description?.trim() ||
              null,

            status:
              editingTask.status,

          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to update task."
        );

      }


      // ========================================================
      // UPDATE TASK IN UI
      // ========================================================

      setTasks((currentTasks) =>

        currentTasks.map((task) =>

          task.id === data.id
            ? data
            : task

        )

      );


      // ========================================================
      // CLOSE EDIT MODAL
      // ========================================================

      setShowEditTask(false);

      setEditingTask(null);

      setUpdateError("");


    } catch (error) {

      console.error(
        "Update task error:",
        error
      );


      setUpdateError(
        error.message ||
        "Unable to update task."
      );

    } finally {

      setUpdating(false);

    }
  };


  // ============================================================
  // DELETE TASK
  // ============================================================

  const handleDeleteTask = async (taskId) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this task?"
      );


    if (!confirmed) {
      return;
    }


    try {

      const response =
        await fetch(
          `http://127.0.0.1:8000/api/projects/tasks/${taskId}`,
          {
            method: "DELETE",

            headers: {
              Accept: "application/json",
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

          // DELETE 204 has no response body

        }


        throw new Error(
          data.detail ||
          "Failed to delete task."
        );

      }


      // ========================================================
      // REMOVE FROM UI
      // ========================================================

      setTasks(
        (currentTasks) =>
          currentTasks.filter(
            (task) =>
              task.id !== taskId
          )
      );


    } catch (error) {

      console.error(
        "Delete task error:",
        error
      );


      alert(
        error.message ||
        "Unable to delete task."
      );

    }

  };


  // ============================================================
  // STATUS BADGE STYLING
  // ============================================================

  const getStatusStyles = (status) => {

    switch (status) {

      case "done":

        return (
          "bg-emerald-500/10 " +
          "text-emerald-400"
        );


      case "in_progress":

        return (
          "bg-blue-500/10 " +
          "text-blue-400"
        );


      case "todo":

      default:

        return (
          "bg-purple-500/10 " +
          "text-purple-400"
        );

    }

  };


  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-[#07070a] text-white">

        <Sidebar />


        <main className="ml-64 min-h-screen p-8">

          <div className="mx-auto max-w-7xl">

            <div className="h-8 w-48 animate-pulse rounded bg-white/10" />


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
  // MAIN PAGE
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
                Tasks
              </h1>


              <p className="mt-2 text-gray-400">
                Manage and track your development tasks.
              </p>

            </div>


            {/* NEW TASK */}

            <button
              type="button"
              onClick={() => {

                setCreateError("");

                setShowCreateTask(true);

              }}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-500 px-5 py-3 font-semibold text-white shadow-lg shadow-purple-900/20 transition hover:scale-[1.02]"
            >

              <Plus size={19} />

              New Task

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
                placeholder="Search tasks..."
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


              <option value="todo">
                Todo
              </option>


              <option value="in_progress">
                In Progress
              </option>


              <option value="done">
                Done
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
            filteredTasks.length === 0 && (

              <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-[#111116] px-6 py-20 text-center">


                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">

                  <CheckSquare size={25} />

                </div>


                <h2 className="mt-5 text-lg font-semibold">

                  {search ||
                  statusFilter !== "all"

                    ? "No tasks found"

                    : "No tasks yet"}

                </h2>


                <p className="mt-2 max-w-md text-sm text-gray-500">

                  {search ||
                  statusFilter !== "all"

                    ? "Try changing your search or filter."

                    : "Create your first task to start tracking work."}

                </p>


                {!search &&
                  statusFilter === "all" && (

                    <button
                      type="button"
                      onClick={() =>
                        setShowCreateTask(
                          true
                        )
                      }
                      className="mt-6 flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold transition hover:bg-purple-500"
                    >

                      <Plus size={18} />

                      Create Task

                    </button>

                  )}

              </div>

            )}


          {/* ==================================================
              TASK LIST
          ================================================== */}

          {!error &&
            filteredTasks.length > 0 && (

              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111116]">


                {/* =================================================
                    TABLE HEADER
                ================================================= */}

                <div className="hidden border-b border-white/10 px-6 py-4 text-xs font-medium uppercase tracking-wide text-gray-500 md:grid md:grid-cols-[2fr_1.2fr_1fr_80px]">

                  <span>
                    Task
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


                {/* =================================================
                    TASKS
                ================================================= */}

                {filteredTasks.map(
                  (task) => (

                    <div
                      key={task.id}
                      className="group border-b border-white/10 px-6 py-5 last:border-b-0 md:grid md:grid-cols-[2fr_1.2fr_1fr_80px] md:items-center"
                    >


                      {/* =========================================
                          TASK INFORMATION
                      ========================================= */}

                      <div className="min-w-0">

                        <h2 className="truncate font-semibold text-white">

                          {task.title}

                        </h2>


                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">

                          {task.description ||
                            "No description"}

                        </p>

                      </div>


                      {/* =========================================
                          PROJECT
                      ========================================= */}

                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-400 md:mt-0">

                        <FolderKanban
                          size={16}
                          className="text-purple-400"
                        />


                        <span className="truncate">

                          {getProjectName(
                            task.project_id
                          )}

                        </span>

                      </div>


                      {/* =========================================
                          STATUS
                      ========================================= */}

                      <div className="mt-4 md:mt-0">

                        <span
                          className={
                            `inline-flex rounded-full ` +
                            `px-3 py-1 text-xs ` +
                            `font-medium ` +
                            getStatusStyles(
                              task.status
                            )
                          }
                        >

                          {task.status ===
                          "in_progress"

                            ? "In Progress"

                            : task.status ===
                                "done"

                              ? "Done"

                              : "Todo"}

                        </span>

                      </div>


                      {/* =========================================
                          ACTIONS
                      ========================================= */}

                      <div className="mt-4 flex justify-end gap-2 md:mt-0">


                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenEdit(
                              task
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-purple-500/10 hover:text-purple-400"
                          aria-label={
                            `Edit ${task.title}`
                          }
                          title="Edit task"
                        >

                          <Pencil
                            size={17}
                          />

                        </button>


                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteTask(
                              task.id
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
                          aria-label={
                            `Delete ${task.title}`
                          }
                          title="Delete task"
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
          CREATE TASK MODAL
      ====================================================== */}

      {showCreateTask && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">


          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111116] shadow-2xl">


            {/* =================================================
                CREATE MODAL HEADER
            ================================================= */}

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

              <div>

                <h2 className="text-lg font-semibold text-white">
                  Create Task
                </h2>


                <p className="mt-1 text-sm text-gray-500">
                  Add a new task to your workspace.
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setShowCreateTask(
                    false
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Close"
              >

                <X size={20} />

              </button>

            </div>


            {/* =================================================
                CREATE FORM
            ================================================= */}

            <form
              onSubmit={
                handleCreateTask
              }
              className="space-y-5 p-6"
            >


              {/* CREATE ERROR */}

              {createError && (

                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">

                  {createError}

                </div>

              )}


              {/* PROJECT */}

              <div>

                <label
                  htmlFor="task-project"
                  className="mb-2 block text-sm font-medium text-gray-200"
                >
                  Project
                </label>


                <select
                  id="task-project"
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
                  htmlFor="task-title"
                  className="mb-2 block text-sm font-medium text-gray-200"
                >
                  Task title
                </label>


                <input
                  id="task-title"
                  type="text"
                  value={
                    taskTitle
                  }
                  onChange={(event) =>
                    setTaskTitle(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Build dashboard analytics"
                  maxLength={200}
                  disabled={creating}
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-purple-500"
                />

              </div>


              {/* DESCRIPTION */}

              <div>

                <label
                  htmlFor="task-description"
                  className="mb-2 block text-sm font-medium text-gray-200"
                >

                  Description

                  <span className="ml-2 text-gray-600">
                    Optional
                  </span>

                </label>


                <textarea
                  id="task-description"
                  value={
                    taskDescription
                  }
                  onChange={(event) =>
                    setTaskDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe what needs to be done..."
                  rows={4}
                  maxLength={1000}
                  disabled={creating}
                  className="w-full resize-none rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-purple-500"
                />

              </div>


              {/* STATUS */}

              <div>

                <label
                  htmlFor="task-status"
                  className="mb-2 block text-sm font-medium text-gray-200"
                >
                  Status
                </label>


                <select
                  id="task-status"
                  value={
                    taskStatus
                  }
                  onChange={(event) =>
                    setTaskStatus(
                      event.target.value
                    )
                  }
                  disabled={creating}
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                >

                  <option value="todo">
                    Todo
                  </option>


                  <option value="in_progress">
                    In Progress
                  </option>


                  <option value="done">
                    Done
                  </option>

                </select>

              </div>


              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">


                <button
                  type="button"
                  onClick={() =>
                    setShowCreateTask(
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
                    : "Create Task"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ======================================================
          EDIT TASK MODAL
      ====================================================== */}

      {showEditTask &&
        editingTask && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">


            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111116] shadow-2xl">


              {/* =================================================
                  EDIT MODAL HEADER
              ================================================= */}

              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

                <div>

                  <h2 className="text-lg font-semibold text-white">
                    Edit Task
                  </h2>


                  <p className="mt-1 text-sm text-gray-500">
                    Update your task details.
                  </p>

                </div>


                <button
                  type="button"
                  onClick={() => {

                    setShowEditTask(
                      false
                    );

                    setEditingTask(
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


              {/* =================================================
                  EDIT FORM
              ================================================= */}

              <form
                onSubmit={
                  handleUpdateTask
                }
                className="space-y-5 p-6"
              >


                {/* UPDATE ERROR */}

                {updateError && (

                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">

                    {updateError}

                  </div>

                )}


                {/* TITLE */}

                <div>

                  <label
                    htmlFor="edit-task-title"
                    className="mb-2 block text-sm font-medium text-gray-200"
                  >
                    Task title
                  </label>


                  <input
                    id="edit-task-title"
                    type="text"
                    value={
                      editingTask.title
                    }
                    onChange={(event) =>
                      setEditingTask({
                        ...editingTask,
                        title:
                          event.target.value,
                      })
                    }
                    maxLength={200}
                    disabled={updating}
                    className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-purple-500"
                  />

                </div>


                {/* DESCRIPTION */}

                <div>

                  <label
                    htmlFor="edit-task-description"
                    className="mb-2 block text-sm font-medium text-gray-200"
                  >
                    Description
                  </label>


                  <textarea
                    id="edit-task-description"
                    value={
                      editingTask.description ||
                      ""
                    }
                    onChange={(event) =>
                      setEditingTask({
                        ...editingTask,
                        description:
                          event.target.value,
                      })
                    }
                    rows={4}
                    maxLength={1000}
                    disabled={updating}
                    className="w-full resize-none rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-purple-500"
                  />

                </div>


                {/* STATUS */}

                <div>

                  <label
                    htmlFor="edit-task-status"
                    className="mb-2 block text-sm font-medium text-gray-200"
                  >
                    Status
                  </label>


                  <select
                    id="edit-task-status"
                    value={
                      editingTask.status
                    }
                    onChange={(event) =>
                      setEditingTask({
                        ...editingTask,
                        status:
                          event.target.value,
                      })
                    }
                    disabled={updating}
                    className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  >

                    <option value="todo">
                      Todo
                    </option>


                    <option value="in_progress">
                      In Progress
                    </option>


                    <option value="done">
                      Done
                    </option>

                  </select>

                </div>


                {/* BUTTONS */}

                <div className="flex justify-end gap-3 border-t border-white/10 pt-5">


                  <button
                    type="button"
                    onClick={() => {

                      setShowEditTask(
                        false
                      );

                      setEditingTask(
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
                      !editingTask.title.trim()
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


export default Tasks;