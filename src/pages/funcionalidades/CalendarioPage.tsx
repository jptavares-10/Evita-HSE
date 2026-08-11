import { CalendarDays, Layers, Bell, Paperclip, Filter, ClipboardList, Plus, Search, CheckCircle } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { LandingHero } from "@/components/landing/LandingHero";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingCTA } from "@/components/landing/LandingCTA";

const features = [
  { icon: Layers, title: "Todos os prazos em uma única agenda", description: "Serviços periódicos, inspeções, licenças, condicionantes, MTR e revisão de documentos aparecem automaticamente no mês, sem cadastro manual." },
  { icon: CalendarDays, title: "Eventos próprios da equipe", description: "Cadastre campanhas, auditorias, reuniões, treinamentos internos e eventos gerais com data, horário, responsável e status." },
  { icon: Filter, title: "Filtro por área e categoria", description: "Separe a visão por Segurança, Saúde, Meio Ambiente ou geral, e por tipo de compromisso, para cada responsável ver o que importa." },
  { icon: Bell, title: "Nada vence sem aviso", description: "Prazos vencidos e a vencer ganham destaque visual, alinhados aos mesmos indicadores do painel de risco." },
  { icon: Paperclip, title: "Anexos no compromisso", description: "Anexe pauta, convocação, ata ou evidência ao evento — até 5 arquivos, em bucket privado com link temporário." },
  { icon: ClipboardList, title: "Histórico do que foi cumprido", description: "Marque como concluído ou cancelado e mantenha o registro do que a equipe realmente executou no período." },
];

const steps = [
  { num: "01", icon: Search, title: "Abra o mês", desc: "Os prazos dos outros módulos já estão lá, agregados automaticamente." },
  { num: "02", icon: Plus, title: "Inclua os eventos da equipe", desc: "Campanha, auditoria, reunião ou treinamento interno com responsável definido." },
  { num: "03", icon: CheckCircle, title: "Feche o ciclo", desc: "Conclua, cancele ou reagende e mantenha o histórico do período." },
];

const faqs = [
  { q: "Preciso cadastrar os vencimentos no calendário?", a: "Não. Tudo que tem data de vencimento ou renovação nos outros módulos aparece automaticamente no calendário. Você só cadastra o que é próprio da agenda, como campanhas e auditorias." },
  { q: "Quais módulos alimentam o calendário?", a: "Serviços periódicos, inspeções programadas, licenças ambientais e condicionantes, prazos de CDF do MTR e ciclos de revisão de documentos." },
  { q: "O calendário substitui o painel?", a: "Não. O calendário é a visão temporal — o que acontece em cada dia. O painel é a visão de risco — o que está vencido, crítico e quem responde por isso." },
  { q: "Em quais planos o calendário está disponível?", a: "Nos planos Professional e Enterprise, além do período de teste gratuito." },
];

export default function CalendarioPage() {
  usePageTitle("Calendário de Prazos e Eventos de HSE", {
    description:
      "Agenda unificada de HSE: vencimentos de serviços, inspeções, licenças, MTR e documentos em um só calendário, mais campanhas, auditorias e reuniões da equipe.",
    breadcrumbs: [
      { name: "Início", url: "https://evita-hse-br.lovable.app/" },
      { name: "Funcionalidades", url: "https://evita-hse-br.lovable.app/funcionalidades" },
      { name: "Calendário", url: "https://evita-hse-br.lovable.app/funcionalidades/calendario" },
    ],
  });

  return (
    <LandingLayout>
      <LandingHero
        icon={CalendarDays}
        badge="Calendário HSE"
        title="O mês inteiro de HSE em"
        highlight="uma única agenda"
        description="Vencimentos dos módulos entram sozinhos. Campanhas, auditorias e reuniões você cadastra em segundos — com responsável, anexo e status."
        breadcrumb="Calendário"
      />
      <FeatureSection features={features} />
      <HowItWorks steps={steps} />
      <LandingFAQ faqs={faqs} jsonLdId="calendario-faq" />
      <LandingCTA />
    </LandingLayout>
  );
}