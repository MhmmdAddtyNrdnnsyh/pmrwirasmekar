# CLAUDE.md — Website PMR

Dokumen ini adalah panduan utama untuk Claude dalam membantu pengembangan website PMR (Palang Merah Remaja). Baca seluruh dokumen ini sebelum menulis kode apapun.

---

## 1. Gambaran Proyek

Website PMR adalah aplikasi Next.js yang mencakup dua area utama dalam **satu repository**:

| Area | Path | Audiens |
|---|---|---|
| Landing Page (publik) | `/` dst | Pengunjung umum, calon anggota |
| Admin Panel | `/admin` | Pengurus / pembina PMR |

**Tidak ada sistem member/login untuk pengunjung.** Seluruh pengelolaan konten dilakukan oleh admin melalui panel admin. Pengunjung hanya bisa membaca konten dan mengisi form pendaftaran.

Tujuan website:
- Memperkenalkan organisasi PMR kepada publik
- Menampilkan artikel, kegiatan, dan informasi kepengurusan
- Menyediakan form pendaftaran anggota baru
- Memberikan panel admin untuk mengelola seluruh konten

---

## 2. Tech Stack

```
Framework    : Next.js 14+ (App Router)
Styling      : Tailwind CSS
UI Library   : shadcn/ui (komponen primitif)
Auth         : NextAuth.js (hanya untuk admin, credentials provider)
Database     : Supabase (PostgreSQL)
ORM          : Prisma (terhubung ke Supabase)
Language     : TypeScript
Deploy       : Vercel (serverless, tanpa server sendiri)
```

### Aturan Tech Stack
- **Selalu gunakan App Router** (`app/` directory), bukan Pages Router.
- **Server Components by default.** Tambahkan `"use client"` hanya jika komponen butuh interaktivitas (hooks, event handler).
- **Tailwind CSS** untuk semua styling. Jangan tulis CSS manual kecuali untuk animasi kompleks.
- **shadcn/ui** untuk komponen primitif (Button, Dialog, Table, Form, dll). Jangan install library UI lain tanpa alasan kuat.
- **TypeScript strict mode aktif.** Tidak boleh ada `any` kecuali benar-benar tidak bisa dihindari.
- **Prisma sebagai ORM** — jangan query SQL mentah kecuali Prisma benar-benar tidak bisa.

---

## 3. Supabase sebagai Database

### Konsep
Supabase menyediakan database **PostgreSQL** yang di-host secara gratis. Project ini mengakses Supabase melalui **Prisma ORM** menggunakan connection string — bukan Supabase JS Client. Ini dipilih agar query tetap type-safe dan konsisten dengan pola Next.js App Router.

### Library
```bash
npm install prisma @prisma/client
npx prisma init
```

### Koneksi ke Supabase
Supabase menyediakan dua connection string, gunakan keduanya:

```env
# .env

# Untuk Prisma (koneksi langsung — dipakai saat migrate & generate)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Untuk production di Vercel (connection pooling via PgBouncer)
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

> Ambil kedua URL ini dari **Supabase Dashboard → Settings → Database → Connection String**.

### Konfigurasi `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Singleton Prisma Client
```ts
// lib/prisma.ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["query"] })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

---

## 4. Schema Database (Prisma)

```prisma
model Admin {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}

model Artikel {
  id        String        @id @default(cuid())
  judul     String
  slug      String        @unique
  konten    String
  thumbnail String?
  tanggal   DateTime      @default(now())
  status    StatusArtikel @default(DRAFT)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
}

enum StatusArtikel {
  DRAFT
  PUBLISHED
}

model Kegiatan {
  id        String         @id @default(cuid())
  nama      String
  deskripsi String
  tanggal   DateTime
  lokasi    String
  foto      String?
  status    StatusKegiatan @default(AKAN_DATANG)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
}

enum StatusKegiatan {
  AKAN_DATANG
  SELESAI
}

model Pengurus {
  id       String  @id @default(cuid())
  nama     String
  jabatan  String
  kelas    String
  foto     String?
  urutan   Int     @default(0)
}

model Pendaftaran {
  id        String            @id @default(cuid())
  nama      String
  nis       String
  kelas     String
  noHp      String
  alasan    String
  status    StatusPendaftaran @default(PENDING)
  createdAt DateTime          @default(now())
}

enum StatusPendaftaran {
  PENDING
  DITERIMA
  DITOLAK
}
```

### Perintah Prisma yang Sering Dipakai
```bash
# Setelah ubah schema — push ke Supabase
npx prisma db push

# Generate Prisma Client (setelah install atau ubah schema)
npx prisma generate

# Lihat isi database via GUI
npx prisma studio

