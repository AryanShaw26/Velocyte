import { useState } from "react";
import { X, CheckSquare } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function CreateTaskModal({
  isOpen,
  onClose,
  projectId,
  onTaskCreated,
}) {
  // ============================================
  // AUTH
  // ============================================

  const { accessToken } = useAuth();

  // ============================================
  // FORM STATE
  // ============================================

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");

  // ============================================
  // UI STATE
  // ============================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Don't render the modal when closed
  if (!isOpen) {
    return null;
  }

  // ============================================
  // CREATE TASK
  // ============================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // Validate title
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    // Validate project
    if (!projectId) {
      setError("Project ID is missing.");
      return;
    }

    try {
      setLoading(true);

      // ========================================
      // POST TASK TO BACKEND
      // ========================================

      const response = await fetch(
        `http://127.0.0.1:8000/api/projects/${projectId}/tasks`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },

          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || null,
            status: status,
            assigned_to: null,
          }),
        },
      );

      const data = await response.json();

      // ========================================
      // HANDLE BACKEND ERROR
      // ========================================

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to create task.",
        );
      }

      // ========================================
      // RESET FORM
      // ========================================

      setTitle("");
      setDescription("");
      setStatus("todo");

      // ========================================
      // INFORM PARENT COMPONENT
      // ========================================

      if (onTaskCreated) {
        onTaskCreated(data);
      }

      // Close modal
      onClose();

    } catch (error) {
      console.error(
        "Create task error:",
        error,
      );

      setError(
        error.message || "Something went wrong.",
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // MODAL UI
  // ============================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111116] shadow-2xl">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

          <div className="flex items-center gap-3">

            {/* Icon */}

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <CheckSquare size={20} />
            </div>

            {/* Title */}

            <div>

              <h2 className="text-lg font-semibold text-white">
                Create Task
              </h2>

              <p className="text-sm text-gray-500">
                Add a new task to this project
              </p>

            </div>

          </div>

          {/* Close button */}

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>

        </div>

        {/* ======================================
            FORM
        ====================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          {/* ====================================
              ERROR MESSAGE
          ==================================== */}

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* ====================================
              TASK TITLE
          ==================================== */}

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
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Implement authentication"
              maxLength={200}
              disabled={loading}
              className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500"
            />

          </div>

          {/* ====================================
              TASK DESCRIPTION
          ==================================== */}

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
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="What needs to be done?"
              maxLength={2000}
              rows={4}
              disabled={loading}
              className="w-full resize-none rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500"
            />

          </div>

          {/* ====================================
              TASK STATUS
          ==================================== */}

          <div>

            <label
              htmlFor="task-status"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              Status
            </label>

            <select
              id="task-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              disabled={loading}
              className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
            >
              <option value="todo">
                To Do
              </option>

              <option value="in_progress">
                In Progress
              </option>

              <option value="completed">
                Completed
              </option>
            </select>

          </div>

          {/* ====================================
              BUTTONS
          ==================================== */}

          <div className="flex justify-end gap-3 border-t border-white/10 pt-5">

            {/* Cancel */}

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            {/* Create */}

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-2.5 text-sm font-medium text-white transition hover:from-purple-500 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create Task"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateTaskModal;