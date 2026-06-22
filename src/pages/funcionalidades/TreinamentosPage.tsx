import { GraduationCap, Users, Grid3X3, Award, Bell, BarChart3, Plus, Search, CheckCircle } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { LandingHero } from "@/components/landing/LandingHero";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingCTA } from "@/components/landing/LandingCTA";

const features = [
  { icon: Grid3X3, title: "Matriz de treinamento", description: "Defina quais treinamentos cada cargo exige. O sistema cruza automaticamente com os colaboradores e mostra o status." },
  { icon: Award, title: "Certificados com validade", description: "Registre certificados com data de conclusão e validade. O sistema calcula o vencimento automaticamente." },
  { icon: Users, title: "Gestão de colaboradores", description: "Cadastre colaboradores com cargo, setor e status. Importe em massa via planilha Excel." },
  { icon: Bell, title: "Alertas de vencimento", description: "Saiba com antecedência quais treinamentos estão vencendo. Dashboard visual por colaborador e por treinamento." },
  { icon: BarChart3, title: "Dashboard de conformidade", description: "Percentual de conformidade geral, por setor e por cargo. Identifique gaps rapidamente." },
  { icon: GraduationCap, title: "Catálogo de treinamentos", description: "Cadastre treinamentos com carga horária, validade padrão e NR relacionada. Reutilize em toda a organização." },
];

const steps = [
  { num: "01", icon: Plus, title: "Monte o catálogo", desc: "Cadastre treinamentos com validade e NR. Crie cargos e a matriz." },
  { num: "02", icon: Search, title: "Importe colaboradores", desc: "Cadastre ou importe via Excel. Associe cargo e setor." },
  { num: "03", icon: CheckCircle, title: "Registre certificados", desc: "Registre conclusões com data e validade. O dashboard mostra quem está em dia." },
];

const faqs = [
  { q: "O que é a matriz de treinamento?", a: "É uma tabela que cruza cargos com treinamentos obrigatórios. Quando um colaborador tem um cargo, o sistema verifica automaticamente se ele possui todos os treinamentos exigidos." },
  { q: "Posso importar colaboradores via Excel?", a: "Sim. O sistema aceita planilhas .xlsx com nome, cargo e setor. Colaboradores são criados em massa em segundos." },
  { q: "Como funciona o alerta de vencimento?", a: "Cada certificado tem data de validade. O dashboard destaca visualmente os que estão vencendo em breve ou já vencidos." },
  { q: "Funciona para treinamentos de NR?", a: "Sim. Cada treinamento pode ter uma NR associada (NR-10, NR-35, NR-33, etc.) para rastreabilidade regulatória." },
];

export default function TreinamentosPage() {
  usePageTitle("Gestão de Treinamentos NR e Certificados", {
    description: "Controle treinamentos NR com matriz por cargo, certificados com validade, importação em massa e dashboard de conformidade.",
    breadcrumbs: [
      { name: "Início", url: "https://evita-hse-br.lovable.app/" },
      { name: "Funcionalidades", url: "https://evita-hse-br.lovable.app/funcionalidades" },
      { name: "Treinamentos", url: "https://evita-hse-br.lovable.app/funcionalidades/treinamentos" },
    ],
  });

  return (
    <LandingLayout>
      <LandingHero icon={GraduationCap} badge="Treinamentos" title="Controle de Treinamentos e" highlight="Certificados NR" description="Matriz por cargo, certificados com validade, importação em massa e dashboard de conformidade. Saiba quem está em dia com as NRs." breadcrumb="Treinamentos" />
      <FeatureSection features={features} />
      <HowItWorks steps={steps} />
      <LandingFAQ faqs={faqs} jsonLdId="treinamentos-faq" />
      <LandingCTA />
    </LandingLayout>
  );
}
