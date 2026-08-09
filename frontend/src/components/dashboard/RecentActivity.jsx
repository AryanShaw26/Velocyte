import { useEffect, useState } from "react";

import {
    Activity,
    CheckCircle2,
    FolderKanban,
    GitPullRequest,
    Sparkles,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";


function RecentActivity() {

    const { accessToken } = useAuth();

    const [activities, setActivities] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        const fetchActivity = async () => {

            if (!accessToken) {
                setLoading(false);
                return;
            }

            try {

                setLoading(true);
                setError("");

                const response = await fetch(
                    "http://127.0.0.1:8000/api/dashboard/activity",
                    {
                        method: "GET",

                        headers: {
                            "Accept": "application/json",
                            "Authorization": `Bearer ${accessToken}`,
                        },
                    }
                );


                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch activity"
                    );
                }


                const data = await response.json();

                setActivities(data);

            } catch (error) {

                console.error(
                    "Activity error:",
                    error
                );

                setError(
                    "Unable to load recent activity."
                );

            } finally {

                setLoading(false);

            }
        };


        fetchActivity();

    }, [accessToken]);


    const getActivityIcon = (type) => {

        switch (type) {

            case "project":
                return <FolderKanban size={18} />;

            case "task":
                return <CheckCircle2 size={18} />;

            case "pull_request":
                return <GitPullRequest size={18} />;

            case "ai_review":
                return <Sparkles size={18} />;

            default:
                return <Activity size={18} />;
        }
    };


    return (
        <section className="mt-6 rounded-xl border border-white/10 bg-[#111116]">

            {/* Header */}

            <div className="border-b border-white/10 px-6 py-5">

                <h2 className="text-lg font-semibold text-white">
                    Recent Activity
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Latest activity across your workspace
                </p>

            </div>


            {/* Loading */}

            {loading && (

                <div className="space-y-4 p-6">

                    {[1, 2, 3, 4].map((item) => (

                        <div
                            key={item}
                            className="flex items-center gap-4"
                        >

                            <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.04]" />

                            <div className="flex-1">

                                <div className="h-4 w-40 animate-pulse rounded bg-white/[0.04]" />

                                <div className="mt-2 h-3 w-24 animate-pulse rounded bg-white/[0.04]" />

                            </div>

                        </div>

                    ))}

                </div>

            )}


            {/* Error */}

            {!loading && error && (

                <div className="p-6 text-sm text-red-400">
                    {error}
                </div>

            )}


            {/* Empty state */}

            {!loading && !error && activities.length === 0 && (

                <div className="flex flex-col items-center justify-center px-6 py-12 text-center">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">

                        <Activity size={22} />

                    </div>

                    <h3 className="mt-4 font-medium text-white">
                        No recent activity
                    </h3>

                    <p className="mt-1 max-w-sm text-sm text-gray-500">
                        Your project and development activity will appear here.
                    </p>

                </div>

            )}


            {/* Activity list */}

            {!loading && !error && activities.length > 0 && (

                <div className="divide-y divide-white/5">

                    {activities.map((activity) => (

                        <div
                            key={activity.id}
                            className="flex items-center gap-4 px-6 py-4 transition hover:bg-white/[0.02]"
                        >

                            {/* Icon */}

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">

                                {getActivityIcon(activity.type)}

                            </div>


                            {/* Content */}

                            <div className="min-w-0 flex-1">

                                <p className="text-sm font-medium text-white">
                                    {activity.title}
                                </p>

                                <p className="mt-1 truncate text-sm text-gray-500">
                                    {activity.description}
                                </p>

                            </div>


                            {/* Time */}

                            <span className="shrink-0 text-xs text-gray-500">
                                {activity.time}
                            </span>

                        </div>

                    ))}

                </div>

            )}

        </section>
    );
}


export default RecentActivity;