import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

/**
 * Lazily constructs the Stripe client so importing this module never
 * requires STRIPE_SECRET_KEY to be set (e.g. during `next build`, which
 * only collects route modules without invoking them).
 */
export function getStripe(): Stripe {
  if (!stripeSingleton) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) throw new Error("STRIPE_SECRET_KEY is not set");
    stripeSingleton = new Stripe(apiKey);
  }
  return stripeSingleton;
}
