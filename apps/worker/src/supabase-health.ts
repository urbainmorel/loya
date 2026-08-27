export interface SupabaseProbeBindings {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_PUBLISHABLE_KEY: string;
}

export type OutboundFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export function assertSafeSupabaseUrl(value: string): URL {
  const url = new URL(value);
  const isLocal = url.hostname === "127.0.0.1" || url.hostname === "localhost";
  const isSupabaseCloud = /^[a-z0-9-]+\.supabase\.co$/i.test(url.hostname);
  const isAllowedLocal =
    isLocal && (url.protocol === "http:" || url.protocol === "https:");
  const isAllowedCloud =
    !isLocal && url.protocol === "https:" && isSupabaseCloud && url.port === "";

  if (url.username || url.password || (!isAllowedLocal && !isAllowedCloud)) {
    throw new Error("URL Supabase non autorisée");
  }

  return new URL(url.origin);
}

export async function probeSupabaseHealth(
  bindings: SupabaseProbeBindings,
  outboundFetch: OutboundFetch = fetch,
): Promise<boolean> {
  const endpoint = new URL(
    "/auth/v1/health",
    assertSafeSupabaseUrl(bindings.SUPABASE_URL),
  );
  const response = await outboundFetch(endpoint, {
    method: "GET",
    headers: {
      accept: "application/json",
      apikey: bindings.SUPABASE_PUBLISHABLE_KEY,
    },
    redirect: "manual",
  });

  const healthy = response.ok;
  await response.body?.cancel();
  return healthy;
}
