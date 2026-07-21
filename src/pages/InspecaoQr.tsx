import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAssetByQrToken, useOpenExecutionForAsset } from "@/hooks/useInspectionsField";
import { useInspectionModels } from "@/hooks/useInspections";
import { Loader2, QrCode, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ASSET_TYPES } from "@/lib/inspection-qr";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function InspecaoQr() {
  const { token } = useParams<{ token: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: asset, isLoading: loadingAsset, error } = useAssetByQrToken(token || null);
  const { data: models = [] } = useInspectionModels();
  const openExec = useOpenExecutionForAsset();
  const [opening, setOpening] = useState<string | null>(null);

  usePageTitle(asset ? `Inspecionar ${asset.tag_code}` : "Inspecionar ativo", { noindex: true });

  useEffect(() => {
    if (!loading && !user) {
      navigate(`/login?next=${encodeURIComponent(`/i/${token}`)}`);
    }
  }, [loading, user, token, navigate]);

  if (loading || loadingAsset) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  if (error || !asset) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm text-center space-y-3">
          <QrCode className="h-14 w-14 mx-auto text-muted-foreground/40" />
          <h1 className="text-lg font-bold">QR Code inválido</h1>
          <p className="text-sm text-muted-foreground">
            Este QR não corresponde a nenhum ativo desta empresa. Verifique se você está logado com a conta correta.
          </p>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>Voltar ao dashboard</Button>
        </div>
      </div>
    );
  }

  const activeModels = (models as any[]).filter((m) => m.status === "active");
  // Prefer models that match the asset's sector
  const sameSector = asset.sector_id ? activeModels.filter((m) => m.sector_id === asset.sector_id) : [];
  const suggested = sameSector.length > 0 ? sameSector : activeModels;

  const handlePick = async (modelId: string) => {
    setOpening(modelId);
    try {
      const execId = await openExec.mutateAsync({ assetId: asset.id, modelId });
      navigate(`/inspecoes/${execId}/campo`);
    } finally {
      setOpening(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <div className="bg-card rounded-xl border p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <QrCode className="h-3.5 w-3.5" />
            Ativo identificado
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-mono text-lg font-bold">{asset.tag_code}</span>
            <Badge variant="outline">{ASSET_TYPES[asset.asset_type] || asset.asset_type}</Badge>
            {asset.status !== "active" && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Inativo</Badge>}
          </div>
          <h1 className="text-base font-semibold">{asset.name}</h1>
          {(asset.sectors?.name || asset.location_description) && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {[asset.sectors?.name, asset.location_description].filter(Boolean).join(" • ")}
            </p>
          )}
        </div>

        <div className="bg-card rounded-xl border p-5 space-y-3">
          <h2 className="text-sm font-semibold">Escolha o checklist para este ativo</h2>
          {suggested.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum modelo de inspeção ativo. Cadastre um modelo antes de continuar.</p>
          ) : (
            <div className="space-y-2">
              {suggested.map((m: any) => (
                <button
                  key={m.id}
                  onClick={() => handlePick(m.id)}
                  disabled={opening !== null}
                  className="w-full text-left border rounded-lg px-4 py-3 hover:bg-accent hover:border-primary/40 transition-colors flex items-center gap-3 disabled:opacity-60"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{m.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {m.related_nr && <span>{m.related_nr} • </span>}
                      {m.sectors?.name || "Sem setor"}
                    </div>
                  </div>
                  {opening === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {sameSector.length === 0 && activeModels.length > 0 && asset.sector_id && (
          <p className="text-xs text-muted-foreground text-center">
            Nenhum modelo específico para este setor. Mostrando todos os ativos.
          </p>
        )}
      </div>
    </div>
  );
}
