import { FileText, RefreshCw, Bell, Shield, Clock, MapPin, Plus, Search, CheckCircle } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { LandingHero } from "@/components/landing/LandingHero";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingCTA } from "@/components/landing/LandingCTA";

const features = [
  { icon: FileText, title: "Cadastro completo", description: "Registre LO, LI, LP, outorgas e autorizações com número, órgão emissor, esfera, validade e condicionantes." },
  { icon: Clock, title: "Controle de validade", description: "Licenças com e sem vencimento. Alertas configuráveis por dias de antecedência para cada licença." },
  { icon: RefreshCw, title: "Histórico de renovações", description: "Registre cada renovação com nova data, número e documento. Mantenha o histórico completo." },
  { icon: Shield, title: "Condicionantes", description: "Registre as condicionantes de cada licença em campo dedicado para consulta rápida durante auditorias." },
  { icon: Bell, title: "Alertas antecipados", description: "Configure o prazo de alerta por licença. Ideal para iniciar o processo de renovação com antecedência." },
  { icon: MapPin, title: "Esfera regulatória", description: "Classifique por esfera: municipal, estadual ou federal. Filtre rapidamente por órgão emissor." },
];

const steps = [
  { num: "01", icon: Plus, title: "Cadastre a licença", desc: "Informe tipo, número, órgão, validade e condicionantes." },
  { num: "02", icon: Search, title: "Monitore vencimentos", desc: "O dashboard mostra licenças por status e prazo." },
  { num: "03", icon: CheckCircle, title: "Registre renovações", desc: "Quando renovar, registre com novo documento e mantenha o histórico." },
];

const faqs = [
  { q: "Quais tipos de licença posso cadastrar?", a: "LO (Licença de Operação), LI (Licença de Instalação), LP (Licença Prévia), outorgas, autorizações e qualquer tipo personalizado que você criar." },
  { q: "Como funciona o alerta de vencimento?", a: "Cada licença tem dias de alerta configuráveis. O sistema destaca no dashboard as licenças próximas do vencimento para iniciar o processo de renovação." },
  { q: "Posso registrar licenças sem vencimento?", a: "Sim. Licenças sem prazo definido podem ser cadastradas como 'sem vencimento'. Elas ficam no sistema sem gerar alertas de prazo." },
  { q: "O que são condicionantes?", a: "São condições impostas pelo órgão ambiental que a empresa deve cumprir para manter a licença válida. O sistema permite registrá-las para consulta rápida." },
];

export default function LicencasPage() {
  usePageTitle("Licenças Ambientais — Controle de LO, LI e Autorizações", {
    description: "Controle de licenças ambientais com histórico de renovações, alertas de vencimento, condicionantes e classificação por esfera regulatória.",
    breadcrumbs: [
      { name: "Início", url: "https://evita-hse-br.lovable.app/" },
      { name: "Funcionalidades", url: "https://evita-hse-br.lovable.app/funcionalidades" },
      { name: "Licenças", url: "https://evita-hse-br.lovable.app/funcionalidades/licencas" },
    ],
  });

  return (
    <LandingLayout>
      <LandingHero icon={FileText} badge="Licenças Ambientais" title="Controle de Licenças" highlight="Ambientais" description="LO, LI, outorgas e autorizações com histórico de renovações, condicionantes e alertas de vencimento configuráveis." breadcrumb="Licenças" />
      <FeatureSection features={features} />
      <HowItWorks steps={steps} />
      <LandingFAQ faqs={faqs} jsonLdId="licencas-faq" />
      <LandingCTA />
    </LandingLayout>
  );
}
