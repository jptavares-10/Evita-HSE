import { Users, Link2, FolderOpen, Shield, Upload, CheckCircle, Plus, Search, Eye } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { LandingHero } from "@/components/landing/LandingHero";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingCTA } from "@/components/landing/LandingCTA";

const features = [
  { icon: Link2, title: "Link único por fornecedor", description: "Gere um link exclusivo para cada fornecedor. Ele acessa sem criar conta e envia documentos organizados." },
  { icon: Upload, title: "Upload pelo fornecedor", description: "O fornecedor faz upload direto pelo portal. Sem WhatsApp, sem e-mail, sem perder documentos." },
  { icon: FolderOpen, title: "Pastas organizadas", description: "Documentos ficam organizados por fornecedor e categoria. Consulte rapidamente durante auditorias." },
  { icon: Shield, title: "Acesso seguro", description: "O link do portal é tokenizado e seguro. Cada fornecedor só acessa sua própria área." },
  { icon: CheckCircle, title: "Categorias de fornecedor", description: "Classifique fornecedores por categoria: transporte, alimentação, limpeza, manutenção e mais." },
  { icon: Eye, title: "Visão consolidada", description: "Dashboard com total de fornecedores, documentos recebidos e pendências por fornecedor." },
];

const steps = [
  { num: "01", icon: Plus, title: "Cadastre o fornecedor", desc: "Informe nome, CNPJ, categoria e documentos solicitados." },
  { num: "02", icon: Link2, title: "Envie o link", desc: "Gere o link do portal e envie ao fornecedor por e-mail ou mensagem." },
  { num: "03", icon: Search, title: "Receba documentos", desc: "O fornecedor envia pelo portal. Você visualiza e organiza tudo no sistema." },
];

const faqs = [
  { q: "O fornecedor precisa criar conta?", a: "Não. O fornecedor acessa o portal por um link único (tokenizado). Ele não precisa criar conta, instalar nada ou ter login." },
  { q: "Os documentos ficam seguros?", a: "Sim. Os documentos são armazenados em buckets privados com URLs temporárias. Cada fornecedor só acessa sua própria área." },
  { q: "Posso organizar por categoria?", a: "Sim. Crie categorias personalizadas (transporte, limpeza, etc.) e classifique cada fornecedor. Filtre rapidamente no dashboard." },
  { q: "Como funciona o portal do fornecedor?", a: "Ao cadastrar um fornecedor, o sistema gera um link único. Envie esse link ao fornecedor. Ele acessa, vê as pastas e faz upload dos documentos solicitados." },
];

export default function FornecedoresPage() {
  usePageTitle("Portal de Fornecedores — Gestão de Documentos de Fornecedores", {
    description: "Portal de fornecedores com link único para envio de documentos. Sem WhatsApp, sem e-mail. Pastas organizadas e acesso seguro.",
    breadcrumbs: [
      { name: "Início", url: "https://evita-hse-br.lovable.app/" },
      { name: "Funcionalidades", url: "https://evita-hse-br.lovable.app/funcionalidades" },
      { name: "Fornecedores", url: "https://evita-hse-br.lovable.app/funcionalidades/fornecedores" },
    ],
  });

  return (
    <LandingLayout>
      <LandingHero icon={Users} badge="Portal de Fornecedores" title="Portal de" highlight="Fornecedores" description="Link único para o fornecedor enviar documentos. Sem WhatsApp, sem e-mail. Pastas organizadas e acesso seguro por token." breadcrumb="Fornecedores" />
      <FeatureSection features={features} />
      <HowItWorks steps={steps} />
      <LandingFAQ faqs={faqs} jsonLdId="fornecedores-faq" />
      <LandingCTA />
    </LandingLayout>
  );
}
