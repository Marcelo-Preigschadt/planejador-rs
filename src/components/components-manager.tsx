"use client";

import { useState } from "react";
import { BookOpen, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Component } from "@/lib/types";

type ComponentsManagerProps = {
  initialComponents: Component[];
};

export function ComponentsManager({
  initialComponents,
}: ComponentsManagerProps) {
  const supabase = createClient();

  const [components, setComponents] = useState<Component[]>(initialComponents);
  const [name, setName] = useState("");
  const [stage, setStage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function reloadComponents() {
    const { data, error } = await supabase
      .from("components")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`Erro ao recarregar componentes: ${error.message}`);
      return;
    }

    setComponents(data ?? []);
  }

  async function handleCreateComponent() {
    if (!name.trim() || !stage.trim()) {
      setMessage("Preencha nome e etapa do componente.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("components").insert({
      name: name.trim(),
      stage: stage.trim(),
      active: true,
    });

    setLoading(false);

    if (error) {
      setMessage(`Erro ao salvar componente: ${error.message}`);
      return;
    }

    setName("");
    setStage("");
    setMessage("Componente cadastrado com sucesso.");
    await reloadComponents();
  }

  async function handleDeleteComponent(id: string) {
    const confirmed = window.confirm("Deseja excluir este componente?");
    if (!confirmed) return;

    const { error } = await supabase.from("components").delete().eq("id", id);

    if (error) {
      setMessage(`Erro ao excluir componente: ${error.message}`);
      return;
    }

    setMessage("Componente excluído com sucesso.");
    await reloadComponents();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Novo componente</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Nome do componente"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Etapa"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleCreateComponent}
            disabled={loading}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Salvar componente"}
          </button>

          {message && <p className="text-sm text-slate-600">{message}</p>}
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

                  <button
                    onClick={() => handleDeleteComponent(component.id)}
                    className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                    title="Excluir componente"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}