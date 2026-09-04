import { LocalizedText } from '../../i18n/LocalizedText';
import { ArrowRight, IndianRupee, PackageCheck, Sprout } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenContact: () => void;
  onOpenServices: (serviceName: string) => void;
}

const workflow = [
  { Icon: Sprout, title: 'Plan the crop', description: 'See practical crop and soil guidance using the connected farm record.', service: 'Crop and soil guidance' },
  { Icon: IndianRupee, title: 'Choose a fair price', description: 'Compare recent mandi references and estimated transport costs before listing produce.', service: 'Mandi prices and listings' },
  { Icon: PackageCheck, title: 'Complete the order', description: 'Keep quality, shipment and payment progress visible to both farmer and buyer.', service: 'Orders and delivery' },
];

export function Footer({ onOpenPrivacy, onOpenTerms, onOpenContact, onOpenServices }: FooterProps) {
  return (
    <footer id="footer" data-i18n-native className="bg-[#EAE7DD] px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2rem] bg-[#26483E] px-6 py-10 text-[#F7F3E9] sm:px-10 sm:py-12 lg:px-14">
          <div className="grid items-end gap-8 border-b border-white/20 pb-10 lg:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#EAE7DD]"><LocalizedText source="One connected journey" /></span>
              <h2 className="mt-4 text-4xl font-bold leading-[1.08] sm:text-5xl"><LocalizedText source="From field decision to completed payment." /></h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#F7F3E9]/85 sm:text-lg"><LocalizedText source="Farmers and buyers work from the same crop, price, quality, order and delivery record—without duplicate paperwork." /></p>
            </div>
            <button type="button" onClick={() => onOpenServices('Farmer and buyer workspace')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#F7F3E9] px-6 py-3 font-semibold text-[#26483E] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <LocalizedText source="Choose your workspace" /><ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid gap-4 pt-8 md:grid-cols-3">
            {workflow.map(({ Icon, title, description, service }, index) => (
              <button type="button" key={title} onClick={() => onOpenServices(service)} className="group rounded-2xl border border-white/20 bg-white/[0.08] p-5 text-left transition hover:bg-white/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F7F3E9] text-[#26483E]"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="text-sm font-bold text-[#F7F3E9]/60">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-white"><LocalizedText source={title} /></h3>
                <p className="mt-2 text-sm leading-relaxed text-[#F7F3E9]/80"><LocalizedText source={description} /></p>
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <div className="text-3xl font-bold text-[#26483E]">AgriOptima<sup className="text-xs">AI</sup>.</div>
            <p className="mt-3 max-w-xl leading-relaxed text-[#3E554E]"><LocalizedText source="Practical tools for crop planning, local price comparison, produce listings and transparent order tracking." /></p>
          </div>
          <button type="button" onClick={onOpenContact} className="min-h-11 rounded-full border border-[#26483E]/40 px-6 py-3 font-semibold text-[#26483E] transition hover:bg-[#26483E] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#26483E]"><LocalizedText source="Contact the team" /></button>
        </div>

        <div className="flex flex-col justify-between gap-4 border-t border-[#26483E]/20 pt-6 text-sm text-[#536A63] sm:flex-row sm:items-center">
          <p>© 2026 AgriOptima<sup className="text-[0.6em]">AI</sup>. <LocalizedText source="All rights reserved." /></p>
          <div className="flex gap-5">
            <button type="button" onClick={onOpenTerms} className="hover:text-[#26483E]"><LocalizedText source="Terms of Service" /></button>
            <button type="button" onClick={onOpenPrivacy} className="hover:text-[#26483E]"><LocalizedText source="Privacy Policy" /></button>
          </div>
        </div>
      </div>
    </footer>
  );
}
