export interface Persona {
  id: string;
  label: string;
  category: string;
  description: string;
  /** Rich English scene description used to build the AI generation prompt. */
  promptDescription: string;
}

export const PERSONA_CATEGORIES = [
  "Carrière",
  "Lifestyle",
  "Univers imaginaires",
  "Cinéma",
] as const;

export const PERSONAS: Persona[] = [
  // Carrière
  {
    id: "ceo",
    label: "CEO",
    category: "Carrière",
    description: "Costume impeccable, présence de dirigeant.",
    promptDescription:
      "a confident company CEO in an impeccably tailored dark suit, commanding boardroom presence, calm authoritative posture",
  },
  {
    id: "entrepreneur",
    label: "Entrepreneur",
    category: "Carrière",
    description: "Énergique, moderne, orienté action.",
    promptDescription:
      "a modern, energetic startup entrepreneur in smart casual attire, sharp and driven, standing in a bright contemporary office",
  },
  {
    id: "influenceur",
    label: "Influenceur",
    category: "Carrière",
    description: "Look soigné, très réseaux sociaux.",
    promptDescription:
      "a polished social media influencer with a trendy, camera-ready look, soft flattering light, effortless confident charisma",
  },
  {
    id: "commercial",
    label: "Commercial",
    category: "Carrière",
    description: "Confiant, tenue professionnelle.",
    promptDescription:
      "a confident sales professional in sharp business attire, approachable and persuasive demeanor",
  },
  {
    id: "conferencier",
    label: "Conférencier",
    category: "Carrière",
    description: "Charismatique, posture de scène.",
    promptDescription:
      "a charismatic public speaker on a conference stage, commanding stage presence, dramatic stage lighting",
  },
  {
    id: "coach",
    label: "Coach",
    category: "Carrière",
    description: "Bienveillant, énergie motivante.",
    promptDescription:
      "a warm, approachable life coach with motivating, encouraging energy, friendly open body language",
  },
  {
    id: "athlete",
    label: "Athlète",
    category: "Carrière",
    description: "Sportif, silhouette dynamique.",
    promptDescription:
      "an athletic person in sportswear, toned dynamic physique, energetic gym or stadium atmosphere",
  },
  {
    id: "acteur",
    label: "Acteur",
    category: "Carrière",
    description: "Expressif, présence cinématographique.",
    promptDescription:
      "a film actor with expressive presence, cinematic dramatic lighting, shallow depth of field",
  },
  {
    id: "streamer",
    label: "Streamer",
    category: "Carrière",
    description: "Décontracté, ambiance gaming.",
    promptDescription:
      "a casual gaming streamer in a cozy RGB-lit gaming room, relaxed and animated expression",
  },
  {
    id: "createur-youtube",
    label: "Créateur YouTube",
    category: "Carrière",
    description: "Expressif, énergie de vidéaste.",
    promptDescription:
      "an expressive YouTube content creator with lively energy, bright colorful studio background",
  },

  // Lifestyle
  {
    id: "business-luxe",
    label: "Business Luxe",
    category: "Lifestyle",
    description: "Élégance haut de gamme.",
    promptDescription:
      "a person in luxurious high-end business attire, refined upscale interior, elegant understated wealth",
  },
  {
    id: "old-money",
    label: "Old Money",
    category: "Lifestyle",
    description: "Classique, discret, intemporel.",
    promptDescription:
      "a person in classic, timeless old-money style clothing, quietly refined estate setting, soft natural light",
  },

  // Univers imaginaires
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    category: "Univers imaginaires",
    description: "Néons, futur urbain.",
    promptDescription:
      "a person in cyberpunk streetwear, neon-lit futuristic city backdrop, moody colorful reflections",
  },
  {
    id: "anime",
    label: "Anime",
    category: "Univers imaginaires",
    description: "Style animation japonaise.",
    promptDescription:
      "a person restyled in vibrant Japanese anime art style, bold colors and clean linework",
  },
  {
    id: "viking",
    label: "Viking",
    category: "Univers imaginaires",
    description: "Guerrier nordique.",
    promptDescription:
      "a rugged Nordic Viking warrior in fur and leather armor, wind-swept, dramatic outdoor lighting",
  },
  {
    id: "chevalier",
    label: "Chevalier",
    category: "Univers imaginaires",
    description: "Armure médiévale.",
    promptDescription:
      "a medieval knight in polished armor, castle backdrop, dramatic cinematic lighting",
  },
  {
    id: "samourai",
    label: "Samouraï",
    category: "Univers imaginaires",
    description: "Guerrier japonais traditionnel.",
    promptDescription:
      "a traditional Japanese samurai warrior in authentic armor, calm focused presence, moody atmosphere",
  },
  {
    id: "science-fiction",
    label: "Science-fiction",
    category: "Univers imaginaires",
    description: "Esthétique futuriste.",
    promptDescription:
      "a person in sleek futuristic sci-fi attire, spaceship interior backdrop, cool dramatic lighting",
  },

  // Cinéma
  {
    id: "film-hollywood",
    label: "Film Hollywood",
    category: "Cinéma",
    description: "Grand écran, lumière cinéma.",
    promptDescription:
      "a person shot like a Hollywood movie lead, dramatic cinema lighting, film-grade color grading",
  },
  {
    id: "documentaire-netflix",
    label: "Documentaire Netflix",
    category: "Cinéma",
    description: "Ton documentaire premium.",
    promptDescription:
      "a person shot in a premium Netflix-style documentary look, natural muted tones, realistic interview lighting",
  },

  // Style
  {
    id: "pixar-3d",
    label: "Style 3D Pixar",
    category: "Style",
    description: "Personnage animé 3D façon film Pixar, rendu cinéma, yeux expressifs.",
    promptDescription:
      "restyled as a high-quality 3D animated character in a warm modern Pixar/Disney-style CG movie look — smooth semi-realistic skin shading, soft rounded features, big expressive eyes, polished cinematic 3D render, soft warm lighting like a premium animated film",
  },
];

export function getPersonasByCategory(category: string): Persona[] {
  return PERSONAS.filter((p) => p.category === category);
}

export function getPersonaById(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}
