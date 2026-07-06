import QRCode from "qrcode";
import jsPDF from "jspdf";

export function getInspectionQrUrl(qrToken: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/i/${qrToken}`;
}

export async function qrDataUrl(text: string, size = 320): Promise<string> {
  return QRCode.toDataURL(text, { width: size, margin: 1, errorCorrectionLevel: "M" });
}

export interface AssetLabel {
  tagCode: string;
  name: string;
  location?: string | null;
  qrToken: string;
}

/**
 * Gera um PDF A4 com etiquetas 3 colunas x 5 linhas (60mm x 55mm cada).
 * Cada etiqueta traz: QR Code + tag + nome + local.
 */
export async function buildAssetLabelsPdf(assets: AssetLabel[], companyName?: string): Promise<Blob> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210, pageH = 297;
  const cols = 3, rows = 5;
  const marginX = 8, marginY = 12;
  const cellW = (pageW - marginX * 2) / cols;
  const cellH = (pageH - marginY * 2) / rows;
  const qrSize = 36;

  for (let i = 0; i < assets.length; i++) {
    const a = assets[i];
    const perPage = cols * rows;
    const idx = i % perPage;
    if (i > 0 && idx === 0) pdf.addPage();
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = marginX + col * cellW;
    const y = marginY + row * cellH;

    // border
    pdf.setDrawColor(210);
    pdf.roundedRect(x + 1, y + 1, cellW - 2, cellH - 2, 1.5, 1.5);

    const url = getInspectionQrUrl(a.qrToken);
    const dataUrl = await qrDataUrl(url, 400);
    const qrX = x + (cellW - qrSize) / 2;
    pdf.addImage(dataUrl, "PNG", qrX, y + 4, qrSize, qrSize);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text(a.tagCode, x + cellW / 2, y + qrSize + 8, { align: "center", maxWidth: cellW - 4 });

    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    const nameLines = pdf.splitTextToSize(a.name, cellW - 6);
    pdf.text(nameLines.slice(0, 2), x + cellW / 2, y + qrSize + 12, { align: "center" });

    if (a.location) {
      pdf.setFontSize(6);
      pdf.setTextColor(120);
      const locLines = pdf.splitTextToSize(a.location, cellW - 6);
      pdf.text(locLines.slice(0, 1), x + cellW / 2, y + qrSize + 17, { align: "center" });
      pdf.setTextColor(0);
    }

    if (companyName) {
      pdf.setFontSize(5);
      pdf.setTextColor(150);
      pdf.text(companyName, x + cellW / 2, y + cellH - 3, { align: "center" });
      pdf.setTextColor(0);
    }
  }

  return pdf.output("blob");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export const ASSET_TYPES: Record<string, string> = {
  extinguisher: "Extintor",
  machine: "Máquina / Equipamento",
  vehicle: "Veículo",
  scaffold: "Andaime",
  emergency_exit: "Saída de emergência",
  electrical_panel: "Painel elétrico",
  first_aid: "Kit primeiros socorros",
  eyewash: "Lava-olhos / chuveiro",
  hose: "Mangueira / hidrante",
  other: "Outro",
};

export const RESPONSE_TYPES: Record<string, string> = {
  yes_no: "Sim / Não",
  yes_no_na: "Sim / Não / N/A",
  scale: "Escala 1-5",
  numeric: "Numérico",
  text: "Texto livre",
};
