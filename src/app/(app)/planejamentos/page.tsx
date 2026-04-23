import { PageHeader } from "@/components/page-header";

export default function PlanejamentosPage() {
  return (
    <div>
      <PageHeader
        title="Planejamentos"
        description="Módulo principal de criação e gestão dos planejamentos."
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Esta área será ligada às tabelas reais de planejamento, templates e IA.
        </p>
      </div>
    </div>
  );
}