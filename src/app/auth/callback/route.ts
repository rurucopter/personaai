import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Exchanges the OAuth/magic-link code for a session, then redirects
 * into the dashboard.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const ref = searchParams.get("ref");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // OAuth signups (Google/Apple) never go through signUpWithPassword's
      // referred_by_code metadata — the referral link's ?ref= only survives
      // as far as this callback URL, so it's applied here instead. Guarded
      // to only ever set referred_by once, and never to the user themselves.
      if (ref && data.user) {
        const service = createServiceRoleClient();
        const { data: referrer } = await service
          .from("users")
          .select("id")
          .eq("referral_code", ref)
          .maybeSingle();

        if (referrer && referrer.id !== data.user.id) {
          await service
            .from("users")
            .update({ referred_by: referrer.id })
            .eq("id", data.user.id)
            .is("referred_by", null);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
