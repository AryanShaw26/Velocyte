import { useEffect, useState } from "react";
import { X, FolderPlus } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function CreateProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
}) {
  // ============================================
  // AUTHENTICATION
  // ============================================

  const { accessToken } = useAuth();

  // ============================================
  // FORM STATE
  // ============================================

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // ============================================
  // GITHUB REPOSITORIES
  // ============================================

  const [repositories, setRepositories] = useState([]);

  const [selectedRepository, setSelectedRepository] =
    useState("");

  const [repositoriesLoading, setRepositoriesLoading] =
    useState(false);

  const [repositoriesError, setRepositoriesError] =
    useState("");

  // ============================================
  // UI STATE
  // ============================================

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ============================================
  // FETCH GITHUB REPOSITORIES
  // ============================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!accessToken) {
      setRepositories([]);
      setRepositoriesError(
        "You must be logged in to access GitHub repositories."
      );
      return;
    }

    const fetchRepositories = async () => {
      try {
        setRepositoriesLoading(true);
        setRepositoriesError("");
        setError("");

        const response = await fetch(
          "http://127.0.0.1:8000/api/github/repositories",
          {
            method: "GET",

            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          let errorMessage =
            "Failed to fetch GitHub repositories.";

          if (typeof data.detail === "string") {
            errorMessage = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorMessage = data.detail
              .map((item) => {
                if (typeof item === "string") {
                  return item;
                }

                return (
                  item.msg ||
                  item.message ||
                  JSON.stringify(item)
                );
              })
              .join(", ");
          }

          throw new Error(errorMessage);
        }

        setRepositories(
          Array.isArray(data.repositories)
            ? data.repositories
            : []
        );

      } catch (error) {
        console.error(
          "GitHub repositories error:",
          error
        );

        setRepositories([]);
        setRepositoriesError(
          error.message ||
            "Unable to load GitHub repositories."
        );

      } finally {
        setRepositoriesLoading(false);
      }
    };

    fetchRepositories();
  }, [isOpen, accessToken]);

  // ============================================
  // DON'T RENDER WHEN MODAL IS CLOSED
  // ============================================

  if (!isOpen) {
    return null;
  }

  // ============================================
  // CREATE PROJECT
  // ============================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // --------------------------------------------
    // VALIDATE AUTHENTICATION
    // --------------------------------------------

    if (!accessToken) {
      setError(
        "Your session has expired. Please log in again."
      );
      return;
    }

    // --------------------------------------------
    // VALIDATE PROJECT NAME
    // --------------------------------------------

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Project name is required.");
      return;
    }

    // --------------------------------------------
    // VALIDATE GITHUB REPOSITORY
    // --------------------------------------------

    if (!selectedRepository) {
      setError(
        "Please select a GitHub repository."
      );
      return;
    }

    // --------------------------------------------
    // FIND SELECTED REPOSITORY
    // --------------------------------------------

    const repository = repositories.find(
      (repo) =>
        String(repo.id) ===
        String(selectedRepository)
    );

    if (!repository) {
      setError(
        "Selected GitHub repository could not be found."
      );
      return;
    }

    // --------------------------------------------
    // VALIDATE REPOSITORY DATA
    // --------------------------------------------

    if (
      repository.id === undefined ||
      !repository.owner ||
      !repository.name
    ) {
      setError(
        "Selected GitHub repository contains incomplete information."
      );
      return;
    }

    try {
      setLoading(true);

      // ========================================
      // 1. CREATE VELOCYTE PROJECT
      // ========================================

      const projectResponse = await fetch(
        "http://127.0.0.1:8000/api/projects",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },

          body: JSON.stringify({
            name: trimmedName,
            description:
              description.trim() || null,
          }),
        }
      );

      const projectData =
        await projectResponse.json();

      if (!projectResponse.ok) {
        let errorMessage =
          "Failed to create project.";

        if (
          typeof projectData.detail ===
          "string"
        ) {
          errorMessage =
            projectData.detail;
        } else if (
          Array.isArray(projectData.detail)
        ) {
          errorMessage =
            projectData.detail
              .map((item) => {
                if (
                  typeof item === "string"
                ) {
                  return item;
                }

                return (
                  item.msg ||
                  item.message ||
                  JSON.stringify(item)
                );
              })
              .join(", ");
        }

        throw new Error(errorMessage);
      }

      // ========================================
      // VALIDATE CREATED PROJECT ID
      // ========================================

      if (!projectData.id) {
        throw new Error(
          "Project was created but no project ID was returned."
        );
      }

      // ========================================
      // 2. BUILD GITHUB CONNECTION PARAMETERS
      // ========================================

      const githubParams =
        new URLSearchParams({
          github_repo_id: String(
            repository.id
          ),

          github_owner:
            repository.owner,

          github_repository:
            repository.name,
        });

      // ========================================
      // 3. CONNECT GITHUB REPOSITORY
      // ========================================

      const connectResponse =
        await fetch(
          `http://127.0.0.1:8000/api/projects/${projectData.id}/github?${githubParams.toString()}`,
          {
            method: "POST",

            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

      const connectedProject =
        await connectResponse.json();

      // ========================================
      // HANDLE GITHUB CONNECTION ERROR
      // ========================================

      if (!connectResponse.ok) {
        let errorMessage =
          "Project was created, but the GitHub repository could not be connected.";

        if (
          typeof connectedProject.detail ===
          "string"
        ) {
          errorMessage =
            connectedProject.detail;
        } else if (
          Array.isArray(
            connectedProject.detail
          )
        ) {
          errorMessage =
            connectedProject.detail
              .map((item) => {
                if (
                  typeof item === "string"
                ) {
                  return item;
                }

                return (
                  item.msg ||
                  item.message ||
                  JSON.stringify(item)
                );
              })
              .join(", ");
        }

        throw new Error(errorMessage);
      }

      // ========================================
      // 4. RESET FORM
      // ========================================

      setName("");
      setDescription("");
      setSelectedRepository("");

      // ========================================
      // 5. INFORM PARENT COMPONENT
      // ========================================

      if (onProjectCreated) {
        onProjectCreated(
          connectedProject
        );
      }

      // ========================================
      // 6. CLOSE MODAL
      // ========================================

      onClose();

    } catch (error) {
      console.error(
        "Create project error:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while creating the project."
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

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <FolderPlus size={20} />
            </div>

            <div>

              <h2 className="text-lg font-semibold text-white">
                Create Project
              </h2>

              <p className="text-sm text-gray-500">
                Start a new development project
              </p>

            </div>

          </div>

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
              ERROR
          ==================================== */}

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* ====================================
              PROJECT NAME
          ==================================== */}

          <div>

            <label
              htmlFor="project-name"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              Project name
            </label>

            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="e.g. Velocyte"
              maxLength={150}
              disabled={loading}
              className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500"
            />

          </div>

          {/* ====================================
              PROJECT DESCRIPTION
          ==================================== */}

          <div>

            <label
              htmlFor="project-description"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              Description

              <span className="ml-2 text-gray-600">
                Optional
              </span>

            </label>

            <textarea
              id="project-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="What are you building?"
              maxLength={1000}
              rows={4}
              disabled={loading}
              className="w-full resize-none rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500"
            />

          </div>

          {/* ====================================
              GITHUB REPOSITORY
          ==================================== */}

          <div>

            <label
              htmlFor="github-repository"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              GitHub Repository
            </label>

            {repositoriesLoading ? (

              <div className="rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-gray-500">
                Loading your GitHub repositories...
              </div>

            ) : repositoriesError ? (

              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {repositoriesError}
              </div>

            ) : repositories.length === 0 ? (

              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
                No GitHub repositories are available.
              </div>

            ) : (

              <select
                id="github-repository"
                value={selectedRepository}
                onChange={(event) =>
                  setSelectedRepository(
                    event.target.value
                  )
                }
                disabled={loading}
                className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
              >

                <option value="">
                  Select a GitHub repository
                </option>

                {repositories.map(
                  (repository) => (
                    <option
                      key={repository.id}
                      value={repository.id}
                    >
                      {repository.full_name}
                    </option>
                  )
                )}

              </select>

            )}

          </div>

          {/* ====================================
              BUTTONS
          ==================================== */}

          <div className="flex justify-end gap-3 border-t border-white/10 pt-5">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                repositoriesLoading ||
                !repositories.length
              }
              className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-2.5 text-sm font-medium text-white transition hover:from-purple-500 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create Project"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateProjectModal;