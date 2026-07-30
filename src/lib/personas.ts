export interface Persona {
  id: string;
  label: string;
  category: string;
  description: string;
}

export const PERSONA_CATEGORIES = [
  "Carrière",
  "Lifestyle",
  "Univers imaginaires",
  "Cinéma",
] as const;

export const PERSONAS: Persona[] = [
  // Carrière
  { id: "ceo", label: "CEO", category: "Carrière", description: "Costume impeccable, présence de dirigeant." },
  { id: "entrepreneur", label: "Entrepreneur", category: "Carrière", description: "Énergique, moderne, orienté action." },
  { id: "influenceur", label: "Influenceur", category: "Carrière", description: "Look soigné, très réseaux sociaux." },
  { id: "commercial", label: "Commercial", category: "Carrière", description: "Confiant, tenue professionnelle." },
  { id: "conferencier", label: "Conférencier", category: "Carrière", description: "Charismatique, posture de scène." },
  { id: "coach", label: "Coach", category: "Carrière", description: "Bienveillant, énergie motivante." },
  { id: "athlete", label: "Athlète", category: "Carrière", description: "Sportif, silhouette dynamique." },
  { id: "acteur", label: "Acteur", category: "Carrière", description: "Expressif, présence cinématographique." },
  { id: "streamer", label: "Streamer", category: "Carrière", description: "Décontracté, ambiance gaming." },
  { id: "createur-youtube", label: "Créateur YouTube", category: "Carrière", description: "Expressif, énergie de vidéaste." },

  // Lifestyle
  { id: "business-luxe", label: "Business Luxe", category: "Lifestyle", description: "Élégance haut de gamme." },
  { id: "old-money", label: "Old Money", category: "Lifestyle", description: "Classique, discret, intemporel." },

  // Univers imaginaires
  { id: "cyberpunk", label: "Cyberpunk", category: "Univers imaginaires", description: "Néons, futur urbain." },
  { id: "anime", label: "Anime", category: "Univers imaginaires", description: "Style animation japonaise." },
  { id: "viking", label: "Viking", category: "Univers imaginaires", description: "Guerrier nordique." },
  { id: "chevalier", label: "Chevalier", category: "Univers imaginaires", description: "Armure médiévale." },
  { id: "samourai", label: "Samouraï", category: "Univers imaginaires", description: "Guerrier japonais traditionnel." },
  { id: "science-fiction", label: "Science-fiction", category: "Univers imaginaires", description: "Esthétique futuriste." },

  // Cinéma
  { id: "film-hollywood", label: "Film Hollywood", category: "Cinéma", description: "Grand écran, lumière cinéma." },
  { id: "documentaire-netflix", label: "Documentaire Netflix", category: "Cinéma", description: "Ton documentaire premium." },
];

export function getPersonasByCategory(category: string): Persona[] {
  return PERSONAS.filter((p) => p.category === category);
}

export function getPersonaById(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}
