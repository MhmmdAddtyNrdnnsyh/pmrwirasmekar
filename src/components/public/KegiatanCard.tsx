import Link from "next/link";
import type { IKegiatan } from "@/types";
import { formatDate } from "@/lib/utils";

type Props = {
  kegiatan: Pick<
    IKegiatan,
    "id" | "nama" | "deskripsi" | "tanggal" | "lokasi" | "status"
  >;
};

export default function KegiatanCard({ kegiatan }: Props) {
  const isUpcoming = kegiatan.status === "AKAN_DATANG";

  return (
    <article className="group relative flex flex-col gap-4 rounded-2xl border border-pmr-gray bg-pmr-white p-5 transition-shadow hover:shadow-md sm:flex-row">
      <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-pmr-red text-pmr-white">
        <span className="text-2xl font-bold leading-none">
          {new Date(kegiatan.tanggal).getDate()}
        </span>
        <span className="text-xs font-medium uppercase tracking-wide">
          {new Date(kegiatan.tanggal).toLocaleDateString("id-ID", {
            month: "short",
          })}
        </span>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span
            className={
              isUpcoming
                ? "rounded-full bg-pmr-red/10 px-2 py-0.5 text-xs font-semibold text-pmr-red"
                : "rounded-full bg-pmr-gray px-2 py-0.5 text-xs font-semibold text-pmr-dark/70"
            }
          >
            {isUpcoming ? "Akan Datang" : "Selesai"}
          </span>
          <time
            dateTime={kegiatan.tanggal}
            className="text-xs text-pmr-dark/60"
          >
            {formatDate(kegiatan.tanggal)}
          </time>
        </div>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-pmr-dark">
          <Link
            href={`/kegiatan/${kegiatan.id}`}
            className="after:absolute after:inset-0 hover:text-pmr-red"
          >
            {kegiatan.nama}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-pmr-dark/70">{kegiatan.lokasi}</p>
        <p className="mt-2 line-clamp-2 text-sm text-pmr-dark/70">
          {kegiatan.deskripsi}
        </p>
      </div>
    </article>
  );
}
