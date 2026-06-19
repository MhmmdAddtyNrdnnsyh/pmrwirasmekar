import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

import { listPengurus } from "@/lib/content-store";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/admin/DeleteButton";

export const metadata: Metadata = {
  title: "Pengurus",
};

export const dynamic = "force-dynamic";

function initial(nama: string): string {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function AdminPengurusPage() {
  const pengurus = await listPengurus();

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-pmr-red">Manajemen</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-pmr-dark md:text-3xl">
            Pengurus
          </h1>
          <p className="mt-1 text-sm text-pmr-dark/60">
            Kelola daftar pengurus dan pimpinan periode berjalan.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/pengurus/tambah" className="gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            Pengurus baru
          </Link>
        </Button>
      </header>

      {pengurus.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-pmr-gray bg-pmr-white p-10 text-center">
          <p className="text-pmr-dark/70">
            Belum ada pengurus. Mulai dari{" "}
            <Link
              href="/admin/pengurus/tambah"
              className="font-semibold text-pmr-red hover:underline"
            >
              tambah pengurus baru
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
                <th className="px-5 py-3">Jabatan</th>
                <th className="px-5 py-3">Kelas</th>
                <th className="px-5 py-3">Urutan</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pmr-gray">
              {pengurus.map((p) => (
                <tr key={p.id} className="hover:bg-pmr-gray/30">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {p.foto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.foto}
                          alt={p.nama}
                          className="h-9 w-9 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pmr-red/10 text-xs font-semibold text-pmr-red">
                          {initial(p.nama)}
                        </span>
                      )}
                      <span className="font-medium text-pmr-dark">
                        {p.nama}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-pmr-dark/70">{p.jabatan}</td>
                  <td className="px-5 py-4 text-pmr-dark/70">{p.kelas}</td>
                  <td className="px-5 py-4 text-pmr-dark/70">{p.urutan}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/pengurus/${p.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-pmr-gray bg-pmr-white px-3 py-1.5 text-xs font-medium text-pmr-dark/80 transition-colors hover:border-pmr-red/30 hover:bg-pmr-red/5 hover:text-pmr-red"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Edit
                      </Link>
                      <DeleteButton
                        endpoint={`/api/pengurus/${p.id}`}
                        confirmText={`Pengurus "${p.nama}" akan dihapus permanen.`}
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
