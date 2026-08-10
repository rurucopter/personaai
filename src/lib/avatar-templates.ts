export interface AvatarTemplate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const AVATAR_TEMPLATES: AvatarTemplate[] = [
  {
    id: "blonde-lifestyle",
    name: "Léa",
    description:
      "26 ans, blonde, style naturel-élégant, lifestyle Sud de la France (plages, marchés provençaux, terrasses).",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/blonde-lifestyle.jpg`,
  },
  {
    id: "brunette-lifestyle",
    name: "Camille",
    description:
      "27 ans, brune, style urbain chic, lifestyle citadin (cafés, mode, quotidien parisien).",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/brunette-lifestyle.jpg`,
  },
  {
    id: "curly-everyday",
    name: "Manon",
    description:
      "34 ans, cheveux bouclés châtains mi-longs, visage ordinaire du quotidien, sans maquillage, traits naturellement asymétriques, quelques petites imperfections de peau, look décontracté de tous les jours.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/curly-everyday.jpg`,
  },
  {
    id: "round-face-casual",
    name: "Julie",
    description:
      "41 ans, cheveux châtains raides mi-longs, visage rond, sourire légèrement de travers, petites rides d'expression visibles, style simple et décontracté, allure très ordinaire.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/round-face-casual.jpg`,
  },
  {
    id: "redhead-freckles",
    name: "Élise",
    description:
      "23 ans, rousse, cheveux mi-longs légèrement ébouriffés, nombreuses taches de rousseur, dents légèrement irrégulières, look étudiante décontractée sans maquillage.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/redhead-freckles.jpg`,
  },
  {
    id: "short-hair-natural",
    name: "Nadia",
    description:
      "29 ans, cheveux noirs raides courts, peau mate, traits naturellement asymétriques, expression neutre et détendue, style casual sans retouche, look très naturel.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/short-hair-natural.jpg`,
  },
  {
    id: "student-young-man",
    name: "Lucas",
    description:
      "19 ans, cheveux bruns en bataille, légère acné, barbe naissante clairsemée, look étudiant décontracté.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/student-young-man.jpg`,
  },
  {
    id: "blond-stubble-man",
    name: "Hugo",
    description:
      "24 ans, cheveux blonds courts, barbe de trois jours, t-shirt simple, allure ordinaire de tous les jours.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/blond-stubble-man.jpg`,
  },
  {
    id: "asian-glasses-man",
    name: "Kenji",
    description:
      "28 ans, asiatique, cheveux noirs courts, lunettes simples, expression neutre, look bureau décontracté.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/asian-glasses-man.jpg`,
  },
  {
    id: "beard-casual-man",
    name: "Karim",
    description:
      "35 ans, maghrébin, barbe courte foncée, cheveux noirs courts, allure décontractée et ordinaire.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/beard-casual-man.jpg`,
  },
  {
    id: "balding-dad",
    name: "David",
    description:
      "43 ans, calvitie naissante, léger double menton, expression fatiguée et sympathique, look père de famille.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/balding-dad.jpg`,
  },
  {
    id: "greying-mature-man",
    name: "Philippe",
    description:
      "52 ans, cheveux poivre et sel, rides du front et des yeux visibles, chemise simple, allure mûre et ordinaire.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/greying-mature-man.jpg`,
  },
  {
    id: "senior-black-man",
    name: "Samuel",
    description:
      "60 ans, afro-descendant, cheveux gris courts et barbe grise courte, expression chaleureuse, tenue simple.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/senior-black-man.jpg`,
  },
  {
    id: "elderly-man",
    name: "Roger",
    description:
      "70 ans, cheveux blancs clairsemés, lunettes, rides marquées et taches de vieillesse, expression douce.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/elderly-man.jpg`,
  },
  {
    id: "teen-braces-woman",
    name: "Chloé",
    description:
      "19 ans, cheveux longs raides, appareil dentaire, maquillage minimal, look étudiante ordinaire.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/teen-braces-woman.jpg`,
  },
  {
    id: "asian-fringe-woman",
    name: "Mei",
    description:
      "26 ans, asiatique, cheveux noirs avec frange droite, sans maquillage, pull simple, allure ordinaire.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/asian-fringe-woman.jpg`,
  },
  {
    id: "afro-natural-woman",
    name: "Fatou",
    description:
      "31 ans, afro-descendante, cheveux naturels afro, sans maquillage, haut simple, allure de tous les jours.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/afro-natural-woman.jpg`,
  },
  {
    id: "midlife-woman",
    name: "Sylvie",
    description:
      "48 ans, cheveux mi-longs teints avec racines grises, rides d'expression visibles, chemisier simple.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/midlife-woman.jpg`,
  },
  {
    id: "short-grey-woman",
    name: "Martine",
    description:
      "56 ans, cheveux gris courts, lunettes, rides douces, gilet simple, allure mûre et ordinaire.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/short-grey-woman.jpg`,
  },
  {
    id: "senior-woman",
    name: "Josiane",
    description:
      "64 ans, cheveux blancs bouclés courts, visage ridé et chaleureux, tenue simple, allure de grand-mère.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/senior-woman.jpg`,
  },
  {
    id: "elderly-woman",
    name: "Yvette",
    description:
      "73 ans, cheveux blancs fins, rides profondes et taches de vieillesse, expression douce, chemisier simple.",
    imageUrl: `${SUPABASE_URL}/storage/v1/object/public/avatar-templates/elderly-woman.jpg`,
  },
];

export function getAvatarTemplateById(id: string): AvatarTemplate | undefined {
  return AVATAR_TEMPLATES.find((t) => t.id === id);
}
