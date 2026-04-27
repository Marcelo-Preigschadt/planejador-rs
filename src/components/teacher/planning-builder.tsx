"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  Component,
  DocumentRecord,
  School,
  SchoolClass,
  SkillListItem,
} from "@/lib/types";

type Props = {
  currentUserId: string;
  schools: School[];
  classes: SchoolClass[];
  components: Component[];
  skills: SkillListItem[];
  templates: DocumentRecord[];
};

type FormState = {
  title: string;
  school_id: string;
  class_id: string;
  component_id: string;
  term: string;
  template_id: string;
};

const initialForm: FormState = {
  title: "",
  school_id: "",
  class_id: "",
  component_id: "",
  term: "",
  template_id: "",
};

const termOptions = ["1º Trimestre", "2º Trimestre", "3º Trimestre"];

export function PlanningBuilder({
  currentUserId,
  schools,
  classes,
  components,
  skills,
  templates,
}: Props) {
  const supabase = createClient();

  const [form, setForm] = useState<FormState>(initialForm);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"idle" | "success" | "error">("idle");
  const [search, setSearch] = useState("");

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function showSuccess(text: string) {
    setMessage(text);
    setMessageType("success");
  }

  function showError(text: string) {
    setMessage(text);
    setMessageType("error");
  }

  const filteredClasses = useMemo(() => {
    if (!form.school_id) return [];
    return classes.filter((item) => item.school_id === form.school_id);
  }, [classes, form.school_id]);

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const matchesComponent = form.component_id
        ? skill.component_id === form.component_id
        : true;

      const matchesTerm = form.term ? skill.term === form.term : true;

      const classData = classes.find((item) => item.id === form.class_id);
      const matchesGrade = classData?.grade_level
        ? skill.grade_level === classData.grade_level
        : true;

      const searchText = `${skill.code} ${skill.description_literal} ${skill.support_text ?? ""}`.toLowerCase();
      const matchesSearch = search.trim()
        ? searchText.includes(search.trim().toLowerCase())
        : true;

      return matchesComponent && matchesTerm && matchesGrade && matchesSearch;
    });
  }, [skills, form.component_id, form.term, form.class_id, classes, search]);

  function toggleSkill(skillId: string) {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    );
  }

  function validateForm() {
    if (!form.title.trim()) {
      showError("Informe o título do planejamento.");
      return false;
    }
    if (!form.school_id) {
      showError("Selecione a escola.");
      return false;
    }
    if (!form.class_id) {
      showError("Selecione a turma.");
      return false;
    }
    if (!form.component_id) {
      showError("Selecione o componente.");
      return false;
    }
    if (!form.term) {
      showError("Selecione o trimestre.");
      return false;
    }
    if (!form.template_id) {
      showError("Selecione o template.");
      return false;
    }
    if (selectedSkillIds.length === 0) {
      showError("Marque ao menos uma habilidade.");
      return false;
    }
    return true;
  }

  async function handleSavePlan() {
    if (!validateForm()) return;

    setSaving(true);
    setMessage("");

    const planInsert = await supabase
      .from("plans")
      .insert({
        school_id: form.school_id,
        class_id: form.class_id,
        component_id: form.component_id,
        teacher_user_id: currentUserId,
        title: form.title.trim(),
        term: form.term,
        status: "draft",
        canonical_json: {
          template_id: form.template_id,
          selected_skill_ids: selectedSkillIds,
        },
      })
      .select("*")
      .single();

    if (planInsert.error || !planInsert.data) {
      setSaving(false);
      showError(`Erro ao salvar plano: ${planInsert.error?.message ?? "sem retorno"}`);
      return;
    }

    const planId = planInsert.data.id;

    const skillRows = selectedSkillIds.map((skill_id) => ({
      plan_id: planId,
      skill_id,
    }));

    const skillInsert = await supabase.from("plan_skills").insert(skillRows);

    if (skillInsert.error) {
      setSaving(false);
      showError(`Plano salvo, mas erro ao salvar habilidades: ${skillInsert.error.message}`);
      return;
    }

    setSaving(false);
    showSuccess("Planejamento salvo com sucesso.");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Contexto do planejamento</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Título do planejamento"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
          />

          <select
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            value={form.school_id}
            onChange={(e) => {
              updateField("school_id", e.target.value);
              updateField("class_id", "");
            }}
          >
            <option value="">Selecione a escola</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            value={form.class_id}
            onChange={(e) => updateField("class_id", e.target.value)}
          >
            <option value="">Selecione a turma</option>
            {filteredClasses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} - {item.grade_level}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            value={form.component_id}
            onChange={(e) => updateField("component_id", e.target.value)}
          >
            <option value="">Selecione o componente</option>
            {components.map((component) => (
              <option key={component.id} value={component.id}>
                {component.name}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            value={form.term}
            onChange={(e) => updateField("term", e.target.value)}
          >
            <option value="">Selecione o trimestre</option>
            {termOptions.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            value={form.template_id}
            onChange={(e) => updateField("template_id", e.target.value)}
          >
            <option value="">Selecione o template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Habilidades disponíveis</h2>
            <p className="text-sm text-slate-500">
              Marque as habilidades que serão trabalhadas no trimestre.
            </p>
          </div>

          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500 md:max-w-sm"
            placeholder="Buscar por código, texto ou apoio curricular"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mt-4 space-y-4">
          {filteredSkills.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhuma habilidade encontrada para os filtros selecionados.
            </p>
          ) : (
            filteredSkills.map((skill) => {
              const checked = selectedSkillIds.includes(skill.id);

              return (
                <label
                  key={skill.id}
                  className={`block cursor-pointer rounded-2xl border p-5 transition ${
                    checked
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSkill(skill.id)}
                      className="mt-1 h-4 w-4"
                    />

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{skill.code}</p>
                      <p className="mt-2 text-sm text-slate-800">
                        {skill.description_literal}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {skill.support_text}
                      </p>
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSavePlan}
            disabled={saving}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar planejamento"}
          </button>

          <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
            Habilidades marcadas: {selectedSkillIds.length}
          </div>

          {message && (
            <p className={`text-sm ${messageType === "error" ? "text-red-600" : "text-slate-600"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}