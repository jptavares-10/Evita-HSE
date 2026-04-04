

## Plano: Impedir cadastro de empresas com CNPJ duplicado

### Problema
A function `create_company_and_admin` e `update_company_safe_fields` nao verificam se o CNPJ ja existe em outra empresa. Duas empresas podem ser criadas com o mesmo CNPJ.

### Solucao

**1. Migration SQL** -- uma unica migration com 3 alteracoes:

- **Unique index parcial** na tabela `companies` para o campo `cnpj` (apenas onde `cnpj IS NOT NULL AND cnpj != ''`). Isso impede duplicatas no nivel do banco.

- **Atualizar `create_company_and_admin`**: antes do INSERT em `companies`, verificar se ja existe uma empresa com o mesmo CNPJ. Se existir, retornar erro: `"Já existe uma empresa cadastrada com este CNPJ."`.

- **Atualizar `update_company_safe_fields`**: antes do UPDATE, verificar se o novo CNPJ ja pertence a outra empresa (excluindo a propria). Se existir, retornar erro similar.

**2. Frontend** -- tratar o erro retornado pelo RPC nos dois pontos:

- `src/pages/Cadastro.tsx` e `src/pages/CompletarCadastro.tsx`: o erro ja e exibido via `result?.error`, nenhuma mudanca necessaria.
- `src/pages/Empresa.tsx`: o erro ja e exibido via toast, nenhuma mudanca necessaria.

### Detalhes tecnicos

```sql
-- Unique index parcial (ignora NULL e vazio)
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_cnpj_unique
  ON public.companies (cnpj)
  WHERE cnpj IS NOT NULL AND cnpj != '';

-- create_company_and_admin: adicionar antes do INSERT
IF p_cnpj IS NOT NULL AND p_cnpj != '' THEN
  IF EXISTS (SELECT 1 FROM public.companies WHERE cnpj = p_cnpj) THEN
    RETURN jsonb_build_object('success', false, 'error',
      'Já existe uma empresa cadastrada com este CNPJ.');
  END IF;
END IF;

-- update_company_safe_fields: adicionar antes do UPDATE
IF p_cnpj IS NOT NULL AND p_cnpj != '' THEN
  IF EXISTS (SELECT 1 FROM public.companies
             WHERE cnpj = p_cnpj AND id != v_company_id) THEN
    RETURN jsonb_build_object('success', false, 'error',
      'Já existe uma empresa cadastrada com este CNPJ.');
  END IF;
END IF;
```

A protecao e em 2 camadas: o index garante integridade no banco mesmo em race conditions, e a verificacao nas RPCs retorna mensagens amigaveis ao usuario.

