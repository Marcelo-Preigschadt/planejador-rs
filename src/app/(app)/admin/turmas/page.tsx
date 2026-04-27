import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/permissions/check-role";

export default async function AdminTurmasPage() {
  await requireRole("admin");

  return (
    <div>
      <PageHeader
        title="Turmas"
        description="Cadastro e gestão das turmas da escola."
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Próximo bloco: CRUD real de turmas.
        </p>
      </div>
    </div>
  );
}