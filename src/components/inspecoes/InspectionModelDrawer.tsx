import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useSaveInspectionModel } from "@/hooks/useInspections";
import { useDocuments } from "@/hooks/useDocuments";
import { useAuth } from "@/contexts/AuthContext";
import { FREQUENCY_TYPES } from "@/lib/inspections";
import { X, FileText, ExternalLink } from "lucide-react";
import { useSignedUrl } from "@/hooks/useSignedUrl";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: any | null;
  sectors: any[];
  profiles: any[];
}

export function InspectionModelDrawer({ open, onOpenChange, editing, sectors, profiles }: Props) {
  const { company, profile } = useAuth();
  const saveModel = useSaveInspectionModel();
  const { data: allDocs = [] } = useDocuments();
  const activeDocs = allDocs.filter((d: any) => d.status === "active");

  const [name, setName] = useState("");
  const [relatedNr, setRelatedNr] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [frequencyType, setFrequencyType] = useState("daily");
  const [frequencyDays, setFrequencyDays] = useState<number>(7);
  const [responsibleId, setResponsibleId] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [alertHours, setAlertHours] = useState(24);
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    if (editing) {
      setName(editing.name || "");
      setRelatedNr(editing.related_nr || "");
      setSectorId(editing.sector_id || "");
      setFrequencyType(editing.frequency_type || "daily");
      setFrequencyDays(editing.frequency_days || 7);
      setResponsibleId(editing.default_responsible_id || "");
      setDocumentId(editing.document_id || "");
      setAlertHours(editing.alert_hours_before ?? 24);
      setIsActive(editing.status === "active");
    } else {
      setName("");
      setRelatedNr("");
      setSectorId("");
      setFrequencyType("daily");
      setFrequencyDays(7);
      setResponsibleId("");
      setDocumentId("");
      setAlertHours(24);
      setIsActive(true);
    }
  };

  const handleOpenChange = (v: boolean) => {
    if (v) resetForm();
    onOpenChange(v);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    await saveModel.mutateAsync({
      id: editing?.id,
      name: name.trim(),
      related_nr: relatedNr.trim() || null,
      sector_id: sectorId || null,
      frequency_type: frequencyType,
      frequency_days: frequencyType === "custom" ? frequencyDays : null,
      default_responsible_id: responsibleId || null,
      document_id: documentId || null,
      alert_hours_before: alertHours,
      status: isActive ? "active" : "inactive",
    });
    onOpenChange(false);
  };

  const selectedDoc = documentId ? allDocs.find((d: any) => d.id === documentId) : null;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editing ? "Editar modelo" : "Novo modelo de inspeção"}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Identificação */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Identificação</h3>
            <div className="space-y-2">
              <Label>Nome da inspeção *</Label>
              <Input placeholder="Ex: Inspeção Diária de EPIs" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>NR relacionada</Label>
              <Input placeholder="Ex: NR-5, NR-12, NR-35" value={relatedNr} onChange={(e) => setRelatedNr(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Setor / Área</Label>
              <Select value={sectorId} onValueChange={setSectorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {sectors.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Periodicidade */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Periodicidade</h3>
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={frequencyType} onValueChange={setFrequencyType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FREQUENCY_TYPES).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {frequencyType === "custom" && (
              <div className="space-y-2">
                <Label>A cada quantos dias?</Label>
                <Input type="number" min={1} value={frequencyDays} onChange={(e) => setFrequencyDays(Number(e.target.value))} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Alertar com antecedência de (horas)</Label>
              <Input type="number" min={1} value={alertHours} onChange={(e) => setAlertHours(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">Alerta {alertHours} horas antes do prazo</p>
            </div>
          </section>

          {/* Responsável */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Responsável</h3>
            <div className="space-y-2">
              <Label>Responsável padrão</Label>
              <Select value={responsibleId} onValueChange={setResponsibleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {profiles.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Pode ser alterado em cada execução individualmente</p>
            </div>
          </section>

          {/* Documento de referência */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Documento de referência</h3>
            {selectedDoc ? (
              <div className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-2 rounded-md">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="flex-1 truncate font-medium">
                  {selectedDoc.code && <span className="text-muted-foreground font-mono mr-1">{selectedDoc.code}</span>}
                  {selectedDoc.title}
                </span>
                <button onClick={() => setDocumentId("")} className="text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Select value={documentId} onValueChange={setDocumentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Buscar por título ou código..." />
                </SelectTrigger>
                <SelectContent>
                  {activeDocs.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.code ? `${d.code} — ` : ""}{d.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground">Checklist ou formulário de referência. Ficará disponível em cada execução para o inspetor baixar antes de iniciar.</p>
          </section>

          {/* Status */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status</h3>
            <div className="flex items-center gap-3">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <span className="text-sm">{isActive ? "Modelo ativo" : "Modelo inativo"}</span>
            </div>
            {!isActive && <p className="text-xs text-muted-foreground">Modelos inativos não geram novas execuções.</p>}
          </section>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave} disabled={!name.trim() || saveModel.isPending}>
              {saveModel.isPending ? "Salvando..." : "Salvar modelo"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
