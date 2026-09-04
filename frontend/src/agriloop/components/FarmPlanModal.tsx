import { LocalizedText } from "../../i18n/LocalizedText";
import { useState } from 'react';
import { X, Check, ArrowRight, ArrowLeft, Sprout, Droplets, TrendingUp, CheckCircle, ShieldCheck, Sparkles, Download } from 'lucide-react';
import { FarmPlanFormData } from '../types';

interface FarmPlanModalProps {
  isOpen: boolean;
  initialStep?: number;
  onClose: () => void;
}

export function FarmPlanModal({ isOpen, initialStep = 1, onClose }: FarmPlanModalProps) {
  const [step, setStep] = useState(initialStep);
  const [formData, setFormData] = useState<FarmPlanFormData>({
    farmName: 'Green Valley Orchards',
    location: 'Central Valley, California',
    farmSizeAcres: 160,
    cropTypes: ['Apples', 'Grapes'],
    irrigationType: 'Drip & Micro-Sprinkler',
    primaryGoal: 'Water conservation & yield optimization',
    email: '',
    fullName: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(false);

  if (!isOpen) return null;

  const handleCropToggle = (crop: string) => {
    setFormData((prev) => ({
      ...prev,
      cropTypes: prev.cropTypes.includes(crop)
        ? prev.cropTypes.filter((c) => c !== crop)
        : [...prev.cropTypes, crop],
    }));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setPlanGenerated(true);
      setStep(3);
    }, 1200);
  };

  const cropsList = [
    'Corn & Maize',
    'Soybeans',
    'Wheat & Grains',
    'Cotton',
    'Tomatoes & Veggies',
    'Almonds & Nuts',
    'Vineyards & Wine',
    'Apples & Fruit Orchards',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Stepper Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <span className={step >= 1 ? 'text-[#26483E]' : ''}><LocalizedText source={"1. Farm Profile"} /></span>
            <span className={step >= 2 ? 'text-[#26483E]' : ''}><LocalizedText source={"2. Strategy & Goals"} /></span>
            <span className={step >= 3 ? 'text-[#26483E]' : ''}><LocalizedText source={"3. Custom Plan"} /></span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#26483E] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Tell Us About Your Farm */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-[#EAE7DD] text-xs font-semibold text-[#26483E] uppercase tracking-wider mb-2"><LocalizedText source={" Step 1 of 3 "} /></div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900"><LocalizedText source={" Tell Us About Your Farm "} /></h3>
              <p className="text-gray-500 text-sm mt-1"><LocalizedText source={" Help us understand your current soil profile, acreage, and crop mix. "} /></p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"><LocalizedText source={" Farm or Enterprise Name "} /></label>
                <input
                  type="text"
                  value={formData.farmName}
                  onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                  placeholder="e.g. Oak Ridge Farm"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#26483E] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"><LocalizedText source={" Total Acreage (Acres) "} /></label>
                <input
                  type="number"
                  value={formData.farmSizeAcres}
                  onChange={(e) => setFormData({ ...formData, farmSizeAcres: e.target.value })}
                  placeholder="e.g. 250"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#26483E] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"><LocalizedText source={" Farm Location / Region "} /></label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="State, Country or Postal Code"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#26483E] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"><LocalizedText source={" Crops Grown (Select all that apply) "} /></label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {cropsList.map((crop) => {
                  const selected = formData.cropTypes.includes(crop);
                  return (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => handleCropToggle(crop)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                        selected
                          ? 'border-[#26483E] bg-[#EAE7DD] text-[#26483E] font-semibold ring-1 ring-[#26483E]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate"><LocalizedText source={"{0}"} values={[crop]} /></span>
                        {selected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center px-6 py-3 rounded-full bg-[#26483E] hover:bg-[#26483E] text-white text-sm font-semibold transition-all shadow-sm"
              >
                <span><LocalizedText source={"Continue to Step 2"} /></span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Get a Custom Plan */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-[#EAE7DD] text-xs font-semibold text-[#26483E] uppercase tracking-wider mb-2"><LocalizedText source={" Step 2 of 3 "} /></div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900"><LocalizedText source={" Tailor Your Technology Goals "} /></h3>
              <p className="text-gray-500 text-sm mt-1"><LocalizedText source={" Select your primary operational goals so we configure the ideal sensor & analytics stack. "} /></p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"><LocalizedText source={" Primary Operational Priority "} /></label>
              <div className="space-y-2">
                {[
                  {
                    id: 'water',
                    title: 'Precision Irrigation & Water Conservation',
                    desc: 'Automated solenoid valves & IoT soil tension sensors to reduce water use by up to 40%.',
                  },
                  {
                    id: 'yield',
                    title: 'Yield Maximization & Fertilizer Optimization',
                    desc: 'Micro-nutrient NPK tracking and satellite NDVI vegetation vigor scoring.',
                  },
                  {
                    id: 'demand',
                    title: 'Guaranteed Buyer Matching & Quality Traceability',
                    desc: 'Lock in forward contracts with verified wholesale buyers prior to seasonal harvest.',
                  },
                  {
                    id: 'credit',
                    title: 'Crop-Backed Capital & Instant Credit Line',
                    desc: 'Access low-interest working capital based on verified sensor yield forecasts.',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setFormData({ ...formData, primaryGoal: item.title })}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      formData.primaryGoal === item.title
                        ? 'border-[#26483E] bg-[#EAE7DD] ring-1 ring-[#26483E]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900"><LocalizedText source={"{0}"} values={[item.title]} /></h4>
                        <p className="text-xs text-gray-500 mt-0.5"><LocalizedText source={"{0}"} values={[item.desc]} /></p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ml-3 ${
                          formData.primaryGoal === item.title
                            ? 'border-[#26483E] bg-[#26483E] text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {formData.primaryGoal === item.title && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"><LocalizedText source={" Contact Name "} /></label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#26483E] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"><LocalizedText source={" Email for Plan Delivery "} /></label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="grower@farm.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#26483E] text-sm"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                <span><LocalizedText source={"Back"} /></span>
              </button>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center px-6 py-3 rounded-full bg-[#EAE7DD] hover:bg-[#EAE7DD] text-[#26483E] text-sm font-bold transition-all shadow-md cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#26483E] border-t-transparent rounded-full animate-spin mr-2" />
                    <span><LocalizedText source={"Analyzing Agronomy Data..."} /></span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span><LocalizedText source={"Generate Custom Plan"} /></span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Watch Your Farm Improve (Generated Plan View) */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center pb-2">
              <div className="w-16 h-16 rounded-full bg-[#EAE7DD] text-[#26483E] flex items-center justify-center mx-auto mb-3 border-4 border-[#EAE7DD]">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900"><LocalizedText source={" Custom Farm Strategy Ready! "} /></h3>
              <p className="text-gray-500 text-sm mt-1"><LocalizedText source={" Engineered for "} /><span className="font-semibold text-gray-800"><LocalizedText source={"{0}"} values={[formData.farmName || 'Your Farm']} /></span><LocalizedText source={" ({0} Acres, {1}) "} values={[formData.farmSizeAcres, formData.location]} /></p>
            </div>

            {/* Projected Impact Card */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#26483E] text-white">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-serif font-bold text-[#EAE7DD]">+27%</p>
                <p className="text-[11px] text-[#EAE7DD] uppercase tracking-wider font-medium"><LocalizedText source={"Yield Increase"} /></p>
              </div>
              <div className="text-center border-x border-white/15">
                <p className="text-2xl sm:text-3xl font-serif font-bold text-[#EAE7DD]">35%</p>
                <p className="text-[11px] text-[#EAE7DD] uppercase tracking-wider font-medium"><LocalizedText source={"Water Saved"} /></p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-serif font-bold text-[#EAE7DD]"><LocalizedText source={"$18.4k"} /></p>
                <p className="text-[11px] text-[#EAE7DD] uppercase tracking-wider font-medium"><LocalizedText source={"Est. Extra Profit"} /></p>
              </div>
            </div>

            {/* Recommended Hardware & Software Stack */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider"><LocalizedText source={" Recommended Solution Stack "} /></h4>

              <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-100 text-[#26483E]">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-900"><LocalizedText source={" 4x IoT Multi-Depth Soil Moisture Probes "} /></h5>
                  <p className="text-xs text-gray-500"><LocalizedText source={" Continuous monitoring at 10cm, 30cm, and 60cm depths with solar charging. "} /></p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-900"><LocalizedText source={" AgriLoop AI Irrigation Scheduler & Telemetry "} /></h5>
                  <p className="text-xs text-gray-500"><LocalizedText source={" Auto-adjusts watering duration based on microclimate evapo-transpiration formulas. "} /></p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-900"><LocalizedText source={" Verified Buyer Pre-Harvest Exchange "} /></h5>
                  <p className="text-xs text-gray-500"><LocalizedText source={" Guaranteed contracts with 3 regional grain & fruit distributors upon verification. "} /></p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  alert('Custom Farm Plan PDF downloaded!');
                  onClose();
                }}
                className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold"
              >
                <Download className="w-4 h-4 mr-2" />
                <span><LocalizedText source={"Download PDF Summary"} /></span>
              </button>

              <button
                type="button"
                onClick={() => {
                  alert('Thank you! An AgriLoop agronomy specialist will reach out within 24 hours to coordinate onboarding.');
                  onClose();
                }}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#26483E] hover:bg-[#26483E] text-white text-sm font-semibold shadow-md"
              >
                <span><LocalizedText source={"Activate Free Trial Deployment"} /></span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
