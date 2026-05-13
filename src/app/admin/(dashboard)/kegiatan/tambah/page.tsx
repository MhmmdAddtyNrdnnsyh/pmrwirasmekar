import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import FormKegiatan from "@/components/admin/FormKegiatan";

export const metadata: Metadata = {
  title: "Kegiatan baru",
};

export default function AdminKegiatanTambahPage() {
  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin/kegiatan"
          className="inline-flex items-center gap-1 text-sm font-medium text-pmr-dark/60 hover:text-pmr-red"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke daftar
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-pmr-dark md:text-3xl">
          Kegiatan baru
        </h1>
        <p className="mt-1 text-sm text-pmr-dark/60">
          Tambahkan agenda atau arsip kegiatan PMR.
        </p>
      </header>

      <FormKegiatan mode={{ kind: "create" }} />
    </div>
  );
}
