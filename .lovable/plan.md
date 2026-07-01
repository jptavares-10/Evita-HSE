
# Melhorar IC & NC — Investigação Estruturada

## 1. Diagnóstico do módulo atual

Hoje o `occurrences` guarda apenas:
- `type` (incident / near_miss / non_conformity / safety_observation)
- `severity`, `location`, `occurred_at`, `description`
- `cause_analysis` (um único campo de texto livre) ← **aqui está a superficialidade**
- `body_part_affected`, `with_leave`, `lost_days`, `status`
- Filhos: `corrective_actions` (só descrição/status/evidência), `occurrence_employees`, `occurrence_attachments`

**Lacunas frente à legislação e boas práticas** (NR-1 item 1.5.5 — investigação de acidentes; NR-5 CIPA — análise de causas; ISO 45001 §10.2; NBR 14280 — CAT; OSHA / ICAM / TapRooT):

| Requisito | Existe? |
|---|---|
| Metodologia formal de análise de causa raiz (RCA) | ❌ campo texto |
| Distinção entre causa **imediata**, **básica** e **raiz** | ❌ |
| Classificação por categoria (fator humano, equipamento, ambiente, método, gestão, material — 6M) | ❌ |
| Plano de ação 5W2H (What/Why/Where/When/Who/How/HowMuch) com prazo, responsável, custo | ❌ (só descrição + status) |
| Ações classificadas por hierarquia de controle (eliminação → EPI) | ❌ |
| Lições aprendidas / knowledge base pesquisável entre incidentes | ❌ |
| Vínculo ação corretiva → causa raiz específica | ❌ (ação solta) |
| CAT / comunicação obrigatória (afastamento >15d, óbito) — flag e prazo | ❌ |
| Testemunhas separadas de envolvidos | ❌ |
| Custo estimado do incidente (para dor 3 — BI) | ❌ |
| Reincidência (linkar a incidentes anteriores similares) | ❌ |

## 2. O que vamos construir

### 2.1 Investigação estruturada (novo bloco na ocorrência)

Aba **"Investigação"** dentro do `OccurrenceDetailDrawer`, com um assistente por etapas:

**Etapa 1 — Descrição do evento (o que aconteceu)**  
Já existe (`description`). Adicionar: sequência de fatos (timeline em bullets), condição/ato inseguro identificado.

**Etapa 2 — 5 Porquês** *(Professional + Enterprise)*  
Cadeia guiada de 5 perguntas encadeadas. Cada "porquê" é um registro com texto + evidência opcional. O 5º vira automaticamente a **causa raiz sugerida**.

**Etapa 3 — Ishikawa / 6M** *(Enterprise)*  
Formulário com 6 categorias (Mão de obra, Máquina, Método, Material, Meio ambiente, Medição). Para cada uma o usuário lista causas contribuintes. Renderizado como diagrama espinha de peixe em SVG (leitura) + edição em lista.

**Etapa 4 — Bow-Tie** *(Enterprise)*  
Perigo central + ameaças (à esquerda) + consequências (à direita) + barreiras preventivas e mitigadoras. Formulário simples que renderiza um esquema SVG.

**Etapa 5 — Causas consolidadas**  
Lista de causas classificadas por tipo (imediata / básica / raiz) e categoria 6M. Alimentada automaticamente pelos passos 2/3/4 e editável.

### 2.2 Plano de ação 5W2H

Substituir o `corrective_actions` atual por versão 5W2H:
- **What** — descrição da ação (já existe)
- **Why** — vinculada a uma causa da etapa 5
- **Where** — local/setor
- **When** — prazo (due_date) + data de conclusão
- **Who** — responsável (profile ou employee)
- **How** — método/procedimento
- **How much** — custo estimado (R$)
- **Hierarquia de controle** — eliminação / substituição / engenharia / administrativo / EPI
- **Verificação de eficácia** — data + resultado (efetiva / não efetiva / reabrir)

### 2.3 Lições aprendidas (biblioteca)

