import { usePageTitle } from "@/hooks/usePageTitle";
import { LegalPage, LegalSection } from "@/components/landing/LegalPage";
import { LEGAL_ENTITY } from "@/content/legal";

const rows = [
  {
    name: "Supabase",
    purpose: "Banco de dados, autenticação, armazenamento de arquivos e funções de servidor.",
    data: "Dados de conta e dados operacionais inseridos pelo cliente.",
    location: "Estados Unidos / infraestrutura em nuvem",
  },
  {
    name: "Lovable",
    purpose: "Hospedagem e entrega da aplicação web.",
    data: "Registros técnicos de acesso.",
    location: "Estados Unidos / CDN global",
  },
  {
    name: "Stripe",
    purpose: "Processamento de pagamentos e gestão de assinaturas.",
    data: "Dados de faturamento e identificadores de cliente. Dados de cartão são tratados apenas pela Stripe.",
    location: "Estados Unidos / Irlanda",
  },
  {
    name: "Provedor de e-mail transacional",
    purpose: "Envio de convites, recuperação de senha e alertas.",
    data: "Nome e e-mail dos usuários.",
    location: "Estados Unidos / União Europeia",
  },
];

export default function Subprocessadores() {
  usePageTitle("Subprocessadores — Evita HSE", {
    description:
      "Lista de subprocessadores do Evita HSE: infraestrutura em nuvem, processamento de pagamentos e envio de e-mails transacionais.",
  });

  return (
    <LegalPage
      eyebrow="Transparência"
      title="Subprocessadores"
      intro="Terceiros que tratam dados em nome do Evita HSE para viabilizar a operação da plataforma. Toda contratação segue o limite da finalidade descrita na Política de Privacidade."
    >
      <LegalSection title="Lista atual">
        <div className="overflow-x-auto rounded-xl border border-lp-border">
          <table className="w-full text-sm">
            <thead className="bg-lp-surface text-lp-ink">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Subprocessador</th>
                <th className="text-left font-semibold px-4 py-3">Finalidade</th>
                <th className="text-left font-semibold px-4 py-3">Dados tratados</th>
                <th className="text-left font-semibold px-4 py-3">Local</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-t border-lp-border align-top">
                  <td className="px-4 py-3 text-lp-ink font-medium whitespace-nowrap">{r.name}</td>
                  <td className="px-4 py-3">{r.purpose}</td>
                  <td className="px-4 py-3">{r.data}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="Transferência internacional">
        <p>
          Parte dos subprocessadores opera fora do Brasil. As transferências ocorrem com base em cláusulas contratuais e
          nas hipóteses do art. 33 da LGPD, limitadas ao necessário para a prestação do serviço.
        </p>
      </LegalSection>

      <LegalSection title="Mudanças na lista">
        <p>
          Alterações relevantes serão publicadas nesta página. Para receber aviso prévio de inclusão de novos
          subprocessadores, escreva para{" "}
          <a className="text-lp-emerald hover:underline" href={`mailto:${LEGAL_ENTITY.supportEmail}`}>
            {LEGAL_ENTITY.supportEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}