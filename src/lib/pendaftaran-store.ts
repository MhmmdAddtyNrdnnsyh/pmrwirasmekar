import "server-only";

import { createSign, randomUUID } from "node:crypto";

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
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

type SheetsConfig = {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
  sheetName: string;
};

type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

type ValuesResponse = {
  values?: string[][];
};

type SpreadsheetResponse = {
  sheets?: Array<{
    properties?: {
      sheetId?: number;
      title?: string;
    };
  }>;
};

type SheetPendaftaranRow = {
  rowNumber: number;
  pendaftaran: IPendaftaran;
};

let tokenCache: TokenCache | null = null;

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
  await ensureHeaderRow(config);

  const pendaftaran: IPendaftaran = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
    status: "PENDING",
  };

  await sheetsFetch<unknown>(
    config,
    `/values/${encodeRange(config, "A:H")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      body: JSON.stringify({ values: [toSheetRow(pendaftaran)] }),
    },
  );

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

  await sheetsFetch<unknown>(
    config,
    `/values/${encodeRange(config, `A${row.rowNumber}:H${row.rowNumber}`)}?valueInputOption=RAW`,
    {
      method: "PUT",
      body: JSON.stringify({ values: [toSheetRow(next)] }),
    },
  );

  return next;
}

export async function deletePendaftaran(id: string): Promise<boolean> {
  const config = getSheetsConfig();
  const row = await findPendaftaranRow(id, config);
  if (!row) return false;

  const sheetId = await getSheetId(config);
  await sheetsFetch<unknown>(config, ":batchUpdate", {
    method: "POST",
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: row.rowNumber - 1,
              endIndex: row.rowNumber,
            },
          },
        },
      ],
    }),
  });

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
  await ensureHeaderRow(config);

  const data = await sheetsFetch<ValuesResponse>(
    config,
    `/values/${encodeRange(config, "A:H")}`,
  );
  const rows = data.values ?? [];

  return rows
    .slice(1)
    .map((row, index) => parsePendaftaranRow(row, index + 2))
    .filter((row): row is SheetPendaftaranRow => row !== null);
}

async function ensureHeaderRow(config: SheetsConfig): Promise<void> {
  const data = await sheetsFetch<ValuesResponse>(
    config,
    `/values/${encodeRange(config, "A1:H1")}`,
  );
  const currentHeader = data.values?.[0] ?? [];
  const hasExpectedHeader = HEADER_ROW.every(
    (header, index) => currentHeader[index] === header,
  );

  if (hasExpectedHeader) return;

  const hasCustomHeader = currentHeader.some((cell) => String(cell).trim());
  if (hasCustomHeader) {
    throw new Error(
      `Header Google Sheet pendaftaran tidak sesuai. Gunakan urutan: ${HEADER_ROW.join(", ")}.`,
    );
  }

  await sheetsFetch<unknown>(
    config,
    `/values/${encodeRange(config, "A1:H1")}?valueInputOption=RAW`,
    {
      method: "PUT",
      body: JSON.stringify({ values: [HEADER_ROW] }),
    },
  );
}

async function getSheetId(config: SheetsConfig): Promise<number> {
  const data = await sheetsFetch<SpreadsheetResponse>(
    config,
    "?fields=sheets.properties(sheetId,title)",
  );
  const sheet = data.sheets?.find(
    (entry) => entry.properties?.title === config.sheetName,
  );
  const sheetId = sheet?.properties?.sheetId;

  if (typeof sheetId !== "number") {
    throw new Error(`Sheet "${config.sheetName}" tidak ditemukan.`);
  }

  return sheetId;
}

function parsePendaftaranRow(
  row: string[],
  rowNumber: number,
): SheetPendaftaranRow | null {
  const id = cell(row, 0);
  if (!id) return null;

  const status = cell(row, 7);
  return {
    rowNumber,
    pendaftaran: {
      id,
      createdAt: cell(row, 1),
      nama: cell(row, 2),
      nis: cell(row, 3),
      kelas: cell(row, 4),
      noHp: cell(row, 5),
      alasan: cell(row, 6),
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

function cell(row: string[], index: number): string {
  return String(row[index] ?? "").trim();
}

function dateTimeValue(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function encodeRange(config: SheetsConfig, range: string): string {
  return encodeURIComponent(`${quoteSheetName(config.sheetName)}!${range}`);
}

function quoteSheetName(sheetName: string): string {
  return `'${sheetName.replace(/'/g, "''")}'`;
}

function getSheetsConfig(): SheetsConfig {
  return {
    spreadsheetId: requiredEnv("GOOGLE_SHEETS_SPREADSHEET_ID"),
    clientEmail: requiredEnv("GOOGLE_SHEETS_CLIENT_EMAIL"),
    privateKey: requiredEnv("GOOGLE_SHEETS_PRIVATE_KEY").replace(/\\n/g, "\n"),
    sheetName: requiredEnv("GOOGLE_SHEETS_PENDAFTARAN_SHEET"),
  };
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} belum diset.`);
  }
  return value;
}

async function sheetsFetch<T>(
  config: SheetsConfig,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const accessToken = await getAccessToken(config);
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(
    `${GOOGLE_SHEETS_API}/${config.spreadsheetId}${path}`,
    {
      ...init,
      headers,
    },
  );

  return parseGoogleResponse<T>(response, "Google Sheets");
}

async function getAccessToken(config: SheetsConfig): Promise<string> {
  if (tokenCache && tokenCache.expiresAt - Date.now() > 60_000) {
    return tokenCache.accessToken;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlJson({ alg: "RS256", typ: "JWT" });
  const payload = base64UrlJson({
    iss: config.clientEmail,
    scope: SHEETS_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    iat: now,
    exp: now + 3600,
  });
  const unsignedToken = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256")
    .update(unsignedToken)
    .end()
    .sign(config.privateKey, "base64url");
  const assertion = `${unsignedToken}.${signature}`;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const data = await parseGoogleResponse<{
    access_token?: unknown;
    expires_in?: unknown;
  }>(response, "Google OAuth");

  if (typeof data.access_token !== "string") {
    throw new Error("Google OAuth tidak mengembalikan access token.");
  }

  const expiresIn =
    typeof data.expires_in === "number" && Number.isFinite(data.expires_in)
      ? data.expires_in
      : 3600;

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  return data.access_token;
}

async function parseGoogleResponse<T>(
  response: Response,
  label: string,
): Promise<T> {
  const text = await response.text();

  if (!response.ok) {
    const detail = text ? ` ${text.slice(0, 500)}` : "";
    throw new Error(`${label} request gagal (${response.status}).${detail}`);
  }

  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

function base64UrlJson(value: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}
