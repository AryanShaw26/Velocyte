import { Plus } from "lucide-react";
import { stats } from "./DashboardData";
import StatCard from "./StatCard";

export default function Dashboard() {
  return (
    <div
      className="
      w-[760px]
      rounded-[32px]
      border
      border-violet-500/20
      bg-[#101116]/90
      p-7
      backdrop-blur-2xl
      shadow-[0_0_70px_rgba(139,92,246,.18)]
      rotate-2
      transition-all
      duration-500
      hover:rotate-0
      "
    >

      {/* Header */}

      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-3xl font-bold">

            Good Morning, Aryan 👋

          </h2>

          <p className="mt-2 text-zinc-400">

            Here's what's happening with your projects today.

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
          px-5
          py-3
          font-medium
          transition
          hover:scale-105
          "
        >

          <Plus size={18}/>

          New Project

        </button>

      </div>

      {/* Stats */}

      <div className="mt-8 grid grid-cols-4 gap-4">

        {stats.map((item)=>

        <StatCard
        key={item.title}
        {...item}
        />

        )}

      </div>

    </div>
  );
}