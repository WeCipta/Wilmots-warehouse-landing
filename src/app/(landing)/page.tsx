import { WhatYouGetSection } from "./_components/what-you-get-section";
import { CreatedBySection } from "./_components/created-by-section";
import { DescriptionSection } from "./_components/description-section";
import { FooterSection } from "./_components/footer-section";
import { GallerySection } from "./_components/gallery-section";
import { HeroSection } from "./_components/hero-section";
import { TestimonialsSection } from "./_components/testimonials-section";
import { TutorialSection } from "./_components/tutorial-section";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <HeroSection />
      <CreatedBySection />
      <DescriptionSection />
      <WhatYouGetSection />
      <TutorialSection />
      <GallerySection />
      <TestimonialsSection />
      <FooterSection />
    </main>
  );
}
