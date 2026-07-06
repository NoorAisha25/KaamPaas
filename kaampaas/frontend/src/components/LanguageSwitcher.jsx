import { useLanguage } from "../context/LanguageContext";
import { LANGUAGES } from "../constants";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="lang-switcher">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          className={lang === l.code ? "active" : ""}
          onClick={() => setLang(l.code)}
          title={l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
