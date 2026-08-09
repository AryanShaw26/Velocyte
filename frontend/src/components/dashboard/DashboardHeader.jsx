import { Bell, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function DashboardHeader({ onNewProject }) {

    const { user } = useAuth();

    const firstName = user?.name
        ? user.name.split(" ")[0]
        : "there";

    return (
        <header className="mb-8 flex items-center justify-between">

            {/* Greeting */}

            <div>
                <h1 className="text-3xl font-bold text-white">
                    Good morning, {firstName} 👋
                </h1>

                <p className="mt-2 text-gray-400">
                    Here's what's happening with your projects today.
                </p>
            </div>


            {/* Actions */}

            <div className="flex items-center gap-4">

                {/* Notifications */}

                <button
                    type="button"
                    className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-gray-400 transition hover:bg-white/[0.06] hover:text-white"
                    aria-label="Notifications"
                >
                    <Bell size={19} />

                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-purple-500" />
                </button>


                {/* New Project */}

                <button
                    type="button"
                    onClick={onNewProject}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-500 px-5 py-3 font-semibold text-white shadow-lg shadow-purple-900/20 transition hover:scale-[1.02] hover:from-purple-500 hover:to-violet-400"
                >
                    <Plus size={19} />

                    <span>
                        New Project
                    </span>
                </button>

            </div>

        </header>
    );
}

export default DashboardHeader;