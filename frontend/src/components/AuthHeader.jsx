import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { LANGUAGES } from "../constants";

export default function AuthHeader() {
  const { lang, setLang } = useLanguage();

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <img src="/logo.png" alt="KaamPaas" className="navbar-logo" />
        <div className="navbar-brand-text">
          <div className="navbar-title">
            <span className="lok">Kaam</span>
            <span className="ly">Paas</span>
          </div>
          <div className="navbar-tagline">Work Nearby. Hire Nearby.</div>
        </div>
      </Link>

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
    </header>
  );
}
