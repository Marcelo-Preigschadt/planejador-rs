import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/permissions/check-role";

export default async function AdminEscolasPage() {
  await requireRole("admin");

  return (
    <div>
      <PageHeader
        title="Escolas"
        description="Cadastro e gestão das escolas vinculadas ao sistema."
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Próximo bloco: CRUD real de escolas.
        </p>
      </div>
    </div>
  );
}