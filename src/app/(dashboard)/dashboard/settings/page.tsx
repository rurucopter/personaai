import { createClient } from "@/lib/supabase/server";
import { AvatarUpload } from "@/components/dashboard/avatar-upload";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { PasswordForm } from "@/components/dashboard/password-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserRow } from "@/types/database";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user!.id)
    .single<UserRow>();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez votre profil et vos préférences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profil</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <AvatarUpload
            avatarUrl={profile?.avatar_url ?? null}
            fallback={(profile?.full_name ?? profile?.email ?? "U").slice(0, 2).toUpperCase()}
          />
          <ProfileForm
            email={profile?.email ?? user!.email ?? ""}
            fullName={profile?.full_name ?? ""}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
