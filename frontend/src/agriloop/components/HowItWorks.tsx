import { LocalizedText } from "../../i18n/LocalizedText";
import { STEPS } from '../data/content';
import { ArrowRight } from 'lucide-react';
import { BlurReveal } from './BlurReveal';
import { useLanguage } from '../i18n/LanguageContext';

interface HowItWorksProps {
  onStartStep: (stepNumber: number) => void;
}

export function HowItWorks({ onStartStep }: HowItWorksProps) {
  const { t } = useLanguage();

  const translatedSteps = STEPS.map((step, idx) => {
    const num = idx + 1;
    const titleKey = `how_step${num}_title` as keyof typeof import('../i18n/translations').translations.en;
    const descKey = `how_step${num}_desc` as keyof typeof import('../i18n/translations').translations.en;

    return {
      ...step,
      title: t(titleKey) || step.title,
      description: t(descKey) || step.description,
    };
  });

  return (
    <section
      id="how-it-works"
      className="py-20 lg:py-28 bg-white border-y border-gray-100 relative overflow-hidden"
    >
      {/* Background Gradient Blurs */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-50/60 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <BlurReveal delay={0.1} blur={8} yOffset={15}>
              <div
                id="how-it-works-badge"
                className="inline-block px-3.5 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-500 mb-6 uppercase tracking-wider bg-gray-50/50"
              ><LocalizedText source={" {0} "} values={[t('how_badge')]} /></div>
            </BlurReveal>

            <BlurReveal delay={0.2} duration={0.85} blur={12} yOffset={20}>
              <h2
                id="how-it-works-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-[#26483E] leading-tight"
              ><LocalizedText source={" {0} "} values={[t('how_title_line1')]} /><br /><LocalizedText source={" {0} "} values={[t('how_title_line2')]} /></h2>
            </BlurReveal>
          </div>

          <BlurReveal delay={0.3} duration={0.8} blur={10} yOffset={20}>
            <p
              id="how-it-works-description"
              className="text-gray-500 max-w-md font-light text-base leading-relaxed"
            ><LocalizedText source={" {0} "} values={[t('how_desc')]} /></p>
          </BlurReveal>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {/* Connecting Line for Desktop */}
          <div
            className="hidden md:block absolute top-12 left-[18%] right-[18%] h-[2px] bg-gradient-to-r from-[#EAE7DD] via-[#EAE7DD] to-[#EAE7DD] -z-0"
            aria-hidden="true"
          />

          {translatedSteps.map((step, idx) => (
            <BlurReveal key={step.stepNumber} delay={0.15 * idx} duration={0.8} blur={10} yOffset={25}>
              <article
                id={`how-it-works-step-${step.stepNumber}`}
                className="relative z-10 bg-white p-6 sm:p-8 rounded-2xl border border-[#26483E]/15 flex flex-col items-center text-center h-full"
              >
                {/* Number Circle */}
                <div className="w-20 h-20 mx-auto rounded-full bg-[#EAE7DD] border-4 border-white flex items-center justify-center mb-7 shadow-sm ring-1 ring-[#26483E]/15">
                  <span className="font-sans text-2xl font-bold text-[#26483E]"><LocalizedText source={" {0} "} values={[step.stepNumber]} /></span>
                </div>

                {/* Step Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3"><LocalizedText source={" {0} "} values={[step.title]} /></h3>

                {/* Step Description */}
                <p className="text-gray-500 text-sm leading-relaxed px-2 font-light"><LocalizedText source={" {0} "} values={[step.description]} /></p>
              </article>
            </BlurReveal>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <button type="button" onClick={() => onStartStep(1)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#26483E] px-7 py-3 font-semibold text-white transition hover:bg-[#19372f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#26483E]">
            <LocalizedText source="Choose your workspace" />
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
