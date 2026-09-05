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
      "elegant original 3D animated humanoid character wearing a stylish satin dress, with a stylized bright yellow banana-shaped head, big expressive eyes with lashes, and a warm smile, cozy indoor home setting",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/talking-banana.jpg`,
  },
  {
    id: "talking-strawberry",
    name: "Fraise Complice",
    description:
      "elegant original 3D animated humanoid character wearing a stylish satin dress, with a stylized bright red strawberry-shaped head, big expressive eyes with lashes, and a warm smile, cozy indoor home setting",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/talking-strawberry.jpg`,
  },
  {
    id: "talking-watermelon",
    name: "Pastèque Complice",
    description:
      "elegant original 3D animated humanoid character wearing a stylish satin dress, with a stylized pink-and-green watermelon-shaped head, big expressive eyes with lashes, and a warm smile, cozy indoor home setting",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/talking-watermelon.jpg`,
  },
];

export function getAvatarTemplateById(id: string): AvatarTemplate | undefined {
  return AVATAR_TEMPLATES.find((t) => t.id === id);
}
