import HeroBadge from "./HeroBadge";
import CTAButtons from "./CTAButtons";

export default function HeroLeft() {
  return (
    <div className="flex flex-col">

      <HeroBadge />

      {/* Heading */}

      <h1
        className="
        mt-8
        text-6xl
        font-black
        leading-tight
        tracking-tight
        lg:text-7xl
        "
      >
        Build Better Software.

        <br />

        <span
          className="
          bg-gradient-to-r
          from-violet-400
          via-fuchsia-400
          to-blue-400
          bg-clip-text
          text-transparent
          "
        >
          Powered by AI.
        </span>
      </h1>

      {/* Description */}

      <p
        className="
        mt-8
        max-w-2xl
        text-lg
        leading-9
        text-zinc-400
        "
      >
        Velocyte helps engineering teams manage projects,
        review pull requests with AI,
        collaborate in real time,
        and ship software faster
        from one intelligent workspace.
      </p>

      <CTAButtons />

      {/* Trust */}

      <div className="mt-12 flex items-center gap-5">

        <div className="flex -space-x-3">

          {[1, 2, 3, 4].map((i) => (
            <img
              key={i}
              src={`https://i.pravatar.cc/100?img=${i}`}
              alt="Developer"
              className="h-11 w-11 rounded-full border-2 border-[#09090B]"
            />
          ))}

        </div>

        <div>

          <div className="text-yellow-400 text-lg">
            ⭐⭐⭐⭐⭐
          </div>

          <p className="text-sm text-zinc-400">
            Loved by modern engineering teams
          </p>

        </div>

      </div>

    </div>
  );
}