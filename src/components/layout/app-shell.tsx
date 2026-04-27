"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Brain,
  Building2,
  FileCog,
  FileStack,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  School,
  Users,
  Blocks,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AppRole } from "@/lib/types";

type AppShellProps = {
  children: React.ReactNode;
  role: AppRole;
  fullName: string;
  email: string;
};

const menu = [
  {
    section: "Geral",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "teacher"] as AppRole[],
      },
      {
        href: "/planejamentos",
        label: "Planejamentos",
        icon: FileStack,
        roles: ["admin", "teacher"] as AppRole[],
      },
      {
        href: "/ia",
        label: "IA Assistiva",
        icon: Brain,
        roles: ["admin", "teacher"] as AppRole[],
      },
      {
        href: "/meus-materiais",
        label: "Meus Materiais",
        icon: FolderOpen,
        roles: ["admin", "teacher"] as AppRole[],
      },
    ],
  },
  {
    section: "Administração",
    items: [
      {
        href: "/admin/escolas",
        label: "Escolas",
        icon: Building2,
        roles: ["admin"] as AppRole[],
      },
      {
        href: "/admin/turmas",
        label: "Turmas",
        icon: School,
        roles: ["admin"] as AppRole[],
      },
      {
        href: "/admin/componentes",
        label: "Componentes",
        icon: BookOpen,
        roles: ["admin"] as AppRole[],
      },
      {
        href: "/admin/habilidades",
        label: "Habilidades",
        icon: Blocks,
        roles: ["admin"] as AppRole[],
      },
      {
        href: "/admin/templates",
        label: "Templates",
        icon: FileCog,
        roles: ["admin"] as AppRole[],
      },
      {
        href: "/admin/importacoes",
        label: "Importações",
        icon: FolderOpen,
        roles: ["admin"] as AppRole[],
      },
      {
        href: "/admin/usuarios",
        label: "Usuários",
        icon: Users,
        roles: ["admin"] as AppRole[],
      },
    ],
  },
];

export function AppShell({ children, role, fullName, email }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[300px_1fr]">
        <aside className="border-r border-slate-800 bg-slate-900 px-5 py-6 text-white">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Planejador RS
            </p>
            <h2 className="mt-2 text-xl font-bold">Sistema Docente</h2>
          </div>

          <div className="mb-8 rounded-2xl bg-slate-800 p-4">
            <p className="text-sm font-semibold">{fullName}</p>
            <p className="mt-1 text-xs text-slate-400">{email}</p>
            <p className="mt-3 inline-flex rounded-full bg-slate-700 px-2 py-1 text-xs uppercase">
              {role === "admin" ? "Administrador" : "Professor"}
            </p>
          </div>

          <div className="space-y-6">
            {menu.map((group) => {
              const items = group.items.filter((item) => item.roles.includes(role));

              if (items.length === 0) return null;

              return (
                <div key={group.section}>
                  <p className="mb-2 px-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {group.section}
                  </p>

                  <nav className="space-y-2">
                    {items.map((item) => {
                      const active =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                            active
                              ? "bg-white text-slate-900"
                              : "text-slate-300 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          <Icon size={18} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Ambiente de Trabalho
              </h1>
              <p className="text-sm text-slate-500">
                Rede estadual do Rio Grande do Sul
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <LogOut size={16} />
              Sair
            </button>
          </header>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}