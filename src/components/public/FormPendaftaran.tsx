"use client";

import { useRef, useState, type FormEvent } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success" }
  | { kind: "error"; message: string };

const labelClass = "text-sm font-medium text-pmr-dark";
const inputClass =
  "mt-1.5 w-full rounded-md border border-pmr-gray bg-pmr-white px-3 py-2 text-sm text-pmr-dark placeholder:text-pmr-dark/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pmr-red focus-visible:ring-offset-2";
const hintClass = "mt-1 text-xs text-pmr-dark/60";
const whatsappGroupUrl = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ?? "#";

export default function FormPendaftaran() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      nama: String(data.get("nama") ?? "").trim(),
      nis: String(data.get("nis") ?? "").trim(),
      kelas: String(data.get("kelas") ?? "").trim(),
      noHp: String(data.get("noHp") ?? "").trim(),
      alasan: String(data.get("alasan") ?? "").trim(),
    };

    if (
      !payload.nama ||
      !payload.nis ||
      !payload.kelas ||
      !payload.noHp ||
      !payload.alasan
    ) {
      setStatus({
        kind: "error",
        message: "Semua kolom wajib diisi.",
      });
      return;
    }

    setStatus({ kind: "loading" });

    try {
      const res = await fetch("/api/pendaftaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        const message =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : `Gagal mengirim (HTTP ${res.status}).`;
        throw new Error(message);
      }

      form.reset();
      setStatus({ kind: "success" });
      dialogRef.current?.showModal();
    } catch (err) {
      setStatus({
        kind: "error",
        message:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengirim pendaftaran.",
      });
    }
  }

  const isLoading = status.kind === "loading";

  return (
    <>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid gap-5 rounded-2xl border border-pmr-gray bg-pmr-white p-6 sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="nama" className={labelClass}>
              Nama lengkap
            </label>
            <input
              id="nama"
              name="nama"
              type="text"
              required
              autoComplete="name"
              placeholder="Dinda Putri Aulia"
              className={inputClass}
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="nis" className={labelClass}>
              NIS
            </label>
            <input
              id="nis"
              name="nis"
              type="text"
              inputMode="numeric"
              required
              placeholder="0011223344"
              className={inputClass}
              disabled={isLoading}
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
              placeholder="XII AK 2"
              className={inputClass}
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="noHp" className={labelClass}>
              Nomor HP / WhatsApp
            </label>
            <input
              id="noHp"
              name="noHp"
              type="tel"
              required
              autoComplete="tel"
              placeholder="08xxxxxxxxxx"
              className={inputClass}
              disabled={isLoading}
            />
            <p className={hintClass}>
              Pastikan nomor aktif agar bisa dihubungi panitia seleksi.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="alasan" className={labelClass}>
            Alasan bergabung
          </label>
          <textarea
            id="alasan"
            name="alasan"
            required
            rows={5}
            placeholder="Ceritakan motivasimu bergabung dengan PMR…"
            className={inputClass}
            disabled={isLoading}
          />
          <p className={hintClass}>
            Minimal 1 paragraf. Tulis jujur sesuai pengalaman dan harapanmu.
          </p>
        </div>

        {status.kind === "error" ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-pmr-red/30 bg-pmr-red/5 p-3 text-sm text-pmr-red-dark"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{status.message}</span>
          </div>
        ) : null}

        {status.kind === "success" ? (
          <div
            role="status"
            className="flex items-start gap-2 rounded-md border border-pmr-red/20 bg-pmr-gray p-3 text-sm text-pmr-dark"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-pmr-red" aria-hidden />
            <span>
              Pendaftaran terkirim. Masuk ke grup WhatsApp untuk info
              berikutnya.
            </span>
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-3">
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Mengirim…
              </>
            ) : (
              "Kirim pendaftaran"
            )}
          </Button>
        </div>
      </form>

      <dialog
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-pmr-gray bg-pmr-white p-6 shadow-xl backdrop:bg-pmr-dark/40 open:animate-in open:fade-in-0"
      >
        <div className="w-full max-w-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pmr-red/10 text-pmr-red">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-base font-semibold text-pmr-dark">
                Pendaftaran berhasil
              </h2>
              <p className="mt-1 text-sm text-pmr-dark/70">
                Silakan masuk ke grup WhatsApp untuk mendapatkan informasi
                lanjutan dari panitia.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-md border border-pmr-gray bg-pmr-white px-3 py-2 text-sm font-medium text-pmr-dark hover:bg-pmr-gray"
            >
              Tutup
            </button>
            <Button asChild>
              <a
                href={whatsappGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Masuk Grub
              </a>
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
