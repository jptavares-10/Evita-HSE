import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { EvitaBrandLink } from "@/components/landing/EvitaBrand";

/**
 * Topbar única e padronizada para Landing, Funcionalidades, Blog e FAQ.
 * Mantém o mesmo conjunto de links em todas as páginas públicas.
 */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    handle();
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  const navLinks = [
    { to: "/funcionalidades", label: "Funcionalidades" },
    { to: "/#precos", label: "Preços" },
    { to: "/blog", label: "Blog" },
    { to: "/faq", label: "FAQ" },
  ];

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-lp-bg/80 backdrop-blur-lg border-b border-lp-border"
          : "bg-lp-bg/60 backdrop-blur border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <EvitaBrandLink />

        <div className="hidden md:flex items-center gap-7 text-sm text-lp-muted">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-lp-ink transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/login" className="px-3 py-1.5 text-sm text-lp-muted hover:text-lp-ink transition-colors">
            Entrar
          </Link>
          <Link
            to="/cadastro"
            className="group px-4 py-1.5 text-sm font-medium bg-lp-ink text-lp-bg rounded-lg hover:bg-lp-emerald transition-colors inline-flex items-center gap-1.5"
          >
            Começar grátis
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-lp-ink"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-lp-border bg-lp-bg px-6 py-5 space-y-3">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="block text-sm text-lp-muted"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-3">
            <Link to="/login" className="flex-1 text-center py-2.5 border border-lp-border rounded-lg text-sm">
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className="flex-1 text-center py-2.5 bg-lp-emerald text-lp-bg rounded-lg text-sm font-medium"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}