import type { Metadata } from "next";
import Link from "next/link";
import {
  HeartHandshake,
  Stethoscope,
  Users,
  Award,
  Compass,
  ShieldCheck,
  Globe2,
  Scale,
  HandHeart,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tentang",
  description: `Kenali ${site.nama} — sejarah, visi misi, Tri Bakti PMR, dan tujuh prinsip dasar Palang Merah Internasional.`,
};

const triBakti = [
  {
    nomor: "01",
    judul: "Meningkatkan Keterampilan Hidup Sehat",
    deskripsi:
      "Belajar menjaga kesehatan diri sendiri, keluarga, dan lingkungan lewat pelatihan rutin dan kampanye kesehatan sekolah.",
    Icon: Stethoscope,
  },
  {
    nomor: "02",
    judul: "Berkarya dan Berbakti di Masyarakat",
    deskripsi:
      "Terlibat aktif dalam aksi sosial, donor darah, tanggap bencana, dan bakti sosial di lingkungan sekolah maupun masyarakat.",
    Icon: HeartHandshake,
  },
  {
    nomor: "03",
    judul: "Mempererat Persahabatan Nasional & Internasional",
    deskripsi:
      "Menjalin silaturahmi lintas PMR sekolah, unit PMI, dan gerakan kepalangmerahan di tingkat daerah hingga global.",
    Icon: Globe2,
  },
] as const;

const prinsipDasar = [
  {
    judul: "Kemanusiaan",
    deskripsi:
      "Mencegah dan meringankan penderitaan sesama manusia tanpa membeda-bedakan.",
    Icon: HandHeart,
  },
  {
    judul: "Kesamaan",
    deskripsi:
      "Memberikan bantuan berdasarkan tingkat kebutuhan, tanpa melihat kebangsaan, ras, atau golongan.",
    Icon: Scale,
  },
  {
    judul: "Kenetralan",
    deskripsi:
      "Tidak memihak dalam pertentangan politik, ras, agama, atau ideologi.",
    Icon: Compass,
  },
  {
    judul: "Kemandirian",
    deskripsi:
      "Bergerak mandiri dan mampu mempertahankan otonomi sesuai prinsip gerakan.",
    Icon: ShieldCheck,
  },
  {
    judul: "Kesukarelaan",
    deskripsi:
      "Memberi bantuan atas dasar sukarela, bukan demi keuntungan apa pun.",
    Icon: UserCheck,
  },
  {
    judul: "Kesatuan",
    deskripsi:
      "Hanya ada satu perhimpunan Palang Merah di tiap negara, terbuka bagi semua.",
    Icon: Users,
  },
  {
    judul: "Kesemestaan",
    deskripsi:
      "Gerakan bersifat semesta, setiap perhimpunan memiliki hak dan tanggung jawab yang sama.",
    Icon: Globe2,
  },
] as const;

const fakta = [
  { label: "Tahun berdiri", value: site.tahunBerdiri.toString() },
  { label: "Tingkat", value: site.tingkat },
  { label: "Markas", value: site.kota },
] as const;

