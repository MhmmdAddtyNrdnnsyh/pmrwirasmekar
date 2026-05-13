import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/admin/DeleteButton";

export const metadata: Metadata = {
  title: "Artikel",
};

export const dynamic = "force-dynamic";

export default async function AdminArtikelPage() {
  const artikel = await prisma.artikel.findMany({
    orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-pmr-red">Manajemen</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-pmr-dark md:text-3xl">
            Artikel
          </h1>
          <p className="mt-1 text-sm text-pmr-dark/60">
            Kelola artikel, cerita kegiatan, dan wawasan untuk halaman publik.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/artikel/tambah" className="gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            Artikel baru
          </Link>
        </Button>
      </header>

      {artikel.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-pmr-gray bg-pmr-white p-10 text-center">
          <p className="text-pmr-dark/70">
            Belum ada artikel. Mulai dari{" "}
            <Link
              href="/admin/artikel/tambah"
              className="font-semibold text-pmr-red hover:underline"
            >
              buat artikel baru
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-pmr-gray bg-pmr-white">
          <table className="w-full text-sm">
            <thead className="border-b border-pmr-gray bg-pmr-gray/40 text-left text-xs font-semibold uppercase tracking-wide text-pmr-dark/70">
              <tr>
                <th className="px-5 py-3">Judul</th>
                <th className="px-5 py-3">Tanggal</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pmr-gray">
              {artikel.map((a) => (
                <tr key={a.id} className="hover:bg-pmr-gray/30">
                  <td className="px-5 py-4">
                    <div className="font-medium text-pmr-dark">{a.judul}</div>
                    <div className="mt-0.5 text-xs text-pmr-dark/60">
                      /artikel/{a.slug}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-pmr-dark/70">
                    {formatDate(a.tanggal.toISOString())}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/artikel/${a.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-pmr-gray bg-pmr-white px-3 py-1.5 text-xs font-medium text-pmr-dark/80 transition-colors hover:border-pmr-red/30 hover:bg-pmr-red/5 hover:text-pmr-red"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Edit
                      </Link>
                      <DeleteButton
                        endpoint={`/api/artikel/${a.id}`}
                        confirmText={`Artikel "${a.judul}" akan dihapus permanen.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" }) {
  return status === "PUBLISHED" ? (
    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
      Published
    </span>
  ) : (
    <span className="rounded-full bg-pmr-gray px-2.5 py-0.5 text-xs font-semibold text-pmr-dark/70">
      Draft
    </span>
  );
}
