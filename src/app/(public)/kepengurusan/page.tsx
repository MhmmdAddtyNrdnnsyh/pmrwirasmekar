import type { Metadata } from "next";
import { UserRound } from "lucide-react";

import PengurusCard from "@/components/public/PengurusCard";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kepengurusan",
  description: `Struktur kepengurusan ${site.nama} periode berjalan — mulai dari ketua, wakil, hingga koordinator divisi.`,
};

export const dynamic = "force-dynamic";

export default async function KepengurusanPage() {
  const pengurusDB = await prisma.pengurus.findMany({
    orderBy: [{ urutan: "asc" }, { nama: "asc" }],
  });

  const sorted = pengurusDB.map((p) => ({
    id: p.id,
    nama: p.nama,
    jabatan: p.jabatan,
    kelas: p.kelas,
    foto: p.foto ?? undefined,
    urutan: p.urutan,
  }));

  const pimpinanInti = sorted.filter((p) => p.urutan < 10);
  const koordinator = sorted.filter((p) => p.urutan >= 10);

  const pembina = {
    nama: site.kontak.pembina,
    jabatan: "Pembina PMR",
    peran: `Bertanggung jawab atas pembinaan anggota ${site.nama} dan pendampingan kegiatan.`,
  };

  const currentYear = new Date().getFullYear();
  const periode = `${currentYear} – ${currentYear + 1}`;

  return (
    <>
      <section className="bg-pmr-gray/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-pmr-red">
            Kepengurusan
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-pmr-dark md:text-5xl">
            Struktur kepengurusan {site.nama}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-pmr-dark/70">
            Periode kepengurusan {periode}. Kepengurusan dibina langsung oleh
            pembina dan didukung seluruh anggota aktif.
          </p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-pmr-gray bg-pmr-white p-5">
              <dt className="text-xs font-medium uppercase tracking-wide text-pmr-dark/60">
                Pimpinan inti
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-pmr-dark">
                {pimpinanInti.length}
              </dd>
            </div>
            <div className="rounded-2xl border border-pmr-gray bg-pmr-white p-5">
              <dt className="text-xs font-medium uppercase tracking-wide text-pmr-dark/60">
                Koordinator divisi
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-pmr-red">
                {koordinator.length}
              </dd>
            </div>
            <div className="rounded-2xl border border-pmr-gray bg-pmr-white p-5">
              <dt className="text-xs font-medium uppercase tracking-wide text-pmr-dark/60">
                Total pengurus
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-pmr-dark">
                {sorted.length}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="bg-pmr-white py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 rounded-2xl border border-pmr-gray bg-pmr-gray/40 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pmr-red text-pmr-white">
              <UserRound className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-pmr-red">
                {pembina.jabatan}
              </p>
              <h2 className="mt-0.5 text-lg font-semibold text-pmr-dark">
                {pembina.nama}
              </h2>
              <p className="mt-1 text-sm text-pmr-dark/70">{pembina.peran}</p>
            </div>
          </div>
        </div>
      </section>

      {sorted.length === 0 ? (
        <section className="bg-pmr-white pb-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="rounded-2xl border border-dashed border-pmr-gray bg-pmr-gray/40 p-10 text-center text-pmr-dark/60">
              Data pengurus belum diisi. Silakan cek kembali nanti.
            </p>
          </div>
        </section>
      ) : (
        <>
          <section className="bg-pmr-white pb-14 sm:pb-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold tracking-tight text-pmr-dark">
                Pimpinan inti
              </h2>
              <p className="mt-2 text-pmr-dark/70">
                Memimpin jalannya organisasi dan mengoordinasi seluruh divisi.
              </p>

              {pimpinanInti.length === 0 ? (
                <p className="mt-8 rounded-2xl border border-dashed border-pmr-gray bg-pmr-gray/40 p-10 text-center text-pmr-dark/60">
                  Belum ada pimpinan inti yang terdaftar.
                </p>
              ) : (
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {pimpinanInti.map((p) => (
                    <PengurusCard key={p.id} pengurus={p} />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="bg-pmr-gray/60 py-14 sm:py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold tracking-tight text-pmr-dark">
                Koordinator divisi
              </h2>
              <p className="mt-2 text-pmr-dark/70">
                Memimpin divisi masing-masing dan memastikan program kerja
                berjalan sesuai Tri Bakti PMR.
              </p>

              {koordinator.length === 0 ? (
                <p className="mt-8 rounded-2xl border border-dashed border-pmr-gray bg-pmr-white p-10 text-center text-pmr-dark/60">
                  Belum ada koordinator divisi yang ditunjuk.
                </p>
              ) : (
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {koordinator.map((p) => (
                    <PengurusCard key={p.id} pengurus={p} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}
