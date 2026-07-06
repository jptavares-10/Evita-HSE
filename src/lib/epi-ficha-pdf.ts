import jsPDF from "jspdf";

export type FichaDelivery = {
  id: string;
  delivered_at: string;
  quantity: number;
  reason?: string | null;
  notes?: string | null;
  epi_name: string;
  ca_number?: string | null;
  unit?: string | null;
  signature_data_url?: string | null; // base64 PNG (already fetched)
};

export type FichaInput = {
  companyName: string;
  companyCnpj?: string | null;
  companyLogoDataUrl?: string | null;
  employeeName: string;
  employeeJob?: string | null;
  employeeSector?: string | null;
  deliveries: FichaDelivery[];
};

function fmtDate(iso: string): string {
  try {
    const d = iso.length === 10 ? new Date(iso + "T00:00:00") : new Date(iso);
    return d.toLocaleDateString("pt-BR");
  } catch {
    return iso;
  }
}

export async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const blob = await r.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

const TERMO_NR6 =
  "Declaro ter recebido da empresa, gratuitamente, os Equipamentos de Proteção Individual (EPI) " +
  "discriminados nesta ficha, em perfeitas condições de uso, tendo sido orientado(a) quanto à " +
  "finalidade, uso correto, guarda e conservação. Comprometo-me a: (a) usar o EPI apenas para a " +
  "finalidade a que se destina; (b) responsabilizar-me pela guarda e conservação; (c) comunicar " +
  "qualquer alteração que o torne impróprio para uso; (d) devolvê-lo quando solicitado ou ao " +
  "término do contrato de trabalho. Estou ciente de que o não uso ou mau uso constitui ato " +
  "faltoso, nos termos da NR-6 e do art. 158 da CLT.";

export async function buildEmployeeEpiFichaPdf(input: FichaInput): Promise<Blob> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const margin = 15;
  let y = margin;

  const drawHeader = () => {
    y = margin;
    // Logo
    if (input.companyLogoDataUrl) {
      try {
        doc.addImage(input.companyLogoDataUrl, "PNG", margin, y, 18, 18);
      } catch {}
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Ficha de Controle de EPI", pageW / 2, y + 6, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Nos termos da NR-6 e art. 158 da CLT", pageW / 2, y + 11, { align: "center" });
    y += 22;
    doc.setDrawColor(200);
    doc.line(margin, y, pageW - margin, y);
    y += 5;
  };

  const drawTableHeader = () => {
    doc.setFillColor(240, 240, 240);
    doc.setDrawColor(60);
    doc.rect(margin, y, pageW - 2 * margin, 8, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Data", margin + 2, y + 5);
    doc.text("EPI", margin + 22, y + 5);
    doc.text("CA", margin + 78, y + 5);
    doc.text("Qtd", margin + 96, y + 5);
    doc.text("Motivo", margin + 108, y + 5);
    doc.text("Assinatura do colaborador", margin + 130, y + 5);
    y += 8;
  };

  drawHeader();

  // Empresa
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Empresa:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(input.companyName, margin + 18, y);
  if (input.companyCnpj) {
    doc.setFont("helvetica", "bold");
    doc.text("CNPJ:", pageW - margin - 55, y);
    doc.setFont("helvetica", "normal");
    doc.text(input.companyCnpj, pageW - margin - 45, y);
  }
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.text("Colaborador:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(input.employeeName, margin + 24, y);
  y += 5;

  if (input.employeeJob || input.employeeSector) {
    doc.setFont("helvetica", "bold");
    doc.text("Cargo / Setor:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(
      [input.employeeJob, input.employeeSector].filter(Boolean).join(" — ") || "—",
      margin + 28,
      y,
    );
    y += 5;
  }
  y += 3;

  // Termo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Termo de responsabilidade", margin, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const termoLines = doc.splitTextToSize(TERMO_NR6, pageW - 2 * margin);
  doc.text(termoLines, margin, y);
  y += termoLines.length * 3.4 + 4;

  // Tabela
  drawTableHeader();

  const rowHeight = 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  input.deliveries.forEach((d) => {
    if (y + rowHeight > pageH - margin - 10) {
      doc.addPage();
      drawHeader();
      drawTableHeader();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    }
    doc.setDrawColor(180);
    doc.rect(margin, y, pageW - 2 * margin, rowHeight);

    // vertical guides
    const colX = [margin + 20, margin + 76, margin + 94, margin + 106, margin + 128];
    colX.forEach((x) => doc.line(x, y, x, y + rowHeight));

    doc.text(fmtDate(d.delivered_at), margin + 2, y + 5);
    const epiLines = doc.splitTextToSize(d.epi_name, 54);
    doc.text(epiLines.slice(0, 3), margin + 22, y + 5);
    doc.text(d.ca_number || "—", margin + 78, y + 5);
    doc.text(`${d.quantity} ${d.unit || ""}`.trim(), margin + 96, y + 5);
    const reasonLines = doc.splitTextToSize(d.reason || "—", 20);
    doc.text(reasonLines.slice(0, 3), margin + 108, y + 5);

    // Assinatura
    if (d.signature_data_url) {
      try {
        doc.addImage(d.signature_data_url, "PNG", margin + 130, y + 1, 60, rowHeight - 2);
      } catch {}
    } else {
      doc.setDrawColor(150);
      doc.setLineDashPattern([1, 1], 0);
      doc.line(margin + 132, y + rowHeight - 4, margin + 188, y + rowHeight - 4);
      doc.setLineDashPattern([], 0);
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text("assinatura", margin + 132, y + rowHeight - 1);
      doc.setTextColor(0);
      doc.setFontSize(8);
    }
    y += rowHeight;
  });

  if (input.deliveries.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(120);
    doc.text("Nenhuma entrega registrada até o momento.", pageW / 2, y + 10, { align: "center" });
    doc.setTextColor(0);
    y += 20;
  }

  // Footer on last page
  const generatedAt = new Date().toLocaleString("pt-BR");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text(
    `Documento gerado em ${generatedAt} — ${input.deliveries.length} entrega(s) registrada(s) — Sistema Evita HSE`,
    pageW / 2,
    pageH - 8,
    { align: "center" },
  );
  doc.setTextColor(0);

  return doc.output("blob");
}