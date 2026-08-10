import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { EvitaBrandLink } from "@/components/landing/EvitaBrand";
import { useScrollProgress } from "@/hooks/useMotion";

/**
 * Topbar única e padronizada para Landing, Funcionalidades, Blog e FAQ.
 * Mantém o mesmo conjunto de links em todas as páginas públicas.
 */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const progress = useScrollProgress();

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    handle();
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  const navLinks: Array<{ to: string; label: string; hash?: string }> = [
    { to: "/", label: "Início" },
    { to: "/funcionalidades", label: "Funcionalidades" },
    { to: "/", hash: "precos", label: "Preços" },
    { to: "/blog", label: "Blog" },
    { to: "/faq", label: "FAQ" },
  ];

  const scrollToHash = (hash: string) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleNav = (e: React.MouseEvent, link: { to: string; hash?: string }) => {
    if (!link.hash) return;
    e.preventDefault();
    setMenuOpen(false);
    if (location.pathname === link.to) {
      scrollToHash(link.hash);
    } else {
      navigate(link.to);
      setTimeout(() => scrollToHash(link.hash!), 80);
    }
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-lp-bg/85 backdrop-blur-xl border-b border-lp-border shadow-[0_20px_40px_-30px_hsl(0_0%_0%/0.8)]"
          : "bg-transparent backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div
        aria-hidden
        className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-lp-emerald via-lp-emerald-glow to-lp-gold transition-[width] duration-150"
        style={{ width: `${progress * 100}%` }}
      />
      <div className={`relative max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between transition-all duration-500 ${scrolled ? "h-14" : "h-16"}`}>
        <EvitaBrandLink />

        <div className="hidden md:flex items-center gap-7 text-sm text-lp-muted">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.hash ? `${l.to}#${l.hash}` : l.to}
              onClick={(e) => handleNav(e, l)}
              className="hover:text-lp-ink transition-colors inline-flex items-center gap-1.5"
            >
              {l.label === "Início" && <Home className="h-3.5 w-3.5" />}
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
            className="group px-4 py-1.5 text-sm font-medium bg-lp-emerald text-lp-bg rounded-lg hover:bg-lp-emerald-glow transition-all inline-flex items-center gap-1.5 lp-glow"
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
              key={l.label}
              to={l.hash ? `${l.to}#${l.hash}` : l.to}
              className="block text-sm text-lp-muted"
              onClick={(e) => { handleNav(e, l); setMenuOpen(false); }}
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