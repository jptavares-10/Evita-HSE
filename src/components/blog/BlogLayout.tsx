import { Link } from "react-router-dom";
import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { EvitaWordmark } from "@/components/landing/EvitaBrand";

interface BlogLayoutProps {
  children: ReactNode;
}

export function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="min-h-screen bg-lp-bg text-lp-ink">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-lp-border bg-lp-bg/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <EvitaWordmark size="md" />
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-lp-muted">
            <Link to="/funcionalidades" className="hover:text-lp-ink transition-colors">Funcionalidades</Link>
            <Link to="/blog" className="text-lp-ink font-medium">Blog</Link>
            <Link to="/faq" className="hover:text-lp-ink transition-colors">FAQ</Link>
            <Link to="/cadastro" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-lp-emerald text-white font-medium hover:bg-lp-emerald-deep transition-colors">
              Testar grátis <ArrowRight className="w-4 h-4" />
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-lp-border bg-lp-bg py-12 px-6 lg:px-8 mt-24">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-lp-muted">
          <p>© {new Date().getFullYear()} Evita HSE — Gestão de SST e Meio Ambiente</p>
          <nav className="flex items-center gap-6">
            <Link to="/" className="hover:text-lp-ink transition-colors">Início</Link>
            <Link to="/blog" className="hover:text-lp-ink transition-colors">Blog</Link>
            <Link to="/funcionalidades" className="hover:text-lp-ink transition-colors">Funcionalidades</Link>
            <Link to="/faq" className="hover:text-lp-ink transition-colors">FAQ</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}