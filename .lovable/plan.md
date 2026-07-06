
# Inspeções de Campo — Reestruturação para Uso Legal em Campo

## Objetivo
Transformar o módulo atual (checklist em PDF anexado no desktop) em uma **inspeção estruturada, executada no celular/tablet, offline, com evidências georreferenciadas, rastreável por ativo (QR Code) e fechada com assinatura digital do responsável técnico** — de modo a ter valor probatório em auditorias do MTE, perícias e ações trabalhistas.

## Diagnóstico do que já existe
- `inspection_models` (checklist "cabeçalho": nome, NR, setor, frequência, documento vinculado)
- `inspection_executions` (uma ocorrência da inspeção, com prazo e status)
- `inspection_entries` (registros com foto/PDF genéricos, sem itens estruturados)
- `inspection_corrective_actions` (5W2H com evidência)
- Bucket `inspection-files` privado
- Sem itens de checklist, sem ativos, sem QR, sem GPS, sem assinatura, sem PWA/offline

## O que muda estruturalmente

### 1. Checklist estruturado (item a item), não mais só "upload de PDF"
Um modelo passa a ter **itens** obrigatórios/opcionais, com tipo de resposta e critério de conformidade. É o que dá lastro legal — o auditor precisa ver o que foi verificado, não só que "algo foi verificado".

Novas tabelas:
- `inspection_checklist_items` — item do modelo: `order`, `question`, `response_type` (yes_no / yes_no_na / scale / numeric / text / photo_required), `is_critical` (bool — reprova a inspeção inteira se não conforme), `reference` (ex: "NR-12 item 12.38"), `expected_answer`.
- `inspection_execution_answers` — resposta por item numa execução: `answer_value`, `is_conformant`, `photo_urls[]`, `note`, `location_lat/lng/accuracy`, `answered_at`, `answered_by`.

### 2. Ativos (asset registry) + QR Code
Adesivo no extintor / máquina / EPC → escaneia → já abre o checklist certo daquele ativo, com histórico.

Novas tabelas:
- `inspection_assets` — `tag_code` (único, curto: `EXT-042`), `name`, `type` (extintor, máquina, andaime, saída de emergência, veículo…), `sector_id`, `location_description`, `qr_token` (uuid opaco usado na URL), `status`, `metadata` (jsonb — ex: capacidade extintor, número série).
- `inspection_model_asset_types` — quais tipos de ativo cada modelo cobre (permite "checklist NR-23 extintor" → todos os ativos type=extintor).
- `inspection_executions.asset_id` (novo campo, nullable — inspeção pode ser de área ou de ativo).

QR Code:
- Rota pública com token opaco: `/i/:qr_token` → resolve o ativo + modelo aplicável + abre execução (cria se não existir a do ciclo atual).
- Geração de etiquetas PDF em lote (folha A4 com N QR codes + tag_code + nome do ativo), via `qrcode` + `jspdf`.

### 3. Fluxo offline-first (PWA)
- Ativar PWA via `vite-plugin-pwa` seguindo o skill (registro apenas em produção, `NetworkFirst` para navegações, `/~oauth` excluído).
- **Fila de sincronização local** com IndexedDB (`idb` lib): fotos, assinatura e respostas são gravadas localmente com `client_id` (uuid) e enviadas quando volta a conexão. Ordem: upload de mídia → insert de respostas → update de execução.
- Indicador visível "Modo offline — X inspeções pendentes de sync".
- Idempotência: `client_id` único em `inspection_execution_answers` + `unique(execution_id, item_id)` evita duplicar quando a rede oscila.

### 4. Foto direto da câmera + GPS
- `<input type="file" accept="image/*" capture="environment">` para foto (não abre galeria).
- `navigator.geolocation.getCurrentPosition` no momento da resposta, salvo em `location_lat/lng/accuracy` de cada resposta e no fechamento.
- Compressão client-side (`browser-image-compression`) para ~1600px / 80% qualidade antes de subir.
- EXIF preservado no arquivo original (bucket) + hash SHA-256 gravado em coluna nova `photo_hash` — cria cadeia de custódia (a foto não foi trocada depois).

### 5. Assinatura digital do responsável no fechamento
Reutiliza o padrão já usado em EPI (`SignatureKioskModal` + `react-signature-canvas` + bucket `epi-signatures` — replicar como `inspection-signatures`).

Novas colunas em `inspection_executions`:
- `signature_url` (path no bucket), `signature_name`, `signature_role` (cargo/CREA/técnico responsável), `signed_at`, `signed_location_lat/lng`, `signed_ip`, `signed_user_agent`, `signature_hash`.
- Fechar a execução exige: 100% dos itens críticos respondidos, ações abertas para todos os "não conforme" e assinatura capturada.

### 6. Ações corretivas ganham 5W2H completo + reincidência
Já existe a tabela. Ampliar:
- Vincular ação diretamente ao item não conforme (`answer_id` fk nova).
- Detecção automática de **reincidência** (mesmo item / mesmo ativo com "não conforme" em ≥2 ciclos) → gera alerta no dashboard.
- Notificação por email (edge function `notify-corrective-action`) para o responsável quando a ação é criada e 3 dias antes do vencimento.

