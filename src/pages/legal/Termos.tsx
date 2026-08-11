import { usePageTitle } from "@/hooks/usePageTitle";
import { LegalPage, LegalSection, LegalList, PendingBadge } from "@/components/landing/LegalPage";
import { LEGAL_ENTITY, RETENTION, isPending } from "@/content/legal";

const Entity = ({ value, label }: { value: string; label: string }) =>
  isPending(value) ? <PendingBadge label={label} /> : <>{value}</>;

export default function Termos() {
  usePageTitle("Termos de Uso — Evita HSE", {
    description:
      "Termos de Uso do Evita HSE: assinatura, planos, cancelamento, limites de uso e propriedade dos dados do cliente.",
  });

  return (
    <LegalPage
      eyebrow="Legal"
      title="Termos de Uso"
      intro="Estes Termos regulam o uso da plataforma Evita HSE, contratada em modelo de assinatura (SaaS). Ao criar uma conta, você declara ter lido e aceitado estas condições."
    >
      <LegalSection title="1. Quem somos">
        <p>
          A plataforma Evita HSE é operada por <Entity value={LEGAL_ENTITY.legalName} label="razão social a definir" />,
          inscrita no CNPJ <Entity value={LEGAL_ENTITY.cnpj} label="CNPJ a definir" />, com sede em{" "}
          <Entity value={LEGAL_ENTITY.address} label="endereço a definir" /> (doravante "Evita HSE").
        </p>
        <p>
          Contato oficial: <a className="text-lp-emerald hover:underline" href={`mailto:${LEGAL_ENTITY.supportEmail}`}>{LEGAL_ENTITY.supportEmail}</a>.
        </p>
      </LegalSection>

      <LegalSection title="2. Objeto do contrato">
        <p>
          O Evita HSE concede ao cliente uma licença de uso não exclusiva, intransferível e por prazo determinado à
          assinatura vigente, para acesso à plataforma de gestão de Saúde, Segurança do Trabalho e Meio Ambiente. A
          plataforma é um instrumento de organização e controle documental: não substitui laudos, pareceres técnicos,
          responsabilidade profissional ou obrigações legais do cliente.
        </p>
      </LegalSection>

      <LegalSection title="3. Conta, cadastro e responsabilidade de acesso">
        <LegalList
          items={[
            "O cliente é responsável pela veracidade dos dados cadastrais informados.",
            "Cada usuário deve ter credenciais individuais; o compartilhamento de senha é vedado.",
            "O administrador da conta é responsável por conceder, revisar e revogar acessos e permissões por módulo.",
            "O cliente deve comunicar imediatamente qualquer suspeita de uso indevido de credenciais.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Planos, limites de uso e assinatura">
        <LegalList
          items={[
            "Os planos disponíveis (Starter, Professional e Enterprise) definem os módulos liberados, o número máximo de usuários e o volume de armazenamento contratado.",
            "O período de teste gratuito é de 14 dias, sem necessidade de cartão de crédito.",
            "Encerrado o teste ou vencida a assinatura, a conta entra em modo somente leitura por um período de tolerância, sem exclusão imediata dos dados.",
            "Excedidos os limites do plano (usuários ou armazenamento), novas inclusões são bloqueadas até o upgrade.",
            "A cobrança é recorrente (mensal ou anual) e processada por provedor de pagamentos externo; o Evita HSE não armazena dados completos de cartão.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Cancelamento e reembolso">
        <LegalList
          items={[
            "A assinatura pode ser cancelada a qualquer momento pelo próprio painel, sem multa contratual.",
            "O cancelamento interrompe as cobranças futuras e o acesso permanece disponível até o fim do ciclo já pago.",
            "Não há reembolso proporcional de valores já pagos, inclusive no plano anual — o serviço permanece disponível até o término do período contratado.",
            "Direito de arrependimento: contratações realizadas fora do estabelecimento comercial podem ser desfeitas em até 7 dias corridos, conforme art. 49 do Código de Defesa do Consumidor, quando aplicável.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Propriedade dos dados do cliente">
        <p>
          Todos os dados, documentos e arquivos inseridos na plataforma são de titularidade exclusiva do cliente. O
          Evita HSE atua como operador desses dados e os utiliza apenas para prestar o serviço contratado. Não há
          comercialização, cessão ou uso dos dados do cliente para treinamento de modelos ou finalidades próprias.
        </p>
        <p>
          O cliente pode exportar seus dados a qualquer momento pelo painel (portabilidade) e solicitar a exclusão
          definitiva da conta. Após a solicitação de exclusão, os dados operacionais são removidos em até{" "}
          {RETENTION.accountDays} dias, ressalvados registros fiscais mantidos por {RETENTION.billingYears} anos por
          obrigação legal.
        </p>
      </LegalSection>

      <LegalSection title="7. Propriedade intelectual da plataforma">
        <p>
          Código, interface, marca, identidade visual e documentação do Evita HSE são de propriedade da Evita HSE. É
          vedada a engenharia reversa, a revenda, o sublicenciamento ou a reprodução da plataforma sem autorização
          expressa.
        </p>
      </LegalSection>

      <LegalSection title="8. Uso adequado">
        <LegalList
          items={[
            "É proibido inserir conteúdo ilícito, malware ou dados de terceiros sem base legal.",
            "É proibido tentar burlar controles de acesso, isolamento entre empresas ou limites do plano.",
            "É proibido realizar testes de carga, varreduras ou automações que degradem o serviço sem autorização prévia.",
          ]}
        />
      </LegalSection>

      <LegalSection title="9. Disponibilidade e suporte">
        <p>
          O serviço é prestado em regime de melhor esforço, com infraestrutura em nuvem redundante. Podem ocorrer
          janelas de manutenção programada, comunicadas quando houver impacto relevante. O prazo de resposta do suporte
          varia conforme o plano contratado.
        </p>
      </LegalSection>

      <LegalSection title="10. Limitação de responsabilidade">
        <p>
          O Evita HSE não responde por sanções administrativas, autuações, acidentes ou perdas decorrentes de dados
          incorretos, incompletos ou desatualizados inseridos pelo cliente, nem por decisões técnicas tomadas com base
          neles. A responsabilidade total, quando cabível, limita-se ao valor pago nos 12 meses anteriores ao evento.
        </p>
      </LegalSection>

      <LegalSection title="11. Alterações destes Termos">
        <p>
          Alterações relevantes serão comunicadas por e-mail e/ou aviso na plataforma com antecedência razoável. O uso
          continuado após a vigência implica aceitação da nova versão.
        </p>
      </LegalSection>

      <LegalSection title="12. Foro e legislação aplicável">
        <p>
          Aplica-se a legislação brasileira. Fica eleito o foro da comarca de{" "}
          <Entity value={LEGAL_ENTITY.address} label="comarca a definir" /> para dirimir controvérsias, salvo regra
          consumerista mais favorável ao cliente.
        </p>
      </LegalSection>
    </LegalPage>
  );
}