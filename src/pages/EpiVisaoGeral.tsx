import { useMemo } from "react";
import { useEpiTypes, useEpiStock, useEpiDeliveries } from "@/hooks/useEpi";
import { computeCaStatus, getCaStatusBadge, computeStockStatus, formatDateBR } from "@/lib/epi";
import { EpiKpiCards } from "@/components/epi/EpiKpiCards";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Package, HardHat, Plus, PackagePlus, Truck, PenLine, FileSignature } from "lucide-react";
import { ModuleOnboarding, OnboardingStep } from "@/components/ModuleOnboarding";
import { useNavigate } from "react-router-dom";

export default function EpiVisaoGeral() {
  const navigate = useNavigate();
  const { data: epiTypes = [] } = useEpiTypes();
  const { data: stock = {} } = useEpiStock();
  const { data: deliveries = [] } = useEpiDeliveries();

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const kpis = useMemo(() => {
    let lowStock = 0;
    let caExpiring = 0;
    epiTypes.forEach((e: any) => {
      const currentStock = stock[e.id] ?? 0;
      const ss = computeStockStatus(currentStock, e.minimum_stock);
      if (ss === "low" || ss === "out") lowStock++;
      const cs = computeCaStatus(e.ca_expires_at, e.ca_alert_days_before);
      if (cs === "warning" || cs === "expired") caExpiring++;
    });
    const deliveriesThisMonth = deliveries.filter((d: any) => d.delivered_at >= monthStart).length;
    return { total: epiTypes.length, lowStock, caExpiring, deliveriesThisMonth };
  }, [epiTypes, stock, deliveries, monthStart]);

  const alerts = useMemo(() => {
    const items: { type: "ca" | "stock"; label: string; detail: string; severity: "warning" | "error" }[] = [];
    epiTypes.forEach((e: any) => {
      const cs = computeCaStatus(e.ca_expires_at, e.ca_alert_days_before);
      if (cs === "expired") items.push({ type: "ca", label: e.name, detail: `CA vencido em ${formatDateBR(e.ca_expires_at)}`, severity: "error" });
      else if (cs === "warning") items.push({ type: "ca", label: e.name, detail: `CA vence em ${formatDateBR(e.ca_expires_at)}`, severity: "warning" });

      const currentStock = stock[e.id] ?? 0;
      const ss = computeStockStatus(currentStock, e.minimum_stock);
      if (ss === "out") items.push({ type: "stock", label: e.name, detail: "Estoque zerado", severity: "error" });
      else if (ss === "low") items.push({ type: "stock", label: e.name, detail: `Estoque: ${currentStock} (mín: ${e.minimum_stock})`, severity: "warning" });
    });
    return items;
  }, [epiTypes, stock]);

  if (epiTypes.length === 0) {
    return (
      <ModuleOnboarding
        title="Equipamentos de Proteção Individual"
        description="Controle EPIs, CAs, estoque e entregas para seus colaboradores."
        icon={HardHat}
        steps={[
          { title: "Cadastrar primeiro EPI no catálogo", description: "Registre nome, CA e estoque mínimo", icon: Plus, actionLabel: "Ir para catálogo", action: () => navigate("/epi/catalogo"), completed: false },
          { title: "Registrar estoque inicial", description: "Adicione entradas de estoque para os EPIs cadastrados", icon: PackagePlus, actionLabel: "Ir para estoque", action: () => navigate("/epi/estoque"), completed: false },
          { title: "Registrar primeira entrega", description: "Documente a entrega de EPIs aos colaboradores", icon: Truck, actionLabel: "Ir para entregas", action: () => navigate("/epi/entregas"), completed: false },
        ] as OnboardingStep[]}
      />
    );
  }

  return (
    <div className="space-y-6">
      <EpiKpiCards totalEpis={kpis.total} lowStock={kpis.lowStock} caExpiring={kpis.caExpiring} deliveriesThisMonth={kpis.deliveriesThisMonth} />

      {alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Alertas ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                {a.type === "ca" ? <AlertTriangle className={`h-4 w-4 ${a.severity === "error" ? "text-destructive" : "text-yellow-600"}`} /> : <Package className={`h-4 w-4 ${a.severity === "error" ? "text-destructive" : "text-yellow-600"}`} />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.detail}</p>
                </div>
                <Badge variant="outline" className={a.severity === "error" ? "bg-red-100 text-red-700 border-red-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"}>
                  {a.severity === "error" ? "Crítico" : "Atenção"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {alerts.length === 0 && epiTypes.length > 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Nenhum alerta no momento. Todos os CAs estão vigentes e os estoques estão adequados.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
