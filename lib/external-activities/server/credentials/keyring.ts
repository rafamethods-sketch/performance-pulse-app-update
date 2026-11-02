import "server-only";

import { ProviderCredentialError } from "./errors";

export type ProviderCredentialKeyVersion = 1;

const supportedKeyVersions = new Set<number>([1]);
const canonicalBase64Pattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

function keyEnvironmentName(version: number) {
  return `EXTERNAL_PROVIDER_CREDENTIAL_KEY_V${version}`;
}

export function loadCredentialKey(
  version: ProviderCredentialKeyVersion,
  environment: Readonly<Record<string, string | undefined>> = process.env,
): Buffer {
  if (!Number.isSafeInteger(version) || !supportedKeyVersions.has(version)) {
    throw new ProviderCredentialError("provider_credentials_key_version_unknown");
  }

  const encodedKey = environment[keyEnvironmentName(version)];
  if (encodedKey === undefined) {
    throw new ProviderCredentialError("provider_credentials_key_unavailable");
  }
  if (
    encodedKey.length === 0
    || /\s/.test(encodedKey)
    || !canonicalBase64Pattern.test(encodedKey)
  ) {
    throw new ProviderCredentialError("provider_credentials_key_invalid");
  }

  const key = Buffer.from(encodedKey, "base64");
  if (key.length !== 32 || key.toString("base64") !== encodedKey) {
    throw new ProviderCredentialError("provider_credentials_key_invalid");
  }

  return key;
}
