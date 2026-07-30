import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingPage() {
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
          <CardTitle className="text-base">Aucun abonnement actif</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          L&apos;intégration Stripe (plans Starter / Pro / Business / Entreprise)
          arrive dans une prochaine phase.
        </CardContent>
      </Card>
    </div>
  );
}
