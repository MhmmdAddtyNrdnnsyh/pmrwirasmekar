import "server-only";

import { randomUUID } from "node:crypto";

import {
  appendSheetRow,
  deleteSheetRow,
  getGoogleSheetConfig,
  readSheetRows,
  sheetCell,
  updateSheetRow,
  type SheetsConfig,
} from "@/lib/google-sheets";
import type { IArtikel, IKegiatan, IPengurus } from "@/types";

export type ArtikelStatus = IArtikel["status"];
export type KegiatanStatus = IKegiatan["status"];

export type ArtikelRecord = Omit<IArtikel, "thumbnail"> & {
  createdAt: string;
  updatedAt: string;
  thumbnail: string | null;
};

export type KegiatanRecord = Omit<IKegiatan, "foto"> & {
  createdAt: string;
  updatedAt: string;
  foto: string | null;
};

export type PengurusRecord = Omit<IPengurus, "foto"> & {
  createdAt: string;
  updatedAt: string;
  foto: string | null;
};

export type ArtikelInput = Pick<
  ArtikelRecord,
  "judul" | "slug" | "konten" | "thumbnail" | "tanggal" | "status"
>;

export type KegiatanInput = Pick<
  KegiatanRecord,
  "nama" | "deskripsi" | "tanggal" | "lokasi" | "foto" | "status"
>;

export type PengurusInput = Pick<
  PengurusRecord,
  "nama" | "jabatan" | "kelas" | "foto" | "urutan"
>;

const ARTIKEL_HEADER = [
  "id",
  "createdAt",
  "updatedAt",
  "judul",
  "slug",
  "konten",
  "thumbnail",
  "tanggal",
  "status",
] as const;

const KEGIATAN_HEADER = [
  "id",
  "createdAt",
  "updatedAt",
  "nama",
  "deskripsi",
  "tanggal",
  "lokasi",
  "foto",
  "status",
] as const;

const PENGURUS_HEADER = [
  "id",
  "createdAt",
  "updatedAt",
  "nama",
  "jabatan",
  "kelas",
  "foto",
  "urutan",
] as const;

const ARTIKEL_STATUS = ["DRAFT", "PUBLISHED"] as const;
const KEGIATAN_STATUS = ["AKAN_DATANG", "SELESAI"] as const;

type SheetRecord<T> = {
  rowNumber: number;
  record: T;
};

export function isArtikelStatus(value: unknown): value is ArtikelStatus {
  return (
    typeof value === "string" &&
    (ARTIKEL_STATUS as readonly string[]).includes(value)
  );
}

export function isKegiatanStatus(value: unknown): value is KegiatanStatus {
  return (
    typeof value === "string" &&
    (KEGIATAN_STATUS as readonly string[]).includes(value)
  );
}

export async function listArtikel(): Promise<ArtikelRecord[]> {
  const rows = await readArtikelRows();
  return rows
    .map((row) => row.record)
    .sort(
      (a, b) =>
        dateTimeValue(b.tanggal) - dateTimeValue(a.tanggal) ||
        dateTimeValue(b.createdAt) - dateTimeValue(a.createdAt),
    );
}

export async function getArtikel(id: string): Promise<ArtikelRecord | null> {
  const row = await findArtikelRow(id);
  return row?.record ?? null;
}

export async function getArtikelBySlug(
  slug: string,
): Promise<ArtikelRecord | null> {
  const rows = await readArtikelRows();
  return rows.find((row) => row.record.slug === slug)?.record ?? null;
}

export async function createArtikel(
  input: ArtikelInput,
): Promise<ArtikelRecord> {
  const config = getArtikelConfig();
  const now = new Date().toISOString();
  const artikel: ArtikelRecord = {
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    ...input,
  };

  await appendSheetRow(config, ARTIKEL_HEADER, toArtikelSheetRow(artikel));
  return artikel;
}

