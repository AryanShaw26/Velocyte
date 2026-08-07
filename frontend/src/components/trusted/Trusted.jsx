import TechCard from "./TechCard";

import { FaGithub, FaDocker, FaReact } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { TbBrandOpenai } from "react-icons/tb";
import { SiPostgresql, SiFastapi, SiRedis } from "react-icons/si";

const integrations = [
  { name: "GitHub", icon: FaGithub },
  { name: "Gemini", icon: FcGoogle },
  { name: "OpenAI", icon: TbBrandOpenai },
  { name: "Docker", icon: FaDocker },
];

const poweredBy = [
  { name: "React", icon: FaReact },
  { name: "FastAPI", icon: SiFastapi },
  { name: "PostgreSQL", icon: SiPostgresql },
  { name: "Redis", icon: SiRedis },
];

export default function Trusted() {
  return (
    <section className="relative overflow-hidden py-28">

      {/* Background Glow */}

      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/5 blur-[180px]" />

      <div className="relative mx-auto max-w-6xl px-8">

        {/* Divider */}

        <div className="mx-auto mb-20 h-px w-full bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

        <p className="text-center text-sm uppercase tracking-[0.35em] text-zinc-500">
          TRUSTED TECHNOLOGIES
        </p>

        <h2 className="mt-6 text-center text-5xl font-bold">
          Works Seamlessly With
          <br />
          Your Favorite Developer Tools
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-8 text-zinc-400">
          Velocyte integrates with modern development tools while being
          powered by an enterprise-grade technology stack.
        </p>

        {/* Integrations */}

        <div className="mt-20">

          <h3 className="mb-8 text-center text-2xl font-semibold">
            Integrations
          </h3>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {integrations.map((tech) => (
              <TechCard
                key={tech.name}
                {...tech}
              />
            ))}
          </div>

        </div>

        {/* Powered By */}

        <div className="mt-20">

          <h3 className="mb-8 text-center text-2xl font-semibold">
            Powered By
          </h3>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {poweredBy.map((tech) => (
              <TechCard
                key={tech.name}
                {...tech}
              />
            ))}
          </div>

        </div>

      </div>

    </section>
  );
}