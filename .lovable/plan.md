

# Onboarding Guiado por Módulo

## Objetivo
Criar um sistema de "primeiros passos" para cada módulo do sistema. Quando o usuário entra em um módulo pela primeira vez e não tem dados, ele vê um wizard visual com passos sequenciais para configurar aquele módulo, em vez de uma tela vazia genérica.

## Abordagem

Criar um componente reutilizável `ModuleOnboarding` que recebe a configuração de passos e é exibido condicionalmente quando o módulo está vazio. Cada módulo terá seus próprios passos definidos.

## Componente principal

**Novo arquivo: `src/components/ModuleOnboarding.tsx`**

Um componente que recebe:
- `title`: nome do módulo
- `description`: descrição curta
- `icon`: ícone Lucide
- `steps`: array de `{ title, description, action: () => void, completed: boolean, icon }`

Renderiza um card centralizado com:
- Ícone e título do módulo
- Lista vertical de passos numerados com indicador de progresso (check se completo, número se pendente)
- Botão de ação em cada passo ("Criar setor", "Cadastrar colaborador", etc.)
- Barra de progresso geral no topo
- Visual limpo, consistente com o design system existente (Card, Badge, Button, Progress)

## Módulos e seus passos

### 1. Treinamentos (`TreinamentosVisaoGeral`)
Condição: `employees.length === 0 && trainings.length === 0`
Passos:
1. Criar setores (link para /treinamentos/cargos)
2. Criar cargos (link para /treinamentos/cargos)
3. Cadastrar colaboradores (link para /treinamentos/colaboradores)
4. Cadastrar primeiro treinamento (link para /treinamentos/catalogo)

### 2. Serviços Periódicos (`Servicos`)
Condição: `services.length === 0` (já tem `ServiceEmptyState`, substituir)
Passos:
1. Criar categorias de serviço (abrir modal de categorias)
2. Cadastrar primeiro serviço (abrir drawer)

### 3. Inspeções (`InspecoesModelos` / `InspecoesExecucoes`)
Condição: `models.length === 0`
Passos:
1. Cadastrar colaboradores (link para /treinamentos/colaboradores)
2. Criar primeiro modelo de inspeção (abrir drawer)
3. Gerar primeira execução (abrir modal)

### 4. MTR (`Mtr`)
Condição: `mtrs.length === 0`
Passos:
1. Cadastrar categorias de resíduo (abrir modal)
2. Registrar primeiro MTR (abrir drawer)

### 5. Fornecedores (`Fornecedores`)
Condição: `suppliers.length === 0`
Passos:
1. Cadastrar primeiro fornecedor (abrir drawer)
2. Ativar portal do fornecedor (explicação)

### 6. Incidentes (`Incidentes`)
Condição: `occurrences.length === 0`
Passos:
1. Registrar primeira ocorrência (abrir drawer)

### 7. Licenças Ambientais (`Licencas`)
Condição: `licenses.length === 0`
Passos:
1. Criar tipos de licença (abrir modal)
2. Cadastrar primeira licença (abrir drawer)

### 8. Documentos (`Documentos`)
Condição: `documents.length === 0`
Passos:
1. Criar tipos de documento (abrir modal)
2. Cadastrar primeiro documento (abrir drawer)

### 9. EPI (`EpiVisaoGeral`)
Condição: `epiTypes.length === 0`
Passos:
1. Cadastrar primeiro EPI no catálogo (link para /epi/catalogo)
2. Registrar estoque inicial (link para /epi/estoque)
3. Registrar primeira entrega (link para /epi/entregas)

### 10. ASO (`Aso`)
Condição: `asoRecords.length === 0 && employees.length === 0`
Passos:
1. Cadastrar colaboradores (link para /treinamentos/colaboradores)
2. Configurar tipos de exame (abrir modal)
3. Registrar primeiro ASO (abrir drawer)

## Implementação

### Arquivos criados
- `src/components/ModuleOnboarding.tsx` - componente reutilizável

### Arquivos editados (10 páginas)
Cada página de módulo receberá a lógica condicional: se os dados estão vazios e não está carregando, renderizar `ModuleOnboarding` no lugar do conteúdo normal. Os passos marcarão `completed: true` conforme os dados existam (ex: se já tem categorias, o passo 1 fica completo).

## Detalhes técnicos
- Sem mudanças no banco de dados
- Sem novo estado persistido (o onboarding desaparece naturalmente quando há dados)
- Reutiliza hooks existentes (`useEmployees`, `useTrainings`, etc.) para verificar completude dos passos
- Componente `ModuleOnboarding` usa `Card`, `Button`, `Progress`, `Badge` do design system existente
- Ações dos passos: ou navegam (`useNavigate`) ou chamam callbacks (abrir drawers/modais já existentes)

