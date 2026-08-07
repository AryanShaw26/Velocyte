import { useState } from "react";
import { Plus, LayoutDashboard, Brain, BarChart3 } from "lucide-react";

import KanbanPreview from "./KanbanPreview";
import AIReviewPreview from "./AIReviewPreview";
import AnalyticsPreview from "./AnalyticsPreview";

export default function ShowcaseDashboard() {
  const [activeTab, setActiveTab] = useState("kanban");

  return (
    <div
      className="
      mt-16
      rounded-[36px]
      border
      border-violet-500/20
      bg-[#101116]
      shadow-[0_0_80px_rgba(139,92,246,.15)]
      overflow-hidden
      "
    >
      {/* Header */}

      <div className="flex items-center justify-between border-b border-white/10 p-8">

        <div>

          <h3 className="text-3xl font-bold">

            Velocyte Workspace

          </h3>

          <p className="mt-2 text-zinc-400">

            Manage projects, review PRs and track engineering performance.

          </p>

        </div>

        <button
          className="
          flex
          items-center
          gap-2
          rounded-xl
          bg-gradient-to-r
          from-violet-600
          to-purple-500
          px-6
          py-3
          hover:scale-105
          transition
          "
        >
          <Plus size={18} />

          New Project

        </button>

      </div>

      {/* Tabs */}

      <div className="flex gap-3 border-b border-white/10 p-6">

        <button
          onClick={() => setActiveTab("kanban")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 transition ${
            activeTab === "kanban"
              ? "bg-violet-600"
              : "bg-white/5 hover:bg-white/10"
          }`}
        >
          <LayoutDashboard size={18} />

          Kanban
        </button>

        <button
          onClick={() => setActiveTab("review")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 transition ${
            activeTab === "review"
              ? "bg-violet-600"
              : "bg-white/5 hover:bg-white/10"
          }`}
        >
          <Brain size={18} />

          AI Review
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 transition ${
            activeTab === "analytics"
              ? "bg-violet-600"
              : "bg-white/5 hover:bg-white/10"
          }`}
        >
          <BarChart3 size={18} />

          Analytics
        </button>

      </div>

      {/* Dashboard */}

      <div className="p-8">

        {activeTab === "kanban" && <KanbanPreview />}

        {activeTab === "review" && <AIReviewPreview />}

        {activeTab === "analytics" && <AnalyticsPreview />}

      </div>

    </div>
  );
}