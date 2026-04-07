import { HardHat, Package, UserCheck, FileText, Bell, BarChart3, Plus, Search, ClipboardList } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { LandingHero } from "@/components/landing/LandingHero";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingCTA } from "@/components/landing/LandingCTA";

const features = [
  { icon: HardHat, title: "Catálogo com CA", description: "Cadastre cada tipo de EPI com número do CA, validade do certificado e alerta de vencimento configurável." },
  { icon: Package, title: "Controle de estoque", description: "Entradas e saídas por tipo de EPI. Estoque mínimo configurável com alertas visuais no dashboard." },
  { icon: UserCheck, title: "Entregas por colaborador", description: "Registre cada entrega com data, quantidade, motivo e comprovante. Histórico completo por colaborador." },
  { icon: FileText, title: "Ficha de EPI", description: "Visualize a ficha completa de cada colaborador com todos os EPIs recebidos, devoluções e pendências." },
  { icon: Bell, title: "Alertas de CA", description: "O sistema alerta quando o Certificado de Aprovação de um EPI está próximo do vencimento." },
  { icon: BarChart3, title: "Dashboard visual", description: "KPIs de estoque, entregas do mês, CAs vencendo e itens abaixo do estoque mínimo." },
];

const steps = [
  { num: "01", icon: Plus, title: "Cadastre os EPIs", desc: "Registre cada tipo com CA, validade e estoque mínimo." },
  { num: "02", icon: ClipboardList, title: "Registre entregas", desc: "Entregue para colaboradores com comprovante e controle automático do estoque." },
  { num: "03", icon: Search, title: "Monitore tudo", desc: "Dashboard mostra estoque, CAs vencendo e entregas pendentes." },
];

const faqs = [
  { q: "O que é CA de EPI?", a: "CA é o Certificado de Aprovação emitido pelo MTE que atesta que o EPI foi testado e aprovado para uso. Ele tem validade e precisa ser renovado pelo fabricante." },
  { q: "Como controlar estoque de EPI?", a: "Cada entrada (compra) e saída (entrega) é registrada. O sistema calcula o saldo em tempo real e alerta quando atinge o estoque mínimo configurado." },
  { q: "Posso gerar ficha de EPI por colaborador?", a: "Sim. A ficha mostra todos os EPIs entregues ao colaborador, com datas, quantidades e comprovantes — ideal para auditorias e fiscalizações." },
  { q: "O sistema alerta sobre CAs vencidos?", a: "Sim. Você configura quantos dias antes do vencimento quer ser alertado. O dashboard destaca visualmente os CAs que precisam de atenção." },
];

export default function EpiPage() {
  usePageTitle("Gestão de EPIs — Controle de Equipamentos de Proteção Individual", {
    description: "Controle de EPIs com catálogo CA, estoque com mínimo, entregas por colaborador, ficha de EPI e alertas de vencimento de certificado.",
  });

  return (
    <LandingLayout>
      <LandingHero icon={HardHat} badge="Gestão de EPIs" title="Controle completo de" highlight="EPIs" description="Catálogo com CA, controle de estoque, entregas por colaborador, ficha de EPI e alertas de vencimento — tudo em um só lugar." breadcrumb="EPIs" />
      <FeatureSection features={features} />
      <HowItWorks steps={steps} />
      <LandingFAQ faqs={faqs} jsonLdId="epi-faq" />
      <LandingCTA />
    </LandingLayout>
  );
}
