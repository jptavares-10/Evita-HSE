import { Reveal } from "@/components/landing/Reveal";

interface Step {
  num: string;
  icon: React.ElementType;
  title: string;
  desc: string;
}

export function HowItWorks({ steps }: { steps: Step[] }) {
  return (
    <section className="py-24 px-[5%] bg-muted/30">
      <div className="max-w-[1200px] mx-auto">
        <Reveal className="text-center">
          <span className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-primary mb-4 block">Como funciona</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">Simples de usar</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-14 relative">
          <div className="hidden md:block absolute top-[52px] left-[calc(16.66%+32px)] right-[calc(16.66%+32px)] h-[2px] bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
          {steps.map((s, i) => {
            const StepIcon = s.icon;
            return (
              <Reveal key={s.num} delay={i * 0.12} className="text-center px-8 py-8 relative">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 font-display text-[5.5rem] font-extrabold text-primary/[0.04] select-none pointer-events-none leading-none">{s.num}</div>
                <div className="w-[72px] h-[72px] bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-7 relative z-10 shadow-[0_12px_32px_rgba(37,99,235,0.3)] ring-4 ring-primary/10">
                  <StepIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px] mx-auto">{s.desc}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
