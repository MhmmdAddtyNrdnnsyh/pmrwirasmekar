/**
 * Identitas & branding PMR terpusat.
 * Ganti nilai di sini saat data sekolah sudah final (lihat CLAUDE.md §6).
 */
export const site = {
  nama: "PMR SMEKAR",
  sekolah: "SMK Negeri 01 Dukuhturi",
  kota: "Tegal",
  tingkat: "Wira", // Wira / Madya / Mula
  tagline: "Siap Menolong, Siap Melayani",
  deskripsiSingkat:
    "Palang Merah Remaja SMK Negeri 01 Dukuhturi — wadah siswa belajar kemanusiaan, pertolongan pertama, dan kepemimpinan.",
  markas: "SMK Negeri 01 Dukuhturi, Tegal",
  tahunBerdiri: 2010,
  kontak: {
    alamat: "Jl. Raya Karang Anyar No.17, Pekauman Kulon, Kec. Dukuhturi, Kabupaten Tegal, Jawa Tengah 52192",
    email: "pmwwira.smkn1dukuhturi@gmail.com",
    telepon: "0895-3791-77221",
    instagram: "pmrsmekar",
    hariLatihan: "Sabtu, 08.00 – 10.00 WIB",
    pembina: "Ibu Siti.",
    // Koordinat markas untuk embed peta. Ganti nilai ini sesuai lokasi sebenarnya.
    peta: {
      lat: -6.2,
      lng: 106.816666,
    },
  },
} as const;

export const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang" },
  { href: "/artikel", label: "Artikel" },
  { href: "/kegiatan", label: "Kegiatan" },
  { href: "/kepengurusan", label: "Kepengurusan" },
] as const;
