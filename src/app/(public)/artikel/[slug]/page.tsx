import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { site } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const artikel = await prisma.artikel.findUnique({
    where: { slug },
    select: { judul: true, konten: true, status: true },
  });

  if (!artikel || artikel.status !== "PUBLISHED") {
    return { title: "Artikel tidak ditemukan" };
  }

  const desc = artikel.konten
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);

  return {
    title: artikel.judul,
    description: desc,
  };
}

export const dynamic = "force-dynamic";

export default async function ArtikelDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const artikel = await prisma.artikel.findUnique({ where: { slug } });

  if (!artikel || artikel.status !== "PUBLISHED") {
    notFound();
  }

  // Split konten ke paragraf berdasarkan baris kosong
  const paragraphs = artikel.konten
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article>
      <section className="bg-pmr-gray/40">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/artikel"
            className="inline-flex items-center gap-1 text-sm font-medium text-pmr-dark/60 hover:text-pmr-red"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Kembali ke semua artikel
          </Link>
          <time
            dateTime={artikel.tanggal.toISOString()}
            className="mt-6 block text-xs font-semibold uppercase tracking-wide text-pmr-red"
          >
            {formatDate(artikel.tanggal.toISOString())}
          </time>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-pmr-dark md:text-4xl">
            {artikel.judul}
          </h1>
          <p className="mt-3 text-sm text-pmr-dark/60">
            Diterbitkan oleh {site.nama}
          </p>
        </div>
      </section>

      {artikel.thumbnail ? (
        <section className="bg-pmr-white">
          <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 lg:px-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={artikel.thumbnail}
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
