import { Hero } from "@/components/marketing/hero";
import { TrustBar } from "@/components/marketing/trust-bar";
import { Features } from "@/components/marketing/features";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { BeforeAfter } from "@/components/marketing/before-after";
import { UseCases } from "@/components/marketing/use-cases";
import { Pricing } from "@/components/marketing/pricing";
import { FAQ } from "@/components/marketing/faq";
import { FinalCTA } from "@/components/marketing/final-cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Features />
      <HowItWorks />
      <BeforeAfter />
      <UseCases />
      <Pricing />
      <FAQ />
      <FinalCTA />
    </>
  );
}
