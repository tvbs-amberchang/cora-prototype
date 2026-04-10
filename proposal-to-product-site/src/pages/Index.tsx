import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import PainPointsSection from "@/components/PainPointsSection";
import ArchitectureSection from "@/components/ArchitectureSection";
import FeaturesSection from "@/components/FeaturesSection";
import ScenariosSection from "@/components/ScenariosSection";
import AITeamSection from "@/components/AITeamSection";
import RoadmapSection from "@/components/RoadmapSection";
import ValueSection from "@/components/ValueSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <NavBar />
      <HeroSection />
      <PainPointsSection />
      <ArchitectureSection />
      <FeaturesSection />
      <ScenariosSection />
      <AITeamSection />
      <RoadmapSection />
      <ValueSection />
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p className="font-heading font-semibold text-foreground mb-2">CORA</p>
          <p>Own the Data, Own the Customer.</p>
          <p className="mt-1">© 2026 TVBS — AI Hackathon 提案</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
