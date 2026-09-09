export interface AvatarTemplate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const FRUIT_STYLE =
  "Premium 3D animated character in the style of a Pixar or DreamWorks film — polished, cinematic, richly detailed. The character has a human body with realistic proportions, human-like expressive eyes, nose, and mouth, but the entire skin of the face and head has the color and texture of the fruit (not a mask — the skin IS the fruit). The character can have human hair. Clothing adapts to the story context. Environment is detailed and matches the scene. Dramatic cinematic lighting, professional 3D animation quality. Expressive, full of personality and attitude. Completely original character design, not based on any existing franchise or creator's series.";

export const AVATAR_TEMPLATES: AvatarTemplate[] = [
  {
    id: "talking-banana",
    name: "Banane Rigolote",
    description:
      `A character with bright yellow banana-textured skin covering their entire head and face, with a slightly elongated head shape. Human eyes, nose, and mouth visible through the yellow fruit-textured skin. Strong muscular build. ${FRUIT_STYLE}`,
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/talking-banana.jpg`,
  },
  {
    id: "talking-strawberry",
    name: "Fraise Complice",
    description:
      `A character with bright red strawberry-textured skin with visible seeds covering their entire head and face, small green leaves sprouting from the top of the head. Human eyes, nose, and mouth visible through the red fruit-textured skin. Can have human hair alongside the fruit texture. ${FRUIT_STYLE}`,
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/talking-strawberry.jpg`,
  },
  {
    id: "talking-watermelon",
    name: "Pastèque Complice",
    description:
      `A character with green watermelon-textured skin with dark stripes covering their entire head and face, a round head shape. Human eyes, nose, and mouth visible through the green fruit-textured skin. Strong muscular build. ${FRUIT_STYLE}`,
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/talking-watermelon.jpg`,
  },
  {
    id: "talking-coconut",
    name: "Coco Tranquille",
    description:
      `A character with brown coconut-textured skin covering their entire head and face, with a small palm tree leaf sprouting from the top. Human eyes, nose, and mouth visible through the brown fruit-textured skin. Relaxed, chill attitude. ${FRUIT_STYLE}`,
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/talking-coconut.jpg`,
  },
];

export function getAvatarTemplateById(id: string): AvatarTemplate | undefined {
  return AVATAR_TEMPLATES.find((t) => t.id === id);
}
