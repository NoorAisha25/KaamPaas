import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { LANGUAGES } from "../constants";
import Icon from "./Icon";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

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

      <nav className="navbar-links">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
          {t("nav_dashboard")}
        </NavLink>

        

        {user.role === "admin" && (
          <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
            {t("nav_admin")}
          </NavLink>
        )}

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

        <button
          onClick={handleLogout}
          title="Logout"
          style={{
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 8,
          }}
        >
          <Icon name="logout" size={18} />
        </button>
      </nav>
    </header>
  );
}
