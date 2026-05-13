"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertCircle } from "lucide-react";

type Props = {
  endpoint: string;
  label?: string;
  confirmText?: string;
  onDeleted?: () => void;
};

export default function DeleteButton({
  endpoint,
  label = "Hapus",
  confirmText = "Data yang dihapus tidak bisa dikembalikan.",
  onDeleted,
}: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openConfirm() {
    setError(null);
    dialogRef.current?.showModal();
  }

  function closeConfirm() {
    dialogRef.current?.close();
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        const message =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : `Gagal menghapus (HTTP ${res.status}).`;
        throw new Error(message);
      }
      closeConfirm();
      if (onDeleted) onDeleted();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openConfirm}
        className="inline-flex items-center gap-1.5 rounded-md border border-pmr-gray bg-pmr-white px-3 py-1.5 text-xs font-medium text-pmr-dark/80 transition-colors hover:border-pmr-red/30 hover:bg-pmr-red/5 hover:text-pmr-red"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        {label}
      </button>

      <dialog
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-pmr-gray bg-pmr-white p-6 shadow-xl backdrop:bg-pmr-dark/40 open:animate-in open:fade-in-0"
        onCancel={(e) => {
          if (isDeleting) e.preventDefault();
        }}
      >
        <div className="w-full max-w-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pmr-red/10 text-pmr-red">
              <AlertCircle className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-base font-semibold text-pmr-dark">
                Yakin mau menghapus?
              </h2>
              <p className="mt-1 text-sm text-pmr-dark/70">{confirmText}</p>
            </div>
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-md border border-pmr-red/30 bg-pmr-red/5 p-2 text-sm text-pmr-red-dark"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeConfirm}
              disabled={isDeleting}
              className="rounded-md border border-pmr-gray bg-pmr-white px-3 py-2 text-sm font-medium text-pmr-dark hover:bg-pmr-gray disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-md bg-pmr-red px-3 py-2 text-sm font-semibold text-pmr-white hover:bg-pmr-red-dark disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Menghapus…
                </>
              ) : (
                "Hapus"
              )}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
