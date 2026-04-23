import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";
import { SchoolsManager } from "@/components/schools-manager";

export default async function EscolasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: schools, error } = await supabase
    .from("schools")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div>
        <PageHeader
          title="Escolas"
          description="Cadastro e gestão das escolas vinculadas ao sistema."
        />
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-red-600">
            Erro ao carregar escolas: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Escolas"
        description="Cadastro e gestão das escolas vinculadas ao sistema."
      />
      <SchoolsManager initialSchools={schools ?? []} />
    </div>
  );
}