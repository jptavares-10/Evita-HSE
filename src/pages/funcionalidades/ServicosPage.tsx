import { Calendar, Bell, FileCheck, ListChecks, Clock, BarChart3, Plus, Search } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { LandingHero } from "@/components/landing/LandingHero";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingCTA } from "@/components/landing/LandingCTA";

const features = [
  { icon: Calendar, title: "Frequência configurável", description: "Defina intervalos personalizados ou use presets (mensal, trimestral, semestral, anual) para cada serviço." },
  { icon: Bell, title: "Alertas antes do vencimento", description: "Configure quantos dias antes do prazo o sistema deve alertar. Nunca mais perca um vencimento." },
  { icon: FileCheck, title: "Registro de conclusão", description: "Registre cada execução com data, responsável e documentos comprobatórios anexados." },
  { icon: ListChecks, title: "Categorias de serviço", description: "Organize serviços por categoria: extintores, laudos, dedetização, limpezas e mais." },
  { icon: Clock, title: "Histórico completo", description: "Consulte todo o histórico de execuções de cada serviço com documentos e notas." },
  { icon: BarChart3, title: "Dashboard de status", description: "KPIs visuais mostram serviços em dia, próximos do vencimento e vencidos." },
];

const steps = [
  { num: "01", icon: Plus, title: "Cadastre o serviço", desc: "Informe nome, categoria, frequência e dias de alerta." },
  { num: "02", icon: Search, title: "Monitore os prazos", desc: "O dashboard mostra tudo organizado por status e urgência." },
  { num: "03", icon: FileCheck, title: "Registre conclusões", desc: "Ao executar, registre a data e anexe o documento comprobatório." },
];

const faqs = [
  { q: "Que tipos de serviço posso controlar?", a: "Qualquer serviço recorrente: extintores, dedetização, limpeza de cisterna, laudos técnicos, calibrações, manutenções e mais. Você cria categorias personalizadas." },
  { q: "Como funcionam os alertas?", a: "Você configura quantos dias antes do vencimento quer ser alertado. O sistema destaca visualmente no dashboard os serviços que precisam de atenção." },
  { q: "Posso anexar documentos ao registrar conclusão?", a: "Sim. Cada registro de conclusão pode ter documentos anexados (laudos, notas fiscais, relatórios) que ficam salvos no histórico." },
  { q: "É possível ver o histórico de um serviço?", a: "Sim. Cada serviço mantém o histórico completo de todas as execuções, com datas, responsáveis e documentos." },
];

export default function ServicosPage() {
  usePageTitle("Serviços Periódicos de SST", {
    description: "Controle extintores, dedetização, laudos e serviços recorrentes de SST. Alertas automáticos, histórico de execuções e dashboard de conformidade.",
    breadcrumbs: [
      { name: "Início", url: "https://evita-hse-br.lovable.app/" },
      { name: "Funcionalidades", url: "https://evita-hse-br.lovable.app/funcionalidades" },
      { name: "Serviços Periódicos", url: "https://evita-hse-br.lovable.app/funcionalidades/servicos-periodicos" },
    ],
  });

  return (
    <LandingLayout>
      <LandingHero icon={Calendar} badge="Serviços Periódicos" title="Controle de Serviços Periódicos para" highlight="SST" description="Gerencie extintores, dedetização, laudos, manutenções e qualquer serviço recorrente com alertas automáticos e histórico completo." breadcrumb="Serviços Periódicos" />
      <FeatureSection features={features} />
      <HowItWorks steps={steps} />
      <LandingFAQ faqs={faqs} jsonLdId="servicos-faq" />
      <LandingCTA />
    </LandingLayout>
  );
}