Nova página `/incidentes/licoes-aprendidas`:
- Ao encerrar uma ocorrência com investigação preenchida, marcar "publicar como lição aprendida" gera um card na biblioteca.
- Campos: título, resumo (o que aconteceu), causa raiz, ações eficazes, tags (setor, tipo de risco).
- Busca por texto + filtros (setor, tipo de risco, categoria 6M).
- Anexos herdados da ocorrência (opcional publicar).
- Permissões: qualquer usuário com acesso ao módulo lê; edição só admin/editor.

### 2.4 Complementos legais

- Flag automática **"CAT obrigatória"** quando `type=incident` e (`lost_days > 0` OR gravidade crítica) — banner amarelo pedindo nº da CAT e data de emissão.
- Campo **custo estimado** total no cabeçalho da ocorrência (soma dos 5W2H + dias perdidos × custo/hora configurável) — feed para o BI da Dor 3.
- **Reincidência**: ao criar ocorrência, sugerir similares (mesmo setor + tipo) dos últimos 12 meses.

### 2.5 Gate por plano

Módulo continua liberado em **Professional** e **Enterprise** (Starter sem, Trial libera tudo — regra atual):
- **Professional**: 5 Porquês + 5W2H + Lições aprendidas + CAT + custo + reincidência.
- **Enterprise**: adiciona Ishikawa visual e Bow-Tie.

Enforcement no `usePlan` já cobre módulo; gate fino por método via nova helper `useInvestigationMethod(method)` que retorna se o plano libera.

## 3. Detalhes técnicos

### Schema (migration)

```sql
-- 1. Causas estruturadas
CREATE TABLE public.occurrence_causes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurrence_id uuid NOT NULL REFERENCES occurrences ON DELETE CASCADE,
  company_id uuid NOT NULL,
  cause_type text NOT NULL,       -- immediate | basic | root
  category_6m text,               -- man | machine | method | material | environment | measurement
  description text NOT NULL,
  source_method text,             -- 5whys | ishikawa | bowtie | manual
  parent_cause_id uuid REFERENCES occurrence_causes(id) ON DELETE CASCADE,  -- para cadeia dos 5 porquês
  order_index int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);

-- 2. Bow-tie (perigo/ameaças/consequências/barreiras)
CREATE TABLE public.occurrence_bowtie (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurrence_id uuid NOT NULL REFERENCES occurrences ON DELETE CASCADE,
  company_id uuid NOT NULL,
  hazard text NOT NULL,
  node_type text NOT NULL,        -- threat | consequence | preventive_barrier | mitigating_barrier
  description text NOT NULL,
  linked_to uuid REFERENCES occurrence_bowtie(id) ON DELETE CASCADE,  -- barreira liga em threat/consequence
  order_index int DEFAULT 0
);

-- 3. Estender corrective_actions com 5W2H
ALTER TABLE public.corrective_actions
  ADD COLUMN cause_id uuid REFERENCES occurrence_causes(id) ON DELETE SET NULL,
  ADD COLUMN why text,
  ADD COLUMN where_location text,
  ADD COLUMN due_date date,
  ADD COLUMN responsible_profile_id uuid REFERENCES profiles(id),
  ADD COLUMN responsible_employee_id uuid REFERENCES employees(id),
  ADD COLUMN how_method text,
  ADD COLUMN cost_estimated numeric(12,2),
  ADD COLUMN control_hierarchy text,   -- elimination|substitution|engineering|administrative|ppe
  ADD COLUMN effectiveness_check_date date,
  ADD COLUMN effectiveness_result text; -- effective|ineffective|reopened

-- 4. Estender occurrences
ALTER TABLE public.occurrences
  ADD COLUMN investigation_method text,    -- five_whys | ishikawa | bowtie
  ADD COLUMN cat_required boolean DEFAULT false,
  ADD COLUMN cat_number text,
  ADD COLUMN cat_issued_at date,
  ADD COLUMN cost_estimated numeric(12,2),
  ADD COLUMN published_as_lesson boolean DEFAULT false,
  ADD COLUMN lesson_title text,
  ADD COLUMN lesson_summary text,
  ADD COLUMN lesson_tags text[];

-- 5. Testemunhas (separado de envolvidos)
CREATE TABLE public.occurrence_witnesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurrence_id uuid NOT NULL REFERENCES occurrences ON DELETE CASCADE,
  company_id uuid NOT NULL,
  employee_id uuid REFERENCES employees(id),
  witness_name text NOT NULL,
  statement text
);
```

