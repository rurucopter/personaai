import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AvatarPicker } from "@/components/character/avatar-picker";
import { CharacterView } from "@/components/character/character-view";
import { cn } from "@/lib/utils";
import type { CharacterImageRow, CharacterRow } from "@/types/database";

interface CharacterPageProps {
  searchParams: Promise<{ character?: string }>;
}

export default async function CharacterPage({ searchParams }: CharacterPageProps) {
  const { character: characterIdParam } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: characters } = await supabase
    .from("ai_characters")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .returns<CharacterRow[]>();

  const allCharacters = characters ?? [];
  const activeCharacter =
    allCharacters.find((c) => c.id === characterIdParam) ?? allCharacters[0] ?? null;

  const images = activeCharacter
    ? (
        await supabase
          .from("character_images")
          .select("*")
          .eq("character_id", activeCharacter.id)
          .order("created_at", { ascending: false })
          .returns<CharacterImageRow[]>()
      ).data ?? []
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Personnage IA</h1>
        <p className="text-muted-foreground">
          Un personnage fictif au visage cohérent, pour du contenu lifestyle.
        </p>
      </div>

      {allCharacters.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {allCharacters.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/character?character=${c.id}`}
              className={cn(
                "flex items-center gap-2 rounded-full border py-1.5 pr-4 pl-1.5 text-sm transition-colors",
                c.id === activeCharacter?.id
                  ? "border-primary bg-secondary/60"
                  : "border-border hover:bg-secondary/30"
              )}
            >
              <div className="size-7 shrink-0 overflow-hidden rounded-full bg-secondary/30">
                {c.reference_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.reference_image_url}
                    alt={c.name}
                    className="size-full object-cover"
                  />
                )}
              </div>
              <span className="font-medium">{c.name}</span>
            </Link>
          ))}
        </div>
      )}

      {activeCharacter && <CharacterView character={activeCharacter} initialImages={images} />}

      <AvatarPicker
        title={allCharacters.length > 0 ? "Ajouter un autre avatar" : "Choisissez votre avatar"}
      />
    </div>
  );
}
