import { PageHeader } from "@/components/ui/page-header";
import { requireAuth } from "@/lib/permissions/check-role";
import { TeacherDocumentsManager } from "@/components/teacher/teacher-documents-manager";
import type { DocumentRecord } from "@/lib/types";

export default async function MeusMateriaisPage() {
  const { supabase, profile } = await requireAuth();

  const { data: documents, error } = await supabase
    .from("documents")
    .select("*")
    .eq("owner_user_id", profile.id)
    .eq("visibility", "private")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div>
        <PageHeader
          title="Meus Materiais"
          description="Biblioteca pessoal de documentos do professor."
        />
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-red-600">
            Erro ao carregar materiais: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Meus Materiais"
        description="Upload e gestão dos materiais privados do professor."
      />
      <TeacherDocumentsManager
        initialDocuments={(documents ?? []) as DocumentRecord[]}
        currentUserId={profile.id}
      />
    </div>
  );
}