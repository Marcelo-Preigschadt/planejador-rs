export const adminDocumentTypes = [
  { value: "curriculum", label: "Currículo / BNCC / RCG" },
  { value: "ementa", label: "Ementa / Caderno de Ementas" },
  { value: "project_integrator", label: "Projeto Integrador" },
  { value: "corresponsabilidade", label: "Corresponsabilidade Social" },
  { value: "fic", label: "FIC / Técnico" },
  { value: "template", label: "Template" },
  { value: "support_material", label: "Material de apoio" },
  { value: "other", label: "Outro" },
];

export function formatBytes(size: number | null) {
  if (!size) return "—";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}