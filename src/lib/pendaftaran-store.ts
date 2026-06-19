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
import type { IPendaftaran } from "@/types";

export type PendaftaranStatus = IPendaftaran["status"];

export type CreatePendaftaranInput = Pick<
  IPendaftaran,
  "nama" | "nis" | "kelas" | "noHp" | "alasan"
>;

const HEADER_ROW = [
  "id",
  "createdAt",
  "nama",
  "nis",
  "kelas",
  "noHp",
  "alasan",
  "status",
] as const;

const VALID_STATUS = ["PENDING", "DITERIMA", "DITOLAK"] as const;

type SheetPendaftaranRow = {
  rowNumber: number;
  pendaftaran: IPendaftaran;
};

export function isPendaftaranStatus(value: unknown): value is PendaftaranStatus {
  return (
    typeof value === "string" &&
    (VALID_STATUS as readonly string[]).includes(value)
  );
}

export async function listPendaftaran(): Promise<IPendaftaran[]> {
  const rows = await readPendaftaranRows();
  return rows
    .map((row) => row.pendaftaran)
    .sort((a, b) => dateTimeValue(b.createdAt) - dateTimeValue(a.createdAt));
}

export async function getPendaftaran(
  id: string,
): Promise<IPendaftaran | null> {
  const row = await findPendaftaranRow(id);
  return row?.pendaftaran ?? null;
}

export async function createPendaftaran(
  input: CreatePendaftaranInput,
): Promise<IPendaftaran> {
  const config = getSheetsConfig();
  const pendaftaran: IPendaftaran = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
    status: "PENDING",
  };

  await appendSheetRow(config, HEADER_ROW, toSheetRow(pendaftaran));
  return pendaftaran;
}

export async function updatePendaftaranStatus(
  id: string,
  status: PendaftaranStatus,
): Promise<IPendaftaran | null> {
  const config = getSheetsConfig();
  const row = await findPendaftaranRow(id, config);
  if (!row) return null;

  const next: IPendaftaran = {
    ...row.pendaftaran,
    status,
  };

  await updateSheetRow(config, HEADER_ROW, row.rowNumber, toSheetRow(next));
  return next;
}

export async function deletePendaftaran(id: string): Promise<boolean> {
  const config = getSheetsConfig();
  const row = await findPendaftaranRow(id, config);
  if (!row) return false;

  await deleteSheetRow(config, row.rowNumber);
  return true;
}

async function findPendaftaranRow(
  id: string,
  config = getSheetsConfig(),
): Promise<SheetPendaftaranRow | null> {
  const rows = await readPendaftaranRows(config);
  return rows.find((row) => row.pendaftaran.id === id) ?? null;
}

async function readPendaftaranRows(
  config = getSheetsConfig(),
): Promise<SheetPendaftaranRow[]> {
  const rows = await readSheetRows(config, HEADER_ROW);

  return rows
    .map((row) => parsePendaftaranRow(row.cells, row.rowNumber))
    .filter((row): row is SheetPendaftaranRow => row !== null);
}

function parsePendaftaranRow(
  row: string[],
  rowNumber: number,
): SheetPendaftaranRow | null {
  const id = sheetCell(row, 0);
  if (!id) return null;

  const status = sheetCell(row, 7);
  return {
    rowNumber,
    pendaftaran: {
      id,
      createdAt: sheetCell(row, 1),
      nama: sheetCell(row, 2),
      nis: sheetCell(row, 3),
      kelas: sheetCell(row, 4),
      noHp: sheetCell(row, 5),
      alasan: sheetCell(row, 6),
      status: isPendaftaranStatus(status) ? status : "PENDING",
    },
  };
}

function toSheetRow(pendaftaran: IPendaftaran): string[] {
  return [
    pendaftaran.id,
    pendaftaran.createdAt,
    pendaftaran.nama,
    pendaftaran.nis,
    pendaftaran.kelas,
    pendaftaran.noHp,
    pendaftaran.alasan,
    pendaftaran.status,
  ];
}

function dateTimeValue(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getSheetsConfig(): SheetsConfig {
  return getGoogleSheetConfig("GOOGLE_SHEETS_PENDAFTARAN_SHEET");
}
