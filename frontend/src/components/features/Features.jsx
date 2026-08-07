import { features } from "./FeatureData";
import FeatureCard from "./FeatureCard";

export default function Features() {
  return (
    <section className="relative py-28">

      <div className="mx-auto max-w-7xl px-8">

        <p
          className="
          text-center
          text-sm
          uppercase
          tracking-[0.35em]
          text-violet-400
          "
        >
          Powerful Features
        </p>

        <h2
          className="
          mt-5
          text-center
          text-5xl
          font-bold
          "
        >
          Everything You Need
          <br />
          To Build Faster
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
          Velocyte combines AI-powered code review, real-time collaboration,
          GitHub integration, engineering analytics, and team management into
          one modern developer productivity platform.
        </p>

        <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              {...feature}
            />
          ))}

        </div>

      </div>

    </section>
  );
}