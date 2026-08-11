/**
 * Dados jurídicos do controlador.
 *
 * ⚠️ SUBSTITUIR quando as informações oficiais forem definidas.
 * Basta editar as strings abaixo — todas as páginas legais
 * (/termos, /privacidade, /seguranca-da-informacao, /subprocessadores)
 * e o rodapé leem daqui.
 */
export const PENDING = "[a definir]";

export const LEGAL_ENTITY = {
  tradeName: "Evita HSE",
  legalName: PENDING, // razão social
  cnpj: PENDING,
  address: PENDING, // endereço completo (rua, nº, cidade, UF, CEP)
  supportEmail: "contato@evitahse.com.br",
  dpoName: PENDING, // nome do encarregado (DPO)
  dpoEmail: PENDING, // e-mail do encarregado (DPO)
};

export const LEGAL_VERSION = "1.0";
export const LEGAL_UPDATED_AT = "11 de agosto de 2026";

/** Prazos de retenção aplicados pelo produto. */
export const RETENTION = {
  /** Dados da conta após cancelamento/exclusão. */
  accountDays: 90,
  /** Registros fiscais e de faturamento (obrigação legal). */
  billingYears: 5,
  /** Logs técnicos de acesso (Marco Civil da Internet, art. 15). */
  accessLogsMonths: 6,
};

export const isPending = (value: string) => value === PENDING;