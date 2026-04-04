import { useState, useMemo } from "react";
import { useMtrs, useWasteCategories } from "@/hooks/useMTR";
import { formatTons } from "@/lib/mtr";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTablePagination } from "@/hooks/useTablePagination";
import { DataTablePagination } from "@/components/DataTablePagination";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, BarChart3, Layers, FileWarning } from "lucide-react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer } from "recharts";
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MtrAnalise() {
  const { data: mtrs = [] } = useMtrs();
  const { data: categories = [] } = useWasteCategories();

  // Only MTRs with CDF received (has quantity data)
  const receivedMtrs = mtrs.filter((m: any) => m.cdf_status === "received");

  // Determine date range from data
  const allDates = receivedMtrs.map((m: any) => parseISO(m.issued_at));
  const minDate = allDates.length > 0 ? new Date(Math.min(...allDates.map((d) => d.getTime()))) : new Date();
  const maxDate = allDates.length > 0 ? new Date(Math.max(...allDates.map((d) => d.getTime()))) : new Date();

  const months = eachMonthOfInterval({ start: startOfMonth(minDate), end: endOfMonth(maxDate) });

  // Build chart data
  const chartData = useMemo(() => {
    return months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthMtrs = receivedMtrs.filter((m: any) => {
        const d = parseISO(m.issued_at);
        return isWithinInterval(d, { start: monthStart, end: monthEnd });
      });

      const entry: Record<string, any> = { month: format(month, "MMM/yy", { locale: ptBR }) };
      let total = 0;
      for (const cat of categories) {
        let catTotal = 0;
        for (const mtr of monthMtrs) {
          for (const wi of mtr.mtr_waste_items || []) {
            if (wi.waste_category_id === cat.id && wi.quantity_tons != null) {
              catTotal += Number(wi.quantity_tons);
            }
          }
        }
        entry[cat.name] = Number(catTotal.toFixed(3));
        total += catTotal;
      }
      entry["Total"] = Number(total.toFixed(3));
      return entry;
    });
  }, [months, receivedMtrs, categories]);

  // Summary stats
  const totalTons = receivedMtrs.reduce((sum: number, m: any) => {
    return sum + (m.mtr_waste_items || []).reduce((s: number, wi: any) => s + (Number(wi.quantity_tons) || 0), 0);
  }, 0);
  const avgMonthly = months.length > 0 ? totalTons / months.length : 0;

  // Category breakdown
  const catBreakdown = useMemo(() => {
    const map: Record<string, { name: string; color: string; total: number }> = {};
    for (const cat of categories) {
      map[cat.id] = { name: cat.name, color: cat.color, total: 0 };
    }
    for (const mtr of receivedMtrs) {
      for (const wi of mtr.mtr_waste_items || []) {
        if (wi.quantity_tons != null && map[wi.waste_category_id]) {
          map[wi.waste_category_id].total += Number(wi.quantity_tons);
        }
      }
    }
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [receivedMtrs, categories]);

  const topCategory = catBreakdown[0];
  const mtrsWithoutCdf = mtrs.filter((m: any) => m.cdf_status !== "received").length;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <Link to="/mtr"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Voltar</Button></Link>
        <div>
          <h1 className="text-2xl font-bold">Análise de Resíduos</h1>
          <p className="text-muted-foreground text-sm">Evolução mensal e resumo por categoria</p>
        </div>
      </div>

      {receivedMtrs.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <p className="text-muted-foreground">Nenhum dado de quantidade disponível.</p>
          <p className="text-sm text-muted-foreground">Registre os CDFs para visualizar os dados.</p>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Evolução Mensal de Resíduos (ton)</h2>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RTooltip />
                <Legend />
                {categories.map((cat: any) => (
                  <Line key={cat.id} type="monotone" dataKey={cat.name} stroke={cat.color} strokeWidth={2} dot={{ r: 3 }} />
                ))}
                <Line type="monotone" dataKey="Total" stroke="#1e3a5f" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Total gerado</span></div>
              <p className="text-xl font-bold">{formatTons(totalTons)} ton</p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1"><BarChart3 className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Média mensal</span></div>
              <p className="text-xl font-bold">{formatTons(avgMonthly)} ton</p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1"><Layers className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Maior volume</span></div>
              <p className="text-xl font-bold">{topCategory?.name || "—"}</p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1"><FileWarning className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">MTRs sem CDF</span></div>
              <p className="text-xl font-bold">{mtrsWithoutCdf}</p>
            </div>
          </div>

          {/* Category table */}
          <div className="bg-card border rounded-lg">
            <div className="p-4 border-b"><h3 className="text-sm font-semibold">Resumo por Categoria</h3></div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Total (ton)</TableHead>
                  <TableHead className="text-right">% do total</TableHead>
                  <TableHead className="text-right">Média mensal (ton)</TableHead>
                </TableRow>
              </TableHeader>
              <CatBreakdownTable data={catBreakdown.filter((c) => c.total > 0)} totalTons={totalTons} months={months} />
          </div>
        </>
      )}
    </div>
  );
}
