import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Plus, Search, ArrowUpRight } from "lucide-react";

import { useAuth } from "../context/useAuth";

import CreateProjectModal from "../components/projects/CreateProjectModal";

import Sidebar from "../components/dashboard/Sidebar";

function Projects() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showCreateProject, setShowCreateProject] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!accessToken) {
        setProjects([]);
        setLoading(false);
        return;
    }

    try {
        const response = await fetch(
            "http://127.0.0.1:8000/api/projects",
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch projects.");
        }

        const data = await response.json();

        setProjects(data);
        setError("");

    } catch (error) {
        console.error("Projects error:", error);
        setError("Unable to load your projects.");

    } finally {
        setLoading(false);
    }
}, [accessToken]);

useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
        if (!accessToken) {
            return;
        }

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/api/projects",
                {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    signal: AbortSignal.timeout(15000),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch projects.");
            }

            const data = await response.json();

            if (!cancelled) {
                setProjects(data);
                setError("");
            }

        } catch (error) {
            if (!cancelled) {
                console.error("Projects error:", error);
                setError("Unable to load your projects.");
            }

        } finally {
            if (!cancelled) {
                setLoading(false);
            }
        }
    };

    loadProjects();

    return () => {
        cancelled = true;
    };
}, [accessToken]);

  const filteredProjects = projects.filter((project) => {
    const searchValue = search.toLowerCase();

    return (
      project.name.toLowerCase().includes(searchValue) ||
      (project.description || "").toLowerCase().includes(searchValue)
    );
  });

  return (
    <div className="min-h-screen bg-[#07070a] text-white">
      <Sidebar />
      {/* Main Content */}

      <main className="ml-64 min-h-screen p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Projects</h1>

              <p className="mt-2 text-gray-400">
                Manage and organize your development projects.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateProject(true)}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-500 px-5 py-3 font-semibold text-white shadow-lg shadow-purple-900/20 transition hover:scale-[1.02]"
            >
              <Plus size={19} />
              New Project
            </button>
          </div>

          {/* Search */}

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects..."
                className="w-full rounded-lg border border-white/10 bg-[#111116] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Loading */}

          {loading && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-48 animate-pulse rounded-xl border border-white/10 bg-[#111116]"
                />
              ))}
            </div>
          )}

          {/* Error */}

          {!loading && error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Empty state */}

          {!loading && !error && filteredProjects.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-[#111116] px-6 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <FolderKanban size={25} />
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                {search ? "No projects found" : "No projects yet"}
              </h2>

              <p className="mt-2 max-w-md text-sm text-gray-500">
                {search
                  ? "Try a different search term."
                  : "Create your first project to start building with Velocyte."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={() => setShowCreateProject(true)}
                  className="mt-6 flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold transition hover:bg-purple-500"
                >
                  <Plus size={18} />
                  Create Project
                </button>
              )}
            </div>
          )}

          {/* Projects */}

          {!loading && !error && filteredProjects.length > 0 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="group rounded-xl border border-white/10 bg-[#111116] p-6 transition hover:border-purple-500/30 hover:bg-[#15151b]"
                >
                  {/* Icon */}

                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                      <FolderKanban size={21} />
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/5 hover:text-white"
                      aria-label={`Open ${project.name}`}
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </div>

                  {/* Content */}

                  <h2 className="text-lg font-semibold text-white">
                    {project.name}
                  </h2>

                  <p className="mt-2 min-h-10 text-sm leading-5 text-gray-500">
                    {project.description || "No description"}
                  </p>

                  {/* Footer */}

                  <div className="mt-6 flex items-center justify-between">
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                      Active
                    </span>

                    <span className="text-xs text-gray-600">Project</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Project Modal */}

      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onProjectCreated={() => {
          setShowCreateProject(false);
          fetchProjects();
        }}
      />
    </div>
  );
}

export default Projects;
