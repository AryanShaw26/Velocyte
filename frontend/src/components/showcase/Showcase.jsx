import ShowcaseHeader from "./ShowcaseHeader";
import ShowcaseTabs from "./ShowcaseTabs";
import ShowcaseDashboard from "./ShowcaseDashboard";

export default function Showcase() {
  return (
    <section className="relative overflow-hidden py-32">

      {/* Background Glow */}

      <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/5 blur-[200px]" />

      <div className="relative mx-auto max-w-7xl px-8">

        <ShowcaseHeader />

        <ShowcaseTabs />

        <ShowcaseDashboard />

      </div>

    </section>
  );
}