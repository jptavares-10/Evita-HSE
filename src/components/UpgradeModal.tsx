import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

const MODULE_INFO: Record<string, { label: string; description: string; plans: string[] }> = {
  periodic_services: {
    label: "Serviços Periódicos",
    description: "Gerencie todos os serviços recorrentes da sua empresa com alertas automáticos.",
    plans: ["Starter", "Professional", "Enterprise"],
  },
  trainings: {
    label: "Treinamentos",
    description: "Controle completo de treinamentos, colaboradores e matriz de capacitação.",
    plans: ["Starter", "Professional", "Enterprise"],
  },
  ic_nc: {
    label: "IC & NC",
    description: "Registre e acompanhe incidentes, não conformidades e ações corretivas.",
    plans: ["Starter", "Professional", "Enterprise"],
  },
  aso: {
    label: "ASO / Exames",
    description: "Gestão de exames médicos ocupacionais com alertas de vencimento.",
    plans: ["Starter", "Professional", "Enterprise"],
  },
  mtr: {
    label: "Gestão de MTR",
    description: "Controle de Manifestos de Transporte de Resíduos e CDFs.",
    plans: ["Professional", "Enterprise"],
  },
  environmental_licenses: {
    label: "Licenças Ambientais",
    description: "Gerencie licenças, condicionantes e renovações com alertas automáticos.",
    plans: ["Professional", "Enterprise"],
  },
  suppliers: {
    label: "Fornecedores",
    description: "Cadastro de fornecedores com portal externo para envio de documentos.",
    plans: ["Professional", "Enterprise"],
  },
  document_library: {
    label: "Biblioteca de Documentos",
    description: "Controle de revisão e versionamento de documentos técnicos.",
    plans: ["Professional", "Enterprise"],
  },
  inspections: {
    label: "Inspeções de Segurança",
    description: "Modelos de inspeção com execuções periódicas e ações corretivas.",
    plans: ["Professional", "Enterprise"],
  },
  user_permissions: {
    label: "Permissões por Módulo",
    description: "Controle granular de acesso por módulo para cada usuário.",
    plans: ["Professional", "Enterprise"],
  },
  epi: {
    label: "EPIs",
    description: "Catálogo de EPIs, controle de estoque, entregas e certificados de aprovação.",
    plans: ["Professional", "Enterprise"],
  },
  license_conditionants: {
    label: "Condicionantes de Licença",
    description: "Acompanhamento de condicionantes com prazos, evidências e protocolos junto ao órgão ambiental.",
    plans: ["Enterprise"],
  },
  document_review: {
    label: "Ciclo de Revisão de Documentos",
    description: "Fluxo de revisão e aprovação de documentos com pareceres, prazos e histórico.",
    plans: ["Enterprise"],
  },
};

interface UpgradeModalProps {
  module: string | null;
  open: boolean;
  onClose: () => void;
}

export function UpgradeModal({ module, open, onClose }: UpgradeModalProps) {
  const navigate = useNavigate();
  const info = module ? MODULE_INFO[module] : null;

  if (!info) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-lg">
              Este módulo não está no seu plano
            </DialogTitle>
          </div>
          <DialogDescription className="text-left">
            <span className="font-semibold text-foreground">{info.label}</span>
            <br />
            {info.description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <p className="text-sm text-muted-foreground mb-2">Disponível nos planos:</p>
          <div className="flex gap-2 flex-wrap">
            {info.plans.map((p) => (
              <Badge key={p} variant="secondary">{p}</Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            className="flex-1"
            onClick={() => {
              onClose();
              navigate("/planos");
            }}
          >
            Ver todos os planos
          </Button>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
