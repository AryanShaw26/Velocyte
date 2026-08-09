import { ArrowUpRight, FolderKanban } from "lucide-react";


function RecentProjects() {

    const projects = [
        {
            id: 1,
            name: "Velocyte",
            description: "AI-powered development workspace",
            status: "In Progress",
            updated: "2 hours ago",
        },
        {
            id: 2,
            name: "SmartPay",
            description: "Digital payment and wallet platform",
            status: "Completed",
            updated: "Yesterday",
        },
        {
            id: 3,
            name: "Brain Tumor Detection",
            description: "MRI classification using deep learning",
            status: "In Progress",
            updated: "3 days ago",
        },
    ];


    return (
        <section className="mt-6 rounded-xl border border-white/10 bg-[#111116]">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

                <div>
                    <h2 className="text-lg font-semibold text-white">
                        Recent Projects
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Your latest development projects
                    </p>
                </div>

                <button
                    type="button"
                    className="text-sm font-medium text-purple-400 transition hover:text-purple-300"
                >
                    View all
                </button>

            </div>


            {/* Projects */}

            <div className="divide-y divide-white/5">

                {projects.map((project) => (

                    <div
                        key={project.id}
                        className="flex items-center justify-between px-6 py-5 transition hover:bg-white/[0.02]"
                    >

                        {/* Project information */}

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
                                    {project.description}
                                </p>

                            </div>

                        </div>


                        {/* Status */}

                        <div className="hidden items-center gap-10 md:flex">

                            <div>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                        project.status === "Completed"
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : "bg-amber-500/10 text-amber-400"
                                    }`}
                                >
                                    {project.status}
                                </span>

                            </div>


                            <p className="w-24 text-sm text-gray-500">
                                {project.updated}
                            </p>


                            <button
                                type="button"
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/[0.05] hover:text-white"
                                aria-label={`Open ${project.name}`}
                            >
                                <ArrowUpRight size={18} />
                            </button>

                        </div>

                    </div>

                ))}

            </div>

        </section>
    );
}


export default RecentProjects;