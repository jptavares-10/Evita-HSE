# Padrão único de tela em todos os módulos

Objetivo: quem aprende a usar um módulo sabe usar todos. Mesma posição de título e botão de criar, cartões de indicadores sempre clicáveis, mesma barra de filtros, mesmo vocabulário de situação e mesmas cores.

## O padrão

```text
 Título do módulo                          [Config]  [+ Novo ...]
 ─────────────────────────────────────────────────────────────────
 [ Total ] [ Em dia ] [ Vencendo ] [ Vencidos ]   <- sempre clicáveis
 ─────────────────────────────────────────────────────────────────
 [ buscar............ ] [ tipo ] [ situação ] [ mais filtros ] [Limpar]
 ─────────────────────────────────────────────────────────────────
 tabela + paginação
```

Regras:
- Botão de criar sempre no canto superior direito do cabeçalho, nunca dentro da barra de filtros.
- Botões de configuração (categorias, tipos) ficam à esquerda do botão de criar, sempre como botão contornado.
- Todo cartão de indicador filtra a lista ao ser clicado, e clicar de novo remove o filtro. Cartão ativo com destaque visível.
- A barra de filtros começa sempre com a busca, depois os filtros específicos do módulo, depois "situação", e termina com "Limpar filtros" quando algo estiver aplicado.
- Uma única fonte de situação: escolher no cartão atualiza o seletor de situação e vice-versa (hoje são dois controles que se anulam).

## Vocabulário e cores únicos

| Situação | Rótulo | Cor |
|---|---|---|
| ok | Em dia | verde |
| warning | Vencendo | âmbar |
| expired | Vencidos | vermelho |
| missing | Sem registro | cinza |
| inactive | Inativo | cinza |
| total | Total | neutro |

- Sai "100% em dia", "Com pendências", "Vencendo em breve", "CAs Vencendo/Vencidos", "Status CDF".
- Em EPI, o cartão que hoje mistura estoque e validade é separado em "Estoque baixo" e "CA vencido/vencendo".
- Ordem fixa dos cartões: Total, Em dia, Vencendo, Vencidos, e por último o percentual de conformidade quando o módulo tiver.
- Etiquetas de situação nas tabelas passam a usar o mesmo componente, com ícone (sem emoji).

## Módulos alcançados

Serviços, Treinamentos (Visão geral, Colaboradores, Catálogo, Matriz, Cargos), EPI (Visão geral, Catálogo, Estoque, Entregas, Ficha), ASO, Documentos, Licenças, Condicionantes, MTR, Inspeções, Fornecedores, Incidentes.

Prioridade de execução: Treinamentos, EPI e Documentos primeiro (uso diário), depois os demais.

## Detalhes técnicos

- `src/components/ui/page-header.tsx`: novo componente com título, subtítulo opcional e área de ações à direita.
- `src/components/ui/filter-bar.tsx`: casca padrão da barra de filtros (busca + slots de filtro + limpar), reaproveitando `Input`/`Select` existentes.
- `src/lib/status.ts`: dicionário único de rótulos, tons e ícones por chave de situação; `StatusBadge` derivado dele.
- `src/hooks/useStatusFilter.ts`: estado único que serve cartão e seletor, substituindo o par `kpiFilter`/`statusFilter` duplicado hoje em Serviços, Documentos, Licenças, Condicionantes, MTR e Inspeções (inclusive o caso especial `revision_overdue` de Documentos).
- `Kpi`/`KpiGrid` (`src/components/ui/kpi.tsx`) já suportam `onClick`/`active`; os KpiCards de ASO, EPI e Treinamentos passam a receber `activeFilter`/`onFilterClick` e as páginas passam a filtrar por eles.
- Botões de criar migram de `ServiceFilters`, `MtrFilters`, `LicenseFilters`, `DocumentFilters` e das barras de EPI/Treinamentos para o `PageHeader`; `PermissionButton` passa a ser o único caminho de bloqueio por permissão/plano, removendo as cópias locais de `ActionButton` em Treinamentos.
- Somente apresentação e estado de filtro: nenhuma regra de negócio, cálculo de vencimento, consulta ou política de banco é alterada.

## Fora deste plano

Padrão único de "abrir detalhe" (painel lateral x página), correções do passo a passo inicial, Revisões dentro de Documentos, limpeza de rotas duplicadas e paridade de importar/exportar — ficam para as etapas seguintes da análise.
