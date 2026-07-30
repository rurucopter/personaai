import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { PLAN_CONFIG, type BillablePlan } from "@/lib/stripe/plans";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { plan } = (await request.json()) as { plan: BillablePlan };
  const config = PLAN_CONFIG[plan];

  if (!config?.priceId) {
    return NextResponse.json({ error: "Plan invalide." }, { status: 400 });
  }

  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: existingSub?.stripe_customer_id,
    customer_email: existingSub?.stripe_customer_id ? undefined : user.email ?? undefined,
    client_reference_id: user.id,
    line_items: [{ price: config.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?checkout=cancelled`,
    metadata: { user_id: user.id, plan },
    subscription_data: { metadata: { user_id: user.id, plan } },
  });

  return NextResponse.json({ url: session.url });
}
