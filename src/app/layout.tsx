import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "@/components/posthog-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "PersonaAI — Une histoire, un style, une vidéo générée par IA",
    template: "%s · PersonaAI",
  },
  description:
    "Écrivez votre histoire, choisissez un style (3D Pixar ou fruit qui parle), et l'IA génère la vidéo entière — avec voix et dialogues. 3 crédits offerts, aucune carte requise.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "PersonaAI",
    title: "PersonaAI — Une histoire, un style, une vidéo générée par IA",
    description:
      "Écrivez votre histoire, choisissez un style (3D Pixar ou fruit qui parle), et l'IA génère la vidéo entière — avec voix et dialogues.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "PersonaAI — Une histoire, un style, une vidéo générée par IA",
    description:
      "Écrivez votre histoire, choisissez un style, et l'IA génère la vidéo entière — avec voix et dialogues.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="top-center" />
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
