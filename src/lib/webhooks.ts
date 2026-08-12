/**
 * Provider webhooks (fal/Replicate) hit us with the service-role client and
 * bypass RLS, so they MUST be authenticated. We can't rely on provider-specific
 * signature schemes without coupling to each provider, so instead we embed a
 * shared secret in the webhook URL we hand the provider at submit time, and
 * verify it here on the way back. The secret lives only in server env
 * (WEBHOOK_SECRET), never NEXT_PUBLIC_.
 */

/**
 * Builds an authenticated webhook URL for the provider to call back, or
 * undefined when webhooks aren't configured (e.g. local dev) — in which case
 * the client-side poll fallback drives status instead. Returning undefined
 * keeps submitJob from registering an unauthenticated webhook.
 */
export function buildWebhookUrl(path: string): string | undefined {
  const base = process.env.NEXT_PUBLIC_APP_URL;
  const secret = process.env.WEBHOOK_SECRET;
  // Only register a webhook when we have a public HTTPS base (prod). Providers
  // can't reach an http://localhost URL and may reject it outright, so in local
  // dev we return undefined and let the client-side poll fallback drive status.
  if (!base || !secret || !base.startsWith("https://")) return undefined;

  const url = new URL(path, base);
  url.searchParams.set("secret", secret);
  return url.toString();
}

/** Verifies an incoming provider webhook carries our shared secret. */
export function isValidWebhookSecret(request: Request): boolean {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) return false;

  const provided = new URL(request.url).searchParams.get("secret");
  return provided === secret;
}
