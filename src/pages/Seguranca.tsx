import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Database,
  FileLock2,
  UserCheck,
  Mail,
  Server,
  AlertTriangle,
  Cookie,
  Scale,
} from "lucide-react";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { usePageTitle } from "@/hooks/usePageTitle";

const sections = [
  {
    icon: UserCheck,
    title: "Autenticação e acesso",
    body: [
      "Login com e-mail e senha gerenciado pelo Supabase Auth. Tokens de sessão JWT armazenados em sessionStorage e renovados automaticamente.",
      "Convites para novos usuários são enviados por link com token de uso único e validade limitada.",
      "Recuperação de senha por e-mail com link expirável.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Controle de acesso (RBAC) e multi-tenancy",
    body: [
      "Toda informação é isolada por empresa (company_id) por meio de Row-Level Security no banco de dados.",
      "Permissões granulares por módulo (Editor / Visualizador) podem ser definidas pelo administrador.",
      "Administradores não podem remover a si mesmos; ações sensíveis exigem checagem server-side.",
    ],
  },
  {
    icon: Database,
    title: "Armazenamento de dados",
    body: [
      "Banco de dados PostgreSQL gerenciado pelo Supabase, hospedado em infraestrutura com criptografia em repouso.",
      "Tráfego entre o seu navegador e a aplicação trafega sob HTTPS (TLS).",
      "Arquivos sensíveis (ASO, MTR, certificados, licenças, documentos) ficam em buckets privados acessíveis apenas por URLs assinadas de curta duração (1 hora).",
    ],
  },
  {
    icon: FileLock2,
    title: "Anexos e uploads",
    body: [
      "Limite global de 20 MB por arquivo.",
      "Buckets privados isolam os arquivos por pasta de empresa; somente membros autenticados da empresa têm acesso.",
      "Logos e avatares ficam em buckets públicos para exibição rápida no produto, sem listagem aberta de conteúdo.",
    ],
  },
  {
    icon: KeyRound,
    title: "Portal do Fornecedor",
    body: [
      "O acesso anônimo do portal usa um token único por fornecedor, revogável a qualquer momento pelo administrador.",
      "As funções expostas ao portal validam o token, o status do fornecedor e o plano da empresa antes de aceitar uploads.",
      "Restrição de tipos de arquivo aceitos e tamanho máximo aplicada server-side.",
    ],
  },
  {
    icon: Server,
    title: "Pagamentos",
    body: [
      "Pagamentos processados pela Stripe (cartão de crédito e PIX). A Evita HSE não armazena dados de cartão.",
      "Webhooks da Stripe validados por assinatura no servidor.",
      "Alterações de plano são auditadas em histórico interno.",
    ],
  },
  {
    icon: Cookie,
    title: "Cookies e privacidade",
    body: [
      "Usamos armazenamento local do navegador para manter a sessão de login. Não usamos cookies de publicidade.",
      "Não vendemos dados pessoais a terceiros.",
      "Solicitações de exportação ou exclusão de dados podem ser feitas pelo e-mail abaixo.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Resposta a incidentes",
    body: [
      "Suspeitas de incidente de segurança devem ser comunicadas imediatamente para contato@evitahse.com.br.",
      "Após confirmação, notificamos clientes impactados o quanto antes, com escopo, causa raiz e ações corretivas.",
    ],
  },
  {
    icon: Scale,
    title: "Conformidade",
    body: [
      "Operamos buscando aderência à LGPD (Lei Geral de Proteção de Dados).",
      "Esta página descreve controles atualmente habilitados no produto; ela é mantida pela equipe da Evita HSE e não constitui certificação independente.",
    ],
  },
];

export default function Seguranca() {
  usePageTitle("Segurança e Privacidade · Evita HSE");

  return (
    <LandingLayout>
      <section className="relative px-6 lg:px-8 pt-24 pb-16 overflow-hidden">
        <div aria-hidden className="absolute inset-0 lp-mesh-bg pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-lp-emerald/30 bg-lp-emerald/10 text-xs font-medium text-lp-emerald-glow mb-6">
            <Lock className="h-3.5 w-3.5" />
            Segurança & Privacidade
          </div>
          <h1 className="font-lp-display text-4xl md:text-5xl tracking-tight text-lp-ink">
            Como protegemos seus dados de HSE
          </h1>
          <p className="mt-5 text-lp-muted text-lg max-w-2xl mx-auto">
            Esta página é mantida pela equipe da Evita HSE para responder às dúvidas mais comuns de segurança,
            privacidade e operação do produto. Os controles abaixo refletem o que está habilitado hoje na plataforma.
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-5">
          {sections.map(({ icon: Icon, title, body }) => (
            <article key={title} className="lp-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-lp-emerald/10 text-lp-emerald flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-lp-display text-lg text-lp-ink">{title}</h2>
              </div>
              <ul className="space-y-2 text-sm text-lp-muted leading-relaxed">
                {body.map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-lp-emerald mt-2 h-1 w-1 rounded-full bg-current shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-12 lp-card rounded-2xl p-8 text-center">
          <div className="inline-flex h-12 w-12 rounded-xl bg-lp-emerald/10 text-lp-emerald items-center justify-center mb-4">
            <Mail className="h-5 w-5" />
          </div>
          <h2 className="font-lp-display text-xl text-lp-ink mb-2">Fale com a gente sobre segurança</h2>
          <p className="text-sm text-lp-muted mb-5">
            Dúvidas, solicitações relacionadas à LGPD ou relatos de vulnerabilidade podem ser enviados para o e-mail abaixo.
          </p>
          <a
            href="mailto:contato@evitahse.com.br"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-lp-ink text-lp-bg text-sm font-medium hover:bg-lp-emerald transition-colors"
          >
            contato@evitahse.com.br
          </a>
          <p className="text-xs text-lp-muted mt-6">
            Última atualização: junho de 2026. Esta página é conteúdo editorial da Evita HSE e não representa
            certificação independente.
          </p>
          <p className="text-xs text-lp-muted mt-3">
            Veja também a <Link to="/faq" className="underline hover:text-lp-ink">FAQ</Link>.
          </p>
        </div>
      </section>
    </LandingLayout>
  );
}