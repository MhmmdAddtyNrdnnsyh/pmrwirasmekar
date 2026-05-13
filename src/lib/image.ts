import sharp from "sharp";
import heicConvert from "heic-convert";

/**
 * Konstanta upload gambar.
 */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_DIMENSION = 1920; // sisi terpanjang
export const OUTPUT_QUALITY = 80; // webp quality

export const ACCEPTED_MIME = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
] as const;

export type ProcessedImage = {
  buffer: Buffer;
  contentType: "image/webp";
  extension: "webp";
  width: number;
  height: number;
  bytes: number;
};

function isHeicMime(mime: string): boolean {
  return mime === "image/heic" || mime === "image/heif";
}

/**
 * Normalisasi + kompresi gambar:
 * 1. Kalau HEIC/HEIF (foto iPhone) → convert ke JPEG dulu
 * 2. Resize sisi terpanjang max 1920 px
 * 3. Encode ke WebP quality 80 (hemat ~40% dibanding JPEG setara)
 */
export async function processImage(
  input: Buffer,
  mimeType: string,
): Promise<ProcessedImage> {
  let working = input;

  if (isHeicMime(mimeType)) {
    // heic-convert expects an ArrayBufferLike. Konversi Buffer (Node) ke
    // ArrayBuffer murni supaya kompatibel dengan TS types yang ketat.
    const ab = input.buffer.slice(
      input.byteOffset,
      input.byteOffset + input.byteLength,
    ) as ArrayBuffer;
    const jpeg = await heicConvert({
      buffer: ab,
      format: "JPEG",
      quality: 0.9,
    });
    working = Buffer.from(jpeg);
  }

  const pipeline = sharp(working, { failOn: "none" })
    .rotate() // auto-orient berdasarkan EXIF
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: OUTPUT_QUALITY, effort: 4 });

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    contentType: "image/webp",
    extension: "webp",
    width: info.width,
    height: info.height,
    bytes: data.length,
  };
}

/**
 * Generate nama file unik dengan timestamp + random suffix.
 */
export function generateFilename(extension: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}.${extension}`;
}
