import { BookOpen, FileText, RefreshCw, Search, Clock, Link2, Plus, FolderOpen, CheckCircle } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { LandingHero } from "@/components/landing/LandingHero";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingCTA } from "@/components/landing/LandingCTA";

const features = [
  { icon: FolderOpen, title: "Tipos de documento", description: "Organize por tipo: PGR, PCMSO, procedimentos, políticas, laudos. Crie categorias personalizadas." },
  { icon: RefreshCw, title: "Ciclo de revisão", description: "Defina frequência de revisão automática. O sistema calcula a próxima revisão e alerta no prazo." },
  { icon: FileText, title: "Histórico de revisões", description: "Cada nova revisão mantém a anterior. Consulte qualquer versão com data, número e responsável." },
  { icon: Search, title: "Busca e filtros", description: "Encontre documentos por título, tipo, área, responsável ou status. Filtros combinados para busca rápida." },
  { icon: Link2, title: "Vínculo com serviços", description: "Vincule documentos a serviços periódicos para referência cruzada e rastreabilidade." },
  { icon: Clock, title: "Alertas de revisão", description: "Dashboard destaca documentos com revisão pendente ou vencida. Nunca perca um prazo regulatório." },
];

const steps = [
  { num: "01", icon: Plus, title: "Cadastre o documento", desc: "Informe título, tipo, revisão atual e frequência de revisão." },
  { num: "02", icon: FolderOpen, title: "Organize e vincule", desc: "Categorize por tipo e área. Vincule a serviços quando aplicável." },
  { num: "03", icon: CheckCircle, title: "Controle revisões", desc: "Registre novas revisões com arquivo atualizado e mantenha o histórico." },
];

const faqs = [
  { q: "Que tipos de documento posso armazenar?", a: "Qualquer documento de SST e meio ambiente: PGR, PCMSO, LTCAT, laudos, procedimentos, políticas, atas, relatórios. Você cria tipos personalizados." },
  { q: "Como funciona o ciclo de revisão?", a: "Ao cadastrar, defina a frequência (ex: a cada 365 dias). O sistema calcula a próxima revisão e alerta antes do prazo. Cada revisão fica no histórico." },
  { q: "Posso vincular documentos a serviços?", a: "Sim. Ao detalhar um serviço periódico, você pode vincular documentos relacionados para referência cruzada." },
];

export default function DocumentosPage() {
  usePageTitle("Biblioteca de Documentos — Gestão de Documentos SST", {
    description: "Centralize PGR, PCMSO, laudos e procedimentos de SST. Controle de revisões automático, histórico de versões e alertas de vencimento.",
    breadcrumbs: [
      { name: "Início", url: "https://evita-hse-br.lovable.app/" },
      { name: "Funcionalidades", url: "https://evita-hse-br.lovable.app/funcionalidades" },
      { name: "Documentos", url: "https://evita-hse-br.lovable.app/funcionalidades/documentos" },
    ],
  });

  return (
    <LandingLayout>
      <LandingHero icon={BookOpen} badge="Biblioteca de Documentos" title="Gestão de Documentos de" highlight="SST" description="Centralize PGR, PCMSO, procedimentos e políticas com controle de revisões automático e histórico completo de versões." breadcrumb="Documentos" />
      <FeatureSection features={features} />
      <HowItWorks steps={steps} />
      <LandingFAQ faqs={faqs} jsonLdId="documentos-faq" />
      <LandingCTA />
    </LandingLayout>
  );
}
