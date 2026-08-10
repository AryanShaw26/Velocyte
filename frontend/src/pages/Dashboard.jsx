import { useState } from "react";

import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsGrid from "../components/dashboard/StatsGrid";
import RecentProjects from "../components/dashboard/RecentProjects";
import RecentActivity from "../components/dashboard/RecentActivity";

import CreateProjectModal from "../components/projects/CreateProjectModal";


function Dashboard() {

    // ============================================================
    // CREATE PROJECT MODAL
    // ============================================================

    const [showCreateProject, setShowCreateProject] = useState(false);


    // ============================================================
    // DASHBOARD REFRESH KEY
    //
    // Every time this value changes, the dashboard components
    // will fetch fresh data from the backend.
    //
    // This allows us to update the dashboard WITHOUT doing:
    // window.location.reload()
    // ============================================================

    const [refreshKey, setRefreshKey] = useState(0);


    // ============================================================
    // HANDLE PROJECT CREATED
    //
    // Called after a project is successfully created.
    // ============================================================

    const handleProjectCreated = () => {

        // Increase refresh key.
        //
        // StatsGrid, RecentProjects and RecentActivity
        // will detect this change and fetch fresh data.

        setRefreshKey((previousKey) => previousKey + 1);

        // Close the modal.

        setShowCreateProject(false);
    };


    return (

        <div className="min-h-screen bg-[#07070a] text-white">


            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <Sidebar />


            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

            <main className="ml-64 min-h-screen p-8">

                <div className="mx-auto max-w-7xl">


                    {/* ==================================================
                        DASHBOARD HEADER
                    ================================================== */}

                    <DashboardHeader
                        onNewProject={() => setShowCreateProject(true)}
                    />


                    {/* ==================================================
                        STATISTICS
                        
                        refreshKey forces StatsGrid to fetch
                        fresh statistics after changes.
                    ================================================== */}

                    <StatsGrid
                        refreshKey={refreshKey}
                    />


                    {/* ==================================================
                        RECENT PROJECTS
                    ================================================== */}

                    <RecentProjects
                        refreshKey={refreshKey}
                    />


                    {/* ==================================================
                        RECENT ACTIVITY
                    ================================================== */}

                    <RecentActivity
                        refreshKey={refreshKey}
                    />

                </div>

            </main>


            {/* ======================================================
                CREATE PROJECT MODAL
            ====================================================== */}

            <CreateProjectModal

                isOpen={showCreateProject}

                onClose={() => setShowCreateProject(false)}

                onProjectCreated={handleProjectCreated}

            />

        </div>

    );
}


export default Dashboard;