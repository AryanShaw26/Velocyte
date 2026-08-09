import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsGrid from "../components/dashboard/StatsGrid";
import RecentProjects from "../components/dashboard/RecentProjects";
import RecentActivity from "../components/dashboard/RecentActivity";

function Dashboard() {
    return (
        <div className="min-h-screen bg-[#07070a] text-white">

            <Sidebar />

            <main className="ml-64 min-h-screen p-8">

                <div className="mx-auto max-w-7xl">

                    <DashboardHeader />
                    <StatsGrid></StatsGrid>
                    <RecentProjects />
                    <RecentActivity />

                </div>

            </main>

        </div>
    );
}

export default Dashboard;