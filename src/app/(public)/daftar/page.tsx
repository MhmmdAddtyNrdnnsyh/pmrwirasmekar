import type { Metadata } from "next";
import { connection } from "next/server";
import {
  Mail,
  Phone,
  AtSign,
  MapPin,
  CalendarClock,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import FormPendaftaran from "@/components/public/FormPendaftaran";
import { isPendaftaranOpen } from "@/lib/pendaftaran-window";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Daftar & Kontak",
  description: `Formulir pendaftaran anggota baru ${site.nama} dan informasi kontak pembina serta markas.`,
};

const syarat = [
  "Siswa aktif di SMA Harapan Bangsa (kelas X, XI, atau XII).",
  "Sehat jasmani dan rohani, sanggup mengikuti pelatihan rutin.",
  "Mendapat izin dari orang tua / wali.",
  "Bersedia mengikuti pembinaan minimal selama 1 periode kepengurusan.",
];

type KontakItem = {
  Icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
};

const kontakItems: KontakItem[] = [
  {
    Icon: MapPin,
    label: "Alamat markas",
    value: site.kontak.alamat,
  },
  {
    Icon: Mail,
    label: "Email",
    value: site.kontak.email,
    href: `mailto:${site.kontak.email}`,
  },
  {
    Icon: Phone,
    label: "Telepon sekolah",
    value: site.kontak.telepon,
    href: `tel:${site.kontak.telepon.replace(/[^\d+]/g, "")}`,
  },
  {
    Icon: AtSign,
    label: "Instagram",
    value: `@${site.kontak.instagram}`,
    href: `https://instagram.com/${site.kontak.instagram}`,
  },
  {
    Icon: CalendarClock,
    label: "Hari latihan rutin",
    value: site.kontak.hariLatihan,
  },
  {
    Icon: UserRound,
    label: "Pembina",
    value: site.kontak.pembina,
  },
];

export default async function DaftarPage() {
  await connection();
  const pendaftaranOpen = isPendaftaranOpen();

  return (
    <>
      <section className="bg-pmr-gray/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-pmr-red">
            Daftar &amp; Kontak
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-pmr-dark md:text-5xl">
            Jadi relawan muda berikutnya di {site.nama}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-pmr-dark/70">
            {pendaftaranOpen
              ? "Isi formulir di bawah untuk mendaftar. Ada pertanyaan? Hubungi kami lewat kontak yang tertera."
              : "Pendaftaran anggota baru dibuka mulai 23 Juli 2026. Ada pertanyaan? Hubungi kami lewat kontak yang tertera."}
          </p>
        </div>
      </section>

      <section className="bg-pmr-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
          <aside className="lg:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-pmr-red">
              Informasi kontak
            </h2>
            <p className="mt-2 text-2xl font-bold tracking-tight text-pmr-dark">
              Hubungi kami kapan pun
            </p>
            <p className="mt-2 text-pmr-dark/70">
              Pertanyaan soal pendaftaran, latihan, atau kerja sama kegiatan
              dapat dialamatkan ke kontak berikut.
            </p>

            <ul className="mt-6 space-y-3">
              {kontakItems.map(({ Icon, label, value, href }) => (
                <li
                  key={label}
                  className="flex items-start gap-3 rounded-2xl border border-pmr-gray bg-pmr-gray/40 p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pmr-red/10 text-pmr-red">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-pmr-dark/60">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="mt-0.5 font-medium text-pmr-dark hover:text-pmr-red"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="mt-0.5 font-medium text-pmr-dark">
                        {value}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-pmr-gray bg-pmr-white p-5">
              <h3 className="text-sm font-semibold text-pmr-dark">
                Syarat pendaftaran
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-pmr-dark/75">
                {syarat.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span
                      aria-hidden
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pmr-red"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-pmr-red">
              Formulir Pendaftaran
            </h2>
            <p className="mt-2 text-2xl font-bold tracking-tight text-pmr-dark">
              Isi data berikut dengan benar
            </p>
            <p className="mt-2 text-pmr-dark/70">
              {pendaftaranOpen
                ? "Semua kolom wajib diisi. Panitia akan menghubungi calon anggota melalui nomor HP yang kamu cantumkan."
                : "Formulir akan tersedia saat pendaftaran dibuka."}
            </p>

            <div className="mt-6">
              {pendaftaranOpen ? (
                <FormPendaftaran />
              ) : (
                <div className="rounded-2xl border border-pmr-gray bg-pmr-gray/40 p-6 text-pmr-dark/75 sm:p-8">
                  Pendaftaran anggota baru belum dibuka. Nantikan pendaftarannya!
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
