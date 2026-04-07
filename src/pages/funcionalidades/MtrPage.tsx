import { Recycle, FileCheck, Bell, BarChart3, Clock, Layers, Plus, Search, CheckCircle } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { LandingHero } from "@/components/landing/LandingHero";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingCTA } from "@/components/landing/LandingCTA";

const features = [
  { icon: Recycle, title: "Registro de MTR", description: "Cadastre cada MTR com número, data de emissão, transportador e categorias de resíduo com quantidades." },
  { icon: Clock, title: "Prazo de CDF", description: "O sistema calcula o prazo do CDF (Certificado de Destinação Final) e monitora automaticamente." },
  { icon: Bell, title: "Alertas de CDF", description: "Configure alertas antes do vencimento do prazo do CDF. Nunca mais pague multa por CDF atrasado." },
  { icon: FileCheck, title: "Registro de CDF", description: "Quando receber o CDF, registre com número, data e documento anexado. O status atualiza automaticamente." },
  { icon: Layers, title: "Categorias de resíduo", description: "Crie categorias personalizadas de resíduo. Cada MTR pode ter múltiplos tipos com quantidade em toneladas." },
  { icon: BarChart3, title: "Análise gráfica", description: "Gráficos de geração mensal por categoria de resíduo. Identifique tendências e otimize a gestão." },
];

const steps = [
  { num: "01", icon: Plus, title: "Registre o MTR", desc: "Informe número, data, transportador e resíduos com quantidades." },
  { num: "02", icon: Search, title: "Monitore o CDF", desc: "O sistema calcula o prazo e alerta antes do vencimento." },
  { num: "03", icon: CheckCircle, title: "Registre o CDF", desc: "Quando recebido, registre e anexe o documento. Status atualiza automaticamente." },
];

const faqs = [
  { q: "O que é MTR?", a: "MTR (Manifesto de Transporte de Resíduos) é o documento que acompanha o transporte de resíduos do gerador até a destinação final. É obrigatório para resíduos sujeitos a controle." },
  { q: "O que é CDF?", a: "CDF (Certificado de Destinação Final) é o documento que comprova que o resíduo foi tratado ou disposto de forma adequada. Deve ser enviado pelo destinador em prazo determinado." },
  { q: "O que acontece se o CDF atrasar?", a: "A empresa geradora pode ser multada. Por isso o Evita HSE monitora o prazo do CDF e alerta antes do vencimento, evitando autuações." },
  { q: "Posso analisar a geração de resíduos?", a: "Sim. O módulo inclui gráficos de geração mensal por categoria de resíduo, permitindo identificar tendências e otimizar a gestão ambiental." },
];

export default function MtrPage() {
  usePageTitle("Gestão de MTR — Controle de Resíduos e CDF", {
    description: "Controle de MTR e CDF com prazo monitorado, alertas automáticos, categorias de resíduo personalizáveis e gráficos de geração mensal.",
  });

  return (
    <LandingLayout>
      <LandingHero icon={Recycle} badge="Gestão de MTR" title="Controle de MTR e" highlight="CDF" description="MTR com prazo de CDF monitorado, alertas automáticos, categorias de resíduo e gráficos de geração mensal por tipo." breadcrumb="MTR" />
      <FeatureSection features={features} />
      <HowItWorks steps={steps} />
      <LandingFAQ faqs={faqs} jsonLdId="mtr-faq" />
      <LandingCTA />
    </LandingLayout>
  );
}
