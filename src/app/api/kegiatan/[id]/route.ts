import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/api-auth";
import { deleteFromBucketByUrl } from "@/lib/storage";
import {
  deleteKegiatan,
  getKegiatan,
  updateKegiatan,
} from "@/lib/content-store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const kegiatan = await getKegiatan(id);
    if (!kegiatan) {
      return NextResponse.json(
        { error: "Kegiatan tidak ditemukan." },
        { status: 404 },
      );
    }
    return NextResponse.json(kegiatan);
  } catch (err) {
    console.error("[GET /api/kegiatan/:id]", err);
    return NextResponse.json(
      { error: "Gagal mengambil kegiatan." },
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
      deskripsi?: string;
      tanggal?: string;
      lokasi?: string;
      foto?: string | null;
      status?: "AKAN_DATANG" | "SELESAI";
    };

    const nama = body.nama?.trim();
    const deskripsi = body.deskripsi?.trim();
    const lokasi = body.lokasi?.trim();
    const tanggalStr = body.tanggal?.trim();

    if (!nama || !deskripsi || !lokasi || !tanggalStr) {
      return NextResponse.json(
        { error: "Nama, deskripsi, tanggal, dan lokasi wajib diisi." },
        { status: 400 },
      );
    }

    const tanggal = new Date(tanggalStr);
    if (Number.isNaN(tanggal.getTime())) {
      return NextResponse.json(
        { error: "Format tanggal tidak valid." },
        { status: 400 },
      );
    }

    const status = body.status === "SELESAI" ? "SELESAI" : "AKAN_DATANG";
    const foto = body.foto?.trim() || null;

    const current = await getKegiatan(id);
    const kegiatan = await updateKegiatan(id, {
      nama,
      deskripsi,
      tanggal: tanggal.toISOString(),
      lokasi,
      foto,
      status,
    });
    if (!kegiatan) {
      return NextResponse.json(
        { error: "Kegiatan tidak ditemukan." },
        { status: 404 },
      );
    }

    if (current?.foto && current.foto !== kegiatan.foto) {
      await deleteFromBucketByUrl(current.foto);
    }

    return NextResponse.json(kegiatan);
  } catch (err) {
    console.error("[PUT /api/kegiatan/:id]", err);
    return NextResponse.json(
      { error: "Gagal memperbarui kegiatan." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const deleted = await deleteKegiatan(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Kegiatan tidak ditemukan." },
        { status: 404 },
      );
    }
    await deleteFromBucketByUrl(deleted.foto);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/kegiatan/:id]", err);
    return NextResponse.json(
      { error: "Gagal menghapus kegiatan." },
      { status: 500 },
    );
  }
}
