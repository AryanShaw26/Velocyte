import StatsCard from "./StatsCard";


function StatsGrid() {

    const stats = [
        {
            title: "Projects",
            value: "12",
            change: "+3 this week",
            type: "projects",
        },
        {
            title: "Open Tasks",
            value: "48",
            change: "+12 today",
            type: "tasks",
        },
        {
            title: "Pull Requests",
            value: "16",
            change: "+5 pending",
            type: "pullRequests",
        },
        {
            title: "AI Reviews",
            value: "24",
            change: "+18%",
            type: "aiReviews",
        },
    ];


    return (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {stats.map((stat) => (

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