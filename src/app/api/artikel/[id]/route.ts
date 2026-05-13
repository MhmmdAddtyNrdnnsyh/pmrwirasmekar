import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { slugify } from "@/lib/utils";
import { deleteFromBucketByUrl } from "@/lib/storage";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const artikel = await prisma.artikel.findUnique({ where: { id } });
    if (!artikel) {
      return NextResponse.json(
        { error: "Artikel tidak ditemukan." },
        { status: 404 },
      );
    }
    return NextResponse.json(artikel);
  } catch (err) {
    console.error("[GET /api/artikel/:id]", err);
    return NextResponse.json(
      { error: "Gagal mengambil artikel." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: Ctx) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const { id } = await params;
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
    const tanggal = body.tanggal ? new Date(body.tanggal) : undefined;
    const thumbnail = body.thumbnail?.trim() || null;

    const existing = await prisma.artikel.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      return NextResponse.json(
        { error: `Slug "${slug}" sudah dipakai artikel lain.` },
        { status: 409 },
      );
    }

    const current = await prisma.artikel.findUnique({
      where: { id },
      select: { thumbnail: true },
    });

    const artikel = await prisma.artikel.update({
      where: { id },
      data: {
        judul,
        slug,
        konten,
        thumbnail,
        status,
        ...(tanggal ? { tanggal } : {}),
      },
    });

    // Hapus thumbnail lama dari storage kalau memang berubah ke URL berbeda
    if (current?.thumbnail && current.thumbnail !== artikel.thumbnail) {
      await deleteFromBucketByUrl(current.thumbnail);
    }

    return NextResponse.json(artikel);
  } catch (err) {
    console.error("[PUT /api/artikel/:id]", err);
    return NextResponse.json(
      { error: "Gagal memperbarui artikel." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const deleted = await prisma.artikel.delete({
      where: { id },
      select: { thumbnail: true },
    });
    await deleteFromBucketByUrl(deleted.thumbnail);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/artikel/:id]", err);
    return NextResponse.json(
      { error: "Gagal menghapus artikel." },
      { status: 500 },
    );
  }
}
