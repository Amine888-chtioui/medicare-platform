import React from 'react';
import { HeroSection } from '@/components/public/HeroSection';
import { ServicesSection } from '@/components/public/ServicesSection';
import { AboutSection } from '@/components/public/AboutSection';
import { WhyChooseUsSection } from '@/components/public/WhyChooseUsSection';
import { TestimonialsFaqSection } from '@/components/public/TestimonialsFaqSection';
import { AppointmentSection } from '@/components/public/AppointmentSection';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Services Section */}
      <ServicesSection />

      {/* 3. À propos Section */}
      <AboutSection />

      {/* 4. Expertise / Pourquoi me choisir ? Section */}
      <WhyChooseUsSection />

      {/* 5. Témoignages & FAQ Section */}
      <TestimonialsFaqSection />

      {/* 6. Contact & Demande de rendez-vous Section */}
      <AppointmentSection />
    </div>
  );
};

export default HomePage;