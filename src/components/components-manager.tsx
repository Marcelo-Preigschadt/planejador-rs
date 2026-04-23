"use client";

import { useMemo, useState } from "react";
import { BookOpen, Pencil, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Component } from "@/lib/types";

type ComponentsManagerProps = {
  initialComponents: Component[];
};

type FormState = {
  name: string;
  stage: string;
};

const initialForm: FormState = {
  name: "",
  stage: "",
};

export function ComponentsManager({
  initialComponents,
}: ComponentsManagerProps) {
  const supabase = createClient();

  const [components, setComponents] = useState<Component[]>(initialComponents);
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

  async function reloadComponents() {
    const { data, error } = await supabase
      .from("components")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      showError(`Erro ao recarregar componentes: ${error.message}`);
      return;
    }

    setComponents(data ?? []);
  }

  function validateForm() {
    if (!form.name.trim()) {
      showError("Informe o nome do componente.");
      return false;
    }

    if (!form.stage.trim()) {
      showError("Informe a etapa do componente.");
      return false;
    }

    return true;
  }

  async function handleCreateComponent() {
    if (!validateForm()) return;

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("components").insert({
      name: form.name.trim(),
      stage: form.stage.trim(),
      active: true,
    });

    setLoading(false);

    if (error) {
      showError(`Erro ao salvar componente: ${error.message}`);
      return;
    }

    resetForm();
    showSuccess("Componente cadastrado com sucesso.");
    await reloadComponents();
  }

  async function handleUpdateComponent() {
    if (!editingId) return;
    if (!validateForm()) return;

    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("components")
      .update({
        name: form.name.trim(),
        stage: form.stage.trim(),
      })
      .eq("id", editingId);

    setLoading(false);

    if (error) {
      showError(`Erro ao atualizar componente: ${error.message}`);
      return;
    }

    resetForm();
    showSuccess("Componente atualizado com sucesso.");
    await reloadComponents();
  }

  function handleEditComponent(component: Component) {
    setEditingId(component.id);
    setForm({
      name: component.name ?? "",
      stage: component.stage ?? "",
    });
    setMessage("");
    setMessageType("idle");
  }

  function handleCancelEdit() {
    resetForm();
    setMessage("");
    setMessageType("idle");
  }

  async function handleDeleteComponent(id: string) {
    const confirmed = window.confirm("Deseja excluir este componente?");
    if (!confirmed) return;

    const { error } = await supabase.from("components").delete().eq("id", id);

    if (error) {
      showError(`Erro ao excluir componente: ${error.message}`);
      return;
    }

    if (editingId === id) {
      resetForm();
    }

    showSuccess("Componente excluído com sucesso.");
    await reloadComponents();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? "Editar componente" : "Novo componente"}
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

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Nome do componente"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Etapa"
            value={form.stage}
            onChange={(e) => updateField("stage", e.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {isEditing ? (
            <button
              onClick={handleUpdateComponent}
              disabled={loading}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Atualizando..." : "Atualizar componente"}
            </button>
          ) : (
            <button
              onClick={handleCreateComponent}
              disabled={loading}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Salvar componente"}
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
          Componentes cadastrados
        </h2>

        {components.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            Nenhum componente cadastrado ainda.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {components.map((component) => (
              <div
                key={component.id}
                className="rounded-2xl border border-slate-200 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-slate-100 p-3">
                      <BookOpen size={18} className="text-slate-700" />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {component.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Etapa: {component.stage}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditComponent(component)}
                      className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
                      title="Editar componente"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDeleteComponent(component.id)}
                      className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                      title="Excluir componente"
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