export default function TentangPage() {
  return (
    <>
      <section className="bg-pmr-gray/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-pmr-red">
            Tentang Kami
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-pmr-dark md:text-5xl">
            Mengenal {site.nama}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-pmr-dark/70">
            Palang Merah Remaja (PMR) adalah wadah pembinaan anggota remaja di
            bawah Palang Merah Indonesia. Di {site.sekolah}, kami membina siswa
            menjadi relawan muda yang tanggap, peduli, dan siap melayani sesama.
          </p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            {fakta.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-pmr-gray bg-pmr-white p-5"
              >
                <dt className="text-xs font-medium uppercase tracking-wide text-pmr-dark/60">
                  {item.label}
                </dt>
                <dd className="mt-2 text-2xl font-semibold text-pmr-dark">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-pmr-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-pmr-red">
              Sejarah Singkat
            </h2>
            <p className="mt-3 text-2xl font-bold tracking-tight text-pmr-dark">
              Bagian dari gerakan kepalangmerahan sejak {site.tahunBerdiri}
            </p>
            <div className="mt-4 space-y-4 text-pmr-dark/75">
              <p>
                {site.nama} dibentuk sebagai unit PMR tingkat {site.tingkat} di{" "}
                {site.sekolah}. Kami menjadi perpanjangan tangan Palang Merah
                Indonesia (PMI) di lingkungan sekolah, mengajak siswa belajar
                kemanusiaan lewat kegiatan nyata.
              </p>
              <p>
                Selaras dengan gerakan kepalangmerahan internasional yang
                didirikan Henry Dunant pada 1863, PMR menumbuhkan kepedulian,
                keterampilan pertolongan pertama, dan semangat sukarela pada
                generasi muda.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <article className="rounded-2xl border border-pmr-gray bg-pmr-gray/50 p-6">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-pmr-red" aria-hidden />
                <h3 className="text-lg font-semibold text-pmr-dark">Visi</h3>
              </div>
              <p className="mt-3 text-pmr-dark/75">
                Menjadi wadah pembinaan remaja yang unggul, berkarakter, dan
                siap menolong sesama di lingkungan {site.sekolah} dan
                masyarakat.
              </p>
            </article>
            <article className="rounded-2xl border border-pmr-gray bg-pmr-gray/50 p-6">
              <div className="flex items-center gap-3">
                <Compass className="h-5 w-5 text-pmr-red" aria-hidden />
                <h3 className="text-lg font-semibold text-pmr-dark">Misi</h3>
              </div>
              <ul className="mt-3 space-y-2 text-pmr-dark/75">
                <li className="flex gap-2">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pmr-red" />
                  Meningkatkan keterampilan pertolongan pertama dan hidup sehat.
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pmr-red" />
                  Menumbuhkan jiwa sukarela dan kepemimpinan anggota.
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pmr-red" />
                  Berkontribusi aktif pada kegiatan kemanusiaan di sekolah
                  maupun masyarakat.
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-pmr-gray/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-pmr-red">
              Tri Bakti PMR
            </h2>
            <p className="mt-3 text-3xl font-bold tracking-tight text-pmr-dark">
              Tiga landasan pengabdian setiap anggota PMR
            </p>
            <p className="mt-3 text-pmr-dark/70">
              Tri Bakti PMR menjadi pedoman kegiatan dan pembinaan anggota di
              setiap tingkat — Mula, Madya, dan Wira.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {triBakti.map(({ nomor, judul, deskripsi, Icon }) => (
              <article
                key={nomor}
                className="flex flex-col rounded-2xl border border-pmr-gray bg-pmr-white p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pmr-red text-pmr-white">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="text-sm font-semibold text-pmr-red/70">
                    {nomor}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-pmr-dark">
                  {judul}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-pmr-dark/70">
                  {deskripsi}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-pmr-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-pmr-red">
              Prinsip Dasar
            </h2>
            <p className="mt-3 text-3xl font-bold tracking-tight text-pmr-dark">
              Tujuh prinsip dasar Gerakan Palang Merah
            </p>
            <p className="mt-3 text-pmr-dark/70">
              Setiap anggota PMR memegang teguh tujuh prinsip dasar yang
              diadopsi oleh seluruh Perhimpunan Nasional Palang Merah dan Bulan
              Sabit Merah di dunia.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prinsipDasar.map(({ judul, deskripsi, Icon }, index) => (
              <li
                key={judul}
                className="flex gap-4 rounded-2xl border border-pmr-gray bg-pmr-gray/40 p-5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pmr-red/10 text-pmr-red">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-semibold text-pmr-red">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-0.5 font-semibold text-pmr-dark">
                    {judul}
                  </h3>
                  <p className="mt-1 text-sm text-pmr-dark/70">{deskripsi}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-pmr-red">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <h2 className="text-2xl font-bold text-pmr-white md:text-3xl">
              Mau ikut berkontribusi bersama kami?
            </h2>
            <p className="mt-2 max-w-xl text-pmr-white/80">
              Ikuti kegiatan kami atau daftarkan dirimu jadi anggota PMR
              berikutnya.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="outline" className="border-pmr-white bg-transparent text-pmr-white hover:bg-pmr-white hover:text-pmr-red" asChild>
              <Link href="/kegiatan">Lihat kegiatan</Link>
            </Button>
            <Button size="lg" className="bg-pmr-white text-pmr-red hover:bg-pmr-gray" asChild>
              <Link href="/daftar">Daftar sekarang</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
