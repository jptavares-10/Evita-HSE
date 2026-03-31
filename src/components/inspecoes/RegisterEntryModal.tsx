import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddEntry } from "@/hooks/useInspections";
import { useEmployees } from "@/hooks/useTrainings";
import { useSignedUrl } from "@/hooks/useSignedUrl";
import { Download } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  executionId: string;
  inspectionName: string;
  documentFileUrl?: string | null;
  documentFileName?: string | null;
}

export function RegisterEntryModal({ open, onOpenChange, executionId, inspectionName, documentFileUrl, documentFileName }: Props) {
  const addEntry = useAddEntry();
  const { data: employees = [] } = useEmployees();
  const activeEmployees = employees.filter((e: any) => e.status === "active");

  const [employeeId, setEmployeeId] = useState("");
  const [isExternal, setIsExternal] = useState(false);
  const [externalName, setExternalName] = useState("");
  const [executedAt, setExecutedAt] = useState(new Date().toISOString().slice(0, 16));
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  const signedUrl = useSignedUrl("documents-library", documentFileUrl ?? null);

  const resetForm = () => {
    setEmployeeId("");
    setIsExternal(false);
    setExternalName("");
    setExecutedAt(new Date().toISOString().slice(0, 16));
    setFile(null);
    setNotes("");
  };

  const selectedEmployee = employeeId ? activeEmployees.find((e: any) => e.id === employeeId) : null;
  const employeeName = isExternal ? externalName.trim() : (selectedEmployee?.name || "");

  const canSave = employeeName && executedAt && file;

  const handleSave = async () => {
    if (!canSave || !file) return;
    await addEntry.mutateAsync({
      execution_id: executionId,
      employee_id: isExternal ? null : (employeeId || null),
      employee_name: employeeName,
      executed_at: new Date(executedAt).toISOString(),
      file,
      notes: notes.trim() || null,
    });
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Registro — {inspectionName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {signedUrl && (
            <a href={signedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
              <Download className="h-4 w-4" />
              Baixar checklist em branco →
            </a>
          )}

          <div className="space-y-2">
            <Label>Colaborador executor *</Label>
            <div className="flex items-center gap-2 mb-1">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input type="checkbox" checked={isExternal} onChange={(e) => { setIsExternal(e.target.checked); setEmployeeId(""); }} className="rounded" />
                Colaborador externo / não cadastrado
              </label>
            </div>
            {isExternal ? (
              <Input placeholder="Nome do colaborador" value={externalName} onChange={(e) => setExternalName(e.target.value)} />
            ) : (
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o colaborador..." />
                </SelectTrigger>
                <SelectContent>
                  {activeEmployees.map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Data e hora de execução *</Label>
            <Input type="datetime-local" value={executedAt} onChange={(e) => setExecutedAt(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Checklist físico preenchido * (PDF/JPG/PNG, máx 20MB)</Label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && f.size <= 20 * 1024 * 1024) setFile(f);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea placeholder="Opcional..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { resetForm(); onOpenChange(false); }}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave} disabled={!canSave || addEntry.isPending}>
              {addEntry.isPending ? "Salvando..." : "Adicionar registro"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
