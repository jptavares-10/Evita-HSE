import * as XLSX from "xlsx";

export function downloadXlsx(data: string[][], fileName: string) {
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Dados");
  // Auto-size columns
  const colWidths = data[0].map((_, colIdx) =>
    Math.max(...data.map((row) => (row[colIdx]?.length ?? 0) + 2))
  );
  ws["!cols"] = colWidths.map((w) => ({ wch: Math.min(w, 40) }));
  XLSX.writeFile(wb, fileName);
}

export async function parseXlsx(file: File): Promise<string[][]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  return rows.map((r) => r.map((c) => String(c).trim())).filter((r) => r.some(Boolean));
}
