import { LocalizedText } from "../../i18n/LocalizedText";
import { X, ShieldCheck } from 'lucide-react';

interface LegalModalProps {
  type: 'terms' | 'privacy' | null;
  onClose: () => void;
}

export function LegalModal({ type, onClose }: LegalModalProps) {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#EAE7DD] text-[#26483E] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-serif font-bold text-gray-900"><LocalizedText source={" {0} "} values={[type === 'terms' ? 'Terms of Service' : 'Privacy Policy']} /></h3>
            <p className="text-xs text-gray-500 font-mono"><LocalizedText source={"Effective: August 2026"} /></p>
          </div>
        </div>

        <div className="prose prose-sm text-gray-600 space-y-4 text-sm leading-relaxed">
          {type === 'terms' ? (
            <>
              <p><LocalizedText source={" Welcome to "} /><strong><LocalizedText source={"AgriLoop"} /></strong><LocalizedText source={". By accessing or deploying our hardware telemetry nodes, IoT gateway units, and agronomy data platform, you agree to these operational terms. "} /></p>
              <h4 className="text-base font-semibold text-gray-900 mt-4"><LocalizedText source={"1. Farmer Data Sovereignty"} /></h4>
              <p><LocalizedText source={" All telemetry data collected on your acreage—including soil moisture, nutrient logs, NDVI drone scans, and yield projections—remains 100% your proprietary property. AgriLoop will never sell raw field datasets to unauthorized third parties. "} /></p>
              <h4 className="text-base font-semibold text-gray-900 mt-4"><LocalizedText source={"2. Verified Buyer Settlement"} /></h4>
              <p><LocalizedText source={" Forward contracts agreed upon through the AgriLoop Verified Demand Exchange are binding commercial agreements backed by certified escrow and quality grade audits. "} /></p>
              <h4 className="text-base font-semibold text-gray-900 mt-4"><LocalizedText source={"3. Hardware Warranties & Telemetry Uptime"} /></h4>
              <p><LocalizedText source={" Our solar IoT field units are engineered for all-weather agricultural durability (-30°C to +55°C) and feature automatic cellular mesh failover. "} /></p>
            </>
          ) : (
            <>
              <p><LocalizedText source={" At "} /><strong><LocalizedText source={"AgriLoop"} /></strong><LocalizedText source={", protecting farm data privacy and maintaining grower trust is central to our mission. "} /></p>
              <h4 className="text-base font-semibold text-gray-900 mt-4"><LocalizedText source={"1. Information We Collect"} /></h4>
              <p><LocalizedText source={" We process sensor telemetry (soil moisture, temperature, valve actuation timestamps) solely to calculate optimal irrigation recommendations and yield forecast models. "} /></p>
              <h4 className="text-base font-semibold text-gray-900 mt-4"><LocalizedText source={"2. End-to-End Encryption"} /></h4>
              <p><LocalizedText source={" Field transmissions are encrypted at the edge with AES-256 and verified through cryptographically secure device keys. "} /></p>
              <h4 className="text-base font-semibold text-gray-900 mt-4"><LocalizedText source={"3. Your Data Rights"} /></h4>
              <p><LocalizedText source={" Growers may export historical CSV logs or permanently delete their farm profile at any time from the account portal. "} /></p>
            </>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#26483E] text-white text-sm font-semibold hover:bg-[#26483E]"
          ><LocalizedText source={" I Understand "} /></button>
        </div>
      </div>
    </div>
  );
}
