

# Fase 1: Dias de Afastamento + Indicadores TF/TG

## O que será entregue
1. Novo campo **"Dias de afastamento"** (`lost_days`) nas ocorrências, visível quando `with_leave = true`
2. Indicadores **Taxa de Frequência (TF)** e **Taxa de Gravidade (TG)** no Dashboard, calculados com base nos dados existentes

## Detalhes técnicos

### 1. Migration: adicionar coluna `lost_days`
- Adicionar `lost_days integer default 0` na tabela `occurrences`
- Campo simples, sem impacto em RLS (já coberto pelas policies existentes)

### 2. OccurrenceDrawer — campo condicional
- Adicionar estado `lostDays` no formulário
- Exibir campo numérico "Dias de afastamento" quando `type === "incident"` e `withLeave === true`
- Incluir `lost_days` no payload de save

### 3. OccurrenceDetailDrawer — exibir dias
- Na seção "Com afastamento", mostrar `{occurrence.lost_days} dia(s)` quando > 0

### 4. useSaveOccurrence — incluir `lost_days`
- Adicionar `lost_days` ao payload do mutation (0 quando não aplicável)

### 5. Dashboard — card TF/TG
- Substituir o card "Seu plano" (que será movido para a sidebar ou mantido menor) ou adicionar um novo card ao grid
- **TF** = (N° de incidentes com afastamento × 1.000.000) / HHT
  - HHT será estimado com base em número de colaboradores ativos × 200h/mês × 12
- **TG** = (Soma de dias perdidos × 1.000.000) / HHT
- Ambos calculados para o ano corrente
- Card com ícone `Activity`, mostrando TF e TG lado a lado

### 6. Supabase types
- O campo `lost_days` será disponibilizado automaticamente após a migration

## Arquivos modificados
- `supabase/migrations/` — nova migration com `ALTER TABLE occurrences ADD COLUMN lost_days`
- `src/components/incidentes/OccurrenceDrawer.tsx` — campo dias de afastamento
- `src/components/incidentes/OccurrenceDetailDrawer.tsx` — exibir dias
- `src/hooks/useOccurrences.ts` — incluir lost_days no save
- `src/pages/Dashboard.tsx` — novo card TF/TG
- `src/lib/occurrences.ts` — funções auxiliares para cálculo TF/TG

