import { PageHeader } from "@/components/page-header";

export default function TurmasPage() {
  return (
    <div>
      <PageHeader
        title="Turmas"
        description="Cadastro e gestão das turmas da escola."
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          CRUD real de turmas será ligado aqui com Supabase.
        </p>
      </div>
    </div>
  );
}