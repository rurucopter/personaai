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
      "Non. Chaque transformation ne s'applique qu'à la vidéo que vous importez vous-même. PersonaAI ne permet pas de transformer la vidéo d'une autre personne.",
  },
  {
    question: "Quels formats de vidéo sont acceptés ?",
    answer: "MP4, MOV et WEBM, jusqu'à 200 Mo par fichier.",
  },
  {
    question: "Comment fonctionnent les crédits ?",
    answer:
      "Chaque génération consomme des crédits selon la qualité choisie. Votre abonnement inclut un crédit mensuel, rechargeable à tout moment.",
  },
  {
    question: "Puis-je annuler à tout moment ?",
    answer:
      "Oui, votre abonnement est sans engagement et peut être annulé depuis votre espace de facturation.",
  },
  {
    question: "Quels fournisseurs d'IA sont utilisés ?",
    answer:
      "PersonaAI s'appuie sur des modèles vidéo IA de pointe (Fal.ai, Replicate, Runway, Luma) sélectionnés pour leur réalisme.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="border-t border-white/10 bg-white/[0.015]">
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
