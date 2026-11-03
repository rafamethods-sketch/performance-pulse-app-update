import "server-only";

export type StravaTokenResponse = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | number;
  athleteId: string;
  scopes: string[];
};

export type StravaTokenExchanger = (input: {
  code: string;
  callbackScope: string | null;
}) => Promise<StravaTokenResponse>;
