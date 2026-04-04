import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "ellipsis")[] = [];

  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("ellipsis");
    pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1);
    pages.push("ellipsis");
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push("ellipsis");
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push("ellipsis");
    pages.push(total);
  }

  return pages;
}

export function DataTablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Itens por página:</span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="h-8 w-[70px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <span className="text-xs text-muted-foreground whitespace-nowrap">
        Mostrando {startItem}-{endItem} de {totalItems} registros
      </span>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Mobile: compact */}
          <div className="flex sm:hidden items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs px-2 whitespace-nowrap">{currentPage} / {totalPages}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop: full */}
          <div className="hidden sm:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Anterior
            </Button>

            {pageNumbers.map((page, idx) =>
              page === "ellipsis" ? (
                <span key={`e-${idx}`} className="px-1 text-xs text-muted-foreground">…</span>
              ) : (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 w-8 text-xs p-0 ${
                    page === currentPage
                      ? "bg-[#2563EB] text-white hover:bg-[#2563EB]/90"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              )
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Próximo
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
