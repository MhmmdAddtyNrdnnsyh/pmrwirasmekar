import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { deleteFromBucketByUrl } from "@/lib/storage";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const pengurus = await prisma.pengurus.findUnique({ where: { id } });
    if (!pengurus) {
      return NextResponse.json(
        { error: "Pengurus tidak ditemukan." },
        { status: 404 },
      );
    }
    return NextResponse.json(pengurus);
  } catch (err) {
    console.error("[GET /api/pengurus/:id]", err);
    return NextResponse.json(
      { error: "Gagal mengambil pengurus." },
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
      nama?: string;
      jabatan?: string;
      kelas?: string;
      foto?: string | null;
      urutan?: number;
    };

    const nama = body.nama?.trim();
    const jabatan = body.jabatan?.trim();
    const kelas = body.kelas?.trim();

    if (!nama || !jabatan || !kelas) {
      return NextResponse.json(
        { error: "Nama, jabatan, dan kelas wajib diisi." },
        { status: 400 },
      );
    }

    const urutan = Number.isFinite(body.urutan) ? Number(body.urutan) : 0;
    const foto = body.foto?.trim() || null;

    const current = await prisma.pengurus.findUnique({
      where: { id },
      select: { foto: true },
    });

    const pengurus = await prisma.pengurus.update({
      where: { id },
      data: { nama, jabatan, kelas, foto, urutan },
    });

    if (current?.foto && current.foto !== pengurus.foto) {
      await deleteFromBucketByUrl(current.foto);
    }

    return NextResponse.json(pengurus);
  } catch (err) {
    console.error("[PUT /api/pengurus/:id]", err);
    return NextResponse.json(
      { error: "Gagal memperbarui pengurus." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const deleted = await prisma.pengurus.delete({
      where: { id },
      select: { foto: true },
    });
    await deleteFromBucketByUrl(deleted.foto);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/pengurus/:id]", err);
    return NextResponse.json(
      { error: "Gagal menghapus pengurus." },
      { status: 500 },
    );
  }
}
