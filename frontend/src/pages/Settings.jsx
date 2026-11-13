import { useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import { useAuth } from "../context/useAuth";

function Settings() {
    const { accessToken } = useAuth();

    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState("");

    const handleGitHubConnect = async () => {
        if (!accessToken) {
            setError("Your session has expired. Please log in again.");
            return;
        }

        try {
            setConnecting(true);
            setError("");

            const response = await fetch(
                "http://127.0.0.1:8000/api/auth/github/connect",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Unable to connect GitHub."
                );
            }

            if (!data.authorization_url) {
                throw new Error("GitHub authorization URL is missing.");
            }

            window.location.assign(data.authorization_url);

        } catch (err) {
            console.error("GitHub connection error:", err);
            setError(err.message);
            setConnecting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#07070a] text-white">
            <Sidebar />

            <main className="ml-64 min-h-screen p-8">
                <div className="mx-auto max-w-5xl">

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">
                            Settings
                        </h1>

                        <p className="mt-2 text-gray-400">
                            Manage your account and integrations.
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-[#111116] p-6">

                        <div className="mb-6 flex items-center gap-3">
                            <SettingsIcon className="text-purple-400" />

                            <h2 className="text-xl font-semibold">
                                Integrations
                            </h2>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0b0b0f] p-5">

                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-lg font-bold text-black">
                                    GH
                                </div>

                                <div>
                                    <h3 className="font-semibold">
                                        GitHub
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-400">
                                        Connect GitHub to access repositories,
                                        manage pull requests and enable AI code reviews.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGitHubConnect}
                                disabled={connecting}
                                className="rounded-lg bg-purple-600 px-5 py-2.5 font-medium transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {connecting ? "Connecting..." : "Connect GitHub"}
                            </button>

                        </div>

                        {error && (
                            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}

export default Settings;