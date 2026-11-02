import "server-only";

export type ProviderCredentialErrorCode =
  | "provider_credentials_encrypt_failed"
  | "provider_credentials_decrypt_failed"
  | "provider_credentials_key_unavailable"
  | "provider_credentials_key_invalid"
  | "provider_credentials_key_version_unknown";

const errorMessages: Record<ProviderCredentialErrorCode, string> = {
  provider_credentials_encrypt_failed: "Provider credential encryption failed.",
  provider_credentials_decrypt_failed: "Provider credential decryption failed.",
  provider_credentials_key_unavailable: "Provider credential key is unavailable.",
  provider_credentials_key_invalid: "Provider credential key is invalid.",
  provider_credentials_key_version_unknown: "Provider credential key version is unknown.",
};

export class ProviderCredentialError extends Error {
  readonly code: ProviderCredentialErrorCode;

  constructor(code: ProviderCredentialErrorCode) {
    super(errorMessages[code]);
    this.name = "ProviderCredentialError";
    this.code = code;
  }
}
