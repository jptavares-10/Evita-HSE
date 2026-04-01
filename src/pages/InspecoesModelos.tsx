import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useInspectionModels, useDeleteInspectionModel, useSaveInspectionModel } from "@/hooks/useInspections";
import { getFrequencyLabel, formatDateBR } from "@/lib/inspections";
import { InspectionModelDrawer } from "@/components/inspecoes/InspectionModelDrawer";
import { ModelHistoryDrawer } from "@/components/inspecoes/ModelHistoryDrawer";
import { ConfirmDialog } from "@/components/inspecoes/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Search, Pencil, Trash2, Clock, FileText, ClipboardCheck, Users } from "lucide-react";
import { ModuleOnboarding, OnboardingStep } from "@/components/ModuleOnboarding";
import { useNavigate } from "react-router-dom";
import { TableSkeleton } from "@/components/TableSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export default function InspecoesModelos() {
  const navigate = useNavigate();
  const { company } = useAuth();
  const { data: models = [], isLoading } = useInspectionModels();
  const deleteModel = useDeleteInspectionModel();
  const saveModel = useSaveInspectionModel();
  const qc = useQueryClient();
  const isExpired = company?.plan === "expired";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [historyModel, setHistoryModel] = useState<any>(null);

  // Fetch employees and sectors for dropdown
  const [employees, setEmployees] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  useState(() => {
    if (company?.id) {
      supabase.from("employees").select("id, name").eq("company_id", company.id).eq("status", "active").order("name").then(({ data }) => {
        if (data) setEmployees(data);
      });
      supabase.from("sectors").select("id, name").eq("company_id", company.id).order("name").then(({ data }) => {
        if (data) setSectors(data);
      });
    }
  });

  const filtered = useMemo(() => {
    let result = models;
    if (search) result = result.filter((m: any) => m.name.toLowerCase().includes(search.toLowerCase()) || (m.related_nr || "").toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== "all") result = result.filter((m: any) => m.status === statusFilter);
    return result;
  }, [models, search, statusFilter]);

  const handleToggleStatus = async (model: any) => {
    const newStatus = model.status === "active" ? "inactive" : "active";
    await saveModel.mutateAsync({ id: model.id, name: model.name, frequency_type: model.frequency_type, status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou NR..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => { setEditing(null); setDrawerOpen(true); }} disabled={!!isExpired}>
          <Plus className="h-4 w-4 mr-1.5" />
          Novo modelo
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton columns={6} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">Nenhum modelo de inspeção cadastrado.</p>
          <Button onClick={() => { setEditing(null); setDrawerOpen(true); }} disabled={!!isExpired}>Criar primeiro modelo</Button>
        </div>
      ) : (
        <div className="bg-card border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                 <TableHead>Nome</TableHead>
                 <TableHead>Setor</TableHead>
                 <TableHead>Periodicidade</TableHead>
                 <TableHead>Responsável</TableHead>
                 <TableHead>Doc.</TableHead>
                 <TableHead>Status</TableHead>
                 <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-sm">{m.sectors?.name || "—"}</TableCell>
                  <TableCell className="text-sm">{getFrequencyLabel(m.frequency_type, m.frequency_days)}</TableCell>
                  <TableCell className="text-sm">{m.default_responsible?.name || "—"}</TableCell>
                  <TableCell>{m.linked_document ? <FileText className="h-4 w-4 text-primary" /> : "—"}</TableCell>
                  <TableCell>
                    <Switch checked={m.status === "active"} onCheckedChange={() => handleToggleStatus(m)} disabled={!!isExpired} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setHistoryModel(m)}>
                            <Clock className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ver histórico</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!!isExpired} onClick={() => { setEditing(m); setDrawerOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={!!isExpired} onClick={() => setDeleteTarget(m)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Excluir</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <InspectionModelDrawer open={drawerOpen} onOpenChange={setDrawerOpen} editing={editing} employees={employees} sectors={sectors} />
      <ModelHistoryDrawer open={!!historyModel} onOpenChange={(v) => !v && setHistoryModel(null)} model={historyModel} />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Excluir modelo"
        description={`Tem certeza que deseja excluir o modelo "${deleteTarget?.name}"?`}
        onConfirm={async () => { await deleteModel.mutateAsync(deleteTarget.id); setDeleteTarget(null); }}
        loading={deleteModel.isPending}
        confirmLabel="Excluir"
      />
    </div>
  );
}
