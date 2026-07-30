import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Temporary access gate: while PersonaAI is private, only OWNER_EMAIL may
 * use the app past login. Anyone else who signs in (email, Google, Apple)
 * gets signed out immediately. Remove this check when opening up signups.
 */
export async function requireOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const ownerEmail = process.env.OWNER_EMAIL;
  if (ownerEmail && user.email !== ownerEmail) {
    await supabase.auth.signOut();
    redirect("/access-denied");
  }

  return user;
}
