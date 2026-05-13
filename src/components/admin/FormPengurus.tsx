"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import ImageUploader from "@/components/admin/ImageUploader";

type Mode = { kind: "create" } | { kind: "edit"; id: string };

type Initial = {
  nama?: string;
  jabatan?: string;
  kelas?: string;
  foto?: string | null;
  urutan?: number;
};

type Props = {
  mode: Mode;
  initial?: Initial;
};

const labelClass = "text-sm font-medium text-pmr-dark";
const inputClass =
  "mt-1.5 w-full rounded-md border border-pmr-gray bg-pmr-white px-3 py-2 text-sm text-pmr-dark placeholder:text-pmr-dark/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pmr-red focus-visible:ring-offset-2";

export default function FormPengurus({ mode, initial }: Props) {
  const router = useRouter();

  const [nama, setNama] = useState(initial?.nama ?? "");
  const [jabatan, setJabatan] = useState(initial?.jabatan ?? "");
  const [kelas, setKelas] = useState(initial?.kelas ?? "");
  const [foto, setFoto] = useState<string | null>(initial?.foto ?? null);
  const [urutan, setUrutan] = useState<string>(
    typeof initial?.urutan === "number" ? String(initial.urutan) : "0",
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode.kind === "edit";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!nama.trim() || !jabatan.trim() || !kelas.trim()) {
      setError("Nama, jabatan, dan kelas wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = isEdit
        ? `/api/pengurus/${mode.id}`
        : "/api/pengurus";
      const method = isEdit ? "PUT" : "POST";

      const urutanNum = Number.parseInt(urutan, 10);

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: nama.trim(),
          jabatan: jabatan.trim(),
          kelas: kelas.trim(),
          foto: foto ?? null,
          urutan: Number.isFinite(urutanNum) ? urutanNum : 0,
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

      router.push("/admin/pengurus");
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
            Nama lengkap
          </label>
          <input
            id="nama"
            name="nama"
            type="text"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Budi Santoso"
            className={inputClass}
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="jabatan" className={labelClass}>
              Jabatan
            </label>
            <input
              id="jabatan"
              name="jabatan"
              type="text"
              required
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              placeholder="Ketua / Wakil / Koordinator Divisi…"
              className={inputClass}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="kelas" className={labelClass}>
              Kelas
            </label>
            <input
              id="kelas"
              name="kelas"
              type="text"
              required
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              placeholder="XI MIPA 2"
              className={inputClass}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor="urutan" className={labelClass}>
            Urutan tampilan
          </label>
          <input
            id="urutan"
            name="urutan"
            type="number"
            min={0}
            value={urutan}
            onChange={(e) => setUrutan(e.target.value)}
            className={inputClass}
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-pmr-dark/60">
            Urutan kecil tampil duluan. Konvensi: 1–9 untuk pimpinan inti,
            10+ untuk koordinator divisi.
          </p>
        </div>

        <div>
          <ImageUploader
            folder="pengurus"
            value={foto}
            onChange={setFoto}
            label="Foto profil"
            aspectHint="disarankan 1:1 (kotak)"
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
          onClick={() => router.push("/admin/pengurus")}
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
            "Simpan pengurus"
          )}
        </Button>
      </div>
    </form>
  );
}
