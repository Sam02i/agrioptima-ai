import { LocalizedText } from "../../i18n/LocalizedText";
import { ArrowRight, Mail, PhoneCall } from 'lucide-react';

interface CtaSectionProps {
  onContactClick: () => void;
  onGetStartedClick: () => void;
}

export function CtaSection({ onContactClick, onGetStartedClick }: CtaSectionProps) {
  return (
    <section id="cta-section" className="py-24 lg:py-32 bg-[#EAE7DD] relative overflow-hidden">
      {/* Decorative subtle circles */}
      <div className="absolute top-1/2 -left-20 w-80 h-80 bg-green-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-lime-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2
          id="cta-heading"
          className="text-4xl sm:text-5xl lg:text-6xl font-serif font-semibold text-[#26483E] mb-6 leading-tight"
        ><LocalizedText source={" Make farming smarter, "} /><br />
          <span className="italic font-light text-gray-800"><LocalizedText source={"stronger, and simpler"} /></span>
        </h2>

        <p
          id="cta-description"
          className="text-lg sm:text-xl text-gray-600 font-light mb-10 max-w-2xl mx-auto leading-relaxed"
        ><LocalizedText source={" Straightforward answers to help you make confident decisions for your farm. Join the network today. "} /></p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            id="btn-cta-contact-us"
            onClick={onContactClick}
            className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-[#26483E] hover:bg-[#26483E] transition-all duration-200 shadow-lg shadow-[#26483E]/25 hover:shadow-xl hover:translate-y-[-1px] cursor-pointer group"
          >
            <span><LocalizedText source={"Contact Us"} /></span>
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            id="btn-cta-get-started"
            onClick={onGetStartedClick}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-gray-300 text-lg font-medium rounded-full text-[#26483E] bg-white hover:bg-gray-50 transition-all duration-200 shadow-xs cursor-pointer"
          >
            <span><LocalizedText source={"Create Farm Plan"} /></span>
          </button>
        </div>
      </div>
    </section>
  );
}
