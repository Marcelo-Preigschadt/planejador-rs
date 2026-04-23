import { PageHeader } from "@/components/page-header";

export default function ComponentesPage() {
  return (
    <div>
      <PageHeader
        title="Componentes"
        description="Cadastro dos componentes curriculares."
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          CRUD real de componentes será ligado aqui com Supabase.
        </p>
      </div>
    </div>
  );
}