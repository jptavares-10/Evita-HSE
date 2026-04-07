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
    <section className="py-24 px-[5%] bg-white">
      <div className="max-w-[1200px] mx-auto">
        <Reveal className="text-center">
          <span className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-primary mb-4 block">Funcionalidades</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">O que você pode fazer</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <div className="bg-card border rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group h-full">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
