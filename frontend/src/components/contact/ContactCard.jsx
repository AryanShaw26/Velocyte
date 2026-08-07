export default function ContactCard({
  icon: Icon,
  title,
  value,
  href,
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="
      group
      flex
      items-center
      gap-5
      rounded-3xl
      border
      border-white/10
      bg-white/[0.03]
      p-6
      transition-all
      duration-300
      hover:-translate-y-2
      hover:border-violet-500/40
      hover:bg-white/[0.05]
      hover:shadow-[0_0_30px_rgba(139,92,246,.15)]
      "
    >
      <div
        className="
        flex
        h-14
        w-14
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
        <Icon size={28} />
      </div>

      <div>

        <h3 className="text-xl font-semibold">
          {title}
        </h3>

        <p className="mt-1 text-zinc-400">
          {value}
        </p>

      </div>

    </a>
  );
}