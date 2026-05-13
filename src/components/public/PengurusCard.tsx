import type { IPengurus } from "@/types";

type Props = {
  pengurus: Pick<IPengurus, "nama" | "jabatan" | "kelas" | "foto">;
};

function initial(nama: string): string {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase() ?? "")
    .join("");
}

export default function PengurusCard({ pengurus }: Props) {
  return (
    <article className="flex flex-col items-center rounded-2xl border border-pmr-gray bg-pmr-white p-6 text-center">
      {pengurus.foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={pengurus.foto}
          alt={pengurus.nama}
          className="h-20 w-20 rounded-full object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="flex h-20 w-20 items-center justify-center rounded-full bg-pmr-red/10 text-xl font-semibold text-pmr-red"
        >
          {initial(pengurus.nama)}
        </div>
      )}
      <h3 className="mt-4 text-base font-semibold text-pmr-dark">
        {pengurus.nama}
      </h3>
      <p className="mt-1 text-sm font-medium text-pmr-red">
        {pengurus.jabatan}
      </p>
      <p className="mt-0.5 text-xs text-pmr-dark/60">{pengurus.kelas}</p>
    </article>
  );
}
