import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { EvitaLogo, EvitaWordmark } from "@/components/landing/EvitaBrand";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: "sm" | "md" | "lg";
}

export function AuthShell({ title, subtitle, children, footer, width = "md" }: AuthShellProps) {
  const maxW = width === "lg" ? "max-w-xl" : width === "sm" ? "max-w-sm" : "max-w-md";
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-lp-bg text-lp-ink font-lp-sans antialiased px-4 py-12 overflow-hidden">
      <div aria-hidden className="absolute inset-0 lp-mesh-bg pointer-events-none" />
      <div aria-hidden className="absolute inset-0 lp-grid-bg pointer-events-none opacity-30" />

      <Link to="/" className="relative z-10 inline-flex items-center gap-1.5 text-xs text-lp-muted hover:text-lp-emerald transition-colors mb-8">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao início
      </Link>

      <div className={`relative z-10 w-full ${maxW}`}>
        <div className="lp-card rounded-2xl p-8 backdrop-blur-md">
          <Link to="/" className="flex items-center justify-center gap-2.5 mb-6" aria-label="Evita HSE">
            <EvitaLogo className="h-9 w-9" />
            <EvitaWordmark size="lg" />
          </Link>

          <div className="text-center mb-6">
            <h1 className="font-lp-display text-2xl font-semibold tracking-tight text-lp-ink">{title}</h1>
            {subtitle && <p className="text-sm text-lp-muted mt-2">{subtitle}</p>}
          </div>

          {children}
        </div>

        {footer && <div className="mt-6 text-center text-sm text-lp-muted">{footer}</div>}
      </div>
    </div>
  );
}