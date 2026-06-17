import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";

import { getKegiatan } from "@/lib/content-store";
import { formatDate } from "@/lib/utils";
import { site } from "@/lib/site";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const kegiatan = await getKegiatan(id);

  if (!kegiatan) return { title: "Kegiatan tidak ditemukan" };

  return {
    title: kegiatan.nama,
    description: kegiatan.deskripsi.slice(0, 180),
  };
}

export const dynamic = "force-dynamic";

export default async function KegiatanDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const kegiatan = await getKegiatan(id);
  if (!kegiatan) notFound();

  const isUpcoming = kegiatan.status === "AKAN_DATANG";

  const paragraphs = kegiatan.deskripsi
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article>
      <section className="bg-pmr-gray/40">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/kegiatan"
            className="inline-flex items-center gap-1 text-sm font-medium text-pmr-dark/60 hover:text-pmr-red"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Kembali ke semua kegiatan
          </Link>
          <span
            className={
              isUpcoming
                ? "mt-6 inline-block rounded-full bg-pmr-red/10 px-2.5 py-0.5 text-xs font-semibold text-pmr-red"
                : "mt-6 inline-block rounded-full bg-pmr-gray px-2.5 py-0.5 text-xs font-semibold text-pmr-dark/70"
            }
          >
            {isUpcoming ? "Akan Datang" : "Selesai"}
          </span>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-pmr-dark md:text-4xl">
            {kegiatan.nama}
          </h1>
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-pmr-red" aria-hidden />
              <span className="text-pmr-dark/80">
                {formatDate(kegiatan.tanggal)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-pmr-red" aria-hidden />
              <span className="text-pmr-dark/80">{kegiatan.lokasi}</span>
            </div>
          </dl>
          <p className="mt-3 text-sm text-pmr-dark/60">
            Diselenggarakan oleh {site.nama}
          </p>
        </div>
      </section>

      {kegiatan.foto ? (
        <section className="bg-pmr-white">
          <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 lg:px-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={kegiatan.foto}
              alt=""
              className="w-full rounded-2xl object-cover"
            />
          </div>
        </section>
      ) : null}

      <section className="bg-pmr-white py-10 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-5 text-base leading-relaxed text-pmr-dark/85">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
