import { usePageTitle } from "@/hooks/usePageTitle";
import { ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { EvitaLogo, EvitaWordmark } from "@/components/landing/EvitaBrand";

const NotFound = () => {
  usePageTitle("Página não encontrada — Evita HSE");

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-lp-bg text-lp-ink font-lp-sans antialiased px-4 overflow-hidden">
      <div aria-hidden className="absolute inset-0 lp-mesh-bg pointer-events-none" />
      <div aria-hidden className="absolute inset-0 lp-grid-bg pointer-events-none opacity-30" />

      <Link to="/" className="relative z-10 inline-flex items-center gap-2.5 mb-10" aria-label="Evita HSE">
        <EvitaLogo className="h-9 w-9" />
        <EvitaWordmark size="lg" />
      </Link>

      <div className="relative z-10 text-center space-y-5 max-w-md">
        <p className="font-lp-mono text-xs uppercase tracking-[0.3em] text-lp-emerald">Erro 404</p>
        <h1 className="font-lp-display text-6xl md:text-7xl font-semibold tracking-tight text-lp-ink leading-none">
          Página não encontrada.
        </h1>
        <p className="text-lp-muted">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-lp-emerald text-lp-bg font-medium hover:bg-lp-emerald-glow transition-all lp-glow"
          >
            <Home className="h-4 w-4" />
            Ir para o início
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-lp-border text-lp-ink font-medium hover:bg-lp-surface transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
