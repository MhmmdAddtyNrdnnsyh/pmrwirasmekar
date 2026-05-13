import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import FormPengurus from "@/components/admin/FormPengurus";

export const metadata: Metadata = {
  title: "Pengurus baru",
};

export default function AdminPengurusTambahPage() {
  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin/pengurus"
          className="inline-flex items-center gap-1 text-sm font-medium text-pmr-dark/60 hover:text-pmr-red"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke daftar
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-pmr-dark md:text-3xl">
          Pengurus baru
        </h1>
        <p className="mt-1 text-sm text-pmr-dark/60">
          Tambahkan pengurus ke daftar kepengurusan periode ini.
        </p>
      </header>

      <FormPengurus mode={{ kind: "create" }} />
    </div>
  );
}
