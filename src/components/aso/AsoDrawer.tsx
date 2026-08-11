import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSaveAsoRecord, useAsoExamTypes } from "@/hooks/useAso";
import { useEmployees } from "@/hooks/useTrainings";
import { useToast } from "@/hooks/use-toast";
import { storageUpload } from "@/lib/storage-utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editRecord?: any;
  preselectedEmployeeId?: string;
}

export function AsoDrawer({ open, onOpenChange, editRecord, preselectedEmployeeId }: Props) {
  const { company } = useAuth();
  const { toast } = useToast();
  const save = useSaveAsoRecord();
  const { data: examTypes = [] } = useAsoExamTypes();
  const { data: employees = [] } = useEmployees();
  const activeEmployees = employees.filter((e: any) => e.status === "active");

  const [employeeId, setEmployeeId] = useState("");
  const [examTypeId, setExamTypeId] = useState("");
  const [examDate, setExamDate] = useState<Date | undefined>();
  const [result, setResult] = useState("apto");
  const [doctorName, setDoctorName] = useState("");
  const [crm, setCrm] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open && editRecord) {
      setEmployeeId(editRecord.employee_id);
      setExamTypeId(editRecord.exam_type_id);
      setExamDate(editRecord.exam_date ? new Date(editRecord.exam_date + "T00:00:00") : undefined);
      setResult(editRecord.result);
      setDoctorName(editRecord.doctor_name || "");
      setCrm(editRecord.crm || "");
      setNotes(editRecord.notes || "");
      setExistingFileUrl(editRecord.file_url);
      setExistingFileName(editRecord.file_name);
      setFile(null);
    } else if (open) {
      setEmployeeId(preselectedEmployeeId || "");
      setExamTypeId("");
      setExamDate(undefined);
      setResult("apto");
      setDoctorName("");
      setCrm("");
      setNotes("");
      setFile(null);
      setExistingFileUrl(null);
      setExistingFileName(null);
    }
  }, [open, editRecord]);

  const selectedType = examTypes.find((t: any) => t.id === examTypeId);

  const handleSubmit = async () => {
    if (!employeeId || !examTypeId || !examDate || !company) return;
    setUploading(true);
    try {
      let fileUrl = existingFileUrl;
      let fileName = existingFileName;

      if (file) {
        const path = `${company.id}/${crypto.randomUUID()}/${file.name}`;
        const { error: upErr } = await storageUpload("aso-files", path, file);
        if (upErr) throw upErr;
        fileUrl = path;
        fileName = file.name;
      }

      await save.mutateAsync({
        id: editRecord?.id,
        employee_id: employeeId,
        exam_type_id: examTypeId,
        exam_date: format(examDate, "yyyy-MM-dd"),
        validity_months: selectedType?.validity_months,
        result,
        doctor_name: doctorName || null,
        crm: crm || null,
        file_url: fileUrl,
        file_name: fileName,
        notes: notes || null,
      });
      onOpenChange(false);
    } catch {
      toast({ title: "Erro ao salvar ASO", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editRecord ? "Editar ASO" : "Novo ASO"}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-4 px-6">
          <div className="space-y-1.5">
            <Label>Colaborador *</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger><SelectValue placeholder="Selecione o colaborador" /></SelectTrigger>
              <SelectContent>
                {activeEmployees.map((e: any) => (
                  <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Tipo de exame *</Label>
            <Select value={examTypeId} onValueChange={setExamTypeId}>
              <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
              <SelectContent>
                {examTypes.map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}{t.validity_months ? ` (${t.validity_months} meses)` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Data do exame *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !examDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {examDate ? format(examDate, "dd/MM/yyyy") : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={examDate} onSelect={setExamDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          {selectedType?.validity_months && examDate && (
            <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
              Vencimento calculado: {format(new Date(new Date(examDate).setMonth(examDate.getMonth() + selectedType.validity_months)), "dd/MM/yyyy")}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Resultado *</Label>
            <Select value={result} onValueChange={setResult}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="apto">Apto</SelectItem>
                <SelectItem value="inapto">Inapto</SelectItem>
                <SelectItem value="apto_com_restricao">Apto com restrição</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Médico</Label>
              <Input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} placeholder="Nome do médico" />
            </div>
            <div className="space-y-1.5">
              <Label>CRM</Label>
              <Input value={crm} onChange={(e) => setCrm(e.target.value)} placeholder="CRM" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Documento do ASO</Label>
            {existingFileName && !file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded p-2">
                <span className="truncate flex-1">{existingFileName}</span>
                <button onClick={() => { setExistingFileUrl(null); setExistingFileName(null); }}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <label className="flex items-center gap-2 border border-dashed rounded-md p-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{file ? file.name : "Anexar PDF do ASO"}</span>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          <Button className="w-full mt-2" onClick={handleSubmit} disabled={!employeeId || !examTypeId || !examDate || uploading}>
            {uploading ? "Salvando..." : editRecord ? "Salvar alterações" : "Registrar ASO"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
