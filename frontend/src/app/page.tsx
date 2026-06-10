import HeroSection from '@/components/Home/HeroSection';
import TrustBanner from '@/components/Home/TrustBanner';
import ScrapBatteryBanner from '@/components/Home/ScrapBatteryBanner';
import ServicesSection from '@/components/Home/ServicesSection';
import HowItWorksSection from '@/components/Home/HowItWorksSection';
import StatsSection from '@/components/Home/StatsSection';
import CoverageSection from '@/components/Home/CoverageSection';
import SuccessStoriesSection from '@/components/Home/SuccessStoriesSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustBanner />
      <ScrapBatteryBanner />
      <ServicesSection />
      <HowItWorksSection />
      <StatsSection />
      <CoverageSection />
      <SuccessStoriesSection />
    </>
  );
}
