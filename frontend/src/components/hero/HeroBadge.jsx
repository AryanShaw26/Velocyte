import { Sparkles } from "lucide-react";

export default function HeroBadge() {
  return (
    <div
      className="
      inline-flex
      items-center
      gap-2
      rounded-full
      border
      border-violet-500/30
      bg-violet-500/10
      px-5
      py-2
      backdrop-blur-md
      transition-all
      duration-300
      hover:border-violet-400
      hover:bg-violet-500/15
      "
    >
      <Sparkles size={16} className="text-violet-400" />

      <span className="text-sm font-medium text-violet-200">
        AI-Powered Developer Productivity Platform
      </span>
    </div>
  );
}