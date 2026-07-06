
## 1) Fix: duplicate "IC & NC" no sidebar

Em `src/components/AppSidebar.tsx` (linhas 394-395) existem dois `SidebarItem` idênticos para `/incidentes`. Remover a segunda ocorrência (linha 395). Mantém apenas: `SidebarItem to="/incidentes" ... active={path.startsWith("/incidentes")}` para que a página de Lições Aprendidas (`/incidentes/licoes-aprendidas`) também destaque o item.

## 2) Entrega de EPI com assinatura digital no tablet (Nível 1)

Objetivo: substituir a foto do comprovante por uma assinatura desenhada no próprio tablet, com trilha de auditoria e PDF gerado automaticamente.

### Fluxo do usuário (almoxarife com tablet)
1. Almoxarife abre "EPI → Entregas → Nova Entrega".
2. Seleciona EPI, colaborador, quantidade, motivo.
3. Clica em **"Coletar assinatura"** → abre modal em tela cheia (modo quiosque).
4. Colaborador vê resumo (nome, EPI, CA, quantidade, data) + termo curto de ciência.
5. Colaborador assina no canvas com o dedo. Botões: **Limpar** / **Confirmar**.
6. Ao confirmar, o sistema:
   - Salva PNG da assinatura no storage privado.
   - Gera **PDF** com dados + assinatura + hash + trilha.
   - Grava metadados de auditoria no banco.
7. Volta pro drawer, mostra "✔ Assinatura coletada" e salva a entrega.

### Modo Quiosque
- Modal fullscreen com `requestFullscreen()`.
- Bloqueia navegação (nenhum link/menu visível durante a coleta).
- Layout otimizado para toque: fontes grandes, botões grandes, canvas ocupando ~60% da tela em landscape.
- Sai só via botão "Cancelar" (requer confirmação) ou "Confirmar".

### Schema (migration)

Estender `epi_deliveries` (não criar tabela nova — a entrega já existe):

```
ALTER TABLE public.epi_deliveries ADD COLUMN
  signature_url text,           -- caminho no storage (PNG da assinatura)
  signature_pdf_url text,       -- caminho do PDF assinado
  signature_hash text,          -- SHA-256 dos dados assinados
  signed_at timestamptz,        -- momento da assinatura
  signed_ip text,               -- IP capturado no cliente (best-effort)
  signed_user_agent text,       -- navegador/dispositivo
  signed_by_profile uuid        -- profile do almoxarife que coletou
    REFERENCES public.profiles(id) ON DELETE SET NULL;
```

Bucket privado `epi-signatures` (20MB, private, RLS por `company_id/<delivery_id>/...`). Signed URLs 1h para exibir/baixar.

### Componentes novos
- `src/components/epi/SignatureKioskModal.tsx` — modal fullscreen com canvas de assinatura (usando `react-signature-canvas` — leve, testado), resumo de ciência, e handlers Limpar/Confirmar/Cancelar.
- `src/lib/epi-signature.ts` — utilitários:
  - `dataUrlToBlob(pngDataUrl)`
  - `computeHash(payload)` (SHA-256 via `crypto.subtle`)
  - `buildDeliveryPdf({ company, employee, epi, quantity, reason, deliveredAt, signaturePng, hash, signedAt, signedBy })` usando `jspdf`.
- `src/lib/epi-signature-fingerprint.ts` — coleta IP (via `https://api.ipify.org` best-effort, silencioso em falha) e user-agent.

### Componentes editados
- `src/components/epi/DeliveryDrawer.tsx`:
  - Substituir a seção "Comprovante de entrega (foto)" por bloco **"Assinatura do colaborador"** com botão "Coletar assinatura".
  - Após confirmação do kiosque, guardar em estado local: `signaturePng`, `signatureHash`, `signedAt`, `signedIp`, `signedUserAgent`, `pdfBlob`.
  - Manter opção "Pular assinatura" (com aviso) apenas para admin — colaboradores sem assinatura ficam marcados como "pendente de assinatura" na listagem.
  - No submit: enviar tudo pro hook.
- `src/hooks/useEpi.ts` (`useSaveDelivery`):
  - Fazer upload da assinatura PNG e do PDF no bucket `epi-signatures`.
  - Popular novos campos na insert.
- `src/pages/EpiEntregas.tsx` e `src/components/epi/EpiFichaDrawer.tsx`:
  - Nova coluna/badge "Assinatura" (✔ assinada / ⚠ pendente).
  - Botão "Baixar PDF assinado" (signed URL do PDF).

### PDF gerado (uma página A4)
- Cabeçalho: logo da empresa + "Ficha de Entrega de EPI".
- Dados: empresa/CNPJ, colaborador, cargo, setor, data.
- Tabela: EPI, CA, quantidade, motivo.
- Termo de ciência (parágrafo curto NR-6).
- Assinatura (imagem PNG) + nome legível + data/hora.
- Rodapé: hash SHA-256 + IP + user-agent + ID da entrega (trilha de auditoria).

### Dependências novas
- `react-signature-canvas` (canvas de assinatura)
- `jspdf` (geração de PDF client-side)

### Segurança / RLS
- Bucket `epi-signatures` privado, RLS espelhando o padrão existente (`company_id` no primeiro segmento do path).
- PDFs e PNGs só acessíveis via signed URL (1h) para membros da mesma company.
- Hash calculado sobre `{delivery_id, employee_id, epi_type_id, quantity, delivered_at, signed_at}` para provar integridade.

### Plano de rollout
1. Migration + bucket.
2. Componentes/hook.
3. Ajuste UI (drawer, listagem, ficha).
4. Manter compat: entregas antigas (sem assinatura) continuam visíveis com badge "sem assinatura".
5. Correção do sidebar duplicado (item independente e trivial).

### Fora do escopo (fica para próxima fase)
- Nível 2 (link por e-mail/OTP).
- ICP-Brasil / integração Clicksign/D4Sign.
- Assinatura em listas de treinamento e APR (mesmo motor será reutilizável depois).
