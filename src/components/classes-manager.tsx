"use client";

import { useMemo, useState } from "react";
import { GraduationCap, Pencil, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SchoolClass } from "@/lib/types";

type SchoolOption = {
  id: string;
  name: string;
};

type ClassesManagerProps = {
  initialClasses: SchoolClass[];
  schools: SchoolOption[];
};

type FormState = {
  school_id: string;
  name: string;
  grade_level: string;
  shift: string;
  weekly_periods: string;
};

const initialForm: FormState = {
  school_id: "",
  name: "",
  grade_level: "",
  shift: "",
  weekly_periods: "",
};

export function ClassesManager({
  initialClasses,
  schools,
}: ClassesManagerProps) {
  const supabase = createClient();

  const [classes, setClasses] = useState<SchoolClass[]>(initialClasses);
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "idle">("idle");

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function showSuccess(text: string) {
    setMessage(text);
    setMessageType("success");
  }

  function showError(text: string) {
    setMessage(text);
    setMessageType("error");
  }

  async function reloadClasses() {
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      showError(`Erro ao recarregar turmas: ${error.message}`);
      return;
    }

    setClasses(data ?? []);
  }

  function validateForm() {
    if (!form.school_id) {
      showError("Selecione a escola.");
      return false;
    }

    if (!form.name.trim()) {
      showError("Informe o nome da turma.");
      return false;
    }

    if (!form.grade_level.trim()) {
      showError("Informe o ano/série.");
      return false;
    }

    if (!form.shift.trim()) {
      showError("Informe o turno.");
      return false;
    }

    if (!form.weekly_periods || Number(form.weekly_periods) <= 0) {
      showError("Informe os períodos por semana.");
      return false;
    }

    return true;
  }

  async function handleCreateClass() {
    if (!validateForm()) return;

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("classes").insert({
      school_id: form.school_id,
      name: form.name.trim(),
      grade_level: form.grade_level.trim(),
      shift: form.shift.trim(),
      weekly_periods: Number(form.weekly_periods),
      active: true,
    });

    setLoading(false);

    if (error) {
      showError(`Erro ao salvar turma: ${error.message}`);
      return;
    }

    resetForm();
    showSuccess("Turma cadastrada com sucesso.");
    await reloadClasses();
  }

  async function handleUpdateClass() {
    if (!editingId) return;
    if (!validateForm()) return;

    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("classes")
      .update({
        school_id: form.school_id,
        name: form.name.trim(),
        grade_level: form.grade_level.trim(),
        shift: form.shift.trim(),
        weekly_periods: Number(form.weekly_periods),
      })
      .eq("id", editingId);

    setLoading(false);

    if (error) {
      showError(`Erro ao atualizar turma: ${error.message}`);
      return;
    }

    resetForm();
    showSuccess("Turma atualizada com sucesso.");
    await reloadClasses();
  }

  function handleEditClass(schoolClass: SchoolClass) {
    setEditingId(schoolClass.id);
    setForm({
      school_id: schoolClass.school_id,
      name: schoolClass.name ?? "",
      grade_level: schoolClass.grade_level ?? "",
      shift: schoolClass.shift ?? "",
      weekly_periods: String(schoolClass.weekly_periods ?? ""),
    });
    setMessage("");
    setMessageType("idle");
  }

  function handleCancelEdit() {
    resetForm();
    setMessage("");
    setMessageType("idle");
  }

  async function handleDeleteClass(id: string) {
    const confirmed = window.confirm("Deseja excluir esta turma?");
    if (!confirmed) return;

    const { error } = await supabase.from("classes").delete().eq("id", id);

    if (error) {
      showError(`Erro ao excluir turma: ${error.message}`);
      return;
    }

    if (editingId === id) {
      resetForm();
    }

    showSuccess("Turma excluída com sucesso.");
    await reloadClasses();
  }

  function getSchoolName(id: string) {
    return schools.find((school) => school.id === id)?.name ?? "Escola não encontrada";
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? "Editar turma" : "Nova turma"}
          </h2>

          {isEditing && (
            <button
              onClick={handleCancelEdit}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <X size={16} />
              Cancelar edição
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <select
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            value={form.school_id}
            onChange={(e) => updateField("school_id", e.target.value)}
          >
            <option value="">Selecione a escola</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>

          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Nome da turma"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Ano/Série"
            value={form.grade_level}
            onChange={(e) => updateField("grade_level", e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Turno"
            value={form.shift}
            onChange={(e) => updateField("shift", e.target.value)}
          />

          <input
            type="number"
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Períodos por semana"
            value={form.weekly_periods}
            onChange={(e) => updateField("weekly_periods", e.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {isEditing ? (
            <button
              onClick={handleUpdateClass}
              disabled={loading}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Atualizando..." : "Atualizar turma"}
            </button>
          ) : (
            <button
              onClick={handleCreateClass}
              disabled={loading}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Salvar turma"}
            </button>
          )}

          {message && (
            <p
              className={`text-sm ${
                messageType === "error" ? "text-red-600" : "text-slate-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Turmas cadastradas</h2>

        {classes.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Nenhuma turma cadastrada ainda.</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {classes.map((schoolClass) => (
              <div
                key={schoolClass.id}
                className="rounded-2xl border border-slate-200 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-slate-100 p-3">
                      <GraduationCap size={18} className="text-slate-700" />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">{schoolClass.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Escola: {getSchoolName(schoolClass.school_id)}
                      </p>
                      <p className="text-sm text-slate-500">
                        Ano/Série: {schoolClass.grade_level}
                      </p>
                      <p className="text-sm text-slate-500">
                        Turno: {schoolClass.shift}
                      </p>
                      <p className="text-sm text-slate-500">
                        Períodos/semana: {schoolClass.weekly_periods}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClass(schoolClass)}
                      className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
                      title="Editar turma"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDeleteClass(schoolClass.id)}
                      className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                      title="Excluir turma"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}