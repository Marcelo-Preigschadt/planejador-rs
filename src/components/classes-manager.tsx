"use client";

import { useState } from "react";
import { GraduationCap, Trash2 } from "lucide-react";
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

export function ClassesManager({
  initialClasses,
  schools,
}: ClassesManagerProps) {
  const supabase = createClient();

  const [classes, setClasses] = useState<SchoolClass[]>(initialClasses);
  const [schoolId, setSchoolId] = useState("");
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [shift, setShift] = useState("");
  const [weeklyPeriods, setWeeklyPeriods] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function reloadClasses() {
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`Erro ao recarregar turmas: ${error.message}`);
      return;
    }

    setClasses(data ?? []);
  }

  async function handleCreateClass() {
    if (!schoolId || !name.trim() || !gradeLevel.trim() || !shift.trim() || !weeklyPeriods) {
      setMessage("Preencha todos os campos da turma.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("classes").insert({
      school_id: schoolId,
      name: name.trim(),
      grade_level: gradeLevel.trim(),
      shift: shift.trim(),
      weekly_periods: Number(weeklyPeriods),
      active: true,
    });

    setLoading(false);

    if (error) {
      setMessage(`Erro ao salvar turma: ${error.message}`);
      return;
    }

    setSchoolId("");
    setName("");
    setGradeLevel("");
    setShift("");
    setWeeklyPeriods("");
    setMessage("Turma cadastrada com sucesso.");
    await reloadClasses();
  }

  async function handleDeleteClass(id: string) {
    const confirmed = window.confirm("Deseja excluir esta turma?");
    if (!confirmed) return;

    const { error } = await supabase.from("classes").delete().eq("id", id);

    if (error) {
      setMessage(`Erro ao excluir turma: ${error.message}`);
      return;
    }

    setMessage("Turma excluída com sucesso.");
    await reloadClasses();
  }

  function getSchoolName(id: string) {
    return schools.find((school) => school.id === id)?.name ?? "Escola não encontrada";
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Nova turma</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <select
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
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
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Ano/Série"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Turno"
            value={shift}
            onChange={(e) => setShift(e.target.value)}
          />

          <input
            type="number"
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Períodos por semana"
            value={weeklyPeriods}
            onChange={(e) => setWeeklyPeriods(e.target.value)}
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleCreateClass}
            disabled={loading}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Salvar turma"}
          </button>

          {message && <p className="text-sm text-slate-600">{message}</p>}
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

                  <button
                    onClick={() => handleDeleteClass(schoolClass.id)}
                    className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                    title="Excluir turma"
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