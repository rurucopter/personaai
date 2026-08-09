import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getPlanByPriceId, PLAN_CONFIG } from "@/lib/stripe/plans";

async function grantMonthlyCredits(userId: string, amount: number) {
  const supabase = createServiceRoleClient();
  const { data: credits } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (credits) {
    await supabase
      .from("credits")
      .update({ balance: credits.balance + amount, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
  } else {
    await supabase.from("credits").insert({ user_id: userId, balance: amount });
  }

  await supabase.from("credit_transactions").insert({
    user_id: userId,
    amount,
    type: "subscription_grant",
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // Claim this event before doing any work. Stripe retries deliveries, so
  // without this a retried checkout/invoice event would grant credits twice
  // (grantMonthlyCredits is a plain additive). A PK conflict = already handled.
  const { error: claimError } = await supabase
    .from("processed_stripe_events")
    .insert({ event_id: event.id });

  if (claimError) {
    if (claimError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    // Transient error claiming the event — let Stripe retry rather than risk
    // processing without the idempotency guard in place.
    console.error("stripe event claim failed:", claimError);
    return NextResponse.json({ error: "Claim failed." }, { status: 500 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id ?? session.client_reference_id;
      if (!userId || !session.subscription || !session.customer) break;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      const item = subscription.items.data[0];
      const priceId = item?.price.id;
      const plan = priceId ? getPlanByPriceId(priceId) : undefined;

      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          plan: plan ?? "starter",
          status: subscription.status,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          current_period_end: item?.current_period_end
            ? new Date(item.current_period_end * 1000).toISOString()
            : null,
          cancel_at_period_end: subscription.cancel_at_period_end,
        },
        { onConflict: "stripe_subscription_id" }
      );

      if (plan) {
        await grantMonthlyCredits(userId, PLAN_CONFIG[plan].monthlyCredits);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const periodEnd = subscription.items.data[0]?.current_period_end;
      await supabase
        .from("subscriptions")
        .update({
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: periodEnd
            ? new Date(periodEnd * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.parent?.subscription_details?.subscription;
      if (!subscriptionId) break;

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("user_id, plan")
        .eq("stripe_subscription_id", subscriptionId as string)
        .maybeSingle();

      if (sub) {
        const { error: paymentError } = await supabase.from("payments").insert({
          user_id: sub.user_id,
          stripe_invoice_id: invoice.id,
          amount_cents: invoice.amount_paid,
          currency: invoice.currency,
          status: "paid",
        });
        // A duplicate stripe_invoice_id (unique) is fine; log anything else.
        if (paymentError && paymentError.code !== "23505") {
          console.error("payments insert failed:", paymentError);
        }

        // Renewal (not the first invoice, already handled by checkout.session.completed)
        if (invoice.billing_reason === "subscription_cycle") {
          await grantMonthlyCredits(sub.user_id, PLAN_CONFIG[sub.plan as keyof typeof PLAN_CONFIG].monthlyCredits);
        }
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.parent?.subscription_details?.subscription;
      if (!subscriptionId) break;

      await supabase
        .from("subscriptions")
        .update({ status: "past_due", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", subscriptionId as string);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
