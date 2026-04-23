"use client";

import { useMemo, useState } from "react";
import { Building2, Pencil, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { School } from "@/lib/types";

type SchoolsManagerProps = {
  initialSchools: School[];
};

type FormState = {
  name: string;
  city: string;
  state: string;
};

const initialForm: FormState = {
  name: "",
  city: "",
  state: "RS",
};

export function SchoolsManager({ initialSchools }: SchoolsManagerProps) {
  const supabase = createClient();

  const [schools, setSchools] = useState<School[]>(initialSchools);
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

  async function reloadSchools() {
    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      showError(`Erro ao recarregar escolas: ${error.message}`);
      return;
    }

    setSchools(data ?? []);
  }

  function validateForm() {
    if (!form.name.trim()) {
      showError("Informe o nome da escola.");
      return false;
    }

    if (!form.state.trim()) {
      showError("Informe o estado.");
      return false;
    }

    return true;
  }

  async function handleCreateSchool() {
    if (!validateForm()) return;

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("schools").insert({
      name: form.name.trim(),
      city: form.city.trim() || null,
      state: form.state.trim().toUpperCase(),
      active: true,
    });

    setLoading(false);

    if (error) {
      showError(`Erro ao salvar escola: ${error.message}`);
      return;
    }

    resetForm();
    showSuccess("Escola cadastrada com sucesso.");
    await reloadSchools();
  }

  async function handleUpdateSchool() {
    if (!editingId) return;
    if (!validateForm()) return;

    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("schools")
      .update({
        name: form.name.trim(),
        city: form.city.trim() || null,
        state: form.state.trim().toUpperCase(),
      })
      .eq("id", editingId);

    setLoading(false);

    if (error) {
      showError(`Erro ao atualizar escola: ${error.message}`);
      return;
    }

    resetForm();
    showSuccess("Escola atualizada com sucesso.");
    await reloadSchools();
  }

  function handleEditSchool(school: School) {
    setEditingId(school.id);
    setForm({
      name: school.name ?? "",
      city: school.city ?? "",
      state: school.state ?? "RS",
    });
    setMessage("");
    setMessageType("idle");
  }

  function handleCancelEdit() {
    resetForm();
    setMessage("");
    setMessageType("idle");
  }

  async function handleDeleteSchool(id: string) {
    const confirmed = window.confirm("Deseja excluir esta escola?");
    if (!confirmed) return;

    const { error } = await supabase.from("schools").delete().eq("id", id);

    if (error) {
      showError(`Erro ao excluir escola: ${error.message}`);
      return;
    }

    if (editingId === id) {
      resetForm();
    }

    showSuccess("Escola excluída com sucesso.");
    await reloadSchools();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? "Editar escola" : "Nova escola"}
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

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Nome da escola"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Cidade"
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Estado"
            value={form.state}
            onChange={(e) => updateField("state", e.target.value)}
            maxLength={2}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {isEditing ? (
            <button
              onClick={handleUpdateSchool}
              disabled={loading}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Atualizando..." : "Atualizar escola"}
            </button>
          ) : (
            <button
              onClick={handleCreateSchool}
              disabled={loading}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Salvar escola"}
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
        <h2 className="text-lg font-semibold text-slate-900">
          Escolas cadastradas
        </h2>

        {schools.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            Nenhuma escola cadastrada ainda.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {schools.map((school) => (
              <div
                key={school.id}
                className="rounded-2xl border border-slate-200 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-slate-100 p-3">
                      <Building2 size={18} className="text-slate-700" />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {school.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {(school.city ?? "Sem cidade")} - {school.state}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditSchool(school)}
                      className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
                      title="Editar escola"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDeleteSchool(school.id)}
                      className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                      title="Excluir escola"
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