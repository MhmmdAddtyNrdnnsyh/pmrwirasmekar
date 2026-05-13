import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Konfigurasi Supabase Storage.
 *
 * Aturan dari CLAUDE.md §12: Supabase JS Client HANYA boleh dipakai untuk
 * Storage (upload foto/thumbnail), bukan untuk akses database.
 *
 * Client ini dibangun dengan `SUPABASE_SERVICE_ROLE_KEY` — jangan pernah
 * meng-import module ini dari Client Component atau Edge Runtime.
 */
export const BUCKET = "pmr_wira_smekar_storage" as const;

export type UploadFolder = "artikel" | "kegiatan" | "pengurus";

let cached: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi di .env untuk fitur upload.",
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/**
 * Upload buffer ke Supabase Storage dan kembalikan URL publik.
 */
export async function uploadToBucket(args: {
  folder: UploadFolder;
  filename: string;
  contentType: string;
  body: Buffer;
}): Promise<{ path: string; publicUrl: string }> {
  const supabase = getSupabaseAdmin();
  const path = `${args.folder}/${args.filename}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, args.body, {
      contentType: args.contentType,
      cacheControl: "31536000, immutable",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload gagal: ${error.message}`);
  }

  const { data: publicData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return { path, publicUrl: publicData.publicUrl };
}

/**
 * Hapus file dari Supabase Storage berdasarkan URL publik.
 * Kalau URL bukan milik bucket kita, operasi di-skip (aman).
 */
export async function deleteFromBucketByUrl(url: string | null): Promise<void> {
  if (!url) return;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return;

  // URL publik bentuk: {supabaseUrl}/storage/v1/object/public/{BUCKET}/{path}
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;

  const path = url.slice(idx + marker.length).split("?")[0];
  if (!path) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.error(`[storage] Gagal hapus ${path}:`, error.message);
  }
}
