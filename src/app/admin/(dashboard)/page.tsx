import type { Metadata } from "next";
import Link from "next/link";
import {
  Newspaper,
  Calendar,
  Users,
  ClipboardList,
  type LucideIcon,
  ArrowRight,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

// Jangan cache — dashboard selalu fresh tiap akses.
export const dynamic = "force-dynamic";

type Stat = {
  label: string;
  value: number;
  hint: string;
  href: string;
  Icon: LucideIcon;
  highlight?: boolean;
};

export default async function AdminDashboardPage() {
  const [
    totalArtikel,
    artikelPublished,
    totalKegiatan,
    kegiatanUpcoming,
    totalPengurus,
    pendaftaranPending,
    totalPendaftaran,
    pendaftaranTerbaru,
  ] = await Promise.all([
    prisma.artikel.count(),
    prisma.artikel.count({ where: { status: "PUBLISHED" } }),
    prisma.kegiatan.count(),
    prisma.kegiatan.count({ where: { status: "AKAN_DATANG" } }),
    prisma.pengurus.count(),
    prisma.pendaftaran.count({ where: { status: "PENDING" } }),
    prisma.pendaftaran.count(),
    prisma.pendaftaran.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const stats: Stat[] = [
    {
      label: "Artikel",
      value: totalArtikel,
      hint: `${artikelPublished} published`,
      href: "/admin/artikel",
      Icon: Newspaper,
    },
    {
      label: "Kegiatan",
      value: totalKegiatan,
      hint: `${kegiatanUpcoming} akan datang`,
      href: "/admin/kegiatan",
      Icon: Calendar,
    },
    {
      label: "Pengurus",
      value: totalPengurus,
      hint: "aktif periode ini",
      href: "/admin/pengurus",
      Icon: Users,
    },
    {
      label: "Pendaftaran",
      value: totalPendaftaran,
      hint: `${pendaftaranPending} menunggu review`,
      href: "/admin/pendaftaran",
      Icon: ClipboardList,
      highlight: pendaftaranPending > 0,
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-pmr-red">Panel Admin</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-pmr-dark md:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-pmr-dark/60">
          Ringkasan status konten dan pendaftaran anggota baru.
        </p>
      </header>

      <section
        aria-labelledby="ringkasan-heading"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <h2 id="ringkasan-heading" className="sr-only">
          Ringkasan
        </h2>
        {stats.map(({ label, value, hint, href, Icon, highlight }) => (
          <Link
            key={label}
            href={href}
            className="group flex flex-col gap-3 rounded-2xl border border-pmr-gray bg-pmr-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span
                className={
                  highlight
                    ? "flex h-9 w-9 items-center justify-center rounded-lg bg-pmr-red text-pmr-white"
                    : "flex h-9 w-9 items-center justify-center rounded-lg bg-pmr-red/10 text-pmr-red"
                }
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <ArrowRight className="h-4 w-4 text-pmr-dark/30 transition-colors group-hover:text-pmr-red" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-pmr-dark/60">
                {label}
              </p>
              <p className="mt-1 text-3xl font-bold text-pmr-dark">{value}</p>
              <p className="mt-1 text-xs text-pmr-dark/60">{hint}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border border-pmr-gray bg-pmr-white">
        <header className="flex items-center justify-between border-b border-pmr-gray p-5">
          <div>
            <h2 className="text-base font-semibold text-pmr-dark">
              Pendaftaran terbaru
            </h2>
            <p className="mt-0.5 text-xs text-pmr-dark/60">
              5 pendaftar paling baru.
            </p>
          </div>
          <Link
            href="/admin/pendaftaran"
            className="text-sm font-semibold text-pmr-red hover:text-pmr-red-dark"
          >
            Lihat semua
          </Link>
        </header>

        {pendaftaranTerbaru.length === 0 ? (
          <p className="p-10 text-center text-sm text-pmr-dark/60">
            Belum ada pendaftar. Bagikan tautan{" "}
            <Link
              href="/daftar"
              className="font-medium text-pmr-red hover:underline"
            >
              halaman daftar
            </Link>{" "}
            ke calon anggota.
          </p>
        ) : (
          <ul className="divide-y divide-pmr-gray">
            {pendaftaranTerbaru.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-4 p-5 transition-colors hover:bg-pmr-gray/30"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pmr-red/10 text-sm font-semibold text-pmr-red">
                  {p.nama.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-pmr-dark">
                    {p.nama}
                  </p>
                  <p className="text-xs text-pmr-dark/60">
                    {p.kelas} &middot; {formatDate(p.createdAt.toISOString())}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "PENDING" | "DITERIMA" | "DITOLAK";
}) {
  const map = {
    PENDING: {
      label: "Menunggu",
      className: "bg-pmr-red/10 text-pmr-red",
    },
    DITERIMA: {
      label: "Diterima",
      className: "bg-emerald-50 text-emerald-700",
    },
    DITOLAK: {
      label: "Ditolak",
      className: "bg-pmr-gray text-pmr-dark/70",
    },
  } as const;

  const { label, className } = map[status];
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}
