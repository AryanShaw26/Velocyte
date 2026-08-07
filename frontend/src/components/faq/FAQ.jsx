import FAQItem from "./FAQItem";
import { faqs } from "./FAQData";

export default function FAQ() {
  return (
    <section className="relative py-32">

      {/* Background Glow */}

      <div className="absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/5 blur-[180px]" />

      <div className="relative mx-auto max-w-5xl px-8">

        <p className="text-center text-sm uppercase tracking-[0.35em] text-violet-400">
          Frequently Asked Questions
        </p>

        <h2 className="mt-5 text-center text-5xl font-bold">
          Everything You Need
          <br />
          To Know
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-8 text-zinc-400">
          Find answers to the most common questions about Velocyte,
          AI-powered code reviews, GitHub integration, pricing,
          security, and collaboration.
        </p>

        <div className="mt-16 space-y-5">
          {faqs.map((faq) => (
            <FAQItem
              key={faq.question}
              {...faq}
            />
          ))}
        </div>

      </div>

    </section>
  );
}