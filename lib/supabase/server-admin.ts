import "server-only";

import { createClient } from "@supabase/supabase-js";

export class SupabaseAdminConfigurationError extends Error {
  readonly code = "supabase_admin_configuration_error" as const;

  constructor(message = "Trusted Supabase server configuration is invalid or incomplete.") {
    super(message);
    this.name = "SupabaseAdminConfigurationError";
  }
}

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new SupabaseAdminConfigurationError();
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(supabaseUrl);
  } catch {
    throw new SupabaseAdminConfigurationError();
  }

  if (
    !["http:", "https:"].includes(parsedUrl.protocol)
    || !supabaseSecretKey.startsWith("sb_secret_")
  ) {
    throw new SupabaseAdminConfigurationError();
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
