"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/auth/profile-actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileFormProps {
  email: string;
  fullName: string;
}

export function ProfileForm({ email, fullName }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateProfile, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="fullName">Nom</Label>
        <Input id="fullName" name="fullName" defaultValue={fullName} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <SubmitButton>Enregistrer</SubmitButton>
    </form>
  );
}
