"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, Trash2, ImageIcon } from "lucide-react";

type Folder = "artikel" | "kegiatan" | "pengurus";

type Props = {
  folder: Folder;
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  aspectHint?: string;
  disabled?: boolean;
};

const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp,image/avif,image/heic,image/heif";

export const UPLOAD_TIMEOUT_MS = 60_000;

export function getUploadErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return "Upload melewati batas waktu 60 detik. Silakan coba lagi.";
  }

  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan saat upload.";
}

export default function ImageUploader({
  folder,
  value,
  onChange,
  label = "Gambar",
  aspectHint,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handlePick(file: File) {
    setError(null);
    setInfo(null);
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
      });

      const data: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        const message =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : `Upload gagal (HTTP ${res.status}).`;
        throw new Error(message);
      }

      if (
        data &&
        typeof data === "object" &&
        "url" in data &&
        typeof (data as { url: unknown }).url === "string"
      ) {
        const payload = data as {
          url: string;
          bytes?: number;
          originalBytes?: number;
        };
        onChange(payload.url);

        if (payload.bytes && payload.originalBytes) {
          const orig = (payload.originalBytes / 1024).toFixed(0);
          const compressed = (payload.bytes / 1024).toFixed(0);
          const saved = Math.max(
            0,
            Math.round(
              (1 - payload.bytes / payload.originalBytes) * 100,
            ),
          );
          setInfo(
            `Dikompres dari ${orig} KB → ${compressed} KB (hemat ${saved}%).`,
          );
        }
      } else {
        throw new Error("Response upload tidak valid.");
      }
    } catch (err) {
      setError(getUploadErrorMessage(err));
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    // Catatan: file lama tidak di-delete dari storage di sini.
    // Pembersihan dilakukan saat entitas (artikel/kegiatan) di-update atau dihapus
    // via API yang membandingkan URL lama vs baru.
    onChange(null);
    setError(null);
    setInfo(null);
  }

  const isDisabled = disabled || isUploading;

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-pmr-dark">{label}</label>
        {aspectHint ? (
          <span className="text-xs text-pmr-dark/60">{aspectHint}</span>
        ) : null}
      </div>

      <div className="mt-1.5 overflow-hidden rounded-2xl border border-dashed border-pmr-gray bg-pmr-gray/30">
        {value ? (
          <div className="relative">
            <div className="flex items-center justify-center bg-pmr-dark/5 p-3">
              {/* Pakai tag img biasa — URL eksternal (Supabase), skip next/image config. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Preview"
                className="max-h-64 w-auto rounded-md object-contain"
              />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-pmr-gray bg-pmr-white px-4 py-3">
              <p className="truncate text-xs text-pmr-dark/60">
                {value.split("/").pop()}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={isDisabled}
                  className="inline-flex items-center gap-1.5 rounded-md border border-pmr-gray bg-pmr-white px-3 py-1.5 text-xs font-medium text-pmr-dark/80 hover:border-pmr-red/30 hover:text-pmr-red disabled:opacity-50"
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden />
                  Ganti
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isDisabled}
                  className="inline-flex items-center gap-1.5 rounded-md border border-pmr-gray bg-pmr-white px-3 py-1.5 text-xs font-medium text-pmr-dark/80 hover:border-pmr-red/30 hover:bg-pmr-red/5 hover:text-pmr-red disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isDisabled}
            className="flex w-full flex-col items-center justify-center gap-2 px-6 py-10 text-center transition-colors hover:bg-pmr-gray/60 disabled:opacity-60"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-pmr-red" aria-hidden />
                <span className="text-sm font-medium text-pmr-dark">
                  Memproses gambar…
                </span>
                <span className="text-xs text-pmr-dark/60">
                  Kompres + upload. Jangan tutup halaman.
                </span>
              </>
            ) : (
              <>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pmr-red/10 text-pmr-red">
                  <ImageIcon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-sm font-medium text-pmr-dark">
                  Klik untuk pilih gambar
                </span>
                <span className="text-xs text-pmr-dark/60">
                  JPG, PNG, WebP, AVIF, HEIC (foto iPhone) — maks 5 MB. Akan
                  dikompres otomatis.
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handlePick(file);
        }}
      />

      {error ? (
        <p role="alert" className="mt-2 text-sm text-pmr-red-dark">
          {error}
        </p>
      ) : null}
      {info && !error ? (
        <p className="mt-2 text-xs text-pmr-dark/60">{info}</p>
      ) : null}
    </div>
  );
}
