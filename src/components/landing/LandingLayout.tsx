import { Link } from "react-router-dom";
import { Shield, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function LandingLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <div className="min-h-screen bg-white text-foreground">
      <a href="#conteudo-principal" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded">Pular para o conteúdo</a>

      {/* NAVBAR */}
      <nav className={`fixed top-0 inset-x-0 z-50 h-16 flex items-center px-[5%] transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-xl border-b shadow-sm" : "bg-white/95 backdrop-blur-xl border-b shadow-sm"}`}>
        <div className="max-w-[1200px] w-full mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">Evita HSE</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Como funciona</Link>
            <Link to="/funcionalidades" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Funcionalidades</Link>
            <Link to="/#precos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Preços</Link>
            <Link to="/#faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            <Link to="/login"><Button variant="outline" size="sm">Entrar</Button></Link>
            <Link to="/cadastro"><Button size="sm">Começar grátis <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button></Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed top-16 inset-x-0 z-40 bg-white border-b shadow-lg px-6 py-5 space-y-3 md:hidden">
          <Link to="/#como-funciona" className="block text-sm font-medium" onClick={() => setMenuOpen(false)}>Como funciona</Link>
          <Link to="/funcionalidades" className="block text-sm font-medium" onClick={() => setMenuOpen(false)}>Funcionalidades</Link>
          <Link to="/#precos" className="block text-sm font-medium" onClick={() => setMenuOpen(false)}>Preços</Link>
          <Link to="/#faq" className="block text-sm font-medium" onClick={() => setMenuOpen(false)}>FAQ</Link>
          <div className="flex gap-2 pt-3">
            <Link to="/login" className="flex-1"><Button variant="outline" className="w-full" size="sm">Entrar</Button></Link>
            <Link to="/cadastro" className="flex-1"><Button className="w-full" size="sm">Criar conta</Button></Link>
          </div>
        </div>
      )}

      <main id="conteudo-principal" className="pt-16">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="py-14 px-[5%] border-t" style={{ background: "#070D1A", borderColor: "#1E293B" }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2.5 font-display font-bold text-white mb-3">
                <Shield className="h-5 w-5 text-primary" /> Evita HSE
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[240px]">Plataforma de gestão de HSE para empresas brasileiras. Simples, segura e feita para quem trabalha com Saúde, Segurança e Meio Ambiente.</p>
            </div>
            <div>
              <div className="text-xs font-bold tracking-[0.1em] uppercase text-slate-400 mb-4">Produto</div>
              <ul className="space-y-2.5">
                <li><Link to="/#como-funciona" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Como funciona</Link></li>
                <li><Link to="/funcionalidades" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Funcionalidades</Link></li>
                <li><Link to="/#precos" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Preços</Link></li>
                <li><Link to="/#faq" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold tracking-[0.1em] uppercase text-slate-400 mb-4">Funcionalidades</div>
              <ul className="space-y-2.5">
                <li><Link to="/funcionalidades/servicos-periodicos" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Serviços Periódicos</Link></li>
                <li><Link to="/funcionalidades/inspecoes" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Inspeções</Link></li>
                <li><Link to="/funcionalidades/epi" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">EPIs</Link></li>
                <li><Link to="/funcionalidades/treinamentos" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Treinamentos</Link></li>
                <li><Link to="/funcionalidades/mtr" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">MTR</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold tracking-[0.1em] uppercase text-slate-400 mb-4">&nbsp;</div>
              <ul className="space-y-2.5">
                <li><Link to="/funcionalidades/documentos" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Documentos</Link></li>
                <li><Link to="/funcionalidades/licencas" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Licenças</Link></li>
                <li><Link to="/funcionalidades/aso" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">ASO</Link></li>
                <li><Link to="/funcionalidades/incidentes" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">IC & NC</Link></li>
                <li><Link to="/funcionalidades/fornecedores" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Fornecedores</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold tracking-[0.1em] uppercase text-slate-400 mb-4">Acesso</div>
              <ul className="space-y-2.5">
                <li><Link to="/cadastro" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Criar conta</Link></li>
                <li><Link to="/login" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Entrar</Link></li>
                <li><a href="mailto:contato@evitahse.com.br" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">contato@evitahse.com.br</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-7 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-slate-500">© 2026 <span className="text-slate-400">Evita HSE</span>. Todos os direitos reservados.</p>
            <p className="text-xs text-slate-600">Feito no Brasil 🇧🇷 para profissionais de HSE</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
