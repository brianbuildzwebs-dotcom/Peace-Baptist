import React from "react";
import HeroSection from "@/components/church/HeroSection";
import ScriptureBanner from "@/components/church/ScriptureBanner";
import WelcomeSection from "@/components/church/WelcomeSection";
import WhyChooseUs from "@/components/church/WhyChooseUs";
import UpcomingEventsTeaser from "@/components/church/UpcomingEventsTeaser";
import TestimonialsCarousel from "@/components/church/TestimonialsCarousel";
import PlanYourVisit from "@/components/church/PlanYourVisit";
import GetInvolved from "@/components/church/GetInvolved";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ScriptureBanner />
      <WelcomeSection />
      <WhyChooseUs />
      <UpcomingEventsTeaser />
      <TestimonialsCarousel />
      <PlanYourVisit />
      <GetInvolved />
    </div>
  );
}