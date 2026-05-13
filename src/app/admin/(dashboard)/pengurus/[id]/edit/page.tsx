import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import FormPengurus from "@/components/admin/FormPengurus";

export const metadata: Metadata = {
  title: "Edit pengurus",
};

export default async function AdminPengurusEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pengurus = await prisma.pengurus.findUnique({ where: { id } });
  if (!pengurus) notFound();

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
          Edit pengurus
        </h1>
        <p className="mt-1 text-sm text-pmr-dark/60">
          Perubahan akan langsung tersimpan ke database.
        </p>
      </header>

      <FormPengurus
        mode={{ kind: "edit", id: pengurus.id }}
        initial={{
          nama: pengurus.nama,
          jabatan: pengurus.jabatan,
          kelas: pengurus.kelas,
          foto: pengurus.foto,
          urutan: pengurus.urutan,
        }}
      />
    </div>
  );
}