# Jalankan seeder
npx ts-node --project tsconfig.json scripts/seed.ts
```

---

## 5. Struktur Folder

```
src/
├── app/
│   ├── (public)/                    # Route group: halaman publik
│   │   ├── layout.tsx               # Layout publik (Navbar + Footer)
│   │   ├── page.tsx                 # / — Homepage
│   │   ├── tentang/page.tsx         # /tentang
│   │   ├── artikel/
│   │   │   ├── page.tsx             # /artikel — list artikel
│   │   │   └── [slug]/page.tsx      # /artikel/[slug] — detail artikel
│   │   ├── kegiatan/
│   │   │   ├── page.tsx             # /kegiatan — list kegiatan
│   │   │   └── [id]/page.tsx        # /kegiatan/[id] — detail kegiatan
│   │   ├── kepengurusan/page.tsx    # /kepengurusan
│   │   └── daftar/page.tsx          # /daftar — form pendaftaran & kontak
│   ├── admin/                       # Admin panel (protected)
│   │   ├── layout.tsx               # Layout admin (Sidebar)
│   │   ├── login/page.tsx           # /admin/login
│   │   ├── page.tsx                 # /admin — dashboard ringkasan
│   │   ├── artikel/
│   │   │   ├── page.tsx
│   │   │   ├── tambah/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── kegiatan/
│   │   │   ├── page.tsx
│   │   │   ├── tambah/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── pengurus/
│   │   │   ├── page.tsx
│   │   │   ├── tambah/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   └── pendaftaran/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── artikel/route.ts         # GET list, POST tambah
│   │   ├── artikel/[id]/route.ts    # GET detail, PUT edit, DELETE hapus
│   │   ├── kegiatan/route.ts
│   │   ├── kegiatan/[id]/route.ts
│   │   ├── pengurus/route.ts
│   │   ├── pengurus/[id]/route.ts
│   │   └── pendaftaran/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── public/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── ArtikelCard.tsx
│   │   └── KegiatanCard.tsx
│   ├── admin/
│   │   ├── Sidebar.tsx
│   │   ├── DataTable.tsx
│   │   └── FormArtikel.tsx
│   └── ui/                          # shadcn/ui (auto-generated)
├── lib/
│   ├── prisma.ts                    # Prisma client singleton
│   ├── auth.ts                      # NextAuth config
│   └── utils.ts                     # cn(), formatDate(), slugify()
├── types/
│   └── index.ts                     # TypeScript interfaces
├── scripts/
│   └── seed.ts                      # Seeder akun admin
├── prisma/
│   └── schema.prisma
└── middleware.ts
```

---

## 6. Identitas & Branding PMR

### Warna Utama
```css
--pmr-red      : #DC2626   /* Merah PMR — warna identitas utama */
--pmr-red-dark : #991B1B   /* Hover / aksen gelap */
--pmr-white    : #FFFFFF
--pmr-gray     : #F4F4F5   /* Background section */
--pmr-dark     : #18181B   /* Text utama */
```

### Identitas Organisasi *(isi sesuai data sekolah)*
```
Nama Organisasi : PMR [Nama Sekolah]
Tingkat         : Wira / Madya / Mula
Markas          : [Nama Sekolah], [Kota]
Tagline         : "Siap Menolong, Siap Melayani"
```

> Setiap kali membuat konten teks (hero, about, dll), gunakan identitas di atas. Jangan isi dengan "Lorem ipsum" atau placeholder generik.

---

## 7. Autentikasi Admin

- **NextAuth.js v5 (Auth.js)** dengan `CredentialsProvider`.
- **Tidak ada fitur register.** Admin dibuat hanya melalui script seeder.
- Password disimpan sebagai **bcrypt hash** di tabel `Admin`.
- Session strategy: `jwt`.
- Middleware memproteksi semua route `/admin/*` kecuali `/admin/login`.

### Seeder Admin
```ts
// scripts/seed.ts
// Jalankan SEKALI: npm run db:seed
import bcrypt from "bcryptjs"
import { prisma } from "../src/lib/prisma"

async function main() {
  const existing = await prisma.admin.findFirst()
  if (existing) {
    console.log("⚠️  Admin sudah ada, seeder dibatalkan.")
    return
  }

  const username = process.env.SEED_ADMIN_USERNAME ?? "admin"
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin123"

  const hash = await bcrypt.hash(password, 10)
  await prisma.admin.create({
    data: { username, passwordHash: hash },
  })
  console.log(`✅ Admin "${username}" berhasil dibuat`)
}

main().finally(() => prisma.$disconnect())
```

### Middleware Proteksi Route (NextAuth v5)
```ts
// middleware.ts
export { auth as default } from "@/lib/auth"

export const config = {
  matcher: ["/admin/:path*"],
}
```

> File `src/lib/auth.ts` men-export `auth`, `handlers`, `signIn`, `signOut` dari
> `NextAuth(...)` dengan `CredentialsProvider` + callback `authorized` yang
> membolehkan `/admin/login` dan memaksa redirect pengguna tanpa session ke
> halaman login.

---

## 8. TypeScript Interfaces

Semua tipe didefinisikan di `types/index.ts`:

```ts
export interface IArtikel {
  id: string
  judul: string
  slug: string
  konten: string
  thumbnail?: string
  tanggal: string
  status: "DRAFT" | "PUBLISHED"
}

export interface IKegiatan {
  id: string
  nama: string
  deskripsi: string
  tanggal: string
  lokasi: string
  foto?: string
  status: "AKAN_DATANG" | "SELESAI"
}

export interface IPengurus {
  id: string
  nama: string
  jabatan: string
  kelas: string
  foto?: string
  urutan: number
}

export interface IPendaftaran {
  id: string
  nama: string
  nis: string
  kelas: string
  noHp: string
  alasan: string
  status: "PENDING" | "DITERIMA" | "DITOLAK"
  createdAt: string
}
```

---

## 9. Panduan Komponen dari 21st.dev

Workflow penggunaan komponen visual dari [21st.dev](https://21st.dev):

1. Cari komponen yang cocok di 21st.dev (Hero, Card, Navbar, dll).
2. Copy **prompt** yang tersedia di halaman komponen tersebut.
3. Paste prompt itu ke Claude.
4. **Claude akan generate ulang komponen** tersebut, disesuaikan dengan:
   - Warna dan branding PMR (merah `#DC2626`, putih)
   - Konten PMR yang relevan (bukan dummy content)
   - Tech stack project ini (Next.js App Router + Tailwind)
   - Path file sesuai struktur folder di atas

### Yang Claude lakukan saat menerima prompt dari 21st.dev:
- Ganti semua warna ke palet PMR
- Ganti teks placeholder dengan konten PMR yang realistis
- Pastikan Server Component jika tidak ada interaktivitas
- Tempatkan file di path yang benar sesuai struktur folder
- Export dengan nama PascalCase yang konsisten

---

## 10. Konvensi Kode

### Penamaan
- **Komponen:** PascalCase → `HeroSection.tsx`, `ArtikelCard.tsx`
- **Fungsi/variabel:** camelCase → `getArtikel`, `isLoading`
- **File non-komponen:** kebab-case → `auth-options.ts`
- **Interface:** PascalCase dengan prefix `I` → `IArtikel`, `IKegiatan`

### Server vs Client Component
```tsx
// ✅ Server Component — fetch langsung via Prisma
export default async function ArtikelPage() {
  const artikel = await prisma.artikel.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { tanggal: "desc" },
  })
  return <div>...</div>
}

// ✅ Client Component — hanya jika butuh useState / event handler
"use client"
export default function SearchBar() { ... }
```

### Pola API Route
```ts
// app/api/artikel/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const artikel = await prisma.artikel.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { tanggal: "desc" },
    })
    return NextResponse.json(artikel)
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 })
  }
}
```

---

## 11. Environment Variables

Wajib ada di `.env` (lokal) **dan** di **Vercel → Settings → Environment Variables** (production):

```env
# Supabase / Prisma
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL=https://domain-kamu.vercel.app
NEXTAUTH_SECRET=        # generate: openssl rand -base64 32
```

### Supabase Storage

- Bucket: **`pmr_wira_smekar_storage`** (public).
- Prefix folder: `artikel/`, `kegiatan/`, `pengurus/`.
- Upload via `POST /api/upload` (admin-only). File HEIC dari iPhone otomatis
  dikonversi ke JPEG, lalu semua gambar di-resize max 1920 px sisi terpanjang
  dan di-encode ke WebP quality 80 via `sharp` sebelum disimpan.
- Batas upload: 5 MB per file.
- Env var yang dipakai: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

---

## 12. Hal yang TIDAK Boleh Dilakukan Claude

- ❌ Jangan gunakan Pages Router (`pages/` directory)
- ❌ Jangan gunakan Supabase JS Client (`@supabase/supabase-js`) untuk akses **database** — akses DB hanya lewat Prisma.
  - ✅ Supabase JS Client **boleh** dipakai khusus untuk **Supabase Storage** (upload foto/thumbnail), karena Prisma tidak menangani object storage.
- ❌ Jangan buat halaman atau endpoint register untuk pengunjung
- ❌ Jangan install library UI selain shadcn/ui tanpa persetujuan
- ❌ Jangan hardcode warna di luar Tailwind class atau CSS variable PMR
- ❌ Jangan expose `passwordHash` di response API apapun
- ❌ Jangan pakai `any` di TypeScript tanpa komentar penjelasan
- ❌ Jangan hardcode credential / secret di dalam kode

---

## 13. Checklist Sebelum Setiap Commit

- [ ] Tidak ada error TypeScript
- [ ] Komponen yang tidak perlu interaktivitas sudah Server Component
- [ ] Warna konsisten menggunakan palet PMR
- [ ] Semua API route punya `try/catch` dan error response yang jelas
- [ ] `passwordHash` tidak ter-expose di response manapun
- [ ] Env variable tidak di-hardcode di dalam kode
- [ ] Setelah ubah schema, sudah jalankan `npx prisma db push` dan `npx prisma generate`

---

*Dokumen ini harus diupdate setiap kali ada perubahan besar pada arsitektur atau stack project.*