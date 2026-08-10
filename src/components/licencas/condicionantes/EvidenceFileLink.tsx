import { FileText, Download } from "lucide-react";
import { useSignedUrl } from "@/hooks/useSignedUrl";

export function EvidenceFileLink({ path, name }: { path: string; name: string }) {
  const url = useSignedUrl("license-conditionants", path);
  return (
    <a
      href={url || undefined}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/50 ${!url ? "pointer-events-none opacity-60" : ""}`}
    >
      <span className="flex items-center gap-2 truncate"><FileText className="h-4 w-4 shrink-0" />{name}</span>
      <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
    </a>
  );
}