/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Introduction } from './components/Introduction';
import { FeaturesGrid } from './components/FeaturesGrid';
import { UniqueFeaturesSection } from './components/UniqueFeaturesSection';
import { HowItWorks } from './components/HowItWorks';
import { StoriesSection } from './components/StoriesSection';
import { ImpactMetrics } from './components/ImpactMetrics';
import { Footer } from './components/Footer';

// Modals
import { FarmPlanModal } from './components/FarmPlanModal';
import { DemoModal } from './components/DemoModal';
import { ContactModal } from './components/ContactModal';
import { AuthModal } from './components/AuthModal';
import { LegalModal } from './components/LegalModal';
import { PortalChoiceModal } from './components/PortalChoiceModal';

import { FeatureCard } from './types';

interface AgriLoopLandingProps {
  onBuyer: () => void;
  onFarmer: (farmerId?: string) => void;
}

export default function AgriLoopLanding({ onBuyer, onFarmer }: AgriLoopLandingProps) {
  // Modal states
  const [farmPlanOpen, setFarmPlanOpen] = useState(false);
  const [farmPlanInitialStep, setFarmPlanInitialStep] = useState(1);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | null>(null);
  const [portalChoiceOpen, setPortalChoiceOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  const handleOpenGetStarted = (step: number = 1) => {
    setFarmPlanInitialStep(step);
    setPortalChoiceOpen(true);
  };

  const handleSelectFeature = (feature: FeatureCard) => {
    // When a feature card is clicked, open the interactive demo / live simulation or plan builder
    setDemoModalOpen(true);
  };

  const handleAuthSuccess = (roleName: string) => {
    setLoggedInUser(roleName);
    if (roleName.toLowerCase().includes('buyer') || roleName.toLowerCase().includes('distributor')) {
      onBuyer();
    } else {
      onFarmer();
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-800 flex flex-col selection:bg-[#c4f042] selection:text-[#1b4332]">
      {/* Top Notification banner if logged in */}
      {loggedInUser && (
        <div className="bg-[#1b4332] text-white text-xs py-2 px-4 text-center flex items-center justify-center gap-3 sticky top-0 z-50">
          <span>
            Active Session: <strong>{loggedInUser}</strong>
          </span>
          <button
            onClick={() => setLoggedInUser(null)}
            className="text-white/70 hover:text-white ml-2 cursor-pointer"
          >
            Log Out
          </button>
        </div>
      )}

      {/* Navigation Header */}
      <Header
        onOpenGetStarted={() => handleOpenGetStarted(1)}
        onOpenLogin={() => setAuthModalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Section with Background, Heading, and CTA */}
        <Hero
          onOpenGetStarted={() => handleOpenGetStarted(1)}
        />

        {/* 2. Introduction Section ("Farming Made Smarter" / "Bringing Technology to Agriculture") */}
        <Introduction onLearnMore={() => handleOpenGetStarted(1)} />

        {/* 3. Features Grid Section ("Smart Solutions for Modern Farming") */}
        <FeaturesGrid onSelectFeature={handleSelectFeature} />

        {/* 3.2 Unique Core Solutions Section ("Smart Farming Solutions That Deliver Real Results") */}
        <UniqueFeaturesSection />

        {/* 4. How It Works Section ("Farming Smarter Starts Here" 3-step process) */}
        <HowItWorks onStartStep={(step) => handleOpenGetStarted(step)} />

        {/* 5. Stories Section ("Real Results from the Field") */}
        <StoriesSection onOpenStoryDetail={(name) => setContactModalOpen(true)} />

        {/* 6. Impact Metrics Section ("Our Growing Impact" 10k+, 500+, $50M, 95%) */}
        <ImpactMetrics onExploreImpact={() => setDemoModalOpen(true)} />
      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => setLegalModalType('privacy')}
        onOpenTerms={() => setLegalModalType('terms')}
        onOpenContact={() => setContactModalOpen(true)}
        onOpenServices={(service) => {
          setDemoModalOpen(true);
        }}
      />

      {/* Modals & Interactive Overlays */}
      <FarmPlanModal
        isOpen={farmPlanOpen}
        initialStep={farmPlanInitialStep}
        onClose={() => setFarmPlanOpen(false)}
      />

      <PortalChoiceModal
        isOpen={portalChoiceOpen}
        onClose={() => setPortalChoiceOpen(false)}
        onFarmer={onFarmer}
        onBuyer={onBuyer}
      />

      <DemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}
