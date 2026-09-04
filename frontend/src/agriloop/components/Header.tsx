import { LocalizedText } from "../../i18n/LocalizedText";
import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  onOpenGetStarted: () => void;
  onOpenLogin: () => void;
}

export function Header({ onOpenGetStarted, onOpenLogin }: HeaderProps) {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide and scroll detection
  useEffect(() => {
    const clearTimer = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    const startHideTimer = () => {
      clearTimer();
      // Only auto-hide after 10 seconds if scrolled down past hero top and menu is closed
      if (window.scrollY > 80 && !mobileMenuOpen && !isHovered) {
        hideTimerRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 10000); // 10 seconds of idle on page
      }
    };

    const handleScroll = () => {
      const scrollPos = window.scrollY;
      setIsScrolled(scrollPos > 25);

      // Always show when scrolling occurs
      setIsVisible(true);
      startHideTimer();
    };

    // Re-reveal when cursor moves near the top of the viewport
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 70) {
        setIsVisible(true);
        startHideTimer();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    startHideTimer();

    return () => {
      clearTimer();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mobileMenuOpen, isHovered]);

  // Keep header visible while hovered or when mobile menu is open
  const shouldBeVisible = isVisible || isHovered || mobileMenuOpen || !isScrolled;

  return (
    <header
      id="main-header"
      onMouseEnter={() => {
        setIsHovered(true);
        setIsVisible(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        shouldBeVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-full opacity-0 pointer-events-none'
      } ${
        isScrolled
          ? 'py-2 sm:py-2.5 px-3 sm:px-6'
          : 'py-4 sm:py-5 px-4 sm:px-6 lg:px-8 bg-white/60 backdrop-blur-md border-b border-gray-100/60'
      }`}
    >
      <div
        className={`mx-auto transition-all duration-500 ease-out ${
          isScrolled
            ? 'max-w-6xl bg-white/75 backdrop-blur-xl border border-white/60 shadow-lg shadow-emerald-950/5 rounded-2xl sm:rounded-full px-4 sm:px-6 py-1.5 sm:py-2'
            : 'max-w-7xl'
        }`}
      >
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a
              href="#"
              id="header-logo"
              className={`font-serif font-bold text-[#26483E] tracking-tight hover:opacity-90 transition-all duration-300 flex items-center gap-1.5 ${
                isScrolled ? 'text-xl sm:text-2xl' : 'text-2xl lg:text-3xl'
              }`}
            >
              <span><LocalizedText source={"AgriOptimaᴬᴵ."} /></span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-5 lg:space-x-7 items-center" id="desktop-nav">
            <a
              id="nav-link-solutions"
              className={`font-medium text-gray-600 hover:text-[#26483E] transition-all duration-200 py-1 relative group ${
                isScrolled ? 'text-xs sm:text-sm' : 'text-sm'
              }`}
              href="#solutions"
            ><LocalizedText source={" {0} "} values={[t('nav_solutions')]} /><span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#26483E] transition-all duration-200 group-hover:w-full"></span>
            </a>
            <a
              id="nav-link-how-it-works"
              className={`font-medium text-gray-600 hover:text-[#26483E] transition-all duration-200 py-1 relative group ${
                isScrolled ? 'text-xs sm:text-sm' : 'text-sm'
              }`}
              href="#core-solutions"
            ><LocalizedText source={" {0} "} values={[t('nav_how_it_works')]} /><span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#26483E] transition-all duration-200 group-hover:w-full"></span>
            </a>
            <a
              id="nav-link-impact"
              className={`font-medium text-gray-600 hover:text-[#26483E] transition-all duration-200 py-1 relative group ${
                isScrolled ? 'text-xs sm:text-sm' : 'text-sm'
              }`}
              href="#impact"
            ><LocalizedText source={" {0} "} values={[t('nav_impact')]} /><span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#26483E] transition-all duration-200 group-hover:w-full"></span>
            </a>
            <a
              id="nav-link-stories"
              className={`font-medium text-gray-600 hover:text-[#26483E] transition-all duration-200 py-1 relative group ${
                isScrolled ? 'text-xs sm:text-sm' : 'text-sm'
              }`}
              href="#stories"
            ><LocalizedText source={" {0} "} values={[t('nav_stories')]} /><span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#26483E] transition-all duration-200 group-hover:w-full"></span>
            </a>
          </nav>

          {/* Topbar Right Controls: Single Easy-Click Language Selector + CTAs */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* Topbar Language Selector */}
            <LanguageSelector isScrolled={isScrolled} />

            <button
              id="btn-login-header"
              onClick={onOpenLogin}
              className={`font-medium text-[#26483E] hover:text-[#26483E] transition-all duration-200 cursor-pointer font-sans ${
                isScrolled ? 'text-xs sm:text-sm px-2 py-1.5' : 'text-sm px-2.5 py-2'
              }`}
            ><LocalizedText source={" {0} "} values={[t('nav_login')]} /></button>
            <button
              id="btn-get-started-header"
              onClick={onOpenGetStarted}
              className={`inline-flex items-center justify-center border border-transparent font-medium rounded-full text-white bg-[#26483E] hover:bg-[#26483E] transition-all duration-200 shadow-xs hover:shadow cursor-pointer active:scale-95 ${
                isScrolled ? 'text-xs sm:text-sm px-3.5 py-1.5' : 'text-sm px-4.5 py-2'
              }`}
            ><LocalizedText source={" {0} "} values={[t('nav_get_started')]} /></button>
          </div>

          {/* Mobile menu and Language toggle */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSelector isScrolled={true} align="right" />

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              className="text-gray-700 hover:text-[#26483E] focus:outline-none p-1.5 rounded-lg"
              type="button"
            >
              <span className="sr-only"><LocalizedText source={"Open main menu"} /></span>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden mt-2 bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <a
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-[#26483E] hover:bg-gray-50/80"
            href="#solutions"
            onClick={() => setMobileMenuOpen(false)}
          ><LocalizedText source={" {0} "} values={[t('nav_solutions')]} /></a>
          <a
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-[#26483E] hover:bg-gray-50/80"
            href="#core-solutions"
            onClick={() => setMobileMenuOpen(false)}
          ><LocalizedText source={" {0} "} values={[t('nav_how_it_works')]} /></a>
          <a
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-[#26483E] hover:bg-gray-50/80"
            href="#impact"
            onClick={() => setMobileMenuOpen(false)}
          ><LocalizedText source={" {0} "} values={[t('nav_impact')]} /></a>
          <a
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-[#26483E] hover:bg-gray-50/80"
            href="#stories"
            onClick={() => setMobileMenuOpen(false)}
          ><LocalizedText source={" {0} "} values={[t('nav_stories')]} /></a>
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="w-full text-center py-2 text-sm font-medium text-[#26483E] border border-gray-200 rounded-full hover:bg-gray-50"
            ><LocalizedText source={" {0} "} values={[t('nav_login')]} /></button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenGetStarted();
              }}
              className="w-full text-center py-2 text-sm font-medium text-white bg-[#26483E] rounded-full hover:bg-[#26483E]"
            ><LocalizedText source={" {0} "} values={[t('nav_get_started')]} /></button>
          </div>
        </div>
      )}
    </header>
  );
}
