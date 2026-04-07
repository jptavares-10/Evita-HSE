import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <section className="relative py-20 px-[5%] overflow-hidden" style={{ background: "linear-gradient(135deg, #070D1A 0%, #0A1628 40%, #0F1F3D 70%, #0D2451 100%)" }}>
      <div className="absolute -top-24 -right-24 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative z-10 max-w-[800px] mx-auto text-center">
        {/* Breadcrumb */}
        <nav className="flex items-center justify-center gap-1.5 text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-blue-400 transition-colors">Início</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/funcionalidades" className="hover:text-blue-400 transition-colors">Funcionalidades</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-400">{breadcrumb}</span>
        </nav>

        <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/35 rounded-full px-4 py-1.5 text-[0.8rem] font-semibold text-blue-300 mb-6">
          <Icon className="h-4 w-4" />
          {badge}
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-5">
          {title}
          {highlight && <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent"> {highlight}</span>}
        </h1>

        <p className="text-lg text-slate-400 leading-relaxed mb-9 max-w-[600px] mx-auto">{description}</p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/cadastro">
            <Button size="lg" className="text-base px-7 shadow-[0_4px_24px_rgba(37,99,235,0.4)]">
              Começar grátis — 14 dias <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/funcionalidades">
            <Button size="lg" variant="outline" className="text-base px-7 border-white/20 text-white/80 bg-transparent hover:bg-white/[0.08]">
              Ver todos os módulos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
