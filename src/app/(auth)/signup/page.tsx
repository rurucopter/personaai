"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signUpWithPassword } from "@/lib/auth/actions";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { SubmitButton } from "@/components/auth/submit-button";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function SignupForm() {
  const [state, formAction] = useActionState(signUpWithPassword, {});
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRequired = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Créer un compte</CardTitle>
        <CardDescription>
          3 crédits offerts pour tester votre première transformation.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <OAuthButtons refCode={ref} />

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">ou</span>
          <Separator className="flex-1" />
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          {ref && <input type="hidden" name="ref" value={ref} />}
          <div className="flex flex-col gap-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input id="fullName" name="fullName" type="text" required autoComplete="name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <input type="hidden" name="captchaToken" value={captchaToken ?? ""} />
          <TurnstileWidget onVerify={setCaptchaToken} />

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <SubmitButton disabled={captchaRequired && !captchaToken}>
            Créer mon compte
          </SubmitButton>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-foreground underline">
            Se connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
