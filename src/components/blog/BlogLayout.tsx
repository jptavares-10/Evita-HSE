import { Link } from "react-router-dom";
import { ReactNode } from "react";
import { SiteHeader } from "@/components/landing/SiteHeader";

interface BlogLayoutProps {
  children: ReactNode;
}

export function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="min-h-screen bg-lp-bg text-lp-ink font-lp-sans antialiased">
      <SiteHeader />
      <main className="pt-16">{children}</main>

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