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
