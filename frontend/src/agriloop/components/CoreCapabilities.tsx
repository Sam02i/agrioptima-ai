import { LocalizedText } from "../../i18n/LocalizedText";
import { useRef } from 'react';
import { Zap, CheckCircle2, ClipboardList, CircleDollarSign, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { CAPABILITIES } from '../data/content';
import { CapabilityItem } from '../types';

interface CoreCapabilitiesProps {
  onSelectCapability: (capability: CapabilityItem) => void;
}

export function CoreCapabilities({ onSelectCapability }: CoreCapabilitiesProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap':
        return <Zap className="w-6 h-6 text-[#EAE7DD]" />;
      case 'check-circle':
        return <CheckCircle2 className="w-6 h-6 text-blue-300" />;
      case 'clipboard-list':
        return <ClipboardList className="w-6 h-6 text-amber-300" />;
      case 'badge-dollar-sign':
        return <CircleDollarSign className="w-6 h-6 text-purple-300" />;
      default:
        return <Zap className="w-6 h-6 text-[#EAE7DD]" />;
    }
  };

  return (
    <div className="w-full relative mt-8 lg:mt-12" id="core-capabilities-section">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-serif font-medium text-xl tracking-tight flex items-center gap-2"><LocalizedText source={" Core Capabilities "} /></h3>
        <div className="flex space-x-2">
          <button
            id="btn-capabilities-prev"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/15 hover:border-white/60 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            id="btn-capabilities-next"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/15 hover:border-white/60 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 no-scrollbar scroll-smooth"
        id="capabilities-scroll-container"
      >
        {CAPABILITIES.map((cap) => (
          <div
            key={cap.id}
            id={`capability-card-${cap.id}`}
            onClick={() => onSelectCapability(cap)}
            className="min-w-[280px] md:min-w-[320px] max-w-[340px] bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 snap-start hover:bg-white/18 hover:border-white/40 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-5">
                <div
                  className={`w-12 h-12 rounded-xl ${cap.badgeColor} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                ><LocalizedText source={" {0} "} values={[getIcon(cap.iconName)]} /></div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-white">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <h4 className="text-lg font-serif font-semibold text-white mb-2 group-hover:text-[#EAE7DD] transition-colors"><LocalizedText source={" {0} "} values={[cap.title]} /></h4>
              <p className="text-white/75 text-sm font-light leading-relaxed"><LocalizedText source={" {0} "} values={[cap.description]} /></p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/60 font-mono">
              <span><LocalizedText source={"{0}"} values={[cap.details?.metrics]} /></span>
              <span className="text-[#EAE7DD] group-hover:underline"><LocalizedText source={"Explore →"} /></span>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile scroll indicator dots */}
      <div className="flex justify-center mt-3 space-x-2 md:hidden">
        {CAPABILITIES.map((cap, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-white' : 'bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
}
