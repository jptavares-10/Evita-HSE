import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function BlogCTA() {
  return (
    <aside className="mt-16 rounded-2xl border border-lp-border bg-lp-surface/60 p-8 lg:p-10 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="hidden sm:flex w-12 h-12 rounded-xl bg-lp-emerald/10 items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6 text-lp-emerald-deep" />
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.2em] text-lp-emerald font-medium mb-2">Evita HSE</p>
          <h3 className="text-2xl font-semibold text-lp-ink mb-2">
            Pare de controlar SST por planilha
          </h3>
          <p className="text-lp-muted mb-6 leading-relaxed">
            Treinamentos, EPIs, inspeções, ASO, MTR e licenças em uma plataforma única, com alertas
            automáticos antes de qualquer vencimento. Teste 14 dias grátis, sem cartão.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/cadastro"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-lp-emerald text-white font-medium hover:bg-lp-emerald-deep transition-colors"
            >
              Começar agora <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/funcionalidades"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-lp-border text-lp-ink hover:bg-lp-surface transition-colors"
            >
              Ver todos os módulos
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}