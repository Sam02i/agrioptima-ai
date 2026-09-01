import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Quote,
  Star,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { BlurReveal } from './BlurReveal';
import { useLanguage } from '../i18n/LanguageContext';


interface ReviewItem {
  id: string;
  name: string;
  role: string;
  companyOrFarm: string;
  location: string;
  quote: string;
  metric: string;
  badge: string;
  badgeColor: string;
  stars: number;
  avatarColor: string;
  initials: string;
}

interface StoriesSectionProps {
  onOpenStoryDetail: (name: string) => void;
}

export function StoriesSection({ onOpenStoryDetail }: StoriesSectionProps) {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<'all' | 'grower' | 'buyer' | 'logistics'>('all');


  const rowOneReviews: ReviewItem[] = [
    {
      id: 'rev-1',
      name: 'Marcus & Elena Henderson',
      role: 'Apple & Cherry Orchards (340 Acres)',
      companyOrFarm: 'Henderson Valley Orchards',
      location: 'Yakima Valley, Washington',
      quote:
        'Agrovia cut our irrigation energy bill by 38% in the first season while improving fruit brix sugar levels consistently across all blocks with zero manual guesswork.',
      metric: '+38% Energy Savings',
      badge: 'Precision Agronomy',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      stars: 5,
      avatarColor: 'bg-emerald-700 text-[#c4f042]',
      initials: 'MH',
    },
    {
      id: 'rev-2',
      name: 'David Thorne',
      role: 'Grain Co-Op Director',
      companyOrFarm: 'Midwest Growers Syndicate',
      location: 'Champaign, Illinois',
      quote:
        'The forward contract matching enabled us to secure buyers 4 months before harvest at a guaranteed price, removing speculative volatility and price collapse risks.',
      metric: '100% Pre-Sold Harvest',
      badge: 'Verified Demand',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
      stars: 5,
      avatarColor: 'bg-blue-700 text-white',
      initials: 'DT',
    },
    {
      id: 'rev-3',
      name: 'Priya Patel',
      role: 'Organic FPO Lead (62 Farmers)',
      companyOrFarm: 'Salinas Valley Organics',
      location: 'Salinas Valley, California',
      quote:
        'Multi-farmer load aggregation grouped our small daily lettuce harvests into single refrigerated trucks. Our transport cost plummeted by 44% immediately.',
      metric: '-44% Freight Cost',
      badge: 'Smart Logistics',
      badgeColor: 'bg-lime-50 text-lime-800 border-lime-200',
      stars: 5,
      avatarColor: 'bg-lime-700 text-white',
      initials: 'PP',
    },
    {
      id: 'rev-4',
      name: 'Roberto Morales',
      role: 'Commercial Avocado Producer',
      companyOrFarm: 'Rancho Santa Clara',
      location: 'Michoacán / Texas Border Hub',
      quote:
        'The Digital Produce Passport with auto-accept confidence grades completely eliminated arrival rejection disputes at our wholesale distribution terminals.',
      metric: '99.2% Auto-Accept Rate',
      badge: 'Digital Passport',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      stars: 5,
      avatarColor: 'bg-purple-700 text-white',
      initials: 'RM',
    },
  ];

  const rowTwoReviews: ReviewItem[] = [
    {
      id: 'rev-5',
      name: 'Samantha Reed',
      role: 'VP Procurement',
      companyOrFarm: 'Whole Table Distribution',
      location: 'Chicago, Illinois',
      quote:
        'Having verified dispatch freshness timestamps and dual-gate AI inspection logs before trucks arrive gives our procurement teams total operational certainty.',
      metric: '$3.4M Direct Volume',
      badge: 'Enterprise Buyer',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      stars: 5,
      avatarColor: 'bg-amber-700 text-white',
      initials: 'SR',
    },
    {
      id: 'rev-6',
      name: 'Dr. Liam Gallagher',
      role: 'Managing Partner',
      companyOrFarm: 'Apex Agri-Credit Fund',
      location: 'Denver, Colorado',
      quote:
        'Agrovia’s procurement credit score is revolutionary. Real transactional history enables us to underwrite $150K working capital lines with a 98.2% on-time repayment rate.',
      metric: '98.2% Repayment Rate',
      badge: 'Fintech Credit',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      stars: 5,
      avatarColor: 'bg-emerald-800 text-[#c4f042]',
      initials: 'LG',
    },
    {
      id: 'rev-7',
      name: 'Carlos & Sofia Mendez',
      role: 'Berry Growers (180 Acres)',
      companyOrFarm: 'Pacific Coastal Berries',
      location: 'Watsonville, California',
      quote:
        'Predictive oversupply warnings saved our blackberry season. We shifted 30% of acreage to cold-storage varietals weeks before market saturation occurred.',
      metric: '+$140k Protected Revenue',
      badge: 'Predictive Intelligence',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
      stars: 5,
      avatarColor: 'bg-rose-700 text-white',
      initials: 'CM',
    },
    {
      id: 'rev-8',
      name: 'Aysha Khan',
      role: 'Regional Cold-Chain Fleet Director',
      companyOrFarm: 'FreshCorridor Logistics',
      location: 'Omaha, Nebraska',
      quote:
        'Vehicle capacity matching algorithm eliminated 32% of dead-head miles. We fill our reefer trailers to 94% capacity across every multi-stop farm pickup.',
      metric: '94% Trailer Utilization',
      badge: 'Fleet Efficiency',
      badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      stars: 5,
      avatarColor: 'bg-cyan-700 text-white',
      initials: 'AK',
    },
  ];

  const renderReviewCard = (story: ReviewItem) => (
    <div
      key={story.id}
      onClick={() => onOpenStoryDetail(story.name)}
      className="w-[380px] sm:w-[420px] flex-shrink-0 p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-gray-200/90 shadow-sm hover:shadow-xl hover:border-[#166534]/30 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
    >
      {/* Top subtle hover accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#166534] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Header with Badge & Rating */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${story.badgeColor}`}
          >
            {story.badge}
          </span>
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(story.stars)].map((_, idx) => (
              <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
            ))}
          </div>
        </div>

        {/* Quote */}
        <p className="text-gray-700 text-[14px] leading-relaxed font-light mb-5">
          "{story.quote}"
        </p>
      </div>

      {/* Author & Metric Footer */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs ${story.avatarColor}`}
          >
            {story.initials}
          </div>
          <div className="min-w-0">
            <h4 className="font-serif font-bold text-gray-900 text-sm truncate">
              {story.name}
            </h4>
            <p className="text-[11px] text-gray-500 truncate">{story.companyOrFarm}</p>
            <p className="text-[10px] text-gray-400 truncate flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 text-gray-400" />
              {story.location}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <span className="inline-block text-xs font-bold text-[#166534] bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-1 rounded-lg">
            {story.metric}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <section
      id="stories"
      className="py-20 lg:py-28 bg-[#f8faf8] border-t border-gray-100/90 relative overflow-hidden"
    >
      {/* Ambient Gradient Blur Lights */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#c4f042]/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <BlurReveal delay={0.1} blur={8} yOffset={15}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-600 mb-4 uppercase tracking-wider bg-white shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#166534]" />
            {t('stories_badge')}
          </div>
        </BlurReveal>

        <BlurReveal delay={0.2} duration={0.85} blur={12} yOffset={20}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#052e16] tracking-tight">
            {t('stories_title')}
          </h2>
        </BlurReveal>

        <BlurReveal delay={0.3} duration={0.8} blur={10} yOffset={20}>
          <p className="text-gray-600 text-base sm:text-lg font-light mt-3 max-w-2xl mx-auto">
            {t('stories_desc')}
          </p>
        </BlurReveal>
      </div>


      {/* Auto-Floating Infinite Reviews Marquee Tracks */}
      <div className="space-y-6 overflow-hidden relative">
        {/* Left & Right Edge Vignette Fade */}
        <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#f8faf8] via-[#f8faf8]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#f8faf8] via-[#f8faf8]/80 to-transparent z-10 pointer-events-none" />

        {/* Row 1: Floating Left */}
        <div className="flex gap-6 overflow-hidden">
          <motion.div
            className="flex gap-6 flex-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 35,
                ease: 'linear',
              },
            }}
            whileHover={{ transition: { duration: 120 } }}
          >
            {/* Duplicated for seamless infinite loop */}
            {[...rowOneReviews, ...rowOneReviews].map((story, i) => (
              <React.Fragment key={`${story.id}-${i}`}>
                {renderReviewCard(story)}
              </React.Fragment>
            ))}
          </motion.div>
        </div>

        {/* Row 2: Floating Right (Reverse Direction) */}
        <div className="flex gap-6 overflow-hidden">
          <motion.div
            className="flex gap-6 flex-nowrap"
            animate={{ x: ['-50%', '0%'] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 38,
                ease: 'linear',
              },
            }}
            whileHover={{ transition: { duration: 120 } }}
          >
            {/* Duplicated for seamless infinite loop */}
            {[...rowTwoReviews, ...rowTwoReviews].map((story, i) => (
              <React.Fragment key={`${story.id}-${i}`}>
                {renderReviewCard(story)}
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Trust Highlights Bar */}
      <div className="max-w-4xl mx-auto mt-12 px-4">
        <BlurReveal delay={0.35} duration={0.8} blur={10} yOffset={15}>
          <div className="p-4 rounded-2xl bg-white/90 border border-gray-200 shadow-2xs flex flex-wrap items-center justify-around gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#166534]" />
              <span className="font-semibold text-gray-900">100% Verified</span> Farm &amp; Buyer Profiles
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block" />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#166534]" />
              <span className="font-semibold text-gray-900">Zero Dispute</span> Dual-Gate Quality Settlement
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block" />
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#166534]" />
              <span className="font-semibold text-gray-900">4.9 / 5.0</span> Average Agronomy Rating
            </div>
          </div>
        </BlurReveal>
      </div>
    </section>
  );
}
