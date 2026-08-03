import { createClient } from "@/lib/supabase/server";
import { AvatarPicker } from "@/components/character/avatar-picker";
import { CharacterView } from "@/components/character/character-view";
import type { CharacterImageRow, CharacterRow } from "@/types/database";

export default async function CharacterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: character } = await supabase
    .from("ai_characters")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<CharacterRow>();

  const images = character
    ? (
        await supabase
          .from("character_images")
          .select("*")
          .eq("character_id", character.id)
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

      {character ? (
        <CharacterView character={character} initialImages={images} />
      ) : (
        <AvatarPicker />
      )}
    </div>
  );
}
