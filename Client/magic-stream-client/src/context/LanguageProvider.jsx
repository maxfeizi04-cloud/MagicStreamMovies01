import { createContext, startTransition, useEffect, useState } from "react";
import { translations, translateGenreName, translateRankingName } from "../i18n/translations";

const LANGUAGE_STORAGE_KEY = "magic-stream-language";

const LanguageContext = createContext({});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return storedLanguage === "en" ? "en" : "zh";
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const changeLanguage = (nextLanguage) => {
    startTransition(() => {
      setLanguage(nextLanguage === "en" ? "en" : "zh");
    });
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: changeLanguage,
        t: translations[language],
        translateGenre: (genreName) => translateGenreName(genreName, language),
        translateRanking: (rankingName) => translateRankingName(rankingName, language),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
