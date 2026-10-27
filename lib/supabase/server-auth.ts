import "server-only";

import { createClient } from "@supabase/supabase-js";

export class SupabaseServerAuthConfigurationError extends Error {
  readonly code = "supabase_server_auth_configuration_error" as const;

  constructor(message = "Trusted Supabase auth configuration is invalid or incomplete.") {
    super(message);
    this.name = "SupabaseServerAuthConfigurationError";
  }
}

export function createSupabaseServerAuthClient(accessToken: string) {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  const normalizedAccessToken = accessToken.trim();

  if (!supabaseUrl || !supabasePublishableKey || !normalizedAccessToken) {
    throw new SupabaseServerAuthConfigurationError();
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(supabaseUrl);
  } catch {
    throw new SupabaseServerAuthConfigurationError();
  }

  if (
    !["http:", "https:"].includes(parsedUrl.protocol)
    || !supabasePublishableKey.startsWith("sb_publishable_")
  ) {
    throw new SupabaseServerAuthConfigurationError();
  }

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${normalizedAccessToken}`,
      },
    },
  });
}
