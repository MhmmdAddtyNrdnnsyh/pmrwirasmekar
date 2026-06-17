import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getArtikel } from "@/lib/content-store";
import FormArtikel from "@/components/admin/FormArtikel";

export const metadata: Metadata = {
  title: "Edit artikel",
};

export default async function AdminArtikelEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artikel = await getArtikel(id);
  if (!artikel) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin/artikel"
          className="inline-flex items-center gap-1 text-sm font-medium text-pmr-dark/60 hover:text-pmr-red"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke daftar
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-pmr-dark md:text-3xl">
          Edit artikel
        </h1>
        <p className="mt-1 text-sm text-pmr-dark/60">
          Perubahan akan langsung tersimpan ke Google Sheets.
        </p>
      </header>

      <FormArtikel
        mode={{ kind: "edit", id: artikel.id }}
        initial={{
          judul: artikel.judul,
          slug: artikel.slug,
          konten: artikel.konten,
          thumbnail: artikel.thumbnail,
          tanggal: artikel.tanggal,
          status: artikel.status,
        }}
      />
    </div>
  );
}
