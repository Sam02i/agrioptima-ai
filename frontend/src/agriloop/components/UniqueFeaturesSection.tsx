import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCw,
  FileCheck2,
  CreditCard,
  Truck,
  TrendingUp,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  DollarSign,
  Layers,
  MapPin,
  Sparkles,
  Pause,
  Play,
  QrCode,
  Thermometer,
  Navigation,
  Eye,
  X,
} from 'lucide-react';
import producePassportImage from '../assets/images/produce_passport_tomatoes_1788244437438.jpg';
import { BlurReveal } from './BlurReveal';
import { useLanguage } from '../i18n/LanguageContext';


interface UniqueFeatureItem {
  id: string;
  title: string;
  shortTag: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  image: string;
  imageAlt: string;
  summary: string;
  badge: string;
  details: React.ReactNode;
}

export function UniqueFeaturesSection() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPassportModal, setShowPassportModal] = useState(false);

  const SLIDE_DURATION = 6000; // 6 seconds per card

  const features: UniqueFeatureItem[] = [
    {
      id: 'closed-loop',
      title: 'Closed-Loop Journey View',
      shortTag: 'End-to-End Ag Lifecycle',
      icon: RotateCw,
      iconBg: 'bg-[#c4f042] text-[#14532d]',
      iconColor: 'text-[#166534]',
      image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1600&q=85',
      imageAlt: 'Agronomists and farm managers planning crop lifecycle stages with tablet in lush field',
      summary: 'One unified timeline connecting every stage of the farming cycle from initial demand to next season prep.',
      badge: 'Continuous Cycle Protocol',
      details: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 font-light leading-relaxed">
            Eliminate fragmented handoffs with a continuous lifecycle timeline synchronizing farmers, buyers, quality inspectors, and financiers in real time:
          </p>
          
          {/* Visual Step Pipeline */}
          <div className="p-3.5 bg-gray-50/95 rounded-2xl border border-gray-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>8-Stage Lifecycle Stream</span>
              <span className="text-[#166534] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                100% Traceability
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
              {[
                { step: '01', name: 'Demand', desc: 'Buyer Intent' },
                { step: '02', name: 'Crop Decision', desc: 'Soil & Season' },
                { step: '03', name: 'Listing', desc: 'Harvest Batch' },
                { step: '04', name: 'Procurement', desc: 'Smart Contract' },
                { step: '05', name: 'Quality', desc: 'Digital Passport' },
                { step: '06', name: 'Credit', desc: 'Instant Liquidity' },
                { step: '07', name: 'Settlement', desc: 'Zero Dispute' },
                { step: '08', name: 'Next Season', desc: 'Nutrient Prep' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-2 rounded-xl border border-gray-100 shadow-2xs flex flex-col justify-between hover:border-emerald-200 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                    <span>{item.step}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="font-semibold text-gray-900 text-[11px] mt-1">{item.name}</div>
                  <div className="text-[9px] text-gray-500 font-light truncate">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'produce-passport',
      title: 'Digital Produce Passport',
      shortTag: 'Quality AI & Verification',
      icon: FileCheck2,
      iconBg: 'bg-[#c4f042] text-[#14532d]',
      iconColor: 'text-[#166534]',
      image: producePassportImage,
      imageAlt: 'Authenticated agricultural shipment passport tracking vine tomatoes with AI optical inspection',
      summary: 'Verified shipment passports tracking dispatch freshness, receiving condition, and instant AI grading confidence.',
      badge: 'AI Vision + Dual Verifier Audited',
      details: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 font-light leading-relaxed">
            Every shipment receives a tamper-evident digital identity card detailing exact origin freshness, transit degradation, verifier credentials, and AI confidence margins:
          </p>

          {/* Shipment Card Mockup (Modeled after SHP-2048) */}
          <div className="bg-gradient-to-br from-[#0c311e] to-[#062113] text-white rounded-2xl p-4 border border-emerald-900/60 shadow-md space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-500/40 flex-shrink-0">
                  <img
                    src={producePassportImage}
                    alt="Fresh vine tomatoes"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-emerald-400 font-semibold tracking-wider">
                    Shipment Passport
                  </div>
                  <div className="text-base font-serif font-bold text-white tracking-wide">
                    SHP-2048
                  </div>
                  <div className="text-[10px] text-emerald-200/80">
                    Nashik → Mumbai • Vine Tomatoes
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#c4f042] text-[#052e16]">
                  Very fresh • Level 1
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassportModal(true)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/25 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>Inspect Live</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                <div className="text-[10px] text-emerald-300">Shipment Status</div>
                <div className="font-semibold text-white mt-0.5 text-[12px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  In transit
                </div>
                <div className="text-[9px] text-gray-300">Igatpuri, MH</div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                <div className="text-[10px] text-emerald-300">Quality Grade</div>
                <div className="font-semibold text-white mt-0.5 text-[12px]">Grade A (94%)</div>
                <div className="text-[9px] text-emerald-300">Harvested Today</div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                <div className="text-[10px] text-emerald-300">Transit Temp</div>
                <div className="font-semibold text-white mt-0.5 text-[12px]">18.4°C Cold-Chain</div>
                <div className="text-[9px] text-emerald-300">Low Spoilage Risk</div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                <div className="text-[10px] text-emerald-300">Passport QR</div>
                <div className="font-mono text-white mt-0.5 text-[11px] font-semibold">AO-2048-09</div>
                <div className="text-[9px] text-gray-300">Dual Verified</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-emerald-200 bg-black/25 px-3 py-2 rounded-xl border border-white/10">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#c4f042]" />
                Dual-Gate Spectral Timestamp Verified
              </span>
              <button
                type="button"
                onClick={() => setShowPassportModal(true)}
                className="font-semibold text-[#c4f042] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Route &amp; Telemetry</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'procurement-credit',
      title: 'Procurement Credit Intelligence',
      shortTag: 'Fintech & Risk Scoring',
      icon: CreditCard,
      iconBg: 'bg-[#c4f042] text-[#14532d]',
      iconColor: 'text-[#166534]',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1600&q=85',
      imageAlt: 'Agricultural commodities finance, trader checking harvest contracts on digital device',
      summary: 'Data-driven procurement credit limits and real-time repayment health to fund harvest acquisitions smoothly.',
      badge: 'Institutional Lending Backed',
      details: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 font-light leading-relaxed">
            Empower trusted traders and buyer cooperatives with transparent credit ratings calculated directly from multi-season settlement histories:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Score Pill */}
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-3.5 rounded-2xl flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#166534] font-medium">
                <span>Credit Score</span>
                <span className="px-1.5 py-0.5 rounded bg-[#166534] text-[#c4f042] text-[10px] font-bold">Tier 1</span>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-serif font-bold text-[#052e16]">94<span className="text-sm font-normal text-gray-500">/100</span></div>
                <p className="text-[10px] text-gray-600 mt-1 leading-tight font-light">
                  Based on verified transaction history, GMV, low dispute rate &amp; zero overdue balance.
                </p>
              </div>
            </div>

            {/* Credit Allocation */}
            <div className="bg-white border border-gray-200 p-3.5 rounded-2xl flex flex-col justify-between shadow-2xs">
              <div className="text-xs font-semibold text-gray-700">Limit Utilization</div>
              <div className="mt-1.5 space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-500">Approved:</span>
                  <span className="text-gray-900 font-bold">$120,000</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Utilized:</span>
                  <span className="text-amber-700 font-semibold">$38,400 (32%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#166534] h-full rounded-full" style={{ width: '32%' }} />
                </div>
                <div className="flex justify-between text-[11px] pt-0.5">
                  <span className="text-gray-400">Available:</span>
                  <span className="text-emerald-700 font-bold">$81,600</span>
                </div>
              </div>
            </div>

            {/* Repayment Cycle */}
            <div className="bg-white border border-gray-200 p-3.5 rounded-2xl flex flex-col justify-between shadow-2xs">
              <div className="text-xs font-semibold text-gray-700">7-Day Repayment Rate</div>
              <div className="mt-2">
                <div className="text-3xl font-serif font-bold text-gray-900">98.2%</div>
                <p className="text-[10px] text-gray-500 mt-1 leading-tight font-light">
                  High velocity turnover within standard 7-day procurement cycle.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'smart-logistics',
      title: 'Smart Logistics & Load Aggregation',
      shortTag: 'Multi-Farmer Freight Optimization',
      icon: Truck,
      iconBg: 'bg-[#c4f042] text-[#14532d]',
      iconColor: 'text-[#166534]',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=85',
      imageAlt: 'Agricultural logistics transport truck driving across agricultural distribution highway corridor',
      summary: 'Combine nearby farmer shipments, calculate instant transit rates, and match exact vehicle capacity.',
      badge: '-42% Transit Cost per Kg',
      details: (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 font-light leading-relaxed">
            Eliminate empty miles and costly half-loads through algorithmic multi-point consolidation:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-gray-50/90 rounded-xl border border-gray-200/80">
              <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#166534]" />
                Route Optimization
              </div>
              <p className="text-[11px] text-gray-600 mt-1 font-light leading-relaxed">
                Chooses the cheapest and fastest multi-stop path from farmer or FPO clusters directly to buyer destination hubs.
              </p>
            </div>

            <div className="p-3 bg-gray-50/90 rounded-xl border border-gray-200/80">
              <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#166534]" />
                Multi-Farmer Load Aggregation
              </div>
              <p className="text-[11px] text-gray-600 mt-1 font-light leading-relaxed">
                Combines nearby smallholder shipments into a single coordinated refrigerated truck to drastically cut per-kg freight fees.
              </p>
            </div>

            <div className="p-3 bg-gray-50/90 rounded-xl border border-gray-200/80">
              <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#166534]" />
                Vehicle Capacity Matching
              </div>
              <p className="text-[11px] text-gray-600 mt-1 font-light leading-relaxed">
                Matches produce tonnage with suitable truck size (3T, 7T, 16T) instead of sending underutilized heavy vehicles.
              </p>
            </div>

            <div className="p-3 bg-gray-50/90 rounded-xl border border-gray-200/80">
              <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#166534]" />
                Transport Cost Estimation
              </div>
              <p className="text-[11px] text-gray-600 mt-1 font-light leading-relaxed">
                Calculates transparent logistics rates and margin impacts before the buyer confirms their purchase order.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'predictive-growth',
      title: 'Predictive Growth & Outcome Intelligence',
      shortTag: 'Yield & Market Foresight',
      icon: TrendingUp,
      iconBg: 'bg-[#c4f042] text-[#14532d]',
      iconColor: 'text-[#166534]',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1600&q=85',
      imageAlt: 'Modern agricultural field with overhead automated micro-irrigation and sensors at golden hour',
      summary: 'Pre-harvest forecasting of yields, revenue, price trends, and proactive oversupply warnings.',
      badge: 'ML Agronomic Models',
      details: (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 font-light leading-relaxed">
            Data-backed foresight transforming volatile agricultural outcomes into predictable, resilient business models:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 bg-gray-50/90 rounded-xl border border-gray-200/80">
              <div className="font-semibold text-gray-900">Yield Forecasting</div>
              <p className="text-[11px] text-gray-600 mt-0.5 font-light">
                Estimate expected production before harvest using crop type, acreage, soil health, weather, and historical yield.
              </p>
            </div>

            <div className="p-2.5 bg-gray-50/90 rounded-xl border border-gray-200/80">
              <div className="font-semibold text-gray-900">Revenue Forecasting</div>
              <p className="text-[11px] text-gray-600 mt-0.5 font-light">
                Predict expected gross revenue from projected yield × anticipated forward market price curves.
              </p>
            </div>

            <div className="p-2.5 bg-gray-50/90 rounded-xl border border-gray-200/80">
              <div className="font-semibold text-gray-900">Net Income Forecasting</div>
              <p className="text-[11px] text-gray-600 mt-0.5 font-light">
                Estimate farmer net earnings after transport, handling, cold storage, commission, and spoilage deductions.
              </p>
            </div>

            <div className="p-2.5 bg-gray-50/90 rounded-xl border border-gray-200/80">
              <div className="font-semibold text-gray-900">Demand &amp; Supply Growth</div>
              <p className="text-[11px] text-gray-600 mt-0.5 font-light">
                Identify crops with expanding buyer demand and project future registered supply from current farmer sowing data.
              </p>
            </div>

            <div className="p-2.5 bg-gray-50/90 rounded-xl border border-gray-200/80">
              <div className="font-semibold text-gray-900">Price Trend Prediction</div>
              <p className="text-[11px] text-gray-600 mt-0.5 font-light">
                Synthesize historical prices, demand/supply balance, seasonality, mandi arrivals, and weather to project price direction.
              </p>
            </div>

            <div className="p-2.5 bg-rose-50/90 rounded-xl border border-rose-200">
              <div className="font-semibold text-rose-900 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                Oversupply Forecast
              </div>
              <p className="text-[11px] text-rose-800 mt-0.5 font-light">
                Warn farmers weeks before harvest if regional production is likely to exceed observed buyer demand.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Robust, reliable continuous timer
  useEffect(() => {
    if (isPaused) return;

    const intervalMs = 60;
    const progressStep = (intervalMs / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveIndex((current) => (current + 1) % features.length);
          return 0;
        }
        return prev + progressStep;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, features.length]);

  const handleSelectFeature = (idx: number) => {
    setActiveIndex(idx);
    setProgress(0);
  };

  const activeFeature = features[activeIndex];
  const ActiveIcon = activeFeature.icon;

  return (
    <section
      id="core-solutions"
      className="py-20 lg:py-28 bg-[#fcfdfc] border-t border-gray-100 relative overflow-hidden"
    >
      {/* Background Gradient Blurs */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#c4f042]/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-12 sm:mb-16">
          <div className="lg:col-span-7">
            <BlurReveal delay={0.1} blur={8} yOffset={15}>
              <div
                id="unique-features-badge"
                className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-600 mb-5 uppercase tracking-wider bg-white shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-[#16a34a] mr-2 animate-pulse" />
                {t('unique_badge')}
              </div>
            </BlurReveal>

            <BlurReveal delay={0.2} duration={0.85} blur={12} yOffset={20}>
              <h2
                id="unique-features-heading"
                className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#052e16] tracking-tight leading-[1.12]"
              >
                {t('unique_title_line1')} <br />
                <span className="italic font-light text-[#052e16]">{t('unique_title_line2')}</span>
              </h2>
            </BlurReveal>
          </div>

          <div className="lg:col-span-5 lg:pb-2">
            <BlurReveal delay={0.3} duration={0.8} blur={10} yOffset={20}>
              <p
                id="unique-features-desc"
                className="text-base sm:text-lg text-gray-600 font-light leading-relaxed max-w-xl"
              >
                {t('unique_desc')}
              </p>
            </BlurReveal>
          </div>
        </div>

        {/* Two-Column Interactive Layout */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left Column: Interactive Feature Cards List with Live Timer Bar */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-3.5">
            {features.map((feature, idx) => {
              const isActive = activeIndex === idx;
              const IconComp = feature.icon;

              return (
                <BlurReveal
                  key={feature.id}
                  delay={0.08 * idx}
                  duration={0.65}
                  blur={8}
                  yOffset={12}
                >
                  <div
                    id={`unique-feature-card-${feature.id}`}
                    onClick={() => handleSelectFeature(idx)}
                    className={`rounded-2xl sm:rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                      isActive
                        ? 'bg-white border-gray-200/90 shadow-xl shadow-emerald-950/5 ring-1 ring-[#166534]/20'
                        : 'bg-gray-50/70 border-gray-200/70 hover:bg-white hover:border-gray-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Top Progress bar for active card */}
                    {isActive && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
                        <div
                          className="h-full bg-gradient-to-r from-[#166534] via-[#84cc16] to-[#c4f042] transition-all duration-75 ease-linear"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}

                    <div className="p-4 sm:p-5">
                      {/* Accordion Header Row */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                              isActive
                                ? 'bg-[#c4f042] text-[#052e16] scale-105 shadow-xs'
                                : 'bg-white border border-gray-200/90 text-gray-600'
                            }`}
                          >
                            <IconComp className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>

                          <div className="min-w-0">
                            <h3
                              className={`text-base sm:text-lg font-sans tracking-tight transition-colors ${
                                isActive
                                  ? 'font-bold text-[#052e16]'
                                  : 'font-semibold text-gray-800 hover:text-gray-900'
                              }`}
                            >
                              {feature.title}
                            </h3>
                            <p className="text-xs text-gray-500 font-light truncate mt-0.5 hidden sm:block">
                              {feature.shortTag}
                            </p>
                          </div>
                        </div>

                        {/* Toggle Icon */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                            isActive
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-400 group-hover:text-gray-600'
                          }`}
                        >
                          {isActive ? (
                            <Minus className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </div>
                      </div>

                      {/* Expandable Accordion Body */}
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.div
                            key="content"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 mt-3 border-t border-gray-100">
                              {feature.details}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </BlurReveal>
              );
            })}
          </div>

          {/* Right Column: Full-Height Imagery Showcase matching the Left Tile Height */}
          <div className="lg:col-span-6 flex flex-col h-full">
            <BlurReveal delay={0.25} duration={0.8} blur={12} yOffset={20} className="h-full flex flex-col">
              <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-slate-900 border border-gray-200/90 shadow-2xl shadow-emerald-950/10 min-h-[580px] lg:min-h-[660px] xl:min-h-[700px] h-full flex flex-col justify-between">
                {/* Background Image with Smooth Crossfade */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature.id}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    <img
                      src={activeFeature.image}
                      alt={activeFeature.imageAlt}
                      className="w-full h-full object-cover object-center filter contrast-[1.03] brightness-95"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Subtle vignette gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10 pointer-events-none" />

                {/* Top Bar Overlays */}
                <div className="relative z-20 p-5 sm:p-6 flex items-center justify-between">
                  {/* Top Badge */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs font-medium shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-[#c4f042] animate-pulse" />
                    <span>{activeFeature.badge}</span>
                  </div>

                  {/* Play/Pause & Index Pill */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPaused(!isPaused);
                      }}
                      className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
                      title={isPaused ? 'Resume auto-rotation' : 'Pause auto-rotation'}
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5" />}
                    </button>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs font-mono">
                      <span>0{activeIndex + 1}</span>
                      <span className="text-white/40">/</span>
                      <span className="text-white/60">0{features.length}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Glass Card Overlay */}
                <div className="relative z-20 p-5 sm:p-6">
                  <motion.div
                    key={`overlay-${activeFeature.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/40 shadow-xl text-gray-900"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#166534] text-[#c4f042] flex items-center justify-center flex-shrink-0 font-bold">
                          <ActiveIcon className="w-4 h-4" />
                        </div>
                        <h4 className="font-serif font-bold text-gray-900 text-base sm:text-lg">
                          {activeFeature.title}
                        </h4>
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Live System
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                      {activeFeature.summary}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        {features.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSelectFeature(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                              activeIndex === i
                                ? 'w-8 bg-[#166534]'
                                : 'w-2.5 bg-gray-200 hover:bg-gray-300'
                            }`}
                            aria-label={`Go to feature ${i + 1}`}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {activeFeature.id === 'produce-passport' && (
                          <button
                            type="button"
                            onClick={() => setShowPassportModal(true)}
                            className="px-3 py-1 rounded-full text-xs font-semibold bg-[#166534] hover:bg-[#14532d] text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#c4f042]" />
                            <span>View Live Passport (SHP-2048)</span>
                          </button>
                        )}
                        <span className="text-[11px] text-gray-400 font-mono">
                          {isPaused ? 'Paused' : 'Auto'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </BlurReveal>
          </div>
        </div>
      </div>

      {/* Interactive Produce Passport SHP-2048 Modal */}
      <AnimatePresence>
        {showPassportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#f8fafc] w-full max-w-5xl rounded-3xl border border-gray-200 shadow-2xl overflow-hidden my-auto"
            >
              {/* Header Bar */}
              <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowPassportModal(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>Back to overview</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#166534] text-[#c4f042] flex items-center justify-center font-bold text-xs">
                    🌱
                  </div>
                  <span className="font-serif font-bold text-gray-900 text-lg">Agrovia</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE TRACKING
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassportModal(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Top Green Banner Passport Card */}
                <div className="bg-[#1b4332] text-white rounded-3xl p-6 sm:p-7 border border-emerald-800/80 shadow-lg relative overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Left: Thumbnail and Title */}
                    <div className="lg:col-span-7 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-emerald-400/30 flex-shrink-0 shadow-md">
                        <img
                          src={producePassportImage}
                          alt="Fresh Vine Tomatoes"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c4f042] text-[#052e16] shadow-sm">
                          Very fresh • Level 1
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-xs uppercase font-mono tracking-widest text-emerald-300 font-semibold">
                          Shipment Passport
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                          SHP-2048
                        </h3>
                        <p className="text-xs text-emerald-100/80 font-light">
                          Authenticated farm-to-buyer record
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-900/80 border border-emerald-600/60 text-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-[#c4f042]" />
                            Grade A
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-900/80 border border-emerald-600/60 text-emerald-200">
                            <Sparkles className="w-3 h-3 text-[#c4f042]" />
                            94% AI confidence
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-900/80 border border-emerald-600/60 text-emerald-200">
                            <Clock className="w-3 h-3 text-[#c4f042]" />
                            Harvested today
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* QR Code & Scan Info */}
                    <div className="lg:col-span-2 flex flex-col items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15">
                      <QrCode className="w-12 h-12 text-[#c4f042]" />
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-200 mt-1">
                        Scan Passport
                      </div>
                      <div className="text-xs font-mono font-bold text-white">AO-2048-09</div>
                    </div>

                    {/* Right Metrics Grid */}
                    <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-3 text-xs">
                      <div className="border-l-2 border-emerald-500/50 pl-3">
                        <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-medium">
                          Shipment Status
                        </div>
                        <div className="font-semibold text-white mt-0.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          In transit
                        </div>
                      </div>
                      <div className="border-l-2 border-emerald-500/50 pl-3">
                        <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-medium">
                          Current Location
                        </div>
                        <div className="font-semibold text-white mt-0.5">Igatpuri, Maharashtra</div>
                      </div>
                      <div className="border-l-2 border-emerald-500/50 pl-3">
                        <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-medium">
                          Expected Arrival
                        </div>
                        <div className="font-semibold text-white mt-0.5">Today, 2:10 PM</div>
                      </div>
                      <div className="border-l-2 border-emerald-500/50 pl-3">
                        <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-medium">
                          Freshness Risk
                        </div>
                        <div className="font-semibold text-[#c4f042] mt-0.5">Low</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom 2-Column Split: GPS Route Map + Shipment Timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Live GPS Route Map */}
                  <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-semibold">
                            Live GPS Position
                          </div>
                          <h4 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 mt-0.5">
                            Nashik → Mumbai warehouse
                          </h4>
                        </div>
                        <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Updated 24 sec ago
                        </div>
                      </div>

                      {/* Map Graphic Canvas */}
                      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-[#eaf4eb] border border-emerald-200/80 p-4">
                        {/* Map Grid Pattern */}
                        <svg className="w-full h-full" viewBox="0 0 600 320">
                          <defs>
                            <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d5ebd7" strokeWidth="1" />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#map-grid)" />

                          {/* Highway Corridors */}
                          <path
                            d="M 80 50 Q 220 90 320 160 T 520 280"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="10"
                            strokeLinecap="round"
                          />
                          <path
                            d="M 80 50 Q 220 90 320 160 T 520 280"
                            fill="none"
                            stroke="#16a34a"
                            strokeWidth="4"
                            strokeDasharray="6 4"
                            strokeLinecap="round"
                          />

                          {/* Secondary Roads */}
                          <path d="M 120 220 Q 250 180 320 160" fill="none" stroke="#d1fae5" strokeWidth="3" />
                          <path d="M 320 160 Q 400 120 480 80" fill="none" stroke="#d1fae5" strokeWidth="3" />

                          {/* Point 1: Nashik Pickup */}
                          <circle cx="95" cy="55" r="10" fill="#052e16" />
                          <circle cx="95" cy="55" r="5" fill="#c4f042" />

                          {/* Point 2: Pimpalgaon Checkpoint */}
                          <circle cx="210" cy="95" r="6" fill="#166534" />

                          {/* Point 3: Current Location (Igatpuri) */}
                          <circle cx="320" cy="160" r="22" fill="#16a34a" fillOpacity="0.2" className="animate-ping" />
                          <circle cx="320" cy="160" r="12" fill="#166534" />
                          <circle cx="320" cy="160" r="6" fill="#c4f042" />

                          {/* Point 4: Thane Checkpoint */}
                          <circle cx="430" cy="225" r="6" fill="#166534" />

                          {/* Point 5: Mumbai Warehouse (Mehta Foods) */}
                          <circle cx="510" cy="275" r="10" fill="#052e16" />
                          <circle cx="510" cy="275" r="5" fill="#c4f042" />
                        </svg>

                        {/* Floating Labels over the Map */}
                        <div className="absolute top-4 left-4 bg-white/95 px-2.5 py-1 rounded-lg border border-gray-200 shadow-xs text-[11px] font-semibold text-gray-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-gray-900" />
                          Nashik (Pickup)
                        </div>

                        <div className="absolute top-[45%] left-[45%] bg-[#052e16] text-white px-3 py-1 rounded-full border border-emerald-400 shadow-md text-xs font-semibold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#c4f042] animate-pulse" />
                          Current: Igatpuri (82 km to Hub)
                        </div>

                        <div className="absolute bottom-4 right-4 bg-white/95 px-2.5 py-1 rounded-lg border border-gray-200 shadow-xs text-[11px] font-semibold text-gray-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          Mehta Foods (Mumbai Warehouse)
                        </div>

                        {/* Zoom Controls */}
                        <div className="absolute bottom-4 left-4 flex flex-col gap-1 bg-white rounded-lg border border-gray-200 shadow-xs p-1">
                          <button type="button" className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-700 hover:bg-gray-100 rounded">+</button>
                          <div className="h-px bg-gray-200" />
                          <button type="button" className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-700 hover:bg-gray-100 rounded">−</button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-[#166534]" />
                        Average transit speed: 52 km/h • Reefer setting: 18.0°C
                      </span>
                      <span className="font-semibold text-gray-900">ETA: 2:10 PM IST</span>
                    </div>
                  </div>

                  {/* Right Column: Live Events Timeline */}
                  <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-semibold mb-1">
                        Live Events
                      </div>
                      <h4 className="text-xl font-serif font-bold text-gray-900 mb-5">
                        Shipment timeline
                      </h4>

                      <div className="space-y-4">
                        {/* 1. Crossed Igatpuri */}
                        <div className="flex items-start gap-3.5">
                          <div className="w-8 h-8 rounded-full bg-[#c4f042] text-[#052e16] flex items-center justify-center flex-shrink-0 font-bold shadow-xs">
                            <Truck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900">Crossed Igatpuri checkpoint</div>
                            <div className="text-[11px] text-emerald-700 font-medium">12:04 PM • Live</div>
                          </div>
                        </div>

                        {/* 2. Temp Check */}
                        <div className="flex items-start gap-3.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900">Temperature check • 18.4°C</div>
                            <div className="text-[11px] text-gray-500">11:45 AM • Optical &amp; Thermal Sensor</div>
                          </div>
                        </div>

                        {/* 3. Departed Pimpalgaon */}
                        <div className="flex items-start gap-3.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900">Vehicle departed Pimpalgaon</div>
                            <div className="text-[11px] text-gray-500">10:30 AM • Dispatch Seal #8492</div>
                          </div>
                        </div>

                        {/* 4. Dispatch verification */}
                        <div className="flex items-start gap-3.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900">Dispatch verification completed</div>
                            <div className="text-[11px] text-gray-500">10:22 AM • Spectral AI Grade A</div>
                          </div>
                        </div>

                        {/* 5. Produce collected */}
                        <div className="flex items-start gap-3.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900">Produce collected</div>
                            <div className="text-[11px] text-gray-500">10:05 AM • Farm Gate Nashik</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Projected Arrival Card */}
                    <div className="mt-5 p-4 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0]">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#166534] text-[#c4f042] flex items-center justify-center flex-shrink-0">
                          <Thermometer className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-bold">
                            Projected Arrival Freshness
                          </div>
                          <div className="font-serif font-bold text-gray-900 text-sm mt-0.5">
                            Fresh • Level 2
                          </div>
                          <p className="text-[11px] text-gray-600 font-light mt-0.5">
                            Low risk. Expected quality change: −1 freshness level over standard 4h transit.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
