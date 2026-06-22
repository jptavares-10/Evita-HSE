import { Stethoscope, UserCheck, Calendar, FileText, Bell, BarChart3, Plus, Search, CheckCircle } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { LandingHero } from "@/components/landing/LandingHero";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingCTA } from "@/components/landing/LandingCTA";

const features = [
  { icon: Stethoscope, title: "Tipos de exame personalizáveis", description: "Admissional, periódico, demissional, retorno ao trabalho, mudança de função. Crie tipos personalizados com validade padrão." },
  { icon: Calendar, title: "Controle de validade", description: "Cada exame tem data de realização e vencimento. O sistema calcula automaticamente com base na validade configurada." },
  { icon: UserCheck, title: "Histórico por colaborador", description: "Consulte todos os exames de cada colaborador em ordem cronológica, com resultados e documentos." },
  { icon: FileText, title: "Anexo de ASO", description: "Faça upload do documento ASO (PDF, imagem) junto ao registro. Consulte a qualquer momento." },
  { icon: Bell, title: "Alertas de vencimento", description: "Dashboard destaca exames vencidos e próximos do vencimento. Nunca perca um prazo do PCMSO." },
  { icon: BarChart3, title: "KPIs de saúde", description: "Total de exames, exames em dia, vencidos e próximos do vencimento. Visão consolidada da empresa." },
];

const steps = [
  { num: "01", icon: Plus, title: "Configure tipos de exame", desc: "Defina os tipos com validade padrão em meses." },
  { num: "02", icon: Search, title: "Registre exames", desc: "Selecione colaborador, tipo, resultado e anexe o ASO." },
  { num: "03", icon: CheckCircle, title: "Monitore vencimentos", desc: "O dashboard mostra quem precisa renovar o exame." },
];

const faqs = [
  { q: "O que é ASO?", a: "ASO (Atestado de Saúde Ocupacional) é o documento emitido pelo médico do trabalho que atesta a aptidão do trabalhador para a função. É obrigatório por lei (NR-7)." },
  { q: "Quais tipos de exame o sistema suporta?", a: "Admissional, periódico, demissional, retorno ao trabalho, mudança de função e qualquer tipo personalizado que você criar." },
  { q: "Posso registrar o médico e CRM?", a: "Sim. Cada registro tem campos para nome do médico e número do CRM, além de resultado e observações." },
  { q: "Como saber quais exames estão vencidos?", a: "O dashboard de ASO mostra KPIs com contagem de exames vencidos, a vencer e em dia. Cada colaborador tem indicador visual de status." },
];

export default function AsoPage() {
  usePageTitle("Gestão de ASO e Exames Ocupacionais", {
    description: "Controle de ASO e exames ocupacionais. Tipos personalizáveis, alertas de vencimento, histórico por colaborador e dashboard de saúde ocupacional.",
    breadcrumbs: [
      { name: "Início", url: "https://evita-hse-br.lovable.app/" },
      { name: "Funcionalidades", url: "https://evita-hse-br.lovable.app/funcionalidades" },
      { name: "ASO", url: "https://evita-hse-br.lovable.app/funcionalidades/aso" },
    ],
  });

  return (
    <LandingLayout>
      <LandingHero icon={Stethoscope} badge="ASO / Exames Ocupacionais" title="Controle de ASO e" highlight="Exames Ocupacionais" description="Registre exames admissionais, periódicos e demissionais com validade, alertas e histórico por colaborador." breadcrumb="ASO" />
      <FeatureSection features={features} />
      <HowItWorks steps={steps} />
      <LandingFAQ faqs={faqs} jsonLdId="aso-faq" />
      <LandingCTA />
    </LandingLayout>
  );
}
