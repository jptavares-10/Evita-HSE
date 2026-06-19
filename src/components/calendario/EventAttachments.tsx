import { useRef, useState } from "react";
import { Upload, X, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useCalendarAttachments,
  useUploadCalendarAttachment,
  useDeleteCalendarAttachment,
  type CalendarAttachment,
} from "@/hooks/useCalendar";
import { ALLOWED_FILE_TYPES, MAX_ATTACHMENTS, MAX_FILE_SIZE } from "@/lib/calendar";
import { useSignedUrl } from "@/hooks/useSignedUrl";

interface Props {
  eventId: string;
  canEdit: boolean;
}

export function EventAttachments({ eventId, canEdit }: Props) {
  const { data: attachments = [] } = useCalendarAttachments(eventId);
  const upload = useUploadCalendarAttachment();
  const del = useDeleteCalendarAttachment();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (remaining <= 0) {
      toast.error(`Máximo de ${MAX_ATTACHMENTS} anexos por evento`);
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    for (const file of toUpload) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error(`${file.name}: tipo não permitido (JPG, PNG, WEBP, PDF)`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: máximo 20MB`);
        continue;
      }
      await upload.mutateAsync({ eventId, file });
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Anexos ({attachments.length}/{MAX_ATTACHMENTS})</h3>
        {canEdit && attachments.length < MAX_ATTACHMENTS && (
          <>
            <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              {uploading ? "Enviando…" : "Adicionar"}
            </Button>
            <input
              ref={inputRef}
              type="file"
              hidden
              multiple
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </>
        )}
      </div>

      {attachments.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum anexo. Fotos, listas de presença ou PDFs (até 5 arquivos).</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((a) => (
            <AttachmentRow key={a.id} attachment={a} canEdit={canEdit} onDelete={() => del.mutate(a)} />
          ))}
        </div>
      )}
    </section>
  );
}

function AttachmentRow({
  attachment, canEdit, onDelete,
}: { attachment: CalendarAttachment; canEdit: boolean; onDelete: () => void }) {
  const signed = useSignedUrl("calendar-attachments", attachment.file_url);
  return (
    <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2">
      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="text-sm flex-1 truncate">{attachment.file_name}</span>
      {signed && (
        <a href={signed} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
      {canEdit && (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}