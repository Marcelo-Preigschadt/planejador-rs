import { PageHeader } from "@/components/page-header";

export default function HabilidadesCadastroPage() {
  return (
    <div>
      <PageHeader
        title="Habilidades"
        description="Importação e gestão da base curricular do RS."
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          A base curricular será importada e gerida aqui.
        </p>
      </div>
    </div>
  );
}