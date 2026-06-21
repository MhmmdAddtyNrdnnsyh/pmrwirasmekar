# Upload Timeout Design

## Tujuan

Mencegah UI upload gambar terus menampilkan status memproses ketika request
`/api/upload` tidak pernah selesai.

## Desain

- Tambahkan `signal: AbortSignal.timeout(60_000)` pada `fetch` upload di
  `ImageUploader`.
- Saat timeout menghasilkan `TimeoutError`, tampilkan pesan bahwa upload
  melewati batas waktu 60 detik dan pengguna perlu mencoba lagi.
- Error lain tetap memakai pesan yang sudah ada.
- Pemrosesan gambar, API route, dan Supabase Storage tidak diubah.

## Pengujian

Satu tes memastikan timeout request bernilai 60 detik dan `TimeoutError`
diterjemahkan menjadi pesan khusus. Lint dan pemeriksaan TypeScript harus lolos.
