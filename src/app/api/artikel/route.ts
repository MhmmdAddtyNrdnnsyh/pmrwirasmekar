import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const artikel = await prisma.artikel.findMany({
      orderBy: { tanggal: "desc" },
    });
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
    const thumbnail = body.thumbnail?.trim() || null;

    const existing = await prisma.artikel.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: `Slug "${slug}" sudah dipakai artikel lain.` },
        { status: 409 },
      );
    }

    const artikel = await prisma.artikel.create({
      data: { judul, slug, konten, thumbnail, tanggal, status },
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
