
## Módulo Calendário

Novo item de menu único na sidebar (área "Gestão" / topo). Visualização principal em mês (estilo agenda), com painéis lateral/dia ao clicar em uma data. Desktop-first (≥1280px), seguindo o design system existente.

### 1. Eventos manuais (CRUD)

Nova tabela `calendar_events`:
- `title` (obrigatório)
- `description`
- `area` enum: `meio_ambiente` | `seguranca` | `saude` | `geral`
- `category` enum: `evento` | `campanha` | `auditoria` | `reuniao` | `treinamento_interno` | `outro`
- `starts_at`, `ends_at` (timestamps, suporta dia inteiro via flag `all_day`)
- `location` (texto livre — sala, planta, link de reunião)
- `color` (override opcional; padrão pela área)
- `status` enum: `planejado` | `concluido` | `cancelado`
- `created_by`, `company_id`, `created_at`, `updated_at`

CRUD via Sheet/Drawer (padrão do app). Botão "Novo evento" no topo da página.

### 2. Anexos (somente eventos/campanhas)

Nova tabela `calendar_event_attachments` (máx. 5 por evento, validado em trigger):
- `event_id`, `file_url`, `file_name`, `file_type`, `file_size`, `uploaded_by`, `company_id`

Novo bucket privado `calendar-attachments`, estrutura `{company_id}/{event_id}/{filename}`, URLs assinadas de 1h, limite global 20MB por arquivo (regra do projeto). Tipos aceitos: JPG, PNG, PDF.

### 3. Agregação de vencimentos dos demais módulos

Os vencimentos não são duplicados em tabela — são lidos em tempo real via uma **view segura** `calendar_due_items` (`security_invoker = true`) que une:

| Fonte | Campo de data | Módulo / rota destino |
|---|---|---|
| `periodic_services.next_due_at` | Serviços Periódicos → `/servicos/:id` |
| `environmental_licenses.expires_at` (quando `has_expiry`) | Licenças Ambientais → `/licencas/:id` |
| `license_renewals.expires_at` | Licenças Ambientais (renovação) → `/licencas/:id` |
| `mtrs.cdf_deadline_at` | MTR → `/mtr/:id` |
| `inspection_executions.due_date` | Inspeções → `/inspecoes/execucoes/:id` |
| `inspection_corrective_actions.due_date` | Inspeções (ação corretiva) → `/inspecoes/:id` |
| `document_review_cycles.due_date` | Biblioteca / Revisões → `/revisoes/:id` |

Cada linha expõe: `source_module`, `source_id`, `title`, `due_date`, `status` (ok/warning/expired), `deep_link`, `company_id`.

**Excluídos por regra:** vencimentos de ASO, Treinamentos (employee_training_records), EPI (CA) e EPI entregas.

**Pergunta no card de dúvidas abaixo** sobre dois opcionais que tenho dúvida se devem entrar.

### 4. Busca

Barra de pesquisa no topo da página que filtra simultaneamente:
- Eventos (`title`, `description`, `location`, `area`)
- Vencimentos da view (`title`, `source_module`)

Resultados aparecem como lista lateral além de continuarem destacados no calendário.

### 5. UX do calendário

```text
┌─────────────────────────────────────────────────┬──────────────┐
│ [<] Junho 2026 [>]    [Mês|Semana]   [Buscar…] │  Painel do   │
├─────────────────────────────────────────────────┤  dia/seleção │
│ Dom Seg Ter Qua Qui Sex Sáb                      │  ▸ Eventos   │
│  …  …  …  ●●  …  …  …                            │  ▸ Vencim.   │
│  …  ●  …  …  ●  …  …                             │  (com link)  │
└─────────────────────────────────────────────────┴──────────────┘
```
- Bolinha colorida por área (segurança vermelho, ambiente verde, saúde azul, geral cinza); vencimentos com ícone distinto.
- Clique no dia → painel direito lista eventos + vencimentos; cada vencimento é um link para o registro original.
- Filtros rápidos: por área, por módulo de origem, por status.

### 6. Segurança

- RLS multi-tenant por `company_id` em `calendar_events` e `calendar_event_attachments`.
- Leitura: qualquer membro da empresa.
- Escrita (insert/update/delete): exige `has_module_editor_permission('calendar')` (novo módulo adicionado ao enum/lista usada por `user_permissions`, `seed_viewer_permissions` e `get_user_permissions`).
- Trigger `enforce_max_5_attachments` no `BEFORE INSERT` de `calendar_event_attachments`.
- Storage `calendar-attachments`: políticas RLS em `storage.objects` validando `company_id` via `foldername[1]` (padrão já usado no projeto). Privado, URLs assinadas 1h.
- View `calendar_due_items` com `security_invoker = true` para herdar as RLS de cada tabela de origem (usuário só vê o que já podia ver).
- Validação Zod no frontend (título 1–200, descrição ≤2000, máx. 5 anexos por evento, tamanho/tipo de arquivo).
- Plano: respeitar `get_company_access_status()` (read-only quando expirado).

### 7. Integrações com o app existente

- Adicionar rota `/calendario` em `App.tsx`.
- Item na sidebar (categoria a confirmar — ver pergunta).
- Acrescentar `'calendar'` à lista de módulos em: `seed_viewer_permissions`, `get_user_permissions`, `set_user_permission`, e no painel de permissões do usuário (`UserPermissionsDrawer`).
- Atalho na busca global (Ctrl+F3) para eventos do calendário.

### Detalhes técnicos

- Lib calendário: `react-day-picker` (já no projeto) para grade do mês — sem nova dependência pesada. Painel de eventos custom.
- Hooks: `useCalendarEvents`, `useCalendarDueItems(monthRange)`, `useCalendarSearch(query)`.
- Componentes: `CalendarPage`, `MonthGrid`, `DayPanel`, `EventFormSheet`, `EventAttachmentsList`, `DueItemRow`.
- Migração cria: tabelas + GRANTs + RLS + policies + view + função/trigger de limite de anexos + bucket via tool.

### Dúvidas antes de implementar

1. **Vencimentos opcionais** — quero confirmar se devem aparecer no calendário (ou ficar de fora como ASO/Treinamentos/EPI):
   - **Ações corretivas de inspeção** (`inspection_corrective_actions.due_date`) — são tarefas pessoais, podem poluir o calendário corporativo.
   - **Ciclos de revisão de documentos** (`document_review_cycles.due_date`) — fluxo interno da Biblioteca.
   - Minha sugestão: incluir **execuções de inspeção** e **revisões de documentos**, e deixar **ações corretivas fora** (já têm visão própria). OK?

2. **Localização na sidebar** — criar como item próprio no topo (acima das áreas), dentro de "Gestão", ou dentro de uma nova seção "Planejamento"?

3. **Visualizações** — basta Mês + painel do dia, ou você também quer visão Semana e Lista (agenda corrida)?

4. **Notificações** — quer alerta visual (badge) no menu para eventos do dia / próximos 7 dias? (Sem e-mail por enquanto.)
