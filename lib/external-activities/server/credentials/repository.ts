import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { decryptCredential, encryptCredential } from "./crypto";
import { ProviderCredentialError } from "./errors";
import {
  loadCredentialKey,
  type ProviderCredentialKeyVersion,
} from "./keyring";
import type {
  DecryptedProviderCredentials,
  EncryptedProviderCredential,
  ProviderCredentialDeleteInput,
  ProviderCredentialMetadata,
  ProviderCredentialProvider,
  ProviderCredentialReplaceInput,
  ProviderCredentialWriteInput,
} from "./types";

const metadataColumns =
  "connection_id, expires_at, encryption_key_version, credential_version, created_at, updated_at";
const credentialColumns =
  `${metadataColumns}, access_token_ciphertext, access_token_nonce, access_token_auth_tag, refresh_token_ciphertext, refresh_token_nonce, refresh_token_auth_tag`;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const databaseByteaPattern = /^\\x(?:[0-9a-f]{2})+$/i;

type PersistedConnection = {
  id: string;
  provider: string;
};

type PersistedCredentialMetadata = {
  connection_id: string;
  expires_at: string;
  encryption_key_version: number;
  credential_version: number;
  created_at: string;
  updated_at: string;
};

type PersistedCredential = PersistedCredentialMetadata & {
  access_token_ciphertext: string;
  access_token_nonce: string;
  access_token_auth_tag: string;
  refresh_token_ciphertext: string;
  refresh_token_nonce: string;
  refresh_token_auth_tag: string;
};

export type ProviderCredentialRepository = {
  storeCredentials: (
    input: ProviderCredentialWriteInput,
  ) => Promise<ProviderCredentialMetadata>;
  loadCredentials: (connectionId: string) => Promise<DecryptedProviderCredentials>;
  replaceCredentials: (
    input: ProviderCredentialReplaceInput,
  ) => Promise<ProviderCredentialMetadata>;
  deleteCredentials: (
    input: ProviderCredentialDeleteInput,
  ) => Promise<ProviderCredentialMetadata>;
};

type RepositoryOptions = {
  activeKeyVersion?: ProviderCredentialKeyVersion;
  loadKey?: (version: ProviderCredentialKeyVersion) => Buffer;
  now?: () => Date;
};

function persistenceError(error?: { code?: string } | null) {
  if (error?.code === "23505") {
    return new ProviderCredentialError("provider_credentials_conflict");
  }
  return new ProviderCredentialError("provider_credentials_persistence_failed");
}

function validateConnectionId(connectionId: string) {
  if (typeof connectionId !== "string" || !uuidPattern.test(connectionId)) {
    throw new ProviderCredentialError("provider_credentials_invalid_input");
  }
  return connectionId.toLowerCase();
}

function validateWriteInput(input: ProviderCredentialWriteInput) {
  const connectionId = validateConnectionId(input.connectionId);
  if (
    typeof input.accessToken !== "string"
    || input.accessToken.trim().length === 0
    || typeof input.refreshToken !== "string"
    || input.refreshToken.trim().length === 0
  ) {
    throw new ProviderCredentialError("provider_credentials_invalid_input");
  }
  const expiresAt = new Date(input.expiresAt);
  if (Number.isNaN(expiresAt.getTime())) {
    throw new ProviderCredentialError("provider_credentials_invalid_input");
  }
  return {
    connectionId,
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    expiresAt: expiresAt.toISOString(),
  };
}

function validateExpectedVersion(version: number) {
  if (!Number.isSafeInteger(version) || version < 1) {
    throw new ProviderCredentialError("provider_credentials_invalid_input");
  }
  return version;
}

function toDatabaseBytea(value: Buffer) {
  return `\\x${value.toString("hex")}`;
}

function fromDatabaseBytea(value: unknown): Buffer {
  if (typeof value !== "string" || !databaseByteaPattern.test(value)) {
    throw new ProviderCredentialError("provider_credentials_persistence_failed");
  }
  return Buffer.from(value.slice(2), "hex");
}

