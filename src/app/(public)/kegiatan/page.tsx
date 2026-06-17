import type { Metadata } from "next";

import KegiatanCard from "@/components/public/KegiatanCard";
import { listKegiatan } from "@/lib/content-store";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kegiatan",
  description: `Agenda dan arsip kegiatan ${site.nama} — mulai dari pelatihan, bakti sosial, hingga lomba.`,
};

export const dynamic = "force-dynamic";

export default async function KegiatanListPage() {
  const kegiatanDB = await listKegiatan();

  const toCard = (k: (typeof kegiatanDB)[number]) => ({
    id: k.id,
    nama: k.nama,
    deskripsi: k.deskripsi,
    tanggal: k.tanggal,
    lokasi: k.lokasi,
    status: k.status,
  });

  const akanDatang = kegiatanDB
    .filter((k) => k.status === "AKAN_DATANG")
    .sort((a, b) => Date.parse(a.tanggal) - Date.parse(b.tanggal))
    .map(toCard);
  const selesai = kegiatanDB
    .filter((k) => k.status === "SELESAI")
    .map(toCard);
  const total = akanDatang.length + selesai.length;

  return (
    <>
      <section className="bg-pmr-gray/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-pmr-red">
            Kegiatan
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-pmr-dark md:text-5xl">
            Agenda dan arsip kegiatan
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-pmr-dark/70">
            Ikuti jadwal kegiatan {site.nama} yang akan datang dan lihat
            rekam jejak kami lewat kegiatan yang sudah terlaksana.
          </p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-pmr-gray bg-pmr-white p-5">
              <dt className="text-xs font-medium uppercase tracking-wide text-pmr-dark/60">
                Total kegiatan
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-pmr-dark">
                {total}
              </dd>
            </div>
            <div className="rounded-2xl border border-pmr-gray bg-pmr-white p-5">
              <dt className="text-xs font-medium uppercase tracking-wide text-pmr-dark/60">
                Akan datang
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-pmr-red">
                {akanDatang.length}
              </dd>
            </div>
            <div className="rounded-2xl border border-pmr-gray bg-pmr-white p-5">
              <dt className="text-xs font-medium uppercase tracking-wide text-pmr-dark/60">
                Sudah terlaksana
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-pmr-dark">
                {selesai.length}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="bg-pmr-white py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-pmr-dark">
              Akan datang
            </h2>
            <p className="mt-2 text-pmr-dark/70">
              Agenda terdekat yang sudah terjadwal.
            </p>
          </div>

          {akanDatang.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed border-pmr-gray bg-pmr-gray/40 p-10 text-center text-pmr-dark/60">
              Belum ada agenda terjadwal. Pantau halaman ini secara berkala.
            </p>
          ) : (
            <div className="mt-8 grid gap-4">
              {akanDatang.map((kegiatan) => (
                <KegiatanCard key={kegiatan.id} kegiatan={kegiatan} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-pmr-gray/60 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-pmr-dark">
              Sudah terlaksana
            </h2>
            <p className="mt-2 text-pmr-dark/70">
              Rekam jejak kegiatan yang pernah kami jalankan.
            </p>
          </div>

          {selesai.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed border-pmr-gray bg-pmr-white p-10 text-center text-pmr-dark/60">
              Belum ada kegiatan yang terlaksana.
            </p>
          ) : (
            <div className="mt-8 grid gap-4">
              {selesai.map((kegiatan) => (
                <KegiatanCard key={kegiatan.id} kegiatan={kegiatan} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
