import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/permissions/check-role";
import { AdminCurriculumImporter } from "@/components/admin/admin-curriculum-importer";
import type { Component, DocumentRecord } from "@/lib/types";

export default async function AdminHabilidadesPage() {
  const { supabase, profile } = await requireRole("admin");

  const [{ data: components, error: componentsError }, { data: documents, error: documentsError }] =
    await Promise.all([
      supabase.from("components").select("*").eq("active", true).order("name"),
      supabase
        .from("documents")
        .select("*")
        .eq("document_type", "curriculum")
        .order("created_at", { ascending: false }),
    ]);

  const error = componentsError?.message || documentsError?.message;

  if (error) {
    return (
      <div>
        <PageHeader
          title="Habilidades"
          description="Importador curricular e publicação da base no banco."
        />
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-red-600">Erro ao carregar dados: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Habilidades"
        description="Importe o PDF oficial, visualize a prévia e publique as habilidades."
      />
      <AdminCurriculumImporter
        currentUserId={profile.id}
        components={(components ?? []) as Component[]}
        curriculumDocuments={(documents ?? []) as DocumentRecord[]}
      />
    </div>
  );
}