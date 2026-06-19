import { randomUUID } from "node:crypto";

import {
  appendSheetRow,
  getGoogleSheetConfig,
  readSheetRows,
  sheetCell,
  type SheetsConfig,
} from "@/lib/google-sheets";

export type AdminRecord = {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
};

const HEADER_ROW = [
  "id",
  "createdAt",
  "username",
  "passwordHash",
] as const;

export async function getAdminByUsername(
  username: string,
): Promise<AdminRecord | null> {
  const rows = await readAdminRows();
  return (
    rows.find(
      (row) => row.username.toLowerCase() === username.toLowerCase(),
    ) ?? null
  );
}

export async function createAdmin(args: {
  username: string;
  passwordHash: string;
}): Promise<AdminRecord> {
  const config = getSheetsConfig();
  const admin: AdminRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    username: args.username,
    passwordHash: args.passwordHash,
  };

  await appendSheetRow(config, HEADER_ROW, toSheetRow(admin));
  return admin;
}

export async function hasAnyAdmin(): Promise<boolean> {
  const rows = await readAdminRows();
  return rows.length > 0;
}

async function readAdminRows(): Promise<AdminRecord[]> {
  const config = getSheetsConfig();
  const rows = await readSheetRows(config, HEADER_ROW);
  return rows
    .map((row) => parseAdminRow(row.cells))
    .filter((row): row is AdminRecord => row !== null);
}

function parseAdminRow(row: string[]): AdminRecord | null {
  const id = sheetCell(row, 0);
  if (!id) return null;

  return {
    id,
    createdAt: sheetCell(row, 1),
    username: sheetCell(row, 2),
    passwordHash: sheetCell(row, 3),
  };
}

function toSheetRow(admin: AdminRecord): string[] {
  return [admin.id, admin.createdAt, admin.username, admin.passwordHash];
}

function getSheetsConfig(): SheetsConfig {
  return getGoogleSheetConfig("GOOGLE_SHEETS_ADMIN_SHEET");
}
