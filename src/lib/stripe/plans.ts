export type BillablePlan = "starter" | "pro" | "business";

export const PLAN_CONFIG: Record<
  BillablePlan,
  { label: string; monthlyCredits: number; priceId: string | undefined }
> = {
  starter: {
    label: "Starter",
    monthlyCredits: 8,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
  },
  pro: {
    label: "Pro",
    monthlyCredits: 18,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
  },
  business: {
    label: "Business",
    monthlyCredits: 40,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS,
  },
};

export function getPlanByPriceId(priceId: string): BillablePlan | undefined {
  return (Object.keys(PLAN_CONFIG) as BillablePlan[]).find(
    (plan) => PLAN_CONFIG[plan].priceId === priceId
  );
}
