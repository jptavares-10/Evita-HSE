import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
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
    <section className="py-24 px-[5%] bg-muted/30">
      <div className="max-w-[1200px] mx-auto">
        <Reveal className="text-center">
          <span className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-primary mb-4 block">FAQ</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">Perguntas frequentes</h2>
        </Reveal>
        <div className="max-w-[740px] mx-auto mt-12 space-y-2.5">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={0}>
              <div className={`bg-card border rounded-xl overflow-hidden transition-shadow hover:shadow-md ${openFaq === i ? "shadow-md" : ""}`}>
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-[0.95rem] gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <span className={`w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 transition-all duration-200 ${openFaq === i ? "rotate-180 bg-blue-100 text-primary" : "text-muted-foreground"}`}>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </span>
                </button>
                {openFaq === i && (
                  <>
                    <div className="h-px bg-border mx-6" />
                    <div className="px-6 pb-5 pt-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</div>
                  </>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
