import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

type Ctx = { params: Promise<{ id: string }> };

const VALID_STATUS = ["PENDING", "DITERIMA", "DITOLAK"] as const;
type PendaftaranStatus = (typeof VALID_STATUS)[number];

function isValidStatus(value: unknown): value is PendaftaranStatus {
  return (
    typeof value === "string" &&
    (VALID_STATUS as readonly string[]).includes(value)
  );
}

export async function GET(_request: Request, { params }: Ctx) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const p = await prisma.pendaftaran.findUnique({ where: { id } });
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

    if (!body || !isValidStatus(body.status)) {
      return NextResponse.json(
        { error: "Status harus PENDING, DITERIMA, atau DITOLAK." },
        { status: 400 },
      );
    }

    const p = await prisma.pendaftaran.update({
      where: { id },
      data: { status: body.status },
    });
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
    await prisma.pendaftaran.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/pendaftaran/:id]", err);
    return NextResponse.json(
      { error: "Gagal menghapus pendaftaran." },
      { status: 500 },
    );
  }
}
