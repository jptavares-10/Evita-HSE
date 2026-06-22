import { AlertTriangle, FileText, Users, MapPin, Activity, CheckCircle, Plus, Search, ClipboardList } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { LandingHero } from "@/components/landing/LandingHero";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingCTA } from "@/components/landing/LandingCTA";

const features = [
  { icon: AlertTriangle, title: "Registro de incidentes", description: "Registre acidentes, quase-acidentes e não conformidades com tipo, severidade, local e descrição detalhada." },
  { icon: Users, title: "Colaboradores envolvidos", description: "Vincule colaboradores ao registro. Controle dias perdidos e afastamento por incidente." },
  { icon: FileText, title: "Anexos e evidências", description: "Adicione fotos, relatórios e documentos como evidência de cada ocorrência." },
  { icon: Activity, title: "Análise de causa", description: "Registre a análise de causa raiz e parte do corpo afetada para cada incidente." },
  { icon: CheckCircle, title: "Ações corretivas", description: "Crie planos de ação com status, responsável, prazo e evidências de conclusão." },
  { icon: MapPin, title: "KPIs de segurança", description: "Dashboard com total de ocorrências, dias sem acidentes, taxa de frequência e distribuição por tipo." },
];

const steps = [
  { num: "01", icon: Plus, title: "Registre a ocorrência", desc: "Informe tipo, severidade, local, data e colaboradores envolvidos." },
  { num: "02", icon: ClipboardList, title: "Analise e planeje", desc: "Registre causa raiz e crie ações corretivas com prazos." },
  { num: "03", icon: CheckCircle, title: "Conclua e evidencie", desc: "Finalize ações com evidências e mantenha o histórico completo." },
];

const faqs = [
  { q: "Qual a diferença entre incidente e não conformidade?", a: "Incidente é um evento indesejado (acidente, quase-acidente). Não conformidade é o descumprimento de um requisito (procedimento, norma). O sistema permite registrar ambos." },
  { q: "Posso controlar dias perdidos?", a: "Sim. Cada ocorrência registra se houve afastamento e quantos dias foram perdidos. Isso alimenta os KPIs de segurança." },
  { q: "Como funciona o plano de ação corretiva?", a: "Cada ocorrência pode ter múltiplas ações corretivas. Cada ação tem descrição, responsável, status e espaço para evidência de conclusão." },
];

export default function IncidentesPage() {
  usePageTitle("Incidentes e Não Conformidades (IC & NC)", {
    description: "Registre incidentes de trabalho e não conformidades com análise de causa, plano de ação corretiva, evidências e KPIs de segurança.",
    breadcrumbs: [
      { name: "Início", url: "https://evita-hse-br.lovable.app/" },
      { name: "Funcionalidades", url: "https://evita-hse-br.lovable.app/funcionalidades" },
      { name: "IC & NC", url: "https://evita-hse-br.lovable.app/funcionalidades/incidentes" },
    ],
  });

  return (
    <LandingLayout>
      <LandingHero icon={AlertTriangle} badge="IC & NC" title="Gestão de Incidentes e" highlight="Não Conformidades" description="Registre acidentes, quase-acidentes e NCs com análise de causa, plano de ação corretiva e rastreabilidade completa." breadcrumb="IC & NC" />
      <FeatureSection features={features} />
      <HowItWorks steps={steps} />
      <LandingFAQ faqs={faqs} jsonLdId="incidentes-faq" />
      <LandingCTA />
    </LandingLayout>
  );
}
