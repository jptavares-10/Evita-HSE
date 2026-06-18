import { Reveal } from "@/components/landing/Reveal";

interface Step {
  num: string;
  icon: React.ElementType;
  title: string;
  desc: string;
}

export function HowItWorks({ steps }: { steps: Step[] }) {
  return (
    <section className="py-24 px-6 lg:px-8 border-t border-lp-border bg-lp-cream/40">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-lp-emerald font-medium mb-3">Como funciona</p>
          <h2 className="font-lp-display text-4xl md:text-5xl font-semibold tracking-tight text-lp-ink">Simples de usar.</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((s, i) => {
            const StepIcon = s.icon;
            return (
              <Reveal key={s.num} delay={i * 0.08}>
                <div className="lp-card rounded-2xl p-8 h-full relative overflow-hidden">
                  <span className="absolute -top-2 right-4 font-lp-display text-7xl font-semibold text-lp-emerald/[0.08] select-none pointer-events-none leading-none">
                    {s.num}
                  </span>
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-lp-emerald to-lp-emerald-deep flex items-center justify-center mb-5 shadow-[0_10px_30px_-10px_hsl(var(--lp-emerald)/0.6)]">
                    <StepIcon className="h-5 w-5 text-lp-bg" />
                  </div>
                  <h3 className="font-lp-display text-lg font-semibold text-lp-ink mb-2">{s.title}</h3>
                  <p className="text-sm text-lp-muted leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
