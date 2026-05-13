import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  try {
    const pengurus = await prisma.pengurus.findMany({
      orderBy: [{ urutan: "asc" }, { nama: "asc" }],
    });
    return NextResponse.json(pengurus);
  } catch (err) {
    console.error("[GET /api/pengurus]", err);
    return NextResponse.json(
      { error: "Gagal mengambil data pengurus." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
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

    const pengurus = await prisma.pengurus.create({
      data: { nama, jabatan, kelas, foto, urutan },
    });
    return NextResponse.json(pengurus, { status: 201 });
  } catch (err) {
    console.error("[POST /api/pengurus]", err);
    return NextResponse.json(
      { error: "Gagal menambah pengurus." },
      { status: 500 },
    );
  }
}
