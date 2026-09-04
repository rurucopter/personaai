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
    default: "PersonaAI — Transformez-vous en n'importe quel personnage",
    template: "%s · PersonaAI",
  },
  description:
    "Importez une vidéo de vous-même et transformez votre apparence, votre style et votre énergie grâce à l'IA, tout en conservant votre identité.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "PersonaAI",
    title: "PersonaAI — Transformez-vous en n'importe quel personnage",
    description:
      "Importez une vidéo de vous-même et transformez votre style et votre univers grâce à l'IA, tout en conservant votre identité.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "PersonaAI — Transformez-vous en n'importe quel personnage",
    description:
      "Importez une vidéo de vous-même et transformez votre style et votre univers grâce à l'IA.",
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
