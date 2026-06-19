import { useAuth } from "@/contexts/AuthContext";
import { usePlan, clearPlanCache } from "@/hooks/usePlan";
import { Button } from "@/components/ui/button";
import { Check, CalendarClock, Loader2, ExternalLink, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const plans = [
  {
    key: "trial",
    label: "Trial",
    priceMonthly: "Grátis",
    priceAnnual: "Grátis",
    period: "14 dias",
    users: "Até 2 usuários",
    storage: "5GB storage",
    features: [
      "Acesso completo a todos os módulos",
      "Suporte por e-mail",
    ],
  },
  {
    key: "starter",
    label: "Starter",
    priceMonthly: 97,
    priceAnnual: 970,
    users: "Até 5 usuários",
    storage: "5GB storage",
    features: [
      "Serviços Periódicos",
      "Treinamentos (completo)",
      "IC & NC",
      "ASO / Exames",
      "Suporte por e-mail",
    ],
  },
  {
    key: "professional",
    label: "Professional",
    priceMonthly: 247,
    priceAnnual: 2470,
    users: "Até 10 usuários",
    storage: "20GB storage",
    features: [
      "Todos os módulos do Starter",
      "MTR + Licenças Ambientais",
      "Fornecedores + Portal externo",
      "Biblioteca de Documentos",
      "Inspeções de Segurança",
      "EPIs (Catálogo, Estoque, Entregas)",
      "Sistema de permissões por módulo",
      "Suporte com SLA 48h",
    ],
    highlight: true,
  },
  {
    key: "enterprise",
    label: "Enterprise",
    priceMonthly: 497,
    priceAnnual: 4970,
    users: "Usuários ilimitados",
    storage: "100GB storage",
    features: [
      "Tudo do Professional",
      "Múltiplas unidades (em breve)",
      "Usuários ilimitados",
      "Suporte SLA 24h",
      "Onboarding assistido",
    ],
  },
];

const planOrder = ["trial", "starter", "professional", "enterprise"];

export default function Planos() {
  usePageTitle("Planos — Evita HSE");
  const { company, profile, refreshCompany } = useAuth();
  const { plan: currentPlan, daysRemaining, status } = usePlan();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [loadingChangePlan, setLoadingChangePlan] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDowngradeDialog, setShowDowngradeDialog] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const isAnnual = billing === "annual";
  const isAdmin = profile?.role === "admin";
  const hasStripeSubscription = !!company?.stripe_subscription_id;
  const isCancelScheduled = !!company?.subscription_cancel_at;
  const isPaidPlan = !!currentPlan && currentPlan !== "trial" && currentPlan !== "expired";

  const currentPlanIndex = planOrder.indexOf(currentPlan || "trial");

  // Handle checkout success/cancel URL params
  useEffect(() => {
    const checkoutResult = searchParams.get("checkout");
    if (checkoutResult === "success") {
      clearPlanCache(profile?.id);
      toast.success("Pagamento realizado com sucesso! Seu plano será atualizado em instantes.");
      setSearchParams({}, { replace: true });
    } else if (checkoutResult === "canceled") {
      toast.info("Checkout cancelado.");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, profile?.id]);

  const handleCheckout = async (planKey: string) => {
    if (!isAdmin) {
      toast.error("Apenas administradores podem contratar planos.");
      return;
    }

    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan_key: planKey, billing },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("URL de checkout não retornada");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao iniciar checkout";
      toast.error(msg);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("URL do portal não retornada");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao abrir portal";
      toast.error(msg);
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoadingCancel(true);
    try {
      const { data, error } = await supabase.functions.invoke("cancel-subscription");
      if (error) throw error;
      if (data?.success) {
        clearPlanCache(profile?.id);
        await refreshCompany();
        if (hasStripeSubscription) {
          toast.success("Cancelamento agendado. Sua assinatura continuará ativa até o fim do ciclo atual.");
        } else {
          toast.success("Assinatura cancelada. Seu plano continuará ativo até a data de expiração.");
        }
      } else {
        throw new Error(data?.error || "Erro ao cancelar assinatura");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao cancelar assinatura";
      toast.error(msg);
    } finally {
      setLoadingCancel(false);
      setShowCancelDialog(false);
    }
  };

  const handleChangePlan = async (planKey: string) => {
    if (!hasStripeSubscription) {
      // No Stripe subscription — redirect to checkout for new plan
      handleCheckout(planKey);
      setShowDowngradeDialog(null);
      return;
    }

    setLoadingChangePlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("change-plan", {
        body: { plan_key: planKey, billing },
      });
      if (error) throw error;
      if (data?.success) {
        clearPlanCache(profile?.id);
        await refreshCompany();
        toast.success("Plano alterado com sucesso! As mudanças já estão ativas.");
      } else {
        throw new Error(data?.error || "Erro ao alterar plano");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar plano";
      toast.error(msg);
    } finally {
      setLoadingChangePlan(null);
      setShowDowngradeDialog(null);
    }
  };

  return (
    <div className="min-h-full" style={{ background: "#F8FAFC" }}>
      <div className="max-w-6xl mx-auto px-4 py-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-[28px] font-bold tracking-tight">Planos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Escolha o plano ideal para sua empresa.
            </p>
          </div>
          {hasStripeSubscription && isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageSubscription}
              disabled={loadingPortal}
              className="gap-2"
            >
              {loadingPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              Gerenciar assinatura
            </Button>
          )}
        </div>

        {/* Cancellation scheduled banner */}
        {isCancelScheduled && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-semibold text-amber-800">Cancelamento agendado.</span>{" "}
              <span className="text-amber-700">
                Sua assinatura será cancelada em{" "}
                {format(new Date(company!.subscription_cancel_at!), "dd/MM/yyyy", { locale: ptBR })}.
                O acesso continuará até essa data.
              </span>
            </div>
          </div>
        )}

        {/* Toggle Mensal / Anual */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm font-semibold transition-colors duration-200 ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Mensal
          </span>
          <button
            onClick={() => setBilling(isAnnual ? "monthly" : "annual")}
            className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${isAnnual ? "bg-primary" : "bg-muted-foreground/30"}`}
            aria-label="Alternar entre mensal e anual"
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${isAnnual ? "translate-x-7" : "translate-x-0"}`} />
          </button>
          <span className={`text-sm font-semibold transition-colors duration-200 flex items-center gap-2 ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Anual
            {isAnnual && (
              <span className="bg-emerald-100 text-emerald-700 text-[0.7rem] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                2 meses grátis
              </span>
            )}
          </span>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
          {plans.map((plan) => {
            const isCurrent = (currentPlan || company?.plan) === plan.key;
            const planIndex = planOrder.indexOf(plan.key);
            const isUpgrade = planIndex > currentPlanIndex;
            const isDowngrade = planIndex < currentPlanIndex;
            const isTrial = plan.key === "trial";
            const isHighlight = plan.highlight;
            const isLoading = loadingPlan === plan.key;
            const isChanging = loadingChangePlan === plan.key;

            const monthlyNum = typeof plan.priceMonthly === "number" ? plan.priceMonthly : 0;
            const annualNum = typeof plan.priceAnnual === "number" ? plan.priceAnnual : 0;
            const equivMonthly = annualNum > 0 ? Math.round(annualNum / 12) : 0;

            return (
              <div
                key={plan.key}
                className={`relative rounded-xl p-4 flex flex-col transition-all duration-200 ${
                  isHighlight
                    ? "bg-gradient-to-br from-[#1E40AF] to-[#2563EB] text-white border-2 border-white/30 shadow-[0_4px_24px_rgba(37,99,235,0.25)]"
                    : "bg-white border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                }`}
              >
                {isHighlight && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#F59E0B] text-amber-900 text-[0.65rem] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                    ⭐ Recomendado
                  </span>
                )}

                {/* Plan label */}
                <div className={`text-[11px] font-bold tracking-[0.1em] uppercase mb-3 ${
                  isHighlight ? "text-white/70" : isTrial ? "text-muted-foreground" : "text-primary"
                }`}>
                  {plan.label}
                </div>

                {/* Price */}
                <div className="mb-1">
                  {isTrial ? (
                    <div>
                      <span className="text-[32px] font-bold leading-none">Grátis</span>
                      <p className={`text-sm mt-1 ${isHighlight ? "text-white/60" : "text-muted-foreground"}`}>14 dias</p>
                    </div>
                  ) : isAnnual ? (
                    <div style={{ transition: "opacity 0.2s ease" }}>
                      <div className="flex items-baseline gap-1">
                        <span className={`font-display text-[32px] font-bold leading-none`}>
                          R$ {annualNum.toLocaleString("pt-BR")}
                        </span>
                        <span className={`text-sm ${isHighlight ? "text-white/70" : "text-muted-foreground"}`}>/ano</span>
                      </div>
                      <span className={`inline-block mt-1.5 text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${
                        isHighlight ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        2 meses grátis
                      </span>
                      <p className={`text-xs mt-1 ${isHighlight ? "text-white/50" : "text-muted-foreground"}`}>
                        equivale a R$ {equivMonthly}/mês
                      </p>
                    </div>
                  ) : (
                    <div style={{ transition: "opacity 0.2s ease" }}>
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-[32px] font-bold leading-none">
                          R$ {monthlyNum}
                        </span>
                        <span className={`text-sm ${isHighlight ? "text-white/70" : "text-muted-foreground"}`}>/mês</span>
                      </div>
                    </div>
                  )}
                </div>

                <p className={`text-sm mt-1 ${isHighlight ? "text-white/60" : "text-muted-foreground"}`}>{plan.users}</p>
                <p className={`text-xs ${isHighlight ? "text-white/50" : "text-muted-foreground"}`}>{plan.storage}</p>

                <div className={`h-px my-4 ${isHighlight ? "bg-white/20" : "bg-[#E2E8F0]"}`} />

                {/* Features */}
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${isHighlight ? "text-white/90" : "text-[#374151]"}`}>
                      <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isHighlight
                          ? "bg-white/20 text-white"
                          : isTrial
                            ? "bg-muted text-muted-foreground"
                            : "bg-emerald-500/15 text-emerald-500"
                      }`}>
                        <Check className="h-3 w-3" />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-5 space-y-2">
                  {isCurrent ? (
                    <>
                      <div className={`text-center text-sm font-semibold rounded-md py-2.5 ${
                        isHighlight
                          ? "bg-white/20 text-white"
                          : "bg-[#EFF6FF] text-primary border border-[#BFDBFE]"
                      }`}>
                        {isCancelScheduled ? "Cancelamento agendado" : "Seu plano atual"}
                      </div>
                      {(() => {
                        const expiresAt = currentPlan === "trial"
                          ? company?.trial_ends_at
                          : company?.plan_expires_at;
                        const isExpiring = daysRemaining <= 7 && daysRemaining > 0;
                        const isExpired = status === "expired";
                        const isGrace = status === "grace";

                        if (!expiresAt && !isExpired) return null;

                        return (
                          <div className={`flex items-center justify-center gap-1.5 text-xs rounded-md px-2 py-1.5 ${
                            isExpired
                              ? "bg-destructive/10 text-destructive"
                              : isGrace
                                ? "bg-amber-100 text-amber-700"
                                : isExpiring
                                  ? "bg-amber-50 text-amber-600"
                                  : isHighlight
                                    ? "bg-white/10 text-white/70"
                                    : "bg-muted text-muted-foreground"
                          }`}>
                            <CalendarClock className="h-3.5 w-3.5 flex-shrink-0" />
                            {isExpired ? (
                              <span className="font-medium">Plano expirado</span>
                            ) : isGrace ? (
                              <span className="font-medium">Carência — {daysRemaining}d restantes</span>
                            ) : (
                              <span>
                                {expiresAt
                                  ? `Expira em ${format(new Date(expiresAt), "dd/MM/yyyy", { locale: ptBR })}`
                                  : ""}
                                {daysRemaining > 0 && ` (${daysRemaining}d)`}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                      {/* Cancel button for current paid plan — show for any paid plan, not just Stripe-linked */}
                      {isPaidPlan && isAdmin && !isCancelScheduled && (
                        <div className={`rounded-md px-3 py-2 text-center ${
                          isHighlight
                            ? "bg-white/10 backdrop-blur-sm"
                            : "bg-muted/60 border border-border/50"
                        }`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`w-full text-xs ${
                              isHighlight
                                ? "text-white/70 hover:text-white hover:bg-white/10"
                                : "text-destructive hover:text-destructive hover:bg-destructive/10"
                            }`}
                            onClick={() => setShowCancelDialog(true)}
                          >
                            Cancelar assinatura
                          </Button>
                        </div>
                      )}
                    </>
                  ) : isTrial ? (
                    <div className="text-center text-sm text-muted-foreground py-2.5 bg-muted/50 rounded-md">
                      Plano de avaliação
                    </div>
                  ) : isUpgrade ? (
                    isAdmin ? (
                      hasStripeSubscription ? (
                        <Button
                          className={`w-full font-semibold ${
                            isHighlight
                              ? "bg-white text-[#1E40AF] hover:bg-white/90 shadow-md"
                              : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                          }`}
                          variant={isHighlight ? "secondary" : "outline"}
                          onClick={() => setShowDowngradeDialog(plan.key)}
                          disabled={isChanging || !!loadingChangePlan}
                        >
                          {isChanging ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          {isChanging ? "Alterando..." : "Fazer upgrade"}
                        </Button>
                      ) : (
                        <Button
                          className={`w-full font-semibold ${
                            isHighlight
                              ? "bg-white text-[#1E40AF] hover:bg-white/90 shadow-md"
                              : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                          }`}
                          variant={isHighlight ? "secondary" : "outline"}
                          onClick={() => handleCheckout(plan.key)}
                          disabled={isLoading || !!loadingPlan}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          {isLoading ? "Redirecionando..." : "Fazer upgrade"}
                        </Button>
                      )
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            className={`w-full font-semibold ${
                              isHighlight
                                ? "bg-white text-[#1E40AF] hover:bg-white/90 shadow-md"
                                : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                            }`}
                            disabled
                            variant={isHighlight ? "secondary" : "outline"}
                          >
                            Fazer upgrade
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Apenas administradores podem contratar planos.
                        </TooltipContent>
                      </Tooltip>
                    )
                  ) : isDowngrade ? (
                    isTrial ? (
                      <div className="text-center text-sm text-muted-foreground py-2.5 bg-muted/50 rounded-md">
                        Plano de avaliação
                      </div>
                    ) : isAdmin ? (
                      hasStripeSubscription ? (
                        <Button
                          className="w-full font-semibold"
                          variant="outline"
                          onClick={() => setShowDowngradeDialog(plan.key)}
                          disabled={isChanging || !!loadingChangePlan}
                        >
                          {isChanging ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          {isChanging ? "Alterando..." : "Fazer downgrade"}
                        </Button>
                      ) : (
                        <Button
                          className="w-full font-semibold"
                          variant="outline"
                          onClick={() => handleCheckout(plan.key)}
                          disabled={isLoading || !!loadingPlan}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          {isLoading ? "Redirecionando..." : "Fazer downgrade"}
                        </Button>
                      )
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button className="w-full font-semibold" disabled variant="outline">
                            Fazer downgrade
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Apenas administradores podem alterar planos.
                        </TooltipContent>
                      </Tooltip>
                    )
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-[13px] text-muted-foreground max-w-[500px] mx-auto">
          Pagamentos processados com segurança via Stripe. Cancele a qualquer momento
          pelo portal de gerenciamento da assinatura.
        </p>
      </div>

      {/* Cancel subscription dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar assinatura</AlertDialogTitle>
            <AlertDialogDescription>
              {hasStripeSubscription
                ? "Tem certeza que deseja cancelar sua assinatura? Seu acesso continuará ativo até o fim do ciclo de cobrança atual. Após essa data, seu plano será rebaixado e você perderá acesso aos módulos pagos."
                : "Tem certeza que deseja cancelar sua assinatura? Seu acesso continuará ativo até a data de expiração do plano. Após essa data, você perderá acesso aos módulos pagos."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingCancel}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={loadingCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loadingCancel ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loadingCancel ? "Cancelando..." : "Confirmar cancelamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change plan (downgrade/upgrade) dialog */}
      <AlertDialog open={!!showDowngradeDialog} onOpenChange={(open) => !open && setShowDowngradeDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar plano</AlertDialogTitle>
            <AlertDialogDescription>
              {showDowngradeDialog && planOrder.indexOf(showDowngradeDialog) < currentPlanIndex
                ? "Ao fazer downgrade, você perderá acesso a módulos do plano atual. A diferença de valor será creditada proporcionalmente."
                : "Ao fazer upgrade, você terá acesso imediato aos novos módulos. A diferença de valor será cobrada proporcionalmente."
              }
              {" "}Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!loadingChangePlan}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showDowngradeDialog && handleChangePlan(showDowngradeDialog)}
              disabled={!!loadingChangePlan}
            >
              {loadingChangePlan ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loadingChangePlan ? "Alterando..." : "Confirmar alteração"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
