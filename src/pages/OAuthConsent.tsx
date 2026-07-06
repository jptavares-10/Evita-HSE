import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/landing/AuthShell";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";

type AuthorizationDetails = {
  client?: { name?: string; logo_uri?: string | null };
  redirect_url?: string;
  redirect_to?: string;
};

// Local wrapper for the beta supabase.auth.oauth namespace.
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
};
function oauth(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

export default function OAuthConsent() {
  usePageTitle("Autorizar aplicativo — Evita HSE", { noindex: true });
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("authorization_id ausente");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/login?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) { window.location.href = immediate; return; }
      setDetails(data);
    })();
    return () => { active = false; };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorizationId)
      : await oauth().denyAuthorization(authorizationId);
    if (error) { setBusy(false); return setError(error.message); }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); return setError("O servidor de autorização não retornou uma URL de redirecionamento."); }
    window.location.href = target;
  }

  if (error) {
    return (
      <AuthShell title="Não foi possível autorizar">
        <p className="text-sm text-muted-foreground">{error}</p>
      </AuthShell>
    );
  }
  if (!details) {
    return (
      <AuthShell title="Carregando…">
        <p className="text-sm text-muted-foreground">Preparando a autorização.</p>
      </AuthShell>
    );
  }

  const appName = details.client?.name ?? "este aplicativo";
  return (
    <AuthShell title={`Conectar ${appName} à sua conta`}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Isso permite que <strong>{appName}</strong> acesse os dados de HSE da sua empresa no Evita, agindo em seu nome. Você pode revogar a qualquer momento.
        </p>
        <div className="flex gap-2">
          <Button disabled={busy} onClick={() => decide(true)} className="flex-1">Autorizar</Button>
          <Button disabled={busy} variant="outline" onClick={() => decide(false)} className="flex-1">Negar</Button>
        </div>
      </div>
    </AuthShell>
  );
}