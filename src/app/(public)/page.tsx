import Link from "next/link";

import HeroSection from "@/components/public/HeroSection";
import ArtikelCard from "@/components/public/ArtikelCard";
import KegiatanCard from "@/components/public/KegiatanCard";
import { listArtikel, listKegiatan } from "@/lib/content-store";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

function buildRingkasan(konten: string): string {
  const flat = konten.replace(/\s+/g, " ").trim();
  return flat.length > 180 ? `${flat.slice(0, 180)}…` : flat;
}

export default async function HomePage() {
  const [artikelDB, kegiatanDB] = await Promise.all([
    listArtikel(),
    listKegiatan(),
  ]);

  const artikelTerbaru = artikelDB
    .filter((a) => a.status === "PUBLISHED")
    .slice(0, 3)
    .map((a) => ({
      id: a.id,
      judul: a.judul,
      slug: a.slug,
      thumbnail: a.thumbnail ?? undefined,
      tanggal: a.tanggal,
      ringkasan: buildRingkasan(a.konten),
    }));

  const kegiatanTerdekat = kegiatanDB
    .filter((k) => k.status === "AKAN_DATANG")
    .sort((a, b) => Date.parse(a.tanggal) - Date.parse(b.tanggal))
    .slice(0, 3)
    .map((k) => ({
      id: k.id,
      nama: k.nama,
      deskripsi: k.deskripsi,
      tanggal: k.tanggal,
      lokasi: k.lokasi,
      status: k.status,
    }));

  return (
    <>
      <HeroSection />

      <section className="bg-pmr-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-pmr-dark">
                Tentang {site.nama}
              </h2>
              <p className="mt-4 text-pmr-dark/70">{site.deskripsiSingkat}</p>
              <Link
                href="/tentang"
                className="mt-6 inline-flex items-center font-semibold text-pmr-red hover:text-pmr-red-dark"
              >
                Selengkapnya &rarr;
              </Link>
            </div>

            <ul className="grid gap-5 md:col-span-2 sm:grid-cols-3">
              <li className="rounded-2xl border border-pmr-gray bg-pmr-gray/50 p-5">
                <p className="text-sm font-semibold text-pmr-red">Kemanusiaan</p>
                <p className="mt-2 text-sm text-pmr-dark/80">
                  Mengasah empati dan kepedulian melalui aksi nyata bagi sesama.
                </p>
              </li>
              <li className="rounded-2xl border border-pmr-gray bg-pmr-gray/50 p-5">
                <p className="text-sm font-semibold text-pmr-red">
                  Pertolongan Pertama
                </p>
                <p className="mt-2 text-sm text-pmr-dark/80">
                  Pelatihan rutin pertolongan pertama bersama pembina dan PMI.
                </p>
              </li>
              <li className="rounded-2xl border border-pmr-gray bg-pmr-gray/50 p-5">
                <p className="text-sm font-semibold text-pmr-red">Kepemimpinan</p>
                <p className="mt-2 text-sm text-pmr-dark/80">
                  Ruang belajar memimpin lewat kepanitiaan dan kegiatan sosial.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-pmr-gray/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-pmr-dark">
                Artikel Terbaru
              </h2>
              <p className="mt-2 text-pmr-dark/70">
                Cerita, wawasan, dan kabar dari kegiatan anggota PMR.
              </p>
            </div>
            <Link
              href="/artikel"
              className="hidden shrink-0 font-semibold text-pmr-red hover:text-pmr-red-dark sm:inline"
            >
              Lihat semua &rarr;
            </Link>
          </div>

          {artikelTerbaru.length === 0 ? (
            <p className="mt-10 rounded-2xl border border-dashed border-pmr-gray bg-pmr-white p-10 text-center text-pmr-dark/60">
              Belum ada artikel dipublikasikan.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {artikelTerbaru.map((artikel) => (
                <ArtikelCard key={artikel.id} artikel={artikel} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-pmr-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-pmr-dark">
                Kegiatan Terdekat
              </h2>
              <p className="mt-2 text-pmr-dark/70">
                Agenda yang akan datang dan terbuka bagi anggota maupun tamu
                undangan.
              </p>
            </div>
            <Link
              href="/kegiatan"
              className="hidden shrink-0 font-semibold text-pmr-red hover:text-pmr-red-dark sm:inline"
            >
              Lihat semua &rarr;
            </Link>
          </div>

          {kegiatanTerdekat.length === 0 ? (
            <p className="mt-10 rounded-2xl border border-dashed border-pmr-gray bg-pmr-gray/40 p-10 text-center text-pmr-dark/60">
              Belum ada agenda terjadwal. Pantau halaman ini secara berkala.
            </p>
          ) : (
            <div className="mt-8 grid gap-4">
              {kegiatanTerdekat.map((kegiatan) => (
                <KegiatanCard key={kegiatan.id} kegiatan={kegiatan} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-pmr-red">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <h2 className="text-2xl font-bold text-pmr-white md:text-3xl">
              Siap bergabung jadi relawan muda?
            </h2>
            <p className="mt-2 max-w-xl text-pmr-white/80">
              Daftarkan dirimu sekarang dan ikuti seleksi anggota baru PMR{" "}
              {site.sekolah}.
            </p>
          </div>
          <Link
            href="/daftar"
            className="inline-flex items-center justify-center rounded-full bg-pmr-white px-6 py-3 text-sm font-semibold text-pmr-red shadow-sm transition-colors hover:bg-pmr-gray focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pmr-white"
          >
            Daftar Sekarang
          </Link>
        </div>
      </section>
    </>
  );
}
