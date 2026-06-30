import React from "react";
import HeroSection from "@/components/church/HeroSection";
import WelcomeSection from "@/components/church/WelcomeSection";
import WhyChooseUs from "@/components/church/WhyChooseUs";
import TestimonialsCarousel from "@/components/church/TestimonialsCarousel";
import UpcomingEventsTeaser from "@/components/church/UpcomingEventsTeaser";
import GetInvolved from "@/components/church/GetInvolved";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <WelcomeSection />
      <WhyChooseUs />
      <UpcomingEventsTeaser />
      <TestimonialsCarousel />
      <GetInvolved />
    </div>
  );
}