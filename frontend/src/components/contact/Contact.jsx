import { Mail, FileText, ArrowRight } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import ContactCard from "./ContactCard";
import { Link } from "react-router-dom";

const contacts = [
  {
    icon: Mail,
    title: "Email",
    value: "contact@velocyte.dev",
    href: "mailto:contact@velocyte.dev",
  },
  {
    icon: FaGithub,
    title: "GitHub",
    value: "github.com/Velocyte",
    href: "https://github.com/",
  },
  {
    icon: FaLinkedin,
    title: "LinkedIn",
    value: "linkedin.com/company/velocyte",
    href: "https://linkedin.com/",
  },
  {
    icon: FileText,
    title: "Documentation",
    value: "Developer Docs",
    href: "#",
  },
];

export default function Contact() {
  return (
    <section className="relative overflow-hidden py-32">

      {/* Background Glow */}

      <div className="absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/5 blur-[200px]" />

      <div className="relative mx-auto max-w-7xl px-8">

        <p className="text-center text-sm uppercase tracking-[0.35em] text-violet-400">
          CONTACT
        </p>

        <h2 className="mt-6 text-center text-5xl font-bold">

          Let's Build Better
          <br />
          Software Together

        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-8 text-zinc-400">

          Whether you're an individual developer,
          startup,
          or engineering team,
          we'd love to hear from you.

        </p>

        {/* CTA */}

        <div className="mt-12 flex flex-wrap justify-center gap-5">

          <Link to ="/login"
            className="
            rounded-2xl
            bg-gradient-to-r
            from-violet-600
            to-purple-500
            px-8
            py-4
            font-semibold
            transition
            hover:scale-105
            "
          >

            Get Started Free

          </Link>

          <button
            className="
            flex
            items-center
            gap-2
            rounded-2xl
            border
            border-white/10
            bg-white/[0.03]
            px-8
            py-4
            transition
            hover:border-violet-500/40
            "
          >

            Schedule Demo

            <ArrowRight size={18} />

          </button>

        </div>

        {/* Contact Cards */}

        <div className="mt-20 grid gap-8 md:grid-cols-2">

          {contacts.map((item) => (
            <ContactCard
              key={item.title}
              {...item}
            />
          ))}

        </div>

      </div>

    </section>
  );
}