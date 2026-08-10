import { NavLink, useNavigate } from "react-router-dom";

import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    GitPullRequest,
    GitBranch,
    Bot,
    BarChart3,
    Settings,
    LogOut,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";


function Sidebar() {

    const navigate = useNavigate();

    const { logout } = useAuth();


    // ============================================================
    // LOGOUT
    // ============================================================

    const handleLogout = () => {

        logout();

        navigate("/login");

    };


    // ============================================================
    // SIDEBAR NAVIGATION ITEMS
    // ============================================================

    const navItems = [

        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
        },

        {
            name: "Projects",
            path: "/projects",
            icon: FolderKanban,
        },

        {
            name: "Tasks",
            path: "/tasks",
            icon: CheckSquare,
        },

        {
            name: "Pull Requests",
            path: "/pull-requests",
            icon: GitPullRequest,
        },

        {
            name: "GitHub",
            path: "/github",
            icon: GitBranch,
        },

        {
            name: "AI Reviews",
            path: "/ai-reviews",
            icon: Bot,
        },

        {
            name: "Analytics",
            path: "/analytics",
            icon: BarChart3,
        },

    ];


    return (

        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/10 bg-[#0b0b0f]">

            {/* ==================================================
                LOGO
            ================================================== */}

            <div className="flex h-20 items-center border-b border-white/10 px-6">

                <NavLink
                    to="/dashboard"
                    className="text-2xl font-bold tracking-tight text-white"
                >
                    Velocyte
                </NavLink>

            </div>


            {/* ==================================================
                MAIN NAVIGATION
            ================================================== */}

            <nav className="flex-1 px-4 py-6">

                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Workspace
                </p>

                <div className="space-y-1">

                    {navItems.map((item) => {

                        const Icon = item.icon;

                        return (

                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-purple-600/15 text-purple-400"
                                            : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
                                    }`
                                }
                            >

                                <Icon
                                    size={19}
                                    strokeWidth={1.8}
                                />

                                <span>
                                    {item.name}
                                </span>

                            </NavLink>

                        );

                    })}

                </div>


                {/* =================================================
                    ACCOUNT NAVIGATION
                ================================================= */}

                <div className="mt-8">

                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Account
                    </p>

                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                                isActive
                                    ? "bg-purple-600/15 text-purple-400"
                                    : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
                            }`
                        }
                    >

                        <Settings
                            size={19}
                            strokeWidth={1.8}
                        />

                        <span>
                            Settings
                        </span>

                    </NavLink>

                </div>

            </nav>


            {/* ==================================================
                LOGOUT
            ================================================== */}

            <div className="border-t border-white/10 p-4">

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
                >

                    <LogOut
                        size={19}
                        strokeWidth={1.8}
                    />

                    <span>
                        Logout
                    </span>

                </button>

            </div>

        </aside>

    );

}


export default Sidebar;