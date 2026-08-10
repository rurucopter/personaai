import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutButton, ManageBillingButton } from "@/components/billing/billing-actions";
import { PLAN_CONFIG, type BillablePlan } from "@/lib/stripe/plans";
import { cn } from "@/lib/utils";
import type { PaymentRow, SubscriptionRow } from "@/types/database";

const STATUS_LABEL: Record<SubscriptionRow["status"], string> = {
  active: "Actif",
  trialing: "Essai",
  past_due: "Paiement en retard",
  canceled: "Annulé",
  incomplete: "Incomplet",
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  paid: "Payé",
  pending: "En attente",
  failed: "Échoué",
  refunded: "Remboursé",
};

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: subscription }, { data: payments }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle<SubscriptionRow>(),
    supabase
      .from("payments")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .returns<PaymentRow[]>(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Facturation</h1>
        <p className="text-muted-foreground">
          Abonnement, crédits et historique de paiement.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Abonnement</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          {subscription ? (
            <div className="flex items-center gap-3">
              <span className="font-medium">{PLAN_CONFIG[subscription.plan as BillablePlan]?.label ?? subscription.plan}</span>
              <Badge variant="secondary">{STATUS_LABEL[subscription.status]}</Badge>
              {subscription.cancel_at_period_end && (
                <span className="text-sm text-muted-foreground">
                  Se termine le{" "}
                  {subscription.current_period_end &&
                    new Date(subscription.current_period_end).toLocaleDateString("fr-FR")}
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun abonnement actif.</p>
          )}
          {subscription && <ManageBillingButton />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Changer de plan</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(Object.keys(PLAN_CONFIG) as BillablePlan[]).map((plan) => {
            const isCurrent = subscription?.plan === plan && subscription.status === "active";
            return (
              <div
                key={plan}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border p-4",
                  isCurrent ? "border-brand/50 bg-brand/5" : "border-border"
                )}
              >
                <p className="font-medium">{PLAN_CONFIG[plan].label}</p>
                <p className="text-sm text-muted-foreground">
                  {PLAN_CONFIG[plan].monthlyCredits} crédits / mois
                </p>
                {isCurrent ? (
                  <Button variant="outline" disabled>
                    Plan actuel
                  </Button>
                ) : (
                  <CheckoutButton plan={plan} label="Choisir" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historique de paiement</CardTitle>
        </CardHeader>
        <CardContent>
          {payments && payments.length > 0 ? (
            <div className="flex flex-col divide-y divide-border">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-3">
                  <span className="text-sm">
                    {new Date(payment.created_at).toLocaleDateString("fr-FR")}
                  </span>
                  <span className="text-sm font-medium">
                    {(payment.amount_cents / 100).toFixed(2)} {payment.currency.toUpperCase()}
                  </span>
                  <Badge variant="secondary">
                    {PAYMENT_STATUS_LABEL[payment.status] ?? payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun paiement pour le moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
