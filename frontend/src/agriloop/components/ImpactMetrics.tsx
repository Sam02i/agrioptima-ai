import { LocalizedText } from "../../i18n/LocalizedText";
import { useState } from 'react';
import { IMPACT_METRICS } from '../data/content';
import { Globe } from 'lucide-react';
import { BlurReveal } from './BlurReveal';
import { useLanguage } from '../i18n/LanguageContext';

interface ImpactMetricsProps {
  onExploreImpact?: () => void;
}

export function ImpactMetrics({ onExploreImpact }: ImpactMetricsProps) {
  const { t } = useLanguage();
  const [selectedMetric, setSelectedMetric] = useState<number | null>(null);

  const translatedMetrics = IMPACT_METRICS.map((stat, idx) => {
    const num = idx + 1;
    const valKey = `impact_stat${num}_val` as keyof typeof import('../i18n/translations').translations.en;
    const labelKey = `impact_stat${num}_label` as keyof typeof import('../i18n/translations').translations.en;
    const descKey = `impact_stat${num}_desc` as keyof typeof import('../i18n/translations').translations.en;

    return {
      ...stat,
      displayVal: t(valKey) || `${stat.value}${stat.suffix}`,
      label: t(labelKey) || stat.label,
      highlight: t(descKey) || stat.highlight,
    };
  });

  return (
    <section
      id="impact"
      className="py-20 lg:py-28 bg-[#26483E] text-white relative overflow-hidden"
    >
      {/* Subtle ambient light in background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#EAE7DD]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#26483E]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <BlurReveal delay={0.1} duration={0.85} blur={12} yOffset={20}>
            <h2
              id="impact-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-4 tracking-tight"
            ><LocalizedText source={" {0} "} values={[t('impact_badge')]} /></h2>
          </BlurReveal>

          <BlurReveal delay={0.2} duration={0.8} blur={10} yOffset={20}>
            <p
              id="impact-description"
              className="text-[#EAE7DD] font-light text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
            ><LocalizedText source={" {0} "} values={[t('impact_desc')]} /></p>
          </BlurReveal>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x md:divide-white/10">
          {translatedMetrics.map((stat, idx) => (
            <BlurReveal key={idx} delay={0.15 * idx} duration={0.8} blur={10} yOffset={25}>
              <div
                id={`impact-stat-${idx}`}
                onClick={() => setSelectedMetric(selectedMetric === idx ? null : idx)}
                className="text-center px-2 sm:px-4 py-4 rounded-xl hover:bg-white/5 transition-all duration-300 cursor-pointer group"
              >
                <p className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#EAE7DD] mb-2 tracking-tight group-hover:scale-105 transition-transform duration-200"><LocalizedText source={" {0} "} values={[stat.displayVal]} /></p>
                <p className="text-xs sm:text-sm text-[#EAE7DD] uppercase tracking-wider font-semibold"><LocalizedText source={" {0} "} values={[stat.label]} /></p>
                <p className="text-xs text-white/60 font-light mt-2 hidden sm:block"><LocalizedText source={" {0} "} values={[stat.highlight]} /></p>
              </div>
            </BlurReveal>
          ))}
        </div>

        {/* Interactive Impact Highlight Bar */}
        <BlurReveal delay={0.4} duration={0.85} blur={12} yOffset={25}>
          <div className="impact-summary mt-16 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-[#EAE7DD]/20 flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-[#EAE7DD]" />
              </div>
              <div>
                <h4 className="font-serif font-semibold text-lg text-white"><LocalizedText source={"Global Agronomy Network"} /></h4>
                <p className="text-xs text-white/70"><LocalizedText source={" Over 1.2 million hectares actively monitored with zero data downtime. "} /></p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full bg-[#EAE7DD] text-[#26483E]"><LocalizedText source={" +28% Avg Yield Lift "} /></span>
              <span className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full bg-white/20 text-white"><LocalizedText source={" -35% Fertilizer Waste "} /></span>
            </div>
          </div>
        </BlurReveal>
      </div>
    </section>
  );
}
