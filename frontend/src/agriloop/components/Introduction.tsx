import { LocalizedText } from "../../i18n/LocalizedText";
import { motion } from 'motion/react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface IntroductionProps {
  onLearnMore: () => void;
}

export function Introduction({ onLearnMore }: IntroductionProps) {
  const { t } = useLanguage();

  const badgeText = t('intro_badge_title');
  
  const bodyText = t('intro_body');
  const bodyWords = bodyText.split(' ').filter(Boolean);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.025,
        delayChildren: 0.15,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 14,
      filter: 'blur(8px)',
      scale: 0.96,
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section
      id="introduction"
      className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-[#EAE7DD] to-white border-b border-gray-100/90 relative overflow-hidden"
    >
      {/* Ambient Gradient Glow Blobs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#EAE7DD]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12">
          {/* Scroll-Revealed Text with Word-by-Word Animation */}
          <div className="flex-1 max-w-5xl">
            <motion.div
              key={badgeText} // Re-trigger animation cleanly when language switches
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="text-lg sm:text-xl lg:text-[22px] text-gray-700 font-light leading-[1.65] tracking-tight flex flex-wrap items-baseline gap-x-1.5 gap-y-1"
            >
              {/* Lead-in Badge Words */}
              <motion.span
                id="intro-heading"
                className="inline-flex items-center gap-1.5 font-serif font-bold text-[#26483E] text-xl sm:text-2xl lg:text-[27px] mr-2 bg-gradient-to-r from-emerald-100/90 via-[#EAE7DD]/30 to-emerald-50/40 px-3 py-1 rounded-xl border-l-4 border-[#26483E] shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-[#26483E] animate-spin-slow inline-block flex-shrink-0" />
                <span>{badgeText}</span>
              </motion.span>

              {/* Body Text Word-by-Word Animation */}
              {bodyWords.map((word, idx) => (
                <motion.span
                  key={`body-${idx}`}
                  variants={wordVariants}
                  className="inline-block text-gray-700 hover:text-gray-950 transition-colors"
                ><LocalizedText source={" {0} "} values={[word]} /></motion.span>
              ))}
            </motion.div>
          </div>

          {/* Action Trigger Button */}
          <div className="flex-shrink-0 pt-2 lg:pt-0">
            <motion.button
              id="btn-intro-learn-more"
              onClick={onLearnMore}
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#EAE7DD] hover:bg-[#EAE7DD] border border-[#EAE7DD] text-[#26483E] font-semibold text-sm sm:text-base transition-all duration-300 shadow-xs hover:shadow-md group cursor-pointer"
            >
              <span><LocalizedText source={"{0}"} values={[t('intro_btn_explore')]} /></span>
              <span className="w-7 h-7 rounded-full bg-[#26483E] text-[#EAE7DD] flex items-center justify-center group-hover:translate-x-0.5 group-hover:bg-[#26483E] transition-all">
                <ChevronRight className="w-4 h-4" />
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
