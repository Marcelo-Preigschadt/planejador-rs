import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";
import { ClassesManager } from "@/components/classes-manager";

export default async function TurmasPage() {
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

  const [{ data: classes, error: classesError }, { data: schools, error: schoolsError }] =
    await Promise.all([
      supabase.from("classes").select("*").order("created_at", { ascending: false }),
      supabase.from("schools").select("id, name").eq("active", true).order("name"),
    ]);

  if (classesError || schoolsError) {
    return (
      <div>
        <PageHeader
          title="Turmas"
          description="Cadastro e gestão das turmas da escola."
        />
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-red-600">
            Erro ao carregar dados: {classesError?.message || schoolsError?.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Turmas"
        description="Cadastro e gestão das turmas da escola."
      />
      <ClassesManager initialClasses={classes ?? []} schools={schools ?? []} />
    </div>
  );
}