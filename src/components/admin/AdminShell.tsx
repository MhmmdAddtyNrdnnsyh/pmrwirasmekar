"use client";

import { signOut } from "next-auth/react";

import Sidebar from "@/components/admin/Sidebar";

type Props = {
  username: string;
  children: React.ReactNode;
};

export default function AdminShell({ username, children }: Props) {
  function handleLogout() {
    void signOut({ callbackUrl: "/admin/login" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-pmr-gray/40 md:flex-row">
      <Sidebar username={username} onLogout={handleLogout} />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
