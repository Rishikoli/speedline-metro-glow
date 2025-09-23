import HeroSection from "@/components/HeroSection";
import FeatureCards from "@/components/FeatureCards";
import MetricsSection from "@/components/MetricsSection";
import DataStream from "@/components/DataStream";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <MetricsSection />
      <FeatureCards />
      <DataStream />
      <Footer />
    </div>
  );
};

export default Index;
