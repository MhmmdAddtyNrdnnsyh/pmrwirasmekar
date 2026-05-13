import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { auth } from "@/lib/auth";
import FormLogin from "@/components/admin/FormLogin";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Login Admin",
  description: `Halaman login panel admin ${site.nama}.`,
};

export default async function LoginPage() {
  const session = await auth();
  if (session) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-pmr-gray/50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <span
            aria-hidden
            className="flex h-10 w-10 items-center justify-center rounded-full bg-pmr-red text-pmr-white font-bold"
          >
            +
          </span>
          <div className="text-center">
            <p className="text-sm font-semibold text-pmr-dark">{site.nama}</p>
            <p className="text-xs text-pmr-dark/60">Panel Admin</p>
          </div>
        </div>

        <div className="rounded-2xl border border-pmr-gray bg-pmr-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pmr-red/10 text-pmr-red">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h1 className="text-lg font-semibold text-pmr-dark">
                Masuk ke panel admin
              </h1>
              <p className="text-xs text-pmr-dark/60">
                Akses terbatas untuk pengurus dan pembina.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <FormLogin />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-pmr-dark/60">
          Kembali ke{" "}
          <Link href="/" className="font-medium text-pmr-red hover:underline">
            situs publik
          </Link>
        </p>
      </div>
    </div>
  );
}
