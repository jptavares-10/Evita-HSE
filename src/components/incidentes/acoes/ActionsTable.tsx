import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink } from "lucide-react";
import { getActionState, ACTION_STATE_META, getPriorityInfo, daysUntil, getTypeInfo } from "@/lib/occurrences";

interface Props {
  actions: any[];
}

export function ActionsTable({ actions }: Props) {
  if (actions.length === 0) {
    return (
      <div className="rounded-xl border bg-card py-12 text-center text-sm text-muted-foreground">
        Nenhuma ação encontrada com estes filtros.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ação</TableHead>
            <TableHead className="w-40">Responsável</TableHead>
            <TableHead className="w-32">Prazo</TableHead>
            <TableHead className="w-32">Situação</TableHead>
            <TableHead className="w-28">Prioridade</TableHead>
            <TableHead className="w-24 text-right">Ocorrência</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actions.map((a) => {
            const state = getActionState(a);
            const meta = ACTION_STATE_META[state];
            const priority = getPriorityInfo(a.priority);
            const days = daysUntil(a.due_date);
            const typeInfo = a.occurrence?.type ? getTypeInfo(a.occurrence.type) : null;
            return (
              <TableRow key={a.id}>
                <TableCell className="max-w-[380px]">
                  <p className="truncate text-sm font-medium">{a.description}</p>
                  {typeInfo && (
                    <p className="truncate text-xs text-muted-foreground">
                      {typeInfo.label}
                      {a.occurrence?.location ? ` · ${a.occurrence.location}` : ""}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-sm">{a.responsible?.full_name || "—"}</TableCell>
                <TableCell className="text-sm">
                  {a.due_date ? a.due_date.split("-").reverse().join("/") : "—"}
                  {state === "overdue" && days !== null && (
                    <span className="block text-xs text-destructive">{Math.abs(days)}d em atraso</span>
                  )}
                  {state !== "overdue" && state !== "completed" && state !== "verified" && days !== null && days <= 7 && (
                    <span className="block text-xs text-warning">vence em {days}d</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] ${meta.color}`}>{meta.label}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] ${priority.color}`}>{priority.label}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                    <Link to={`/incidentes/${a.occurrence_id}`} title="Abrir ocorrência">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
