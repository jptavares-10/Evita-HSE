import { usePageTitle } from "@/hooks/usePageTitle";
import { LegalPage, LegalSection, LegalList, PendingBadge } from "@/components/landing/LegalPage";
import { LEGAL_ENTITY, RETENTION, isPending } from "@/content/legal";

const Entity = ({ value, label }: { value: string; label: string }) =>
  isPending(value) ? <PendingBadge label={label} /> : <>{value}</>;

export default function Privacidade() {
  usePageTitle("Política de Privacidade (LGPD) — Evita HSE", {
    description:
      "Política de Privacidade do Evita HSE conforme a LGPD: dados coletados, finalidade, base legal, retenção, direitos do titular e canal do encarregado.",
  });

  return (
    <LegalPage
      eyebrow="LGPD"
      title="Política de Privacidade"
      intro="Como o Evita HSE trata dados pessoais, com que finalidade, sob qual base legal, por quanto tempo e como exercer seus direitos como titular, conforme a Lei nº 13.709/2018 (LGPD)."
    >
      <LegalSection title="1. Controlador e operador">
        <p>
          Em relação aos dados de cadastro e faturamento dos seus clientes, o Evita HSE atua como{" "}
          <strong className="text-lp-ink">controlador</strong>. Em relação aos dados que a empresa cliente insere na
          plataforma (colaboradores, exames, treinamentos, entregas de EPI, incidentes), o Evita HSE atua como{" "}
          <strong className="text-lp-ink">operador</strong>, e a empresa contratante é a controladora.
        </p>
        <p>
          Identificação do controlador: <Entity value={LEGAL_ENTITY.legalName} label="razão social a definir" />, CNPJ{" "}
          <Entity value={LEGAL_ENTITY.cnpj} label="CNPJ a definir" />, sede em{" "}
          <Entity value={LEGAL_ENTITY.address} label="endereço a definir" />.
        </p>
      </LegalSection>

      <LegalSection title="2. Dados tratados">
        <LegalList
          items={[
            "Dados de conta: nome, e-mail corporativo, cargo/papel, empresa, CNPJ e segmento.",
            "Dados de faturamento: plano contratado, histórico de assinatura e identificadores do provedor de pagamentos.",
            "Dados operacionais inseridos pelo cliente: colaboradores, setores e cargos, registros de treinamento, exames ocupacionais (ASO), entregas e assinaturas de EPI, inspeções, incidentes, resíduos (MTR), licenças ambientais, documentos e fornecedores.",
            "Dados técnicos: registros de acesso, data e hora de operações e identificadores de sessão, para segurança e auditoria.",
          ]}
        />
        <p>
          Registros de saúde ocupacional (ASO, atestados, dias de afastamento) são{" "}
          <strong className="text-lp-ink">dados pessoais sensíveis</strong> e recebem controles adicionais: armazenamento
          em buckets privados, acesso somente por URLs temporárias assinadas e restrição por papel e módulo.
        </p>
      </LegalSection>

      <LegalSection title="3. Finalidades e bases legais">
        <LegalList
          items={[
            "Execução do contrato (art. 7º, V): criação de conta, prestação do serviço, suporte e cobrança.",
            "Cumprimento de obrigação legal ou regulatória (art. 7º, II e art. 11, II 'a'): guarda de documentos exigidos por Normas Regulamentadoras, legislação ambiental e obrigações fiscais.",
            "Legítimo interesse (art. 7º, IX): segurança da informação, prevenção a fraudes, métricas agregadas de uso e melhoria do produto.",
            "Consentimento (art. 7º, I): comunicações de marketing, revogáveis a qualquer momento.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Compartilhamento">
        <p>
          Os dados são compartilhados apenas com subprocessadores necessários à operação (infraestrutura em nuvem,
          processamento de pagamentos e envio de e-mails transacionais), sempre sob contrato e no limite da finalidade.
          A lista está disponível na página de{" "}
          <a className="text-lp-emerald hover:underline" href="/subprocessadores">subprocessadores</a>. Não vendemos,
          alugamos ou cedemos dados pessoais a terceiros.
        </p>
      </LegalSection>

      <LegalSection title="5. Prazos de retenção">
        <LegalList
          items={[
            `Dados da conta e dados operacionais: mantidos enquanto a conta estiver ativa e excluídos em até ${RETENTION.accountDays} dias após o cancelamento ou pedido de exclusão. Esse prazo existe para permitir reativação e exportação final pelo cliente.`,
            `Registros fiscais e de faturamento: ${RETENTION.billingYears} anos, por obrigação legal.`,
            `Registros técnicos de acesso: ${RETENTION.accessLogsMonths} meses, conforme o art. 15 do Marco Civil da Internet.`,
            "Documentos de SST cuja guarda mínima é fixada em norma (por exemplo, prontuários e registros de saúde ocupacional) permanecem sob responsabilidade do cliente controlador, que deve exportá-los antes da exclusão da conta.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Direitos do titular">
        <LegalList
          items={[
            "Confirmação de tratamento e acesso aos dados.",
            "Correção de dados incompletos, inexatos ou desatualizados.",
            "Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos.",
            "Portabilidade — exportação disponível diretamente no painel, em Minha Empresa.",
            "Informação sobre compartilhamento e sobre a possibilidade de não consentir.",
            "Revogação do consentimento, quando essa for a base legal aplicada.",
          ]}
        />
        <p>
          Pedidos são respondidos em até 15 dias. Se você é colaborador de uma empresa cliente, direcione o pedido ao
          controlador (seu empregador); atuamos como operador e o encaminhamos a ele.
        </p>
      </LegalSection>

      <LegalSection title="7. Segurança">
        <p>
          Aplicamos isolamento lógico por empresa (Row Level Security), armazenamento privado com URLs assinadas de curta
          duração, criptografia em trânsito, controle de acesso por papel e permissão por módulo, e registro de autoria
          nas operações. Detalhes na página de{" "}
          <a className="text-lp-emerald hover:underline" href="/seguranca-da-informacao">segurança da informação</a>.
        </p>
      </LegalSection>

      <LegalSection title="8. Incidentes de segurança">
        <p>
          Incidentes com risco relevante aos titulares serão comunicados ao cliente controlador e, quando aplicável, à
          ANPD, com descrição dos dados afetados, medidas adotadas e recomendações de mitigação.
        </p>
      </LegalSection>

      <LegalSection title="9. Encarregado (DPO)">
        <p>
          Encarregado: <Entity value={LEGAL_ENTITY.dpoName} label="nome do encarregado a definir" /> — contato:{" "}
          {isPending(LEGAL_ENTITY.dpoEmail) ? (
            <PendingBadge label="e-mail do encarregado a definir" />
          ) : (
            <a className="text-lp-emerald hover:underline" href={`mailto:${LEGAL_ENTITY.dpoEmail}`}>
              {LEGAL_ENTITY.dpoEmail}
            </a>
          )}
          . Até a designação formal, os pedidos podem ser enviados para{" "}
          <a className="text-lp-emerald hover:underline" href={`mailto:${LEGAL_ENTITY.supportEmail}`}>
            {LEGAL_ENTITY.supportEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}