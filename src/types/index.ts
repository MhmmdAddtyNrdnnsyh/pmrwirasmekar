export interface IArtikel {
  id: string;
  judul: string;
  slug: string;
  konten: string;
  thumbnail?: string;
  tanggal: string;
  status: "DRAFT" | "PUBLISHED";
}

export interface IKegiatan {
  id: string;
  nama: string;
  deskripsi: string;
  tanggal: string;
  lokasi: string;
  foto?: string;
  status: "AKAN_DATANG" | "SELESAI";
}

export interface IPengurus {
  id: string;
  nama: string;
  jabatan: string;
  kelas: string;
  foto?: string;
  urutan: number;
}

export interface IPendaftaran {
  id: string;
  nama: string;
  nis: string;
  kelas: string;
  noHp: string;
  alasan: string;
  status: "PENDING" | "DITERIMA" | "DITOLAK";
  createdAt: string;
}
