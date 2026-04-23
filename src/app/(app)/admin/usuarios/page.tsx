import { PageHeader } from "@/components/page-header";

export default function UsuariosAdminPage() {
  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Gestão de usuários, papéis e vínculo com escolas."
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Área administrativa para usuários e permissões.
        </p>
      </div>
    </div>
  );
}