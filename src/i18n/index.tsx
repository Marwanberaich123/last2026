import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../../locales/en.json';
import ar from '../../locales/ar.json';
import fr from '../../locales/fr.json';
import pt from '../../locales/pt.json';

export type Language = 'en' | 'ar' | 'fr' | 'pt';

const translations: Record<Language, any> = {
  en,
  ar,
  fr,
  pt,
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, fallback?: string) => string;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('givemepod_lang') as Language;
    return (saved && ['en', 'ar', 'fr', 'pt'].includes(saved)) ? saved : 'en';
  });

  const isRtl = language === 'ar';

  useEffect(() => {
    localStorage.setItem('givemepod_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [language, isRtl]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (path: string, fallback?: string): string => {
    const keys = path.split('.');
    let current = translations[language] || translations.en;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English
        let enFallback = translations.en;
        for (const fKey of keys) {
          if (enFallback && typeof enFallback === 'object' && fKey in enFallback) {
            enFallback = enFallback[fKey];
          } else {
            return fallback || path;
          }
        }
        return typeof enFallback === 'string' ? enFallback : (fallback || path);
      }
    }
    return typeof current === 'string' ? current : (fallback || path);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, isRtl }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
