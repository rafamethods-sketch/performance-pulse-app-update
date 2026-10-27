import "./server-only";

import type {
  ExternalActivityDevice,
  ExternalActivityImportRecord,
  ExternalActivityProviderChange,
} from "../types";

export const DEVICE_INGEST_MAX_ITEMS = 50;
export const DEVICE_INGEST_MAX_BODY_BYTES = 256 * 1024;

const forbiddenOwnershipKeys = new Set([
  "athleteid",
  "clientid",
  "email",
  "profileid",
  "role",
  "userid",
]);

const envelopeKeys = new Set(["provider", "schemaVersion", "items"]);
const upsertKeys = new Set([
  "kind",
  "providerRecordId",
  "providerActivityType",
  "startedAt",
  "endedAt",
  "durationSeconds",
  "distanceMeters",
  "averageHeartRate",
  "maxHeartRate",
  "activeCaloriesKcal",
  "elevationGainMeters",
  "sourceApp",
  "device",
  "sourceUpdatedAt",
]);
const deleteKeys = new Set(["kind", "providerRecordId", "deletedAtSource"]);
const deviceKeys = new Set(["manufacturer", "model"]);

export class DeviceIngestRequestError extends Error {
  constructor(
    readonly status: 400 | 413 | 415,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "DeviceIngestRequestError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizedFieldName(value: string) {
  return value.replaceAll("_", "").toLowerCase();
}

function containsForbiddenOwnershipField(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsForbiddenOwnershipField);
  if (!isRecord(value)) return false;

  return Object.entries(value).some(([key, child]) => (
    forbiddenOwnershipKeys.has(normalizedFieldName(key))
    || containsForbiddenOwnershipField(child)
  ));
}

function requireAllowedKeys(value: Record<string, unknown>, allowed: Set<string>) {
  if (Object.keys(value).some((key) => !allowed.has(key))) {
    throw new DeviceIngestRequestError(
      400,
      "invalid_payload",
      "Request payload contains unsupported fields.",
    );
  }
}

function requireString(value: unknown, field: string) {
  if (typeof value !== "string") {
    throw new DeviceIngestRequestError(400, "invalid_payload", `${field} must be a string.`);
  }
  return value;
}

function optionalString(value: unknown, field: string) {
  return value === undefined ? undefined : requireString(value, field);
}

function requireNumber(value: unknown, field: string) {
  if (typeof value !== "number") {
    throw new DeviceIngestRequestError(400, "invalid_payload", `${field} must be a number.`);
  }
  return value;
}

function optionalNumber(value: unknown, field: string) {
  return value === undefined ? undefined : requireNumber(value, field);
}

function optionalDevice(value: unknown): ExternalActivityDevice | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    throw new DeviceIngestRequestError(400, "invalid_payload", "device must be an object.");
  }
  requireAllowedKeys(value, deviceKeys);
  return {
    manufacturer: optionalString(value.manufacturer, "device.manufacturer"),
    model: optionalString(value.model, "device.model"),
  };
}

function parseItem(value: unknown): ExternalActivityProviderChange {
  if (!isRecord(value)) {
    throw new DeviceIngestRequestError(400, "invalid_payload", "Each item must be an object.");
  }

  if (value.kind === "delete") {
    requireAllowedKeys(value, deleteKeys);
    return {
      kind: "delete",
      provider: "mock",
      providerRecordId: requireString(value.providerRecordId, "providerRecordId"),
      deletedAtSource: requireString(value.deletedAtSource, "deletedAtSource"),
    };
  }

  if (value.kind !== "upsert") {
    throw new DeviceIngestRequestError(400, "invalid_payload", "Item kind is not supported.");
  }

  requireAllowedKeys(value, upsertKeys);
  const record: ExternalActivityImportRecord = {
    provider: "mock",
    providerRecordId: requireString(value.providerRecordId, "providerRecordId"),
    providerActivityType: requireString(
      value.providerActivityType,
      "providerActivityType",
    ),
    startedAt: requireString(value.startedAt, "startedAt"),
    endedAt: optionalString(value.endedAt, "endedAt"),
    durationSeconds: requireNumber(value.durationSeconds, "durationSeconds"),
    distanceMeters: optionalNumber(value.distanceMeters, "distanceMeters"),
    averageHeartRate: optionalNumber(value.averageHeartRate, "averageHeartRate"),
    maxHeartRate: optionalNumber(value.maxHeartRate, "maxHeartRate"),
    activeCaloriesKcal: optionalNumber(
      value.activeCaloriesKcal,
      "activeCaloriesKcal",
    ),
    elevationGainMeters: optionalNumber(
      value.elevationGainMeters,
      "elevationGainMeters",
    ),
    sourceApp: optionalString(value.sourceApp, "sourceApp"),
    device: optionalDevice(value.device),
    sourceUpdatedAt: optionalString(value.sourceUpdatedAt, "sourceUpdatedAt"),
  };
  return { kind: "upsert", record };
}

async function readBodyBytes(request: Request) {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const declaredBytes = Number(contentLength);
    if (Number.isFinite(declaredBytes) && declaredBytes > DEVICE_INGEST_MAX_BODY_BYTES) {
      throw new DeviceIngestRequestError(413, "payload_too_large", "Request body is too large.");
    }
  }

  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > DEVICE_INGEST_MAX_BODY_BYTES) {
        await reader.cancel();
        throw new DeviceIngestRequestError(413, "payload_too_large", "Request body is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export function extractBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization) return null;
  const match = /^Bearer\s+([^\s]+)$/i.exec(authorization.trim());
  return match?.[1] ?? null;
}

export async function parseDeviceIngestRequest(request: Request) {
  const mediaType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (mediaType !== "application/json") {
    throw new DeviceIngestRequestError(
      415,
      "unsupported_media_type",
      "Content-Type must be application/json.",
    );
  }

  const bytes = await readBodyBytes(request);
  let body: unknown;
  try {
    body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new DeviceIngestRequestError(400, "invalid_json", "Request body must be valid JSON.");
  }

  if (!isRecord(body)) {
    throw new DeviceIngestRequestError(400, "invalid_payload", "Request body must be an object.");
  }
  if (containsForbiddenOwnershipField(body)) {
    throw new DeviceIngestRequestError(
      400,
      "ownership_field_forbidden",
      "Ownership and authorization fields are not accepted.",
    );
  }

  requireAllowedKeys(body, envelopeKeys);
  if (body.provider !== "mock") {
    throw new DeviceIngestRequestError(400, "provider_not_allowed", "Provider is not enabled.");
  }
  if (body.schemaVersion !== 1) {
    throw new DeviceIngestRequestError(400, "invalid_payload", "schemaVersion is not supported.");
  }
  if (!Array.isArray(body.items)) {
    throw new DeviceIngestRequestError(400, "invalid_payload", "items must be an array.");
  }
  if (body.items.length === 0 || body.items.length > DEVICE_INGEST_MAX_ITEMS) {
    throw new DeviceIngestRequestError(
      400,
      "invalid_batch_size",
      `items must contain between 1 and ${DEVICE_INGEST_MAX_ITEMS} entries.`,
    );
  }

  return body.items.map(parseItem);
}
