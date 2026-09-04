import { LocalizedText } from "../../i18n/LocalizedText";
import { X, Zap, CheckCircle2, ClipboardList, CircleDollarSign, ArrowRight, TrendingUp, ShieldCheck } from 'lucide-react';
import { CapabilityItem } from '../types';

interface CapabilityModalProps {
  capability: CapabilityItem | null;
  onClose: () => void;
  onGetStarted: () => void;
}

export function CapabilityModal({ capability, onClose, onGetStarted }: CapabilityModalProps) {
  if (!capability) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className={`w-14 h-14 rounded-2xl ${capability.badgeColor} flex items-center justify-center`}>
            {capability.iconName === 'zap' && <Zap className="w-7 h-7 text-[#26483E]" />}
            {capability.iconName === 'check-circle' && <CheckCircle2 className="w-7 h-7 text-blue-600" />}
            {capability.iconName === 'clipboard-list' && <ClipboardList className="w-7 h-7 text-amber-600" />}
            {capability.iconName === 'badge-dollar-sign' && <CircleDollarSign className="w-7 h-7 text-purple-600" />}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#26483E] bg-[#EAE7DD] px-2.5 py-1 rounded-md border border-[#EAE7DD]"><LocalizedText source={" AgriLoop Core Capability "} /></span>
            <h3 className="text-2xl font-serif font-bold text-gray-900 mt-1"><LocalizedText source={" {0} "} values={[capability.title]} /></h3>
          </div>
        </div>

        <p className="text-gray-600 text-base leading-relaxed mb-6 font-light"><LocalizedText source={" {0} "} values={[capability.description]} /></p>

        <div className="space-y-3 mb-6">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1"><LocalizedText source={" Key Producer Benefit "} /></h4>
            <p className="text-sm font-medium text-gray-800"><LocalizedText source={" {0} "} values={[capability.details?.keyBenefit]} /></p>
          </div>

          <div className="p-4 rounded-2xl bg-[#EAE7DD] border border-[#EAE7DD]">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#26483E] mb-1"><LocalizedText source={" Measured Field Performance "} /></h4>
            <p className="text-sm font-bold text-[#26483E]"><LocalizedText source={" {0} "} values={[capability.details?.metrics]} /></p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-800 mb-1"><LocalizedText source={" Autonomous Operation "} /></h4>
            <p className="text-xs text-gray-700"><LocalizedText source={" {0} "} values={[capability.details?.sampleAction]} /></p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
          ><LocalizedText source={" Close "} /></button>
          <button
            onClick={() => {
              onClose();
              onGetStarted();
            }}
            className="px-6 py-2.5 rounded-full bg-[#26483E] hover:bg-[#26483E] text-white text-sm font-semibold inline-flex items-center shadow-sm"
          >
            <span><LocalizedText source={"Activate on My Land"} /></span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
