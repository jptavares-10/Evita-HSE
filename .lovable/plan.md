
## Objetivo

1. Renomear em toda a UI o conceito de "Comprovante" (upload da ficha em papel já assinada) para **"Ficha Física"**.
2. Adicionar um botão **"Exportar Ficha de EPI (PDF)"** na ficha do colaborador que gera um PDF único, no formato exigido pela NR-6, contendo:
   - Dados da empresa e do colaborador (cargo, setor, admissão se disponível).
   - Termo de responsabilidade da NR-6 e CLT art. 158.
   - Tabela cronológica de todas as entregas (data, EPI, CA, quantidade, motivo).
   - Coluna/linha de **assinatura por entrega** — usa a assinatura digital coletada no tablet quando existir, senão deixa o campo em branco para assinatura manual.
   - Rodapé de auditoria (data de geração, empresa, colaborador, total de entregas, hash da última assinatura quando houver).

## Mudanças

### 1. Renomear "Comprovante" → "Ficha Física"
Ajustar strings (sem mudar schema; `attachment_url` continua sendo a coluna, só muda o rótulo):

- `src/components/epi/AddAttachmentModal.tsx`
  - Título: "Adicionar Ficha Física"
  - Label: "Foto da ficha de EPI assinada pelo colaborador"
  - Toast: "Ficha física adicionada"
- `src/pages/EpiEntregas.tsx`
  - Header da coluna: "Ficha física"
  - Botão inline: "Adicionar ficha"
- `src/components/epi/EpiFichaDrawer.tsx`
  - Link "Adicionar comprovante" → "Adicionar ficha física"
  - Alt das imagens: "Ficha física de entrega de EPI"

### 2. Nova exportação "Ficha de EPI (PDF)"

**Novo arquivo:** `src/lib/epi-ficha-pdf.ts`
- Função `buildEmployeeEpiFichaPdf({ company, employee, deliveries, signedMap })` → `Blob`.
- Layout A4 com `jspdf` (já instalado):
  - **Cabeçalho:** logo (se `company.logo_url`), nome/CNPJ da empresa, título "Ficha de Controle de EPI — NR-6".
  - **Bloco Colaborador:** nome, cargo, setor.
  - **Termo NR-6:** texto padrão de ciência e responsabilidade (mesmo já usado em `epi-signature.ts`, adaptado para lista de entregas).
  - **Tabela de entregas** com colunas: Data, EPI, CA, Qtd, Motivo, Assinatura.
     - Se a entrega tem `signature_url` (PNG assinado no tablet), embutir a imagem redimensionada dentro da célula "Assinatura".
     - Se não tem, desenhar linha tracejada para assinatura manual.
  - Quebra de página automática (repetir cabeçalho da tabela em cada página).
  - **Rodapé:** "Documento gerado em {data} — {n} entregas registradas — Sistema Evita HSE".
- Reutilizar `fetchClientIp`/hash não é necessário aqui (é um consolidado, não uma nova assinatura).

**Alterações em `src/components/epi/EpiFichaDrawer.tsx`:**
- Adicionar botão secundário no header (ao lado do "Nova entrega") ou como ação: **"Exportar Ficha PDF"** com ícone `FileDown`.
- Ao clicar:
  1. Resolver signed URLs de todas as assinaturas do bucket `epi-signatures` para as entregas (usando `getSignedUrls`).
  2. Baixar cada PNG como dataURL (fetch + FileReader) para embutir no PDF.
  3. Chamar `buildEmployeeEpiFichaPdf` e disparar download via `URL.createObjectURL` com nome `ficha-epi-{colaborador}-{yyyymmdd}.pdf`.
- Estado local `exporting` para desabilitar o botão durante geração.

### 3. Detalhes técnicos

- Manter o botão "Adicionar Ficha Física" (upload da versão assinada em papel) — os dois fluxos coexistem: assinatura digital no tablet (Nível 2) e upload da ficha física escaneada (Nível 1 legado).
- Nenhuma mudança de schema, RLS ou edge function.
- Sem novas dependências (jspdf já está no projeto).

## Fora de escopo
- Não altero fluxo de assinatura digital nem o `SignatureKioskModal`.
- Não crio nova coluna no banco; apenas renomeações de UI + novo utilitário PDF.
