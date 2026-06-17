import type { Metadata } from "next";

import { formatDate } from "@/lib/utils";
import { listPendaftaran } from "@/lib/pendaftaran-store";
import DeleteButton from "@/components/admin/DeleteButton";
import PendaftaranStatusMenu from "@/components/admin/PendaftaranStatusMenu";

export const metadata: Metadata = {
  title: "Pendaftaran",
};

export const dynamic = "force-dynamic";

export default async function AdminPendaftaranPage() {
  const pendaftaran = await listPendaftaran();
  const pendingCount = pendaftaran.filter((p) => p.status === "PENDING").length;
  const diterimaCount = pendaftaran.filter(
    (p) => p.status === "DITERIMA",
  ).length;
  const ditolakCount = pendaftaran.filter((p) => p.status === "DITOLAK").length;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-pmr-red">Manajemen</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-pmr-dark md:text-3xl">
          Pendaftaran
        </h1>
        <p className="mt-1 text-sm text-pmr-dark/60">
          Kelola pendaftar anggota baru. Status dapat diubah dengan tombol
          cepat di kolom Aksi.
        </p>
      </header>

      <dl className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Menunggu review" value={pendingCount} accent />
        <StatCard label="Diterima" value={diterimaCount} tone="success" />
        <StatCard label="Ditolak" value={ditolakCount} />
      </dl>

      {pendaftaran.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-pmr-gray bg-pmr-white p-10 text-center">
          <p className="text-pmr-dark/70">
            Belum ada pendaftar. Bagikan tautan halaman <code>/daftar</code> ke
            calon anggota.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-pmr-gray bg-pmr-white">
          <table className="w-full text-sm">
            <thead className="border-b border-pmr-gray bg-pmr-gray/40 text-left text-xs font-semibold uppercase tracking-wide text-pmr-dark/70">
              <tr>
                <th className="px-5 py-3">Pendaftar</th>
                <th className="px-5 py-3">Kontak</th>
                <th className="px-5 py-3">Alasan</th>
                <th className="px-5 py-3">Tanggal</th>
                <th className="px-5 py-3 text-right">Status &amp; Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pmr-gray">
              {pendaftaran.map((p) => (
                <tr key={p.id} className="hover:bg-pmr-gray/30 align-top">
                  <td className="px-5 py-4">
                    <div className="font-medium text-pmr-dark">{p.nama}</div>
                    <div className="mt-0.5 text-xs text-pmr-dark/60">
                      NIS {p.nis} &middot; {p.kelas}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-pmr-dark/70">
                    <span className="font-mono text-xs">{p.noHp}</span>
                  </td>
                  <td className="px-5 py-4 max-w-sm">
                    <p className="line-clamp-3 text-pmr-dark/80">
                      {p.alasan}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-pmr-dark/70">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col items-end gap-3">
                      <PendaftaranStatusMenu
                        id={p.id}
                        current={p.status}
                      />
                      <DeleteButton
                        endpoint={`/api/pendaftaran/${p.id}`}
                        label="Hapus"
                        confirmText={`Pendaftaran atas nama "${p.nama}" akan dihapus permanen.`}
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

function StatCard({
  label,
  value,
  accent,
  tone,
}: {
  label: string;
  value: number;
  accent?: boolean;
  tone?: "success";
}) {
  const valueClass =
    tone === "success"
      ? "text-emerald-700"
      : accent
        ? "text-pmr-red"
        : "text-pmr-dark";
  return (
    <div className="rounded-2xl border border-pmr-gray bg-pmr-white p-5">
      <dt className="text-xs font-medium uppercase tracking-wide text-pmr-dark/60">
        {label}
      </dt>
      <dd className={`mt-2 text-2xl font-semibold ${valueClass}`}>{value}</dd>
    </div>
  );
}
