import { LocalizedText } from "../../i18n/LocalizedText";
import { useState } from 'react';
import { FEATURES } from '../data/content';
import { FeatureCard } from '../types';
import { ArrowUpRight } from 'lucide-react';
import { BlurReveal } from './BlurReveal';
import { useLanguage } from '../i18n/LanguageContext';

interface FeaturesGridProps {
  onSelectFeature: (feature: FeatureCard) => void;
}

export function FeaturesGrid({ onSelectFeature }: FeaturesGridProps) {
  const { t } = useLanguage();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Map translations to feature cards dynamically
  const translatedFeatures = FEATURES.map((feature, idx) => {
    const cardNum = idx + 1;
    const titleKey = `features_card${cardNum}_title` as keyof typeof import('../i18n/translations').translations.en;
    const descKey = `features_card${cardNum}_desc` as keyof typeof import('../i18n/translations').translations.en;
    const catKey = `features_card${cardNum}_cat` as keyof typeof import('../i18n/translations').translations.en;
    const statsKey = `features_card${cardNum}_stats` as keyof typeof import('../i18n/translations').translations.en;

    return {
      ...feature,
      title: t(titleKey) || feature.title,
      description: t(descKey) || feature.description,
      category: t(catKey) || feature.category,
      stats: t(statsKey) || feature.stats,
    };
  });

  return (
    <section id="solutions" className="py-20 lg:py-28 bg-white relative overflow-hidden">
      {/* Ambient Gradient Blur Blobs */}
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-[#EAE7DD]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-16">
          <div>
            <BlurReveal delay={0.1} blur={8} yOffset={15}>
              <div
                id="solutions-badge"
                className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-500 mb-6 uppercase tracking-wider bg-gray-50/50"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#26483E] mr-2"></span><LocalizedText source={" {0} "} values={[t('features_badge')]} /></div>
            </BlurReveal>

            <BlurReveal delay={0.2} duration={0.85} blur={12} yOffset={20}>
              <h2
                id="solutions-heading"
                className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#26483E] leading-tight"
              ><LocalizedText source={" {0} "} values={[t('features_title_line1')]} /><br />
                <span className="font-light italic"><LocalizedText source={"{0}"} values={[t('features_title_line2')]} /></span>
              </h2>
            </BlurReveal>
          </div>

          <div className="lg:pb-2">
            <BlurReveal delay={0.3} duration={0.8} blur={10} yOffset={20}>
              <p
                id="solutions-description"
                className="text-lg text-gray-600 font-light leading-relaxed max-w-xl"
              ><LocalizedText source={" {0} "} values={[t('features_desc')]} /></p>
            </BlurReveal>
          </div>
        </div>

        {/* 3-Column Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {translatedFeatures.map((feature, idx) => (
            <BlurReveal key={feature.id} delay={0.15 * idx} duration={0.8} blur={12} yOffset={30}>
              <div
                id={`feature-card-${feature.id}`}
                onClick={() => onSelectFeature(feature)}
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group cursor-pointer flex flex-col justify-between h-full"
              >
                <div>
                  <div className="aspect-[4/5] overflow-hidden rounded-3xl mb-6 relative bg-gray-100 shadow-xs border border-gray-100">
                    <img
                      src={feature.image}
                      alt={feature.alt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Subtle category badge on hover */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-medium border border-white/20"><LocalizedText source={" {0} "} values={[feature.category]} /></span>
                    </div>

                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="w-10 h-10 rounded-full bg-white text-[#26483E] flex items-center justify-center shadow-lg font-semibold text-xs">
                        <ArrowUpRight className="w-5 h-5" />
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-2xl font-serif font-semibold text-[#26483E] group-hover:text-[#26483E] transition-colors"><LocalizedText source={" {0} "} values={[feature.title]} /></h3>
                  </div>

                  <p className="text-gray-500 font-light leading-relaxed text-base"><LocalizedText source={" {0} "} values={[feature.description]} /></p>
                </div>

                {/* One honest action; performance claims belong in measured case studies. */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span className="group-hover:text-[#26483E] transition-colors"><LocalizedText source={" View interactive preview → "} /></span>
                </div>
              </div>
            </BlurReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
