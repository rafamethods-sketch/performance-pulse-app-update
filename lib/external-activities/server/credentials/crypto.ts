import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

import { ProviderCredentialError } from "./errors";
import type {
  EncryptedProviderCredential,
  ProviderCredentialContext,
} from "./types";

const algorithm = "aes-256-gcm";
const keyLength = 32;
const nonceLength = 12;
const authTagLength = 16;
const connectionIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateKey(key: Buffer) {
  if (!Buffer.isBuffer(key) || key.length !== keyLength) {
    throw new ProviderCredentialError("provider_credentials_key_invalid");
  }
}

function buildCredentialAad(context: ProviderCredentialContext): Buffer {
  if (
    typeof context !== "object"
    || context === null
    || !connectionIdPattern.test(context.connectionId)
    || context.provider !== "strava"
    || !["access_token", "refresh_token"].includes(context.credentialType)
  ) {
    throw new ProviderCredentialError("provider_credentials_decrypt_failed");
  }

  const connectionId = context.connectionId.toLowerCase();
  return Buffer.from(
    `rac:external-provider-credential:v1:${connectionId}:${context.provider}:${context.credentialType}`,
    "utf8",
  );
}

function validateKeyVersion(keyVersion: number) {
  if (!Number.isSafeInteger(keyVersion) || keyVersion <= 0) {
    throw new ProviderCredentialError("provider_credentials_key_version_unknown");
  }
}

export function encryptCredential(input: {
  plaintext: string;
  context: ProviderCredentialContext;
  key: Buffer;
  keyVersion: number;
}): EncryptedProviderCredential {
  validateKey(input.key);
  validateKeyVersion(input.keyVersion);
  if (typeof input.plaintext !== "string" || input.plaintext.length === 0) {
    throw new ProviderCredentialError("provider_credentials_encrypt_failed");
  }

  let aad: Buffer;
  try {
    aad = buildCredentialAad(input.context);
  } catch {
    throw new ProviderCredentialError("provider_credentials_encrypt_failed");
  }

  try {
    const nonce = randomBytes(nonceLength);
    const cipher = createCipheriv(algorithm, input.key, nonce, { authTagLength });
    cipher.setAAD(aad);
    const ciphertext = Buffer.concat([
      cipher.update(input.plaintext, "utf8"),
      cipher.final(),
    ]);

    return {
      ciphertext,
      nonce,
      authTag: cipher.getAuthTag(),
      keyVersion: input.keyVersion,
    };
  } catch {
    throw new ProviderCredentialError("provider_credentials_encrypt_failed");
  }
}

export function decryptCredential(input: {
  encrypted: EncryptedProviderCredential;
  context: ProviderCredentialContext;
  key: Buffer;
}): string {
  validateKey(input.key);
  validateKeyVersion(input.encrypted.keyVersion);
  if (
    !Buffer.isBuffer(input.encrypted.ciphertext)
    || input.encrypted.ciphertext.length === 0
    || !Buffer.isBuffer(input.encrypted.nonce)
    || input.encrypted.nonce.length !== nonceLength
    || !Buffer.isBuffer(input.encrypted.authTag)
    || input.encrypted.authTag.length !== authTagLength
  ) {
    throw new ProviderCredentialError("provider_credentials_decrypt_failed");
  }

  let aad: Buffer;
  try {
    aad = buildCredentialAad(input.context);
  } catch {
    throw new ProviderCredentialError("provider_credentials_decrypt_failed");
  }

  try {
    const decipher = createDecipheriv(
      algorithm,
      input.key,
      input.encrypted.nonce,
      { authTagLength },
    );
    decipher.setAAD(aad);
    decipher.setAuthTag(input.encrypted.authTag);
    return Buffer.concat([
      decipher.update(input.encrypted.ciphertext),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new ProviderCredentialError("provider_credentials_decrypt_failed");
  }
}
