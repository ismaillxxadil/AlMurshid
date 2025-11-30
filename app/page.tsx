import { Navbar } from "@/components/Navbar";
import { StatsStrip } from "@/components/StatsStrip";
import { CoreModules } from "@/components/CoreModules";
import HeroSectionLandingPage from "@/components/HeroSectionLandingPage";
import FeatureSection from "@/components/FeatureSection";
import CATSection from "@/components/CATSection";
import { Footer } from "@/components/Footer";

export default function page() {
  return (
    <div
      className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)] font-sans selection:bg-[var(--color-ink)] selection:text-[var(--color-bg)] overflow-x-hidden"
      dir="rtl"
    >
      <Navbar />
      <HeroSectionLandingPage />
      <StatsStrip />
      <CoreModules />
      <FeatureSection />
      <CATSection />
      <Footer />
    </div>
  );
}
