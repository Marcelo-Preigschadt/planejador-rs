"use client";

import { useState } from "react";
import { Trash2, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { School } from "@/lib/types";

type SchoolsManagerProps = {
  initialSchools: School[];
};

export function SchoolsManager({ initialSchools }: SchoolsManagerProps) {
  const supabase = createClient();

  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [stateValue, setStateValue] = useState("RS");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function reloadSchools() {
    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`Erro ao recarregar escolas: ${error.message}`);
      return;
    }

    setSchools(data ?? []);
  }

  async function handleCreateSchool() {
    if (!name.trim()) {
      setMessage("Informe o nome da escola.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("schools").insert({
      name: name.trim(),
      city: city.trim() || null,
      state: stateValue.trim() || "RS",
      active: true,
    });

    setLoading(false);

    if (error) {
      setMessage(`Erro ao salvar escola: ${error.message}`);
      return;
    }

    setName("");
    setCity("");
    setStateValue("RS");
    setMessage("Escola cadastrada com sucesso.");
    await reloadSchools();
  }

  async function handleDeleteSchool(id: string) {
    const confirmed = window.confirm("Deseja excluir esta escola?");
    if (!confirmed) return;

    const { error } = await supabase.from("schools").delete().eq("id", id);

    if (error) {
      setMessage(`Erro ao excluir escola: ${error.message}`);
      return;
    }

    setMessage("Escola excluída com sucesso.");
    await reloadSchools();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Nova escola
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Nome da escola"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Cidade"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Estado"
            value={stateValue}
            onChange={(e) => setStateValue(e.target.value)}
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleCreateSchool}
            disabled={loading}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Salvar escola"}
          </button>

          {message && (
            <p className="text-sm text-slate-600">{message}</p>
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

                  <button
                    onClick={() => handleDeleteSchool(school.id)}
                    className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                    title="Excluir escola"
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