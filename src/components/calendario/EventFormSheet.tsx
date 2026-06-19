import { useEffect, useState } from "react";
import { z } from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AREA_META,
  CATEGORY_META,
  STATUS_META,
  ATTACHABLE_CATEGORIES,
  type CalendarArea,
  type CalendarCategory,
  type CalendarEventStatus,
} from "@/lib/calendar";
import {
  CalendarEvent,
  useUpsertCalendarEvent,
  useDeleteCalendarEvent,
} from "@/hooks/useCalendar";
import { EventAttachments } from "./EventAttachments";

const schema = z
  .object({
    title: z.string().trim().min(1, "Informe um título").max(200),
    description: z.string().max(2000).optional().or(z.literal("")),
    area: z.enum(["meio_ambiente", "seguranca", "saude", "geral"]),
    category: z.enum(["evento", "campanha", "auditoria", "reuniao", "treinamento_interno", "outro"]),
    starts_at_date: z.string().min(1, "Data obrigatória"),
    starts_at_time: z.string().optional(),
    ends_at_date: z.string().optional(),
    ends_at_time: z.string().optional(),
    all_day: z.boolean(),
    location: z.string().max(300).optional().or(z.literal("")),
    status: z.enum(["planejado", "concluido", "cancelado"]),
  })
  .refine(
    (v) => v.all_day || (v.starts_at_time && v.starts_at_time.length === 5),
    { message: "Informe a hora de início", path: ["starts_at_time"] },
  );

function toIso(date: string, time?: string, allDay?: boolean) {
  if (!date) return "";
  if (allDay) return new Date(`${date}T00:00:00`).toISOString();
  return new Date(`${date}T${time || "00:00"}:00`).toISOString();
}

function splitIso(iso: string | null | undefined) {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent | null;
  defaultDate?: Date | null;
  canEdit: boolean;
}

export function EventFormSheet({ open, onOpenChange, event, defaultDate, canEdit }: Props) {
  const upsert = useUpsertCalendarEvent();
  const del = useDeleteCalendarEvent();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    area: "geral" as CalendarArea,
    category: "evento" as CalendarCategory,
    starts_at_date: "",
    starts_at_time: "09:00",
    ends_at_date: "",
    ends_at_time: "10:00",
    all_day: false,
    location: "",
    status: "planejado" as CalendarEventStatus,
  });

  useEffect(() => {
    if (!open) return;
    if (event) {
      const s = splitIso(event.starts_at);
      const e = splitIso(event.ends_at);
      setForm({
        title: event.title,
        description: event.description ?? "",
        area: event.area,
        category: event.category,
        starts_at_date: s.date,
        starts_at_time: s.time || "09:00",
        ends_at_date: e.date,
        ends_at_time: e.time || "10:00",
        all_day: event.all_day,
        location: event.location ?? "",
        status: event.status,
      });
    } else {
      const d = defaultDate ?? new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      setForm({
        title: "",
        description: "",
        area: "geral",
        category: "evento",
        starts_at_date: dateStr,
        starts_at_time: "09:00",
        ends_at_date: dateStr,
        ends_at_time: "10:00",
        all_day: false,
        location: "",
        status: "planejado",
      });
    }
  }, [open, event, defaultDate]);

  const handleSubmit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const starts_at = toIso(form.starts_at_date, form.starts_at_time, form.all_day);
    const ends_at = form.ends_at_date
      ? toIso(form.ends_at_date, form.ends_at_time, form.all_day)
      : null;
    if (ends_at && new Date(ends_at) < new Date(starts_at)) {
      toast.error("A data final deve ser posterior à inicial");
      return;
    }
    await upsert.mutateAsync({
      id: event?.id,
      title: form.title,
      description: form.description,
      area: form.area,
      category: form.category,
      starts_at,
      ends_at,
      all_day: form.all_day,
      location: form.location,
      status: form.status,
    });
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!event) return;
    await del.mutateAsync(event.id);
    setConfirmDelete(false);
    onOpenChange(false);
  };

  const canAttach = ATTACHABLE_CATEGORIES.includes(form.category);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{event ? "Editar evento" : "Novo evento"}</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-6">
            <div>
              <Label>Título *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                disabled={!canEdit}
                maxLength={200}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Área</Label>
                <Select value={form.area} onValueChange={(v) => setForm((p) => ({ ...p, area: v as CalendarArea }))} disabled={!canEdit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(AREA_META).map(([k, m]) => (
                      <SelectItem key={k} value={k}>
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />
                          {m.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v as CalendarCategory }))} disabled={!canEdit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_META).map(([k, label]) => (
                      <SelectItem key={k} value={k}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <Label className="!m-0">Dia inteiro</Label>
              <Switch checked={form.all_day} onCheckedChange={(v) => setForm((p) => ({ ...p, all_day: v }))} disabled={!canEdit} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Início *</Label>
                <div className="flex gap-2">
                  <Input type="date" value={form.starts_at_date} onChange={(e) => setForm((p) => ({ ...p, starts_at_date: e.target.value }))} disabled={!canEdit} />
                  {!form.all_day && (
                    <Input type="time" value={form.starts_at_time} onChange={(e) => setForm((p) => ({ ...p, starts_at_time: e.target.value }))} disabled={!canEdit} />
                  )}
                </div>
              </div>
              <div>
                <Label>Fim</Label>
                <div className="flex gap-2">
                  <Input type="date" value={form.ends_at_date} onChange={(e) => setForm((p) => ({ ...p, ends_at_date: e.target.value }))} disabled={!canEdit} />
                  {!form.all_day && (
                    <Input type="time" value={form.ends_at_time} onChange={(e) => setForm((p) => ({ ...p, ends_at_time: e.target.value }))} disabled={!canEdit} />
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label>Local</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="Sala, planta, link da reunião…"
                disabled={!canEdit}
                maxLength={300}
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={4}
                disabled={!canEdit}
                maxLength={2000}
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as CalendarEventStatus }))} disabled={!canEdit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_META).map(([k, m]) => (
                    <SelectItem key={k} value={k}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {event && canAttach && (
              <>
                <Separator />
                <EventAttachments eventId={event.id} canEdit={canEdit} />
              </>
            )}

            {event && !canAttach && (
              <p className="text-xs text-muted-foreground">
                Anexos disponíveis apenas para eventos e campanhas.
              </p>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              {event && canEdit ? (
                <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-4 w-4 mr-1.5" /> Excluir
                </Button>
              ) : <div />}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                {canEdit && (
                  <Button onClick={handleSubmit} disabled={upsert.isPending}>
                    {upsert.isPending ? "Salvando…" : "Salvar"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evento</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os anexos do evento também serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}