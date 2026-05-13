import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import FormKegiatan from "@/components/admin/FormKegiatan";

export const metadata: Metadata = {
  title: "Edit kegiatan",
};

export default async function AdminKegiatanEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kegiatan = await prisma.kegiatan.findUnique({ where: { id } });
  if (!kegiatan) notFound();

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
          Edit kegiatan
        </h1>
        <p className="mt-1 text-sm text-pmr-dark/60">
          Perubahan akan langsung tersimpan ke database.
        </p>
      </header>

      <FormKegiatan
        mode={{ kind: "edit", id: kegiatan.id }}
        initial={{
          nama: kegiatan.nama,
          deskripsi: kegiatan.deskripsi,
          tanggal: kegiatan.tanggal.toISOString(),
          lokasi: kegiatan.lokasi,
          foto: kegiatan.foto,
          status: kegiatan.status,
        }}
      />
    </div>
  );
}
