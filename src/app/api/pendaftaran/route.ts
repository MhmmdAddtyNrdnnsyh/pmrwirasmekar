import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

// GET: admin-only (untuk halaman /admin/pendaftaran)
export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const pendaftaran = await prisma.pendaftaran.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(pendaftaran);
  } catch (err) {
    console.error("[GET /api/pendaftaran]", err);
    return NextResponse.json(
      { error: "Gagal mengambil data pendaftaran." },
      { status: 500 },
    );
  }
}

// POST: PUBLIC — dipakai oleh form di halaman /daftar.
// Input validasi ketat karena bisa dipanggil siapa saja.
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      nama?: unknown;
      nis?: unknown;
      kelas?: unknown;
      noHp?: unknown;
      alasan?: unknown;
    } | null;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request tidak valid." },
        { status: 400 },
      );
    }

    const nama = typeof body.nama === "string" ? body.nama.trim() : "";
    const nis = typeof body.nis === "string" ? body.nis.trim() : "";
    const kelas = typeof body.kelas === "string" ? body.kelas.trim() : "";
    const noHp = typeof body.noHp === "string" ? body.noHp.trim() : "";
    const alasan = typeof body.alasan === "string" ? body.alasan.trim() : "";

    if (!nama || !nis || !kelas || !noHp || !alasan) {
      return NextResponse.json(
        { error: "Semua kolom wajib diisi." },
        { status: 400 },
      );
    }

    if (nama.length > 200 || nis.length > 50 || kelas.length > 50) {
      return NextResponse.json(
        { error: "Input terlalu panjang." },
        { status: 400 },
      );
    }

    if (alasan.length > 2000) {
      return NextResponse.json(
        { error: "Alasan maksimal 2000 karakter." },
        { status: 400 },
      );
    }

    // Sanitasi ringan no HP — angka, +, dan spasi saja
    const noHpSafe = noHp.replace(/[^\d+\s-]/g, "");
    if (noHpSafe.length < 8 || noHpSafe.length > 20) {
      return NextResponse.json(
        { error: "Nomor HP tidak valid." },
        { status: 400 },
      );
    }

    await prisma.pendaftaran.create({
      data: {
        nama,
        nis,
        kelas,
        noHp: noHpSafe,
        alasan,
        // status default PENDING dari schema
      },
    });

    // Jangan return data lengkap ke public.
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/pendaftaran]", err);
    return NextResponse.json(
      { error: "Gagal mengirim pendaftaran. Coba lagi sebentar." },
      { status: 500 },
    );
  }
}
