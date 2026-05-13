import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/api-auth";
import {
  ACCEPTED_MIME,
  MAX_UPLOAD_BYTES,
  generateFilename,
  processImage,
} from "@/lib/image";
import { uploadToBucket, type UploadFolder } from "@/lib/storage";

// Node runtime wajib — sharp & heic-convert butuh binary Node.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_FOLDERS: UploadFolder[] = ["artikel", "kegiatan", "pengurus"];

type AcceptedMime = (typeof ACCEPTED_MIME)[number];

function isAcceptedMime(value: string): value is AcceptedMime {
  return (ACCEPTED_MIME as readonly string[]).includes(value);
}

export async function POST(request: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const form = await request.formData();

    const folderRaw = form.get("folder");
    const folder =
      typeof folderRaw === "string" &&
      (ALLOWED_FOLDERS as readonly string[]).includes(folderRaw)
        ? (folderRaw as UploadFolder)
        : null;

    if (!folder) {
      return NextResponse.json(
        { error: "Folder harus salah satu: artikel, kegiatan, pengurus." },
        { status: 400 },
      );
    }

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "File tidak ditemukan di request." },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          error: `Ukuran file melebihi batas ${Math.round(
            MAX_UPLOAD_BYTES / 1024 / 1024,
          )} MB.`,
        },
        { status: 413 },
      );
    }

    if (!isAcceptedMime(file.type)) {
      return NextResponse.json(
        {
          error: `Format tidak didukung. Gunakan JPG, PNG, WebP, AVIF, atau HEIC.`,
        },
        { status: 415 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const input = Buffer.from(arrayBuffer);

    const processed = await processImage(input, file.type);
    const filename = generateFilename(processed.extension);

    const { publicUrl } = await uploadToBucket({
      folder,
      filename,
      contentType: processed.contentType,
      body: processed.buffer,
    });

    return NextResponse.json({
      url: publicUrl,
      width: processed.width,
      height: processed.height,
      bytes: processed.bytes,
      originalBytes: file.size,
    });
  } catch (err) {
    console.error("[POST /api/upload]", err);
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan saat upload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
