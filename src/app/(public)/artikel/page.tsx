import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ArtikelCard from "@/components/public/ArtikelCard";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Artikel",
  description: `Kumpulan artikel, cerita kegiatan, dan wawasan kepalangmerahan dari ${site.nama}.`,
};

// Selalu fresh — konten bisa di-publish/unpublish dari panel admin.
export const dynamic = "force-dynamic";

function buildRingkasan(konten: string): string {
  const flat = konten.replace(/\s+/g, " ").trim();
  return flat.length > 180 ? `${flat.slice(0, 180)}…` : flat;
}

export default async function ArtikelListPage() {
  const artikelDB = await prisma.artikel.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { tanggal: "desc" },
  });

  const artikelList = artikelDB.map((a) => ({
    id: a.id,
    judul: a.judul,
    slug: a.slug,
    thumbnail: a.thumbnail ?? undefined,
    tanggal: a.tanggal.toISOString(),
    ringkasan: buildRingkasan(a.konten),
  }));

  const [sorotan, ...lainnya] = artikelList;

  return (
    <>
      <section className="bg-pmr-gray/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-pmr-red">
            Artikel
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-pmr-dark md:text-5xl">
            Cerita, wawasan, dan kabar kegiatan
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-pmr-dark/70">
            Ikuti tulisan anggota dan pengurus {site.nama} — mulai dari laporan
            kegiatan, materi pelatihan, hingga pengalaman berbakti di
            masyarakat.
          </p>
        </div>
      </section>

      {artikelList.length === 0 ? (
        <section className="bg-pmr-white py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="rounded-2xl border border-dashed border-pmr-gray bg-pmr-gray/40 p-10 text-center text-pmr-dark/60">
              Belum ada artikel dipublikasikan. Cek lagi nanti ya.
            </p>
          </div>
        </section>
      ) : (
        <>
          {sorotan ? (
            <section className="bg-pmr-white py-14 sm:py-16">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-pmr-red">
                  Sorotan
                </h2>
                <article className="group relative mt-4 grid overflow-hidden rounded-3xl border border-pmr-gray bg-pmr-white md:grid-cols-2">
                  {sorotan.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sorotan.thumbnail}
                      alt=""
                      className="aspect-video w-full object-cover md:aspect-auto md:h-full"
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="relative flex aspect-video items-center justify-center bg-linear-to-br from-pmr-red/15 to-pmr-red/40 md:aspect-auto"
                    >
                      <span className="text-8xl font-bold text-pmr-red/40">
                        +
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 md:p-10">
                    <time
                      dateTime={sorotan.tanggal}
                      className="text-xs font-medium uppercase tracking-wide text-pmr-red"
                    >
                      {formatDate(sorotan.tanggal)}
                    </time>
                    <h3 className="text-2xl font-bold leading-snug text-pmr-dark md:text-3xl">
                      <Link
                        href={`/artikel/${sorotan.slug}`}
                        className="after:absolute after:inset-0 hover:text-pmr-red"
                      >
                        {sorotan.judul}
                      </Link>
                    </h3>
                    <p className="text-pmr-dark/70">{sorotan.ringkasan}</p>
                    <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-pmr-red group-hover:text-pmr-red-dark">
                      Baca selengkapnya
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                </article>
              </div>
            </section>
          ) : null}

          <section className="bg-pmr-gray/60 py-14 sm:py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-pmr-dark">
                    Semua artikel
                  </h2>
                  <p className="mt-2 text-pmr-dark/70">
                    {artikelList.length} artikel telah dipublikasikan.
                  </p>
                </div>
              </div>

              {lainnya.length === 0 ? (
                <p className="mt-10 rounded-2xl border border-dashed border-pmr-gray bg-pmr-white p-10 text-center text-pmr-dark/60">
                  Belum ada artikel lain saat ini. Cek lagi nanti ya.
                </p>
              ) : (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {lainnya.map((artikel) => (
                    <ArtikelCard key={artikel.id} artikel={artikel} />
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
