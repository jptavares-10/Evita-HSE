import { useState, useEffect } from "react";
import { Reveal } from "@/components/landing/Reveal";

interface FAQ {
  q: string;
  a: string;
}

interface LandingFAQProps {
  faqs: FAQ[];
  jsonLdId?: string;
}

export function LandingFAQ({ faqs, jsonLdId = "module-faq-jsonld" }: LandingFAQProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = jsonLdId;
    script.textContent = JSON.stringify(faqJsonLd);
    document.head.appendChild(script);
    return () => { document.getElementById(jsonLdId)?.remove(); };
  }, [faqs, jsonLdId]);

  return (
    <section className="py-24 px-6 lg:px-8 border-t border-lp-border">
      <div className="max-w-3xl mx-auto">
        <Reveal className="text-center mb-12">
          <h2 className="font-lp-display text-4xl md:text-5xl font-semibold tracking-tight text-lp-ink">Perguntas frequentes.</h2>
        </Reveal>
        <div className="space-y-2">
          {faqs.map((faq, i) => {
            const open = openFaq === i;
            return (
              <div key={i} className={`rounded-xl border overflow-hidden transition-colors ${open ? "border-lp-emerald/40 bg-lp-surface/70" : "border-lp-border bg-lp-surface/40"}`}>
                <button
                  className="w-full flex items-center justify-between p-5 text-left gap-4"
                  onClick={() => setOpenFaq(open ? null : i)}
                  aria-expanded={open}
                >
                  <span className="text-lp-ink font-medium">{faq.q}</span>
                  <span aria-hidden className={`font-lp-display text-xl leading-none shrink-0 transition-transform duration-300 ${open ? "rotate-45 text-lp-emerald" : "text-lp-muted"}`}>+</span>
                </button>
                <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-lp-muted leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
