import { useState } from "react";

import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsGrid from "../components/dashboard/StatsGrid";
import RecentProjects from "../components/dashboard/RecentProjects";
import RecentActivity from "../components/dashboard/RecentActivity";

import CreateProjectModal from "../components/projects/CreateProjectModal";


function Dashboard() {

    const [showCreateProject, setShowCreateProject] = useState(false);


    return (
        <div className="min-h-screen bg-[#07070a] text-white">

            <Sidebar />


            <main className="ml-64 min-h-screen p-8">

                <div className="mx-auto max-w-7xl">

                    <DashboardHeader
                        onNewProject={() => setShowCreateProject(true)}
                    />


                    <StatsGrid />


                    <RecentProjects />


                    <RecentActivity />

                </div>

            </main>


            {/* Create Project Modal */}

            <CreateProjectModal
                isOpen={showCreateProject}
                onClose={() => setShowCreateProject(false)}
                onProjectCreated={() => {
                    window.location.reload();
                }}
            />

        </div>
    );
}


export default Dashboard;