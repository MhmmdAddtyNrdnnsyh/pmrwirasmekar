import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

import { listKegiatan } from "@/lib/content-store";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/admin/DeleteButton";

export const metadata: Metadata = {
  title: "Kegiatan",
};

export const dynamic = "force-dynamic";

export default async function AdminKegiatanPage() {
  const kegiatan = await listKegiatan();

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-pmr-red">Manajemen</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-pmr-dark md:text-3xl">
            Kegiatan
          </h1>
          <p className="mt-1 text-sm text-pmr-dark/60">
            Kelola agenda dan arsip kegiatan PMR.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/kegiatan/tambah" className="gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            Kegiatan baru
          </Link>
        </Button>
      </header>

      {kegiatan.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-pmr-gray bg-pmr-white p-10 text-center">
          <p className="text-pmr-dark/70">
            Belum ada kegiatan. Mulai dari{" "}
            <Link
              href="/admin/kegiatan/tambah"
              className="font-semibold text-pmr-red hover:underline"
            >
              buat kegiatan baru
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-pmr-gray bg-pmr-white">
          <table className="w-full text-sm">
            <thead className="border-b border-pmr-gray bg-pmr-gray/40 text-left text-xs font-semibold uppercase tracking-wide text-pmr-dark/70">
              <tr>
                <th className="px-5 py-3">Nama</th>
                <th className="px-5 py-3">Tanggal</th>
                <th className="px-5 py-3">Lokasi</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pmr-gray">
              {kegiatan.map((k) => (
                <tr key={k.id} className="hover:bg-pmr-gray/30">
                  <td className="px-5 py-4">
                    <div className="font-medium text-pmr-dark">{k.nama}</div>
                    <div className="mt-0.5 line-clamp-1 text-xs text-pmr-dark/60">
                      {k.deskripsi}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-pmr-dark/70">
                    {formatDate(k.tanggal)}
                  </td>
                  <td className="px-5 py-4 text-pmr-dark/70">{k.lokasi}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={k.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/kegiatan/${k.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-pmr-gray bg-pmr-white px-3 py-1.5 text-xs font-medium text-pmr-dark/80 transition-colors hover:border-pmr-red/30 hover:bg-pmr-red/5 hover:text-pmr-red"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Edit
                      </Link>
                      <DeleteButton
                        endpoint={`/api/kegiatan/${k.id}`}
                        confirmText={`Kegiatan "${k.nama}" akan dihapus permanen.`}
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

function StatusBadge({
  status,
}: {
  status: "AKAN_DATANG" | "SELESAI";
}) {
  return status === "AKAN_DATANG" ? (
    <span className="rounded-full bg-pmr-red/10 px-2.5 py-0.5 text-xs font-semibold text-pmr-red">
      Akan datang
    </span>
  ) : (
    <span className="rounded-full bg-pmr-gray px-2.5 py-0.5 text-xs font-semibold text-pmr-dark/70">
      Selesai
    </span>
  );
}
