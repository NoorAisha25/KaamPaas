import { createContext, useContext, useState } from "react";
import { TRANSLATIONS } from "../i18n/translations";

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  // Remembers the user's choice across page reloads (until they clear browser data)
  const [lang, setLang] = useState(() => localStorage.getItem("KaamPaas_lang") || "en");

  const changeLang = (code) => {
    setLang(code);
    localStorage.setItem("KaamPaas_lang", code);
  };

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
