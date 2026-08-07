import HeroLeft from "./HeroLeft";
import HeroRight from "./HeroRight";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#09090B]">

      {/* Background Glow - Left */}
      <div className="absolute -left-40 top-10 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[170px]" />

      {/* Background Glow - Right */}
      <div className="absolute right-0 top-0 h-[700px] w-[700px] rounded-full bg-blue-500/10 blur-[200px]" />

      {/* Hero Container */}
      <div className="relative z-10 mx-auto flex min-h-[92vh] items-center justify-between px-8 pt-24">

        {/* Left Side */}
        <div className="w-full lg:w-[44%]">
          <HeroLeft />
        </div>

        {/* Right Side */}
        <div className="hidden lg:flex w-[56%] justify-end">
          <HeroRight />
        </div>

      </div>

    </section>
  );
}