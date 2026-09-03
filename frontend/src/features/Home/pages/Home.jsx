import Hero from "../components/Hero";
import QuickActions from "../components/QuickActions";
import TopCategories from "../components/TopCategories";
import NearbyClinics from "../components/NearbyClinics";
import SymptomCtaBanner from "../components/SymptomCtaBanner";
import TrustBar from "../components/TrustBar";

export default function Home() {
  return (
    <main>
      <Hero />
      <QuickActions />
      <TopCategories />
      <NearbyClinics />
      <SymptomCtaBanner />
      <TrustBar />
    </main>
  );
}
