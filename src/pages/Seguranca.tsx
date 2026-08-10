import { Link } from "react-router-dom";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { usePageTitle } from "@/hooks/usePageTitle";

const sections = [
  {
    eyebrow: "Acesso",
    title: "Só entra quem foi convidado.",
    body: [
      "Login com e-mail e senha gerenciado pelo Supabase Auth. Tokens de sessão JWT armazenados em sessionStorage e renovados automaticamente.",
      "Convites para novos usuários são enviados por link com token de uso único e validade limitada.",
      "Recuperação de senha por e-mail com link expirável.",
    ],
  },
  {
    eyebrow: "Isolamento",
    title: "Cada empresa em sua própria fronteira.",
    body: [
      "Toda informação é isolada por empresa (company_id) por meio de Row-Level Security no banco de dados.",
      "Permissões granulares por módulo (Editor / Visualizador) podem ser definidas pelo administrador.",
      "Administradores não podem remover a si mesmos; ações sensíveis exigem checagem server-side.",
    ],
  },
  {
    eyebrow: "Dados",
    title: "Criptografado em repouso e em trânsito.",
    body: [
      "Banco de dados PostgreSQL gerenciado pelo Supabase, hospedado em infraestrutura com criptografia em repouso.",
      "Tráfego entre o seu navegador e a aplicação trafega sob HTTPS (TLS).",
      "Arquivos sensíveis (ASO, MTR, certificados, licenças, documentos) ficam em buckets privados acessíveis apenas por URLs assinadas de curta duração (1 hora).",
    ],
  },
  {
    eyebrow: "Arquivos",
    title: "Documento fechado, acesso por hora.",
    body: [
      "Limite global de 20 MB por arquivo.",
      "Buckets privados isolam os arquivos por pasta de empresa; somente membros autenticados da empresa têm acesso.",
      "Logos e avatares ficam em buckets públicos para exibição rápida no produto, sem listagem aberta de conteúdo.",
    ],
  },
  {
    eyebrow: "Portal",
    title: "Token do fornecedor revogável a qualquer momento.",
    body: [
      "O acesso anônimo do portal usa um token único por fornecedor, revogável a qualquer momento pelo administrador.",
      "As funções expostas ao portal validam o token, o status do fornecedor e o plano da empresa antes de aceitar uploads.",
      "Restrição de tipos de arquivo aceitos e tamanho máximo aplicada server-side.",
    ],
  },
  {
    eyebrow: "Pagamentos",
    title: "Nenhum dado de cartão passa por nós.",
    body: [
      "Pagamentos processados pela Stripe (cartão de crédito e PIX). A Evita HSE não armazena dados de cartão.",
      "Webhooks da Stripe validados por assinatura no servidor.",
      "Alterações de plano são auditadas em histórico interno.",
    ],
  },
  {
    eyebrow: "Privacidade",
    title: "Sem rastreamento publicitário.",
    body: [
      "Usamos armazenamento local do navegador para manter a sessão de login. Não usamos cookies de publicidade.",
      "Não vendemos dados pessoais a terceiros.",
      "Solicitações de exportação ou exclusão de dados podem ser feitas pelo e-mail abaixo.",
    ],
  },
  {
    eyebrow: "Resposta",
    title: "Incidente comunicado, não escondido.",
    body: [
      "Suspeitas de incidente de segurança devem ser comunicadas imediatamente para contato@evitahse.com.br.",
      "Após confirmação, notificamos clientes impactados o quanto antes, com escopo, causa raiz e ações corretivas.",
    ],
  },
  {
    eyebrow: "Conformidade",
    title: "Aderência à LGPD, sem promessa vazia.",
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
          <p className="lp-eyebrow !flex justify-center mb-6">Segurança & Privacidade</p>
          <h1 className="font-lp-display text-4xl md:text-5xl font-semibold tracking-tight text-lp-ink leading-[1.1]">
            Seus dados de HSE são sensíveis. Tratamos como tal.
          </h1>
          <p className="mt-5 text-lp-muted text-lg max-w-2xl mx-auto">
            Esta página é mantida pela equipe da Evita HSE para responder às dúvidas mais comuns de segurança,
            privacidade e operação do produto. Os controles abaixo refletem o que está habilitado hoje na plataforma.
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-5 items-start">
          {sections.map(({ eyebrow, title, body }, idx) => (
            <article key={title} className={`group lp-card-bold rounded-[1.5rem] p-7 ${idx % 2 === 1 ? "md:mt-8" : ""}`}>
              <span aria-hidden className="lp-numeral font-lp-display text-[4.5rem]">{String(idx + 1).padStart(2, "0")}</span>
              <span className="lp-eyebrow relative">{eyebrow}</span>
              <h2 className="relative font-lp-display text-xl font-semibold text-lp-ink mt-4 mb-4 leading-snug">{title}</h2>
              <ul className="relative space-y-2.5 text-sm text-lp-muted leading-relaxed">
                {body.map((line, i) => (
                  <li key={i} className="lp-tick">{line}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-16 lp-card-bold rounded-[1.5rem] p-9 text-center">
          <p className="lp-eyebrow !flex justify-center mb-5">Contato direto</p>
          <h2 className="font-lp-display text-2xl font-semibold text-lp-ink mb-2">Encontrou algo? Queremos saber antes de todos.</h2>
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