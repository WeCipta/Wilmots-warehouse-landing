import { Benefit } from "@/app/(landing)/_components/benefit";
import { CreatedBy } from "@/app/(landing)/_components/created-by";
import { Description } from "@/app/(landing)/_components/description";
import { Hero } from "@/app/(landing)/_components/hero";
import { LoadingScreen } from "@/app/(landing)/_components/loading-screen";
import Tutorial from "./_components/tutorial";
import Footer from "./_components/footer";
import { Gallery } from "./_components/gallery";
import { Testimonials } from "./_components/testimonials";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <LoadingScreen />
      <Hero />
      <CreatedBy />
      <Description />
      <Benefit />
      <Tutorial />
      <Gallery />
      <Testimonials />
      <Footer/>
    </main>
  );
}
