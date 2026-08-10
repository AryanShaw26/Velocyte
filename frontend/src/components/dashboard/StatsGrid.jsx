import { useEffect, useState } from "react";

import StatsCard from "./StatsCard";

import { useAuth } from "../../context/AuthContext";


function StatsGrid({ refreshKey }) {

    const { accessToken } = useAuth();


    // ============================================================
    // DASHBOARD STATISTICS
    // ============================================================

    const [stats, setStats] = useState({

        projects: 0,

        open_tasks: 0,

        pull_requests: 0,

        ai_reviews: 0,

    });


    // ============================================================
    // LOADING / ERROR
    // ============================================================

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ============================================================
    // FETCH DASHBOARD STATISTICS
    //
    // This runs:
    // 1. When the user logs in
    // 2. When accessToken changes
    // 3. Whenever refreshKey changes
    // ============================================================

    useEffect(() => {

        const fetchStats = async () => {

            if (!accessToken) {

                setLoading(false);

                return;

            }


            try {

                setLoading(true);

                setError("");


                const response = await fetch(

                    "http://127.0.0.1:8000/api/dashboard/stats",

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
                        "Failed to fetch dashboard statistics"
                    );

                }


                // ==================================================
                // CONVERT RESPONSE TO JSON
                // ==================================================

                const data = await response.json();


                // ==================================================
                // SAVE DATA
                // ==================================================

                setStats(data);


            } catch (error) {

                console.error(
                    "Dashboard stats error:",
                    error
                );


                setError(
                    "Unable to load dashboard statistics."
                );


            } finally {

                setLoading(false);

            }

        };


        fetchStats();


    }, [accessToken, refreshKey]);


    // ============================================================
    // STATISTICS CARDS
    // ============================================================

    const statsCards = [

        {
            title: "Projects",

            value: stats.projects,

            change: "Your active projects",

            type: "projects",
        },


        {
            title: "Open Tasks",

            value: stats.open_tasks,

            change: "Tasks requiring attention",

            type: "tasks",
        },


        {
            title: "Pull Requests",

            value: stats.pull_requests,

            change: "Across your projects",

            type: "pullRequests",
        },


        {
            title: "AI Reviews",

            value: stats.ai_reviews,

            change: "Code reviews completed",

            type: "aiReviews",
        },

    ];


    // ============================================================
    // LOADING STATE
    // ============================================================

    if (loading) {

        return (

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {[1, 2, 3, 4].map((item) => (

                    <div

                        key={item}

                        className="h-[140px] animate-pulse rounded-xl border border-white/10 bg-[#111116]"

                    />

                ))}

            </section>

        );

    }


    // ============================================================
    // ERROR STATE
    // ============================================================

    if (error) {

        return (

            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-400">

                {error}

            </div>

        );

    }


    // ============================================================
    // RENDER STATISTICS
    // ============================================================

    return (

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {statsCards.map((stat) => (

                <StatsCard

                    key={stat.title}

                    title={stat.title}

                    value={stat.value}

                    change={stat.change}

                    type={stat.type}

                />

            ))}

        </section>

    );

}


export default StatsGrid;