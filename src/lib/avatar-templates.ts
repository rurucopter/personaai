export interface AvatarTemplate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const AVATAR_TEMPLATES: AvatarTemplate[] = [
  {
    id: "talking-banana",
    name: "Banane Rigolote",
    description:
      "Hyper-realistic 3D render of a muscular human body with a bright yellow banana-shaped head replacing the normal head — the banana skin has realistic fruit texture, with bold expressive cartoon eyes and mouth carved into the fruit surface. Strong athletic build, wearing contextual everyday clothing appropriate to the scene. Highly detailed textures on skin, clothes and environment, dramatic cinematic lighting, photorealistic 3D render quality like a AAA video game cutscene. The character looks tough, confident and full of attitude. Completely original character, not based on any existing franchise.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/talking-banana.jpg`,
  },
  {
    id: "talking-strawberry",
    name: "Fraise Complice",
    description:
      "Hyper-realistic 3D render of a muscular human body with a bright red strawberry-shaped head replacing the normal head — the strawberry skin has realistic fruit texture with visible seeds, with bold expressive cartoon eyes and mouth carved into the fruit surface, small green leaves on top. Strong athletic build, wearing contextual everyday clothing appropriate to the scene. Highly detailed textures on skin, clothes and environment, dramatic cinematic lighting, photorealistic 3D render quality like a AAA video game cutscene. The character looks tough, confident and full of attitude. Completely original character, not based on any existing franchise.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/talking-strawberry.jpg`,
  },
  {
    id: "talking-watermelon",
    name: "Pastèque Complice",
    description:
      "Hyper-realistic 3D render of a muscular human body with a round pink-and-green watermelon-shaped head replacing the normal head — the watermelon skin has realistic fruit texture with dark green stripes, with bold expressive cartoon eyes and mouth carved into the fruit surface. Strong athletic build, wearing contextual everyday clothing appropriate to the scene. Highly detailed textures on skin, clothes and environment, dramatic cinematic lighting, photorealistic 3D render quality like a AAA video game cutscene. The character looks tough, confident and full of attitude. Completely original character, not based on any existing franchise.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/talking-watermelon.jpg`,
  },
];

export function getAvatarTemplateById(id: string): AvatarTemplate | undefined {
  return AVATAR_TEMPLATES.find((t) => t.id === id);
}
