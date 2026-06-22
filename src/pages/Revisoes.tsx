import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useMyPendingReviews } from "@/hooks/useDocumentReviews";
import { useTablePagination } from "@/hooks/useTablePagination";
import { DataTablePagination } from "@/components/DataTablePagination";
import { ReviewResponseDrawer } from "@/components/documentos/ReviewResponseDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateBR } from "@/lib/documents";
import { differenceInDays, parseISO } from "date-fns";
import { Inbox, FileText, Clock } from "lucide-react";

export default function Revisoes() {
  usePageTitle("Documentos para Revisar — Evita HSE", { description: "Documentos pendentes de revisão.", noindex: true });
  const { data: allReviews = [], isLoading } = useMyPendingReviews();
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pending = allReviews.filter((r: any) =>
    r.status === "pending" &&
    (r.document_review_cycles?.status === "open" || r.document_review_cycles?.status === "reviewing")
  );
  const responded = allReviews.filter((r: any) =>
    r.status === "approved" || r.status === "rejected"
  );

  const pendingPagination = useTablePagination(pending);
  const respondedPagination = useTablePagination(responded);

  const openResponse = (assignment: any) => {
    setSelectedAssignment(assignment);
    setDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold">Documentos para revisar</h1>
          <p className="text-muted-foreground text-sm mt-1">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold">Documentos para revisar</h1>
        <p className="text-muted-foreground text-sm mt-1">Documentos aguardando sua confirmação de leitura ou parecer.</p>
      </div>

      {/* Pending section */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Pendentes
          {pending.length > 0 && <Badge variant="destructive" className="text-[10px]">{pending.length}</Badge>}
        </h2>

        {pending.length === 0 ? (
          <div className="text-center py-12 lp-card rounded-xl">
            <Inbox className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma revisão pendente.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {pendingPagination.paginatedData.map((r: any) => {
                const cycle = r.document_review_cycles;
                const doc = cycle?.documents;
                if (!cycle || !doc) return null;

                const daysLeft = cycle.due_date ? differenceInDays(parseISO(cycle.due_date), new Date()) : null;

                return (
                  <div key={r.id} className="lp-card rounded-xl p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="destructive" className="text-[10px] mb-1.5">PENDENTE</Badge>
                        <p className="font-medium text-sm">
                          {doc.code && <span className="text-muted-foreground font-mono mr-1">{doc.code}</span>}
                          {doc.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Revisão: {cycle.document_revisions?.revision_number || doc.current_revision} · Enviado por {cycle.profiles?.full_name} em {formatDateBR(cycle.created_at)}
                        </p>
                      </div>
                    </div>

                    {daysLeft !== null && (
                      <p className={`text-xs font-medium ${daysLeft < 3 ? "text-destructive" : "text-muted-foreground"}`}>
                        Prazo: {formatDateBR(cycle.due_date)} — {daysLeft >= 0 ? `${daysLeft} dias restantes` : "Prazo vencido"}
                      </p>
                    )}

                    {cycle.message && (
                      <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2 italic">"{cycle.message}"</p>
                    )}

                    <div className="flex gap-2 pt-1">
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => openResponse(r)}>
                        Responder
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            {pendingPagination.totalPages > 1 && (
              <DataTablePagination
                currentPage={pendingPagination.currentPage}
                totalPages={pendingPagination.totalPages}
                pageSize={pendingPagination.pageSize}
                totalItems={pendingPagination.totalItems}
                onPageChange={pendingPagination.setCurrentPage}
                onPageSizeChange={pendingPagination.setPageSize}
              />
            )}
          </>
        )}
      </div>

      {/* Responded section */}
      {responded.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Respondidas
          </h2>

          <div className="space-y-2">
            {respondedPagination.paginatedData.map((r: any) => {
              const cycle = r.document_review_cycles;
              const doc = cycle?.documents;
              if (!cycle || !doc) return null;

              return (
                <div key={r.id} className="lp-card rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-sm">
                      {doc.code && <span className="text-muted-foreground font-mono mr-1">{doc.code}</span>}
                      {doc.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cycle.document_revisions?.revision_number || doc.current_revision} · Respondido em {formatDateBR(r.responded_at)}
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${r.status === "approved" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                    {r.status === "approved" ? "Aprovado" : "Modificações"}
                  </Badge>
                </div>
              );
            })}
          </div>
          {respondedPagination.totalPages > 1 && (
            <DataTablePagination
              currentPage={respondedPagination.currentPage}
              totalPages={respondedPagination.totalPages}
              pageSize={respondedPagination.pageSize}
              totalItems={respondedPagination.totalItems}
              onPageChange={respondedPagination.setCurrentPage}
              onPageSizeChange={respondedPagination.setPageSize}
            />
          )}
        </div>
      )}

      <ReviewResponseDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        assignment={selectedAssignment}
      />
    </div>
  );
}
