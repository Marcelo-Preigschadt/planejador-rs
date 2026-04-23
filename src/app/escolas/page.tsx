"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db/database";
import { v4 as uuidv4 } from "uuid";
import type { School } from "@/lib/types";

export default function EscolasPage() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("RS");
  const [schools, setSchools] = useState<School[]>([]);

  async function loadSchools() {
    const data = await db.schools.toArray();
    setSchools(data);
  }

  async function handleAddSchool() {
    if (!name || !city || !state) return;

    await db.schools.add({
      id: uuidv4(),
      name,
      city,
      state,
    });

    setName("");
    setCity("");
    setState("RS");

    await loadSchools();
  }

  useEffect(() => {
    loadSchools();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-slate-800">Cadastro de Escolas</h1>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <input
            className="rounded-lg border border-slate-300 p-3"
            placeholder="Nome da escola"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="rounded-lg border border-slate-300 p-3"
            placeholder="Cidade"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <input
            className="rounded-lg border border-slate-300 p-3"
            placeholder="Estado"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>

        <button
          onClick={handleAddSchool}
          className="mt-4 rounded-lg bg-slate-800 px-5 py-3 text-white"
        >
          Salvar escola
        </button>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-800">Escolas cadastradas</h2>

          <div className="mt-4 space-y-3">
            {schools.map((school) => (
              <div
                key={school.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <p className="font-semibold text-slate-800">{school.name}</p>
                <p className="text-sm text-slate-600">
                  {school.city} - {school.state}
                </p>
              </div>
            ))}

            {schools.length === 0 && (
              <p className="text-sm text-slate-500">
                Nenhuma escola cadastrada ainda.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}