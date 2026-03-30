

## Módulo de Biblioteca de Documentos

### Visão geral

Novo módulo completo acessível em `/documentos`, dentro do grupo SEGURANÇA na sidebar. Segue os mesmos padrões de arquitetura dos módulos existentes (Licenças, Serviços). Inclui vinculação bidirecional com Serviços Periódicos.

---

### 1. Banco de dados (1 migration)

**Tabelas:**

- `document_types` — id, company_id, name, is_default, created_at
- `documents` — id, company_id, code, title, document_type_id, description, responsible, area, status, current_revision, current_revision_date, current_file_url, current_file_name, created_by, created_at, updated_at
- `document_revisions` — id, document_id, company_id, revision_number, revision_date, file_url, file_name, notes, uploaded_by, uploaded_at
- `document_service_links` — id, document_id, service_id, company_id, linked_by, linked_at, UNIQUE(document_id, service_id)

**Storage:** bucket `documents-library` (privado)

**RLS:** padrão company_id com `get_user_company_id()` para SELECT/INSERT/UPDATE/DELETE em todas as tabelas.

**Função:** `seed_default_document_types(p_company_id)` — cria os 4 tipos padrão (IT, APR, PGR/PPRA, PCMSO) se não existirem.

**Índices:** nos campos company_id, document_type_id, document_id, service_id conforme especificado.

**FK cascades:** `document_revisions.document_id` e `document_service_links.document_id` com `ON DELETE CASCADE`.

---

### 2. Navegação e rotas

- **AppSidebar:** adicionar "Biblioteca de Docs" no grupo SEGURANÇA, abaixo de IC & NC, ícone `FileText` (lucide)
- **App.tsx:** rota `/documentos` → `Documentos`

---

### 3. Arquivos novos do módulo

| Arquivo | Descrição |
|---|---|
| `src/lib/documents.ts` | Helpers: formatação, status badges, sugestão de próxima revisão |
| `src/hooks/useDocuments.ts` | Hooks: `useDocumentTypes`, `useDocuments`, `useDocumentRevisions`, `useDocumentServiceLinks`, `useSaveDocument`, `useNewRevision`, `useDeleteDocument` |
| `src/pages/Documentos.tsx` | Página principal com KPIs, filtros, tabela |
| `src/components/documentos/DocumentKpiCards.tsx` | 4 KPI cards |
| `src/components/documentos/DocumentFilters.tsx` | Barra de filtros |
| `src/components/documentos/DocumentDrawer.tsx` | Drawer cadastro/edição |
| `src/components/documentos/DocumentDetailDrawer.tsx` | Drawer detalhes (2 abas: Documento + Histórico) |
| `src/components/documentos/NewRevisionModal.tsx` | Modal de nova revisão |
| `src/components/documentos/DeleteDocumentDialog.tsx` | Confirmação de exclusão |
| `src/components/documentos/ManageDocumentTypesModal.tsx` | Gerenciar tipos |

---

### 4. Vinculação com Serviços Periódicos

- **ServiceDrawer.tsx:** nova seção "Documentos relacionados" com select múltiplo buscando documentos vigentes. Ao salvar, sincronizar `document_service_links`.
- **ServiceDetailDrawer.tsx:** seção "Documentos relacionados" na aba Detalhes mostrando documentos vinculados com visualizar/baixar via signed URL.
- **useServices.ts:** adicionar hook `useDocumentServiceLinksForService(serviceId)`.

---

### 5. Storage

Adicionar `documents-library` ao `PRIVATE_BUCKETS` em `src/lib/storage-utils.ts`.

---

### 6. Restrições de plano

Botões de criar/editar/revisar/excluir/vincular desabilitados quando `company.plan === 'expired'` com tooltip "Seu plano expirou. Faça upgrade para continuar."

---

### Arquivos alterados (existentes)

- `src/App.tsx` — nova rota
- `src/components/AppSidebar.tsx` — novo item no grupo SEGURANÇA
- `src/components/servicos/ServiceDrawer.tsx` — seção documentos relacionados
- `src/components/servicos/ServiceDetailDrawer.tsx` — seção documentos relacionados
- `src/lib/storage-utils.ts` — novo bucket
- `src/integrations/supabase/types.ts` — atualizado automaticamente

