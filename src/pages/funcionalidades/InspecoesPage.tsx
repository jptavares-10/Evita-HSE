import { ClipboardCheck, Camera, AlertCircle, ListChecks, Clock, FileText, Plus, Search, CheckCircle } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { LandingHero } from "@/components/landing/LandingHero";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingCTA } from "@/components/landing/LandingCTA";

const features = [
  { icon: ListChecks, title: "Modelos de inspeção", description: "Crie modelos reutilizáveis com nome, frequência, setor e NR relacionada. O sistema gera execuções automaticamente." },
  { icon: Clock, title: "Frequência automática", description: "Defina frequência diária, semanal, quinzenal, mensal ou personalizada. As execuções são criadas no prazo certo." },
  { icon: Camera, title: "Registros fotográficos", description: "Cada entrada de inspeção aceita fotos e documentos como evidência. Tudo fica salvo no histórico." },
  { icon: AlertCircle, title: "Ações corretivas", description: "Registre não conformidades com descrição, prioridade, responsável e prazo. Acompanhe até a conclusão." },
  { icon: FileText, title: "Documento vinculado", description: "Vincule um checklist ou procedimento da Biblioteca de Documentos a cada modelo de inspeção." },
  { icon: CheckCircle, title: "Dashboard de execuções", description: "Veja execuções pendentes, em andamento e concluídas. Filtre por modelo, status e período." },
];

const steps = [
  { num: "01", icon: Plus, title: "Crie o modelo", desc: "Defina nome, frequência, setor e vincule um documento de referência." },
  { num: "02", icon: Search, title: "Monitore execuções", desc: "O sistema gera execuções nos prazos. Acompanhe pelo dashboard." },
  { num: "03", icon: CheckCircle, title: "Registre e corrija", desc: "Adicione entradas com fotos e crie ações corretivas quando necessário." },
];

const faqs = [
  { q: "O que é um modelo de inspeção?", a: "É um template reutilizável que define o que será inspecionado, com que frequência e em qual setor. A partir dele, o sistema gera execuções automaticamente." },
  { q: "Posso vincular uma NR ao modelo?", a: "Sim. Cada modelo pode ter uma NR relacionada (ex: NR-12, NR-35) para facilitar a rastreabilidade regulatória." },
  { q: "Como funcionam as ações corretivas?", a: "Ao encontrar uma não conformidade, você cria uma ação corretiva com descrição, prioridade, responsável e prazo. Quando concluída, anexe evidências." },
  { q: "Posso usar fotos como evidência?", a: "Sim. Cada registro de inspeção aceita upload de fotos e documentos. Ideal para antes/depois e comprovação." },
];

export default function InspecoesPage() {
  usePageTitle("Inspeções de Segurança — Checklist e Ações Corretivas", {
    description: "Inspeções de segurança do trabalho com modelos reutilizáveis, execuções automáticas, registros fotográficos e ações corretivas rastreáveis.",
  });

  return (
    <LandingLayout>
      <LandingHero icon={ClipboardCheck} badge="Inspeções de Segurança" title="Inspeções de Segurança com" highlight="execução automática" description="Modelos de inspeção com frequência configurável, registros fotográficos e ações corretivas rastreáveis até a conclusão." breadcrumb="Inspeções" />
      <FeatureSection features={features} />
      <HowItWorks steps={steps} />
      <LandingFAQ faqs={faqs} jsonLdId="inspecoes-faq" />
      <LandingCTA />
    </LandingLayout>
  );
}
