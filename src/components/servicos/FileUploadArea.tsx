import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FILE_TYPE_LABELS } from "@/lib/services";

export interface PendingFile {
  file: File;
  type: string;
}

interface FileUploadAreaProps {
  pendingFiles: PendingFile[];
  onAdd: (files: PendingFile[]) => void;
  onRemove: (index: number) => void;
  onTypeChange: (index: number, type: string) => void;
}

const ACCEPTED = ".pdf,.jpg,.jpeg,.png";
const MAX_SIZE = 10 * 1024 * 1024;

export function FileUploadArea({ pendingFiles, onAdd, onRemove, onTypeChange }: FileUploadAreaProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((fileList: FileList) => {
    const valid: PendingFile[] = [];
    Array.from(fileList).forEach((f) => {
      if (f.size > MAX_SIZE) return;
      const ext = f.name.split(".").pop()?.toLowerCase();
      if (!["pdf", "jpg", "jpeg", "png"].includes(ext || "")) return;
      valid.push({ file: f, type: "other" });
    });
    if (valid.length) onAdd(valid);
  }, [onAdd]);

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
        )}
      >
        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Arraste arquivos ou clique para selecionar</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (máx 10MB)</p>
        <input ref={inputRef} type="file" accept={ACCEPTED} multiple className="hidden" onChange={(e) => e.target.files && processFiles(e.target.files)} />
      </div>

      {pendingFiles.map((pf, i) => (
        <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-md px-3 py-2">
          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm flex-1 truncate">{pf.file.name}</span>
          <Select value={pf.type} onValueChange={(v) => onTypeChange(i, v)}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(FILE_TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemove(i)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}