function toMetadata(
  row: PersistedCredentialMetadata,
  provider: ProviderCredentialProvider,
): ProviderCredentialMetadata {
  return {
    connectionId: row.connection_id,
    provider,
    expiresAt: row.expires_at,
    encryptionKeyVersion: row.encryption_key_version,
    credentialVersion: row.credential_version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toEncryptedCredential(
  ciphertext: unknown,
  nonce: unknown,
  authTag: unknown,
  keyVersion: number,
): EncryptedProviderCredential {
  return {
    ciphertext: fromDatabaseBytea(ciphertext),
    nonce: fromDatabaseBytea(nonce),
    authTag: fromDatabaseBytea(authTag),
    keyVersion,
  };
}

export function createProviderCredentialRepository(
  trustedClient: SupabaseClient,
  options: RepositoryOptions = {},
): ProviderCredentialRepository {
  const activeKeyVersion = options.activeKeyVersion ?? 1;
  const keyLoader = options.loadKey ?? loadCredentialKey;
  const now = options.now ?? (() => new Date());

  async function resolveProvider(connectionId: string): Promise<ProviderCredentialProvider> {
    const { data, error } = await trustedClient
      .from("external_provider_connections")
      .select("id, provider")
      .eq("id", connectionId)
      .maybeSingle();

    if (error) throw persistenceError(error);
    if (!data) {
      throw new ProviderCredentialError("provider_credentials_connection_missing");
    }
    const connection = data as PersistedConnection;
    if (connection.provider !== "strava") throw persistenceError();
    return connection.provider;
  }

  function encryptPair(
    input: ReturnType<typeof validateWriteInput>,
    provider: ProviderCredentialProvider,
  ) {
    const key = keyLoader(activeKeyVersion);
    const context = { connectionId: input.connectionId, provider } as const;
    return {
      access: encryptCredential({
        plaintext: input.accessToken,
        context: { ...context, credentialType: "access_token" },
        key,
        keyVersion: activeKeyVersion,
      }),
      refresh: encryptCredential({
        plaintext: input.refreshToken,
        context: { ...context, credentialType: "refresh_token" },
        key,
        keyVersion: activeKeyVersion,
      }),
    };
  }

  function toEncryptedValues(
    input: ReturnType<typeof validateWriteInput>,
    encrypted: ReturnType<typeof encryptPair>,
    updatedAt: string,
  ) {
    return {
      access_token_ciphertext: toDatabaseBytea(encrypted.access.ciphertext),
      access_token_nonce: toDatabaseBytea(encrypted.access.nonce),
      access_token_auth_tag: toDatabaseBytea(encrypted.access.authTag),
      refresh_token_ciphertext: toDatabaseBytea(encrypted.refresh.ciphertext),
      refresh_token_nonce: toDatabaseBytea(encrypted.refresh.nonce),
      refresh_token_auth_tag: toDatabaseBytea(encrypted.refresh.authTag),
      expires_at: input.expiresAt,
      encryption_key_version: activeKeyVersion,
      updated_at: updatedAt,
    };
  }

  function toWriteRow(
    input: ReturnType<typeof validateWriteInput>,
    encrypted: ReturnType<typeof encryptPair>,
    updatedAt: string,
  ) {
    return {
      connection_id: input.connectionId,
      ...toEncryptedValues(input, encrypted, updatedAt),
    };
  }

  async function storeCredentials(input: ProviderCredentialWriteInput) {
    const validated = validateWriteInput(input);
    const provider = await resolveProvider(validated.connectionId);
    const encrypted = encryptPair(validated, provider);
    const { data, error } = await trustedClient
      .from("external_provider_credentials")
      .insert(toWriteRow(validated, encrypted, now().toISOString()))
      .select(metadataColumns)
      .single();

    if (error || !data) throw persistenceError(error);
    return toMetadata(data as PersistedCredentialMetadata, provider);
  }

  async function loadCredentials(connectionIdInput: string) {
    const connectionId = validateConnectionId(connectionIdInput);
    const provider = await resolveProvider(connectionId);
    const { data, error } = await trustedClient
      .from("external_provider_credentials")
      .select(credentialColumns)
      .eq("connection_id", connectionId)
      .maybeSingle();

    if (error) throw persistenceError(error);
    if (!data) throw new ProviderCredentialError("provider_credentials_missing");
    const row = data as PersistedCredential;
    const keyVersion = row.encryption_key_version as ProviderCredentialKeyVersion;
    const key = keyLoader(keyVersion);
    const context = { connectionId, provider } as const;
    return {
      ...toMetadata(row, provider),
      accessToken: decryptCredential({
        encrypted: toEncryptedCredential(
          row.access_token_ciphertext,
          row.access_token_nonce,
          row.access_token_auth_tag,
          keyVersion,
        ),
        context: { ...context, credentialType: "access_token" },
        key,
      }),
      refreshToken: decryptCredential({
        encrypted: toEncryptedCredential(
          row.refresh_token_ciphertext,
          row.refresh_token_nonce,
          row.refresh_token_auth_tag,
          keyVersion,
        ),
        context: { ...context, credentialType: "refresh_token" },
        key,
      }),
    };
  }

  async function replaceCredentials(input: ProviderCredentialReplaceInput) {
    const validated = validateWriteInput(input);
    const expectedVersion = validateExpectedVersion(input.expectedCredentialVersion);
    const provider = await resolveProvider(validated.connectionId);
    const encrypted = encryptPair(validated, provider);
    const updatedValues = toEncryptedValues(
      validated,
      encrypted,
      now().toISOString(),
    );
    const { data, error } = await trustedClient
      .from("external_provider_credentials")
      .update({
        ...updatedValues,
        credential_version: expectedVersion + 1,
      })
      .eq("connection_id", validated.connectionId)
      .eq("credential_version", expectedVersion)
      .select(metadataColumns)
      .maybeSingle();

    if (error) throw persistenceError(error);
    if (!data) throw new ProviderCredentialError("provider_credentials_conflict");
    return toMetadata(data as PersistedCredentialMetadata, provider);
  }

  async function deleteCredentials(input: ProviderCredentialDeleteInput) {
    const connectionId = validateConnectionId(input.connectionId);
    const expectedVersion = validateExpectedVersion(input.expectedCredentialVersion);
    const provider = await resolveProvider(connectionId);
    const { data, error } = await trustedClient
      .from("external_provider_credentials")
      .delete()
      .eq("connection_id", connectionId)
      .eq("credential_version", expectedVersion)
      .select(metadataColumns)
      .maybeSingle();

    if (error) throw persistenceError(error);
    if (!data) throw new ProviderCredentialError("provider_credentials_conflict");
    return toMetadata(data as PersistedCredentialMetadata, provider);
  }

  return {
    storeCredentials,
    loadCredentials,
    replaceCredentials,
    deleteCredentials,
  };
}
