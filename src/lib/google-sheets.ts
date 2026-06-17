import "server-only";

import { createSign } from "node:crypto";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

export type SheetsConfig = {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
  sheetName: string;
};

export type SheetRow = {
  rowNumber: number;
  cells: string[];
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

type BatchUpdateResponse = {
  replies?: Array<{
    addSheet?: {
      properties?: {
        sheetId?: number;
      };
    };
  }>;
};

let tokenCache: TokenCache | null = null;

export function getGoogleSheetConfig(sheetNameEnv: string): SheetsConfig {
  return {
    spreadsheetId: requiredEnv("GOOGLE_SHEETS_SPREADSHEET_ID"),
    clientEmail: requiredEnv("GOOGLE_SHEETS_CLIENT_EMAIL"),
    privateKey: requiredEnv("GOOGLE_SHEETS_PRIVATE_KEY").replace(/\\n/g, "\n"),
    sheetName: requiredEnv(sheetNameEnv),
  };
}

export async function readSheetRows(
  config: SheetsConfig,
  headerRow: readonly string[],
): Promise<SheetRow[]> {
  await ensureHeaderRow(config, headerRow);

  const lastColumn = columnName(headerRow.length);
  const data = await sheetsFetch<ValuesResponse>(
    config,
    `/values/${encodeRange(config, `A:${lastColumn}`)}`,
  );

  return (data.values ?? [])
    .slice(1)
    .map((row, index) => ({
      rowNumber: index + 2,
      cells: row.map((value) => String(value ?? "")),
    }));
}

export async function appendSheetRow(
  config: SheetsConfig,
  headerRow: readonly string[],
  values: readonly string[],
): Promise<void> {
  await ensureHeaderRow(config, headerRow);

  const lastColumn = columnName(headerRow.length);
  await sheetsFetch<unknown>(
    config,
    `/values/${encodeRange(config, `A:${lastColumn}`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      body: JSON.stringify({ values: [values] }),
    },
  );
}

export async function updateSheetRow(
  config: SheetsConfig,
  headerRow: readonly string[],
  rowNumber: number,
  values: readonly string[],
): Promise<void> {
  await ensureHeaderRow(config, headerRow);

  const lastColumn = columnName(headerRow.length);
  await sheetsFetch<unknown>(
    config,
    `/values/${encodeRange(config, `A${rowNumber}:${lastColumn}${rowNumber}`)}?valueInputOption=RAW`,
    {
      method: "PUT",
      body: JSON.stringify({ values: [values] }),
    },
  );
}

export async function deleteSheetRow(
  config: SheetsConfig,
  rowNumber: number,
): Promise<void> {
  const sheetId = await getOrCreateSheetId(config);
  await sheetsFetch<unknown>(config, ":batchUpdate", {
    method: "POST",
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    }),
  });
}

export function sheetCell(row: readonly string[], index: number): string {
  return String(row[index] ?? "").trim();
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} belum diset.`);
  }
  return value;
}

async function ensureHeaderRow(
  config: SheetsConfig,
  headerRow: readonly string[],
): Promise<void> {
  await getOrCreateSheetId(config);

  const lastColumn = columnName(headerRow.length);
  const data = await sheetsFetch<ValuesResponse>(
    config,
    `/values/${encodeRange(config, `A1:${lastColumn}1`)}`,
  );
  const currentHeader = data.values?.[0] ?? [];
  const hasExpectedHeader = headerRow.every(
    (header, index) => currentHeader[index] === header,
  );

  if (hasExpectedHeader) return;

  const hasCustomHeader = currentHeader.some((cell) => String(cell).trim());
  if (hasCustomHeader) {
    throw new Error(
      `Header Google Sheet "${config.sheetName}" tidak sesuai. Gunakan urutan: ${headerRow.join(", ")}.`,
    );
  }

  await sheetsFetch<unknown>(
    config,
    `/values/${encodeRange(config, `A1:${lastColumn}1`)}?valueInputOption=RAW`,
    {
      method: "PUT",
      body: JSON.stringify({ values: [headerRow] }),
    },
  );
}

async function getOrCreateSheetId(config: SheetsConfig): Promise<number> {
  const data = await sheetsFetch<SpreadsheetResponse>(
    config,
    "?fields=sheets.properties(sheetId,title)",
  );
  const existing = data.sheets?.find(
    (entry) => entry.properties?.title === config.sheetName,
  );
  const existingSheetId = existing?.properties?.sheetId;

  if (typeof existingSheetId === "number") {
    return existingSheetId;
  }

  const created = await sheetsFetch<BatchUpdateResponse>(config, ":batchUpdate", {
    method: "POST",
    body: JSON.stringify({
      requests: [{ addSheet: { properties: { title: config.sheetName } } }],
    }),
  });
  const sheetId = created.replies?.[0]?.addSheet?.properties?.sheetId;

  if (typeof sheetId !== "number") {
    throw new Error(`Sheet "${config.sheetName}" tidak ditemukan.`);
  }

  return sheetId;
}

function encodeRange(config: SheetsConfig, range: string): string {
  return encodeURIComponent(`${quoteSheetName(config.sheetName)}!${range}`);
}

function quoteSheetName(sheetName: string): string {
  return `'${sheetName.replace(/'/g, "''")}'`;
}

function columnName(index: number): string {
  let value = "";
  let current = index;

  while (current > 0) {
    const mod = (current - 1) % 26;
    value = String.fromCharCode(65 + mod) + value;
    current = Math.floor((current - mod) / 26);
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
