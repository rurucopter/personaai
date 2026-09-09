import { Hero } from "@/components/marketing/hero";
import { Showcase } from "@/components/marketing/showcase";
import { Pricing } from "@/components/marketing/pricing";
import { ReferralPromo } from "@/components/marketing/referral-promo";
import { FAQ } from "@/components/marketing/faq";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Showcase />
      <Pricing />
      <ReferralPromo />
      <FAQ />
    </>
  );
}
