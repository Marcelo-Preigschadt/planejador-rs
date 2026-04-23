import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";
import { ComponentsManager } from "@/components/components-manager";

export default async function ComponentesPage() {
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

  const { data: components, error } = await supabase
    .from("components")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div>
        <PageHeader
          title="Componentes"
          description="Cadastro dos componentes curriculares."
        />
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-red-600">
            Erro ao carregar componentes: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Componentes"
        description="Cadastro dos componentes curriculares."
      />
      <ComponentsManager initialComponents={components ?? []} />
    </div>
  );
}