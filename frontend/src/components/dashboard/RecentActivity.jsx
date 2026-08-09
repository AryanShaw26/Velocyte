import {
    CheckCircle2,
    GitPullRequest,
    Bot,
    FolderPlus,
    Circle,
} from "lucide-react";


function RecentActivity() {

    const activities = [
        {
            id: 1,
            title: "Task completed",
            description: "Authentication flow was completed",
            time: "20 minutes ago",
            icon: CheckCircle2,
            iconStyle: "text-emerald-400 bg-emerald-500/10",
        },
        {
            id: 2,
            title: "Pull request opened",
            description: "Added dashboard authentication flow",
            time: "1 hour ago",
            icon: GitPullRequest,
            iconStyle: "text-purple-400 bg-purple-500/10",
        },
        {
            id: 3,
            title: "AI review completed",
            description: "Code review finished for authService.js",
            time: "3 hours ago",
            icon: Bot,
            iconStyle: "text-blue-400 bg-blue-500/10",
        },
        {
            id: 4,
            title: "Project created",
            description: "New Velocyte workspace created",
            time: "Yesterday",
            icon: FolderPlus,
            iconStyle: "text-amber-400 bg-amber-500/10",
        },
    ];


    return (
        <section className="mt-6 rounded-xl border border-white/10 bg-[#111116]">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

                <div>

                    <h2 className="text-lg font-semibold text-white">
                        Recent Activity
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Latest activity across your workspace
                    </p>

                </div>

                <button
                    type="button"
                    className="text-sm font-medium text-purple-400 transition hover:text-purple-300"
                >
                    View all
                </button>

            </div>


            {/* Activity list */}

            <div className="divide-y divide-white/5">

                {activities.map((activity) => {

                    const Icon = activity.icon;

                    return (
                        <div
                            key={activity.id}
                            className="flex items-center gap-4 px-6 py-5 transition hover:bg-white/[0.02]"
                        >

                            {/* Icon */}

                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${activity.iconStyle}`}
                            >
                                <Icon
                                    size={19}
                                    strokeWidth={1.8}
                                />
                            </div>


                            {/* Content */}

                            <div className="min-w-0 flex-1">

                                <h3 className="text-sm font-medium text-white">
                                    {activity.title}
                                </h3>

                                <p className="mt-1 truncate text-sm text-gray-500">
                                    {activity.description}
                                </p>

                            </div>


                            {/* Time */}

                            <div className="hidden items-center gap-2 sm:flex">

                                <Circle
                                    size={5}
                                    fill="currentColor"
                                    className="text-gray-600"
                                />

                                <span className="whitespace-nowrap text-xs text-gray-500">
                                    {activity.time}
                                </span>

                            </div>

                        </div>
                    );

                })}

            </div>

        </section>
    );
}


export default RecentActivity;