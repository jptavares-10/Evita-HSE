import { Reveal } from "@/components/landing/Reveal";

interface Feature {
  icon: React.ElementType;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06} variant="blur">
              <div className="lp-card lp-spot rounded-2xl p-6 h-full transition-all">
                <div className="w-11 h-11 rounded-lg bg-lp-emerald/10 flex items-center justify-center mb-4 border border-lp-emerald/20">
                  <f.icon className="h-5 w-5 text-lp-emerald" />
                </div>
                <h3 className="font-lp-display text-lg font-semibold text-lp-ink mb-2">{f.title}</h3>
                <p className="text-sm text-lp-muted leading-relaxed">{f.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
