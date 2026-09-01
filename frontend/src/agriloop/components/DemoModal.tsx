import { useState, useEffect } from 'react';
import { X, Activity, Droplets, Sun, Wind, Thermometer, CheckCircle2, Play, Pause, RefreshCw, Layers, ShieldCheck, Zap } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [irrigationActive, setIrrigationActive] = useState(false);
  const [moisture, setMoisture] = useState(64);
  const [soilTemp, setSoilTemp] = useState(68);
  const [selectedField, setSelectedField] = useState('Field Alpha (North 80 Ac)');
  const [flowRate, setFlowRate] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (irrigationActive) {
      interval = setInterval(() => {
        setMoisture((prev) => Math.min(85, prev + 1));
        setFlowRate(142);
      }, 1000);
    } else {
      interval = setInterval(() => {
        setMoisture((prev) => Math.max(55, prev - 0.2));
        setFlowRate(0);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [irrigationActive]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] text-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-700 relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c4f042]/20 border border-[#c4f042]/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#c4f042]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-xl text-white">
                  AgriLoop Precision Hub
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#166534] text-[#86efac] text-[10px] font-mono uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                  Live Field Stream
                </span>
              </div>
              <p className="text-xs text-slate-400 font-light">
                Autonomous agronomy control &amp; IoT sensor network simulator
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Field Selector & Status bar */}
        <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
            <label className="text-[11px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
              Active Zone Selector
            </label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#c4f042]"
            >
              <option>Field Alpha (North 80 Ac) - Honeycrisp Apples</option>
              <option>Field Bravo (South 120 Ac) - Cabernet Sauvignon</option>
              <option>Greenhouse Unit 3 - Heirloom Tomatoes</option>
            </select>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Automated Irrigation</p>
              <p className="text-lg font-bold text-white mt-0.5">
                {irrigationActive ? (
                  <span className="text-[#4ade80] flex items-center gap-1">
                    <Droplets className="w-4 h-4 animate-bounce" /> Valve Open ({flowRate} GPM)
                  </span>
                ) : (
                  <span className="text-slate-400">Idle / AI Standby</span>
                )}
              </p>
            </div>
            <button
              onClick={() => setIrrigationActive(!irrigationActive)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                irrigationActive
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-[#c4f042] hover:bg-[#b0d83b] text-[#1b4332]'
              }`}
            >
              {irrigationActive ? 'Stop Valve' : 'Trigger Water'}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Pre-Harvest Buyer Lock</p>
              <p className="text-lg font-bold text-[#c4f042] mt-0.5">$3.10 / lb</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          </div>
        </div>

        {/* Live Telemetry Sensors Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Soil Moisture (30cm)</span>
              <Droplets className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {Math.round(moisture)}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${moisture}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">Target Range: 60-75%</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Root Temp</span>
              <Thermometer className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">68.4°F</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full w-[65%]" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">Status: Optimal</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Solar Radiation</span>
              <Sun className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">840 W/m²</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-yellow-400 h-full rounded-full w-[80%]" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">UV Index: 7 (High)</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">NDVI Vigor Score</span>
              <Zap className="w-4 h-4 text-[#c4f042]" />
            </div>
            <div className="text-2xl font-bold text-[#c4f042] mb-1">0.86</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#c4f042] h-full rounded-full w-[86%]" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">Dense Canopy Health</p>
          </div>
        </div>

        {/* Real-time Recommendations Stream */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#c4f042]" />
            Real-Time AI Agronomy Insights
          </h4>
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                <span className="text-slate-200">
                  Transpiration rate adjusted for 85°F forecast afternoon peak. Micro-misting schedule queued for 2:30 PM.
                </span>
              </div>
              <span className="text-slate-500 font-mono">Just now</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span className="text-slate-200">
                  Buyer Pacific Organic Co-Op confirmed acceptance of 40-ton yield batch @ $3.10/lb.
                </span>
              </div>
              <span className="text-slate-500 font-mono">14m ago</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>This interactive simulator represents live hardware field data deployed across 10,000+ farms.</p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-white text-slate-900 font-semibold hover:bg-slate-200 transition-colors"
          >
            Close Interactive Demo
          </button>
        </div>
      </div>
    </div>
  );
}
