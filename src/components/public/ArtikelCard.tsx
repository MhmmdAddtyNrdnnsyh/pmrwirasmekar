import Link from "next/link";
import type { IArtikel } from "@/types";
import { formatDate } from "@/lib/utils";

type Props = {
  artikel: Pick<IArtikel, "judul" | "slug" | "tanggal" | "thumbnail"> & {
    ringkasan?: string;
  };
};

export default function ArtikelCard({ artikel }: Props) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-pmr-gray bg-pmr-white transition-shadow hover:shadow-md">
      {artikel.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={artikel.thumbnail}
          alt=""
          className="aspect-16/10 w-full object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="relative aspect-16/10 w-full overflow-hidden bg-linear-to-br from-pmr-red/10 to-pmr-red/30"
        >
          <span className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-pmr-red/40">
            +
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <time
          dateTime={artikel.tanggal}
          className="text-xs font-medium uppercase tracking-wide text-pmr-red"
        >
          {formatDate(artikel.tanggal)}
        </time>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-pmr-dark">
          <Link
            href={`/artikel/${artikel.slug}`}
            className="after:absolute after:inset-0 hover:text-pmr-red"
          >
            {artikel.judul}
          </Link>
        </h3>
        {artikel.ringkasan ? (
          <p className="mt-2 line-clamp-3 text-sm text-pmr-dark/70">
            {artikel.ringkasan}
          </p>
        ) : null}
        <span className="mt-4 text-sm font-semibold text-pmr-red group-hover:text-pmr-red-dark">
          Baca selengkapnya &rarr;
        </span>
      </div>
    </article>
  );
}
