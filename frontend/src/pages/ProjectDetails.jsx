import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  FolderKanban,
  CheckSquare,
  GitPullRequest,
  Bot,
  Plus,
  Trash2,
} from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import { useAuth } from "../context/useAuth";
import CreateTaskModal from "../components/tasks/CreateTaskModal";

function ProjectDetails() {
  // ============================================
  // ROUTER / AUTH
  // ============================================

  const { projectId } = useParams();

  const navigate = useNavigate();

  const { accessToken } = useAuth();

  // ============================================
  // STATE
  // ============================================

  const [project, setProject] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // Stores all tasks belonging to this project
  const [tasks, setTasks] = useState([]);

  // Controls Create Task modal
  const [showCreateTask, setShowCreateTask] = useState(false);

  // Stores the ID of the task currently being deleted
  // This prevents multiple delete requests at once.
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  // ============================================
  // FETCH PROJECT + TASKS
  // ============================================

  useEffect(() => {
    const fetchProject = async () => {
      if (!accessToken || !projectId) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        // ========================================
        // 1. FETCH PROJECT
        // ========================================

        const response = await fetch(
          `http://127.0.0.1:8000/api/projects/${projectId}`,
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
          throw new Error(
            data.detail || "Failed to load project.",
          );
        }

        // Store project information
        setProject(data);

        // ========================================
        // 2. FETCH TASKS
        // ========================================

        const tasksResponse = await fetch(
          `http://127.0.0.1:8000/api/projects/${projectId}/tasks`,
          {
            method: "GET",

            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const tasksData = await tasksResponse.json();

        if (!tasksResponse.ok) {
          throw new Error(
            tasksData.detail || "Failed to load tasks.",
          );
        }

        // Store tasks returned by backend
        setTasks(tasksData);
      } catch (error) {
        console.error(
          "Project details error:",
          error,
        );

        setError(
          error.message || "Unable to load project.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [accessToken, projectId]);

  // ============================================
  // DELETE TASK
  // ============================================

  const handleDeleteTask = async (taskId, taskTitle) => {
    // --------------------------------------------
    // Ask user for confirmation
    // --------------------------------------------

    const confirmed = window.confirm(
      `Are you sure you want to delete "${taskTitle}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      // Clear any previous error
      setError("");

      // Store which task is being deleted
      setDeletingTaskId(taskId);

      // ------------------------------------------
      // DELETE TASK FROM BACKEND
      // ------------------------------------------

      const response = await fetch(
        `http://127.0.0.1:8000/api/projects/tasks/${taskId}`,
        {
          method: "DELETE",

          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      // ------------------------------------------
      // HANDLE DELETE ERROR
      // ------------------------------------------

      if (!response.ok) {
        let data = {};

        // DELETE may return JSON on an error,
        // but successful 204 responses have no body.
        try {
          data = await response.json();
        } catch {
          data = {};
        }

        throw new Error(
          data.detail || "Failed to delete task.",
        );
      }

      // ------------------------------------------
      // REMOVE TASK FROM REACT STATE
      // ------------------------------------------

      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task.id !== taskId,
        ),
      );

    } catch (error) {
      console.error(
        "Delete task error:",
        error,
      );

      setError(
        error.message || "Unable to delete task.",
      );
    } finally {
      // Allow another task to be deleted
      setDeletingTaskId(null);
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white">
        <Sidebar />

        <main className="ml-64 min-h-screen p-8">
          <div className="mx-auto max-w-7xl">

            {/* Project title skeleton */}
            <div className="h-8 w-64 animate-pulse rounded bg-white/10" />

            {/* Description skeleton */}
            <div className="mt-4 h-5 w-96 animate-pulse rounded bg-white/5" />

            {/* Statistics skeleton */}
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-xl border border-white/10 bg-[#111116]"
                />
              ))}
            </div>

          </div>
        </main>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white">
        <Sidebar />

        <main className="ml-64 min-h-screen p-8">
          <div className="mx-auto max-w-7xl">

            {/* Back button */}

            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="mb-8 flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
            >
              <ArrowLeft size={18} />

              Back to Projects
            </button>

            {/* Error message */}

            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8">

              <h1 className="text-lg font-semibold text-white">
                Project not found
              </h1>

              <p className="mt-2 text-sm text-red-400">
                {error || "This project does not exist."}
              </p>

            </div>

          </div>
        </main>
      </div>
    );
  }

  // ============================================
  // MAIN PROJECT DETAILS PAGE
  // ============================================

  return (
    <div className="min-h-screen bg-[#07070a] text-white">

      {/* ========================================
          SIDEBAR
      ======================================== */}

      <Sidebar />

      <main className="ml-64 min-h-screen p-8">

        <div className="mx-auto max-w-7xl">

          {/* ======================================
              BACK TO PROJECTS
          ====================================== */}

          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="mb-6 flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />

            Back to Projects
          </button>

          {/* ======================================
              PROJECT HEADER
          ====================================== */}

          <div className="mb-8 flex items-start justify-between">

            {/* Project information */}

            <div className="flex items-start gap-4">

              {/* Project icon */}

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <FolderKanban size={26} />
              </div>

              <div>

                {/* Project name + status */}

                <div className="flex items-center gap-3">

                  <h1 className="text-3xl font-bold">
                    {project.name}
                  </h1>

                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                    Active
                  </span>

                </div>

                {/* Project description */}

                <p className="mt-2 max-w-2xl text-gray-400">
                  {project.description ||
                    "No description provided."}
                </p>

              </div>

            </div>

            {/* ==================================
                NEW TASK BUTTON
            ================================== */}

            <button
              type="button"
              onClick={() => setShowCreateTask(true)}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-500 px-5 py-3 font-semibold text-white shadow-lg shadow-purple-900/20 transition hover:scale-[1.02]"
            >
              <Plus size={19} />

              New Task
            </button>

          </div>

          {/* ======================================
              PROJECT STATISTICS
          ====================================== */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* ====================================
                TASKS
            ==================================== */}

            <div className="rounded-xl border border-white/10 bg-[#111116] p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-gray-400">
                    Tasks
                  </p>

                  {/* Real task count from backend */}

                  <p className="mt-2 text-3xl font-bold">
                    {tasks.length}
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <CheckSquare size={21} />
                </div>

              </div>

            </div>

            {/* ====================================
                PULL REQUESTS
            ==================================== */}

            <div className="rounded-xl border border-white/10 bg-[#111116] p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-gray-400">
                    Pull Requests
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    0
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <GitPullRequest size={21} />
                </div>

              </div>

            </div>

            {/* ====================================
                AI REVIEWS
            ==================================== */}

            <div className="rounded-xl border border-white/10 bg-[#111116] p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-gray-400">
                    AI Reviews
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    0
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <Bot size={21} />
                </div>

              </div>

            </div>

          </div>

          {/* ======================================
              RECENT TASKS
          ====================================== */}

          <div className="mt-8 rounded-xl border border-white/10 bg-[#111116]">

            {/* Section header */}

            <div className="border-b border-white/10 px-6 py-5">

              <h2 className="text-lg font-semibold">
                Recent Tasks
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Tasks associated with this project
              </p>

            </div>

            {/* ==================================
                TASK LIST / EMPTY STATE
            ================================== */}

            {tasks.length === 0 ? (

              /* ==================================
                 EMPTY STATE
              ================================== */

              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <CheckSquare size={22} />
                </div>

                <h3 className="mt-4 font-semibold">
                  No tasks yet
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Create your first task to start
                  tracking work.
                </p>

                {/* Create Task button */}

                <button
                  type="button"
                  onClick={() => setShowCreateTask(true)}
                  className="mt-5 flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-purple-500"
                >
                  <Plus size={17} />

                  Create Task
                </button>

              </div>

            ) : (

              /* ==================================
                 TASK LIST
              ================================== */

              <div className="divide-y divide-white/10">

                {tasks.map((task) => (

                  <div
                    key={task.id}
                    className="flex items-center justify-between px-6 py-5 transition hover:bg-white/[0.02]"
                  >

                    {/* ==================================
                        TASK INFORMATION
                    ================================== */}

                    <div className="min-w-0">

                      <h3 className="font-medium text-white">
                        {task.title}
                      </h3>

                      {/* Task description */}

                      {task.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {task.description}
                        </p>
                      )}

                    </div>

                    {/* ==================================
                        TASK ACTIONS
                    ================================== */}

                    <div className="ml-4 flex shrink-0 items-center gap-3">

                      {/* Task status */}

                      <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium capitalize text-purple-400">
                        {task.status}
                      </span>

                      {/* Delete button */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteTask(
                            task.id,
                            task.title,
                          )
                        }
                        disabled={
                          deletingTaskId === task.id
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Delete ${task.title}`}
                        title="Delete task"
                      >

                        {deletingTaskId === task.id ? (
                          // Loading indicator while deleting
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent" />
                        ) : (
                          <Trash2 size={17} />
                        )}

                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      </main>

      {/* ============================================
          CREATE TASK MODAL
      ============================================ */}

      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        projectId={projectId}
        onTaskCreated={(newTask) => {

          // Add newly created task
          // to the beginning of the list.
          setTasks((currentTasks) => [
            newTask,
            ...currentTasks,
          ]);

        }}
      />

    </div>
  );
}

export default ProjectDetails;