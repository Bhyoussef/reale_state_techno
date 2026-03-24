import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

interface LanguageContextValue {
  language: Language;
  direction: Direction;
  isRTL: boolean;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

const LANGUAGE_STORAGE_KEY = 'technohouse-language';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getDirection(language: Language): Direction {
  return language === 'ar' ? 'rtl' : 'ltr';
}

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const persistedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (persistedLanguage === 'ar' || persistedLanguage === 'en') {
    return persistedLanguage;
  }

  return document.documentElement.lang === 'ar' ? 'ar' : 'en';
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((currentLanguage) => (currentLanguage === 'en' ? 'ar' : 'en'));
  }, []);

  useEffect(() => {
    const direction = getDirection(language);

    document.documentElement.lang = language;
    document.documentElement.dir = direction;

    document.body.classList.toggle('font-arabic', language === 'ar');
    document.body.classList.toggle('font-sans', language === 'en');

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      direction: getDirection(language),
      isRTL: language === 'ar',
      setLanguage,
      toggleLanguage,
    }),
    [language, setLanguage, toggleLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider.');
  }

  return context;
}
