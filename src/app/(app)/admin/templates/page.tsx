import { PageHeader } from "@/components/page-header";

export default function TemplatesAdminPage() {
  return (
    <div>
      <PageHeader
        title="Templates"
        description="Importação e gestão dos modelos de planejamento da escola."
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Área administrativa dos templates DOCX/XLSX.
        </p>
      </div>
    </div>
  );
}