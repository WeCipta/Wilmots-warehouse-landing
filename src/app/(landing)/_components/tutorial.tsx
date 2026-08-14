import { TutorialProvider } from "./tutorial-context";
import { TutorialIntro } from "./tutorial-intro";
import { TutorialSteps } from "./tutorial-steps";

export default function Tutorial() {
  return (
    <section id="how-to-play" className="relative bg-background">
      <TutorialProvider>
        <TutorialIntro />
        <TutorialSteps />
      </TutorialProvider>
    </section>
  );
}
