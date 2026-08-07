export default function BenefitCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div
      className="
      group
      rounded-3xl
      border
      border-white/10
      bg-white/[0.03]
      p-8
      transition-all
      duration-300
      hover:-translate-y-2
      hover:border-violet-500/40
      hover:shadow-[0_0_35px_rgba(139,92,246,.15)]
      "
    >
      <div
        className="
        flex
        h-16
        w-16
        items-center
        justify-center
        rounded-2xl
        bg-violet-500/10
        text-violet-400
        transition
        duration-300
        group-hover:scale-110
        "
      >
        <Icon size={30} />
      </div>

      <h3 className="mt-6 text-2xl font-bold">
        {title}
      </h3>

      <p className="mt-4 leading-8 text-zinc-400">
        {description}
      </p>
    </div>
  );
}