import { TutorialProvider } from "./_components/context";
import { TutorialIntro } from "./_components/intro";
import { TutorialSteps } from "./_components/steps";

export function TutorialSection() {
  return (
    <section id="how-to-play" className="relative bg-background">
      <TutorialProvider>
        <TutorialIntro />
        <TutorialSteps />
      </TutorialProvider>
    </section>
  );
}
