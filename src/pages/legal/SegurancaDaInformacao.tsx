import { usePageTitle } from "@/hooks/usePageTitle";
import { LegalPage, LegalSection, LegalList } from "@/components/landing/LegalPage";
import { LEGAL_ENTITY, RETENTION } from "@/content/legal";

export default function SegurancaDaInformacao() {
  usePageTitle("Segurança da Informação — Evita HSE", {
    description:
      "Práticas de segurança do Evita HSE: isolamento por empresa, buckets privados, URLs assinadas, papéis de acesso e permissões por módulo.",
  });

  return (
    <LegalPage
      eyebrow="Confiança"
      title="Segurança da Informação"
      intro="As práticas técnicas que aplicamos para manter os dados de cada empresa isolados, os arquivos protegidos e cada operação rastreável. Este documento descreve controles implementados no produto — não é um certificado de auditoria externa."
    >
      <LegalSection title="Isolamento entre empresas">
        <LegalList
          items={[
            "Cada registro carrega o identificador da empresa e é filtrado no banco por políticas de Row Level Security — a separação não depende do código da interface.",
            "As consultas rodam sempre no contexto do usuário autenticado; não há chave administrativa no navegador.",
            "Arquivos são gravados em pastas nomeadas pela empresa, com validação do caminho na própria política de acesso.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Armazenamento de arquivos">
        <LegalList
          items={[
            "Todos os buckets de documentos são privados: não existe URL pública permanente.",
            "O acesso ocorre por URL assinada temporária, gerada sob demanda e com validade de 1 hora.",
            "Limite de tamanho por arquivo e validação de tipo no envio, incluindo os envios feitos por fornecedores externos.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Papéis e permissões">
        <LegalList
          items={[
            "Dois papéis de conta: administrador (gestão de usuários, empresa e assinatura) e membro.",
            "Permissão por módulo em dois níveis: Editor (cria e altera) e Visualizador (somente leitura).",
            "Papéis e permissões são armazenados em tabela própria e verificados no servidor por funções de segurança — não em armazenamento do navegador.",
            "Operações relevantes registram autoria e data para auditoria.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Acesso de terceiros">
        <LegalList
          items={[
            "O portal de fornecedores funciona por token único por fornecedor, sem criar conta e sem acesso a qualquer outro dado da empresa.",
            "O token pode ser desativado pelo cliente a qualquer momento, encerrando o acesso imediatamente.",
            "Integrações de agentes (MCP/API) exigem autorização explícita do usuário e respeitam as mesmas regras de isolamento e permissão.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Infraestrutura e continuidade">
        <LegalList
          items={[
            "Infraestrutura gerenciada em nuvem, com criptografia em trânsito (TLS) e em repouso no provedor.",
            "Backups automáticos gerenciados pelo provedor de banco de dados.",
            "Cabeçalhos de segurança HTTP aplicados na aplicação web.",
            `Registros técnicos de acesso mantidos por ${RETENTION.accessLogsMonths} meses.`,
          ]}
        />
      </LegalSection>

      <LegalSection title="Reporte de vulnerabilidades">
        <p>
          Encontrou uma falha? Escreva para{" "}
          <a className="text-lp-emerald hover:underline" href={`mailto:${LEGAL_ENTITY.supportEmail}`}>
            {LEGAL_ENTITY.supportEmail}
          </a>{" "}
          com a descrição técnica e os passos de reprodução. Pedimos que não explore dados de terceiros e que aguarde
          nossa confirmação antes de qualquer divulgação pública.
        </p>
      </LegalSection>
    </LegalPage>
  );
}