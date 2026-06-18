import { Link } from "react-router-dom";

export function EvitaLogo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="evita-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--lp-emerald-glow))" />
          <stop offset="55%" stopColor="hsl(var(--lp-emerald))" />
          <stop offset="100%" stopColor="hsl(var(--lp-emerald-deep))" />
        </linearGradient>
        <linearGradient id="evita-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--lp-gold))" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(var(--lp-gold))" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <path
        d="M20 2.5c5 0 9.5 1.4 13 3.4 1 .6 1.6 1.7 1.5 2.9-.6 8.3-2.6 18.8-13.6 27.7a1.5 1.5 0 0 1-1.8 0C8.1 27.6 6.1 17.1 5.5 8.8c-.1-1.2.5-2.3 1.5-2.9C10.5 3.9 15 2.5 20 2.5z"
        fill="url(#evita-grad)"
      />
      <path
        d="M20 5c4.2 0 7.9 1.1 10.8 2.7.6.3.9.9.9 1.5-.5 6.9-2 15.6-11.2 23.2a1 1 0 0 1-1.2 0C10.2 24.8 8.7 16.1 8.2 9.2c0-.6.3-1.2.9-1.5C12.1 6.1 15.8 5 20 5z"
        fill="none"
        stroke="hsl(var(--lp-emerald-glow))"
        strokeOpacity="0.35"
        strokeWidth="0.5"
      />
      <path
        d="M13.5 20.2c2.4 1.2 4 2.6 5.4 4.7 2.1-5.6 5-9 9.1-12-.6 1.3-1 2.5-1.2 3.7-3.1 2.5-5.5 5.8-7.4 10.4-.4 1-1.8 1-2.3 0-1-2-2.3-3.7-4.3-5.1-.3-.2-.4-.6-.2-1 .2-.4.6-.5 1-.7z"
        fill="hsl(var(--lp-bg))"
      />
      <circle cx="30" cy="9" r="1.6" fill="url(#evita-gold)" />
    </svg>
  );
}

export function EvitaWordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const wordSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-xl";
  const tagSize = size === "lg" ? "text-[10px]" : "text-[9px]";
  return (
    <span className="inline-flex items-baseline gap-1.5 leading-none">
      <span className={`font-lp-display ${wordSize} font-semibold tracking-[-0.02em] text-lp-ink`}>
        Evita
      </span>
      <span
        className={`font-lp-mono ${tagSize} uppercase tracking-[0.22em] text-lp-emerald translate-y-[-2px] inline-flex items-center gap-1`}
      >
        <span className="h-[3px] w-[3px] rounded-full bg-lp-emerald" />
        HSE
      </span>
    </span>
  );
}

export function EvitaBrandLink({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const logoSize = size === "lg" ? "h-9 w-9" : size === "sm" ? "h-7 w-7" : "h-8 w-8";
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="Evita HSE — Início">
      <EvitaLogo className={`${logoSize} transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-4deg]`} />
      <EvitaWordmark size={size} />
    </Link>
  );
}