export async function updateArtikel(
  id: string,
  input: ArtikelInput,
): Promise<ArtikelRecord | null> {
  const config = getArtikelConfig();
  const row = await findArtikelRow(id, config);
  if (!row) return null;

  const artikel: ArtikelRecord = {
    ...row.record,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  await updateSheetRow(
    config,
    ARTIKEL_HEADER,
    row.rowNumber,
    toArtikelSheetRow(artikel),
  );
  return artikel;
}

export async function deleteArtikel(
  id: string,
): Promise<ArtikelRecord | null> {
  const config = getArtikelConfig();
  const row = await findArtikelRow(id, config);
  if (!row) return null;

  await deleteSheetRow(config, row.rowNumber);
  return row.record;
}

export async function listKegiatan(): Promise<KegiatanRecord[]> {
  const rows = await readKegiatanRows();
  return rows
    .map((row) => row.record)
    .sort(
      (a, b) =>
        dateTimeValue(b.tanggal) - dateTimeValue(a.tanggal) ||
        dateTimeValue(b.createdAt) - dateTimeValue(a.createdAt),
    );
}

export async function getKegiatan(id: string): Promise<KegiatanRecord | null> {
  const row = await findKegiatanRow(id);
  return row?.record ?? null;
}

export async function createKegiatan(
  input: KegiatanInput,
): Promise<KegiatanRecord> {
  const config = getKegiatanConfig();
  const now = new Date().toISOString();
  const kegiatan: KegiatanRecord = {
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    ...input,
  };

  await appendSheetRow(config, KEGIATAN_HEADER, toKegiatanSheetRow(kegiatan));
  return kegiatan;
}

export async function updateKegiatan(
  id: string,
  input: KegiatanInput,
): Promise<KegiatanRecord | null> {
  const config = getKegiatanConfig();
  const row = await findKegiatanRow(id, config);
  if (!row) return null;

  const kegiatan: KegiatanRecord = {
    ...row.record,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  await updateSheetRow(
    config,
    KEGIATAN_HEADER,
    row.rowNumber,
    toKegiatanSheetRow(kegiatan),
  );
  return kegiatan;
}

export async function deleteKegiatan(
  id: string,
): Promise<KegiatanRecord | null> {
  const config = getKegiatanConfig();
  const row = await findKegiatanRow(id, config);
  if (!row) return null;

  await deleteSheetRow(config, row.rowNumber);
  return row.record;
}

export async function listPengurus(): Promise<PengurusRecord[]> {
  const rows = await readPengurusRows();
  return rows
    .map((row) => row.record)
    .sort(
      (a, b) =>
        a.urutan - b.urutan || a.nama.localeCompare(b.nama, "id-ID"),
    );
}

export async function getPengurus(id: string): Promise<PengurusRecord | null> {
  const row = await findPengurusRow(id);
  return row?.record ?? null;
}

export async function createPengurus(
  input: PengurusInput,
): Promise<PengurusRecord> {
  const config = getPengurusConfig();
  const now = new Date().toISOString();
  const pengurus: PengurusRecord = {
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    ...input,
  };

  await appendSheetRow(config, PENGURUS_HEADER, toPengurusSheetRow(pengurus));
  return pengurus;
}

export async function updatePengurus(
  id: string,
  input: PengurusInput,
): Promise<PengurusRecord | null> {
  const config = getPengurusConfig();
  const row = await findPengurusRow(id, config);
  if (!row) return null;

  const pengurus: PengurusRecord = {
    ...row.record,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  await updateSheetRow(
    config,
    PENGURUS_HEADER,
    row.rowNumber,
    toPengurusSheetRow(pengurus),
  );
  return pengurus;
}

export async function deletePengurus(
  id: string,
): Promise<PengurusRecord | null> {
  const config = getPengurusConfig();
  const row = await findPengurusRow(id, config);
  if (!row) return null;

  await deleteSheetRow(config, row.rowNumber);
  return row.record;
}

async function findArtikelRow(
  id: string,
  config = getArtikelConfig(),
): Promise<SheetRecord<ArtikelRecord> | null> {
  const rows = await readArtikelRows(config);
  return rows.find((row) => row.record.id === id) ?? null;
}

async function readArtikelRows(
  config = getArtikelConfig(),
): Promise<Array<SheetRecord<ArtikelRecord>>> {
  const rows = await readSheetRows(config, ARTIKEL_HEADER);
  return rows
    .map((row) => parseArtikelRow(row.cells, row.rowNumber))
    .filter((row): row is SheetRecord<ArtikelRecord> => row !== null);
}

function parseArtikelRow(
  row: string[],
  rowNumber: number,
): SheetRecord<ArtikelRecord> | null {
  const id = sheetCell(row, 0);
  if (!id) return null;

  const status = sheetCell(row, 8);
  return {
    rowNumber,
    record: {
      id,
      createdAt: sheetCell(row, 1),
      updatedAt: sheetCell(row, 2),
      judul: sheetCell(row, 3),
      slug: sheetCell(row, 4),
      konten: sheetCell(row, 5),
      thumbnail: nullableCell(row, 6),
      tanggal: sheetCell(row, 7),
      status: isArtikelStatus(status) ? status : "DRAFT",
    },
  };
}

function toArtikelSheetRow(artikel: ArtikelRecord): string[] {
  return [
    artikel.id,
    artikel.createdAt,
    artikel.updatedAt,
    artikel.judul,
    artikel.slug,
    artikel.konten,
    artikel.thumbnail ?? "",
    artikel.tanggal,
    artikel.status,
  ];
}

async function findKegiatanRow(
  id: string,
  config = getKegiatanConfig(),
): Promise<SheetRecord<KegiatanRecord> | null> {
  const rows = await readKegiatanRows(config);
  return rows.find((row) => row.record.id === id) ?? null;
}

async function readKegiatanRows(
  config = getKegiatanConfig(),
): Promise<Array<SheetRecord<KegiatanRecord>>> {
  const rows = await readSheetRows(config, KEGIATAN_HEADER);
  return rows
    .map((row) => parseKegiatanRow(row.cells, row.rowNumber))
    .filter((row): row is SheetRecord<KegiatanRecord> => row !== null);
}

function parseKegiatanRow(
  row: string[],
  rowNumber: number,
): SheetRecord<KegiatanRecord> | null {
  const id = sheetCell(row, 0);
  if (!id) return null;

  const status = sheetCell(row, 8);
  return {
    rowNumber,
    record: {
      id,
      createdAt: sheetCell(row, 1),
      updatedAt: sheetCell(row, 2),
      nama: sheetCell(row, 3),
      deskripsi: sheetCell(row, 4),
      tanggal: sheetCell(row, 5),
      lokasi: sheetCell(row, 6),
      foto: nullableCell(row, 7),
      status: isKegiatanStatus(status) ? status : "AKAN_DATANG",
    },
  };
}

function toKegiatanSheetRow(kegiatan: KegiatanRecord): string[] {
  return [
    kegiatan.id,
    kegiatan.createdAt,
    kegiatan.updatedAt,
    kegiatan.nama,
    kegiatan.deskripsi,
    kegiatan.tanggal,
    kegiatan.lokasi,
    kegiatan.foto ?? "",
    kegiatan.status,
  ];
}

async function findPengurusRow(
  id: string,
  config = getPengurusConfig(),
): Promise<SheetRecord<PengurusRecord> | null> {
  const rows = await readPengurusRows(config);
  return rows.find((row) => row.record.id === id) ?? null;
}

async function readPengurusRows(
  config = getPengurusConfig(),
): Promise<Array<SheetRecord<PengurusRecord>>> {
  const rows = await readSheetRows(config, PENGURUS_HEADER);
  return rows
    .map((row) => parsePengurusRow(row.cells, row.rowNumber))
    .filter((row): row is SheetRecord<PengurusRecord> => row !== null);
}

function parsePengurusRow(
  row: string[],
  rowNumber: number,
): SheetRecord<PengurusRecord> | null {
  const id = sheetCell(row, 0);
  if (!id) return null;

  return {
    rowNumber,
    record: {
      id,
      createdAt: sheetCell(row, 1),
      updatedAt: sheetCell(row, 2),
      nama: sheetCell(row, 3),
      jabatan: sheetCell(row, 4),
      kelas: sheetCell(row, 5),
      foto: nullableCell(row, 6),
      urutan: parseInteger(sheetCell(row, 7)),
    },
  };
}

function toPengurusSheetRow(pengurus: PengurusRecord): string[] {
  return [
    pengurus.id,
    pengurus.createdAt,
    pengurus.updatedAt,
    pengurus.nama,
    pengurus.jabatan,
    pengurus.kelas,
    pengurus.foto ?? "",
    String(pengurus.urutan),
  ];
}

function getArtikelConfig(): SheetsConfig {
  return getGoogleSheetConfig("GOOGLE_SHEETS_ARTIKEL_SHEET");
}

function getKegiatanConfig(): SheetsConfig {
  return getGoogleSheetConfig("GOOGLE_SHEETS_KEGIATAN_SHEET");
}

function getPengurusConfig(): SheetsConfig {
  return getGoogleSheetConfig("GOOGLE_SHEETS_PENGURUS_SHEET");
}

function nullableCell(row: readonly string[], index: number): string | null {
  return sheetCell(row, index) || null;
}

function parseInteger(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function dateTimeValue(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}
