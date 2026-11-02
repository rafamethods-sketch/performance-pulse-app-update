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

export type ProviderCredentialWriteInput = {
  connectionId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
};

export type ProviderCredentialReplaceInput = ProviderCredentialWriteInput & {
  expectedCredentialVersion: number;
};

export type ProviderCredentialDeleteInput = {
  connectionId: string;
  expectedCredentialVersion: number;
};

export type ProviderCredentialMetadata = {
  connectionId: string;
  provider: ProviderCredentialProvider;
  expiresAt: string;
  encryptionKeyVersion: number;
  credentialVersion: number;
  createdAt: string;
  updatedAt: string;
};

export type DecryptedProviderCredentials = ProviderCredentialMetadata & {
  accessToken: string;
  refreshToken: string;
};
