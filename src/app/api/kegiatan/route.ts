import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  try {
    const kegiatan = await prisma.kegiatan.findMany({
      orderBy: { tanggal: "desc" },
    });
    return NextResponse.json(kegiatan);
  } catch (err) {
    console.error("[GET /api/kegiatan]", err);
    return NextResponse.json(
      { error: "Gagal mengambil data kegiatan." },
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

    const kegiatan = await prisma.kegiatan.create({
      data: { nama, deskripsi, tanggal, lokasi, foto, status },
    });
    return NextResponse.json(kegiatan, { status: 201 });
  } catch (err) {
    console.error("[POST /api/kegiatan]", err);
    return NextResponse.json(
      { error: "Gagal menambah kegiatan." },
      { status: 500 },
    );
  }
}
