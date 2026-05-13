import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Middleware sudah jaga, tapi double-check + ambil data session untuk UI.
  if (!session?.user) {
    redirect("/admin/login");
  }

  const username = session.user.name ?? "admin";

  return <AdminShell username={username}>{children}</AdminShell>;
}
