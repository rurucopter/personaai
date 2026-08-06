import Link from "next/link";

const PRODUCT_LINKS = [
  { href: "#fonctionnement", label: "Comment ça marche" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

const LEGAL_LINKS = [
  { href: "/legal/terms", label: "Conditions d'utilisation" },
  { href: "/legal/privacy", label: "Confidentialité" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold tracking-tight">
            Persona<span className="text-brand">AI</span>
          </span>
          <p className="max-w-xs text-sm text-muted-foreground">
            Transformez votre propre vidéo en n&apos;importe quel personnage,
            grâce à l&apos;IA.
          </p>
        </div>

        <div className="flex gap-16">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">Produit</span>
            {PRODUCT_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">Légal</span>
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} PersonaAI. Tous droits réservés.
      </div>
    </footer>
  );
}
