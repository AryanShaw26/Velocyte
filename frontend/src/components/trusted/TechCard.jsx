export default function TechCard({
  icon: Icon,
  name,
}) {
  return (
    <div
      className="
      group
      flex
      items-center
      gap-4
      rounded-2xl
      border
      border-white/10
      bg-white/[0.03]
      px-6
      py-5
      backdrop-blur-xl
      transition-all
      duration-300
      hover:-translate-y-2
      hover:border-violet-500/40
      hover:bg-white/[0.05]
      hover:shadow-[0_0_25px_rgba(139,92,246,.15)]
      "
    >
      <div
        className="
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-xl
        bg-white/5
        transition-all
        duration-300
        group-hover:scale-110
        group-hover:rotate-6
        "
      >
        <Icon size={28} />
      </div>

      <span className="text-lg font-medium text-zinc-200">
        {name}
      </span>
    </div>
  );
}