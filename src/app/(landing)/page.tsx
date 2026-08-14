import { Description } from "@/app/(landing)/_components/description";
import { Hero } from "@/app/(landing)/_components/hero";
import { LoadingScreen } from "@/app/(landing)/_components/loading-screen";
import Tutorial from "./_components/tutorial";
import Footer from "./_components/footer";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <LoadingScreen />
      <Hero />
      <Description />
      <Tutorial />
      <Footer/>
    </main>
  );
}
