import { ArrowRight } from 'lucide-react';
import { HERO_BACKGROUND_IMAGE } from '../data/content';
import { BlurReveal } from './BlurReveal';
import { useLanguage } from '../i18n/LanguageContext';

interface HeroProps {
  onOpenGetStarted: () => void;
}

export function Hero({ onOpenGetStarted }: HeroProps) {
  const { t } = useLanguage();

  return (
    <section
      id="hero"
      className="relative pt-36 pb-28 sm:pt-48 sm:pb-36 lg:pt-60 lg:pb-48 overflow-hidden min-h-[92vh] lg:min-h-screen flex flex-col justify-center"
    >
      {/* Full width background image with optimized overlay */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img
          src={HERO_BACKGROUND_IMAGE}
          alt="Lush green agricultural fields"
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
          loading="eager"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto">
        {/* Main Hero Copy */}
        <div className="max-w-2xl pt-4">
          {/* Badge */}
          <BlurReveal delay={0.1} blur={8} yOffset={15}>
            <div
              id="hero-badge"
              className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-sm font-medium text-white mb-6 shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#4ade80] mr-2.5 animate-pulse shadow-[0_0_8px_#4ade80]" />
              <span>{t('hero_badge')}</span>
            </div>
          </BlurReveal>

          {/* Heading */}
          <BlurReveal delay={0.25} duration={0.9} blur={12} yOffset={20}>
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold text-white leading-[1.12] mb-6 tracking-tight drop-shadow-xs"
            >
              {t('hero_title_line1')} <br />
              <span className="font-light italic text-white/90">{t('hero_title_line2')}</span> <br />
              {t('hero_title_line3')}
            </h1>
          </BlurReveal>

          {/* Subtitle */}
          <BlurReveal delay={0.4} duration={0.8} blur={10} yOffset={20}>
            <p
              id="hero-description"
              className="text-base sm:text-lg lg:text-xl text-white/85 mb-10 max-w-xl font-light leading-relaxed drop-shadow-xs"
            >
              {t('hero_desc')}
            </p>
          </BlurReveal>

          {/* Action Buttons */}
          <BlurReveal delay={0.55} duration={0.7} blur={8} yOffset={15}>
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <button
                id="btn-hero-get-started"
                onClick={onOpenGetStarted}
                className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-semibold rounded-full text-[#1b4332] bg-[#c4f042] hover:bg-[#b0d83b] transition-all duration-200 shadow-md hover:shadow-lg hover:translate-y-[-1px] cursor-pointer group"
              >
                <span>{t('hero_cta_get_started')}</span>
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

            </div>
          </BlurReveal>
        </div>
      </div>
    </section>
  );
}
