import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    "Home",
    "Features",
    "Integrations",
    "Pricing",
    "Docs",
    "About",
    "Contact",
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#09090B]/80 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto h-20 px-8 flex justify-between items-center">
        {/* Logo */}

        <div className="flex items-center gap-3 cursor-pointer">
          <img
            src="/logo.png"
            alt="Velocyte"
            className="h-12 w-auto object-contain"
          />
          {/* <h1 className="text-2xl font-bold">
Velocyte
</h1> */}
        </div>

        {/* Desktop Links */}

        <nav className="hidden lg:flex items-center gap-10">
          {links.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-zinc-400 hover:text-white duration-300 relative after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-0 hover:after:w-full after:bg-violet-500 after:duration-300"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Button */}

        <button className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-500 px-6 py-3 rounded-xl hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,.45)] duration-300">
          Get Started
          <ArrowRight size={18} />
        </button>

        {/* Mobile */}

        <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-[#09090B] border-t border-white/10">
          <div className="flex flex-col px-8 py-6 gap-6">
            {links.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-zinc-300 hover:text-white"
              >
                {item}
              </a>
            ))}

            <button className="mt-4 flex justify-center items-center gap-2 bg-violet-600 py-3 rounded-xl">
              Get Started
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
