import { Reveal } from "@/components/landing/Reveal";

interface Step {
  num: string;
  icon?: React.ElementType;
  title: string;
  desc: string;
}

export function HowItWorks({ steps }: { steps: Step[] }) {
  return (
    <section className="py-24 px-6 lg:px-8 border-t border-lp-border bg-lp-cream/40">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-14">
          <h2 className="font-lp-display text-4xl md:text-5xl font-semibold tracking-tight text-lp-ink">Simples de usar.</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={i * 0.1} variant="blur" className={i === 1 ? "md:mt-10" : i === 2 ? "md:mt-20" : ""}>
              <div className="group lp-card-bold rounded-[1.4rem] p-8 h-full">
                <span aria-hidden className="lp-numeral font-lp-display text-[5.5rem]">{s.num}</span>
                <span className="lp-eyebrow relative">Passo {s.num}</span>
                <h3 className="relative font-lp-display text-xl font-semibold text-lp-ink mt-5 mb-2 leading-snug">{s.title}</h3>
                <p className="relative text-sm text-lp-muted leading-relaxed">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
