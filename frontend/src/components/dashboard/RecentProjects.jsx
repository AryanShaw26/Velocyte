import { useEffect, useState } from "react";

import {
    ArrowUpRight,
    FolderKanban,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";


function RecentProjects({ refreshKey }) {

    const { accessToken } = useAuth();

    const navigate = useNavigate();


    // ============================================================
    // PROJECT STATE
    // ============================================================

    const [projects, setProjects] = useState([]);


    // ============================================================
    // LOADING / ERROR
    // ============================================================

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ============================================================
    // FETCH RECENT PROJECTS
    // ============================================================

    useEffect(() => {

        const fetchProjects = async () => {

            if (!accessToken) {

                setLoading(false);

                return;

            }


            try {

                setLoading(true);

                setError("");


                const response = await fetch(

                    "http://127.0.0.1:8000/api/dashboard/projects",

                    {

                        method: "GET",

                        headers: {

                            "Accept": "application/json",

                            "Authorization": `Bearer ${accessToken}`,

                        },

                    }

                );


                // ==================================================
                // CHECK RESPONSE
                // ==================================================

                if (!response.ok) {

                    throw new Error(
                        "Failed to fetch projects"
                    );

                }


                // ==================================================
                // GET JSON
                // ==================================================

                const data = await response.json();


                // ==================================================
                // SAVE PROJECTS
                // ==================================================

                setProjects(data);


            } catch (error) {

                console.error(
                    "Projects error:",
                    error
                );


                setError(
                    "Unable to load recent projects."
                );


            } finally {

                setLoading(false);

            }

        };


        fetchProjects();


    }, [accessToken, refreshKey]);


    return (

        <section className="mt-6 rounded-xl border border-white/10 bg-[#111116]">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

                <div>

                    <h2 className="text-lg font-semibold text-white">

                        Recent Projects

                    </h2>


                    <p className="mt-1 text-sm text-gray-500">

                        Your latest development projects

                    </p>

                </div>


                {/* ==================================================
                    VIEW ALL BUTTON
                ================================================== */}

                <button

                    type="button"

                    onClick={() => navigate("/projects")}

                    className="text-sm font-medium text-purple-400 transition hover:text-purple-300"

                >

                    View all

                </button>

            </div>


            {/* ==================================================
                LOADING
            ================================================== */}

            {loading && (

                <div className="space-y-3 p-6">

                    {[1, 2, 3].map((item) => (

                        <div

                            key={item}

                            className="h-16 animate-pulse rounded-lg bg-white/[0.03]"

                        />

                    ))}

                </div>

            )}


            {/* ==================================================
                ERROR
            ================================================== */}

            {!loading && error && (

                <div className="p-6 text-sm text-red-400">

                    {error}

                </div>

            )}


            {/* ==================================================
                EMPTY STATE
            ================================================== */}

            {!loading && !error && projects.length === 0 && (

                <div className="flex flex-col items-center justify-center px-6 py-12 text-center">

                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">

                        <FolderKanban size={22} />

                    </div>


                    <h3 className="mt-4 font-medium text-white">

                        No projects yet

                    </h3>


                    <p className="mt-1 max-w-sm text-sm text-gray-500">

                        Create your first project to start building with Velocyte.

                    </p>

                </div>

            )}


            {/* ==================================================
                PROJECT LIST
            ================================================== */}

            {!loading && !error && projects.length > 0 && (

                <div className="divide-y divide-white/5">

                    {projects.map((project) => (

                        <div

                            key={project.id}

                            className="flex items-center justify-between px-6 py-5 transition hover:bg-white/[0.02]"

                        >


                            {/* ==========================================
                                PROJECT INFORMATION
                            ========================================== */}

                            <div className="flex items-center gap-4">

                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">

                                    <FolderKanban

                                        size={20}

                                        strokeWidth={1.8}

                                    />

                                </div>


                                <div>

                                    <h3 className="font-medium text-white">

                                        {project.name}

                                    </h3>


                                    <p className="mt-1 text-sm text-gray-500">

                                        {project.description || "No description"}

                                    </p>

                                </div>

                            </div>


                            {/* ==========================================
                                PROJECT STATUS / ACTION
                            ========================================== */}

                            <div className="hidden items-center gap-10 md:flex">

                                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">

                                    {project.status}

                                </span>


                                <p className="w-24 text-sm text-gray-500">

                                    {project.updated}

                                </p>


                                {/* ======================================
                                    OPEN PROJECT
                                ====================================== */}

                                <button

                                    type="button"

                                    onClick={() =>
                                        navigate(`/projects/${project.id}`)
                                    }

                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/[0.05] hover:text-white"

                                    aria-label={`Open ${project.name}`}

                                >

                                    <ArrowUpRight size={18} />

                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </section>

    );

}


export default RecentProjects;