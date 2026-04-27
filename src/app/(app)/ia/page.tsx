import { PageHeader } from "@/components/ui/page-header";
import { requireAuth } from "@/lib/permissions/check-role";

export default async function IAPage() {
  await requireAuth();

  return (
    <div>
      <PageHeader
        title="IA Assistiva"
        description="Área de geração, revisão e aprendizado da IA."
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Próximo bloco: seleção de documentos oficiais, privados e contextuais
          para geração assistida.
        </p>
      </div>
    </div>
  );
}