import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";

interface LandingHeroProps {
  icon: React.ElementType;
  badge: string;
  title: string;
  highlight?: string;
  description: string;
  breadcrumb: string;
}

export function LandingHero({ icon: Icon, badge, title, highlight, description, breadcrumb }: LandingHeroProps) {
  return (
    <section className="relative pt-20 pb-20 px-6 lg:px-8 overflow-hidden">
      <div aria-hidden className="absolute inset-0 lp-mesh-bg pointer-events-none" />
      <div aria-hidden className="absolute inset-0 lp-grid-bg pointer-events-none opacity-40" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Breadcrumb */}
        <Reveal>
          <nav className="flex items-center justify-center gap-1.5 text-xs text-lp-muted mb-7" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-lp-emerald transition-colors">Início</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/funcionalidades" className="hover:text-lp-emerald transition-colors">Funcionalidades</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-lp-ink">{breadcrumb}</span>
          </nav>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="inline-flex items-center gap-2 rounded-full border border-lp-emerald/30 bg-lp-emerald/10 px-3 py-1.5 text-xs font-medium text-lp-emerald mb-6">
            <Icon className="h-3.5 w-3.5" />
            {badge}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="font-lp-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] text-lp-ink mb-5">
            {title}
            {highlight && (
              <>
                {" "}
                <span className="bg-gradient-to-r from-lp-emerald via-lp-emerald-glow to-lp-emerald bg-clip-text text-transparent">
                  {highlight}
                </span>
              </>
            )}
          </h1>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="text-lg text-lp-muted leading-relaxed mb-8 max-w-2xl mx-auto">{description}</p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to="/cadastro" className="group px-6 py-3 bg-lp-emerald text-lp-bg font-medium rounded-lg hover:bg-lp-emerald-glow transition-all inline-flex items-center gap-2 lp-glow">
              Começar grátis — 14 dias
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/funcionalidades" className="px-6 py-3 border border-lp-border text-lp-ink font-medium rounded-lg hover:bg-lp-surface transition-colors">
              Ver todos os módulos
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
