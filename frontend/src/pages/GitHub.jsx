// ============================================================
// Velocyte - GitHub Integration Page
// ============================================================
//
// This page allows us to test the GitHub integration directly
// from the Velocyte UI.
//
// Current functionality:
// 1. Test GitHub connection
// 2. Load Pull Requests
// 3. Select a Pull Request
// 4. View PR details
// 5. View changed files
// 6. View code diff / patch
// 7. Display backend errors clearly
//
// Later:
// The "Run AI Review" button will send the selected PR diff
// to the AI review engine.
// ============================================================

import { useEffect, useState } from "react";

import {
    GitPullRequest,
    GitBranch,
    FileCode2,
    RefreshCw,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    Bot,
} from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import { useAuth } from "../context/AuthContext";


// ============================================================
// API BASE URL
// ============================================================

const API_BASE_URL = "http://localhost:8000";

// ============================================================
// MAIN COMPONENT
// ============================================================

function GitHub() {

    // --------------------------------------------------------
    // Authentication
    // --------------------------------------------------------

    const { accessToken } = useAuth();


    // --------------------------------------------------------
    // GitHub connection state
    // --------------------------------------------------------

    const [connection, setConnection] = useState(null);

    const [connectionLoading, setConnectionLoading] = useState(false);

    const [connectionError, setConnectionError] = useState("");


    // --------------------------------------------------------
    // Pull Request state
    // --------------------------------------------------------

    const [pullRequests, setPullRequests] = useState([]);

    const [pullRequestsLoading, setPullRequestsLoading] =
        useState(false);

    const [pullRequestsError, setPullRequestsError] =
        useState("");


    // --------------------------------------------------------
    // Selected Pull Request
    // --------------------------------------------------------

    const [selectedPR, setSelectedPR] = useState(null);

    const [selectedPRLoading, setSelectedPRLoading] =
        useState(false);

    const [selectedPRError, setSelectedPRError] =
        useState("");


    // --------------------------------------------------------
    // PR files
    // --------------------------------------------------------

    const [prFiles, setPRFiles] = useState([]);

    const [filesLoading, setFilesLoading] =
        useState(false);

    const [filesError, setFilesError] =
        useState("");


    // --------------------------------------------------------
    // Expanded file
    // --------------------------------------------------------

    const [expandedFile, setExpandedFile] =
        useState(null);


    // --------------------------------------------------------
    // AI review state
    // --------------------------------------------------------

    const [aiReviewLoading, setAIReviewLoading] =
        useState(false);

    const [aiReviewMessage, setAIReviewMessage] =
        useState("");


    // ========================================================
    // GENERIC AUTH HEADERS
    // ========================================================

    const getHeaders = () => {

        return {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
        };

    };


    // ========================================================
    // TEST GITHUB CONNECTION
    // ========================================================

    const testGitHubConnection = async () => {

        if (!accessToken) {

            setConnectionError(
                "You are not authenticated."
            );

            return;

        }


        try {

            setConnectionLoading(true);

            setConnectionError("");

            setConnection(null);


            const response = await fetch(
                `${API_BASE_URL}/api/github/test`,
                {
                    method: "GET",
                    headers: getHeaders(),
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "GitHub connection failed."
                );

            }


            setConnection(data);

        } catch (error) {

            console.error(
                "GitHub connection error:",
                error
            );

            setConnectionError(
                error.message ||
                "Unable to connect to GitHub."
            );

        } finally {

            setConnectionLoading(false);

        }

    };


    // ========================================================
    // FETCH PULL REQUESTS
    // ========================================================
    //
    // NOTE:
    // The backend endpoint currently created for us fetches
    // individual PRs.
    //
    // We therefore use the GitHub repository API through our
    // backend only when the corresponding endpoint exists.
    //
    // For the first UI test, we use PR #1.
    // ========================================================

    const loadPullRequest = async (prNumber = 1) => {

        if (!accessToken) {

            setPullRequestsError(
                "You are not authenticated."
            );

            return;

        }


        try {

            setSelectedPRLoading(true);

            setSelectedPRError("");

            setSelectedPR(null);

            setPRFiles([]);

            setFilesError("");

            setExpandedFile(null);


            // ------------------------------------------------
            // Fetch PR details
            // ------------------------------------------------

            const prResponse = await fetch(
                `${API_BASE_URL}/api/github/pull-requests/${prNumber}`,
                {
                    method: "GET",
                    headers: getHeaders(),
                }
            );


            const prData = await prResponse.json();


            if (!prResponse.ok) {

                throw new Error(
                    prData.detail ||
                    "Failed to load Pull Request."
                );

            }


            setSelectedPR(prData);

            setPullRequests([prData]);


            // ------------------------------------------------
            // Fetch changed files
            // ------------------------------------------------

            setFilesLoading(true);


            const filesResponse = await fetch(
                `${API_BASE_URL}/api/github/pull-requests/${prNumber}/files`,
                {
                    method: "GET",
                    headers: getHeaders(),
                }
            );


            const filesData = await filesResponse.json();


            if (!filesResponse.ok) {

                throw new Error(
                    filesData.detail ||
                    "Failed to load Pull Request files."
                );

            }


            setPRFiles(
                filesData.files || []
            );

        } catch (error) {

            console.error(
                "Pull Request error:",
                error
            );

            setSelectedPRError(
                error.message ||
                "Unable to load Pull Request."
            );

        } finally {

            setSelectedPRLoading(false);

            setFilesLoading(false);

        }

    };


    // ========================================================
    // INITIAL CONNECTION TEST
    // ========================================================

    useEffect(() => {

        if (!accessToken) {
            return;
        }

        testGitHubConnection();

    }, [accessToken]);


    // ========================================================
    // REFRESH EVERYTHING
    // ========================================================

    const handleRefresh = async () => {

        setAIReviewMessage("");

        await testGitHubConnection();

        await loadPullRequest(1);

    };


    // ========================================================
    // RUN AI REVIEW
    // ========================================================
    //
    // This is intentionally only a UI placeholder right now.
    //
    // We will connect this button to Gemini after the GitHub
    // PR/diff flow is confirmed working.
    // ========================================================

    const handleAIReview = () => {

        setAIReviewLoading(true);

        setAIReviewMessage("");

        setTimeout(() => {

            setAIReviewLoading(false);

            setAIReviewMessage(
                "AI review engine is not connected yet. GitHub PR data is ready for AI analysis."
            );

        }, 800);

    };


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="min-h-screen bg-[#0b0b0f] text-white">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <Sidebar />


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="ml-64 min-h-screen p-8">

                <div className="mx-auto max-w-7xl">


                    {/* =================================================
                        PAGE HEADER
                    ================================================= */}

                    <div className="mb-8 flex items-start justify-between">

                        <div>

                            <div className="flex items-center gap-3">

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">

                                    <GitBranch
                                        size={26}
                                        strokeWidth={1.8}
                                    />

                                </div>

                                <div>

                                    <h1 className="text-3xl font-bold">
                                        GitHub
                                    </h1>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Connect GitHub and inspect Pull Requests
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* Refresh button */}

                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={
                                connectionLoading ||
                                selectedPRLoading
                            }
                            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            <RefreshCw
                                size={17}
                                className={
                                    connectionLoading ||
                                    selectedPRLoading
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            Refresh

                        </button>

                    </div>


                    {/* =================================================
                        GITHUB CONNECTION CARD
                    ================================================= */}

                    <div className="mb-6 rounded-xl border border-white/10 bg-[#111116] p-6">

                        <div className="flex items-start justify-between">

                            <div>

                                <p className="text-sm font-medium text-gray-400">
                                    GitHub Connection
                                </p>

                                <h2 className="mt-1 text-xl font-semibold">
                                    Repository Status
                                </h2>

                            </div>


                            {/* Connection status */}

                            {connectionLoading ? (

                                <div className="flex items-center gap-2 rounded-full bg-yellow-500/10 px-3 py-1.5 text-xs font-medium text-yellow-400">

                                    <Loader2
                                        size={15}
                                        className="animate-spin"
                                    />

                                    Checking...

                                </div>

                            ) : connection?.connected ? (

                                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">

                                    <CheckCircle2 size={15} />

                                    Connected

                                </div>

                            ) : (

                                <div className="flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400">

                                    <XCircle size={15} />

                                    Not Connected

                                </div>

                            )}

                        </div>


                        {/* Connection error */}

                        {connectionError && (

                            <div className="mt-5 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4">

                                <AlertCircle
                                    size={18}
                                    className="mt-0.5 shrink-0 text-red-400"
                                />

                                <div>

                                    <p className="text-sm font-medium text-red-400">
                                        GitHub connection failed
                                    </p>

                                    <p className="mt-1 text-sm text-gray-400">
                                        {connectionError}
                                    </p>

                                </div>

                            </div>

                        )}


                        {/* Successful connection */}

                        {connection?.connected && (

                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

                                <div className="rounded-lg border border-white/10 bg-[#0b0b0f] p-4">

                                    <p className="text-xs text-gray-500">
                                        Repository
                                    </p>

                                    <p className="mt-2 font-medium text-white">
                                        {connection.repository}
                                    </p>

                                </div>


                                <div className="rounded-lg border border-white/10 bg-[#0b0b0f] p-4">

                                    <p className="text-xs text-gray-500">
                                        Name
                                    </p>

                                    <p className="mt-2 font-medium text-white">
                                        {connection.name}
                                    </p>

                                </div>


                                <div className="rounded-lg border border-white/10 bg-[#0b0b0f] p-4">

                                    <p className="text-xs text-gray-500">
                                        Visibility
                                    </p>

                                    <p className="mt-2 font-medium text-white">
                                        {connection.private
                                            ? "Private"
                                            : "Public"
                                        }
                                    </p>

                                </div>

                            </div>

                        )}


                        {/* Manual connection test */}

                        {!connection?.connected && !connectionLoading && (

                            <button
                                type="button"
                                onClick={testGitHubConnection}
                                className="mt-5 flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-purple-500"
                            >

                                <GitBranch size={17} />

                                Test GitHub Connection

                            </button>

                        )}

                    </div>


                    {/* =================================================
                        PULL REQUEST SECTION
                    ================================================= */}

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">


                        {/* =================================================
                            PR LIST
                        ================================================= */}

                        <div className="rounded-xl border border-white/10 bg-[#111116] lg:col-span-1">

                            <div className="border-b border-white/10 px-5 py-5">

                                <p className="text-sm text-gray-400">
                                    Pull Requests
                                </p>

                                <h2 className="mt-1 text-lg font-semibold">
                                    Available PR
                                </h2>

                            </div>


                            <div className="p-4">

                                {/* Temporary test PR */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        loadPullRequest(1)
                                    }
                                    className={`w-full rounded-lg border p-4 text-left transition ${
                                        selectedPR?.number === 1
                                            ? "border-purple-500/40 bg-purple-500/10"
                                            : "border-white/10 bg-[#0b0b0f] hover:border-white/20 hover:bg-white/[0.03]"
                                    }`}
                                >

                                    <div className="flex items-start gap-3">

                                        <GitPullRequest
                                            size={19}
                                            className="mt-0.5 shrink-0 text-purple-400"
                                        />

                                        <div className="min-w-0">

                                            <p className="text-sm font-semibold text-white">
                                                PR #1
                                            </p>

                                            <p className="mt-1 truncate text-sm text-gray-400">
                                                Add AI review test code
                                            </p>

                                            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">

                                                <GitBranch size={13} />

                                                ai-review-test

                                            </div>

                                        </div>

                                    </div>

                                </button>


                                {/* PR loading */}

                                {selectedPRLoading && (

                                    <div className="mt-4 flex items-center justify-center gap-2 py-5 text-sm text-gray-500">

                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />

                                        Loading Pull Request...

                                    </div>

                                )}

                            </div>

                        </div>


                        {/* =================================================
                            PR DETAILS
                        ================================================= */}

                        <div className="rounded-xl border border-white/10 bg-[#111116] lg:col-span-2">

                            <div className="border-b border-white/10 px-6 py-5">

                                <p className="text-sm text-gray-400">
                                    Pull Request Details
                                </p>

                            </div>


                            {/* Error */}

                            {selectedPRError && (

                                <div className="m-6 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4">

                                    <AlertCircle
                                        size={18}
                                        className="mt-0.5 shrink-0 text-red-400"
                                    />

                                    <div>

                                        <p className="text-sm font-medium text-red-400">
                                            Unable to load Pull Request
                                        </p>

                                        <p className="mt-1 break-words text-sm text-gray-400">
                                            {selectedPRError}
                                        </p>

                                    </div>

                                </div>

                            )}


                            {/* Empty state */}

                            {!selectedPR &&
                                !selectedPRLoading &&
                                !selectedPRError && (

                                    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">

                                            <GitPullRequest size={22} />

                                        </div>

                                        <h3 className="mt-4 font-semibold">
                                            Select a Pull Request
                                        </h3>

                                        <p className="mt-2 max-w-md text-sm text-gray-500">
                                            Select PR #1 to load its details and changed files.
                                        </p>

                                    </div>

                                )}


                            {/* PR information */}

                            {selectedPR && (

                                <div className="p-6">

                                    <div className="flex items-start justify-between gap-5">

                                        <div>

                                            <div className="flex flex-wrap items-center gap-3">

                                                <h2 className="text-xl font-semibold">
                                                    #{selectedPR.number}{" "}
                                                    {selectedPR.title}
                                                </h2>

                                                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                                                    {selectedPR.state}
                                                </span>

                                            </div>

                                            <p className="mt-2 text-sm text-gray-500">
                                                Opened by{" "}
                                                <span className="text-gray-300">
                                                    {selectedPR.author}
                                                </span>
                                            </p>

                                        </div>


                                        {selectedPR.html_url && (

                                            <a
                                                href={selectedPR.html_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 transition hover:bg-white/5 hover:text-white"
                                            >

                                                <ExternalLink size={14} />

                                                GitHub

                                            </a>

                                        )}

                                    </div>


                                    {/* Branch information */}

                                    <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">

                                        <div className="rounded-lg border border-white/10 bg-[#0b0b0f] p-4">

                                            <div className="flex items-center gap-2 text-xs text-gray-500">

                                                <GitBranch size={14} />

                                                Source Branch

                                            </div>

                                            <p className="mt-2 text-sm font-medium text-white">
                                                {selectedPR.source_branch}
                                            </p>

                                        </div>


                                        <div className="rounded-lg border border-white/10 bg-[#0b0b0f] p-4">

                                            <div className="flex items-center gap-2 text-xs text-gray-500">

                                                <GitBranch size={14} />

                                                Target Branch

                                            </div>

                                            <p className="mt-2 text-sm font-medium text-white">
                                                {selectedPR.target_branch}
                                            </p>

                                        </div>

                                    </div>


                                    {/* PR description */}

                                    {selectedPR.body && (

                                        <div className="mt-6">

                                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Description
                                            </p>

                                            <div className="mt-2 rounded-lg border border-white/10 bg-[#0b0b0f] p-4">

                                                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-400">
                                                    {selectedPR.body}
                                                </p>

                                            </div>

                                        </div>

                                    )}


                                    {/* =================================================
                                        CHANGED FILES
                                    ================================================= */}

                                    <div className="mt-8">

                                        <div className="flex items-center justify-between">

                                            <div>

                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                    Changed Files
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    Files modified by this Pull Request
                                                </p>

                                            </div>


                                            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
                                                {prFiles.length} files
                                            </span>

                                        </div>


                                        {/* Files loading */}

                                        {filesLoading && (

                                            <div className="mt-4 flex items-center justify-center gap-2 py-8 text-sm text-gray-500">

                                                <Loader2
                                                    size={17}
                                                    className="animate-spin"
                                                />

                                                Loading changed files...

                                            </div>

                                        )}


                                        {/* Files error */}

                                        {filesError && (

                                            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                                                {filesError}
                                            </div>

                                        )}


                                        {/* Files */}

                                        {!filesLoading &&
                                            prFiles.length > 0 && (

                                                <div className="mt-4 space-y-3">

                                                    {prFiles.map(
                                                        (file) => {

                                                            const isExpanded =
                                                                expandedFile ===
                                                                file.filename;

                                                            return (

                                                                <div
                                                                    key={file.filename}
                                                                    className="overflow-hidden rounded-lg border border-white/10 bg-[#0b0b0f]"
                                                                >

                                                                    {/* File header */}

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setExpandedFile(
                                                                                isExpanded
                                                                                    ? null
                                                                                    : file.filename
                                                                            )
                                                                        }
                                                                        className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-white/[0.03]"
                                                                    >

                                                                        <div className="flex min-w-0 items-center gap-3">

                                                                            {isExpanded ? (

                                                                                <ChevronDown
                                                                                    size={17}
                                                                                    className="shrink-0 text-gray-500"
                                                                                />

                                                                            ) : (

                                                                                <ChevronRight
                                                                                    size={17}
                                                                                    className="shrink-0 text-gray-500"
                                                                                />

                                                                            )}


                                                                            <FileCode2
                                                                                size={17}
                                                                                className="shrink-0 text-purple-400"
                                                                            />

                                                                            <span className="truncate text-sm font-medium text-white">
                                                                                {file.filename}
                                                                            </span>

                                                                        </div>


                                                                        <div className="flex shrink-0 items-center gap-3 text-xs">

                                                                            <span className="text-emerald-400">
                                                                                +{file.additions}
                                                                            </span>

                                                                            <span className="text-red-400">
                                                                                -{file.deletions}
                                                                            </span>

                                                                            <span className="hidden rounded bg-white/5 px-2 py-1 text-gray-500 sm:inline">
                                                                                {file.status}
                                                                            </span>

                                                                        </div>

                                                                    </button>


                                                                    {/* Expanded patch */}

                                                                    {isExpanded && (

                                                                        <div className="border-t border-white/10">

                                                                            <div className="border-b border-white/10 px-4 py-3">

                                                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                                                    Code Diff
                                                                                </p>

                                                                            </div>


                                                                            {file.patch ? (

                                                                                <pre className="max-h-[500px] overflow-auto p-4 text-xs leading-6 text-gray-300">

                                                                                    <code>
                                                                                        {file.patch}
                                                                                    </code>

                                                                                </pre>

                                                                            ) : (

                                                                                <div className="p-5 text-sm text-gray-500">
                                                                                    No patch data is available for this file.
                                                                                </div>

                                                                            )}

                                                                        </div>

                                                                    )}

                                                                </div>

                                                            );

                                                        }
                                                    )}

                                                </div>

                                            )}


                                        {/* No files */}

                                        {!filesLoading &&
                                            prFiles.length === 0 &&
                                            !filesError && (

                                                <div className="mt-4 rounded-lg border border-white/10 bg-[#0b0b0f] p-6 text-center">

                                                    <FileCode2
                                                        size={24}
                                                        className="mx-auto text-gray-600"
                                                    />

                                                    <p className="mt-3 text-sm text-gray-500">
                                                        No changed files found.
                                                    </p>

                                                </div>

                                            )}

                                    </div>


                                    {/* =================================================
                                        AI REVIEW BUTTON
                                    ================================================= */}

                                    <div className="mt-8 border-t border-white/10 pt-6">

                                        <button
                                            type="button"
                                            onClick={handleAIReview}
                                            disabled={
                                                aiReviewLoading ||
                                                prFiles.length === 0
                                            }
                                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/20 transition hover:from-purple-500 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                                        >

                                            {aiReviewLoading ? (

                                                <Loader2
                                                    size={18}
                                                    className="animate-spin"
                                                />

                                            ) : (

                                                <Bot size={18} />

                                            )}

                                            {aiReviewLoading
                                                ? "Preparing Review..."
                                                : "Run AI Review"
                                            }

                                        </button>


                                        {aiReviewMessage && (

                                            <div className="mt-4 rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">

                                                <p className="text-sm text-purple-300">
                                                    {aiReviewMessage}
                                                </p>

                                            </div>

                                        )}

                                    </div>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </main>

        </div>

    );

}


// ============================================================
// EXPORT
// ============================================================

export default GitHub;