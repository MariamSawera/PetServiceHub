import Hero from "../components/Hero";
import QuickActions from "../components/QuickActions";
import NearbyClinics from "../components/NearbyClinics";
import TopRatedVets from "../components/TopRatedVets";
import SymptomCtaBanner from "../components/SymptomCtaBanner";
import TrustBar from "../components/TrustBar";

export default function Home() {
  return (
    <main>
      <Hero />
      <QuickActions />
      <div className="grid items-stretch lg:grid-cols-[minmax(0,3fr)_minmax(250px,1fr)]">
        <NearbyClinics />
        <TopRatedVets />
      </div>
      <SymptomCtaBanner />
      <TrustBar />
    </main>
  );
}
