import { PageHeader } from "@/components/page-header";

export default function IAPage() {
  return (
    <div>
      <PageHeader
        title="IA Assistiva"
        description="Área de geração, revisão e aprendizado da IA."
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Aqui entrarão as rotinas de geração dos planejamentos e feedback dos professores.
        </p>
      </div>
    </div>
  );
}