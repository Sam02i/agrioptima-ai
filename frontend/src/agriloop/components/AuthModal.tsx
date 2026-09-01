import { useState } from 'react';
import { X, Lock, Mail, User, Sprout, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (roleName: string) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleDemoLogin = (role: string) => {
    onSuccess(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#f0fdf4] text-[#166534] flex items-center justify-center mx-auto mb-3 border border-[#bbf7d0]">
            <Sprout className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-900">
            {mode === 'login' ? 'Grower & Buyer Portal' : 'Create Farm Account'}
          </h3>
          <p className="text-gray-500 text-xs mt-1">
            Access live field telemetry, forward contracts, and automated yield records.
          </p>
        </div>

        {/* Quick Demo Personas */}
        <div className="mb-6 p-3 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0]/60">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#166534] mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Instant Demo Access
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('Orchard Producer')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#bbf7d0] text-xs font-semibold text-[#166534] hover:bg-[#dcfce7] transition-colors text-left"
            >
              👩‍🌾 Farm Manager
            </button>
            <button
              onClick={() => handleDemoLogin('Verified Food Distributor')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#bbf7d0] text-xs font-semibold text-[#166534] hover:bg-[#dcfce7] transition-colors text-left"
            >
              🏢 Verified Buyer
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDemoLogin(email || 'Grower');
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="producer@agri-loop.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#166534] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#166534] text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#166534] hover:bg-[#1b4332] text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
            >
              <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          {mode === 'login' ? (
            <span>
              New to AgriLoop?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-[#166534] font-semibold hover:underline cursor-pointer"
              >
                Register your acreage
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-[#166534] font-semibold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
