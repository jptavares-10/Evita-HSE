import { Reveal } from "@/components/landing/Reveal";

interface Feature {
  icon?: React.ElementType;
  title: string;
  description: string;
}

interface FeatureSectionProps {
  features: Feature[];
}

export function FeatureSection({ features }: FeatureSectionProps) {
  return (
    <section className="py-24 px-6 lg:px-8 border-t border-lp-border">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-14">
          <h2 className="font-lp-display text-4xl md:text-5xl font-semibold tracking-tight text-lp-ink">O que você pode fazer.</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07} variant="blur" className={i % 3 === 1 ? "lg:mt-8" : i % 3 === 2 ? "lg:mt-16" : ""}>
              <div className="group lp-card-bold lp-spot rounded-[1.4rem] p-7 h-full">
                <span aria-hidden className="lp-numeral font-lp-display text-6xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="lp-eyebrow relative mb-5">Recurso</span>
                <h3 className="relative font-lp-display text-xl font-semibold text-lp-ink mt-4 mb-2 leading-snug">{f.title}</h3>
                <p className="relative text-sm text-lp-muted leading-relaxed">{f.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
