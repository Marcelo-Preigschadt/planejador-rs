import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/permissions/check-role";
import { AdminDocumentsManager } from "@/components/admin/admin-documents-manager";
import type { DocumentRecord, School } from "@/lib/types";

export default async function AdminImportacoesPage() {
  const { supabase, profile } = await requireRole("admin");

  const [{ data: documents, error: documentsError }, { data: schools, error: schoolsError }] =
    await Promise.all([
      supabase
        .from("documents")
        .select("*")
        .in("visibility", ["official", "school"])
        .order("created_at", { ascending: false }),
      supabase
        .from("schools")
        .select("*")
        .eq("active", true)
        .order("name"),
    ]);

  if (documentsError || schoolsError) {
    return (
      <div>
        <PageHeader
          title="Importações"
          description="Central de ingestão de documentos curriculares e institucionais."
        />
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-red-600">
            Erro ao carregar dados: {documentsError?.message || schoolsError?.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Importações"
        description="Upload e gestão dos documentos oficiais e da escola."
      />
      <AdminDocumentsManager
        initialDocuments={(documents ?? []) as DocumentRecord[]}
        schools={(schools ?? []) as School[]}
        currentUserId={profile.id}
      />
    </div>
  );
}