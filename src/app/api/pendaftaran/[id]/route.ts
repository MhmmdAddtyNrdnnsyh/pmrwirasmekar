import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/api-auth";
import {
  deletePendaftaran,
  getPendaftaran,
  isPendaftaranStatus,
  updatePendaftaranStatus,
} from "@/lib/pendaftaran-store";

type Ctx = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: Ctx) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const p = await getPendaftaran(id);
    if (!p) {
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan." },
        { status: 404 },
      );
    }
    return NextResponse.json(p);
  } catch (err) {
    console.error("[GET /api/pendaftaran/:id]", err);
    return NextResponse.json(
      { error: "Gagal mengambil pendaftaran." },
      { status: 500 },
    );
  }
}

// PATCH: ubah status (PENDING → DITERIMA / DITOLAK).
export async function PATCH(request: Request, { params }: Ctx) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const body = (await request.json().catch(() => null)) as {
      status?: unknown;
    } | null;

    if (!body || !isPendaftaranStatus(body.status)) {
      return NextResponse.json(
        { error: "Status harus PENDING, DITERIMA, atau DITOLAK." },
        { status: 400 },
      );
    }

    const p = await updatePendaftaranStatus(id, body.status);
    if (!p) {
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json(p);
  } catch (err) {
    console.error("[PATCH /api/pendaftaran/:id]", err);
    return NextResponse.json(
      { error: "Gagal memperbarui pendaftaran." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const deleted = await deletePendaftaran(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/pendaftaran/:id]", err);
    return NextResponse.json(
      { error: "Gagal menghapus pendaftaran." },
      { status: 500 },
    );
  }
}
