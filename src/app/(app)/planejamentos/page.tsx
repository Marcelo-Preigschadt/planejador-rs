import { PageHeader } from "@/components/ui/page-header";
import { requireAuth } from "@/lib/permissions/check-role";
import { PlanningBuilder } from "@/components/teacher/planning-builder";
import type { Component, DocumentRecord, School, SchoolClass, SkillListItem } from "@/lib/types";

export default async function PlanejamentosPage() {
  const { supabase, profile } = await requireAuth();

  const [
    { data: schools, error: schoolsError },
    { data: classes, error: classesError },
    { data: components, error: componentsError },
    { data: skills, error: skillsError },
    { data: templates, error: templatesError },
  ] = await Promise.all([
    supabase.from("schools").select("*").eq("active", true).order("name"),
    supabase.from("classes").select("*").eq("active", true).order("name"),
    supabase.from("components").select("*").eq("active", true).order("name"),
    supabase.from("skills").select("*").eq("active", true).order("code"),
    supabase
      .from("documents")
      .select("*")
      .eq("document_type", "template")
      .in("visibility", ["official", "school"])
      .order("title"),
  ]);

  const error =
    schoolsError?.message ||
    classesError?.message ||
    componentsError?.message ||
    skillsError?.message ||
    templatesError?.message;

  if (error) {
    return (
      <div>
        <PageHeader
          title="Planejamentos"
          description="Criação de planejamentos por seleção curricular."
        />
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-red-600">Erro ao carregar dados: {error}</p>
        </div>
      </div>
    );
  }

  const enrichedSkills: SkillListItem[] = (skills ?? []).map((skill) => {
    const component = (components ?? []).find((c) => c.id === skill.component_id);

    return {
      ...skill,
      component_name: component?.name ?? "",
      support_text: [
        component?.name ? `Componente: ${component.name}` : "",
        skill.grade_level ? `Ano/Série: ${skill.grade_level}` : "",
        skill.term ? `Trimestre: ${skill.term}` : "",
        skill.stage ? `Etapa: ${skill.stage}` : "",
      ]
        .filter(Boolean)
        .join(" • "),
    };
  });

  return (
    <div>
      <PageHeader
        title="Planejamentos"
        description="Selecione contexto, marque as habilidades e gere o planejamento."
      />

      <PlanningBuilder
        currentUserId={profile.id}
        schools={(schools ?? []) as School[]}
        classes={(classes ?? []) as SchoolClass[]}
        components={(components ?? []) as Component[]}
        skills={enrichedSkills}
        templates={(templates ?? []) as DocumentRecord[]}
      />
    </div>
  );
}