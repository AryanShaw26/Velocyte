import PricingCard from "./PricingCard";
import { pricingPlans } from "./PricingData";

export default function Pricing() {
  return (
    <section className="relative py-32">

      <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/5 blur-[220px]" />

      <div className="relative mx-auto max-w-7xl px-8">

        <p className="text-center text-sm uppercase tracking-[0.35em] text-violet-400">
          Pricing
        </p>

        <h2 className="mt-5 text-center text-5xl font-bold">
          Simple Pricing
          <br />
          For Every Team
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-8 text-zinc-400">
          Start for free and upgrade as your engineering team grows.
          No hidden charges. Cancel anytime.
        </p>

        <div className="mt-20 grid gap-8 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.name}
              {...plan}
            />
          ))}
        </div>

      </div>

    </section>
  );
}