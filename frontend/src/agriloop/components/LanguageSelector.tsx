import { LocalizedText } from "../../i18n/LocalizedText";
import { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageCode } from '../i18n/translations';

interface LanguageSelectorProps {
  isScrolled?: boolean;
  align?: 'left' | 'right';
  className?: string;
}

export function LanguageSelector({
  isScrolled = false,
  align = 'right',
  className = '',
}: LanguageSelectorProps) {
  const { language, setLanguage, currentLanguageInfo, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button: Single option in topbar to change language with easy click */}
      <button
        id="btn-language-selector"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Change Language / भाषा बदलें"
        className={`inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-200 cursor-pointer shadow-2xs border ${
          isOpen
            ? 'bg-[#26483E] text-[#EAE7DD] border-[#26483E] ring-2 ring-[#EAE7DD]/30'
            : isScrolled
            ? 'bg-gray-50/90 hover:bg-[#EAE7DD] text-gray-700 hover:text-[#26483E] border-gray-200 hover:border-[#EAE7DD]'
            : 'bg-white/80 hover:bg-[#EAE7DD] text-gray-800 hover:text-[#26483E] border-gray-200/90 hover:border-[#EAE7DD]'
        } ${isScrolled ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'}`}
      >
        <Globe
          className={`w-3.5 h-3.5 ${
            isOpen ? 'text-[#EAE7DD]' : 'text-[#26483E]'
          } transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
        />
        <span className="font-semibold tracking-tight"><LocalizedText source={"{0}"} values={[currentLanguageInfo.nativeName]} /></span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#EAE7DD]' : 'text-gray-400'
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          id="language-dropdown-menu"
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-64 origin-top-right rounded-2xl bg-white/95 backdrop-blur-xl border border-gray-200/90 shadow-xl shadow-emerald-950/10 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5`}
        >
          <div className="px-3 py-2 border-b border-gray-100 mb-1 flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#26483E]" /><LocalizedText source={" Select Language "} /></span>
            <span className="text-[10px] font-medium text-[#26483E] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"><LocalizedText source={" 6 Languages "} /></span>
          </div>

          <div className="space-y-1">
            {supportedLanguages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  id={`btn-lang-option-${lang.code}`}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                    isSelected
                      ? 'bg-[#EAE7DD] text-[#26483E] font-semibold border border-[#EAE7DD]'
                      : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#26483E] text-[#EAE7DD]'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-emerald-100 group-hover:text-emerald-800'
                      }`}
                    ><LocalizedText source={" {0} "} values={[lang.code.toUpperCase()]} /></div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold tracking-tight leading-tight flex items-center gap-1.5">
                        <span><LocalizedText source={"{0}"} values={[lang.nativeName]} /></span>
                        {lang.code === 'en' ? (
                          <span className="text-[10px] text-gray-400 font-normal"><LocalizedText source={"({0})"} values={[lang.name]} /></span>
                        ) : null}
                      </div>
                      <div className="text-[11px] text-gray-400 font-light truncate"><LocalizedText source={" {0} "} values={[lang.region]} /></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 pl-2">
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-[#26483E] text-white flex items-center justify-center shadow-2xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"><LocalizedText source={" {0} "} values={[lang.greeting]} /></span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-1 pt-2 border-t border-gray-100 px-3 py-1.5 bg-[#EAE7DD] rounded-xl flex items-center justify-between text-[10px] text-gray-500">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#26483E]" /><LocalizedText source={" Instant Translation "} /></span>
            <span className="font-mono text-gray-400"><LocalizedText source={"AgriOptimaᴬᴵ i18n"} /></span>
          </div>
        </div>
      )}
    </div>
  );
}
