'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, TranslationKey } from './translations';
import { Category } from '@/types/database';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  getCategoryText: (category: Category | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('mk');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('retro_lang') as Language;
      if (saved === 'mk' || saved === 'en') {
        setLanguageState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('retro_lang', lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    const next = language === 'mk' ? 'en' : 'mk';
    setLanguage(next);
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let text = translations[language]?.[key] || translations.mk[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  };

  const getCategoryText = (category: Category | string): string => {
    const key = `cat_${category}` as TranslationKey;
    return translations[language]?.[key] || translations.mk[key] || category;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        getCategoryText,
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
