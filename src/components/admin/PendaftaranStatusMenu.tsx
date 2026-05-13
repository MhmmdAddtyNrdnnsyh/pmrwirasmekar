"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, RotateCcw, Loader2 } from "lucide-react";

type Status = "PENDING" | "DITERIMA" | "DITOLAK";

type Props = {
  id: string;
  current: Status;
};

const STYLE: Record<
  Status,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Menunggu",
    className: "bg-pmr-red/10 text-pmr-red",
  },
  DITERIMA: {
    label: "Diterima",
    className: "bg-emerald-50 text-emerald-700",
  },
  DITOLAK: {
    label: "Ditolak",
    className: "bg-pmr-gray text-pmr-dark/70",
  },
};

export default function PendaftaranStatusMenu({ id, current }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(current);
  const [pending, setPending] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function update(next: Status) {
    if (next === status || pending) return;
    setPending(next);
    setError(null);
    try {
      const res = await fetch(`/api/pendaftaran/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        const message =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : `Gagal (HTTP ${res.status}).`;
        throw new Error(message);
      }
      setStatus(next);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengubah status.",
      );
    } finally {
      setPending(null);
    }
  }

  const style = STYLE[status];

  return (
    <div className="flex flex-col items-end gap-1.5">
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.className}`}
      >
        {style.label}
      </span>

      <div className="flex items-center gap-1">
        <ActionButton
          active={status === "DITERIMA"}
          loading={pending === "DITERIMA"}
          onClick={() => update("DITERIMA")}
          title="Terima"
          variant="accept"
        >
          <Check className="h-3.5 w-3.5" aria-hidden />
        </ActionButton>
        <ActionButton
          active={status === "DITOLAK"}
          loading={pending === "DITOLAK"}
          onClick={() => update("DITOLAK")}
          title="Tolak"
          variant="reject"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </ActionButton>
        <ActionButton
          active={status === "PENDING"}
          loading={pending === "PENDING"}
          onClick={() => update("PENDING")}
          title="Reset ke menunggu"
          variant="neutral"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        </ActionButton>
      </div>

      {error ? (
        <p className="text-xs text-pmr-red-dark">{error}</p>
      ) : null}
    </div>
  );
}

function ActionButton({
  active,
  loading,
  onClick,
  title,
  variant,
  children,
}: {
  active: boolean;
  loading: boolean;
  onClick: () => void;
  title: string;
  variant: "accept" | "reject" | "neutral";
  children: React.ReactNode;
}) {
  const base =
    "inline-flex h-7 w-7 items-center justify-center rounded-md border text-xs transition-colors disabled:opacity-50";
  const variantClass =
    variant === "accept"
      ? active
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-pmr-gray bg-pmr-white text-pmr-dark/60 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
      : variant === "reject"
        ? active
          ? "border-pmr-red/30 bg-pmr-red/10 text-pmr-red"
          : "border-pmr-gray bg-pmr-white text-pmr-dark/60 hover:border-pmr-red/30 hover:bg-pmr-red/5 hover:text-pmr-red"
        : active
          ? "border-pmr-gray bg-pmr-gray text-pmr-dark"
          : "border-pmr-gray bg-pmr-white text-pmr-dark/60 hover:bg-pmr-gray hover:text-pmr-dark";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`${base} ${variantClass}`}
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : children}
    </button>
  );
}
