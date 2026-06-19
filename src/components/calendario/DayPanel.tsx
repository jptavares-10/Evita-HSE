import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink, MapPin, Clock } from "lucide-react";
import {
  AREA_META,
  CATEGORY_META,
  STATUS_META,
  SOURCE_MODULE_META,
  dueStatus,
  dueStatusColor,
} from "@/lib/calendar";
import type { CalendarDueItem, CalendarEvent } from "@/hooks/useCalendar";

interface Props {
  date: Date;
  events: CalendarEvent[];
  dueItems: CalendarDueItem[];
  onCreate: () => void;
  onEventClick: (event: CalendarEvent) => void;
  canEdit: boolean;
}

export function DayPanel({ date, events, dueItems, onCreate, onEventClick, canEdit }: Props) {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{format(date, "EEEE", { locale: ptBR })}</p>
          <h3 className="text-xl font-bold">{format(date, "dd 'de' MMMM", { locale: ptBR })}</h3>
        </div>
        {canEdit && (
          <Button size="sm" onClick={onCreate}>
            <Plus className="h-4 w-4 mr-1.5" /> Novo
          </Button>
        )}
      </div>

      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Eventos ({events.length})
        </h4>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem eventos neste dia.</p>
        ) : (
          <div className="space-y-2">
            {events.map((e) => {
              const areaMeta = AREA_META[e.area];
              const statusMeta = STATUS_META[e.status];
              const dotColor = e.color || areaMeta.color;
              return (
                <button
                  key={e.id}
                  onClick={() => onEventClick(e)}
                  className="w-full text-left p-3 rounded-md border bg-card hover:bg-accent transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="h-3 w-3 rounded-full mt-1 flex-shrink-0" style={{ background: dotColor }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">{e.title}</span>
                        <Badge variant="outline" className={`text-[10px] ${statusMeta.className}`}>
                          {statusMeta.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{areaMeta.label} • {CATEGORY_META[e.category]}</span>
                        {!e.all_day && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(e.starts_at), "HH:mm")}
                          </span>
                        )}
                        {e.location && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3" /> {e.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Vencimentos ({dueItems.length})
        </h4>
        {dueItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem vencimentos neste dia.</p>
        ) : (
          <div className="space-y-2">
            {dueItems.map((d) => {
              const meta = SOURCE_MODULE_META[d.source_module] ?? { label: d.source_module, color: "#64748B" };
              const status = dueStatus(d.due_date);
              return (
                <button
                  key={d.source_module + d.source_id}
                  onClick={() => navigate(d.deep_link)}
                  className="w-full text-left p-3 rounded-md border bg-card hover:bg-accent transition-colors group"
                >
                  <div className="flex items-start gap-2">
                    <span className="h-3 w-3 rounded-full mt-1 flex-shrink-0" style={{ background: dueStatusColor(status) }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{d.title}</span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <Badge variant="outline" style={{ borderColor: meta.color, color: meta.color }}>
                          {meta.label}
                        </Badge>
                        {d.subtitle && <span className="text-muted-foreground truncate">{d.subtitle}</span>}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}