### 7. Relatório de inspeção legalmente válido (PDF)
Nova função `buildInspectionReportPdf` (`src/lib/inspection-report-pdf.ts`) inspirada em `epi-ficha-pdf.ts`:
- Cabeçalho: logo, CNPJ, endereço da empresa
- Identificação: modelo, NR de referência, ativo (com tag + QR), setor, local (endereço + coords), data/hora início e fim, responsável (nome + cargo + matrícula)
- Tabela item a item: nº, pergunta, resposta, conformidade, referência normativa, fotos (thumbnails), observação
- Sumário: total itens, conformes, não conformes, críticos reprovados
- Ações corretivas geradas: 5W2H + prazo
- Assinatura embutida + linha de auditoria (IP, user agent, hash, coords)
- Rodapé com hash SHA-256 do PDF (integridade)

Um PDF assim tem cadeia de custódia suficiente para valer em fiscalização (equivale ao que auditores aceitam de plataformas como SafetyCulture/iAuditor).

### 8. Melhorias adicionais propostas

- **Escala CIPA / periodicidade legal por NR**: presets prontos (NR-13 caldeiras/vasos = anual, NR-11 empilhadeiras = diária, extintor NR-23 = mensal visual + anual manutenção). Modelo herda o preset ao escolher a NR.
- **SLA de resposta a não conformidade** configurável por prioridade (crítica: 24h, alta: 7d, média: 30d, baixa: 90d) com escalonamento por email pro admin quando vence.
- **Verificação de conformidade em massa** (dashboard): ativos que nunca foram inspecionados, com inspeção vencida, ou com item crítico não conforme há > X dias.
- **LGPD**: aviso na captura de foto ("evite pessoas identificáveis"), permissão para borrar rostos no client (Canvas + face-api opcional em fase 2).
- **Trilha de auditoria imutável**: tabela `inspection_audit_log` (append-only, RLS só SELECT) registrando cada evento (criação, resposta, edição, assinatura, exportação de PDF) com `actor_id`, `payload_hash`, `timestamp`. Torna a plataforma auditável.
- **Modo Kiosk público via QR** (fase 2): operador terceirizado sem login abre o QR, preenche checklist básico assinando com CPF+nome; a URL usa `qr_token` + rate-limit em edge function. Útil para portaria, veículos de terceiros.

## Escopo desta entrega vs. fases

**Fase 1 (esta sessão + próxima):**
1. Migração: novas tabelas (`inspection_checklist_items`, `inspection_execution_answers`, `inspection_assets`, `inspection_model_asset_types`), novos campos em `inspection_executions` (asset_id, signature_*, signed_*), bucket `inspection-signatures` privado + GRANT/RLS por company_id + audit log.
2. Editor de checklist estruturado no modelo (desktop).
3. Cadastro de ativos + geração de etiquetas QR (PDF A4).
4. Rota `/i/:qr_token` que resolve ativo+modelo, cria/retoma execução.
5. Tela mobile de execução item a item com câmera+GPS+compressão (responsiva; funciona bem no mobile web sem PWA ainda).
6. Assinatura digital de fechamento (reutiliza `SignatureKioskModal`, adaptado).
7. Novo PDF de relatório com hash e auditoria.
8. Ações corretivas ligadas ao item não conforme.

**Fase 2 (próxima entrega, sob demanda):**
- PWA offline com IndexedDB queue + sync worker.
- Trilha de auditoria completa e reincidência.
- Presets por NR e SLA escalonado.
- Modo kiosk público para terceiros.
- Blur de rostos LGPD.

## Detalhes técnicos (para referência do time)

- **Bibliotecas novas**: `qrcode` (geração QR), `browser-image-compression` (compressão), `idb` (fase 2). `jspdf` e `react-signature-canvas` já estão no projeto.
- **RLS**: mesmo padrão de `company_id = get_user_company_id()` para todas as novas tabelas. Rota `/i/:qr_token` usa **edge function** `resolve-inspection-qr` (service role) que valida o token e devolve execution_id + JWT temporário via `signInWithOtp`? Não — mais simples: o usuário precisa estar logado no app; o QR só encurta o caminho. Terceiro sem login é fase 2.
- **Storage**: buckets `inspection-files` (já existe, guarda fotos por item), `inspection-signatures` (novo, privado, signed URL 1h).
- **Índices**: `inspection_assets(company_id, tag_code) unique`, `inspection_execution_answers(execution_id, item_id) unique`, `inspection_assets(qr_token) unique`.
- **Compat**: `inspection_entries` (upload livre atual) continua existindo como "anexos gerais" da execução — não quebra dados existentes.

## Ordem de implementação (fase 1)
1. Migração SQL + bucket
2. `src/lib/inspections.ts` — helpers de status/conformidade por item
3. `src/hooks/useInspections.ts` — novos hooks (items, answers, assets, sign)
4. Editor de checklist no `InspectionModelDrawer`
5. CRUD de ativos + página `/inspecoes/ativos` + geração de etiquetas
6. Rota `/i/:qr_token` (`src/pages/InspecaoQr.tsx`)
7. Tela mobile de execução (`src/pages/InspecaoExecucao.tsx`) — câmera, GPS, item a item
8. Modal de assinatura de fechamento
9. `src/lib/inspection-report-pdf.ts` + botão exportar
10. Sidebar/rotas atualizadas

## Pergunta antes de partir para código
Confirma se topa que eu:
- **(a)** entregue a Fase 1 completa como descrita, ou
- **(b)** foca primeiro só em **QR + ativos + checklist estruturado + assinatura** e deixa PDF legal para uma segunda passada, ou
- **(c)** já quer PWA offline nesta mesma leva (Fase 1 + parte da Fase 2).

Também: você já tem uma NR/tipo de ativo prioritário (extintor NR-23? máquinas NR-12? veículos?) que devemos usar como caso-piloto para popular presets?
