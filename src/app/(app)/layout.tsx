import { AppShell } from "@/components/layout/app-shell";
import { requireAuth } from "@/lib/permissions/check-role";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAuth();

  return (
    <AppShell
      role={profile.role}
      fullName={profile.full_name}
      email={profile.email}
    >
      {children}
    </AppShell>
  );
}