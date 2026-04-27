import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/permissions/check-role";

export default async function AdminHabilidadesPage() {
  await requireRole("admin");

  return (
    <div>
      <PageHeader
        title="Habilidades"
        description="Base curricular, ementas e importação estruturada."
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Próximo bloco: importação em massa e revisão da base curricular.
        </p>
      </div>
    </div>
  );
}