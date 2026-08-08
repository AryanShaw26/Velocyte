import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
export default function CTAButtons() {
  return (
    <div className="mt-10 flex flex-wrap gap-5">

      {/* Primary Button */}

      <Link 
      to="/login"
        className="
        group
        flex
        items-center
        gap-2
        rounded-2xl
        bg-gradient-to-r
        from-violet-600
        to-purple-500
        px-7
        py-4
        text-lg
        font-semibold
        shadow-lg
        shadow-violet-500/20
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-violet-500/40
        "
      >
        Get Started Free

        <ArrowRight
          size={18}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </Link>

      {/* Secondary Button */}

      <button
        className="
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-white/10
        bg-white/5
        px-7
        py-4
        text-lg
        font-medium
        backdrop-blur-md
        transition-all
        duration-300
        hover:border-violet-500/40
        hover:bg-white/10
        "
      >
        <Play size={18} />

        Watch Demo
      </button>

    </div>
  );
}