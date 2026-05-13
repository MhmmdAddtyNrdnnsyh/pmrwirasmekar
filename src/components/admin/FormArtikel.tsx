"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import ImageUploader from "@/components/admin/ImageUploader";
import { slugify } from "@/lib/utils";

type Mode = { kind: "create" } | { kind: "edit"; id: string };

type Initial = {
  judul?: string;
  slug?: string;
  konten?: string;
  thumbnail?: string | null;
  tanggal?: string; // ISO string
  status?: "DRAFT" | "PUBLISHED";
};

type Props = {
  mode: Mode;
  initial?: Initial;
};

const labelClass = "text-sm font-medium text-pmr-dark";
const inputClass =
  "mt-1.5 w-full rounded-md border border-pmr-gray bg-pmr-white px-3 py-2 text-sm text-pmr-dark placeholder:text-pmr-dark/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pmr-red focus-visible:ring-offset-2";

function toDateInputValue(iso: string | undefined): string {
  if (!iso) return new Date().toISOString().slice(0, 10);
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export default function FormArtikel({ mode, initial }: Props) {
  const router = useRouter();

  const [judul, setJudul] = useState(initial?.judul ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [konten, setKonten] = useState(initial?.konten ?? "");
  const [thumbnail, setThumbnail] = useState<string | null>(
    initial?.thumbnail ?? null,
  );
  const [tanggal, setTanggal] = useState(toDateInputValue(initial?.tanggal));
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    initial?.status ?? "DRAFT",
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode.kind === "edit";
  const previewSlug = slug.trim() || slugify(judul);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!judul.trim() || !konten.trim()) {
      setError("Judul dan konten wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = isEdit
        ? `/api/artikel/${mode.id}`
        : "/api/artikel";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: judul.trim(),
          slug: previewSlug,
          konten: konten.trim(),
          thumbnail: thumbnail ?? null,
          tanggal: new Date(`${tanggal}T00:00:00`).toISOString(),
          status,
        }),
      });

      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        const message =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : `Gagal menyimpan (HTTP ${res.status}).`;
        throw new Error(message);
      }

      router.push("/admin/artikel");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-5">
      <div className="grid gap-5 rounded-2xl border border-pmr-gray bg-pmr-white p-6 sm:p-8">
        <div>
          <label htmlFor="judul" className={labelClass}>
            Judul
          </label>
          <input
            id="judul"
            name="judul"
            type="text"
            required
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder="Pelatihan Pertolongan Pertama…"
            className={inputClass}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="slug" className={labelClass}>
            Slug URL
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            onBlur={() => {
              if (!slugTouched && !slug.trim()) {
                setSlug(slugify(judul));
              }
            }}
            placeholder={slugify(judul) || "pelatihan-pertolongan-pertama"}
            className={inputClass}
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-pmr-dark/60">
            Akan muncul di URL: <code>/artikel/{previewSlug || "…"}</code>.
            Kosongkan untuk generate otomatis dari judul.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="tanggal" className={labelClass}>
              Tanggal publikasi
            </label>
            <input
              id="tanggal"
              name="tanggal"
              type="date"
              required
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className={inputClass}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value === "PUBLISHED" ? "PUBLISHED" : "DRAFT")
              }
              className={inputClass}
              disabled={isSubmitting}
            >
              <option value="DRAFT">Draft (tidak tampil di publik)</option>
              <option value="PUBLISHED">Published (tampil di publik)</option>
            </select>
          </div>
        </div>

        <div>
          <ImageUploader
            folder="artikel"
            value={thumbnail}
            onChange={setThumbnail}
            label="Thumbnail"
            aspectHint="disarankan rasio 16:10 atau 16:9"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="konten" className={labelClass}>
            Konten
          </label>
          <textarea
            id="konten"
            name="konten"
            required
            rows={14}
            value={konten}
            onChange={(e) => setKonten(e.target.value)}
            placeholder="Tulis isi artikel di sini…"
            className={`${inputClass} font-mono`}
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-pmr-dark/60">
            Plain text / markdown sederhana. Pisahkan paragraf dengan baris
            kosong.
          </p>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-pmr-red/30 bg-pmr-red/5 p-3 text-sm text-pmr-red-dark"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/artikel")}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Menyimpan…
            </>
          ) : isEdit ? (
            "Simpan perubahan"
          ) : (
            "Simpan artikel"
          )}
        </Button>
      </div>
    </form>
  );
}
