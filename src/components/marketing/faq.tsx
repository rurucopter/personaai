import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/marketing/reveal";

const FAQS = [
  {
    question: "Est-ce que PersonaAI peut usurper l'identité de quelqu'un d'autre ?",
    answer:
      "Non. Les vidéos sont entièrement générées à partir de votre texte — aucune vidéo ou photo d'une vraie personne n'est utilisée.",
  },
  {
    question: "Quelle est la durée des vidéos générées ?",
    answer: "5 ou 10 secondes, au choix, avec dialogues audio générés automatiquement.",
  },
  {
    question: "Comment fonctionnent les crédits ?",
    answer:
      "Chaque génération consomme des crédits selon la durée choisie. Votre abonnement inclut un crédit mensuel, rechargeable à tout moment.",
  },
  {
    question: "Puis-je annuler à tout moment ?",
    answer:
      "Oui, votre abonnement est sans engagement et peut être annulé depuis votre espace de facturation.",
  },
  {
    question: "Quels fournisseurs d'IA sont utilisés ?",
    answer:
      "PersonaAI s'appuie sur Kling, un modèle vidéo IA de pointe, sélectionné pour son réalisme et sa gestion native de l'audio.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="border-t border-border bg-muted/20">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <Reveal className="mb-14 flex flex-col items-center gap-3 text-center">
          <span className="text-xs font-medium tracking-widest text-brand uppercase">
            Questions
          </span>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Questions fréquentes
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <Accordion>
            {FAQS.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
