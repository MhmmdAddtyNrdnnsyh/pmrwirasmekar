import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/api-auth";
import {
  createArtikel,
  getArtikelBySlug,
  listArtikel,
} from "@/lib/content-store";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const artikel = await listArtikel();
    return NextResponse.json(artikel);
  } catch (err) {
    console.error("[GET /api/artikel]", err);
    return NextResponse.json(
      { error: "Gagal mengambil data artikel." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const body = (await request.json()) as {
      judul?: string;
      slug?: string;
      konten?: string;
      thumbnail?: string | null;
      tanggal?: string;
      status?: "DRAFT" | "PUBLISHED";
    };

    const judul = body.judul?.trim();
    const konten = body.konten?.trim();
    if (!judul || !konten) {
      return NextResponse.json(
        { error: "Judul dan konten wajib diisi." },
        { status: 400 },
      );
    }

    const slug = (body.slug?.trim() || slugify(judul)) || "artikel";
    const status = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    const tanggal = body.tanggal ? new Date(body.tanggal) : new Date();
    if (Number.isNaN(tanggal.getTime())) {
      return NextResponse.json(
        { error: "Format tanggal tidak valid." },
        { status: 400 },
      );
    }
    const thumbnail = body.thumbnail?.trim() || null;

    const existing = await getArtikelBySlug(slug);
    if (existing) {
      return NextResponse.json(
        { error: `Slug "${slug}" sudah dipakai artikel lain.` },
        { status: 409 },
      );
    }

    const artikel = await createArtikel({
      judul,
      slug,
      konten,
      thumbnail,
      tanggal: tanggal.toISOString(),
      status,
    });
    return NextResponse.json(artikel, { status: 201 });
  } catch (err) {
    console.error("[POST /api/artikel]", err);
    return NextResponse.json(
      { error: "Gagal menambah artikel." },
      { status: 500 },
    );
  }
}
