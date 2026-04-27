import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/permissions/check-role";

export default async function AdminComponentesPage() {
  await requireRole("admin");

  return (
    <div>
      <PageHeader
        title="Componentes"
        description="Cadastro dos componentes curriculares."
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Próximo bloco: CRUD real de componentes.
        </p>
      </div>
    </div>
  );
}