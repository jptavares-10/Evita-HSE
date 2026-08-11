import { LandingLayout } from "@/components/landing/LandingLayout";
import { LEGAL_UPDATED_AT, LEGAL_VERSION } from "@/content/legal";

export function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <LandingLayout>
      <section className="px-6 lg:px-8 pt-16 pb-10 border-b border-lp-border">
        <div className="max-w-3xl mx-auto">
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-lp-emerald">{eyebrow}</span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-lp-ink">{title}</h1>
          <p className="mt-4 text-lp-muted leading-relaxed">{intro}</p>
          <p className="mt-6 text-xs text-lp-muted">
            Versão {LEGAL_VERSION} · Última atualização em {LEGAL_UPDATED_AT}
          </p>
        </div>
      </section>
      <article className="px-6 lg:px-8 py-14">
        <div className="max-w-3xl mx-auto space-y-10 text-[15px] leading-relaxed text-lp-muted">{children}</div>
      </article>
    </LandingLayout>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-lp-ink tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2 pl-5 list-disc marker:text-lp-emerald">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function PendingBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-dashed border-lp-emerald/50 bg-lp-emerald/5 px-1.5 py-0.5 text-[13px] text-lp-ink">
      {label}
    </span>
  );
}