Todas as tabelas novas: GRANT `authenticated`/`service_role`, RLS por `company_id` + `has_module_permission('ic_nc', 'view'/'edit')`, seguindo o padrão do módulo atual.

Trigger `set_cat_required` recalcula `cat_required` ao inserir/atualizar `occurrences` quando `type='incident'` E (`lost_days > 15` OR `severity='critical'`).

### Frontend

**Novos arquivos**
- `src/lib/investigation.ts` — enums (cause_type, 6M, hierarquia de controle, CAT rules) + helpers.
- `src/hooks/useInvestigation.ts` — queries/mutations para causas, bowtie, ações 5W2H.
- `src/hooks/useLessonsLearned.ts` — busca da biblioteca.
- `src/components/incidentes/investigation/FiveWhysWizard.tsx`
- `src/components/incidentes/investigation/IshikawaEditor.tsx` (form) + `IshikawaDiagram.tsx` (SVG readonly)
- `src/components/incidentes/investigation/BowTieEditor.tsx` + `BowTieDiagram.tsx`
- `src/components/incidentes/investigation/CausesSummary.tsx`
- `src/components/incidentes/investigation/ActionPlan5W2H.tsx` (substitui bloco de ações do drawer atual)
- `src/components/incidentes/CatBanner.tsx`
- `src/components/incidentes/RecurrenceHint.tsx`
- `src/pages/incidentes/LicoesAprendidas.tsx` + entrada no `AppSidebar` (subitem)

**Refatoração**
- `OccurrenceDetailDrawer`: adicionar `Tabs` — Visão geral · Investigação · Ações 5W2H · Lição aprendida · Anexos.
- `OccurrenceDrawer` (formulário de criação): adicionar seleção de metodologia + testemunhas.
- `AppSidebar`: subitem "Lições aprendidas" em IC & NC.
- `App.tsx`: rota `/incidentes/licoes-aprendidas`.
- `usePlan` / `usePermission`: helper `useInvestigationMethod('ishikawa' | 'bowtie')` bloqueando abas em Professional.

### Diagramas

Ishikawa e Bow-Tie renderizados em SVG puro (sem lib externa) — layout fixo de 6 espinhas / bow-tie de 2 lados, texto quebrado por CSS. Print-friendly. Botão "Baixar PNG" via `html-to-image` (já usável — se não tiver, adiciono só nessa telinha).

### Fora do escopo (fica pra depois)

- Notificação por e-mail de ação vencida (entra na Onda 1 do Resend).
- Assinatura digital do relatório de investigação.
- Integração CAT com eSocial.
- App mobile para investigação em campo.

## 4. Impacto e migração

- Ocorrências antigas continuam válidas — `cause_analysis` texto vira uma **causa raiz "manual"** ao abrir a aba Investigação pela primeira vez (migração de dados on-the-fly, sem backfill destrutivo).
- Ações corretivas atuais ganham colunas nulas — nenhuma quebra.
- Gate por plano é aditivo — Starter continua sem módulo, Professional ganha 5W/5W2H, Enterprise ganha diagramas.

## 5. Entrega sugerida em 2 ondas

**Onda A (Professional-ready)** — schema + 5 Porquês + 5W2H + causas consolidadas + CAT + custo + reincidência + Lições aprendidas.

**Onda B (Enterprise)** — Ishikawa visual + Bow-Tie visual + export PNG dos diagramas.

Se aprovar, começo pela Onda A e libero a B em seguida.
