import Navbar from "../components/layout/Navbar";
import Hero from "../components/hero/Hero";
import Trusted from "../components/trusted/Trusted";
import Features from "../components/features/Features";
import Showcase from "../components/showcase/Showcase";
import Pricing from "../components/pricing/Pricing";
import FAQ from "../components/faq/FAQ";
import WhyVelocyte from "../components/whyVelocyte/WhyVelocyte";
import Contact from "../components/contact/Contact";
import Footer from "../components/footer/Footer";

export default function Landing() {
  return (
    <div className="bg-[#09090B] min-h-screen text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Trusted></Trusted>
      <Features></Features>
      <Showcase></Showcase>
      <Pricing></Pricing>
      <FAQ></FAQ>
      <WhyVelocyte></WhyVelocyte>
      <Contact></Contact>
      <Footer></Footer>
    </div>
  );
}