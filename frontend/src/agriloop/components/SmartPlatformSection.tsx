import { useState } from 'react';
import {
  Calendar,
  Layers,
  FileCheck2,
  Sprout,
  MapPin,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Sparkles,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  CheckCircle2,
} from 'lucide-react';
import { BlurReveal } from './BlurReveal';

interface SmartPlatformSectionProps {
  onOpenDemo?: () => void;
  onOpenPlan?: () => void;
}

type TabKey = 'overview' | 'planning' | 'control' | 'monitor';

interface TabConfig {
  key: TabKey;
  title: string;
  subtitle: string;
  icon: typeof Calendar;
  iconBg: string;
  iconColor: string;
  temperature: string;
  tempLabel: string;
  humidity: string;
  precipitation: string;
  windSpeed: string;
  aiModelTitle: string;
  aiModelStatus: string;
  aiModelStatusColor: string;
  aiPromptText: string;
  location: string;
  barActiveIndex: number;
}

export function SmartPlatformSection({ onOpenDemo, onOpenPlan }: SmartPlatformSectionProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const tabs: TabConfig[] = [
    {
      key: 'overview',
      title: 'Overview',
      subtitle: 'Real-Time Insights',
      icon: Calendar,
      iconBg: 'bg-emerald-50 text-emerald-700',
      iconColor: 'text-emerald-700',
      temperature: '24°C',
      tempLabel: "Today's Avg Temperature",
      humidity: '68%',
      precipitation: '20%',
      windSpeed: '12 km/h',
      aiModelTitle: 'Area Prediction AI Model',
      aiModelStatus: 'Good for planting',
      aiModelStatusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      aiPromptText: 'Farma AI helps optimize crop fields',
      location: 'Dhaka, Bangladesh',
      barActiveIndex: 22,
    },
    {
      key: 'planning',
      title: 'Smart Planning',
      subtitle: 'Precision Planning',
      icon: Layers,
      iconBg: 'bg-amber-50 text-amber-700',
      iconColor: 'text-amber-700',
      temperature: '26°C',
      tempLabel: 'Soil Sowing Window (Optimal)',
      humidity: '62%',
      precipitation: '5%',
      windSpeed: '8 km/h',
      aiModelTitle: 'Seed Growth & Harvest Timing',
      aiModelStatus: 'Optimal Seeding',
      aiModelStatusColor: 'text-blue-600 bg-blue-50 border-blue-200',
      aiPromptText: 'Farma AI generated 14-day schedule',
      location: 'Central Valley, California',
      barActiveIndex: 26,
    },
    {
      key: 'control',
      title: 'Farm Control',
      subtitle: 'Total Management',
      icon: FileCheck2,
      iconBg: 'bg-blue-50 text-blue-700',
      iconColor: 'text-blue-700',
      temperature: '22°C',
      tempLabel: 'Automated Irrigation Active',
      humidity: '74%',
      precipitation: '0%',
      windSpeed: '10 km/h',
      aiModelTitle: 'Zone Valve & Nutrition Balance',
      aiModelStatus: 'Active Flow 140 GPM',
      aiModelStatusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      aiPromptText: 'Farma AI adjusted micro-irrigation',
      location: 'Yakima Valley, Washington',
      barActiveIndex: 20,
    },
    {
      key: 'monitor',
      title: 'Field Monitor',
      subtitle: 'Growth Tracker',
      icon: Sprout,
      iconBg: 'bg-lime-50 text-lime-800',
      iconColor: 'text-lime-800',
      temperature: '25°C',
      tempLabel: 'Vegetation Vigor Index (NDVI 0.88)',
      humidity: '65%',
      precipitation: '15%',
      windSpeed: '14 km/h',
      aiModelTitle: 'Canopy Density & Pest Alert',
      aiModelStatus: 'No Threats Detected',
      aiModelStatusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      aiPromptText: 'Farma AI completed drone scan pass',
      location: 'Tuscany Valley, Italy',
      barActiveIndex: 28,
    },
  ];

  const currentTab = tabs.find((t) => t.key === activeTab) || tabs[0];

  // Number of prediction bars for the frequency spectrum widget
  const totalBars = 32;

  return (
    <section id="smart-platform" className="py-20 lg:py-28 bg-white border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-12">
          <div className="lg:col-span-7">
            <BlurReveal delay={0.1} blur={8} yOffset={15}>
              <div
                id="smart-platform-badge"
                className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-600 mb-5 uppercase tracking-wider bg-gray-50/80"
              >
                <span className="w-2 h-2 rounded-full bg-[#16a34a] mr-2 animate-pulse" />
                How It Works
              </div>
            </BlurReveal>

            <BlurReveal delay={0.2} duration={0.85} blur={12} yOffset={20}>
              <h2
                id="smart-platform-heading"
                className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#052e16] tracking-tight leading-[1.12]"
              >
                Smart Farming Made <br />
                <span className="italic font-light text-gray-800">Simple and Efficient</span>
              </h2>
            </BlurReveal>
          </div>

          <div className="lg:col-span-5 lg:pb-2">
            <BlurReveal delay={0.3} duration={0.8} blur={10} yOffset={20}>
              <p
                id="smart-platform-desc"
                className="text-lg text-gray-600 font-light leading-relaxed max-w-xl"
              >
                A smart farming platform that connects soil, crops, and operations to help farmers grow more efficiently and safely.
              </p>
            </BlurReveal>
          </div>
        </div>

        {/* 4 Feature Tabs Bar */}
        <BlurReveal delay={0.35} duration={0.8} blur={10} yOffset={25}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  id={`tab-${tab.key}`}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border text-left transition-all duration-300 flex items-center gap-3.5 sm:gap-4 cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#166534] shadow-md shadow-emerald-900/5 ring-2 ring-[#166534]/20'
                      : 'bg-[#f9fafb] border-gray-200/80 hover:bg-white hover:border-gray-300 hover:shadow-xs'
                  }`}
                >
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                      isSelected ? 'scale-105 ' + tab.iconBg : 'bg-white border border-gray-200 ' + tab.iconColor
                    }`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3
                      className={`text-sm sm:text-base font-semibold leading-tight truncate ${
                        isSelected ? 'text-[#052e16] font-bold' : 'text-gray-900'
                      }`}
                    >
                      {tab.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-light truncate mt-0.5">
                      {tab.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </BlurReveal>

        {/* Main Visual Frame with Overlaid Floating UI Cards */}
        <BlurReveal delay={0.45} duration={0.9} blur={14} yOffset={30}>
          <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-slate-900 border border-gray-200 shadow-xl shadow-gray-200/50 aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] min-h-[480px]">
            {/* Background Image: Farmer in Field with Golden Hour Light */}
            <img
              src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=2000&q=85"
              alt="Farmer in agricultural field reviewing crop rows at golden hour"
              className="w-full h-full object-cover object-center filter contrast-[1.03] brightness-95 transition-all duration-700 hover:scale-102"
            />

            {/* Subtle vignette gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Bottom Left Location Pill */}
            <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 z-20">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium shadow-lg">
                <MapPin className="w-4 h-4 text-[#c4f042]" />
                <span>{currentTab.location}</span>
              </div>
            </div>

            {/* Bottom Right Floating Overlaid Widgets */}
            <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 z-20 w-[90%] sm:w-[360px] md:w-[400px] flex flex-col gap-3.5">
              {/* Widget 1: Weather & Microclimate Card */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/40 text-gray-900 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Weather Icon (Sun + Cloud/Rain illustration) */}
                    <div className="w-12 h-12 rounded-2xl bg-amber-50/80 border border-amber-100 flex items-center justify-center flex-shrink-0 relative">
                      <Sun className="w-6 h-6 text-amber-500 animate-spin-slow" />
                      <CloudRain className="w-4 h-4 text-blue-500 absolute -bottom-1 -right-1" />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 leading-none">
                        {currentTab.temperature}
                      </div>
                      <div className="text-[11px] sm:text-xs text-gray-500 font-medium mt-1">
                        {currentTab.tempLabel}
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                      Live Telemetry
                    </span>
                  </div>
                </div>

                {/* 3 Stats Row */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100 text-center">
                  <div className="px-1">
                    <p className="text-xs sm:text-sm font-bold text-gray-900">{currentTab.humidity}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Humidity</p>
                  </div>
                  <div className="px-1 border-x border-gray-100">
                    <p className="text-xs sm:text-sm font-bold text-gray-900">{currentTab.precipitation}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Precipitation</p>
                  </div>
                  <div className="px-1">
                    <p className="text-xs sm:text-sm font-bold text-gray-900">{currentTab.windSpeed}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Wind Speed</p>
                  </div>
                </div>
              </div>

              {/* Widget 2: Area Prediction AI Model Card */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/40 text-gray-900 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900">
                    {currentTab.aiModelTitle}
                  </h4>
                  <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border ${currentTab.aiModelStatusColor}`}>
                    {currentTab.aiModelStatus}
                  </span>
                </div>

                {/* Multi-bar Prediction Spectrum Chart */}
                <div className="flex items-end gap-[3px] h-7 sm:h-8 mb-3.5 px-0.5">
                  {Array.from({ length: totalBars }).map((_, i) => {
                    // Generate bar height pattern and smooth gradient colors (coral -> yellow -> green)
                    const heightPercent = 40 + Math.sin(i * 0.28) * 35 + ((i % 3) * 6);
                    let barColor = 'bg-rose-400';
                    if (i > 8 && i <= 18) barColor = 'bg-amber-400';
                    if (i > 18) barColor = 'bg-emerald-400';

                    const isDimmed = i > currentTab.barActiveIndex;

                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-500 ${barColor} ${
                          isDimmed ? 'opacity-30' : 'opacity-90 hover:opacity-100'
                        }`}
                        style={{ height: `${Math.max(20, Math.min(100, heightPercent))}%` }}
                      />
                    );
                  })}
                </div>

                {/* Action AI Pill */}
                <button
                  type="button"
                  onClick={onOpenDemo}
                  className="w-full flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-gray-50 hover:bg-[#f0fdf4] border border-gray-200 hover:border-[#bbf7d0] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-left">
                    <span className="w-5 h-5 rounded-md bg-[#166534] text-[#c4f042] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      AI
                    </span>
                    <span className="text-[11px] sm:text-xs font-medium text-gray-700 group-hover:text-[#166534] truncate">
                      {currentTab.aiPromptText}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#166534] transition-transform group-hover:translate-x-0.5 flex-shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </BlurReveal>
      </div>
    </section>
  );
}
