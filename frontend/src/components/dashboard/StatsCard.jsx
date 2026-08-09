import {
    FolderKanban,
    CheckSquare,
    GitPullRequest,
    Bot,
} from "lucide-react";


const iconMap = {
    projects: FolderKanban,
    tasks: CheckSquare,
    pullRequests: GitPullRequest,
    aiReviews: Bot,
};


function StatsCard({
    title,
    value,
    change,
    type,
}) {

    const Icon = iconMap[type] || FolderKanban;

    return (
        <div className="group rounded-xl border border-white/10 bg-[#111116] p-5 transition duration-200 hover:border-purple-500/30 hover:bg-[#131319]">

            {/* Top */}

            <div className="flex items-start justify-between">

                <div>

                    <p className="text-sm font-medium text-gray-400">
                        {title}
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-white">
                        {value}
                    </h2>

                </div>


                {/* Icon */}

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/[0.05] text-purple-400 transition group-hover:bg-purple-500/10">

                    <Icon
                        size={21}
                        strokeWidth={1.8}
                    />

                </div>

            </div>


            {/* Change */}

            <div className="mt-4">

                <span className="text-sm font-medium text-emerald-400">
                    {change}
                </span>

            </div>

        </div>
    );
}


export default StatsCard;