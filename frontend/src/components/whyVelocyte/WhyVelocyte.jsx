import BenefitCard from "./BenefitCard";
import { benefits } from "./WhyVelocyteData";

export default function WhyVelocyte() {
  return (
    <section className="relative overflow-hidden py-32">

      {/* Background Glow */}

      <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/5 blur-[220px]" />

      <div className="relative mx-auto max-w-7xl px-8">

        <p className="text-center text-sm uppercase tracking-[0.35em] text-violet-400">
          WHY VELOCYTE?
        </p>

        <h2 className="mt-6 text-center text-5xl font-bold">

          Built For Modern
          <br />
          Engineering Teams

        </h2>

        <p
          className="
          mx-auto
          mt-6
          max-w-3xl
          text-center
          text-lg
          leading-8
          text-zinc-400
          "
        >

          Velocyte combines project management,
          AI-powered code reviews,
          GitHub integration,
          engineering analytics,
          and real-time collaboration
          into one intelligent workspace
          so your team can build software faster.

        </p>

        {/* Benefits */}

        <div className="mt-20 grid gap-8 lg:grid-cols-2">

          {benefits.map((item) => (

            <BenefitCard
              key={item.title}
              {...item}
            />

          ))}

        </div>

        {/* Stats */}

        <div className="mt-24 grid grid-cols-2 gap-8 lg:grid-cols-4">

          <div className="text-center">

            <h2 className="text-5xl font-black text-violet-400">

              6+

            </h2>

            <p className="mt-3 text-zinc-400">

              Core Features

            </p>

          </div>

          <div className="text-center">

            <h2 className="text-5xl font-black text-violet-400">

              AI

            </h2>

            <p className="mt-3 text-zinc-400">

              Powered Reviews

            </p>

          </div>

          <div className="text-center">

            <h2 className="text-5xl font-black text-violet-400">

              Live

            </h2>

            <p className="mt-3 text-zinc-400">

              Collaboration

            </p>

          </div>

          <div className="text-center">

            <h2 className="text-5xl font-black text-violet-400">

              100%

            </h2>

            <p className="mt-3 text-zinc-400">

              Developer Focused

            </p>

          </div>

        </div>

      </div>

    </section>
  );
}