import jsPDF from "jspdf";

export type DeliveryPdfInput = {
  companyName: string;
  companyCnpj?: string | null;
  employeeName: string;
  employeeJob?: string | null;
  employeeSector?: string | null;
  epiName: string;
  caNumber?: string | null;
  quantity: number;
  unit?: string | null;
  reason?: string | null;
  deliveredAt: string; // YYYY-MM-DD
  signaturePng: string; // dataURL
  signedAt: string; // ISO
  signedByName?: string | null;
  hash: string;
  ip?: string | null;
  userAgent?: string | null;
  deliveryId?: string;
};

export async function computeSignatureHash(payload: object): Promise<string> {
  const enc = new TextEncoder().encode(JSON.stringify(payload));
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [head, b64] = dataUrl.split(",");
  const mime = /:(.*?);/.exec(head)?.[1] || "image/png";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function fmtDate(iso: string): string {
  try {
    const d = iso.length === 10 ? new Date(iso + "T00:00:00") : new Date(iso);
    return d.toLocaleDateString("pt-BR");
  } catch {
    return iso;
  }
}
function fmtDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return iso;
  }
}

export async function buildDeliveryPdf(input: DeliveryPdfInput): Promise<Blob> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 15;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Ficha de Entrega de EPI", pageW / 2, y + 2, { align: "center" });
  y += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Termo de Recebimento e Ciência — NR-6", pageW / 2, y, { align: "center" });
  y += 8;
  doc.setDrawColor(200);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // Company block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Empresa", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(input.companyName, margin + 25, y);
  if (input.companyCnpj) {
    doc.setFont("helvetica", "bold");
    doc.text("CNPJ", pageW - margin - 50, y);
    doc.setFont("helvetica", "normal");
    doc.text(input.companyCnpj, pageW - margin - 35, y);
  }
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.text("Colaborador", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(input.employeeName, margin + 25, y);
  y += 6;

  if (input.employeeJob || input.employeeSector) {
    doc.setFont("helvetica", "bold");
    doc.text("Cargo/Setor", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(
      [input.employeeJob, input.employeeSector].filter(Boolean).join(" — "),
      margin + 25,
      y,
    );
    y += 6;
  }

  doc.setFont("helvetica", "bold");
  doc.text("Data entrega", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(fmtDate(input.deliveredAt), margin + 25, y);
  y += 8;

  // Table (single row)
  doc.setDrawColor(60);
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y, pageW - 2 * margin, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("EPI", margin + 2, y + 5);
  doc.text("CA", margin + 90, y + 5);
  doc.text("Qtd", margin + 120, y + 5);
  doc.text("Motivo", margin + 140, y + 5);
  y += 7;
  doc.rect(margin, y, pageW - 2 * margin, 8);
  doc.setFont("helvetica", "normal");
  doc.text(String(input.epiName).substring(0, 55), margin + 2, y + 5);
  doc.text(input.caNumber || "—", margin + 90, y + 5);
  doc.text(`${input.quantity} ${input.unit || ""}`.trim(), margin + 120, y + 5);
  doc.text((input.reason || "—").substring(0, 32), margin + 140, y + 5);
  y += 12;

  // Consent
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Termo de ciência", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const termo =
    "Declaro ter recebido o(s) Equipamento(s) de Proteção Individual (EPI) descrito(s) acima, em perfeitas " +
    "condições de uso, tendo sido orientado(a) quanto à finalidade, ao uso correto, à guarda e à conservação. " +
    "Comprometo-me a: (a) usar o EPI apenas para a finalidade a que se destina; (b) responsabilizar-me pela guarda " +
    "e conservação; (c) comunicar qualquer alteração que o torne impróprio; (d) devolvê-lo quando solicitado. " +
    "Estou ciente de que o não uso ou mau uso constitui ato faltoso, conforme NR-6 e CLT art. 158.";
  const lines = doc.splitTextToSize(termo, pageW - 2 * margin);
  doc.text(lines, margin, y);
  y += lines.length * 4 + 4;

  // Signature
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Assinatura do colaborador", margin, y);
  y += 3;
  try {
    doc.addImage(input.signaturePng, "PNG", margin, y, 80, 30);
  } catch {
    // ignore
  }
  doc.setDrawColor(120);
  doc.line(margin, y + 32, margin + 100, y + 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(input.employeeName, margin, y + 36);
  doc.text(`Assinado em: ${fmtDateTime(input.signedAt)}`, margin, y + 40);
  y += 46;

  // Audit trail footer
  doc.setDrawColor(220);
  doc.line(margin, y, pageW - margin, y);
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("TRILHA DE AUDITORIA", margin, y);
  y += 3;
  doc.setFont("helvetica", "normal");
  const audit = [
    `Hash SHA-256: ${input.hash}`,
    `Coletado por: ${input.signedByName || "—"}`,
    `IP: ${input.ip || "—"}    Dispositivo: ${(input.userAgent || "—").substring(0, 100)}`,
    input.deliveryId ? `ID entrega: ${input.deliveryId}` : "",
  ].filter(Boolean);
  audit.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, pageW - 2 * margin);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 3;
  });

  return doc.output("blob");
}

export async function fetchClientIp(): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2000);
    const r = await fetch("https://api.ipify.org?format=json", { signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) return null;
    const j = await r.json();
    return j.ip || null;
  } catch {
    return null;
  }
}