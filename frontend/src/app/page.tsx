import Hero from '@/components/sections/Hero';
import StatsBar from '@/components/sections/StatsBar';
import WhatWeDo from '@/components/sections/WhatWeDo';
import WhyPartner from '@/components/sections/WhyPartner';
import { CTABanner } from '@/components/sections/CTAAndFooter';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';

export const metadata = {
  title: 'Rewaj Corporate Limited | Engineering Excellence for the Energy Industry',
  description:
    'Rewaj Corporate Limited delivers world-class oil and gas engineering solutions, procurement services, and infrastructure development across Nigeria and beyond.',
  keywords: 'oil and gas engineering, Nigeria, procurement, control systems, Rewaj Corporate',
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <WhatWeDo />
        <WhyPartner />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
