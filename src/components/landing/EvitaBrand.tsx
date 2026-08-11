import { Link } from "react-router-dom";
import logoAsset from "@/assets/evita-logo.png.asset.json";

export function EvitaLogo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt=""
      className={className}
      aria-hidden="true"
      loading="eager"
      width={1024}
      height={1024}
    />
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