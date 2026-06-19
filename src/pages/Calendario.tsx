import { useMemo, useState } from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";
import { usePermission } from "@/hooks/usePermission";
import {
  useCalendarEvents,
  useCalendarDueItems,
  type CalendarEvent,
  type CalendarDueItem,
} from "@/hooks/useCalendar";
import { AREA_META, SOURCE_MODULE_META, dueStatus, dueStatusColor } from "@/lib/calendar";
import { EventFormSheet } from "@/components/calendario/EventFormSheet";
import { DayPanel } from "@/components/calendario/DayPanel";
import { PermissionButton } from "@/components/PermissionButton";

export default function Calendario() {
  usePageTitle("Calendário");
  const { canEdit } = usePermission("calendar");

  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const rangeStart = useMemo(() => startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 }), [cursor]);
  const rangeEnd = useMemo(() => endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 }), [cursor]);

  const { data: events = [] } = useCalendarEvents(rangeStart, addDays(rangeEnd, 1));
  const { data: dueItems = [] } = useCalendarDueItems(rangeStart, rangeEnd);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((e) => {
      const k = new Date(e.starts_at).toDateString();
      const arr = map.get(k) ?? [];
      arr.push(e);
      map.set(k, arr);
    });
    return map;
  }, [events]);

  const dueByDay = useMemo(() => {
    const map = new Map<string, CalendarDueItem[]>();
    dueItems.forEach((d) => {
      const k = new Date(d.due_date + "T00:00:00").toDateString();
      const arr = map.get(k) ?? [];
      arr.push(d);
      map.set(k, arr);
    });
    return map;
  }, [dueItems]);

  const days = useMemo(() => {
    const arr: Date[] = [];
    let d = rangeStart;
    while (d <= rangeEnd) {
      arr.push(d);
      d = addDays(d, 1);
    }
    return arr;
  }, [rangeStart, rangeEnd]);

  const selKey = selectedDate.toDateString();
  const selectedEvents = eventsByDay.get(selKey) ?? [];
  const selectedDue = dueByDay.get(selKey) ?? [];

  const searchLower = search.trim().toLowerCase();
  const searchHits = useMemo(() => {
    if (!searchLower) return null;
    const evHits = events
      .filter((e) =>
        e.title.toLowerCase().includes(searchLower) ||
        (e.description ?? "").toLowerCase().includes(searchLower) ||
        (e.location ?? "").toLowerCase().includes(searchLower),
      )
      .slice(0, 20);
    const dueHits = dueItems
      .filter((d) =>
        d.title.toLowerCase().includes(searchLower) ||
        (d.subtitle ?? "").toLowerCase().includes(searchLower) ||
        (SOURCE_MODULE_META[d.source_module]?.label ?? "").toLowerCase().includes(searchLower),
      )
      .slice(0, 20);
    return { evHits, dueHits };
  }, [searchLower, events, dueItems]);

  const handleCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditing(event);
    setSheetOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendário</h1>
          <p className="text-sm text-muted-foreground">
            Eventos, campanhas, auditorias e vencimentos da sua empresa.
          </p>
        </div>
        <PermissionButton canEdit={canEdit} onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1.5" /> Novo evento
        </PermissionButton>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCursor(addMonths(cursor, -1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold w-44 text-center capitalize">
                {format(cursor, "MMMM yyyy", { locale: ptBR })}
              </span>
              <Button variant="outline" size="icon" onClick={() => setCursor(addMonths(cursor, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setCursor(new Date()); setSelectedDate(new Date()); }}>
                Hoje
              </Button>
            </div>

            <div className="relative w-80">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos e vencimentos…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            {Object.entries(AREA_META).map(([k, m]) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: m.color }} /> {m.label}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-amber-500" /> Vencimento próximo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-red-600" /> Vencido
            </span>
          </div>

          {searchHits ? (
            <SearchResults
              evHits={searchHits.evHits}
              dueHits={searchHits.dueHits}
              onSelectEvent={handleEdit}
            />
          ) : (
            <MonthGrid
              days={days}
              cursor={cursor}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              eventsByDay={eventsByDay}
              dueByDay={dueByDay}
            />
          )}
        </div>

        <aside className="border rounded-lg p-4 bg-card h-fit sticky top-4">
          <DayPanel
            date={selectedDate}
            events={selectedEvents}
            dueItems={selectedDue}
            onCreate={handleCreate}
            onEventClick={handleEdit}
            canEdit={canEdit}
          />
        </aside>
      </div>

      <EventFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        event={editing}
        defaultDate={selectedDate}
        canEdit={canEdit}
      />
    </div>
  );
}

// ── Month grid ──

interface MonthGridProps {
  days: Date[];
  cursor: Date;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  eventsByDay: Map<string, CalendarEvent[]>;
  dueByDay: Map<string, CalendarDueItem[]>;
}

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function MonthGrid({ days, cursor, selectedDate, onSelectDate, eventsByDay, dueByDay }: MonthGridProps) {
  const today = new Date();
  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="grid grid-cols-7 bg-muted/50 text-xs font-semibold text-muted-foreground">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="px-2 py-2 text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const key = d.toDateString();
          const evs = eventsByDay.get(key) ?? [];
          const dues = dueByDay.get(key) ?? [];
          const inMonth = isSameMonth(d, cursor);
          const isToday = isSameDay(d, today);
          const isSelected = isSameDay(d, selectedDate);
          return (
            <button
              key={key}
              onClick={() => onSelectDate(d)}
              className={cn(
                "min-h-[110px] border-t border-l first:border-l-0 nth-7-no-border p-1.5 text-left flex flex-col gap-1 transition-colors",
                !inMonth && "bg-muted/30 text-muted-foreground/60",
                isSelected && "ring-2 ring-primary ring-inset",
                !isSelected && "hover:bg-accent/40",
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full",
                  isToday && "bg-primary text-primary-foreground",
                )}>
                  {d.getDate()}
                </span>
                {(evs.length + dues.length) > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {evs.length + dues.length}
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-0.5 overflow-hidden">
                {evs.slice(0, 2).map((e) => (
                  <div key={e.id} className="flex items-center gap-1 text-[11px] truncate">
                    <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: e.color || AREA_META[e.area].color }} />
                    <span className="truncate">{e.title}</span>
                  </div>
                ))}
                {dues.slice(0, 2).map((d) => {
                  const st = dueStatus(d.due_date);
                  return (
                    <div key={d.source_module + d.source_id} className="flex items-center gap-1 text-[11px] truncate">
                      <span className="h-1.5 w-1.5 rounded-sm flex-shrink-0" style={{ background: dueStatusColor(st) }} />
                      <span className="truncate italic text-muted-foreground">{d.title}</span>
                    </div>
                  );
                })}
                {evs.length + dues.length > 4 && (
                  <div className="text-[10px] text-muted-foreground">+{evs.length + dues.length - 4} mais…</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Search results ──

function SearchResults({
  evHits, dueHits, onSelectEvent,
}: {
  evHits: CalendarEvent[];
  dueHits: CalendarDueItem[];
  onSelectEvent: (e: CalendarEvent) => void;
}) {
  return (
    <div className="space-y-4">
      <section>
        <h3 className="text-sm font-semibold mb-2">Eventos ({evHits.length})</h3>
        {evHits.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum evento encontrado.</p>
        ) : (
          <div className="space-y-2">
            {evHits.map((e) => (
              <button
                key={e.id}
                onClick={() => onSelectEvent(e)}
                className="w-full text-left p-3 rounded-md border bg-card hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color || AREA_META[e.area].color }} />
                  <span className="font-medium text-sm flex-1 truncate">{e.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(e.starts_at), "dd/MM/yyyy")}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
      <section>
        <h3 className="text-sm font-semibold mb-2">Vencimentos ({dueHits.length})</h3>
        {dueHits.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum vencimento encontrado.</p>
        ) : (
          <div className="space-y-2">
            {dueHits.map((d) => {
              const meta = SOURCE_MODULE_META[d.source_module] ?? { label: d.source_module, color: "#64748B" };
              return (
                <a
                  key={d.source_module + d.source_id}
                  href={d.deep_link}
                  className="block p-3 rounded-md border bg-card hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: meta.color }} />
                    <span className="font-medium text-sm flex-1 truncate">{d.title}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {format(new Date(d.due_date + "T00:00:00"), "dd/MM/yyyy")}
                    </Badge>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}