import { Hero } from "@/app/(landing)/_components/hero";
import { LoadingScreen } from "@/app/(landing)/_components/loading-screen";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <LoadingScreen />
      <Hero />
    </main>
  );
}
