import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/api-auth";
import { slugify } from "@/lib/utils";
import { deleteFromBucketByUrl } from "@/lib/storage";
import {
  deleteArtikel,
  getArtikel,
  getArtikelBySlug,
  updateArtikel,
} from "@/lib/content-store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const artikel = await getArtikel(id);
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
    const tanggal = body.tanggal ? new Date(body.tanggal) : new Date();
    if (Number.isNaN(tanggal.getTime())) {
      return NextResponse.json(
        { error: "Format tanggal tidak valid." },
        { status: 400 },
      );
    }
    const thumbnail = body.thumbnail?.trim() || null;

    const existing = await getArtikelBySlug(slug);
    if (existing && existing.id !== id) {
      return NextResponse.json(
        { error: `Slug "${slug}" sudah dipakai artikel lain.` },
        { status: 409 },
      );
    }

    const current = await getArtikel(id);
    const artikel = await updateArtikel(id, {
      judul,
      slug,
      konten,
      thumbnail,
      tanggal: tanggal.toISOString(),
      status,
    });
    if (!artikel) {
      return NextResponse.json(
        { error: "Artikel tidak ditemukan." },
        { status: 404 },
      );
    }

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
    const deleted = await deleteArtikel(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Artikel tidak ditemukan." },
        { status: 404 },
      );
    }
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
