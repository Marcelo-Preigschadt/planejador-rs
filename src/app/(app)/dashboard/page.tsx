import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: schoolsCount },
    { count: classesCount },
    { count: componentsCount },
    { count: skillsCount },
    { count: plansCount },
  ] = await Promise.all([
    supabase.from("schools").select("*", { count: "exact", head: true }),
    supabase.from("classes").select("*", { count: "exact", head: true }),
    supabase.from("components").select("*", { count: "exact", head: true }),
    supabase.from("skills").select("*", { count: "exact", head: true }),
    supabase.from("plans").select("*", { count: "exact", head: true }),
  ]);

  const cards = [
    { title: "Escolas", value: schoolsCount ?? 0 },
    { title: "Turmas", value: classesCount ?? 0 },
    { title: "Componentes", value: componentsCount ?? 0 },
    { title: "Habilidades", value: skillsCount ?? 0 },
    { title: "Planejamentos", value: plansCount ?? 0 },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral do sistema de planejamento."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.title} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.title}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}