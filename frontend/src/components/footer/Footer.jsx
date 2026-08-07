import {
  ArrowUpRight,
  Heart,
} from "lucide-react";

import {
  FaGithub,
  FaLinkedin,
  FaXTwitter,
} from "react-icons/fa6";

export default function Footer() {

  const product = [
    "Features",
    "Pricing",
    "FAQ",
  ];

  const resources = [
    "Documentation",
    "API",
    "GitHub",
  ];

  const company = [
    "Why Velocyte",
    "Contact",
    "Privacy Policy",
  ];

  return (

    <footer className="border-t border-white/10 bg-[#09090B]">

      <div className="mx-auto max-w-7xl px-8 py-20">

        {/* Top */}

        <div className="grid gap-14 lg:grid-cols-4">

          {/* Logo */}

          <div>

            <h2 className="text-3xl font-black">

              VELOCYTE

            </h2>

            <p className="mt-5 leading-8 text-zinc-400">

              AI-powered Developer Productivity Platform
              helping engineering teams collaborate,
              review code and ship software faster.

            </p>

          </div>

          {/* Product */}

          <div>

            <h3 className="font-semibold text-white">

              Product

            </h3>

            <ul className="mt-6 space-y-4">

              {product.map((item) => (

                <li
                  key={item}
                  className="cursor-pointer text-zinc-400 transition hover:text-violet-400"
                >

                  {item}

                </li>

              ))}

            </ul>

          </div>

          {/* Resources */}

          <div>

            <h3 className="font-semibold">

              Resources

            </h3>

            <ul className="mt-6 space-y-4">

              {resources.map((item) => (

                <li
                  key={item}
                  className="cursor-pointer text-zinc-400 transition hover:text-violet-400"
                >

                  {item}

                </li>

              ))}

            </ul>

          </div>

          {/* Company */}

          <div>

            <h3 className="font-semibold">

              Company

            </h3>

            <ul className="mt-6 space-y-4">

              {company.map((item) => (

                <li
                  key={item}
                  className="cursor-pointer text-zinc-400 transition hover:text-violet-400"
                >

                  {item}

                </li>

              ))}

            </ul>

          </div>

        </div>

        {/* Divider */}

        <div className="my-14 h-px bg-white/10" />

        {/* Bottom */}

        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <p className="text-zinc-500">

              © 2026 Velocyte. All rights reserved.

            </p>

            <p className="mt-2 flex items-center gap-2 text-zinc-500">

              Built with React, FastAPI & PostgreSQL

            </p>

          </div>

          {/* Socials */}

          <div className="flex items-center gap-5">

            <a
              href="#"
              className="rounded-xl border border-white/10 p-4 transition hover:border-violet-500 hover:bg-violet-500/10"
            >

              <FaGithub size={22} />

            </a>

            <a
              href="#"
              className="rounded-xl border border-white/10 p-4 transition hover:border-violet-500 hover:bg-violet-500/10"
            >

              <FaLinkedin size={22} />

            </a>

            <a
              href="#"
              className="rounded-xl border border-white/10 p-4 transition hover:border-violet-500 hover:bg-violet-500/10"
            >

              <FaXTwitter size={22} />

            </a>

          </div>

        </div>

        {/* Signature */}

        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-zinc-500">

          Made with

          <Heart
            size={16}
            className="fill-red-500 text-red-500"
          />

          for Developers

        </div>

      </div>

    </footer>

  );

}