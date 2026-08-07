import { Check } from "lucide-react";

export default function PricingCard({
  name,
  price,
  duration,
  badge,
  description,
  features,
  button,
  highlighted,
}) {
  return (
    <div
      className={`relative rounded-3xl border transition-all duration-300 ${
        highlighted
          ? "border-violet-500 bg-gradient-to-b from-violet-500/10 to-[#15161d] shadow-[0_0_50px_rgba(139,92,246,.25)] scale-105"
          : "border-white/10 bg-[#14151b] hover:border-violet-400/40 hover:-translate-y-2"
      } p-8`}
    >
      {badge && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold">
          {badge}
        </span>
      )}

      <h3 className="text-3xl font-bold">{name}</h3>

      <p className="mt-3 text-zinc-400">{description}</p>

      <div className="mt-8 flex items-end gap-1">
        <span className="text-5xl font-bold">{price}</span>

        {duration && (
          <span className="pb-2 text-zinc-400">{duration}</span>
        )}
      </div>

      <div className="my-8 h-px bg-white/10" />

      <ul className="space-y-5">
        {features.map((item) => (
          <li key={item} className="flex items-center gap-3">
            <Check
              size={18}
              className="text-green-400 flex-shrink-0"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <button
        className={`mt-10 w-full rounded-xl py-4 font-semibold transition ${
          highlighted
            ? "bg-gradient-to-r from-violet-600 to-purple-500 hover:scale-105"
            : "border border-violet-500 text-violet-400 hover:bg-violet-600 hover:text-white"
        }`}
      >
        {button}
      </button>
    </div>
  );
}