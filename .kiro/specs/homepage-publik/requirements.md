# Requirements Document

## Introduction

Fitur ini membangun halaman beranda publik (`/`) untuk website PMR. Halaman ini adalah titik masuk utama bagi pengunjung umum dan calon anggota. Tujuannya adalah memperkenalkan organisasi PMR, menampilkan konten terbaru (artikel dan kegiatan) secara ringkas, dan mengarahkan pengunjung ke halaman pendaftaran serta halaman "Tentang".

Halaman dirender sebagai Server Component di Next.js App Router (path: `src/app/(public)/page.tsx`), mengambil data langsung melalui Prisma ke Supabase, dan mengikuti palet warna serta identitas PMR yang sudah ditentukan di `CLAUDE.md`. Navbar dan Footer berada di layout grup `(public)` sehingga berada di luar scope fitur ini.

## Glossary

- **Homepage**: Halaman Next.js yang dirender oleh file `src/app/(public)/page.tsx` dan dipetakan ke URL `/`.
- **HeroSection**: Komponen section paling atas pada Homepage yang menampilkan judul organisasi, tagline, deskripsi singkat, dan tombol CTA utama.
- **AboutPreviewSection**: Komponen section yang menampilkan deskripsi singkat organisasi PMR dengan tombol ke halaman `/tentang`.
- **ArtikelPreviewSection**: Komponen section yang menampilkan daftar ringkas artikel berstatus `PUBLISHED` terbaru.
- **KegiatanPreviewSection**: Komponen section yang menampilkan daftar ringkas kegiatan berstatus `AKAN_DATANG`.
- **CTASection**: Komponen section ajakan bergabung yang mengarahkan pengunjung ke halaman `/daftar`.
- **ArtikelCard**: Komponen kartu untuk satu entri artikel (dipakai di ArtikelPreviewSection).
- **KegiatanCard**: Komponen kartu untuk satu entri kegiatan (dipakai di KegiatanPreviewSection).
- **Prisma_Client**: Singleton Prisma Client yang diekspor dari `src/lib/prisma.ts`.
- **Palet_PMR**: Kumpulan warna brand PMR — `--pmr-red` (#DC2626), `--pmr-red-dark` (#991B1B), `--pmr-white` (#FFFFFF), `--pmr-gray` (#F4F4F5), `--pmr-dark` (#18181B).
- **Tagline_PMR**: Kalimat tagline "Siap Menolong, Siap Melayani".
- **Artikel_Published**: Entri model `Artikel` dengan field `status` bernilai `PUBLISHED`.
- **Kegiatan_AkanDatang**: Entri model `Kegiatan` dengan field `status` bernilai `AKAN_DATANG`.

## Requirements

### Requirement 1: Struktur dan Rendering Halaman

**User Story:** Sebagai developer, saya ingin Homepage berada di path dan bentuk yang konsisten dengan konvensi proyek, sehingga routing dan layout publik bekerja otomatis.

#### Acceptance Criteria

1. THE Homepage SHALL berupa file `src/app/(public)/page.tsx` yang mengekspor default sebuah React component bernama `HomePage`.
2. THE Homepage SHALL dirender sebagai React Server Component tanpa directive `"use client"` pada file `page.tsx`.
3. WHERE sebuah sub-komponen Homepage membutuhkan interaktivitas (state atau event handler), THE sub-komponen SHALL diletakkan di file terpisah dengan directive `"use client"` pada baris pertama file tersebut dan di-import oleh Homepage.
4. IF sebuah sub-komponen yang di-import oleh Homepage menggunakan React hook atau event handler, THEN THE sub-komponen SHALL memiliki directive `"use client"` pada baris pertama filenya.
5. THE Homepage SHALL mengekspor objek `metadata` bertipe `Metadata` dari `next` yang berisi `title` dan `description` yang mencerminkan identitas PMR.

### Requirement 2: Hero Section

**User Story:** Sebagai pengunjung, saya ingin langsung memahami identitas dan tagline PMR saat membuka halaman, sehingga saya tahu ini website organisasi apa.

#### Acceptance Criteria

1. THE HeroSection SHALL menampilkan nama organisasi, Tagline_PMR, deskripsi singkat, CTA utama, dan CTA sekunder sebagai satu kesatuan section yang dirender bersamaan dalam satu elemen container.
2. THE HeroSection SHALL menampilkan nama organisasi "PMR" beserta Tagline_PMR "Siap Menolong, Siap Melayani" sebagai elemen heading utama halaman.
3. THE HeroSection SHALL menampilkan paragraf deskripsi singkat organisasi dengan panjang tidak lebih dari 3 kalimat.
4. THE HeroSection SHALL menampilkan tombol CTA utama berlabel "Daftar Sekarang" yang mengarah ke path `/daftar`.
5. THE HeroSection SHALL menampilkan tombol CTA sekunder berlabel "Tentang Kami" yang mengarah ke path `/tentang`.
6. THE HeroSection SHALL menggunakan warna latar atau aksen dari Palet_PMR (`--pmr-red` atau `--pmr-red-dark`) sebagai warna identitas dominan.
7. THE HeroSection SHALL menggunakan satu elemen `<h1>` tunggal di seluruh Homepage.

### Requirement 3: About Preview Section

**User Story:** Sebagai pengunjung, saya ingin membaca ringkasan singkat tentang PMR langsung di homepage, sehingga saya dapat memutuskan apakah ingin tahu lebih lanjut.

#### Acceptance Criteria

1. THE AboutPreviewSection SHALL menampilkan judul section (misalnya "Tentang PMR") sebagai heading tingkat `<h2>`.
2. THE AboutPreviewSection SHALL menampilkan ringkasan deskripsi organisasi PMR dengan panjang antara 2 dan 5 kalimat.
3. WHERE ringkasan deskripsi organisasi memiliki konten non-kosong, THE AboutPreviewSection SHALL menampilkan tautan "Selengkapnya" yang mengarah ke path `/tentang`.
4. THE AboutPreviewSection SHALL menggunakan warna latar `--pmr-white` atau `--pmr-gray` agar kontras dengan HeroSection.

### Requirement 4: Artikel Preview Section

**User Story:** Sebagai pengunjung, saya ingin melihat artikel terbaru dari PMR di homepage, sehingga saya mengetahui aktivitas dan informasi organisasi yang sedang relevan.

#### Acceptance Criteria

1. THE ArtikelPreviewSection SHALL menampilkan judul section "Artikel Terbaru" sebagai heading tingkat `<h2>`.
2. THE ArtikelPreviewSection SHALL mengambil data melalui Prisma_Client dengan filter `status = PUBLISHED` dan pengurutan `tanggal` menurun.
3. THE ArtikelPreviewSection SHALL menampilkan maksimal 3 Artikel_Published terbaru dalam bentuk ArtikelCard.
4. THE ArtikelCard SHALL menampilkan `judul`, `tanggal` dalam format Indonesia (misalnya "12 Mei 2025"), dan `thumbnail` bila tersedia.
5. THE ArtikelCard SHALL menjadi tautan yang mengarah ke path `/artikel/{slug}` menggunakan komponen `Link` dari `next/link`.
6. WHERE field `thumbnail` pada satu Artikel_Published bernilai null, THE ArtikelCard SHALL menampilkan placeholder visual (misalnya elemen berwarna `--pmr-gray`) alih-alih elemen gambar kosong.
7. THE ArtikelPreviewSection SHALL menampilkan tautan "Lihat Semua Artikel" yang mengarah ke path `/artikel`.
8. IF tidak ada Artikel_Published ketika Homepage dirender, THEN THE ArtikelPreviewSection SHALL menampilkan pesan "Belum ada artikel" alih-alih daftar kartu.
9. IF query Prisma_Client pada ArtikelPreviewSection melempar error, THEN THE ArtikelPreviewSection SHALL menampilkan pesan "Belum ada artikel" dan melanjutkan rendering section lain tanpa membuat halaman gagal dirender.
10. THE ArtikelPreviewSection SHALL tidak menampilkan data Artikel yang di-cache dari query sebelumnya ketika query saat ini gagal atau tidak menghasilkan data.

### Requirement 5: Kegiatan Preview Section

**User Story:** Sebagai pengunjung, saya ingin melihat kegiatan PMR yang akan datang di homepage, sehingga saya dapat ikut berpartisipasi atau menjadwalkan diri.

#### Acceptance Criteria

1. THE KegiatanPreviewSection SHALL menampilkan judul section "Kegiatan Mendatang" sebagai heading tingkat `<h2>`.
2. THE KegiatanPreviewSection SHALL mengambil data melalui Prisma_Client dengan filter `status = AKAN_DATANG` dan pengurutan `tanggal` menaik.
3. THE KegiatanPreviewSection SHALL menampilkan maksimal 3 Kegiatan_AkanDatang dalam bentuk KegiatanCard.
4. THE KegiatanCard SHALL menampilkan `nama`, `tanggal` dalam format Indonesia (misalnya "12 Mei 2025"), `lokasi`, dan `foto` bila tersedia.
5. THE KegiatanCard SHALL menjadi tautan yang mengarah ke path `/kegiatan/{id}` menggunakan komponen `Link` dari `next/link`.
6. WHERE field `foto` pada satu Kegiatan_AkanDatang bernilai null, THE KegiatanCard SHALL menampilkan placeholder visual alih-alih elemen gambar kosong.
7. THE KegiatanPreviewSection SHALL menampilkan tautan "Lihat Semua Kegiatan" yang mengarah ke path `/kegiatan`.
8. IF tidak ada Kegiatan_AkanDatang ketika Homepage dirender, THEN THE KegiatanPreviewSection SHALL menampilkan pesan "Belum ada kegiatan mendatang" alih-alih daftar kartu.
9. IF query Prisma_Client pada KegiatanPreviewSection melempar error, THEN THE KegiatanPreviewSection SHALL menampilkan pesan "Belum ada kegiatan mendatang" dan melanjutkan rendering section lain tanpa membuat halaman gagal dirender.

### Requirement 6: CTA Pendaftaran

**User Story:** Sebagai pengunjung yang tertarik bergabung, saya ingin akses cepat ke form pendaftaran dari homepage, sehingga saya tidak perlu mencari menunya di navigasi.

#### Acceptance Criteria

1. THE CTASection SHALL menampilkan heading ajakan bergabung sebagai elemen `<h2>`.
2. THE CTASection SHALL menampilkan paragraf singkat yang menjelaskan manfaat bergabung dengan PMR.
3. THE CTASection SHALL menampilkan tombol berlabel "Daftar Sekarang" yang mengarah ke path `/daftar`.
4. THE CTASection SHALL menggunakan warna latar `--pmr-red` atau `--pmr-red-dark` sebagai warna identitas dominan agar kontras dengan section di atasnya.

### Requirement 7: Branding dan Styling

**User Story:** Sebagai pemilik brand, saya ingin Homepage tampil konsisten dengan identitas visual PMR, sehingga pengunjung mengenali organisasi melalui elemen visualnya.

#### Acceptance Criteria

1. THE Homepage SHALL menggunakan Tailwind CSS utility classes atau CSS variable Palet_PMR untuk seluruh warna yang ditampilkan.
2. THE Homepage SHALL tidak menggunakan nilai warna heksadesimal literal di dalam `className` atau atribut `style` kecuali nilai tersebut merujuk ke CSS variable yang didefinisikan di Palet_PMR.
3. THE Homepage SHALL menggunakan elemen `next/image` untuk setiap gambar raster yang ditampilkan (thumbnail artikel dan foto kegiatan).
4. THE Homepage SHALL menetapkan atribut `alt` yang deskriptif untuk setiap elemen `next/image` yang ditampilkan.

### Requirement 8: Responsif dan Aksesibilitas

**User Story:** Sebagai pengunjung di perangkat mobile atau dengan kebutuhan aksesibilitas, saya ingin Homepage tetap nyaman dibaca dan dinavigasi.

#### Acceptance Criteria

1. THE Homepage SHALL menampilkan ArtikelPreviewSection dan KegiatanPreviewSection sebagai grid 1 kolom pada viewport dengan lebar di bawah 768 piksel.
2. THE Homepage SHALL menampilkan ArtikelPreviewSection dan KegiatanPreviewSection sebagai grid 3 kolom pada viewport dengan lebar 1024 piksel ke atas.
3. THE Homepage SHALL menggunakan struktur heading yang hierarkis, dengan satu `<h1>` dan heading section menggunakan `<h2>`.
4. THE Homepage SHALL menampilkan seluruh tautan dan tombol dengan teks yang bermakna tanpa bergantung pada ikon saja (setiap tautan memiliki teks yang dapat dibaca screen reader).

### Requirement 9: Metadata dan SEO

**User Story:** Sebagai pemilik website, saya ingin Homepage ditemukan oleh mesin pencari dengan deskripsi yang relevan, sehingga organisasi lebih mudah dijangkau publik.

#### Acceptance Criteria

1. THE Homepage SHALL mengekspor objek `metadata.title` yang memuat nama organisasi PMR.
2. THE Homepage SHALL mengekspor objek `metadata.description` yang memuat Tagline_PMR atau deskripsi singkat organisasi.
3. THE Homepage SHALL menggunakan `lang="id"` melalui root layout atau dokumennya sendiri jika berbeda dari konfigurasi `src/app/layout.tsx` saat ini.

### Requirement 10: Akses Data

**User Story:** Sebagai developer, saya ingin pengambilan data di Homepage mengikuti konvensi proyek, sehingga konsisten dengan halaman publik lain dan tetap type-safe.

#### Acceptance Criteria

1. THE Homepage SHALL mengambil data Artikel dan Kegiatan melalui Prisma_Client yang diimpor dari `@/lib/prisma`.
2. THE Homepage SHALL tidak menggunakan Supabase JS Client (`@supabase/supabase-js`) untuk mengakses database.
3. THE Homepage SHALL tidak memanggil endpoint API internal (`/api/*`) melalui `fetch` untuk memuat data yang dirender di halaman ini.
4. WHERE fungsi async diperlukan untuk query Prisma_Client, THE fungsi komponen Homepage SHALL dideklarasikan dengan kata kunci `async`.
