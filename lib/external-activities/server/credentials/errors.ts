import "server-only";

export type ProviderCredentialErrorCode =
  | "provider_credentials_encrypt_failed"
  | "provider_credentials_decrypt_failed"
  | "provider_credentials_key_unavailable"
  | "provider_credentials_key_invalid"
  | "provider_credentials_key_version_unknown"
  | "provider_credentials_missing"
  | "provider_credentials_connection_missing"
  | "provider_credentials_conflict"
  | "provider_credentials_invalid_input"
  | "provider_credentials_persistence_failed";

const errorMessages: Record<ProviderCredentialErrorCode, string> = {
  provider_credentials_encrypt_failed: "Provider credential encryption failed.",
  provider_credentials_decrypt_failed: "Provider credential decryption failed.",
  provider_credentials_key_unavailable: "Provider credential key is unavailable.",
  provider_credentials_key_invalid: "Provider credential key is invalid.",
  provider_credentials_key_version_unknown: "Provider credential key version is unknown.",
  provider_credentials_missing: "Provider credentials are unavailable.",
  provider_credentials_connection_missing: "Provider connection is unavailable.",
  provider_credentials_conflict: "Provider credentials changed concurrently.",
  provider_credentials_invalid_input: "Provider credential input is invalid.",
  provider_credentials_persistence_failed: "Provider credential persistence failed.",
};

export class ProviderCredentialError extends Error {
  readonly code: ProviderCredentialErrorCode;

  constructor(code: ProviderCredentialErrorCode) {
    super(errorMessages[code]);
    this.name = "ProviderCredentialError";
    this.code = code;
  }
}
