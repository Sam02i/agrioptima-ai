import { ArrowUpRight, Leaf, ShieldCheck, Sprout, Store } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenContact: () => void;
  onOpenServices: (serviceName: string) => void;
}

export function Footer({ onOpenPrivacy, onOpenTerms, onOpenContact, onOpenServices }: FooterProps) {
  const { t } = useLanguage();
  return (
    <footer id="footer" data-i18n-native className="bg-[#f4f3e9] border-t border-[#dde1d5] px-4 sm:px-6 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto">
        <section className="rounded-[2rem] bg-[#173f2b] text-white p-8 sm:p-12 lg:p-14 grid lg:grid-cols-[1.25fr_.75fr] gap-10 items-center overflow-hidden relative">
          <div className="relative z-10">
            <span className="text-[#c4f042] text-xs font-semibold uppercase tracking-[.18em]">{t('intro_badge_title')}</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold leading-tight mt-4">{t('footer_cta_title')}<br/><em className="font-light text-[#dce8d8]">{t('footer_cta_subtitle')}</em></h2>
            <p className="text-[#c7d4ca] max-w-2xl mt-5 leading-relaxed">{t('footer_cta_desc')}</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <button onClick={() => onOpenServices('Farmer workspace')} className="rounded-full bg-[#c4f042] text-[#123824] px-6 py-3 font-semibold inline-flex items-center gap-2 cursor-pointer">{t('intro_btn_explore')} <ArrowUpRight className="w-4 h-4"/></button>
              <button onClick={onOpenContact} className="rounded-full border border-white/30 px-6 py-3 font-medium cursor-pointer hover:bg-white/10">{t('footer_btn_contact')}</button>
            </div>
          </div>
          <div className="relative z-10 grid grid-cols-2 gap-3">
            {[
              [Sprout,t('features_card2_title'),t('features_card2_desc')],
              [Store,t('features_card4_title'),t('features_card4_desc')],
              [ShieldCheck,t('features_card5_title'),t('features_card5_desc')],
              [Leaf,t('features_card3_title'),t('features_card3_desc')],
            ].map(([Icon,title,copy])=><article key={String(title)} className="rounded-2xl bg-white/8 border border-white/12 p-4"><Icon className="w-5 h-5 text-[#c4f042]"/><h3 className="font-semibold mt-3">{String(title)}</h3><p className="text-xs leading-relaxed text-[#b9c9bd] mt-1">{String(copy)}</p></article>)}
          </div>
        </section>

        <div className="grid md:grid-cols-[1.4fr_1fr_1fr] gap-10 py-12">
          <div>
            <div className="font-serif font-bold text-3xl text-[#173f2b]">AgriOptimaᴬᴵ.</div>
            <p className="text-gray-600 mt-4 max-w-md leading-relaxed">{t('footer_brand_desc')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#173f2b] mb-4">{t('footer_col_services')}</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <button onClick={() => onOpenServices('Crop recommendations')} className="block hover:text-[#173f2b] cursor-pointer">{t('footer_crop_monitoring')}</button>
              <button onClick={() => onOpenServices('Soil health')} className="block hover:text-[#173f2b] cursor-pointer">{t('footer_soil_analytics')}</button>
              <button onClick={() => onOpenServices('Freshness verification')} className="block hover:text-[#173f2b] cursor-pointer">{t('features_card5_title')}</button>
              <button onClick={() => onOpenServices('Marketplace')} className="block hover:text-[#173f2b] cursor-pointer">{t('features_card4_cat')}</button>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-[#173f2b] mb-4">{t('footer_quick_links')}</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <button onClick={() => onOpenServices('Supplier intelligence')} className="block hover:text-[#173f2b] cursor-pointer">{t('features_card3_cat')}</button>
              <button onClick={() => onOpenServices('Credit assessment')} className="block hover:text-[#173f2b] cursor-pointer">{t('features_card3_title')}</button>
              <button onClick={() => onOpenServices('Produce passports')} className="block hover:text-[#173f2b] cursor-pointer">{t('features_card5_cat')}</button>
              <button onClick={() => onOpenServices('Order tracking')} className="block hover:text-[#173f2b] cursor-pointer">{t('footer_tech_support')}</button>
            </div>
          </div>
        </div>

        <div className="border-t border-[#d8ddd1] pt-6 flex flex-col sm:flex-row gap-4 justify-between text-sm text-gray-500">
          <p>© 2026 AgriOptimaᴬᴵ. {t('footer_rights')}</p>
          <div className="flex gap-5"><button onClick={onOpenTerms} className="hover:text-gray-800 cursor-pointer">{t('footer_terms')}</button><button onClick={onOpenPrivacy} className="hover:text-gray-800 cursor-pointer">{t('footer_privacy')}</button></div>
        </div>
      </div>
    </footer>
  );
}
