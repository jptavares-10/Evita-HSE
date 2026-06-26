import { Link } from "react-router-dom";
import { EvitaLogo, EvitaWordmark } from "@/components/landing/EvitaBrand";
import { SiteHeader } from "@/components/landing/SiteHeader";

export function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-lp-bg text-lp-ink font-lp-sans antialiased selection:bg-lp-emerald/30 selection:text-lp-ink">
      <a href="#conteudo-principal" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-lp-emerald focus:text-lp-bg focus:px-4 focus:py-2 rounded">Pular para o conteúdo</a>

      <SiteHeader />

      <main id="conteudo-principal" className="pt-16">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-lp-border bg-lp-bg py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-10 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4" aria-label="Evita HSE">
              <EvitaLogo className="h-9 w-9" />
              <EvitaWordmark size="lg" />
            </Link>
            <p className="text-sm text-lp-muted leading-relaxed max-w-sm mb-4">
              Software de gestão de Saúde, Segurança e Meio Ambiente para a indústria brasileira.
            </p>
            <a href="mailto:contato@evitahse.com.br" className="text-sm text-lp-muted hover:text-lp-ink transition-colors">contato@evitahse.com.br</a>
          </div>
          <div>
            <h5 className="text-xs uppercase tracking-wider text-lp-ink font-semibold mb-4">Produto</h5>
            <ul className="space-y-2 text-sm text-lp-muted">
              <li><Link to="/funcionalidades" className="hover:text-lp-ink transition-colors">Funcionalidades</Link></li>
              <li><Link to="/#precos" className="hover:text-lp-ink transition-colors">Preços</Link></li>
              <li><Link to="/blog" className="hover:text-lp-ink transition-colors">Blog</Link></li>
              <li><Link to="/faq" className="hover:text-lp-ink transition-colors">FAQ</Link></li>
              <li><Link to="/seguranca" className="hover:text-lp-ink transition-colors">Segurança</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs uppercase tracking-wider text-lp-ink font-semibold mb-4">Módulos</h5>
            <ul className="space-y-2 text-sm text-lp-muted">
              <li><Link to="/funcionalidades/servicos-periodicos" className="hover:text-lp-ink transition-colors">Serviços Periódicos</Link></li>
              <li><Link to="/funcionalidades/inspecoes" className="hover:text-lp-ink transition-colors">Inspeções</Link></li>
              <li><Link to="/funcionalidades/epi" className="hover:text-lp-ink transition-colors">EPIs</Link></li>
              <li><Link to="/funcionalidades/treinamentos" className="hover:text-lp-ink transition-colors">Treinamentos</Link></li>
              <li><Link to="/funcionalidades/mtr" className="hover:text-lp-ink transition-colors">MTR</Link></li>
              <li><Link to="/funcionalidades/licencas" className="hover:text-lp-ink transition-colors">Licenças</Link></li>
              <li><Link to="/funcionalidades/aso" className="hover:text-lp-ink transition-colors">ASO</Link></li>
              <li><Link to="/funcionalidades/incidentes" className="hover:text-lp-ink transition-colors">IC & NC</Link></li>
              <li><Link to="/funcionalidades/documentos" className="hover:text-lp-ink transition-colors">Documentos</Link></li>
              <li><Link to="/funcionalidades/fornecedores" className="hover:text-lp-ink transition-colors">Fornecedores</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs uppercase tracking-wider text-lp-ink font-semibold mb-4">Acesso</h5>
            <ul className="space-y-2 text-sm text-lp-muted">
              <li><Link to="/cadastro" className="hover:text-lp-ink transition-colors">Criar conta</Link></li>
              <li><Link to="/login" className="hover:text-lp-ink transition-colors">Entrar</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-6 border-t border-lp-border flex flex-col sm:flex-row justify-between gap-3 text-xs text-lp-muted">
          <span>© 2026 Evita HSE · Todos os direitos reservados</span>
          <span>Feito no Brasil para profissionais de HSE.</span>
        </div>
      </footer>
    </div>
  );
}
