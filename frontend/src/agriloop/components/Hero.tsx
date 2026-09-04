import { LocalizedText } from "../../i18n/LocalizedText";
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import farmerPhoto from '../assets/images/hero-indian-farmer.jpg';
import onionPhoto from '../../assets/marketplace/crops/onion.webp';
import grapePhoto from '../../assets/marketplace/crops/grapes.jpg';
import producePhoto from '../../assets/marketplace/mixed-produce-crates.webp';
import paddyPhoto from '../assets/images/hero-paddy-field.jpg';
import { BlurReveal } from './BlurReveal';
import { useLanguage } from '../i18n/LanguageContext';

interface HeroProps {
  onOpenGetStarted: () => void;
}
const photos = [paddyPhoto, producePhoto, onionPhoto, farmerPhoto, grapePhoto];

export function Hero({ onOpenGetStarted }: HeroProps) {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    Promise.all(photos.map(src => new Promise<void>(resolve => {
      const image = new Image(); image.onload = () => resolve(); image.onerror = () => resolve(); image.src = src;
    }))).then(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!ready || preference.matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive(index => (index + 1) % photos.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [ready]);

  return (
    <section
      id="hero"
      className="slideshow-photo-hero"
    >
      <div className="hero-slides" aria-hidden="true">
        {photos.map((src, index) => <div key={src} className={`hero-photo-frame ${index === active ? 'is-active' : ''}`}>
          <img className="hero-photo-complete" src={src} alt="" fetchPriority={index === 0 ? 'high' : 'auto'} />
        </div>)}
      </div>
      <div className="editorial-hero-layout">
        {/* Main Hero Copy */}
        <div className="editorial-hero-copy">
          {/* Badge */}
          <BlurReveal delay={0.1} blur={8} yOffset={15}>
            <div
              id="hero-badge"
              className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-sm font-medium text-white mb-6 shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#EAE7DD] mr-2.5 animate-pulse shadow-[0_0_8px_#EAE7DD]" />
              <span><LocalizedText source={"{0}"} values={[t('hero_badge')]} /></span>
            </div>
          </BlurReveal>

          {/* Heading */}
          <BlurReveal delay={0.25} duration={0.9} blur={12} yOffset={20}>
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold text-white leading-[1.12] mb-6 tracking-tight drop-shadow-xs"
            ><LocalizedText source={" {0} "} values={[t('hero_title_line1')]} /><br />
              <span className="font-light italic text-white/90"><LocalizedText source={"{0}"} values={[t('hero_title_line2')]} /></span> <br /><LocalizedText source={" {0} "} values={[t('hero_title_line3')]} /></h1>
          </BlurReveal>

          {/* Subtitle */}
          <BlurReveal delay={0.4} duration={0.8} blur={10} yOffset={20}>
            <p
              id="hero-description"
              className="text-base sm:text-lg lg:text-xl text-white/85 mb-10 max-w-xl font-light leading-relaxed drop-shadow-xs"
            ><LocalizedText source={" {0} "} values={[t('hero_desc')]} /></p>
          </BlurReveal>

          {/* Action Buttons */}
          <BlurReveal delay={0.55} duration={0.7} blur={8} yOffset={15}>
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <button
                id="btn-hero-get-started"
                onClick={onOpenGetStarted}
                className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-semibold rounded-full text-[#26483E] bg-[#EAE7DD] hover:bg-[#EAE7DD] transition-all duration-200 shadow-md hover:shadow-lg hover:translate-y-[-1px] cursor-pointer group"
              >
                <span><LocalizedText source={"{0}"} values={[t('hero_cta_get_started')]} /></span>
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

            </div>
          </BlurReveal>
        </div>
      </div>
    </section>
  );
}
