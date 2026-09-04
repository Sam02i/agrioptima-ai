import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode, LanguageInfo, SUPPORTED_LANGUAGES, translations } from './translations';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  currentLanguageInfo: LanguageInfo;
  supportedLanguages: LanguageInfo[];
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLanguage }: { children: React.ReactNode; initialLanguage?: LanguageCode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if(initialLanguage)return initialLanguage;
    // Read from localStorage if available
    try {
      const savedLang = localStorage.getItem('agrovia_preferred_language');
      if (savedLang && (savedLang === 'en' || savedLang === 'hi' || savedLang === 'pa' || savedLang === 'hr' || savedLang === 'mr' || savedLang === 'or')) {
        return savedLang as LanguageCode;
      }
    } catch {
      // Ignore localStorage errors
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('agrovia_preferred_language', lang);
    } catch {
      // Ignore
    }
  };

  const currentLanguageInfo =
    SUPPORTED_LANGUAGES.find((item) => item.code === language) || SUPPORTED_LANGUAGES[0];

  const t = (key: string): string => {
    const currentDict = translations[language] || translations.en;
    const value = (currentDict as any)[key];
    if (value !== undefined) {
      return value;
    }
    // Fallback to English
    return (translations.en as any)[key] || (key as string);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguageInfo,
        supportedLanguages: SUPPORTED_LANGUAGES,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
