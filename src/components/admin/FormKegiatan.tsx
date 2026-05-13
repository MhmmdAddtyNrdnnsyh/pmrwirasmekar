"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import ImageUploader from "@/components/admin/ImageUploader";

type Mode = { kind: "create" } | { kind: "edit"; id: string };

type Initial = {
  nama?: string;
  deskripsi?: string;
  tanggal?: string; // ISO
  lokasi?: string;
  foto?: string | null;
  status?: "AKAN_DATANG" | "SELESAI";
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

export default function FormKegiatan({ mode, initial }: Props) {
  const router = useRouter();

  const [nama, setNama] = useState(initial?.nama ?? "");
  const [deskripsi, setDeskripsi] = useState(initial?.deskripsi ?? "");
  const [tanggal, setTanggal] = useState(toDateInputValue(initial?.tanggal));
  const [lokasi, setLokasi] = useState(initial?.lokasi ?? "");
  const [foto, setFoto] = useState<string | null>(initial?.foto ?? null);
  const [status, setStatus] = useState<"AKAN_DATANG" | "SELESAI">(
    initial?.status ?? "AKAN_DATANG",
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode.kind === "edit";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!nama.trim() || !deskripsi.trim() || !lokasi.trim()) {
      setError("Nama, deskripsi, dan lokasi wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = isEdit
        ? `/api/kegiatan/${mode.id}`
        : "/api/kegiatan";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: nama.trim(),
          deskripsi: deskripsi.trim(),
          tanggal: new Date(`${tanggal}T00:00:00`).toISOString(),
          lokasi: lokasi.trim(),
          foto: foto ?? null,
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

      router.push("/admin/kegiatan");
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
          <label htmlFor="nama" className={labelClass}>
            Nama kegiatan
          </label>
          <input
            id="nama"
            name="nama"
            type="text"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Bakti Sosial Desa Mitra"
            className={inputClass}
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="tanggal" className={labelClass}>
              Tanggal pelaksanaan
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
                setStatus(
                  e.target.value === "SELESAI" ? "SELESAI" : "AKAN_DATANG",
                )
              }
              className={inputClass}
              disabled={isSubmitting}
            >
              <option value="AKAN_DATANG">Akan datang</option>
              <option value="SELESAI">Sudah terlaksana</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="lokasi" className={labelClass}>
            Lokasi
          </label>
          <input
            id="lokasi"
            name="lokasi"
            type="text"
            required
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
            placeholder="Aula Sekolah / GOR Remaja"
            className={inputClass}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <ImageUploader
            folder="kegiatan"
            value={foto}
            onChange={setFoto}
            label="Foto kegiatan"
            aspectHint="disarankan landscape"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="deskripsi" className={labelClass}>
            Deskripsi
          </label>
          <textarea
            id="deskripsi"
            name="deskripsi"
            required
            rows={8}
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Ringkasan kegiatan, apa yang dilakukan, siapa yang terlibat…"
            className={inputClass}
            disabled={isSubmitting}
          />
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
          onClick={() => router.push("/admin/kegiatan")}
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
            "Simpan kegiatan"
          )}
        </Button>
      </div>
    </form>
  );
}
