"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">
        <section className="bg-slate-900 p-10 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Planejador RS
          </p>

          <h1 className="mt-4 text-4xl font-bold leading-tight">
            Sistema de planejamento para professores da rede estadual do RS
          </h1>

          <p className="mt-4 max-w-md text-slate-300">
            Plataforma para gestão pedagógica, planejamento, templates institucionais
            e assistência por IA com controle de acesso por perfil.
          </p>
        </section>

        <section className="p-10">
          <div className="mx-auto max-w-md">
            <h2 className="text-2xl font-bold text-slate-900">Entrar</h2>
            <p className="mt-2 text-sm text-slate-500">
              Use seu usuário cadastrado no Supabase.
            </p>

            <div className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  E-mail
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Senha
                </label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? "Entrando..." : "Entrar no sistema"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}