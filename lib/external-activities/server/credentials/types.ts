import "server-only";

export type ProviderCredentialProvider = "strava";

export type ProviderCredentialType = "access_token" | "refresh_token";

export type ProviderCredentialContext = {
  connectionId: string;
  provider: ProviderCredentialProvider;
  credentialType: ProviderCredentialType;
};

export type EncryptedProviderCredential = {
  ciphertext: Buffer;
  nonce: Buffer;
  authTag: Buffer;
  keyVersion: number;
};
