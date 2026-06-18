import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";

export function LandingCTA() {
  return (
    <section className="relative py-24 px-6 lg:px-8 border-t border-lp-border overflow-hidden">
      <div aria-hidden className="absolute inset-0 lp-mesh-bg opacity-70 pointer-events-none" />
      <Reveal className="relative max-w-3xl mx-auto text-center">
        <h2 className="font-lp-display text-4xl md:text-5xl font-semibold tracking-tight text-lp-ink mb-5">
          Comece sua operação HSE hoje.
        </h2>
        <p className="text-lg text-lp-muted mb-8">14 dias grátis. Sem cartão. Sem configuração complexa.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/cadastro" className="group px-6 py-3 bg-lp-emerald text-lp-bg font-medium rounded-lg hover:bg-lp-emerald-glow transition-all inline-flex items-center justify-center gap-2 lp-glow">
            Criar conta grátis
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link to="/login" className="px-6 py-3 border border-lp-border text-lp-ink font-medium rounded-lg hover:bg-lp-surface transition-colors">
            Já tenho conta
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
