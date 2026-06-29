const PENDAFTARAN_OPEN_AT = Date.UTC(2026, 6, 22, 17);

export function isPendaftaranOpen(now = Date.now()) {
  return now >= PENDAFTARAN_OPEN_AT;
}
