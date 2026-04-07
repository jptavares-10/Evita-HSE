import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/Reveal";

export function LandingCTA() {
  return (
    <section className="relative py-24 px-[5%] text-center overflow-hidden" style={{ background: "linear-gradient(135deg, #070D1A 0%, #0A1628 40%, #0F1F3D 70%)" }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)" }} />
      <Reveal className="relative z-10 max-w-[640px] mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">Comece a controlar sua operação HSE hoje.</h2>
        <p className="text-lg text-slate-400 mb-9">14 dias grátis. Sem cartão de crédito. Sem configuração complexa.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/cadastro">
            <Button size="lg" className="text-base px-8 shadow-[0_4px_24px_rgba(37,99,235,0.4)]">
              Criar conta grátis <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="text-base px-7 border-white/20 text-white/75 bg-transparent hover:bg-white/[0.08]">
              Já tenho conta — Entrar
            </Button>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
