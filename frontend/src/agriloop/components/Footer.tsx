import { Mail, Phone, MapPin, Facebook, Linkedin, Instagram, Twitter, ArrowUpRight } from 'lucide-react';
import { BlurReveal } from './BlurReveal';
import { useLanguage } from '../i18n/LanguageContext';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenContact: () => void;
  onOpenServices: (serviceName: string) => void;
}

export function Footer({
  onOpenPrivacy,
  onOpenTerms,
  onOpenContact,
  onOpenServices,
}: FooterProps) {
  const { t } = useLanguage();

  return (
    <footer id="footer" className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden">
      {/* Scenic Agricultural Landscape Background */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2400&q=85"
          alt="Lush green field rows leading into misty mountains"
          className="w-full h-full object-cover object-bottom"
        />
        {/* Soft top gradient to ensure pristine contrast for text */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/85 to-white/40" />
        <div className="absolute inset-0 bg-radial from-transparent via-white/20 to-black/10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top CTA Statement */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <BlurReveal delay={0.1} duration={0.85} blur={14} yOffset={25}>
            <h2
              id="footer-cta-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#052e16] tracking-tight leading-[1.15] mb-4"
            >
              {t('footer_cta_title') || t('cta_title_line1') || 'Make farming smarter,'} <br />
              <span className="italic font-light text-[#052e16]">
                {t('footer_cta_subtitle') || t('cta_title_line2') || 'stronger, and simpler'}
              </span>
            </h2>
          </BlurReveal>

          <BlurReveal delay={0.25} duration={0.8} blur={10} yOffset={20}>
            <p
              id="footer-cta-subheading"
              className="text-base sm:text-lg text-gray-700 font-light max-w-xl mx-auto mb-8 leading-relaxed"
            >
              {t('footer_cta_desc') || t('cta_desc') || 'Straightforward answers to help you make confident decisions for your farm. Join the network today.'}
            </p>
          </BlurReveal>

          <BlurReveal delay={0.35} duration={0.7} blur={8} yOffset={15}>
            <button
              id="btn-footer-contact-us"
              onClick={onOpenContact}
              className="inline-flex items-center justify-center gap-2 px-9 py-3.5 rounded-full bg-[#1e5e3a] hover:bg-[#16482c] text-white font-medium text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-98"
            >
              <span>{t('footer_btn_contact') || t('cta_btn_contact') || 'Contact Us'}</span>
              <ArrowUpRight className="w-4 h-4 opacity-80" />
            </button>
          </BlurReveal>
        </div>

        {/* Outer Glassmorphic Floating Frame with Blur Reveal */}
        <BlurReveal delay={0.4} duration={0.9} blur={16} yOffset={35}>
          <div className="rounded-[2.5rem] sm:rounded-[3rem] bg-white/40 backdrop-blur-md p-2.5 sm:p-3.5 border border-white/70 shadow-2xl shadow-emerald-950/10">
            {/* Inner White Main Footer Card */}
            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-12 lg:p-14 border border-gray-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
                {/* Left Column: Brand, Tagline, Email, Socials */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                  <div>
                    {/* Brand Logo with Custom Green Icon */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#84cc16] to-[#4d7c0f] flex items-center justify-center p-2 shadow-xs">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-full h-full text-white stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round"
                        >
                          <path d="M4 7h16" />
                          <path d="M4 12h12" />
                          <path d="M4 17h14" />
                        </svg>
                      </div>
                      <span className="text-2xl font-bold text-gray-900 tracking-tight font-sans">
                        Agrovia
                      </span>
                    </div>

                    {/* Brand Tagline */}
                    <p className="text-gray-600 text-sm sm:text-[15px] font-light leading-relaxed mb-6 max-w-sm">
                      {t('footer_brand_desc') || t('footer_tagline') || 'Agrovia empowers farmers with smart tools for better yields and sustainable growth.'}
                    </p>

                    {/* Contact Pills */}
                    <div className="flex flex-wrap items-center gap-3 mb-8">
                      <a
                        id="footer-email-link"
                        href="mailto:hello@agrovia.com"
                        className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-gray-200/90 bg-gray-50/80 hover:bg-emerald-50 hover:border-emerald-200 text-xs sm:text-sm font-medium text-gray-700 hover:text-[#1e5e3a] transition-all group"
                      >
                        <Mail className="w-4 h-4 text-gray-500 group-hover:text-[#1e5e3a]" />
                        <span>hello@agrovia.com</span>
                      </a>

                      <button
                        onClick={onOpenContact}
                        className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full border border-gray-200/90 bg-gray-50/80 hover:bg-emerald-50 hover:border-emerald-200 text-xs sm:text-sm font-medium text-gray-700 hover:text-[#1e5e3a] transition-all cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5 text-gray-500" />
                        <span>+91 (800) AGROVIA</span>
                      </button>
                    </div>
                  </div>

                  {/* Social Media Section */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3">
                      {t('footer_social') || 'Social Media'}
                    </h4>
                    <div className="flex items-center gap-2.5">
                      <a
                        id="social-facebook"
                        href="https://facebook.com"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Facebook"
                        className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-center text-gray-600 hover:text-[#1e5e3a] hover:bg-white hover:border-[#1e5e3a]/30 transition-all duration-200"
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                      <a
                        id="social-linkedin"
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="LinkedIn"
                        className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-center text-gray-600 hover:text-[#1e5e3a] hover:bg-white hover:border-[#1e5e3a]/30 transition-all duration-200"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a
                        id="social-instagram"
                        href="https://instagram.com"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Instagram"
                        className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-center text-gray-600 hover:text-[#1e5e3a] hover:bg-white hover:border-[#1e5e3a]/30 transition-all duration-200"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                      <a
                        id="social-twitter"
                        href="https://twitter.com"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Twitter / X"
                        className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-center text-gray-600 hover:text-[#1e5e3a] hover:bg-white hover:border-[#1e5e3a]/30 transition-all duration-200"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right 3 Link Columns */}
                <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
                  {/* 1. Quick Links */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">
                      {t('footer_col_links') || t('footer_quick_links') || 'Quick Links'}
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-600 font-light">
                      <li>
                        <a className="hover:text-[#1e5e3a] transition-colors" href="#">
                          {t('nav_home') || 'Home'}
                        </a>
                      </li>
                      <li>
                        <a className="hover:text-[#1e5e3a] transition-colors" href="#solutions">
                          {t('nav_solutions') || 'Solutions'}
                        </a>
                      </li>
                      <li>
                        <a className="hover:text-[#1e5e3a] transition-colors" href="#smart-platform">
                          {t('nav_about') || 'About Us'}
                        </a>
                      </li>
                      <li>
                        <a className="hover:text-[#1e5e3a] transition-colors" href="#impact">
                          {t('nav_pricing') || 'Our Impact'}
                        </a>
                      </li>
                      <li>
                        <button
                          onClick={onOpenContact}
                          className="hover:text-[#1e5e3a] transition-colors text-left cursor-pointer"
                        >
                          {t('nav_contact') || 'Contact'}
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* 2. Company */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">
                      {t('footer_col_company') || 'Company'}
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-600 font-light">
                      <li>
                        <a className="hover:text-[#1e5e3a] transition-colors" href="#stories">
                          {t('nav_our_story') || 'Our Story'}
                        </a>
                      </li>
                      <li>
                        <button
                          onClick={onOpenContact}
                          className="hover:text-[#1e5e3a] transition-colors text-left cursor-pointer"
                        >
                          {t('footer_careers') || 'Careers'}
                        </button>
                      </li>
                      <li>
                        <a className="hover:text-[#1e5e3a] transition-colors" href="#smart-platform">
                          {t('footer_blog') || 'Blog & Resources'}
                        </a>
                      </li>
                      <li>
                        <button
                          onClick={onOpenContact}
                          className="hover:text-[#1e5e3a] transition-colors text-left cursor-pointer"
                        >
                          {t('footer_help') || 'Help Center'}
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={onOpenContact}
                          className="hover:text-[#1e5e3a] transition-colors text-left cursor-pointer"
                        >
                          {t('footer_partners') || 'Partner Program'}
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* 3. Services */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">
                      {t('footer_col_services') || t('footer_services') || 'Services'}
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-600 font-light">
                      <li>
                        <button
                          onClick={() => onOpenServices('Crop Monitoring')}
                          className="hover:text-[#1e5e3a] transition-colors text-left cursor-pointer"
                        >
                          {t('footer_crop_monitoring') || 'Crop Monitoring'}
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => onOpenServices('Smart Irrigation')}
                          className="hover:text-[#1e5e3a] transition-colors text-left cursor-pointer"
                        >
                          {t('footer_smart_irrigation') || 'Smart Irrigation'}
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => onOpenServices('Soil Analytics')}
                          className="hover:text-[#1e5e3a] transition-colors text-left cursor-pointer"
                        >
                          {t('footer_soil_analytics') || 'Soil Analytics'}
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => onOpenServices('Farm Automation')}
                          className="hover:text-[#1e5e3a] transition-colors text-left cursor-pointer"
                        >
                          {t('footer_farm_automation') || 'Farm Automation'}
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => onOpenServices('Tech Support')}
                          className="hover:text-[#1e5e3a] transition-colors text-left cursor-pointer"
                        >
                          {t('footer_tech_support') || 'Tech Support'}
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bottom Bar: Copyright & Legal Policies */}
              <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-gray-500 font-light">
                <p id="footer-copyright">
                  &copy; 2026 Agrovia. {t('footer_rights') || 'All rights reserved.'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-footer-terms"
                    onClick={onOpenTerms}
                    className="hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    {t('footer_terms') || 'Terms of Service'}
                  </button>
                  <span>&middot;</span>
                  <button
                    id="btn-footer-privacy"
                    onClick={onOpenPrivacy}
                    className="hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    {t('footer_privacy') || 'Privacy Policy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </BlurReveal>
      </div>
    </footer>
  );
}

