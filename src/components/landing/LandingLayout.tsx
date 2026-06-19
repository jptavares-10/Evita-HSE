import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { EvitaBrandLink, EvitaLogo, EvitaWordmark } from "@/components/landing/EvitaBrand";

export function LandingLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <div className="min-h-screen bg-lp-bg text-lp-ink font-lp-sans antialiased selection:bg-lp-emerald/30 selection:text-lp-ink">
      <a href="#conteudo-principal" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-lp-emerald focus:text-lp-bg focus:px-4 focus:py-2 rounded">Pular para o conteúdo</a>

      {/* NAVBAR */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-lp-bg/80 backdrop-blur-lg border-b border-lp-border" : "bg-lp-bg/60 backdrop-blur border-b border-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <EvitaBrandLink />

          <div className="hidden md:flex items-center gap-7 text-sm text-lp-muted">
            <Link to="/funcionalidades" className="hover:text-lp-ink transition-colors">Funcionalidades</Link>
            <Link to="/#precos" className="hover:text-lp-ink transition-colors">Preços</Link>
            <Link to="/faq" className="hover:text-lp-ink transition-colors">FAQ</Link>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link to="/login" className="px-3 py-1.5 text-sm text-lp-muted hover:text-lp-ink transition-colors">Entrar</Link>
            <Link to="/cadastro" className="group px-4 py-1.5 text-sm font-medium bg-lp-ink text-lp-bg rounded-lg hover:bg-lp-emerald transition-colors inline-flex items-center gap-1.5">
              Começar grátis
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <button className="md:hidden p-2 text-lp-ink" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-lp-border bg-lp-bg px-6 py-5 space-y-3">
            <Link to="/funcionalidades" className="block text-sm text-lp-muted" onClick={() => setMenuOpen(false)}>Funcionalidades</Link>
            <Link to="/#precos" className="block text-sm text-lp-muted" onClick={() => setMenuOpen(false)}>Preços</Link>
            <Link to="/faq" className="block text-sm text-lp-muted" onClick={() => setMenuOpen(false)}>FAQ</Link>
            <div className="flex gap-2 pt-3">
              <Link to="/login" className="flex-1 text-center py-2.5 border border-lp-border rounded-lg text-sm">Entrar</Link>
              <Link to="/cadastro" className="flex-1 text-center py-2.5 bg-lp-emerald text-lp-bg rounded-lg text-sm font-medium">Começar grátis</Link>
            </div>
          </div>
        )}
      </nav>

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
