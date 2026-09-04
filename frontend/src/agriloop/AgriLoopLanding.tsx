import { LocalizedText } from "../i18n/LocalizedText";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Introduction } from './components/Introduction';
import { FeaturesGrid } from './components/FeaturesGrid';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';

// Modals
import { FarmPlanModal } from './components/FarmPlanModal';
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
    setPortalChoiceOpen(true);
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
    <div className="min-h-screen bg-[#EAE7DD] text-gray-800 flex flex-col selection:bg-[#EAE7DD] selection:text-[#26483E]">
      {/* Top Notification banner if logged in */}
      {loggedInUser && (
        <div className="bg-[#26483E] text-white text-xs py-2 px-4 text-center flex items-center justify-center gap-3 sticky top-0 z-50">
          <span><LocalizedText source={" Active Session: "} /><strong><LocalizedText source={"{0}"} values={[loggedInUser]} /></strong>
          </span>
          <button
            onClick={() => setLoggedInUser(null)}
            className="text-white/70 hover:text-white ml-2 cursor-pointer"
          ><LocalizedText source={" Log Out "} /></button>
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

        {/* A short path from the problem to the two working portals. */}
        <HowItWorks onStartStep={(step) => handleOpenGetStarted(step)} />
      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => setLegalModalType('privacy')}
        onOpenTerms={() => setLegalModalType('terms')}
        onOpenContact={() => setContactModalOpen(true)}
        onOpenServices={(service) => {
          setPortalChoiceOpen(true);
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
