import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="
      rounded-2xl
      border
      border-white/10
      bg-white/[0.03]
      transition-all
      duration-300
      hover:border-violet-500/30
      "
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-6 text-left"
      >
        <h3 className="text-lg font-semibold">
          {question}
        </h3>

        <ChevronDown
          size={22}
          className={`transition-transform duration-300 ${
            open ? "rotate-180 text-violet-400" : ""
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-60" : "max-h-0"
        }`}
      >
        <p className="px-6 pb-6 leading-8 text-zinc-400">
          {answer}
        </p>
      </div>
    </div>
  );
}